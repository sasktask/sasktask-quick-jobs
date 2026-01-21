-- Table to store account deletion verification codes
CREATE TABLE IF NOT EXISTS public.account_deletion_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.account_deletion_verifications ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table (for security)
-- No user policies - this should only be accessed by Edge Functions with service role

-- Index for faster lookups
CREATE INDEX idx_account_deletion_user ON public.account_deletion_verifications(user_id);
CREATE INDEX idx_account_deletion_expires ON public.account_deletion_verifications(expires_at);

-- Clean up old verification records (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_deletion_verifications()
RETURNS void AS $$
BEGIN
  DELETE FROM public.account_deletion_verifications
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON TABLE public.account_deletion_verifications IS 'Stores OTP verification codes for account deletion requests. Codes expire after 15 minutes.';
