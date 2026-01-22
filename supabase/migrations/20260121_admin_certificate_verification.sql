-- Add admin policy for certificate verification
-- This allows admins to update any certificate's status for verification purposes

-- First, check if the policy exists and drop it if needed
DO $$
BEGIN
  -- Drop existing policy if it exists
  DROP POLICY IF EXISTS "Admins can update certificates" ON public.certificates;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create policy for admin certificate updates
CREATE POLICY "Admins can update certificates"
ON public.certificates
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND (role = 'admin' OR id = 'ee0a6ac9-7e30-4fb6-9ad8-fa676b59a31f')
  )
);

-- Also allow admins to select all certificates for the admin panel
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins can view all certificates" ON public.certificates;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

CREATE POLICY "Admins can view all certificates"
ON public.certificates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND (role = 'admin' OR id = 'ee0a6ac9-7e30-4fb6-9ad8-fa676b59a31f')
  )
);

-- Add foreign key constraint to link certificates to profiles (if not exists)
DO $$
BEGIN
  ALTER TABLE public.certificates
  ADD CONSTRAINT certificates_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- Add index for faster lookups by status
CREATE INDEX IF NOT EXISTS idx_certificates_status ON public.certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);
