-- Add skills and experience tracking to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience_years integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_categories text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hourly_rate numeric;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS availability_status text DEFAULT 'available';

-- Update payments table to support escrow system
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS escrow_status text DEFAULT 'held';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS released_at timestamp with time zone;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS tax_deducted numeric DEFAULT 0;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON public.profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_categories ON public.profiles USING GIN(preferred_categories);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON public.tasks(category);

-- Add payment agreement status to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_agreed boolean DEFAULT false;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS agreed_at timestamp with time zone;