-- Fix security issue: Set search path for fraud detection function
CREATE OR REPLACE FUNCTION check_fraud_patterns()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recent_cancellations INTEGER;
BEGIN
  -- Check for excessive cancellations
  SELECT COUNT(*) INTO recent_cancellations
  FROM public.cancellations
  WHERE cancelled_by = NEW.user_id
  AND created_at > NOW() - INTERVAL '7 days';

  IF recent_cancellations > 3 THEN
    INSERT INTO public.fraud_alerts (user_id, alert_type, severity, description, metadata)
    VALUES (
      NEW.user_id,
      'excessive_cancellations',
      'high',
      'User has cancelled more than 3 bookings in the last 7 days',
      jsonb_build_object('cancellation_count', recent_cancellations)
    );
  END IF;

  RETURN NEW;
END;
$$;