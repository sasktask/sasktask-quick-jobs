-- Fix SECURITY DEFINER view by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.pending_auto_releases;
CREATE VIEW public.pending_auto_releases WITH (security_invoker = true) AS
SELECT 
    p.id AS payment_id,
    p.booking_id,
    p.task_id,
    p.amount,
    p.payout_amount,
    p.payee_id,
    p.payer_id,
    p.auto_release_at,
    p.task_giver_confirmed,
    p.task_doer_confirmed,
    (EXTRACT(epoch FROM (p.auto_release_at - now())) / 3600) AS hours_until_release,
    b.status AS booking_status,
    t.title AS task_title
FROM payments p
JOIN bookings b ON b.id = p.booking_id
JOIN tasks t ON t.id = p.task_id
LEFT JOIN disputes d ON d.booking_id = p.booking_id AND d.status IN ('open', 'investigating')
WHERE p.escrow_status = 'held' 
AND p.auto_release_at IS NOT NULL 
AND d.id IS NULL;

-- Fix public_profiles view to use SECURITY INVOKER  
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles WITH (security_invoker = true) AS
SELECT 
    id,
    full_name,
    avatar_url,
    bio,
    rating,
    total_reviews,
    created_at,
    updated_at
FROM profiles;

-- Fix overly permissive OTP policies - restrict to service role only
DROP POLICY IF EXISTS "Service role can insert OTP codes" ON public.otp_codes;
DROP POLICY IF EXISTS "Service role can update OTP codes" ON public.otp_codes;

CREATE POLICY "Service role can manage OTP codes" 
ON public.otp_codes 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Add RLS policy for signup_verifications table (was missing policies)
CREATE POLICY "Service role can manage signup verifications" 
ON public.signup_verifications 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view their own verification" 
ON public.signup_verifications 
FOR SELECT 
TO authenticated
USING (email = auth.email());

-- Make system insert policies more secure by restricting to service_role
DROP POLICY IF EXISTS "System can insert reminders" ON public.reminders;
CREATE POLICY "Service role can insert reminders" 
ON public.reminders 
FOR INSERT 
TO service_role
WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert SMS logs" ON public.sms_logs;
CREATE POLICY "Service role can insert SMS logs" 
ON public.sms_logs 
FOR INSERT 
TO service_role
WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert alerts" ON public.task_alerts;
CREATE POLICY "Service role can insert alerts" 
ON public.task_alerts 
FOR INSERT 
TO service_role
WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert tax calculations" ON public.tax_calculations;
CREATE POLICY "Service role can insert tax calculations" 
ON public.tax_calculations 
FOR INSERT 
TO service_role
WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert activity logs" ON public.user_activity_logs;
CREATE POLICY "Service role can insert activity logs" 
ON public.user_activity_logs 
FOR INSERT 
TO service_role
WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Service role can insert wallet transactions" 
ON public.wallet_transactions 
FOR INSERT 
TO service_role
WITH CHECK (true);