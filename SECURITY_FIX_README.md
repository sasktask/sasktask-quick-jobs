# Profiles Table Security Fix

This document explains the security fixes applied to the `profiles` table to address the security concerns.

## Security Issue

The `profiles` table contains sensitive personal data (emails, phone numbers, addresses, social media links), financial data (wallet_balance, stripe_customer_id), and security-sensitive fields (two_factor_enabled, failed_login_attempts, account_locked_until). While RLS policies exist, there were concerns about potential vulnerabilities in auth.uid() checks that could allow users to access other users' profiles.

## Solution Overview

We've created three migration files that provide both immediate and comprehensive fixes:

### 1. Immediate Fix (Run This First)

**File:** `20251230212331_immediate_rls_security_fix.sql`

This migration can be applied immediately without requiring any code changes. It:
- Drops all existing potentially permissive RLS policies
- Creates strict RLS policies with explicit `auth.uid() IS NOT NULL` checks
- Ensures users can ONLY access their own profiles (SELECT, UPDATE, INSERT)

**Action:** Run this migration immediately to strengthen security.

### 2. Comprehensive Fix - Data Separation (Run When Ready)

**File:** `20251230212332_fix_profiles_security_rls.sql`

This migration implements the recommended security best practice of separating sensitive data:
- Creates `user_financial_data` table for financial fields (wallet_balance, stripe_customer_id, etc.)
- Creates `user_security_settings` table for security fields (two_factor_enabled, failed_login_attempts, etc.)
- Migrates existing data from profiles to the new tables
- Creates strict RLS policies on the new tables
- Updates RLS policies on profiles table (same as immediate fix)

**Important Notes:**
- This migration keeps the original columns in `profiles` for backward compatibility
- Application code will continue to work (reading from profiles table)
- The new tables are created in parallel for gradual migration

**Action:** Run this when ready to start the data separation process. Code can continue using the profiles table temporarily.

### 3. Cleanup (Run After Code Update)

**File:** `20251230212333_remove_sensitive_columns_from_profiles.sql`

This migration removes the sensitive columns from the profiles table.

**⚠️ DO NOT RUN THIS YET**

This should only be run AFTER:
1. All application code has been updated to use the new tables
2. Thorough testing has been completed
3. No code references the old columns on profiles table

**Action:** Keep this migration for future use after codebase updates.

## Recommended Migration Path

### Phase 1: Immediate Security (Do Now)
```bash
# Run the immediate RLS fix
supabase migration up 20251230212331_immediate_rls_security_fix
```

### Phase 2: Data Separation (Do When Ready)
```bash
# Create separate tables and migrate data
supabase migration up 20251230212332_fix_profiles_security_rls
```

### Phase 3: Code Updates (Update Application Code)
Update your application code to use the new tables:

**Financial Data:**
```typescript
// Old way (still works temporarily):
const { data } = await supabase
  .from('profiles')
  .select('wallet_balance, stripe_customer_id')
  .eq('id', userId)
  .single();

// New way (recommended):
const { data } = await supabase
  .from('user_financial_data')
  .select('*')
  .eq('user_id', userId)
  .single();
```

**Security Settings:**
```typescript
// Old way (still works temporarily):
const { data } = await supabase
  .from('profiles')
  .select('two_factor_enabled, failed_login_attempts')
  .eq('id', userId)
  .single();

// New way (recommended):
const { data } = await supabase
  .from('user_security_settings')
  .select('*')
  .eq('user_id', userId)
  .single();
```

### Phase 4: Cleanup (Do After Code Update)
```bash
# Remove old columns (only after code is updated!)
supabase migration up 20251230212333_remove_sensitive_columns_from_profiles
```

## RLS Policy Details

All new RLS policies include:
- `TO authenticated` - Only authenticated users
- `auth.uid() IS NOT NULL` - Explicit null check to prevent bugs
- `auth.uid() = id/user_id` - Strict user-only access
- Separate policies for SELECT, UPDATE, INSERT operations

## Files That Need Code Updates

After running migration 2, these files will need updates to use the new tables:

1. `src/components/WalletCard.tsx` - Uses `wallet_balance`
2. `src/hooks/useFraudDetection.ts` - Uses `failed_login_attempts`, `account_locked_until`
3. `src/components/account/SecurityOverview.tsx` - Uses `two_factor_enabled`, `last_password_change`
4. `supabase/functions/confirm-wallet-deposit/index.ts` - Uses `wallet_balance`
5. Any other files that access these sensitive fields

## Testing

After applying migrations, test:
1. Users can view their own profile ✓
2. Users CANNOT view other users' profiles ✓
3. Users can update their own profile ✓
4. Users CANNOT update other users' profiles ✓
5. Financial data is accessible only to the owner ✓
6. Security settings are accessible only to the owner ✓

## Security Benefits

1. **Immediate:** Stronger RLS policies prevent unauthorized access
2. **Separation of Concerns:** Financial and security data in dedicated tables
3. **Defense in Depth:** Multiple layers of access control
4. **Audit Trail:** Easier to track access to sensitive data
5. **Compliance:** Better alignment with data protection best practices

