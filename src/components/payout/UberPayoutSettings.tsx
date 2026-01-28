import { useState, useEffect, useCallback, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PayoutSchedule } from './PayoutSchedule';
import { PayoutMethods } from './PayoutMethods';
import { EarningsOverview } from './EarningsOverview';
import { PayoutHistory } from './PayoutHistory';
import { PayoutAccountSetup } from '@/components/PayoutAccountSetup';
import { WeeklyEarningsGoal } from './WeeklyEarningsGoal';
import { EarningsBreakdown } from './EarningsBreakdown';
import { WithdrawalTiers } from './WithdrawalTiers';
import { PendingPaymentsTimeline } from './PendingPaymentsTimeline';
import { EarningsProjection } from './EarningsProjection';
import { SecureWithdrawalFlow } from './SecureWithdrawalFlow';
import { PayoutTaxSummary } from './PayoutTaxSummary';
import { TaxBreakdownPanel } from './TaxBreakdownPanel';
import { EarningsSummary } from '@/hooks/usePayoutData';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthContext';
import { 
  Wallet, 
  Calendar, 
  CreditCard, 
  History,
  Settings,
  TrendingUp,
  FileText,
  Calculator
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

interface UberPayoutSettingsProps {
  summary: EarningsSummary;
  growthPercentage: number;
  transactions: any[];
  payoutAccount: any;
  onRefresh: () => void;
}

export function UberPayoutSettings({
  summary,
  growthPercentage,
  transactions,
  payoutAccount,
  onRefresh
}: UberPayoutSettingsProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [addMethodOpen, setAddMethodOpen] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState(() => {
    const saved = localStorage.getItem('weeklyEarningsGoal');
    return saved ? parseFloat(saved) : 500;
  });
  
  const isPayoutAccountActive = payoutAccount?.account_status === 'active';

  // Calculate weekly earnings
  const currentWeekEarnings = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    return transactions
      .filter(t => new Date(t.created_at) >= startOfWeek && t.escrow_status === 'released')
      .reduce((sum, t) => sum + (t.payout_amount || 0), 0);
  }, [transactions]);

  // Calculate days left in week
  const daysLeftInWeek = useMemo(() => {
    const now = new Date();
    return 7 - now.getDay();
  }, []);

  // Calculate streak (simplified)
  const streakDays = useMemo(() => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const hasEarnings = transactions.some(t => {
        const txDate = new Date(t.created_at);
        txDate.setHours(0, 0, 0, 0);
        return txDate.getTime() === checkDate.getTime();
      });
      if (hasEarnings) streak++;
      else if (i > 0) break;
    }
    return streak;
  }, [transactions]);

  // Category breakdown
  const categoryEarnings = useMemo(() => {
    const categories: Record<string, { amount: number; taskCount: number }> = {};
    transactions.forEach(t => {
      if (t.escrow_status === 'released' && t.task?.category) {
        const cat = t.task.category;
        if (!categories[cat]) {
          categories[cat] = { amount: 0, taskCount: 0 };
        }
        categories[cat].amount += t.payout_amount || 0;
        categories[cat].taskCount += 1;
      }
    });
    return Object.entries(categories).map(([category, data]) => ({
      category,
      amount: data.amount,
      taskCount: data.taskCount,
      color: ''
    }));
  }, [transactions]);

  // Pending payments
  const pendingPayments = useMemo(() => {
    return transactions
      .filter(t => t.escrow_status === 'held')
      .map(t => ({
        id: t.id,
        amount: t.payout_amount || 0,
        taskTitle: t.task?.title || 'Task',
        status: 'held' as const,
        createdAt: t.created_at,
        autoReleaseAt: t.auto_release_at,
        taskGiverConfirmed: t.task_giver_confirmed || false,
        taskDoerConfirmed: t.task_doer_confirmed || false,
      }));
  }, [transactions]);

  // Historical weekly data for projection
  const historicalData = useMemo(() => {
    const weeks: Record<string, number> = {};
    const now = new Date();
    
    transactions.forEach(t => {
      if (t.escrow_status === 'released') {
        const txDate = new Date(t.created_at);
        const weekStart = new Date(txDate);
        weekStart.setDate(txDate.getDate() - txDate.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        weeks[weekKey] = (weeks[weekKey] || 0) + (t.payout_amount || 0);
      }
    });

    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([week, earnings], i) => ({
        week: `W${i + 1}`,
        earnings
      }));
  }, [transactions]);

  const averageWeeklyEarnings = historicalData.length > 0
    ? historicalData.reduce((sum, w) => sum + w.earnings, 0) / historicalData.length
    : 0;

  const bestWeek = historicalData.length > 0
    ? Math.max(...historicalData.map(w => w.earnings))
    : 0;

  const projectedMonthlyEarnings = averageWeeklyEarnings * 4.33;

  const trend = useMemo(() => {
    if (historicalData.length < 2) return 'stable' as const;
    const recent = historicalData.slice(-2);
    const change = recent[1].earnings - recent[0].earnings;
    if (change > recent[0].earnings * 0.1) return 'up' as const;
    if (change < -recent[0].earnings * 0.1) return 'down' as const;
    return 'stable' as const;
  }, [historicalData]);

  const trendPercentage = useMemo(() => {
    if (historicalData.length < 2) return 0;
    const recent = historicalData.slice(-2);
    if (recent[0].earnings === 0) return 0;
    return ((recent[1].earnings - recent[0].earnings) / recent[0].earnings) * 100;
  }, [historicalData]);

  // Verification progress (simplified)
  const verificationProgress = useMemo(() => {
    let progress = 30; // Base
    if (payoutAccount?.bank_last4) progress += 30;
    if (summary.completedTasks >= 10) progress += 20;
    if (summary.completedTasks >= 50) progress += 20;
    return Math.min(progress, 100);
  }, [payoutAccount, summary.completedTasks]);

  const currentTier = useMemo(() => {
    if (summary.completedTasks >= 50 && verificationProgress >= 90) return 'premium';
    if (payoutAccount?.bank_last4 && verificationProgress >= 60) return 'verified';
    return 'basic';
  }, [summary.completedTasks, payoutAccount, verificationProgress]);

  const handleUpdateGoal = (newGoal: number) => {
    setWeeklyGoal(newGoal);
    localStorage.setItem('weeklyEarningsGoal', newGoal.toString());
  };

  return (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <EarningsOverview summary={summary} growthPercentage={growthPercentage} />

      {/* Weekly Goal */}
      <WeeklyEarningsGoal
        currentWeekEarnings={currentWeekEarnings}
        weeklyGoal={weeklyGoal}
        onUpdateGoal={handleUpdateGoal}
        streakDays={streakDays}
        daysLeftInWeek={daysLeftInWeek}
      />

      {/* Main Tabs */}
      <Tabs defaultValue="withdraw" className="space-y-6">
        <TabsList className="w-full grid grid-cols-6 h-auto p-1 bg-muted/50">
          <TabsTrigger value="withdraw" className="gap-2 py-3 data-[state=active]:bg-background">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Withdraw</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2 py-3 data-[state=active]:bg-background relative">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Pending</span>
            {pendingPayments.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] bg-amber-500 text-white rounded-full flex items-center justify-center">
                {pendingPayments.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="taxes" className="gap-2 py-3 data-[state=active]:bg-background">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Taxes</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2 py-3 data-[state=active]:bg-background">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Insights</span>
          </TabsTrigger>
          <TabsTrigger value="methods" className="gap-2 py-3 data-[state=active]:bg-background">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Methods</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2 py-3 data-[state=active]:bg-background">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="withdraw" className="space-y-6">
          {isPayoutAccountActive ? (
            <>
              <SecureWithdrawalFlow
                availableBalance={summary.inEscrow}
                inEscrow={summary.pendingEarnings}
                bankLast4={payoutAccount?.bank_last4}
                onSuccess={onRefresh}
              />
              <WithdrawalTiers
                currentTier={currentTier}
                verificationProgress={verificationProgress}
                onUpgrade={() => navigate('/verification')}
              />
              <PayoutSchedule payoutAccountActive={isPayoutAccountActive} />
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  ⚠️ Set up a bank account to enable withdrawals and scheduled payouts.
                </p>
              </div>
              <PayoutAccountSetup />
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <PendingPaymentsTimeline pendingPayments={pendingPayments} />
        </TabsContent>

        <TabsContent value="taxes" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <PayoutTaxSummary 
              userId={user?.id || null} 
              totalEarnings={summary.totalEarnings} 
            />
            <TaxBreakdownPanel 
              grossAmount={summary.totalEarnings} 
              showDetailed 
            />
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <EarningsBreakdown
              categoryEarnings={categoryEarnings}
              totalEarnings={summary.totalEarnings}
            />
            <EarningsProjection
              historicalData={historicalData}
              averageWeeklyEarnings={averageWeeklyEarnings}
              projectedMonthlyEarnings={projectedMonthlyEarnings}
              bestWeek={bestWeek}
              trend={trend}
              trendPercentage={trendPercentage}
            />
          </div>
        </TabsContent>

        <TabsContent value="methods">
          <PayoutMethods 
            payoutAccount={payoutAccount} 
            onAddMethod={() => setAddMethodOpen(true)} 
          />
        </TabsContent>

        <TabsContent value="history">
          <PayoutHistory transactions={transactions} />
        </TabsContent>
      </Tabs>

      {/* Add Payment Method Sheet */}
      <Sheet open={addMethodOpen} onOpenChange={setAddMethodOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Add Payment Method
            </SheetTitle>
            <SheetDescription>
              Add a bank account to receive your earnings
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <PayoutAccountSetup />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
