import { useEffect } from 'react';
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
        if (payload.new.severity === 'high') {
          toast.error('Security Alert', {
            description: 'Unusual activity detected on your account.',
            duration: 10000
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const logActivity = async (activityType: string) => {
    if (!userId) return;
    
    try {
      await supabase.functions.invoke('fraud-detection', {
        body: { userId, activityType }
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  return { logActivity };
};