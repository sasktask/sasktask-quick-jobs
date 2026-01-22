-- Add admin role to the current platform owner
INSERT INTO public.user_roles (user_id, role)
VALUES ('867d9055-9c4e-476a-8183-f0c1872f180d', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Update RLS policies with correct owner ID fallback
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR auth.uid() = '867d9055-9c4e-476a-8183-f0c1872f180d'
  )
);

DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR auth.uid() = '867d9055-9c4e-476a-8183-f0c1872f180d'
  )
);