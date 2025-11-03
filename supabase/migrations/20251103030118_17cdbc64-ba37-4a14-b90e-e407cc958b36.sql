-- Add admin verification fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verified_by_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON public.profiles(verified_by_admin);

-- Add RLS policy for admins to update verification status
CREATE POLICY "Admins can update user verification"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR id = auth.uid());