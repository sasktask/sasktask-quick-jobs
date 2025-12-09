-- Add policy for public profile viewing (both task givers and task doers can view)
CREATE POLICY "Anyone can view public profile data"
ON public.profiles
FOR SELECT
USING (true);

-- Create a reputation score function that combines trust_score, rating, badges, and reviews
CREATE OR REPLACE FUNCTION public.calculate_reputation_score(p_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  score numeric := 0;
  profile_record RECORD;
  badge_count integer;
BEGIN
  -- Get profile data
  SELECT trust_score, rating, total_reviews, completed_tasks, response_rate, on_time_rate
  INTO profile_record
  FROM profiles WHERE id = p_user_id;
  
  IF profile_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Count badges
  SELECT COUNT(*) INTO badge_count FROM badges WHERE user_id = p_user_id;
  
  -- Calculate weighted reputation score (max 100)
  -- Trust score contributes 30%
  score := score + (COALESCE(profile_record.trust_score, 0) * 0.3);
  
  -- Rating contributes 25% (rating is 0-5, so multiply by 5 to get 0-25)
  score := score + (COALESCE(profile_record.rating, 0) * 5);
  
  -- Review count contributes 15% (cap at 50 reviews for max points)
  score := score + (LEAST(COALESCE(profile_record.total_reviews, 0), 50) * 0.3);
  
  -- Badges contribute 10% (cap at 10 badges for max points)
  score := score + (LEAST(badge_count, 10) * 1);
  
  -- Completed tasks contribute 10% (cap at 100 tasks for max points)
  score := score + (LEAST(COALESCE(profile_record.completed_tasks, 0), 100) * 0.1);
  
  -- Response rate contributes 5%
  score := score + (COALESCE(profile_record.response_rate, 0) * 0.05);
  
  -- On-time rate contributes 5%
  score := score + (COALESCE(profile_record.on_time_rate, 0) * 0.05);
  
  RETURN GREATEST(0, LEAST(100, score));
END;
$$;

-- Add reputation_score column to profiles for caching
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reputation_score numeric DEFAULT 0;

-- Create trigger to update reputation_score
CREATE OR REPLACE FUNCTION public.update_reputation_score_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.reputation_score := calculate_reputation_score(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profile_reputation_score ON public.profiles;
CREATE TRIGGER update_profile_reputation_score
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_reputation_score_trigger();

-- Update existing profiles with reputation scores
UPDATE public.profiles SET reputation_score = calculate_reputation_score(id);