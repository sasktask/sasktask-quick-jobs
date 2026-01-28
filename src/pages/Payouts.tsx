import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from "@/components/DashboardLayout";
import { EarningsAnalytics } from '@/components/EarningsAnalytics';
import { TaxReports } from '@/components/TaxReports';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { usePayoutData } from '@/hooks/usePayoutData';
import { UberPayoutSettings } from '@/components/payout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, PieChart, FileText } from 'lucide-react';

export default function Payouts() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

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
    refresh
  } = usePayoutData(user?.id);

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <main className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-32" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
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
              Manage your earnings, cash out instantly, or set up automatic payouts
            </p>
          </div>
        </div>

        {/* Main Payout Settings - Uber Style */}
        <Tabs defaultValue="wallet" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
            <TabsTrigger value="wallet" className="gap-2 data-[state=active]:bg-background">
              <DollarSign className="h-4 w-4" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-background">
              <PieChart className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="tax" className="gap-2 data-[state=active]:bg-background">
              <FileText className="h-4 w-4" />
              Tax Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallet">
            <UberPayoutSettings
              summary={summary}
              growthPercentage={growthPercentage}
              transactions={transactions}
              payoutAccount={payoutAccount}
              onRefresh={refresh}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <EarningsAnalytics transactions={transactions} />
          </TabsContent>

          <TabsContent value="tax">
            <TaxReports transactions={transactions} />
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}
