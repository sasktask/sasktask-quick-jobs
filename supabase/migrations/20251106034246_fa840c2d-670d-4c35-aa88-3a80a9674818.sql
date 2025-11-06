-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-attachments',
  'message-attachments',
  false,
  10485760, -- 10MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'audio/webm',
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip'
  ]
);

-- Create message_attachments table
CREATE TABLE IF NOT EXISTS public.message_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  attachment_type TEXT NOT NULL CHECK (attachment_type IN ('image', 'file', 'voice')),
  duration INTEGER, -- for voice notes in seconds
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- Users can view attachments for messages they have access to
CREATE POLICY "Users can view attachments for their messages"
  ON public.message_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.messages
      WHERE messages.id = message_attachments.message_id
      AND (messages.sender_id = auth.uid() OR messages.receiver_id = auth.uid())
    )
  );

-- Users can create attachments for their own messages
CREATE POLICY "Users can create attachments for their messages"
  ON public.message_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.messages
      WHERE messages.id = message_attachments.message_id
      AND messages.sender_id = auth.uid()
    )
  );

-- Users can delete their own message attachments
CREATE POLICY "Users can delete their own message attachments"
  ON public.message_attachments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.messages
      WHERE messages.id = message_attachments.message_id
      AND messages.sender_id = auth.uid()
    )
  );

-- Storage policies for message attachments
CREATE POLICY "Users can view attachments for their conversations"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'message-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'message-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'message-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add index for faster queries
CREATE INDEX idx_message_attachments_message_id ON public.message_attachments(message_id);
CREATE INDEX idx_message_attachments_type ON public.message_attachments(attachment_type);