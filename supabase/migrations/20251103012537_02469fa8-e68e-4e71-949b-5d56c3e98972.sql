-- Add payment_intent_id to payments table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'payment_intent_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN payment_intent_id text;
  END IF;
END $$;

-- Add stripe_payment_method_id to profiles table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'stripe_payment_method_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_payment_method_id text;
  END IF;
END $$;

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_payments_payment_intent_id ON payments(payment_intent_id);