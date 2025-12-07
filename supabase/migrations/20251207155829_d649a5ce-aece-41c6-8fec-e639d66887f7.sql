-- Add expires_at column to tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;

-- Add reminder_sent column to track if expiry reminder was sent
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS expiry_reminder_sent boolean DEFAULT false;

-- Create index for efficient expiration queries
CREATE INDEX IF NOT EXISTS idx_tasks_expires_at ON public.tasks(expires_at) WHERE expires_at IS NOT NULL AND status = 'open';

-- Create user_task_templates table for user-saved templates
CREATE TABLE IF NOT EXISTS public.user_task_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  location text,
  pay_amount numeric,
  budget_type text DEFAULT 'fixed',
  estimated_duration numeric,
  tools_provided boolean DEFAULT false,
  tools_description text,
  is_default boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_task_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_task_templates
CREATE POLICY "Users can view own templates" 
ON public.user_task_templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own templates" 
ON public.user_task_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" 
ON public.user_task_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" 
ON public.user_task_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_task_templates_updated_at
BEFORE UPDATE ON public.user_task_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();