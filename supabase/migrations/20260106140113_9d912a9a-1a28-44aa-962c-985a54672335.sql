-- Add phone verification fields to verifications table
ALTER TABLE public.verifications 
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_phone TEXT;