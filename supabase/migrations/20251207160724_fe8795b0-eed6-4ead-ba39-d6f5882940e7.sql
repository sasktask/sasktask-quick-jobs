-- Add priority column to tasks table
ALTER TABLE public.tasks ADD COLUMN priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Create index for priority filtering
CREATE INDEX idx_tasks_priority ON public.tasks(priority);

-- Create task_bids table for bidding functionality
CREATE TABLE public.task_bids (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  bidder_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bid_amount numeric NOT NULL,
  message text,
  estimated_hours numeric,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(task_id, bidder_id)
);

-- Enable RLS
ALTER TABLE public.task_bids ENABLE ROW LEVEL SECURITY;

-- RLS policies for task_bids
CREATE POLICY "Task doers can create bids" ON public.task_bids
  FOR INSERT WITH CHECK (auth.uid() = bidder_id AND has_role(auth.uid(), 'task_doer'::app_role));

CREATE POLICY "Bidders can update their own bids" ON public.task_bids
  FOR UPDATE USING (auth.uid() = bidder_id);

CREATE POLICY "Task givers can update bids for their tasks" ON public.task_bids
  FOR UPDATE USING (auth.uid() IN (SELECT task_giver_id FROM public.tasks WHERE id = task_bids.task_id));

CREATE POLICY "Users can view bids on their tasks or own bids" ON public.task_bids
  FOR SELECT USING (
    auth.uid() = bidder_id OR 
    auth.uid() IN (SELECT task_giver_id FROM public.tasks WHERE id = task_bids.task_id)
  );

CREATE POLICY "Bidders can withdraw their bids" ON public.task_bids
  FOR DELETE USING (auth.uid() = bidder_id);

-- Trigger for updated_at
CREATE TRIGGER update_task_bids_updated_at
  BEFORE UPDATE ON public.task_bids
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for bids
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_bids;