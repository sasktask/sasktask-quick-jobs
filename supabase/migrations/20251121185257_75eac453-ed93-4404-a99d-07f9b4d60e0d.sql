-- Create disputes table for dispute resolution system
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  raised_by UUID NOT NULL,
  against_user UUID NOT NULL,
  dispute_reason TEXT NOT NULL,
  dispute_details TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
  resolution TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  evidence_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create task_milestones table for milestone-based payments
CREATE TABLE IF NOT EXISTS public.task_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  milestone_order INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'paid', 'released')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  payment_id UUID REFERENCES public.payments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, milestone_order)
);

-- Create task_insurance table
CREATE TABLE IF NOT EXISTS public.task_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  insurance_type TEXT NOT NULL CHECK (insurance_type IN ('basic', 'standard', 'premium')),
  coverage_amount DECIMAL(10,2) NOT NULL,
  premium_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'expired')),
  policy_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(task_id)
);

-- Create insurance_claims table
CREATE TABLE IF NOT EXISTS public.insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insurance_id UUID NOT NULL REFERENCES public.task_insurance(id) ON DELETE CASCADE,
  claimed_by UUID NOT NULL,
  claim_reason TEXT NOT NULL,
  claim_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  evidence_urls TEXT[],
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhance reviews table with additional fields
ALTER TABLE public.reviews 
  ADD COLUMN IF NOT EXISTS quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  ADD COLUMN IF NOT EXISTS communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  ADD COLUMN IF NOT EXISTS timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  ADD COLUMN IF NOT EXISTS response TEXT,
  ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;

-- Create review_responses table for responding to reviews
CREATE TABLE IF NOT EXISTS public.review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  responded_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id)
);

-- Create badges table for achievement system
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('top_rated', 'reliable', 'quick_responder', 'verified_expert', 'frequent_user', 'perfect_record')),
  badge_level TEXT CHECK (badge_level IN ('bronze', 'silver', 'gold', 'platinum')),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_type)
);

-- Create task_templates table for common task types
CREATE TABLE IF NOT EXISTS public.task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description_template TEXT NOT NULL,
  estimated_duration TEXT,
  suggested_rate DECIMAL(10,2),
  required_skills TEXT[],
  tools_needed TEXT[],
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_disputes_booking_id ON public.disputes(booking_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_raised_by ON public.disputes(raised_by);
CREATE INDEX IF NOT EXISTS idx_milestones_task_id ON public.task_milestones(task_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON public.task_milestones(status);
CREATE INDEX IF NOT EXISTS idx_insurance_task_id ON public.task_insurance(task_id);
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON public.badges(user_id);

-- Enable RLS on new tables
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for disputes
CREATE POLICY "Users can view disputes they're involved in" ON public.disputes
  FOR SELECT USING (
    auth.uid() = raised_by OR 
    auth.uid() = against_user OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Users can create disputes for their bookings" ON public.disputes
  FOR INSERT WITH CHECK (
    auth.uid() = raised_by AND 
    is_booking_participant(auth.uid(), booking_id)
  );

CREATE POLICY "Admins can update disputes" ON public.disputes
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for milestones
CREATE POLICY "Users can view milestones for their tasks" ON public.task_milestones
  FOR SELECT USING (
    auth.uid() IN (
      SELECT task_giver_id FROM tasks WHERE id = task_id
      UNION
      SELECT task_doer_id FROM tasks WHERE id = task_id
    )
  );

CREATE POLICY "Task givers can create milestones" ON public.task_milestones
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT task_giver_id FROM tasks WHERE id = task_id)
  );

CREATE POLICY "Task givers can update milestones" ON public.task_milestones
  FOR UPDATE USING (
    auth.uid() IN (SELECT task_giver_id FROM tasks WHERE id = task_id)
  );

-- RLS Policies for insurance
CREATE POLICY "Users can view insurance for their tasks" ON public.task_insurance
  FOR SELECT USING (
    auth.uid() IN (
      SELECT task_giver_id FROM tasks WHERE id = task_id
      UNION
      SELECT task_doer_id FROM tasks WHERE id = task_id
    )
  );

CREATE POLICY "Task givers can create insurance" ON public.task_insurance
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT task_giver_id FROM tasks WHERE id = task_id)
  );

-- RLS Policies for insurance claims
CREATE POLICY "Users can view their insurance claims" ON public.insurance_claims
  FOR SELECT USING (
    auth.uid() = claimed_by OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Users can create insurance claims" ON public.insurance_claims
  FOR INSERT WITH CHECK (auth.uid() = claimed_by);

CREATE POLICY "Admins can update insurance claims" ON public.insurance_claims
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for review responses
CREATE POLICY "Anyone can view review responses" ON public.review_responses
  FOR SELECT USING (true);

CREATE POLICY "Reviewees can respond to their reviews" ON public.review_responses
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT reviewee_id FROM reviews WHERE id = review_id)
  );

-- RLS Policies for badges
CREATE POLICY "Anyone can view badges" ON public.badges
  FOR SELECT USING (true);

-- RLS Policies for task templates
CREATE POLICY "Anyone can view active templates" ON public.task_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage templates" ON public.task_templates
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to auto-award badges
CREATE OR REPLACE FUNCTION award_badges()
RETURNS TRIGGER AS $$
BEGIN
  -- Award top_rated badge if rating >= 4.8 and reviews >= 10
  IF (SELECT rating >= 4.8 AND total_reviews >= 10 FROM profiles WHERE id = NEW.id) THEN
    INSERT INTO badges (user_id, badge_type, badge_level)
    VALUES (NEW.id, 'top_rated', 'gold')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- Award reliable badge if on_time_rate >= 95% and completed_tasks >= 20
  IF (SELECT on_time_rate >= 95 AND completed_tasks >= 20 FROM profiles WHERE id = NEW.id) THEN
    INSERT INTO badges (user_id, badge_type, badge_level)
    VALUES (NEW.id, 'reliable', 'gold')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-awarding badges
DROP TRIGGER IF EXISTS trigger_award_badges ON public.profiles;
CREATE TRIGGER trigger_award_badges
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (OLD.rating IS DISTINCT FROM NEW.rating OR OLD.completed_tasks IS DISTINCT FROM NEW.completed_tasks)
  EXECUTE FUNCTION award_badges();

-- Add trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_disputes_updated_at ON public.disputes;
CREATE TRIGGER update_disputes_updated_at
  BEFORE UPDATE ON public.disputes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_milestones_updated_at ON public.task_milestones;
CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON public.task_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();