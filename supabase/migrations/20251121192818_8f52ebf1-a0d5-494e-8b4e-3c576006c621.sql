-- Create fraud detection tables
CREATE TABLE IF NOT EXISTS public.fraud_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  description TEXT NOT NULL,
  metadata JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.call_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  caller_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  call_type TEXT NOT NULL CHECK (call_type IN ('audio', 'video')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ringing', 'active', 'ended', 'missed', 'rejected')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  ice_servers JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fraud_alerts
CREATE POLICY "Admins can view all fraud alerts"
  ON public.fraud_alerts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  ));

CREATE POLICY "Users can view their own fraud alerts"
  ON public.fraud_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert fraud alerts"
  ON public.fraud_alerts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update fraud alerts"
  ON public.fraud_alerts FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  ));

-- RLS Policies for user_activity_logs
CREATE POLICY "Admins can view all activity logs"
  ON public.user_activity_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  ));

CREATE POLICY "System can insert activity logs"
  ON public.user_activity_logs FOR INSERT
  WITH CHECK (true);

-- RLS Policies for call_sessions
CREATE POLICY "Users can view their call sessions"
  ON public.call_sessions FOR SELECT
  USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert their call sessions"
  ON public.call_sessions FOR INSERT
  WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Users can update their call sessions"
  ON public.call_sessions FOR UPDATE
  USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- Indexes
CREATE INDEX idx_fraud_alerts_user_id ON public.fraud_alerts(user_id);
CREATE INDEX idx_fraud_alerts_status ON public.fraud_alerts(status);
CREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created_at ON public.user_activity_logs(created_at);
CREATE INDEX idx_call_sessions_booking_id ON public.call_sessions(booking_id);
CREATE INDEX idx_call_sessions_caller_id ON public.call_sessions(caller_id);
CREATE INDEX idx_call_sessions_receiver_id ON public.call_sessions(receiver_id);

-- Enable realtime for call_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_sessions;

-- Function to detect fraud patterns
CREATE OR REPLACE FUNCTION check_fraud_patterns()
RETURNS TRIGGER AS $$
DECLARE
  recent_cancellations INTEGER;
  rapid_bookings INTEGER;
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for fraud detection on cancellations
CREATE TRIGGER fraud_check_on_cancellation
  AFTER INSERT ON public.cancellations
  FOR EACH ROW
  EXECUTE FUNCTION check_fraud_patterns();