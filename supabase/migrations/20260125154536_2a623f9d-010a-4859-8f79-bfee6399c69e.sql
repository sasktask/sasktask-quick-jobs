-- Add auto-release tracking columns to payments table
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS auto_release_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS task_giver_confirmed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS task_doer_confirmed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_release_triggered BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS release_type TEXT CHECK (release_type IN ('manual', 'auto_72hr', 'mutual_confirmation', 'dispute_resolution'));

-- Create index for auto-release scheduling
CREATE INDEX IF NOT EXISTS idx_payments_auto_release ON public.payments (auto_release_at) 
WHERE escrow_status = 'held' AND auto_release_at IS NOT NULL;

-- Create function to schedule auto-release when task is marked complete
CREATE OR REPLACE FUNCTION public.schedule_auto_release()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When booking is marked as completed, schedule auto-release for 72 hours later
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.payments
    SET 
      auto_release_at = now() + INTERVAL '72 hours',
      task_doer_confirmed = true,
      updated_at = now()
    WHERE booking_id = NEW.id
    AND escrow_status = 'held'
    AND auto_release_at IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-schedule release
DROP TRIGGER IF EXISTS trigger_schedule_auto_release ON public.bookings;
CREATE TRIGGER trigger_schedule_auto_release
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.schedule_auto_release();

-- Create function to handle mutual confirmation release
CREATE OR REPLACE FUNCTION public.check_mutual_confirmation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If both parties confirmed, release immediately
  IF NEW.task_giver_confirmed = true AND NEW.task_doer_confirmed = true 
     AND NEW.escrow_status = 'held' AND OLD.escrow_status = 'held' THEN
    NEW.escrow_status := 'released';
    NEW.released_at := now();
    NEW.release_type := 'mutual_confirmation';
    NEW.auto_release_at := NULL; -- Clear scheduled auto-release
    
    -- Update task status to completed
    UPDATE public.tasks
    SET status = 'completed'
    WHERE id = NEW.task_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for mutual confirmation
DROP TRIGGER IF EXISTS trigger_mutual_confirmation ON public.payments;
CREATE TRIGGER trigger_mutual_confirmation
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.check_mutual_confirmation();

-- Create function to process pending auto-releases (to be called by cron)
CREATE OR REPLACE FUNCTION public.process_pending_auto_releases()
RETURNS TABLE(payment_id UUID, booking_id UUID, released BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pending RECORD;
BEGIN
  FOR pending IN 
    SELECT p.id, p.booking_id, p.task_id, p.payee_id, p.payout_amount
    FROM public.payments p
    LEFT JOIN public.disputes d ON d.booking_id = p.booking_id AND d.status IN ('open', 'investigating')
    WHERE p.escrow_status = 'held'
    AND p.auto_release_at IS NOT NULL
    AND p.auto_release_at <= now()
    AND p.auto_release_triggered = false
    AND d.id IS NULL -- No active disputes
  LOOP
    -- Mark as auto-released
    UPDATE public.payments
    SET 
      escrow_status = 'released',
      released_at = now(),
      release_type = 'auto_72hr',
      auto_release_triggered = true,
      updated_at = now()
    WHERE id = pending.id;
    
    -- Update task to completed
    UPDATE public.tasks
    SET status = 'completed'
    WHERE id = pending.task_id;
    
    -- Create notification for task doer
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      pending.payee_id,
      'Payment Auto-Released! 💰',
      'Your payment of $' || pending.payout_amount || ' has been automatically released.',
      'payment',
      '/payments'
    );
    
    payment_id := pending.id;
    booking_id := pending.booking_id;
    released := true;
    RETURN NEXT;
  END LOOP;
END;
$$;

-- Create view for pending auto-releases
CREATE OR REPLACE VIEW public.pending_auto_releases AS
SELECT 
  p.id AS payment_id,
  p.booking_id,
  p.task_id,
  p.amount,
  p.payout_amount,
  p.payee_id,
  p.payer_id,
  p.auto_release_at,
  p.task_giver_confirmed,
  p.task_doer_confirmed,
  EXTRACT(EPOCH FROM (p.auto_release_at - now()))/3600 AS hours_until_release,
  b.status AS booking_status,
  t.title AS task_title
FROM public.payments p
JOIN public.bookings b ON b.id = p.booking_id
JOIN public.tasks t ON t.id = p.task_id
LEFT JOIN public.disputes d ON d.booking_id = p.booking_id AND d.status IN ('open', 'investigating')
WHERE p.escrow_status = 'held'
AND p.auto_release_at IS NOT NULL
AND d.id IS NULL;