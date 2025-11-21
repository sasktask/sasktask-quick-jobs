-- Add social media and website fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS linkedin TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS facebook TEXT;

COMMENT ON COLUMN public.profiles.website IS 'User website URL';
COMMENT ON COLUMN public.profiles.linkedin IS 'LinkedIn profile URL';
COMMENT ON COLUMN public.profiles.twitter IS 'Twitter/X profile URL';
COMMENT ON COLUMN public.profiles.facebook IS 'Facebook profile URL';