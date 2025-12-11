-- Performance Indexes for better query speed

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_booking_created 
ON public.messages(booking_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_receiver_unread 
ON public.messages(receiver_id, read_at) 
WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_messages_sender_id 
ON public.messages(sender_id);

-- Bookings table indexes
CREATE INDEX IF NOT EXISTS idx_bookings_task_doer 
ON public.bookings(task_doer_id, status);

CREATE INDEX IF NOT EXISTS idx_bookings_task_id 
ON public.bookings(task_id);

-- Tasks table indexes
CREATE INDEX IF NOT EXISTS idx_tasks_giver_status 
ON public.tasks(task_giver_id, status);

CREATE INDEX IF NOT EXISTS idx_tasks_category_status 
ON public.tasks(category, status) 
WHERE status = 'open';

CREATE INDEX IF NOT EXISTS idx_tasks_location 
ON public.tasks(latitude, longitude) 
WHERE status = 'open';

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_city_rating 
ON public.profiles(city, rating DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_last_seen 
ON public.profiles(last_seen DESC);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee 
ON public.reviews(reviewee_id, created_at DESC);

-- Add online status column to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;