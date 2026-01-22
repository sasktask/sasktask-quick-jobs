-- ============================================
-- PHASE 3: INSTANT WORK SYSTEM (Uber-like)
-- ============================================

-- 1. Instant Task Requests Table
-- Stores requests from task givers looking for immediate help
CREATE TABLE IF NOT EXISTS public.instant_task_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Task Details
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  
  -- Location
  location_address TEXT,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  
  -- Status: searching -> pending_acceptance -> accepted/expired/cancelled
  status TEXT DEFAULT 'searching' CHECK (status IN ('searching', 'pending_acceptance', 'accepted', 'expired', 'cancelled')),
  
  -- Matching
  search_radius_km INT DEFAULT 5,
  notified_doer_ids UUID[] DEFAULT '{}',
  targeted_doer_id UUID REFERENCES auth.users(id),
  accepted_by_doer_id UUID REFERENCES auth.users(id),
  
  -- Timing
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Doer Live Availability Table
-- Tracks real-time location and availability of task doers
CREATE TABLE IF NOT EXISTS public.doer_live_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Status
  is_available BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'offline' CHECK (status IN ('offline', 'available', 'busy', 'on_task')),
  
  -- Live Location
  current_latitude DECIMAL(10,8),
  current_longitude DECIMAL(11,8),
  location_accuracy DECIMAL(10,2),
  heading DECIMAL(5,2),
  speed DECIMAL(5,2),
  
  -- Settings
  max_distance_km INT DEFAULT 20,
  auto_accept BOOLEAN DEFAULT false,
  available_until TIMESTAMPTZ,
  accepted_categories TEXT[] DEFAULT '{}',
  
  -- Tracking
  last_location_update TIMESTAMPTZ,
  last_ping TIMESTAMPTZ DEFAULT now(),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Instant Request Responses Table
-- Tracks which doers were notified and their responses
CREATE TABLE IF NOT EXISTS public.instant_request_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.instant_task_requests(id) ON DELETE CASCADE,
  doer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Response tracking
  status TEXT DEFAULT 'notified' CHECK (status IN ('notified', 'viewed', 'accepted', 'declined', 'expired', 'timeout')),
  notified_at TIMESTAMPTZ DEFAULT now(),
  viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  
  -- Match info
  distance_km DECIMAL(10,2),
  estimated_eta_mins INT,
  
  -- Unique constraint: one response per doer per request
  UNIQUE(request_id, doer_id)
);

-- 4. ETA Accuracy Logs (for ML optimization)
CREATE TABLE IF NOT EXISTS public.eta_accuracy_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.instant_task_requests(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  doer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- ETA Data
  estimated_eta_mins INT NOT NULL,
  actual_arrival_mins INT,
  distance_km DECIMAL(10,2),
  
  -- Conditions
  weather_conditions TEXT,
  time_of_day TEXT,
  day_of_week INT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_instant_requests_status ON public.instant_task_requests(status);
CREATE INDEX IF NOT EXISTS idx_instant_requests_giver ON public.instant_task_requests(giver_id);
CREATE INDEX IF NOT EXISTS idx_instant_requests_location ON public.instant_task_requests(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_instant_requests_expires ON public.instant_task_requests(expires_at) WHERE status = 'searching';

CREATE INDEX IF NOT EXISTS idx_doer_availability_available ON public.doer_live_availability(is_available, status) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_doer_availability_location ON public.doer_live_availability(current_latitude, current_longitude) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_doer_availability_user ON public.doer_live_availability(user_id);

CREATE INDEX IF NOT EXISTS idx_request_responses_request ON public.instant_request_responses(request_id);
CREATE INDEX IF NOT EXISTS idx_request_responses_doer ON public.instant_request_responses(doer_id);
CREATE INDEX IF NOT EXISTS idx_request_responses_status ON public.instant_request_responses(status);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.instant_task_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doer_live_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instant_request_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eta_accuracy_logs ENABLE ROW LEVEL SECURITY;

-- Instant Task Requests Policies
CREATE POLICY "Givers can view own requests"
ON public.instant_task_requests FOR SELECT
USING (auth.uid() = giver_id);

CREATE POLICY "Givers can create requests"
ON public.instant_task_requests FOR INSERT
WITH CHECK (auth.uid() = giver_id);

CREATE POLICY "Givers can update own requests"
ON public.instant_task_requests FOR UPDATE
USING (auth.uid() = giver_id);

CREATE POLICY "Doers can view requests they are notified about"
ON public.instant_task_requests FOR SELECT
USING (auth.uid() = ANY(notified_doer_ids) OR auth.uid() = accepted_by_doer_id);

-- Doer Live Availability Policies
CREATE POLICY "Users can view own availability"
ON public.doer_live_availability FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own availability"
ON public.doer_live_availability FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view available doers location"
ON public.doer_live_availability FOR SELECT
USING (is_available = true AND status = 'available');

-- Request Responses Policies
CREATE POLICY "Doers can view own responses"
ON public.instant_request_responses FOR SELECT
USING (auth.uid() = doer_id);

CREATE POLICY "Givers can view responses to their requests"
ON public.instant_request_responses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.instant_task_requests r
    WHERE r.id = request_id AND r.giver_id = auth.uid()
  )
);

CREATE POLICY "Doers can update own responses"
ON public.instant_request_responses FOR UPDATE
USING (auth.uid() = doer_id);

-- ETA Logs (read-only for users, insert via service role)
CREATE POLICY "Users can view own ETA logs"
ON public.eta_accuracy_logs FOR SELECT
USING (auth.uid() = doer_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE TRIGGER update_instant_requests_updated_at
BEFORE UPDATE ON public.instant_task_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doer_availability_updated_at
BEFORE UPDATE ON public.doer_live_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to find nearby available doers
CREATE OR REPLACE FUNCTION public.find_nearby_doers(
  p_latitude DECIMAL,
  p_longitude DECIMAL,
  p_radius_km INT DEFAULT 10,
  p_category TEXT DEFAULT NULL,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  rating DECIMAL,
  total_reviews INT,
  completed_tasks INT,
  distance_km DECIMAL,
  estimated_eta_mins INT,
  is_available BOOLEAN,
  current_latitude DECIMAL,
  current_longitude DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.user_id,
    p.full_name,
    p.avatar_url,
    p.rating,
    p.total_reviews::INT,
    p.completed_tasks::INT,
    (
      6371 * acos(
        cos(radians(p_latitude)) * cos(radians(d.current_latitude)) *
        cos(radians(d.current_longitude) - radians(p_longitude)) +
        sin(radians(p_latitude)) * sin(radians(d.current_latitude))
      )
    )::DECIMAL AS distance_km,
    -- ETA = distance / 30kmh * 60 + 5 min buffer
    (((6371 * acos(
        cos(radians(p_latitude)) * cos(radians(d.current_latitude)) *
        cos(radians(d.current_longitude) - radians(p_longitude)) +
        sin(radians(p_latitude)) * sin(radians(d.current_latitude))
      )) / 30) * 60 + 5)::INT AS estimated_eta_mins,
    d.is_available,
    d.current_latitude,
    d.current_longitude
  FROM public.doer_live_availability d
  JOIN public.profiles p ON p.id = d.user_id
  WHERE 
    d.is_available = true
    AND d.status = 'available'
    AND d.current_latitude IS NOT NULL
    AND d.current_longitude IS NOT NULL
    AND (d.available_until IS NULL OR d.available_until > now())
    AND (
      6371 * acos(
        cos(radians(p_latitude)) * cos(radians(d.current_latitude)) *
        cos(radians(d.current_longitude) - radians(p_longitude)) +
        sin(radians(p_latitude)) * sin(radians(d.current_latitude))
      )
    ) <= p_radius_km
    AND (p_category IS NULL OR p_category = ANY(d.accepted_categories) OR array_length(d.accepted_categories, 1) IS NULL)
  ORDER BY distance_km ASC, p.rating DESC NULLS LAST
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire old requests
CREATE OR REPLACE FUNCTION public.expire_instant_requests()
RETURNS void AS $$
BEGIN
  UPDATE public.instant_task_requests
  SET status = 'expired', updated_at = now()
  WHERE status IN ('searching', 'pending_acceptance')
  AND expires_at < now();
  
  UPDATE public.instant_request_responses
  SET status = 'expired', responded_at = now()
  WHERE status IN ('notified', 'viewed')
  AND request_id IN (
    SELECT id FROM public.instant_task_requests WHERE status = 'expired'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.find_nearby_doers TO authenticated;
