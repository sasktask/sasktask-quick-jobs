-- Add RLS policy for profile-photos bucket uploads with correct path format
-- The file path should use user_id as a folder prefix

CREATE POLICY "Users can upload profile photos to their folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-photos');