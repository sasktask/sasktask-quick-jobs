import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFraudDetection = (userId: string | undefined) => {
  useEffect(() => {
    if (!userId) return;

    const checkFraudAlerts = async () => {
      const { data: alerts } = await supabase
        .from('fraud_alerts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);

      if (alerts && alerts.length > 0) {
        const alert = alerts[0];
        if (alert.severity === 'high') {
          toast.error('Security Alert', {
            description: 'Unusual activity detected on your account. Please contact support.',
            duration: 10000
          });
        } else if (alert.severity === 'medium') {
          toast.warning('Security Notice', {
            description: 'We noticed some unusual activity. Please verify your recent actions.',
            duration: 8000
          });
        }
      }
    };

    checkFraudAlerts();

    // Subscribe to new alerts
    const channel = supabase
      .channel(`fraud-alerts-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'fraud_alerts',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        const newPayload = payload.new as { severity: string };
        if (newPayload.severity === 'high') {
          toast.error('Security Alert', {
            description: 'Unusual activity detected on your account.',
            duration: 10000
          });
        } else if (newPayload.severity === 'medium') {
          toast.warning('Security Notice', {
            description: 'Please verify your recent activity.',
            duration: 8000
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const logActivity = useCallback(async (activityType: string, metadata?: Record<string, unknown>) => {
    if (!userId) return;
    
    try {
      await supabase.functions.invoke('fraud-detection', {
        body: { userId, activityType, metadata }
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }, [userId]);

  const logLoginAttempt = useCallback(async (success: boolean, method: string = 'password', failureReason?: string) => {
    if (!userId) return;
    
    try {
      await supabase.from('login_history').insert({
        user_id: userId,
        user_agent: navigator.userAgent,
        login_method: method,
        success,
        failure_reason: failureReason,
      });
    } catch (error) {
      console.error('Failed to log login attempt:', error);
    }
  }, [userId]);

  const checkAccountLocked = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_locked_until, failed_login_attempts')
        .eq('id', userId)
        .single();

      if (profile?.account_locked_until) {
        const lockUntil = new Date(profile.account_locked_until);
        if (lockUntil > new Date()) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Failed to check account lock status:', error);
      return false;
    }
  }, [userId]);

  const incrementFailedAttempts = useCallback(async () => {
    if (!userId) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('failed_login_attempts')
        .eq('id', userId)
        .single();

      const currentAttempts = (profile?.failed_login_attempts || 0) + 1;
      
      const updateData: Record<string, unknown> = {
        failed_login_attempts: currentAttempts,
      };

      // Lock account after 5 failed attempts for 30 minutes
      if (currentAttempts >= 5) {
        updateData.account_locked_until = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      }

      await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);
    } catch (error) {
      console.error('Failed to increment failed attempts:', error);
    }
  }, [userId]);

  const resetFailedAttempts = useCallback(async () => {
    if (!userId) return;
    
    try {
      await supabase
        .from('profiles')
        .update({ 
          failed_login_attempts: 0,
          account_locked_until: null 
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Failed to reset failed attempts:', error);
    }
  }, [userId]);

  return { 
    logActivity,
    logLoginAttempt,
    checkAccountLocked,
    incrementFailedAttempts,
    resetFailedAttempts,
  };
};