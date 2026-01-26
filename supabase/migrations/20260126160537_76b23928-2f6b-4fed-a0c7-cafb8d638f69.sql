-- Add tasker response fields to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS tasker_decision TEXT DEFAULT 'pending' CHECK (tasker_decision IN ('pending', 'accepted', 'declined')),
ADD COLUMN IF NOT EXISTS decline_reason TEXT,
ADD COLUMN IF NOT EXISTS hire_amount NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS decided_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_tasker_decision ON public.bookings(tasker_decision);
CREATE INDEX IF NOT EXISTS idx_bookings_task_doer_decision ON public.bookings(task_doer_id, tasker_decision);

-- Function to notify task giver when tasker responds
CREATE OR REPLACE FUNCTION public.notify_tasker_decision()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  task_record RECORD;
  tasker_name TEXT;
BEGIN
  -- Only trigger when decision changes from pending
  IF OLD.tasker_decision = 'pending' AND NEW.tasker_decision != 'pending' THEN
    -- Get task details
    SELECT t.*, p.full_name INTO task_record
    FROM tasks t
    JOIN profiles p ON p.id = NEW.task_doer_id
    WHERE t.id = NEW.task_id;
    
    tasker_name := task_record.full_name;
    
    IF NEW.tasker_decision = 'accepted' THEN
      -- Notify task giver of acceptance
      INSERT INTO notifications (user_id, title, message, type, link)
      VALUES (
        task_record.task_giver_id,
        '🎉 Hire Request Accepted!',
        tasker_name || ' has accepted your hire request for "' || task_record.title || '". Payment of $' || NEW.hire_amount || ' is secured.',
        'booking',
        '/bookings'
      );
      
      -- Update booking status to confirmed
      NEW.status := 'confirmed';
      NEW.agreed_at := now();
      
    ELSIF NEW.tasker_decision = 'declined' THEN
      -- Notify task giver of decline
      INSERT INTO notifications (user_id, title, message, type, link)
      VALUES (
        task_record.task_giver_id,
        '❌ Hire Request Declined',
        tasker_name || ' has declined your hire request for "' || task_record.title || '". Reason: ' || COALESCE(NEW.decline_reason, 'No reason provided') || '. Your payment has been refunded.',
        'booking',
        '/bookings'
      );
      
      -- Update booking status to cancelled
      NEW.status := 'cancelled';
    END IF;
    
    NEW.decided_at := now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for tasker decision notifications
DROP TRIGGER IF EXISTS on_tasker_decision ON public.bookings;
CREATE TRIGGER on_tasker_decision
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_tasker_decision();

-- Enable realtime for bookings updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;