-- ============================================================================
-- IMMEDIATE SECURITY FIX: Strengthen RLS policies on profiles table
-- ============================================================================
-- This migration fixes RLS policies to ensure users can ONLY access their own profiles.
-- It adds null checks to prevent potential auth.uid() bugs from causing security issues.
-- This can be run immediately without breaking existing code.
-- ============================================================================

-- Drop ALL existing policies on profiles to start clean
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own sensitive data" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view basic profile info" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update user verification" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create strict SELECT policy: Users can ONLY view their own profile
-- Using auth.uid() IS NOT NULL check to prevent potential null issues
-- This ensures that even if auth.uid() has bugs, we explicitly check it's not null
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
);

-- Create strict UPDATE policy: Users can ONLY update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
);

-- Create strict INSERT policy: Users can ONLY insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
);

