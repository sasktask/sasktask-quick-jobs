-- Add session security table for tracking active sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  device_info JSONB,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own sessions
CREATE POLICY "Users can view own sessions"
  ON public.user_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only delete their own sessions (logout)
CREATE POLICY "Users can delete own sessions"
  ON public.user_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- System can insert sessions
CREATE POLICY "System can insert sessions"
  ON public.user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add login history table
CREATE TABLE IF NOT EXISTS public.login_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  login_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  login_method TEXT DEFAULT 'password',
  success BOOLEAN NOT NULL DEFAULT true,
  failure_reason TEXT,
  location_info JSONB
);

-- Enable RLS on login_history
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

-- Users can only view their own login history
CREATE POLICY "Users can view own login history"
  ON public.login_history FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert login history
CREATE POLICY "System can insert login history"
  ON public.login_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add security settings to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS security_questions_set BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS security_notifications_enabled BOOLEAN DEFAULT true;

-- Create function to cleanup expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_sessions 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
  
  DELETE FROM public.user_sessions 
  WHERE expires_at < now() - INTERVAL '30 days';
END;
$$;

-- Create function to check suspicious login
CREATE OR REPLACE FUNCTION public.check_suspicious_login(p_user_id UUID, p_ip_address TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_ips TEXT[];
  is_suspicious BOOLEAN := false;
BEGIN
  -- Get recent unique IPs for this user
  SELECT ARRAY_AGG(DISTINCT ip_address) INTO recent_ips
  FROM public.login_history
  WHERE user_id = p_user_id
    AND success = true
    AND login_at > now() - INTERVAL '30 days';
  
  -- If no history, not suspicious (first login)
  IF recent_ips IS NULL THEN
    RETURN false;
  END IF;
  
  -- If this IP is not in recent IPs, flag as potentially suspicious
  IF NOT (p_ip_address = ANY(recent_ips)) THEN
    is_suspicious := true;
  END IF;
  
  RETURN is_suspicious;
END;
$$;

-- Add index for faster session queries
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_active ON public.user_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON public.login_history(user_id, login_at DESC);

-- Enable realtime for login_history (for security notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE public.login_history;