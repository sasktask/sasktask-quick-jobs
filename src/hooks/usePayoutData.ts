import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PayoutTransaction {
  id: string;
  amount: number;
  payout_amount: number;
  platform_fee: number;
  status: string;
  escrow_status: string | null;
  created_at: string;
  released_at: string | null;
  payout_at: string | null;
  task: {
    title: string;
    category: string;
  } | null;
  payer: {
    full_name: string;
  } | null;
}

export interface PayoutAccount {
  id: string;
  user_id: string;
  stripe_account_id: string;
  bank_last4: string | null;
  account_status: string;
  account_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface EarningsSummary {
  totalEarnings: number;
  availableBalance: number;
  pendingEarnings: number;
  inEscrow: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  completedTasks: number;
  pendingPayouts: number;
  lifetimeTasks: number;
  averageTaskValue: number;
}

export function usePayoutData(userId: string | null) {
  const [transactions, setTransactions] = useState<PayoutTransaction[]>([]);
  const [payoutAccount, setPayoutAccount] = useState<PayoutAccount | null>(null);
  const [summary, setSummary] = useState<EarningsSummary>({
    totalEarnings: 0,
    availableBalance: 0,
    pendingEarnings: 0,
    inEscrow: 0,
    thisMonthEarnings: 0,
    lastMonthEarnings: 0,
    completedTasks: 0,
    pendingPayouts: 0,
    lifetimeTasks: 0,
    averageTaskValue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayoutAccount = useCallback(async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('payout_accounts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      setPayoutAccount(data);
    } catch (err: any) {
      console.error('Error fetching payout account:', err);
    }
  }, [userId]);

  const fetchEarnings = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          *,
          task:tasks (title, category),
          payer:profiles!payments_payer_id_fkey (full_name)
        `)
        .eq('payee_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (payments) {
        setTransactions(payments as unknown as PayoutTransaction[]);

        const now = new Date();
        const thisMonth = now.getMonth();
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const thisYear = now.getFullYear();
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

        const releasedPayments = payments.filter(p => p.escrow_status === 'released');
        const heldPayments = payments.filter(p => p.escrow_status === 'held');
        
        const totalEarnings = releasedPayments.reduce((sum, p) => sum + (p.payout_amount || 0), 0);
        const inEscrow = heldPayments.reduce((sum, p) => sum + (p.payout_amount || 0), 0);
        
        const pendingEarnings = payments
          .filter(p => p.status === 'pending' || p.status === 'processing')
          .reduce((sum, p) => sum + (p.payout_amount || 0), 0);

        const thisMonthEarnings = payments
          .filter(p => {
            const date = new Date(p.created_at);
            return date.getMonth() === thisMonth && 
                   date.getFullYear() === thisYear &&
                   p.escrow_status === 'released';
          })
          .reduce((sum, p) => sum + (p.payout_amount || 0), 0);

        const lastMonthEarnings = payments
          .filter(p => {
            const date = new Date(p.created_at);
            return date.getMonth() === lastMonth && 
                   date.getFullYear() === lastMonthYear &&
                   p.escrow_status === 'released';
          })
          .reduce((sum, p) => sum + (p.payout_amount || 0), 0);

        const completedTasks = releasedPayments.length;
        const lifetimeTasks = payments.length;
        const averageTaskValue = lifetimeTasks > 0 
          ? payments.reduce((sum, p) => sum + (p.payout_amount || 0), 0) / lifetimeTasks 
          : 0;

        setSummary({
          totalEarnings,
          availableBalance: totalEarnings,
          pendingEarnings,
          inEscrow,
          thisMonthEarnings,
          lastMonthEarnings,
          completedTasks,
          pendingPayouts: heldPayments.length,
          lifetimeTasks,
          averageTaskValue,
        });
      }
    } catch (err: any) {
      console.error('Error fetching earnings:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const refresh = useCallback(async () => {
    await Promise.all([fetchEarnings(), fetchPayoutAccount()]);
  }, [fetchEarnings, fetchPayoutAccount]);

  useEffect(() => {
    if (userId) {
      refresh();
    }
  }, [userId, refresh]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`payout-updates-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `payee_id=eq.${userId}`,
        },
        () => {
          fetchEarnings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchEarnings]);

  const growthPercentage = summary.lastMonthEarnings > 0 
    ? ((summary.thisMonthEarnings - summary.lastMonthEarnings) / summary.lastMonthEarnings * 100)
    : summary.thisMonthEarnings > 0 ? 100 : 0;

  return {
    transactions,
    payoutAccount,
    summary,
    isLoading,
    error,
    refresh,
    growthPercentage,
    isPayoutAccountActive: payoutAccount?.account_status === 'active',
  };
}
