-- Create doer_live_availability table for real-time tracking
CREATE TABLE IF NOT EXISTS public.doer_live_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  is_available BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('offline', 'available', 'busy', 'on_task')),
  current_latitude NUMERIC(10, 8),
  current_longitude NUMERIC(11, 8),
  location_accuracy NUMERIC(10, 2),
  heading NUMERIC(5, 2),
  speed NUMERIC(8, 2),
  last_location_update TIMESTAMPTZ,
  last_ping TIMESTAMPTZ DEFAULT now(),
  went_online_at TIMESTAMPTZ,
  total_online_seconds INTEGER DEFAULT 0,
  today_online_seconds INTEGER DEFAULT 0,
  today_tasks_completed INTEGER DEFAULT 0,
  current_task_id UUID,
  preferred_categories TEXT[] DEFAULT '{}',
  max_distance_km NUMERIC(6, 2) DEFAULT 25,
  accepts_instant_requests BOOLEAN DEFAULT true,
  battery_level INTEGER,
  is_charging BOOLEAN,
  network_type TEXT,
  app_version TEXT,
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.doer_live_availability ENABLE ROW LEVEL SECURITY;

-- Users can view their own availability
CREATE POLICY "Users can view own availability"
  ON public.doer_live_availability
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can manage their own availability
CREATE POLICY "Users can insert own availability"
  ON public.doer_live_availability
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own availability"
  ON public.doer_live_availability
  FOR UPDATE
  USING (auth.uid() = user_id);

-- System/admins can view all availability for matching
CREATE POLICY "Service role can view all availability"
  ON public.doer_live_availability
  FOR SELECT
  USING (true);

-- Create index for fast geospatial queries
CREATE INDEX IF NOT EXISTS idx_doer_live_availability_location 
  ON public.doer_live_availability (current_latitude, current_longitude)
  WHERE is_available = true;

CREATE INDEX IF NOT EXISTS idx_doer_live_availability_status 
  ON public.doer_live_availability (is_available, status)
  WHERE is_available = true;

-- Create function to find nearby available doers
CREATE OR REPLACE FUNCTION public.find_nearby_doers(
  p_latitude NUMERIC,
  p_longitude NUMERIC,
  p_radius_km NUMERIC DEFAULT 10,
  p_category TEXT DEFAULT NULL,
  p_exclude_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  rating NUMERIC,
  total_reviews INTEGER,
  distance_km NUMERIC,
  eta_minutes INTEGER,
  status TEXT,
  last_ping TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dla.user_id,
    p.full_name,
    p.avatar_url,
    p.rating,
    p.total_reviews,
    calculate_distance(p_latitude, p_longitude, dla.current_latitude, dla.current_longitude) AS distance_km,
    CEIL(calculate_distance(p_latitude, p_longitude, dla.current_latitude, dla.current_longitude) / 0.5)::INTEGER AS eta_minutes,
    dla.status,
    dla.last_ping
  FROM doer_live_availability dla
  JOIN profiles p ON p.id = dla.user_id
  WHERE dla.is_available = true
    AND dla.status = 'available'
    AND dla.accepts_instant_requests = true
    AND dla.current_latitude IS NOT NULL
    AND dla.current_longitude IS NOT NULL
    AND (p_exclude_user_id IS NULL OR dla.user_id != p_exclude_user_id)
    AND dla.last_ping > now() - INTERVAL '5 minutes'
    AND calculate_distance(p_latitude, p_longitude, dla.current_latitude, dla.current_longitude) <= p_radius_km
    AND (p_category IS NULL OR p_category = ANY(dla.preferred_categories) OR array_length(dla.preferred_categories, 1) IS NULL)
  ORDER BY distance_km ASC
  LIMIT 20;
END;
$$;

-- Create function to update online time tracking
CREATE OR REPLACE FUNCTION public.update_doer_online_time()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session_seconds INTEGER;
BEGIN
  -- If going offline, calculate session duration
  IF OLD.is_available = true AND NEW.is_available = false AND OLD.went_online_at IS NOT NULL THEN
    session_seconds := EXTRACT(EPOCH FROM (now() - OLD.went_online_at))::INTEGER;
    NEW.total_online_seconds := COALESCE(OLD.total_online_seconds, 0) + session_seconds;
    NEW.today_online_seconds := COALESCE(OLD.today_online_seconds, 0) + session_seconds;
    NEW.went_online_at := NULL;
  END IF;
  
  -- If going online, set went_online_at
  IF OLD.is_available = false AND NEW.is_available = true THEN
    NEW.went_online_at := now();
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Create trigger for online time tracking
DROP TRIGGER IF EXISTS trigger_update_doer_online_time ON public.doer_live_availability;
CREATE TRIGGER trigger_update_doer_online_time
  BEFORE UPDATE ON public.doer_live_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_doer_online_time();

-- Enable realtime for live availability
ALTER PUBLICATION supabase_realtime ADD TABLE public.doer_live_availability;