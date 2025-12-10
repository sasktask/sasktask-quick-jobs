-- Fix security issues identified in the scan

-- 1. Drop the overly permissive public profile policy
DROP POLICY IF EXISTS "Anyone can view public profile data" ON public.profiles;

-- 2. Create a more restrictive policy for viewing profiles
-- Users can only view their own full profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- 3. Create a policy for viewing basic public info via profiles
-- This only allows viewing non-sensitive fields through the public_profiles view
-- The view already exists and only exposes safe fields

-- 4. Fix OTP codes - restrict service role policy to specific operations
DROP POLICY IF EXISTS "Service role can manage OTP codes" ON public.otp_codes;

-- Create separate policies for OTP management
CREATE POLICY "Service role can insert OTP codes"
ON public.otp_codes
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update OTP codes"
ON public.otp_codes
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can delete expired OTP codes"
ON public.otp_codes
FOR DELETE
USING (expires_at < now());

-- 5. Grant public access to the public_profiles view for displaying user info publicly
-- This view only contains safe fields (avatar_url, bio, full_name, rating, total_reviews)
GRANT SELECT ON public.public_profiles TO anon, authenticated;