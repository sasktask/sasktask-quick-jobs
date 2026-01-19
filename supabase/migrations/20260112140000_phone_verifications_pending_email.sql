-- Allow pre-signup phone verification by letting user_id be nullable and tracking pending email
ALTER TABLE public.phone_verifications
ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.phone_verifications
ADD COLUMN IF NOT EXISTS pending_email text;

CREATE INDEX IF NOT EXISTS idx_phone_verifications_pending_email ON public.phone_verifications(pending_email);
