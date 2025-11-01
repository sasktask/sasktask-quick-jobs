-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'booking', 'message', 'payment', 'review', 'system'
  read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tasker_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tasker_id)
);

-- Create service_packages table
CREATE TABLE public.service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tasker_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  estimated_hours NUMERIC,
  includes TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create task_photos table
CREATE TABLE public.task_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for favorites
CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for service_packages
CREATE POLICY "Everyone can view active packages"
  ON public.service_packages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Taskers can create own packages"
  ON public.service_packages FOR INSERT
  WITH CHECK (auth.uid() = tasker_id AND has_role(auth.uid(), 'task_doer'));

CREATE POLICY "Taskers can update own packages"
  ON public.service_packages FOR UPDATE
  USING (auth.uid() = tasker_id);

CREATE POLICY "Taskers can delete own packages"
  ON public.service_packages FOR DELETE
  USING (auth.uid() = tasker_id);

-- RLS Policies for task_photos
CREATE POLICY "Everyone can view task photos"
  ON public.task_photos FOR SELECT
  USING (true);

CREATE POLICY "Task givers can upload photos for their tasks"
  ON public.task_photos FOR INSERT
  WITH CHECK (
    auth.uid() = uploaded_by AND 
    auth.uid() IN (SELECT task_giver_id FROM tasks WHERE id = task_id)
  );

CREATE POLICY "Uploaders can delete their photos"
  ON public.task_photos FOR DELETE
  USING (auth.uid() = uploaded_by);

-- Create storage bucket for task photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('task-photos', 'task-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for task-photos
CREATE POLICY "Anyone can view task photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'task-photos');

CREATE POLICY "Authenticated users can upload task photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'task-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own task photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'task-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to send notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_link TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (p_user_id, p_title, p_message, p_type, p_link)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Trigger to create notifications on new bookings
CREATE OR REPLACE FUNCTION public.notify_new_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  task_giver UUID;
  task_title TEXT;
BEGIN
  SELECT task_giver_id, title INTO task_giver, task_title
  FROM tasks WHERE id = NEW.task_id;
  
  PERFORM create_notification(
    task_giver,
    'New Booking Request',
    'You have a new booking request for: ' || task_title,
    'booking',
    '/bookings'
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_booking_created
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_booking();

-- Trigger to create notifications on new messages
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM create_notification(
    NEW.receiver_id,
    'New Message',
    'You have a new message',
    'message',
    '/bookings'
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Update trigger for service_packages
CREATE TRIGGER update_service_packages_updated_at
  BEFORE UPDATE ON service_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();