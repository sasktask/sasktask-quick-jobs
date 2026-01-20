-- Create certificates table for task doers to upload and manage their professional certifications
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  issuing_organization TEXT NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  certificate_number TEXT,
  document_url TEXT,
  is_public BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Users can view their own certificates
CREATE POLICY "Users can view their own certificates"
ON public.certificates
FOR SELECT
USING (auth.uid() = user_id);

-- Users can view public certificates of others
CREATE POLICY "Anyone can view public certificates"
ON public.certificates
FOR SELECT
USING (is_public = true);

-- Users can insert their own certificates
CREATE POLICY "Users can create their own certificates"
ON public.certificates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own certificates
CREATE POLICY "Users can update their own certificates"
ON public.certificates
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own certificates
CREATE POLICY "Users can delete their own certificates"
ON public.certificates
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_certificates_updated_at
BEFORE UPDATE ON public.certificates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for certificate documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('certificate-documents', 'certificate-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Users can upload their own certificate documents
CREATE POLICY "Users can upload certificate documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'certificate-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policy: Users can view their own certificate documents
CREATE POLICY "Users can view own certificate documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'certificate-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policy: Public certificates can be viewed by anyone
CREATE POLICY "Anyone can view public certificate documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'certificate-documents' 
  AND EXISTS (
    SELECT 1 FROM public.certificates c
    WHERE c.document_url LIKE '%' || name
    AND c.is_public = true
  )
);

-- Storage policy: Users can delete their own certificate documents
CREATE POLICY "Users can delete own certificate documents"
ON storage.objects
FOR DELETE
USING (bucket_id = 'certificate-documents' AND auth.uid()::text = (storage.foldername(name))[1]);