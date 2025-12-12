-- Add policy to allow reviewees to respond to their reviews
CREATE POLICY "Reviewees can respond to their reviews"
ON reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = reviewee_id)
WITH CHECK (auth.uid() = reviewee_id);