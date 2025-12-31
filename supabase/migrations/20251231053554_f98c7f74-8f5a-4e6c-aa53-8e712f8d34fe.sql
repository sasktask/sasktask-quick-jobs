-- =====================================================
-- IMMEDIATE RLS SECURITY FIX + DATA SEPARATION
-- =====================================================

-- 1. Drop existing potentially permissive RLS policies on profiles
DROP POLICY IF EXISTS "Admins can update user verification" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- 2. Create strict RLS policies with explicit auth.uid() IS NOT NULL checks
CREATE POLICY "Users can view own profile securely"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "Users can update own profile securely"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "Users can insert own profile securely"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

-- 3. Admin policy for verification updates
CREATE POLICY "Admins can update user verification securely"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- CREATE SEPARATE TABLES FOR SENSITIVE DATA
-- =====================================================

-- 4. Create user_financial_data table
CREATE TABLE IF NOT EXISTS public.user_financial_data (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_balance NUMERIC DEFAULT 0,
    minimum_balance_met BOOLEAN DEFAULT false,
    stripe_customer_id TEXT,
    stripe_payment_method_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Create user_security_settings table
CREATE TABLE IF NOT EXISTS public.user_security_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    two_factor_enabled BOOLEAN DEFAULT false,
    security_questions_set BOOLEAN DEFAULT false,
    last_password_change TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP WITH TIME ZONE,
    security_notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Enable RLS on new tables
ALTER TABLE public.user_financial_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_security_settings ENABLE ROW LEVEL SECURITY;

-- 7. Create strict RLS policies for user_financial_data
CREATE POLICY "Users can view own financial data"
ON public.user_financial_data
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update own financial data"
ON public.user_financial_data
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can insert own financial data"
ON public.user_financial_data
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 8. Create strict RLS policies for user_security_settings
CREATE POLICY "Users can view own security settings"
ON public.user_security_settings
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update own security settings"
ON public.user_security_settings
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can insert own security settings"
ON public.user_security_settings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 9. Migrate existing data from profiles to new tables
INSERT INTO public.user_financial_data (user_id, wallet_balance, minimum_balance_met, stripe_customer_id, stripe_payment_method_id)
SELECT id, wallet_balance, minimum_balance_met, stripe_customer_id, stripe_payment_method_id
FROM public.profiles
WHERE id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_security_settings (user_id, two_factor_enabled, security_questions_set, last_password_change, failed_login_attempts, account_locked_until, security_notifications_enabled)
SELECT id, two_factor_enabled, security_questions_set, last_password_change, failed_login_attempts, account_locked_until, security_notifications_enabled
FROM public.profiles
WHERE id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- 10. Create triggers for updated_at on new tables
CREATE TRIGGER update_user_financial_data_updated_at
BEFORE UPDATE ON public.user_financial_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_security_settings_updated_at
BEFORE UPDATE ON public.user_security_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();