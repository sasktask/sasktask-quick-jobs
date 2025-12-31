-- ============================================================================
-- IMPORTANT: DO NOT RUN THIS MIGRATION YET!
-- ============================================================================
-- This migration removes sensitive columns from profiles table after data migration.
-- This should be run AFTER the codebase has been updated to use the new tables:
--   - user_financial_data table for financial data (wallet_balance, stripe_customer_id, etc.)
--   - user_security_settings table for security data (two_factor_enabled, failed_login_attempts, etc.)
--
-- Before running this migration:
-- 1. Update all application code to use the new tables
-- 2. Test thoroughly that all features work with the new tables
-- 3. Ensure no code references the old columns on profiles table
-- 4. Keep this migration as a reminder to clean up after code migration
-- ============================================================================

-- ============================================================================
-- NOTE: This migration removes sensitive columns from profiles table
-- Ensure all application code has been updated to use:
-- - user_financial_data table for financial data
-- - user_security_settings table for security settings
-- ============================================================================

-- Drop columns that have been moved to user_financial_data
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS wallet_balance,
  DROP COLUMN IF EXISTS minimum_balance_met,
  DROP COLUMN IF EXISTS stripe_customer_id,
  DROP COLUMN IF EXISTS stripe_payment_method_id;

-- Drop columns that have been moved to user_security_settings
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS two_factor_enabled,
  DROP COLUMN IF EXISTS failed_login_attempts,
  DROP COLUMN IF EXISTS account_locked_until,
  DROP COLUMN IF EXISTS last_password_change,
  DROP COLUMN IF EXISTS security_questions_set,
  DROP COLUMN IF EXISTS security_notifications_enabled;

