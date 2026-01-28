import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subDays, startOfDay, endOfDay } from 'date-fns';

interface TrendData {
  currentValue: number;
  previousValue: number;
  trend: 'up' | 'down' | 'neutral';
  changePercent: number;
}

interface HistoricalTrends {
  completedTasks: TrendData | null;
  earnings: TrendData | null;
  reputation: TrendData | null;
  bookings: TrendData | null;
  loading: boolean;
}

export function useHistoricalTrends(userId: string | undefined): HistoricalTrends {
  const [trends, setTrends] = useState<HistoricalTrends>({
    completedTasks: null,
    earnings: null,
    reputation: null,
    bookings: null,
    loading: true,
  });

  useEffect(() => {
    if (!userId) {
      setTrends(prev => ({ ...prev, loading: false }));
      return;
    }

    calculateTrends();
  }, [userId]);

  const calculateTrends = async () => {
    try {
      const now = new Date();
      const currentPeriodStart = startOfDay(subDays(now, 7));
      const previousPeriodStart = startOfDay(subDays(now, 14));
      const previousPeriodEnd = endOfDay(subDays(now, 7));

      // Fetch current and previous period bookings
      const [currentBookings, previousBookings] = await Promise.all([
        supabase
          .from('bookings')
          .select('id, status, created_at')
          .eq('task_doer_id', userId)
          .gte('created_at', currentPeriodStart.toISOString())
          .lt('created_at', now.toISOString()),
        supabase
          .from('bookings')
          .select('id, status, created_at')
          .eq('task_doer_id', userId)
          .gte('created_at', previousPeriodStart.toISOString())
          .lt('created_at', previousPeriodEnd.toISOString()),
      ]);

      // Fetch current and previous period payments
      const [currentPayments, previousPayments] = await Promise.all([
        supabase
          .from('payments')
          .select('payout_amount')
          .eq('payee_id', userId)
          .eq('status', 'completed')
          .gte('created_at', currentPeriodStart.toISOString())
          .lt('created_at', now.toISOString()),
        supabase
          .from('payments')
          .select('payout_amount')
          .eq('payee_id', userId)
          .eq('status', 'completed')
          .gte('created_at', previousPeriodStart.toISOString())
          .lt('created_at', previousPeriodEnd.toISOString()),
      ]);

      // Calculate completed tasks trend
      const currentCompleted = (currentBookings.data || []).filter(b => b.status === 'completed').length;
      const previousCompleted = (previousBookings.data || []).filter(b => b.status === 'completed').length;

      // Calculate earnings trend
      const currentEarnings = (currentPayments.data || []).reduce((sum, p) => sum + Number(p.payout_amount), 0);
      const previousEarnings = (previousPayments.data || []).reduce((sum, p) => sum + Number(p.payout_amount), 0);

      // Calculate bookings trend
      const currentBookingsCount = (currentBookings.data || []).length;
      const previousBookingsCount = (previousBookings.data || []).length;

      setTrends({
        completedTasks: calculateTrendData(currentCompleted, previousCompleted),
        earnings: calculateTrendData(currentEarnings, previousEarnings),
        reputation: null, // Reputation trend requires profile history
        bookings: calculateTrendData(currentBookingsCount, previousBookingsCount),
        loading: false,
      });
    } catch (error) {
      console.error('Error calculating trends:', error);
      setTrends(prev => ({ ...prev, loading: false }));
    }
  };

  const calculateTrendData = (current: number, previous: number): TrendData => {
    if (previous === 0 && current === 0) {
      return { currentValue: current, previousValue: previous, trend: 'neutral', changePercent: 0 };
    }
    
    if (previous === 0) {
      return { currentValue: current, previousValue: previous, trend: 'up', changePercent: 100 };
    }

    const changePercent = ((current - previous) / previous) * 100;
    const trend = changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral';

    return {
      currentValue: current,
      previousValue: previous,
      trend,
      changePercent: Math.abs(Math.round(changePercent)),
    };
  };

  return trends;
}
