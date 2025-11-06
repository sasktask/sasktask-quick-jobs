-- Add edited_at column to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE;

-- Create message_edit_history table to track all edits
CREATE TABLE IF NOT EXISTS public.message_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  previous_content TEXT NOT NULL,
  edited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  edited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.message_edit_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for message_edit_history
CREATE POLICY "Users can view edit history for their messages"
  ON public.message_edit_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.messages
      WHERE messages.id = message_edit_history.message_id
      AND (messages.sender_id = auth.uid() OR messages.receiver_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert edit history for their messages"
  ON public.message_edit_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.messages
      WHERE messages.id = message_edit_history.message_id
      AND messages.sender_id = auth.uid()
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_message_edit_history_message_id ON public.message_edit_history(message_id);
CREATE INDEX IF NOT EXISTS idx_message_edit_history_edited_at ON public.message_edit_history(edited_at DESC);

-- Add comment for documentation
COMMENT ON TABLE public.message_edit_history IS 'Tracks the complete edit history of messages, storing previous versions whenever a message is edited';
COMMENT ON COLUMN public.messages.edited_at IS 'Timestamp of the last edit made to the message';