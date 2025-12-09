-- Ensure profiles table has explicit authenticated-only access
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create policy that EXPLICITLY requires authentication
CREATE POLICY "Authenticated users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Ensure update policy is also authenticated-only
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Authenticated users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Secure verifications table with explicit authenticated role
DROP POLICY IF EXISTS "Users can view own verification" ON public.verifications;
DROP POLICY IF EXISTS "Users can create own verification" ON public.verifications;
DROP POLICY IF EXISTS "Users can update own verification" ON public.verifications;

CREATE POLICY "Authenticated users can view own verification"
ON public.verifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated task doers can create verification"
ON public.verifications
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND has_role(auth.uid(), 'task_doer'::app_role)
);

CREATE POLICY "Authenticated users can update own verification"
ON public.verifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Secure the verification-documents storage bucket
-- Ensure only document owners can access their files
DROP POLICY IF EXISTS "Users can upload verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own verification documents" ON storage.objects;

-- Only authenticated users can upload to their own folder
CREATE POLICY "Users can upload verification documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Only authenticated users can view their own documents
CREATE POLICY "Users can view own verification documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Only authenticated users can delete their own documents  
CREATE POLICY "Users can delete own verification documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);