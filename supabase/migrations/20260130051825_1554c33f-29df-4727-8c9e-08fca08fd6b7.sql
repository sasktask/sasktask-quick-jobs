-- Legal document versions tracking
CREATE TABLE public.legal_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_type TEXT NOT NULL, -- 'terms', 'privacy', 'contractor_agreement', 'dispute_policy', 'waiver'
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT, -- Brief summary of changes
  effective_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT false,
  requires_acceptance BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(document_type, version)
);

-- User legal document acceptances (consent tracking)
CREATE TABLE public.legal_acceptances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_id UUID NOT NULL REFERENCES public.legal_documents(id),
  document_type TEXT NOT NULL,
  document_version TEXT NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  acceptance_method TEXT DEFAULT 'checkbox', -- 'checkbox', 'signature', 'click'
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, document_id)
);

-- Regulatory compliance records
CREATE TABLE public.regulatory_compliance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  compliance_type TEXT NOT NULL, -- 'wcb', 'gst', 'insurance', 'background_check', 'age_verification'
  status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'expired', 'exempt'
  verification_date TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE,
  document_url TEXT,
  verification_details JSONB,
  province TEXT DEFAULT 'SK',
  verified_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tax compliance tracking (GST/PST/HST)
CREATE TABLE public.tax_compliance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tax_year INTEGER NOT NULL,
  gross_earnings NUMERIC(12,2) DEFAULT 0,
  gst_collected NUMERIC(12,2) DEFAULT 0,
  pst_collected NUMERIC(12,2) DEFAULT 0,
  gst_registration_number TEXT,
  gst_registration_date DATE,
  is_gst_registered BOOLEAN DEFAULT false,
  reached_gst_threshold BOOLEAN DEFAULT false,
  threshold_reached_date DATE,
  tax_responsibility_accepted BOOLEAN DEFAULT false,
  tax_responsibility_accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tax_year)
);

-- Insurance requirements by category
CREATE TABLE public.insurance_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  province TEXT NOT NULL DEFAULT 'SK',
  requirement_type TEXT NOT NULL, -- 'wcb', 'liability', 'professional', 'vehicle'
  minimum_coverage NUMERIC(12,2),
  is_mandatory BOOLEAN DEFAULT false,
  description TEXT,
  legal_reference TEXT,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dispute resolution records
CREATE TABLE public.dispute_resolution_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dispute_id UUID REFERENCES public.disputes(id),
  resolution_stage TEXT NOT NULL, -- 'mediation', 'arbitration', 'legal', 'closed'
  resolution_method TEXT, -- 'mutual_agreement', 'platform_decision', 'external_arbitration'
  resolution_summary TEXT,
  amount_refunded NUMERIC(12,2),
  amount_released NUMERIC(12,2),
  platform_fee_waived BOOLEAN DEFAULT false,
  resolved_by UUID,
  resolution_date TIMESTAMP WITH TIME ZONE,
  appeal_deadline TIMESTAMP WITH TIME ZONE,
  appeal_filed BOOLEAN DEFAULT false,
  legal_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_resolution_records ENABLE ROW LEVEL SECURITY;

-- Legal documents are publicly readable
CREATE POLICY "Legal documents are publicly readable"
ON public.legal_documents FOR SELECT USING (is_active = true);

-- Users can view their own acceptances
CREATE POLICY "Users can view own legal acceptances"
ON public.legal_acceptances FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own acceptances
CREATE POLICY "Users can accept legal documents"
ON public.legal_acceptances FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view own compliance records
CREATE POLICY "Users can view own regulatory compliance"
ON public.regulatory_compliance FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert own compliance records
CREATE POLICY "Users can submit compliance documents"
ON public.regulatory_compliance FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update own compliance
CREATE POLICY "Users can update own compliance"
ON public.regulatory_compliance FOR UPDATE
USING (auth.uid() = user_id);

-- Tax records - users see their own
CREATE POLICY "Users can view own tax records"
ON public.tax_compliance_records FOR SELECT
USING (auth.uid() = user_id);

-- Insurance requirements are public
CREATE POLICY "Insurance requirements are public"
ON public.insurance_requirements FOR SELECT USING (true);

-- Dispute resolution - users in dispute can view
CREATE POLICY "Dispute parties can view resolution"
ON public.dispute_resolution_records FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.disputes d
    WHERE d.id = dispute_id
    AND (d.raised_by = auth.uid() OR d.against_user = auth.uid())
  )
);

-- Indexes for performance
CREATE INDEX idx_legal_acceptances_user ON public.legal_acceptances(user_id);
CREATE INDEX idx_legal_acceptances_document ON public.legal_acceptances(document_id);
CREATE INDEX idx_regulatory_compliance_user ON public.regulatory_compliance(user_id);
CREATE INDEX idx_tax_compliance_user_year ON public.tax_compliance_records(user_id, tax_year);

-- Insert initial legal documents
INSERT INTO public.legal_documents (document_type, version, title, content, summary, is_active, effective_date) VALUES
('terms', '2.0', 'Terms of Service', 'See full terms page', 'Updated for Saskatchewan/Canada compliance', true, now()),
('privacy', '2.0', 'Privacy Policy', 'See full privacy page', 'PIPEDA compliant privacy policy', true, now()),
('contractor_agreement', '1.0', 'Independent Contractor Agreement', 'See full agreement page', 'Contractor classification and obligations', true, now()),
('dispute_policy', '1.0', 'Dispute Resolution Policy', 'See full policy page', 'Mediation and arbitration procedures', true, now()),
('waiver', '1.0', 'Liability Waiver', 'See full waiver page', 'Limitation of liability and indemnification', true, now());

-- Insert Saskatchewan insurance requirements
INSERT INTO public.insurance_requirements (category, province, requirement_type, minimum_coverage, is_mandatory, description, legal_reference) VALUES
('construction', 'SK', 'wcb', 0, true, 'Workers Compensation Board coverage required for construction work', 'Saskatchewan Workers Compensation Act'),
('construction', 'SK', 'liability', 1000000, true, 'Commercial General Liability insurance minimum $1M', 'Industry standard'),
('cleaning', 'SK', 'liability', 500000, false, 'Recommended liability coverage for cleaning services', 'Industry recommendation'),
('moving', 'SK', 'liability', 1000000, true, 'Liability insurance required for moving services', 'Industry standard'),
('moving', 'SK', 'vehicle', 2000000, true, 'Commercial vehicle insurance for moving trucks', 'Saskatchewan Auto Fund requirements'),
('delivery', 'SK', 'vehicle', 1000000, true, 'Commercial delivery vehicle insurance', 'Saskatchewan Auto Fund requirements'),
('handyman', 'SK', 'liability', 500000, false, 'Recommended liability coverage', 'Industry recommendation'),
('electrical', 'SK', 'wcb', 0, true, 'WCB coverage mandatory for electrical work', 'Saskatchewan Workers Compensation Act'),
('electrical', 'SK', 'professional', 1000000, true, 'Professional liability for licensed electricians', 'Saskatchewan Electrical Licensing'),
('plumbing', 'SK', 'wcb', 0, true, 'WCB coverage mandatory for plumbing work', 'Saskatchewan Workers Compensation Act');

-- Trigger for updated_at
CREATE TRIGGER update_legal_documents_updated_at
BEFORE UPDATE ON public.legal_documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_regulatory_compliance_updated_at
BEFORE UPDATE ON public.regulatory_compliance
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_compliance_updated_at
BEFORE UPDATE ON public.tax_compliance_records
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dispute_resolution_updated_at
BEFORE UPDATE ON public.dispute_resolution_records
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();