-- Create storage bucket for work completion evidence
INSERT INTO storage.buckets (id, name, public)
VALUES ('work-evidence', 'work-evidence', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for dispute evidence
INSERT INTO storage.buckets (id, name, public)
VALUES ('dispute-evidence', 'dispute-evidence', true)
ON CONFLICT (id) DO NOTHING;

-- Create work_evidence table to track completion proof
CREATE TABLE IF NOT EXISTS public.work_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL,
  evidence_type TEXT NOT NULL DEFAULT 'completion', -- 'before', 'during', 'completion', 'after'
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  caption TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dispute_evidence table
CREATE TABLE IF NOT EXISTS public.dispute_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL,
  evidence_type TEXT NOT NULL DEFAULT 'document', -- 'photo', 'video', 'document', 'screenshot', 'chat_export'
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on work_evidence
ALTER TABLE public.work_evidence ENABLE ROW LEVEL SECURITY;

-- Enable RLS on dispute_evidence
ALTER TABLE public.dispute_evidence ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view evidence for bookings they're part of
CREATE POLICY "Users can view work evidence for their bookings"
ON public.work_evidence
FOR SELECT
TO authenticated
USING (
  uploaded_by = auth.uid() OR
  booking_id IN (
    SELECT b.id FROM public.bookings b
    JOIN public.tasks t ON t.id = b.task_id
    WHERE b.task_doer_id = auth.uid() OR t.task_giver_id = auth.uid()
  )
);

-- RLS: Users can upload their own evidence
CREATE POLICY "Users can upload work evidence"
ON public.work_evidence
FOR INSERT
TO authenticated
WITH CHECK (
  uploaded_by = auth.uid() AND
  booking_id IN (
    SELECT b.id FROM public.bookings b
    JOIN public.tasks t ON t.id = b.task_id
    WHERE b.task_doer_id = auth.uid() OR t.task_giver_id = auth.uid()
  )
);

-- RLS: Users can view dispute evidence for disputes they're involved in
CREATE POLICY "Users can view dispute evidence they're involved in"
ON public.dispute_evidence
FOR SELECT
TO authenticated
USING (
  uploaded_by = auth.uid() OR
  dispute_id IN (
    SELECT id FROM public.disputes WHERE raised_by = auth.uid() OR against_user = auth.uid()
  )
);

-- RLS: Users can upload evidence to disputes they're involved in
CREATE POLICY "Users can upload dispute evidence"
ON public.dispute_evidence
FOR INSERT
TO authenticated
WITH CHECK (
  uploaded_by = auth.uid() AND
  dispute_id IN (
    SELECT id FROM public.disputes WHERE raised_by = auth.uid() OR against_user = auth.uid()
  )
);

-- Storage policies for work-evidence bucket
CREATE POLICY "Authenticated users can upload work evidence"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'work-evidence');

CREATE POLICY "Anyone can view work evidence"
ON storage.objects
FOR SELECT
USING (bucket_id = 'work-evidence');

-- Storage policies for dispute-evidence bucket
CREATE POLICY "Authenticated users can upload dispute evidence"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'dispute-evidence');

CREATE POLICY "Anyone can view dispute evidence"
ON storage.objects
FOR SELECT
USING (bucket_id = 'dispute-evidence');

-- Add evidence_required field to bookings to track if doer uploaded proof
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS completion_evidence_uploaded BOOLEAN DEFAULT false;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS evidence_count INTEGER DEFAULT 0;