-- Drop existing view first
DROP VIEW IF EXISTS public.public_profiles;

-- Create secure view for admins to see limited profile info (no sensitive data)
CREATE VIEW public.public_profiles AS
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