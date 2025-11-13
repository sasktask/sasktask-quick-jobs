-- Create message_reactions table for emoji reactions
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, reaction)
);

-- Create pinned_messages table
CREATE TABLE IF NOT EXISTS public.pinned_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  pinned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pinned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id)
);

-- Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pinned_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for message_reactions
CREATE POLICY "Users can view reactions on their messages"
  ON public.message_reactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.messages
      WHERE messages.id = message_reactions.message_id
      AND (messages.sender_id = auth.uid() OR messages.receiver_id = auth.uid())
    )
  );

CREATE POLICY "Users can add reactions to their messages"
  ON public.message_reactions
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.messages
      WHERE messages.id = message_reactions.message_id
      AND (messages.sender_id = auth.uid() OR messages.receiver_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete their own reactions"
  ON public.message_reactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for pinned_messages
CREATE POLICY "Users can view pinned messages in their bookings"
  ON public.pinned_messages
  FOR SELECT
  USING (
    is_booking_participant(auth.uid(), booking_id)
  );

CREATE POLICY "Users can pin messages in their bookings"
  ON public.pinned_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = pinned_by
    AND is_booking_participant(auth.uid(), booking_id)
  );

CREATE POLICY "Users can unpin their own pins"
  ON public.pinned_messages
  FOR DELETE
  USING (
    auth.uid() = pinned_by
  );

-- Create indexes for performance
CREATE INDEX idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX idx_message_reactions_user_id ON public.message_reactions(user_id);
CREATE INDEX idx_pinned_messages_booking_id ON public.pinned_messages(booking_id);
CREATE INDEX idx_pinned_messages_message_id ON public.pinned_messages(message_id);

-- Enable realtime for reactions and pins
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pinned_messages;