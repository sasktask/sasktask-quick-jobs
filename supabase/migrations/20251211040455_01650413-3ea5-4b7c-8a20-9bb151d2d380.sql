
-- Drop the restrictive RLS policy that requires task_doer role
DROP POLICY IF EXISTS "Authenticated task doers can create verification" ON public.verifications;

-- Create new policy allowing any authenticated user to create verification
CREATE POLICY "Authenticated users can create verification"
ON public.verifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add policy for admins to view all verifications
CREATE POLICY "Admins can view all verifications"
ON public.verifications
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add policy for admins to update verifications
CREATE POLICY "Admins can update verifications"
ON public.verifications
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
