-- Add payment_verified column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS payment_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_verified_at timestamp with time zone;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_payment_verified ON public.profiles(payment_verified);