-- Fix profiles table RLS policies - restrict sensitive data access

-- First, drop existing overly permissive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own sensitive data" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view basic profile info" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create strict policies for profiles table:

-- 1. Users can only view their own complete profile (including sensitive data)
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- 2. Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Fix verifications table RLS policies - this contains extremely sensitive identity data

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own verification" ON public.verifications;
DROP POLICY IF EXISTS "Users can create own verification" ON public.verifications;
DROP POLICY IF EXISTS "Users can update own verification" ON public.verifications;
DROP POLICY IF EXISTS "Admins can view all verifications" ON public.verifications;
DROP POLICY IF EXISTS "Admins can update verifications" ON public.verifications;

-- Create strict policies for verifications table:

-- 1. Users can only view their own verification data
CREATE POLICY "Users can view own verification"
ON public.verifications
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Task doers can create their own verification
CREATE POLICY "Users can create own verification"
ON public.verifications
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND has_role(auth.uid(), 'task_doer'::app_role)
);

-- 3. Users can update their own verification (for uploading docs, updating info)
CREATE POLICY "Users can update own verification"
ON public.verifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Admin verification updates go through edge functions with service role key
-- This prevents direct admin access to sensitive identity documents
-- Admins should use dedicated edge functions for verification reviews