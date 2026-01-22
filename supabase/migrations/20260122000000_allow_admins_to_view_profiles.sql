-- Allow admins to view all profiles and user roles for dashboards
-- Fixes: Admin dashboards showing no users due to restrictive RLS

-- Profiles: add explicit admin select policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR auth.uid() = '792e2b9a-57ef-4acd-9a6b-228ff081d5fa' -- platform owner fallback
  )
);

-- User roles: allow admins to fetch roles for dashboards and audits
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR auth.uid() = '792e2b9a-57ef-4acd-9a6b-228ff081d5fa'
  )
);
