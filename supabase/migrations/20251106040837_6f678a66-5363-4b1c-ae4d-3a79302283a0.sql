-- Add reply_to_id column to messages table to support message replies
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL;

-- Create index for better performance when querying replies
CREATE INDEX IF NOT EXISTS idx_messages_reply_to_id ON public.messages(reply_to_id);

-- Add comment for documentation
COMMENT ON COLUMN public.messages.reply_to_id IS 'References the message being replied to, creating a conversation thread';