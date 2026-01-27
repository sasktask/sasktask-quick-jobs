import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FullVerificationStatus {
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  paymentVerified: boolean;
  photoVerified: boolean;
  isFullyVerified: boolean;
  isAdminOverride: boolean;
  missingVerifications: string[];
  completionPercentage: number;
}

export interface UseFullVerificationResult {
  status: FullVerificationStatus | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const defaultStatus: FullVerificationStatus = {
  emailVerified: false,
  phoneVerified: false,
  idVerified: false,
  paymentVerified: false,
  photoVerified: false,
  isFullyVerified: false,
  isAdminOverride: false,
  missingVerifications: [],
  completionPercentage: 0,
};

export function useFullVerification(userId: string | null): UseFullVerificationResult {
  const [status, setStatus] = useState<FullVerificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVerificationStatus = useCallback(async () => {
    if (!userId) {
      setStatus(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Parallel fetches for all verification data
      const [sessionResult, profileResult, verificationResult] = await Promise.all([
        supabase.auth.getSession(),
        supabase
          .from('profiles')
          .select('payment_verified, phone, verified_by_admin, photo_verified')
          .eq('id', userId)
          .maybeSingle(),
        supabase
          .from('verifications')
          .select('id_verified, photo_verification_status')
          .eq('user_id', userId)
          .maybeSingle(),
      ]);

      const session = sessionResult.data.session;
      const profile = profileResult.data;
      const verification = verificationResult.data;

      // Check if admin override is set
      const isAdminOverride = !!(profile as any)?.verified_by_admin;

      // Email verification from session
      const emailVerified = isAdminOverride || !!session?.user?.email_confirmed_at;

      // Payment verification from profile
      const paymentVerified = isAdminOverride || !!(profile as any)?.payment_verified;

      // Photo verification - check both profile and verifications table
      const photoVerified = isAdminOverride || 
        !!(profile as any)?.photo_verified || 
        verification?.photo_verification_status === 'verified';

      // ID verification from verifications table
      const idVerified = isAdminOverride || !!verification?.id_verified;

      // Phone verification - check phone_verifications table
      let phoneVerified = false;
      if (profile?.phone) {
        const { count } = await supabase
          .from('phone_verifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('phone', profile.phone)
          .not('verified_at', 'is', null);
        phoneVerified = isAdminOverride || (!!count && count > 0);
      } else {
        phoneVerified = isAdminOverride;
      }

      // Calculate missing verifications
      const missingVerifications: string[] = [];
      if (!emailVerified) missingVerifications.push('Email');
      if (!phoneVerified) missingVerifications.push('Phone');
      if (!idVerified) missingVerifications.push('ID Document');
      if (!paymentVerified) missingVerifications.push('Payment Method');
      if (!photoVerified) missingVerifications.push('Profile Photo');

      // User is fully verified if all checks pass
      const isFullyVerified = emailVerified && phoneVerified && idVerified && paymentVerified && photoVerified;

      // Calculate completion percentage
      const totalChecks = 5;
      const completedChecks = [emailVerified, phoneVerified, idVerified, paymentVerified, photoVerified]
        .filter(Boolean).length;
      const completionPercentage = Math.round((completedChecks / totalChecks) * 100);

      setStatus({
        emailVerified,
        phoneVerified,
        idVerified,
        paymentVerified,
        photoVerified,
        isFullyVerified,
        isAdminOverride,
        missingVerifications,
        completionPercentage,
      });
    } catch (err) {
      console.error('Error fetching verification status:', err);
      setError('Failed to check verification status');
      setStatus(defaultStatus);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchVerificationStatus();
  }, [fetchVerificationStatus]);

  return {
    status,
    isLoading,
    error,
    refetch: fetchVerificationStatus,
  };
}

// Helper function to get user-friendly verification requirement text
export function getVerificationRequirementText(role: 'task_giver' | 'task_doer'): string {
  if (role === 'task_giver') {
    return 'To post tasks, you must complete profile verification including email, phone, ID document, payment method, and profile photo.';
  }
  return 'To accept tasks or place bids, you must complete profile verification including email, phone, ID document, payment method, and profile photo.';
}
