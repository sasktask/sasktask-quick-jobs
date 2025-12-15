-- Add deposit tracking columns to tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS deposit_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_paid boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS deposit_paid_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS deposit_payment_intent_id text,
ADD COLUMN IF NOT EXISTS requires_deposit boolean DEFAULT false;

-- Add remaining payment tracking to payments table
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS is_deposit boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS deposit_refunded boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS deposit_refund_id text;

-- Add deposit info to bookings for when tasker is accepted
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS deposit_paid boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS full_payment_paid boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS full_payment_at timestamp with time zone;