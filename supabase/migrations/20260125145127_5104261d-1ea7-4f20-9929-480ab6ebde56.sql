-- =====================================================
-- FIX: Remove Hardcoded Admin Backdoor UUID from RLS Policies
-- This migration removes the hardcoded UUID (867d9055-9c4e-476a-8183-f0c1872f180d)
-- from all RLS policies and ensures proper role-based access control
-- =====================================================

-- First, ensure the OWNER_USER_ID has the admin role in user_roles table
-- This way they get admin access through proper role-based control
INSERT INTO public.user_roles (user_id, role)
VALUES ('867d9055-9c4e-476a-8183-f0c1872f180d', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- =====================================================
-- Fix profiles table RLS policies
-- =====================================================

-- Drop the problematic policies with hardcoded UUID
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Recreate admin policies WITHOUT hardcoded UUID - using only has_role function
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL AND
  public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  auth.uid() IS NOT NULL AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- =====================================================
-- Fix user_roles table RLS policies
-- =====================================================

-- Drop the problematic policies with hardcoded UUID
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;

-- Recreate admin policies WITHOUT hardcoded UUID
CREATE POLICY "Admins can view all user roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can insert user roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update user roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL AND
  public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  auth.uid() IS NOT NULL AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete user roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (
  auth.uid() IS NOT NULL AND
  public.has_role(auth.uid(), 'admin'::app_role)
);