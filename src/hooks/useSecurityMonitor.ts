import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LoginEvent {
  user_id: string;
  ip_address?: string;
  user_agent?: string;
  login_method?: string;
  success: boolean;
  failure_reason?: string;
}

export const useSecurityMonitor = (userId: string | undefined) => {
  // Monitor for new logins from different locations
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`login-monitor-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'login_history',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        const newLogin = payload.new as LoginEvent;
        // Check if this is a suspicious login (different IP)
        if (newLogin.success) {
          checkSuspiciousLogin(userId, newLogin.ip_address || '');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const checkSuspiciousLogin = async (userId: string, ipAddress: string) => {
    try {
      const { data, error } = await supabase.rpc('check_suspicious_login', {
        p_user_id: userId,
        p_ip_address: ipAddress
      });

      if (error) {
        console.error('Error checking suspicious login:', error);
        return;
      }

      if (data === true) {
        toast.warning('New device or location detected', {
          description: 'We noticed a login from a new location. If this wasn\'t you, please change your password immediately.',
          duration: 10000,
        });
      }
    } catch (error) {
      console.error('Failed to check suspicious login:', error);
    }
  };

  const logLogin = useCallback(async (success: boolean, failureReason?: string) => {
    if (!userId) return;

    try {
      await supabase.from('login_history').insert({
        user_id: userId,
        user_agent: navigator.userAgent,
        login_method: 'password',
        success,
        failure_reason: failureReason,
      });
    } catch (error) {
      console.error('Failed to log login:', error);
    }
  }, [userId]);

  const getActiveSessions = useCallback(async () => {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_activity_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get active sessions:', error);
      return [];
    }
  }, [userId]);

  const getLoginHistory = useCallback(async (limit = 10) => {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('login_history')
        .select('*')
        .eq('user_id', userId)
        .order('login_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get login history:', error);
      return [];
    }
  }, [userId]);

  const terminateSession = useCallback(async (sessionId: string) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (error) throw error;
      
      toast.success('Session terminated successfully');
      return true;
    } catch (error) {
      console.error('Failed to terminate session:', error);
      toast.error('Failed to terminate session');
      return false;
    }
  }, [userId]);

  const terminateAllSessions = useCallback(async () => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      
      toast.success('All sessions terminated');
      return true;
    } catch (error) {
      console.error('Failed to terminate all sessions:', error);
      toast.error('Failed to terminate sessions');
      return false;
    }
  }, [userId]);

  return {
    logLogin,
    getActiveSessions,
    getLoginHistory,
    terminateSession,
    terminateAllSessions,
  };
};
