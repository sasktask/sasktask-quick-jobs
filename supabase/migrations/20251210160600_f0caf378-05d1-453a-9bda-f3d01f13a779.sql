-- Fix 1: Move pg_stat_statements extension from public to extensions schema
DROP EXTENSION IF EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements SCHEMA extensions;

-- Fix 2: Update fraud_alerts INSERT policy to only allow service role (not any authenticated user)
DROP POLICY IF EXISTS "System can insert fraud alerts" ON public.fraud_alerts;

-- Create a more restrictive policy that checks for admin role or uses service role
CREATE POLICY "Only admins can insert fraud alerts"
ON public.fraud_alerts
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix 3: Add a more secure policy for fraud_alerts to ensure only admins can view all
DROP POLICY IF EXISTS "Admins can view all fraud alerts" ON public.fraud_alerts;
CREATE POLICY "Admins can view all fraud alerts"
ON public.fraud_alerts
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow users to view fraud alerts about themselves
DROP POLICY IF EXISTS "Users can view own fraud alerts" ON public.fraud_alerts;
CREATE POLICY "Users can view own fraud alerts"
ON public.fraud_alerts
FOR SELECT
USING (auth.uid() = user_id);

-- Fix 4: Strengthen payout_accounts policies with explicit checks
DROP POLICY IF EXISTS "Users can view own payout accounts" ON public.payout_accounts;
CREATE POLICY "Users can view own payout accounts"
ON public.payout_accounts
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own payout accounts" ON public.payout_accounts;
CREATE POLICY "Users can insert own payout accounts"
ON public.payout_accounts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own payout accounts" ON public.payout_accounts;
CREATE POLICY "Users can update own payout accounts"
ON public.payout_accounts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);