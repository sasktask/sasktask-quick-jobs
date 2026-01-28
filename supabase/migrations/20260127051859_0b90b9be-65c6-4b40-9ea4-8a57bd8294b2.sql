-- Add photo verification fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS photo_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS photo_verified_at timestamptz;

-- Add photo verification fields to verifications table
ALTER TABLE public.verifications 
ADD COLUMN IF NOT EXISTS photo_verification_status text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS photo_url text,
ADD COLUMN IF NOT EXISTS photo_rejection_reason text,
ADD COLUMN IF NOT EXISTS photo_verified_at timestamptz,
ADD COLUMN IF NOT EXISTS photo_verified_by uuid;

-- Add constraint for photo verification status
ALTER TABLE public.verifications 
DROP CONSTRAINT IF EXISTS verifications_photo_status_check;

ALTER TABLE public.verifications
ADD CONSTRAINT verifications_photo_status_check 
CHECK (photo_verification_status IN ('none', 'pending', 'verified', 'rejected'));

-- Create index for faster photo verification queries
CREATE INDEX IF NOT EXISTS idx_verifications_photo_status 
ON public.verifications(photo_verification_status) 
WHERE photo_verification_status = 'pending';