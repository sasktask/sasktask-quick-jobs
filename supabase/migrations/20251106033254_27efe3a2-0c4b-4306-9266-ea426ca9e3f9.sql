-- Create typing_indicators table for real-time typing status
CREATE TABLE IF NOT EXISTS public.typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_typing BOOLEAN DEFAULT false,
  last_typed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index to prevent duplicate typing indicators
CREATE UNIQUE INDEX idx_typing_booking_user ON public.typing_indicators(booking_id, user_id);

-- Enable RLS
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- Typing indicators policies
CREATE POLICY "Users can view typing indicators for their bookings"
  ON public.typing_indicators
  FOR SELECT
  USING (is_booking_participant(auth.uid(), booking_id));

CREATE POLICY "Users can insert own typing indicators"
  ON public.typing_indicators
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_booking_participant(auth.uid(), booking_id));

CREATE POLICY "Users can update own typing indicators"
  ON public.typing_indicators
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add index for efficient queries
CREATE INDEX idx_typing_booking ON public.typing_indicators(booking_id);
CREATE INDEX idx_typing_user ON public.typing_indicators(user_id);

-- Enable realtime for typing indicators
ALTER TABLE public.typing_indicators REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;