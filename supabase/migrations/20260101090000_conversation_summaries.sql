-- Conversation summaries to speed up inbox loading and unread counts

CREATE TABLE IF NOT EXISTS public.conversation_summaries (
  booking_id UUID PRIMARY KEY REFERENCES public.bookings(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  task_giver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_doer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_time TIMESTAMPTZ,
  last_sender_id UUID,
  unread_for_task_giver INTEGER DEFAULT 0,
  unread_for_task_doer INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.conversation_summaries ENABLE ROW LEVEL SECURITY;

-- Task participants can view their summary
CREATE POLICY "Participants can view conversation summaries"
ON public.conversation_summaries
FOR SELECT
USING (
  auth.uid() IN (task_giver_id, task_doer_id)
);

-- Task giver can update summary
CREATE POLICY "Task giver can update conversation summary"
ON public.conversation_summaries
FOR UPDATE
USING (auth.uid() = task_giver_id)
WITH CHECK (auth.uid() = task_giver_id);

-- Task doer can update summary
CREATE POLICY "Task doer can update conversation summary"
ON public.conversation_summaries
FOR UPDATE
USING (auth.uid() = task_doer_id)
WITH CHECK (auth.uid() = task_doer_id);

-- System/service role can insert
CREATE POLICY "System can insert conversation summary"
ON public.conversation_summaries
FOR INSERT
WITH CHECK (true);

-- Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION public.touch_conversation_summaries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trig_touch_conversation_summaries_updated_at ON public.conversation_summaries;
CREATE TRIGGER trig_touch_conversation_summaries_updated_at
BEFORE UPDATE ON public.conversation_summaries
FOR EACH ROW
EXECUTE FUNCTION public.touch_conversation_summaries_updated_at();

