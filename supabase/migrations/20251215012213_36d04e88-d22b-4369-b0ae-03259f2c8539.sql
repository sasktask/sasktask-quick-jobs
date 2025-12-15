-- Add wallet_balance to profiles for holding user funds
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS wallet_balance numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS minimum_balance_met boolean DEFAULT false;

-- Create wallet transactions table to track deposits, withdrawals, and penalties
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  transaction_type text NOT NULL, -- 'deposit', 'withdrawal', 'penalty', 'refund', 'earning'
  description text,
  related_booking_id uuid REFERENCES public.bookings(id),
  related_task_id uuid REFERENCES public.tasks(id),
  balance_after numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on wallet_transactions
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own wallet transactions"
ON public.wallet_transactions FOR SELECT
USING (auth.uid() = user_id);

-- System can insert transactions (via service role)
CREATE POLICY "System can insert wallet transactions"
ON public.wallet_transactions FOR INSERT
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions(created_at DESC);