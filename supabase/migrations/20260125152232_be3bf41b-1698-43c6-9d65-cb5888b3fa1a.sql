-- Background Check System

-- Create enum for background check status
CREATE TYPE public.background_check_status AS ENUM (
  'pending',
  'processing', 
  'passed',
  'failed',
  'expired',
  'cancelled'
);

-- Create enum for check types
CREATE TYPE public.background_check_type AS ENUM (
  'criminal_record',
  'identity_verification',
  'employment_history',
  'education_verification',
  'credit_check',
  'reference_check'
);

-- Background checks table
CREATE TABLE public.background_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_type background_check_type NOT NULL,
  status background_check_status DEFAULT 'pending',
  
  -- Provider fields (API-ready)
  provider TEXT, -- 'certn', 'checkr', 'manual', etc.
  provider_reference_id TEXT, -- External provider's ID
  provider_response JSONB, -- Full API response stored for audit
  
  -- Check details
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Results
  result_summary TEXT,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  flags JSONB, -- Array of flagged items
  
  -- Admin review
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  
  -- Consent tracking
  consent_given BOOLEAN DEFAULT false,
  consent_given_at TIMESTAMP WITH TIME ZONE,
  consent_ip_address TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User consent records for PIPEDA compliance
CREATE TABLE public.background_check_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- 'background_check', 'criminal_record', etc.
  consent_text TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  consented_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Background check packages (bundles of check types)
CREATE TABLE public.background_check_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  check_types background_check_type[] NOT NULL,
  price_cad NUMERIC(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_required_for_tasker BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.background_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.background_check_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.background_check_packages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for background_checks
CREATE POLICY "Users can view their own background checks"
  ON public.background_checks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can request background checks for themselves"
  ON public.background_checks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all background checks"
  ON public.background_checks FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update background checks"
  ON public.background_checks FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for consents
CREATE POLICY "Users can view their own consents"
  ON public.background_check_consents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own consents"
  ON public.background_check_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can revoke their own consents"
  ON public.background_check_consents FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for packages
CREATE POLICY "Anyone can view active packages"
  ON public.background_check_packages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage packages"
  ON public.background_check_packages FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Add background check status to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS background_check_status TEXT DEFAULT 'none' 
    CHECK (background_check_status IN ('none', 'pending', 'verified', 'failed', 'expired')),
  ADD COLUMN IF NOT EXISTS background_check_verified_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS background_check_expires_at TIMESTAMP WITH TIME ZONE;

-- Create trigger for updated_at
CREATE TRIGGER update_background_checks_updated_at
  BEFORE UPDATE ON public.background_checks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default packages
INSERT INTO public.background_check_packages (name, description, check_types, price_cad, is_active, is_required_for_tasker)
VALUES 
  ('Basic Verification', 'Criminal record check and identity verification', ARRAY['criminal_record', 'identity_verification']::background_check_type[], 25.00, true, true),
  ('Standard Package', 'Criminal, identity, and employment verification', ARRAY['criminal_record', 'identity_verification', 'employment_history']::background_check_type[], 45.00, true, false),
  ('Comprehensive Package', 'Full background check including all verifications', ARRAY['criminal_record', 'identity_verification', 'employment_history', 'education_verification', 'reference_check']::background_check_type[], 75.00, true, false);

-- Enable realtime for admin dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.background_checks;