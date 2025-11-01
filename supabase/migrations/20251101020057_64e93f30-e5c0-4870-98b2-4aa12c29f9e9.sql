-- Fix the security definer view issue by recreating it without SECURITY DEFINER
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker=true)
AS
SELECT 
  id, 
  full_name, 
  avatar_url, 
  bio, 
  rating, 
  total_reviews,
  created_at,
  updated_at
FROM profiles;

-- Grant access to authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;