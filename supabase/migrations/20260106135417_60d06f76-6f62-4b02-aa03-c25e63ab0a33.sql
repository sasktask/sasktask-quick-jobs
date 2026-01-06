-- Create phone_verifications table for storing phone OTP codes
CREATE TABLE public.phone_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  verified_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own phone verifications
CREATE POLICY "Users can view own phone verifications"
ON public.phone_verifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own phone verifications
CREATE POLICY "Users can insert own phone verifications"
ON public.phone_verifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_phone_verifications_phone ON public.phone_verifications(phone);
CREATE INDEX idx_phone_verifications_user_id ON public.phone_verifications(user_id);
CREATE INDEX idx_phone_verifications_created_at ON public.phone_verifications(created_at DESC);