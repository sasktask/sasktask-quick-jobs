-- Add geolocation to tasks and profiles
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS location_details JSONB;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;

-- Create availability slots table for scheduling
CREATE TABLE IF NOT EXISTS public.availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create recurring tasks table
CREATE TABLE IF NOT EXISTS public.recurring_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  start_date DATE NOT NULL,
  end_date DATE,
  next_occurrence DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('booking_confirmation', 'task_reminder', 'payment_due', 'review_reminder')),
  reminder_time TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  send_method TEXT NOT NULL DEFAULT 'notification' CHECK (send_method IN ('notification', 'email', 'sms', 'all')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create SMS logs table
CREATE TABLE IF NOT EXISTS public.sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  provider_response JSONB,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for availability_slots
CREATE POLICY "Users can manage their own availability slots"
  ON public.availability_slots FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view availability slots"
  ON public.availability_slots FOR SELECT
  USING (true);

-- RLS Policies for recurring_tasks
CREATE POLICY "Task givers can manage recurring tasks"
  ON public.recurring_tasks FOR ALL
  USING (auth.uid() IN (
    SELECT task_giver_id FROM public.tasks WHERE id = recurring_tasks.task_id
  ))
  WITH CHECK (auth.uid() IN (
    SELECT task_giver_id FROM public.tasks WHERE id = recurring_tasks.task_id
  ));

CREATE POLICY "Anyone can view active recurring tasks"
  ON public.recurring_tasks FOR SELECT
  USING (is_active = true);

-- RLS Policies for reminders
CREATE POLICY "Users can view their own reminders"
  ON public.reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert reminders"
  ON public.reminders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own reminders"
  ON public.reminders FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for sms_logs
CREATE POLICY "Users can view their own SMS logs"
  ON public.sms_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert SMS logs"
  ON public.sms_logs FOR INSERT
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_tasks_location ON public.tasks(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_profiles_location ON public.profiles(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_availability_slots_user_id ON public.availability_slots(user_id);
CREATE INDEX idx_recurring_tasks_next_occurrence ON public.recurring_tasks(next_occurrence) WHERE is_active = true;
CREATE INDEX idx_reminders_reminder_time ON public.reminders(reminder_time) WHERE status = 'pending';

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
DECLARE
  earth_radius CONSTANT DECIMAL := 6371; -- Earth's radius in kilometers
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  -- Convert degrees to radians
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  -- Haversine formula
  a := sin(dlat/2) * sin(dlat/2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dlon/2) * sin(dlon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN earth_radius * c;
END;
$$;

-- Function to update next occurrence for recurring tasks
CREATE OR REPLACE FUNCTION update_recurring_task_occurrence()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Calculate next occurrence based on frequency
  CASE NEW.frequency
    WHEN 'daily' THEN
      NEW.next_occurrence := NEW.next_occurrence + INTERVAL '1 day';
    WHEN 'weekly' THEN
      NEW.next_occurrence := NEW.next_occurrence + INTERVAL '7 days';
    WHEN 'biweekly' THEN
      NEW.next_occurrence := NEW.next_occurrence + INTERVAL '14 days';
    WHEN 'monthly' THEN
      NEW.next_occurrence := NEW.next_occurrence + INTERVAL '1 month';
  END CASE;
  
  -- Deactivate if past end_date
  IF NEW.end_date IS NOT NULL AND NEW.next_occurrence > NEW.end_date THEN
    NEW.is_active := false;
  END IF;
  
  RETURN NEW;
END;
$$;