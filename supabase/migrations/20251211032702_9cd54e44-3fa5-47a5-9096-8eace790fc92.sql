-- Fix conflicting policies on messages table

-- Drop old policies that conflict with new ones
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;

-- Ensure the correct policies exist
-- SELECT: View non-deleted messages in user's bookings (already exists)
-- The "Users can view non-deleted messages in their bookings" policy is correct

-- UPDATE: Allow users to update their own messages (for editing content)
CREATE POLICY "Users can edit their own messages"
ON public.messages
FOR UPDATE
USING (auth.uid() = sender_id AND deleted_at IS NULL)
WITH CHECK (auth.uid() = sender_id);

-- DELETE policy is not needed since we use soft delete via UPDATE