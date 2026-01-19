-- Task Check-ins (GPS-stamped start/end with geolocation proof)
CREATE TABLE public.task_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  checkin_type TEXT NOT NULL CHECK (checkin_type IN ('start', 'end', 'pause', 'resume')),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_accuracy DECIMAL(10, 2),
  location_address TEXT,
  device_info JSONB,
  photo_url TEXT,
  notes TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_checkins ENABLE ROW LEVEL SECURITY;

-- Task Checklists (Digital sign-off requirements per task)
CREATE TABLE public.task_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  requires_photo BOOLEAN DEFAULT false,
  requires_giver_approval BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_checklists ENABLE ROW LEVEL SECURITY;

-- Checklist Item Completions
CREATE TABLE public.checklist_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID REFERENCES public.task_checklists(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  completed_by UUID NOT NULL,
  photo_url TEXT,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Enable RLS
ALTER TABLE public.checklist_completions ENABLE ROW LEVEL SECURITY;

-- Audit Trail Events (Immutable log of all task-related actions)
CREATE TABLE public.audit_trail_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL CHECK (event_category IN ('task', 'booking', 'payment', 'checkin', 'checklist', 'evidence', 'dispute', 'communication', 'system')),
  event_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  location_data JSONB,
  event_hash TEXT,
  previous_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_trail_events ENABLE ROW LEVEL SECURITY;

-- Create index for efficient queries
CREATE INDEX idx_audit_trail_booking ON public.audit_trail_events(booking_id);
CREATE INDEX idx_audit_trail_task ON public.audit_trail_events(task_id);
CREATE INDEX idx_audit_trail_user ON public.audit_trail_events(user_id);
CREATE INDEX idx_audit_trail_created ON public.audit_trail_events(created_at DESC);
CREATE INDEX idx_task_checkins_booking ON public.task_checkins(booking_id);
CREATE INDEX idx_checklist_completions_booking ON public.checklist_completions(booking_id);

-- AI Dispute Analysis Results
CREATE TABLE public.dispute_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID REFERENCES public.disputes(id) ON DELETE CASCADE NOT NULL,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('initial', 'evidence_review', 'final')),
  ai_model TEXT,
  risk_score DECIMAL(5, 2),
  confidence_score DECIMAL(5, 2),
  recommendation TEXT CHECK (recommendation IN ('favor_giver', 'favor_doer', 'split', 'escalate', 'insufficient_evidence')),
  reasoning TEXT,
  evidence_summary JSONB,
  inconsistencies JSONB,
  suggested_resolution TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dispute_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_checkins
CREATE POLICY "Users can view checkins for their bookings"
  ON public.task_checkins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.tasks t ON t.id = b.task_id
      WHERE b.id = task_checkins.booking_id
      AND (b.task_doer_id = auth.uid() OR t.task_giver_id = auth.uid())
    )
  );

CREATE POLICY "Task doers can create checkins"
  ON public.task_checkins FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id AND b.task_doer_id = auth.uid()
    )
  );

-- RLS Policies for task_checklists
CREATE POLICY "Anyone can view checklists for tasks"
  ON public.task_checklists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_checklists.task_id
    )
  );

CREATE POLICY "Task givers can create checklists"
  ON public.task_checklists FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_id AND t.task_giver_id = auth.uid()
    )
  );

CREATE POLICY "Task givers can update checklists"
  ON public.task_checklists FOR UPDATE
  USING (
    created_by = auth.uid()
  );

CREATE POLICY "Task givers can delete checklists"
  ON public.task_checklists FOR DELETE
  USING (
    created_by = auth.uid()
  );

-- RLS Policies for checklist_completions
CREATE POLICY "Booking participants can view completions"
  ON public.checklist_completions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.tasks t ON t.id = b.task_id
      JOIN public.task_checklists c ON c.task_id = t.id
      WHERE c.id = checklist_completions.checklist_id
      AND (b.task_doer_id = auth.uid() OR t.task_giver_id = auth.uid())
    )
  );

CREATE POLICY "Task doers can create completions"
  ON public.checklist_completions FOR INSERT
  WITH CHECK (
    completed_by = auth.uid()
  );

CREATE POLICY "Task givers can approve/reject completions"
  ON public.checklist_completions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.task_checklists c
      JOIN public.tasks t ON t.id = c.task_id
      WHERE c.id = checklist_completions.checklist_id
      AND t.task_giver_id = auth.uid()
    )
  );

-- RLS Policies for audit_trail_events
CREATE POLICY "Booking participants can view audit trail"
  ON public.audit_trail_events FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.tasks t ON t.id = b.task_id
      WHERE b.id = audit_trail_events.booking_id
      AND (b.task_doer_id = auth.uid() OR t.task_giver_id = auth.uid())
    )
  );

CREATE POLICY "System can insert audit events"
  ON public.audit_trail_events FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for dispute_analysis
CREATE POLICY "Dispute participants can view analysis"
  ON public.dispute_analysis FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.disputes d
      WHERE d.id = dispute_analysis.dispute_id
      AND (d.raised_by = auth.uid() OR d.against_user = auth.uid())
    )
  );

-- Function to generate event hash for audit trail integrity
CREATE OR REPLACE FUNCTION public.generate_audit_hash()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  previous_event RECORD;
  hash_input TEXT;
BEGIN
  -- Get the previous event for this booking/task
  SELECT event_hash INTO previous_event
  FROM public.audit_trail_events
  WHERE (booking_id = NEW.booking_id OR task_id = NEW.task_id)
  ORDER BY created_at DESC
  LIMIT 1;
  
  NEW.previous_hash := previous_event.event_hash;
  
  -- Generate hash from event data
  hash_input := COALESCE(NEW.previous_hash, 'genesis') || '|' ||
                NEW.event_type || '|' ||
                NEW.user_id::TEXT || '|' ||
                NEW.created_at::TEXT || '|' ||
                COALESCE(NEW.event_data::TEXT, '');
  
  NEW.event_hash := encode(sha256(hash_input::bytea), 'hex');
  
  RETURN NEW;
END;
$$;

-- Trigger for audit hash generation
CREATE TRIGGER generate_audit_hash_trigger
  BEFORE INSERT ON public.audit_trail_events
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_audit_hash();

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_booking_id UUID,
  p_task_id UUID,
  p_user_id UUID,
  p_event_type TEXT,
  p_event_category TEXT,
  p_event_data JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_location_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.audit_trail_events (
    booking_id, task_id, user_id, event_type, event_category,
    event_data, ip_address, location_data
  ) VALUES (
    p_booking_id, p_task_id, p_user_id, p_event_type, p_event_category,
    p_event_data, p_ip_address, p_location_data
  )
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- Enable realtime for audit trail
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_trail_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_checkins;
ALTER PUBLICATION supabase_realtime ADD TABLE public.checklist_completions;