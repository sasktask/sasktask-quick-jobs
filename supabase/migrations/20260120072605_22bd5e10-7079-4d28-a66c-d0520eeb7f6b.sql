-- Allow user_id to be nullable for pre-signup phone verification flow
ALTER TABLE public.phone_verifications ALTER COLUMN user_id DROP NOT NULL;