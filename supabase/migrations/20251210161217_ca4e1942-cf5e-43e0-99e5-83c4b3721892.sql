-- Additional security hardening

-- 1. Add rate limiting index for contact_submissions (helps prevent spam)
CREATE INDEX IF NOT EXISTS idx_contact_submissions_ip_time 
ON public.contact_submissions(ip_address, submitted_at DESC);

-- 2. Add index for newsletter rate limiting
CREATE INDEX IF NOT EXISTS idx_newsletter_ip_time 
ON public.newsletter_subscribers(ip_address, created_at DESC);

-- 3. Add unique constraint on payment_methods to prevent multiple defaults
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_methods_single_default
ON public.payment_methods(user_id) 
WHERE is_default = true;

-- 4. Add unique constraint on review_responses to prevent multiple responses
ALTER TABLE public.review_responses 
ADD CONSTRAINT unique_review_response UNIQUE (review_id);

-- 5. Add soft delete to messages (add deleted_at column if not exists)
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Update the message delete policy to use soft delete
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;

CREATE POLICY "Users can soft delete their own messages"
ON public.messages
FOR UPDATE
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);

-- Update select to not show soft-deleted messages
DROP POLICY IF EXISTS "Users can view messages in their bookings" ON public.messages;

CREATE POLICY "Users can view non-deleted messages in their bookings"
ON public.messages
FOR SELECT
USING (
  deleted_at IS NULL AND
  is_booking_participant(auth.uid(), booking_id)
);