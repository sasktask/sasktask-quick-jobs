-- Add pending_email column to phone_verifications table for pre-signup verification flow

ALTER TABLE public.phone_verifications
ADD COLUMN IF NOT EXISTS pending_email text;

CREATE INDEX IF NOT EXISTS idx_phone_verifications_pending_email ON public.phone_verifications(pending_email);