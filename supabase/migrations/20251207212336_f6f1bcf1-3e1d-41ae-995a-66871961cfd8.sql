-- Fix Security Definer View - use SECURITY INVOKER instead
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true) AS
SELECT 
  id,
  full_name,
  avatar_url,
  bio,
  rating,
  total_reviews,
  created_at,
  updated_at
FROM public.profiles;

-- Remove sensitive card details from payment_methods table
-- Keep only stripe_payment_method_id which is the safe token reference
ALTER TABLE public.payment_methods 
DROP COLUMN IF EXISTS card_last4,
DROP COLUMN IF EXISTS card_brand,
DROP COLUMN IF EXISTS card_exp_month,
DROP COLUMN IF EXISTS card_exp_year;