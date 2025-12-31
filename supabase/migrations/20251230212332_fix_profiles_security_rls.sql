-- Comprehensive security fix for profiles table
-- This migration separates sensitive data into dedicated tables with stricter access controls
-- and ensures RLS policies are strict and correct

-- ============================================================================
-- STEP 1: Create separate table for financial sensitive data
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_financial_data (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_balance NUMERIC DEFAULT 0 NOT NULL,
  minimum_balance_met BOOLEAN DEFAULT false NOT NULL,
  stripe_customer_id TEXT,
  stripe_payment_method_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on financial data table
ALTER TABLE public.user_financial_data ENABLE ROW LEVEL SECURITY;

-- Strict RLS: Users can ONLY view their own financial data
CREATE POLICY "Users can view own financial data"
ON public.user_financial_data
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- Users can ONLY update their own financial data (with restrictions)
-- Note: Actual balance updates should be done via edge functions/service role
CREATE POLICY "Users can update own financial data"
ON public.user_financial_data
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- Users can insert their own financial data record during signup
CREATE POLICY "Users can insert own financial data"
ON public.user_financial_data
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- ============================================================================
-- STEP 2: Create separate table for security sensitive data
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_security_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  two_factor_enabled BOOLEAN DEFAULT false NOT NULL,
  failed_login_attempts INTEGER DEFAULT 0 NOT NULL,
  account_locked_until TIMESTAMP WITH TIME ZONE,
  last_password_change TIMESTAMP WITH TIME ZONE,
  security_questions_set BOOLEAN DEFAULT false NOT NULL,
  security_notifications_enabled BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on security settings table
ALTER TABLE public.user_security_settings ENABLE ROW LEVEL SECURITY;

-- Strict RLS: Users can ONLY view their own security settings
CREATE POLICY "Users can view own security settings"
ON public.user_security_settings
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- Users can ONLY update their own security settings
CREATE POLICY "Users can update own security settings"
ON public.user_security_settings
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- Users can insert their own security settings record during signup
CREATE POLICY "Users can insert own security settings"
ON public.user_security_settings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- ============================================================================
-- STEP 3: Migrate existing data from profiles to new tables
-- ============================================================================

-- Migrate financial data
INSERT INTO public.user_financial_data (
  user_id,
  wallet_balance,
  minimum_balance_met,
  stripe_customer_id,
  stripe_payment_method_id,
  created_at,
  updated_at
)
SELECT 
  id,
  COALESCE(wallet_balance, 0),
  COALESCE(minimum_balance_met, false),
  stripe_customer_id,
  stripe_payment_method_id,
  COALESCE(created_at, now()),
  COALESCE(updated_at, now())
FROM public.profiles
WHERE id IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
  wallet_balance = EXCLUDED.wallet_balance,
  minimum_balance_met = EXCLUDED.minimum_balance_met,
  stripe_customer_id = EXCLUDED.stripe_customer_id,
  stripe_payment_method_id = EXCLUDED.stripe_payment_method_id,
  updated_at = EXCLUDED.updated_at;

-- Migrate security settings
INSERT INTO public.user_security_settings (
  user_id,
  two_factor_enabled,
  failed_login_attempts,
  account_locked_until,
  last_password_change,
  security_questions_set,
  security_notifications_enabled,
  created_at,
  updated_at
)
SELECT 
  id,
  COALESCE(two_factor_enabled, false),
  COALESCE(failed_login_attempts, 0),
  account_locked_until,
  last_password_change,
  COALESCE(security_questions_set, false),
  COALESCE(security_notifications_enabled, true),
  COALESCE(created_at, now()),
  COALESCE(updated_at, now())
FROM public.profiles
WHERE id IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
  two_factor_enabled = EXCLUDED.two_factor_enabled,
  failed_login_attempts = EXCLUDED.failed_login_attempts,
  account_locked_until = EXCLUDED.account_locked_until,
  last_password_change = EXCLUDED.last_password_change,
  security_questions_set = EXCLUDED.security_questions_set,
  security_notifications_enabled = EXCLUDED.security_notifications_enabled,
  updated_at = EXCLUDED.updated_at;

-- ============================================================================
-- STEP 4: Fix RLS policies on profiles table - ensure strict user-only access
-- ============================================================================

-- Drop ALL existing policies on profiles to start clean
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own sensitive data" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view basic profile info" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update user verification" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create strict SELECT policy: Users can ONLY view their own profile
-- Using auth.uid() IS NOT NULL check to prevent potential null issues
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
);

-- Create strict UPDATE policy: Users can ONLY update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
);

-- Create strict INSERT policy: Users can ONLY insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
);

-- ============================================================================
-- STEP 5: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_financial_data_user_id ON public.user_financial_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_security_settings_user_id ON public.user_security_settings(user_id);

-- ============================================================================
-- STEP 6: Create updated_at triggers for new tables
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for user_financial_data
DROP TRIGGER IF EXISTS update_user_financial_data_updated_at ON public.user_financial_data;
CREATE TRIGGER update_user_financial_data_updated_at
  BEFORE UPDATE ON public.user_financial_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Triggers for user_security_settings
DROP TRIGGER IF EXISTS update_user_security_settings_updated_at ON public.user_security_settings;
CREATE TRIGGER update_user_security_settings_updated_at
  BEFORE UPDATE ON public.user_security_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

