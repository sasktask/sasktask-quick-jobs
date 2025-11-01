-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
);

-- Storage policies for profile photos
CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload own profile photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own profile photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own profile photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add trust and verification scoring to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trust_score integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS completed_tasks integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS response_rate numeric DEFAULT 100,
ADD COLUMN IF NOT EXISTS on_time_rate numeric DEFAULT 100,
ADD COLUMN IF NOT EXISTS profile_completion integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS verification_level text DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS last_active timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS joined_date timestamp with time zone DEFAULT now();

-- Create function to calculate trust score
CREATE OR REPLACE FUNCTION calculate_trust_score(user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  score integer := 50;
  profile_record RECORD;
  verification_record RECORD;
BEGIN
  SELECT * INTO profile_record FROM profiles WHERE id = user_id;
  SELECT * INTO verification_record FROM verifications WHERE user_id = user_id;
  
  IF profile_record.rating IS NOT NULL THEN
    score := score + (profile_record.rating * 10)::integer;
  END IF;
  
  IF profile_record.total_reviews > 0 THEN
    score := score + LEAST(profile_record.total_reviews * 2, 20);
  END IF;
  
  IF profile_record.completed_tasks > 0 THEN
    score := score + LEAST(profile_record.completed_tasks, 15);
  END IF;
  
  IF verification_record.id_verified THEN
    score := score + 10;
  END IF;
  
  IF verification_record.background_check_status = 'verified' THEN
    score := score + 15;
  END IF;
  
  IF verification_record.has_insurance THEN
    score := score + 10;
  END IF;
  
  IF profile_record.profile_completion >= 80 THEN
    score := score + 10;
  END IF;
  
  IF profile_record.response_rate >= 90 THEN
    score := score + 5;
  END IF;
  
  IF profile_record.on_time_rate >= 90 THEN
    score := score + 5;
  END IF;
  
  score := GREATEST(0, LEAST(100, score));
  RETURN score;
END;
$$;

-- Create trigger to update trust score
CREATE OR REPLACE FUNCTION update_trust_score_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.trust_score := calculate_trust_score(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_update_trust_score
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_trust_score_trigger();