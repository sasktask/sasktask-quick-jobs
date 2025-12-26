-- Create signup_verifications table for email verification during signup
CREATE TABLE public.signup_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT
);

-- Add index for faster lookups
CREATE INDEX idx_signup_verifications_email ON public.signup_verifications(email);
CREATE INDEX idx_signup_verifications_expires ON public.signup_verifications(expires_at);

-- No RLS needed as this table is only accessed by edge functions using service role key
-- But we enable RLS and add no policies to prevent any client-side access
ALTER TABLE public.signup_verifications ENABLE ROW LEVEL SECURITY;

-- Create a cleanup function to remove old verifications
CREATE OR REPLACE FUNCTION public.cleanup_expired_signup_verifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.signup_verifications WHERE expires_at < now() - INTERVAL '1 day';
END;
$$;