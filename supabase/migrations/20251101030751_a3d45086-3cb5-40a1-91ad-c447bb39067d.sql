-- Drop the overly permissive policy that exposes sensitive data
DROP POLICY IF EXISTS "Users can view basic profile info" ON public.profiles;

-- Drop public_profiles if it exists as a view
DROP VIEW IF EXISTS public.public_profiles;

-- Create public_profiles as a VIEW with only non-sensitive columns
CREATE VIEW public.public_profiles 
WITH (security_barrier = true, security_invoker = true) AS
SELECT 
  id,
  full_name,
  bio,
  avatar_url,
  rating,
  total_reviews,
  created_at,
  updated_at
FROM public.profiles;

-- Now only users can see their own full profile data (including phone and email)
-- The existing "Users can view own sensitive data" policy handles this
-- Public data should be accessed through public_profiles view which excludes phone/email