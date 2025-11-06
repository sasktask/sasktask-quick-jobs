-- Add RLS policy for message deletion (if not already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' 
    AND policyname = 'Users can delete their own messages'
  ) THEN
    CREATE POLICY "Users can delete their own messages"
      ON public.messages FOR DELETE
      USING (auth.uid() = sender_id);
  END IF;
END $$;