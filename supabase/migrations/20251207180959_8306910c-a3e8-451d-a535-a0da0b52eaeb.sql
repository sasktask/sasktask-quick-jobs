-- Create function to award leaderboard badges automatically
CREATE OR REPLACE FUNCTION public.award_leaderboard_badges(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_profile RECORD;
  user_rank INTEGER;
  tasks_rank INTEGER;
  rating_rank INTEGER;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile FROM profiles WHERE id = p_user_id;
  
  IF user_profile IS NULL THEN
    RETURN;
  END IF;
  
  -- Calculate rank by completed tasks
  SELECT COUNT(*) + 1 INTO tasks_rank
  FROM profiles
  WHERE completed_tasks > COALESCE(user_profile.completed_tasks, 0);
  
  -- Calculate rank by rating (minimum 5 reviews)
  IF COALESCE(user_profile.total_reviews, 0) >= 5 THEN
    SELECT COUNT(*) + 1 INTO rating_rank
    FROM profiles
    WHERE total_reviews >= 5 AND rating > COALESCE(user_profile.rating, 0);
  ELSE
    rating_rank := NULL;
  END IF;
  
  -- Award Champion badge (rank #1 by tasks)
  IF tasks_rank = 1 AND COALESCE(user_profile.completed_tasks, 0) > 0 THEN
    INSERT INTO badges (user_id, badge_type, badge_level)
    VALUES (p_user_id, 'leaderboard_champion', 'gold')
    ON CONFLICT (user_id, badge_type) DO UPDATE SET badge_level = 'gold', earned_at = now();
  END IF;
  
  -- Award Elite badge (top 3 by tasks)
  IF tasks_rank <= 3 AND COALESCE(user_profile.completed_tasks, 0) > 0 THEN
    INSERT INTO badges (user_id, badge_type, badge_level)
    VALUES (p_user_id, 'leaderboard_elite', 'gold')
    ON CONFLICT (user_id, badge_type) DO UPDATE SET earned_at = now();
  END IF;
  
  -- Award Top 10 badge
  IF tasks_rank <= 10 AND COALESCE(user_profile.completed_tasks, 0) > 0 THEN
    INSERT INTO badges (user_id, badge_type, badge_level)
    VALUES (p_user_id, 'leaderboard_top10', 'silver')
    ON CONFLICT (user_id, badge_type) DO UPDATE SET earned_at = now();
  END IF;
  
  -- Award Highly Rated badge (4.8+ rating with 10+ reviews)
  IF COALESCE(user_profile.rating, 0) >= 4.8 AND COALESCE(user_profile.total_reviews, 0) >= 10 THEN
    INSERT INTO badges (user_id, badge_type, badge_level)
    VALUES (p_user_id, 'highly_rated', 'gold')
    ON CONFLICT (user_id, badge_type) DO UPDATE SET earned_at = now();
  END IF;
  
  -- Award Rating Champion (top rated)
  IF rating_rank = 1 THEN
    INSERT INTO badges (user_id, badge_type, badge_level)
    VALUES (p_user_id, 'rating_champion', 'gold')
    ON CONFLICT (user_id, badge_type) DO UPDATE SET earned_at = now();
  END IF;
  
  -- Award milestone badges
  IF COALESCE(user_profile.completed_tasks, 0) >= 100 THEN
    INSERT INTO badges (user_id, badge_type, badge_level)
    VALUES (p_user_id, 'century_tasker', 'gold')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF COALESCE(user_profile.completed_tasks, 0) >= 50 THEN
    INSERT INTO badges (user_id, badge_type, badge_level)
    VALUES (p_user_id, 'fifty_tasks', 'silver')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF COALESCE(user_profile.completed_tasks, 0) >= 25 THEN
    INSERT INTO badges (user_id, badge_type, badge_level)
    VALUES (p_user_id, 'twentyfive_tasks', 'bronze')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF COALESCE(user_profile.completed_tasks, 0) >= 10 THEN
    INSERT INTO badges (user_id, badge_type, badge_level)
    VALUES (p_user_id, 'ten_tasks', 'bronze')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
END;
$$;

-- Create trigger to award badges when profile is updated
CREATE OR REPLACE FUNCTION public.trigger_award_leaderboard_badges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only check if completed_tasks or rating changed
  IF (OLD.completed_tasks IS DISTINCT FROM NEW.completed_tasks) OR 
     (OLD.rating IS DISTINCT FROM NEW.rating) OR
     (OLD.total_reviews IS DISTINCT FROM NEW.total_reviews) THEN
    PERFORM award_leaderboard_badges(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS on_profile_update_award_badges ON profiles;
CREATE TRIGGER on_profile_update_award_badges
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_award_leaderboard_badges();

-- Create function to get user's leaderboard rank
CREATE OR REPLACE FUNCTION public.get_user_leaderboard_rank(p_user_id uuid)
RETURNS TABLE(tasks_rank bigint, rating_rank bigint, total_taskers bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_tasks integer;
  user_rating numeric;
  user_reviews integer;
BEGIN
  -- Get user's stats
  SELECT completed_tasks, rating, total_reviews 
  INTO user_tasks, user_rating, user_reviews
  FROM profiles WHERE id = p_user_id;
  
  -- Calculate rank by completed tasks
  SELECT COUNT(*) + 1 INTO tasks_rank
  FROM profiles
  WHERE completed_tasks > COALESCE(user_tasks, 0);
  
  -- Calculate rank by rating (only if user has 5+ reviews)
  IF COALESCE(user_reviews, 0) >= 5 THEN
    SELECT COUNT(*) + 1 INTO rating_rank
    FROM profiles
    WHERE total_reviews >= 5 AND rating > COALESCE(user_rating, 0);
  ELSE
    rating_rank := NULL;
  END IF;
  
  -- Get total taskers with completed tasks
  SELECT COUNT(*) INTO total_taskers
  FROM profiles
  WHERE completed_tasks > 0;
  
  RETURN NEXT;
END;
$$;