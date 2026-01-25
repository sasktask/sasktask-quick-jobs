-- =============================================
-- REFERRAL PROGRAM SYSTEM
-- =============================================

-- Referral codes table
CREATE TABLE public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT NULL, -- NULL = unlimited
  reward_amount NUMERIC(10,2) DEFAULT 10.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Referrals tracking table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code_id UUID REFERENCES public.referral_codes(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded', 'expired')),
  referrer_reward NUMERIC(10,2) DEFAULT 10.00,
  referred_reward NUMERIC(10,2) DEFAULT 5.00,
  referrer_rewarded_at TIMESTAMP WITH TIME ZONE,
  referred_rewarded_at TIMESTAMP WITH TIME ZONE,
  qualifying_task_id UUID REFERENCES public.tasks(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(referred_id)
);

-- =============================================
-- ACHIEVEMENT SYSTEM
-- =============================================

-- Achievement definitions
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- Lucide icon name
  category TEXT NOT NULL CHECK (category IN ('tasks', 'earnings', 'ratings', 'streak', 'referrals', 'special')),
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('count', 'amount', 'streak', 'rating', 'special')),
  requirement_value INTEGER NOT NULL,
  reward_type TEXT CHECK (reward_type IN ('badge', 'bonus', 'boost', 'unlock')),
  reward_value NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User achievements (earned)
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- =============================================
-- AI SMART MATCHING
-- =============================================

-- User preferences for smart matching
CREATE TABLE public.user_match_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferred_categories TEXT[] DEFAULT '{}',
  preferred_price_min NUMERIC(10,2),
  preferred_price_max NUMERIC(10,2),
  preferred_distance_km INTEGER DEFAULT 25,
  preferred_task_types TEXT[] DEFAULT '{}', -- 'quick', 'scheduled', 'recurring'
  availability_hours JSONB, -- { "mon": ["9:00-17:00"], "tue": [...] }
  skill_keywords TEXT[] DEFAULT '{}',
  ai_matching_enabled BOOLEAN DEFAULT true,
  notification_preferences JSONB DEFAULT '{"instant": true, "daily_digest": false}',
  last_match_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Smart match history (for ML improvement)
CREATE TABLE public.smart_match_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  match_score NUMERIC(5,2), -- 0-100
  match_reasons JSONB, -- { "category": 25, "location": 30, "skills": 20, "rating": 25 }
  action_taken TEXT CHECK (action_taken IN ('viewed', 'applied', 'ignored', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_referral_codes_user ON public.referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON public.referrals(referred_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);
CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_completed ON public.user_achievements(is_completed);
CREATE INDEX idx_smart_match_logs_user ON public.smart_match_logs(user_id);
CREATE INDEX idx_user_match_preferences_user ON public.user_match_preferences(user_id);

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_match_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_match_logs ENABLE ROW LEVEL SECURITY;

-- Referral codes policies
CREATE POLICY "Users can view their own referral codes"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral codes"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can look up active referral codes"
  ON public.referral_codes FOR SELECT
  USING (is_active = true);

-- Referrals policies
CREATE POLICY "Users can view referrals they're involved in"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "System can insert referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referred_id);

-- Achievements policies (public read)
CREATE POLICY "Anyone can view achievements"
  ON public.achievements FOR SELECT
  USING (is_active = true);

-- User achievements policies
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
  ON public.user_achievements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert user achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Match preferences policies
CREATE POLICY "Users can manage their own match preferences"
  ON public.user_match_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Smart match logs policies
CREATE POLICY "Users can view their own match logs"
  ON public.smart_match_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own match logs"
  ON public.smart_match_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN := true;
BEGIN
  WHILE code_exists LOOP
    -- Generate 8-character alphanumeric code
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = new_code) INTO code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Create referral code for user if doesn't exist
CREATE OR REPLACE FUNCTION public.get_or_create_referral_code(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_code TEXT;
  new_code TEXT;
BEGIN
  -- Check for existing active code
  SELECT code INTO existing_code
  FROM referral_codes
  WHERE user_id = p_user_id AND is_active = true
  LIMIT 1;
  
  IF existing_code IS NOT NULL THEN
    RETURN existing_code;
  END IF;
  
  -- Generate new code
  new_code := generate_referral_code();
  
  INSERT INTO referral_codes (user_id, code)
  VALUES (p_user_id, new_code);
  
  RETURN new_code;
END;
$$;

-- Process referral when new user signs up with code
CREATE OR REPLACE FUNCTION public.process_referral(p_referred_id UUID, p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referral_code RECORD;
BEGIN
  -- Get referral code
  SELECT * INTO v_referral_code
  FROM referral_codes
  WHERE code = upper(p_code) AND is_active = true;
  
  IF v_referral_code IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check max uses
  IF v_referral_code.max_uses IS NOT NULL AND v_referral_code.uses_count >= v_referral_code.max_uses THEN
    RETURN false;
  END IF;
  
  -- Can't refer yourself
  IF v_referral_code.user_id = p_referred_id THEN
    RETURN false;
  END IF;
  
  -- Create referral record
  INSERT INTO referrals (referrer_id, referred_id, referral_code_id, referrer_reward, referred_reward)
  VALUES (v_referral_code.user_id, p_referred_id, v_referral_code.id, v_referral_code.reward_amount, 5.00)
  ON CONFLICT (referred_id) DO NOTHING;
  
  -- Increment uses count
  UPDATE referral_codes
  SET uses_count = uses_count + 1, updated_at = now()
  WHERE id = v_referral_code.id;
  
  RETURN true;
END;
$$;

-- Check and award achievements
CREATE OR REPLACE FUNCTION public.check_user_achievements(p_user_id UUID)
RETURNS SETOF user_achievements
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_achievement RECORD;
  v_user_profile RECORD;
  v_current_value INTEGER;
BEGIN
  -- Get user profile data
  SELECT * INTO v_user_profile FROM profiles WHERE id = p_user_id;
  
  -- Loop through all active achievements
  FOR v_achievement IN SELECT * FROM achievements WHERE is_active = true
  LOOP
    -- Calculate current value based on requirement type
    CASE v_achievement.requirement_type
      WHEN 'count' THEN
        CASE v_achievement.category
          WHEN 'tasks' THEN v_current_value := COALESCE(v_user_profile.completed_tasks, 0);
          WHEN 'referrals' THEN
            SELECT COUNT(*) INTO v_current_value FROM referrals 
            WHERE referrer_id = p_user_id AND status = 'completed';
          ELSE v_current_value := 0;
        END CASE;
      WHEN 'rating' THEN
        v_current_value := COALESCE(v_user_profile.rating, 0)::INTEGER * 100; -- Store as integer (4.5 = 450)
      ELSE
        v_current_value := 0;
    END CASE;
    
    -- Upsert user achievement progress
    INSERT INTO user_achievements (user_id, achievement_id, progress, is_completed, completed_at)
    VALUES (
      p_user_id, 
      v_achievement.id, 
      v_current_value,
      v_current_value >= v_achievement.requirement_value,
      CASE WHEN v_current_value >= v_achievement.requirement_value THEN now() ELSE NULL END
    )
    ON CONFLICT (user_id, achievement_id) DO UPDATE SET
      progress = EXCLUDED.progress,
      is_completed = EXCLUDED.is_completed,
      completed_at = CASE 
        WHEN user_achievements.is_completed = false AND EXCLUDED.is_completed = true 
        THEN now() 
        ELSE user_achievements.completed_at 
      END;
  END LOOP;
  
  RETURN QUERY SELECT * FROM user_achievements WHERE user_id = p_user_id;
END;
$$;

-- =============================================
-- SEED ACHIEVEMENTS
-- =============================================

INSERT INTO public.achievements (name, description, icon, category, tier, requirement_type, requirement_value, reward_type, reward_value) VALUES
-- Task achievements
('First Steps', 'Complete your first task', 'Footprints', 'tasks', 'bronze', 'count', 1, 'badge', 0),
('Rising Star', 'Complete 10 tasks', 'Star', 'tasks', 'bronze', 'count', 10, 'badge', 0),
('Task Master', 'Complete 25 tasks', 'Award', 'tasks', 'silver', 'count', 25, 'badge', 5),
('Pro Tasker', 'Complete 50 tasks', 'Trophy', 'tasks', 'gold', 'count', 50, 'bonus', 10),
('Century Club', 'Complete 100 tasks', 'Crown', 'tasks', 'platinum', 'count', 100, 'bonus', 25),
('Task Legend', 'Complete 500 tasks', 'Gem', 'tasks', 'diamond', 'count', 500, 'bonus', 100),

-- Rating achievements
('Well Reviewed', 'Maintain a 4.0+ rating', 'ThumbsUp', 'ratings', 'bronze', 'rating', 400, 'badge', 0),
('Highly Rated', 'Maintain a 4.5+ rating', 'Heart', 'ratings', 'silver', 'rating', 450, 'badge', 0),
('Top Performer', 'Achieve a 4.8+ rating with 10+ reviews', 'Sparkles', 'ratings', 'gold', 'rating', 480, 'boost', 0),
('Perfect Score', 'Achieve a 5.0 rating', 'Medal', 'ratings', 'diamond', 'rating', 500, 'boost', 0),

-- Referral achievements
('Networker', 'Refer 1 friend', 'UserPlus', 'referrals', 'bronze', 'count', 1, 'bonus', 5),
('Connector', 'Refer 5 friends', 'Users', 'referrals', 'silver', 'count', 5, 'bonus', 15),
('Ambassador', 'Refer 10 friends', 'Megaphone', 'referrals', 'gold', 'count', 10, 'bonus', 30),
('Influencer', 'Refer 25 friends', 'Globe', 'referrals', 'platinum', 'count', 25, 'bonus', 75),

-- Special achievements
('Verified Pro', 'Complete full profile verification', 'ShieldCheck', 'special', 'silver', 'special', 1, 'boost', 0),
('Early Adopter', 'Join during launch period', 'Rocket', 'special', 'gold', 'special', 1, 'badge', 0),
('Community Builder', 'Write 10 reviews for others', 'MessageCircle', 'special', 'silver', 'count', 10, 'badge', 0);