import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from "@/components/DashboardLayout";
import { EarningsAnalytics } from '@/components/EarningsAnalytics';
import { AutoPayoutSettings } from '@/components/AutoPayoutSettings';
import { TaxReports } from '@/components/TaxReports';
import { PayoutAccountSetup } from '@/components/PayoutAccountSetup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DollarSign, 
  PieChart,
  Zap,
  FileText,
  BanknoteIcon,
  Sparkles
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { usePayoutData } from '@/hooks/usePayoutData';
import {
  PayoutStatsGrid,
  PayoutQuickActions,
  PayoutAccountStatus,
  TransactionsList,
  WithdrawalDialog,
} from '@/components/payout';

export default function Payouts() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUser(user);
    setAuthLoading(false);
  };

  const {
    transactions,
    payoutAccount,
    summary,
    isLoading,
    growthPercentage,
    isPayoutAccountActive,
    refresh
  } = usePayoutData(user?.id);

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <main className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-20" />
            <Skeleton className="h-96" />
          </div>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <SEOHead 
        title="Payouts & Earnings - SaskTask"
        description="Track your earnings, manage payouts, and request withdrawals on SaskTask"
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <p className="text-muted-foreground mt-1">
              Track your earnings and manage withdrawals
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <PayoutStatsGrid summary={summary} growthPercentage={growthPercentage} />

        {/* Quick Actions */}
        <PayoutQuickActions
          inEscrow={summary.inEscrow}
          isPayoutAccountActive={isPayoutAccountActive}
          onRequestWithdrawal={() => setWithdrawDialogOpen(true)}
        />

        {/* Account Status */}
        <PayoutAccountStatus payoutAccount={payoutAccount} />

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
            <TabsTrigger value="transactions" className="gap-2 data-[state=active]:bg-background">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Transactions</span>
              <span className="sm:hidden">History</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-background">
              <PieChart className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="auto-payout" className="gap-2 data-[state=active]:bg-background">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Auto-Payout</span>
              <span className="sm:hidden">Auto</span>
            </TabsTrigger>
            <TabsTrigger value="tax" className="gap-2 data-[state=active]:bg-background">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Tax Reports</span>
              <span className="sm:hidden">Tax</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2 data-[state=active]:bg-background">
              <BanknoteIcon className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <TransactionsList transactions={transactions} />
          </TabsContent>

          <TabsContent value="analytics">
            <EarningsAnalytics transactions={transactions} />
          </TabsContent>

          <TabsContent value="auto-payout">
            <AutoPayoutSettings payoutAccountActive={isPayoutAccountActive} />
          </TabsContent>

          <TabsContent value="tax">
            <TaxReports transactions={transactions} />
          </TabsContent>

          <TabsContent value="account">
            <PayoutAccountSetup />
          </TabsContent>
        </Tabs>
      </main>

      {/* Withdrawal Dialog */}
      <WithdrawalDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        availableBalance={summary.inEscrow}
        bankLast4={payoutAccount?.bank_last4 || null}
        onSuccess={refresh}
      />
    </DashboardLayout>
  );
}
