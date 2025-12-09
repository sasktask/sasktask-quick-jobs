-- Drop and recreate the calculate_trust_score function with renamed parameter
DROP FUNCTION IF EXISTS public.calculate_trust_score(uuid);

CREATE OR REPLACE FUNCTION public.calculate_trust_score(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  score integer := 50;
  profile_record RECORD;
  verification_record RECORD;
BEGIN
  SELECT * INTO profile_record FROM profiles WHERE id = p_user_id;
  SELECT * INTO verification_record FROM verifications WHERE verifications.user_id = p_user_id;
  
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

-- Drop and recreate the trigger function
DROP FUNCTION IF EXISTS public.update_trust_score_trigger() CASCADE;

CREATE OR REPLACE FUNCTION public.update_trust_score_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.trust_score := calculate_trust_score(NEW.id);
  RETURN NEW;
END;
$$;

-- Recreate the trigger on profiles table
CREATE TRIGGER update_profile_trust_score
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_trust_score_trigger();