-- Payment methods table for storing customer cards
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_method_id text NOT NULL,
  card_brand text,
  card_last4 text,
  card_exp_month integer,
  card_exp_year integer,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Payout accounts table for task doers to receive money
CREATE TABLE IF NOT EXISTS public.payout_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_account_id text NOT NULL UNIQUE,
  account_status text DEFAULT 'pending',
  account_type text,
  bank_last4 text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Cancellation records table
CREATE TABLE IF NOT EXISTS public.cancellations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.tasks(id),
  cancelled_by uuid NOT NULL REFERENCES auth.users(id),
  cancellation_reason text,
  cancellation_fee numeric DEFAULT 0,
  stripe_refund_id text,
  created_at timestamp with time zone DEFAULT now()
);

-- Add cancellation tracking to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cancellation_count integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cancellation_rate numeric DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reliability_score numeric DEFAULT 100;

-- Add stripe customer ID to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Enable RLS on new tables
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancellations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_methods
CREATE POLICY "Users can view own payment methods" ON public.payment_methods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods" ON public.payment_methods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods" ON public.payment_methods
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods" ON public.payment_methods
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for payout_accounts
CREATE POLICY "Users can view own payout accounts" ON public.payout_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payout accounts" ON public.payout_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payout accounts" ON public.payout_accounts
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for cancellations
CREATE POLICY "Users can view cancellations they're involved in" ON public.cancellations
  FOR SELECT USING (
    auth.uid() = cancelled_by OR
    auth.uid() IN (
      SELECT task_doer_id FROM bookings WHERE id = booking_id
      UNION
      SELECT task_giver_id FROM tasks WHERE id = task_id
    )
  );

CREATE POLICY "Users can create cancellations for their bookings" ON public.cancellations
  FOR INSERT WITH CHECK (auth.uid() = cancelled_by);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payout_accounts_user_id ON public.payout_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellations_booking_id ON public.cancellations(booking_id);

-- Add cancellation status to booking_status enum if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status' AND typcategory = 'E') THEN
    CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'rejected', 'cancelled');
  END IF;
END $$;