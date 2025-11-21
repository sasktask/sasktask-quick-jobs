-- Add missing fields to tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS estimated_duration NUMERIC,
ADD COLUMN IF NOT EXISTS budget_type TEXT DEFAULT 'fixed' CHECK (budget_type IN ('fixed', 'hourly'));

COMMENT ON COLUMN public.tasks.estimated_duration IS 'Estimated duration in hours';
COMMENT ON COLUMN public.tasks.budget_type IS 'Budget type: fixed or hourly';

-- Create portfolio_items table for task doers
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  completed_date DATE,
  client_name TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- RLS for portfolio_items
CREATE POLICY "Anyone can view portfolio items"
ON public.portfolio_items FOR SELECT
USING (true);

CREATE POLICY "Users can create own portfolio items"
ON public.portfolio_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio items"
ON public.portfolio_items FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolio items"
ON public.portfolio_items FOR DELETE
USING (auth.uid() = user_id);

-- Create skill_endorsements table
CREATE TABLE IF NOT EXISTS public.skill_endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  skill TEXT NOT NULL,
  endorsed_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, skill, endorsed_by)
);

ALTER TABLE public.skill_endorsements ENABLE ROW LEVEL SECURITY;

-- RLS for skill_endorsements
CREATE POLICY "Anyone can view skill endorsements"
ON public.skill_endorsements FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can endorse skills"
ON public.skill_endorsements FOR INSERT
WITH CHECK (auth.uid() = endorsed_by AND auth.uid() != user_id);

CREATE POLICY "Users can remove their own endorsements"
ON public.skill_endorsements FOR DELETE
USING (auth.uid() = endorsed_by);

-- Update RLS policies for tasks table to ensure proper access
DROP POLICY IF EXISTS "Task givers can create tasks" ON public.tasks;
CREATE POLICY "Task givers can create tasks"
ON public.tasks FOR INSERT
WITH CHECK (auth.uid() = task_giver_id);

DROP POLICY IF EXISTS "Task givers can update their tasks" ON public.tasks;
CREATE POLICY "Task givers can update their tasks"
ON public.tasks FOR UPDATE
USING (auth.uid() = task_giver_id);

DROP POLICY IF EXISTS "Task givers can delete their tasks" ON public.tasks;
CREATE POLICY "Task givers can delete their tasks"
ON public.tasks FOR DELETE
USING (auth.uid() = task_giver_id);

-- Trigger for portfolio_items updated_at
CREATE OR REPLACE TRIGGER update_portfolio_items_updated_at
BEFORE UPDATE ON public.portfolio_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();