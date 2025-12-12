-- Allow receivers to mark messages as read
CREATE POLICY "Receivers can mark messages as read" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = receiver_id AND deleted_at IS NULL)
WITH CHECK (auth.uid() = receiver_id);