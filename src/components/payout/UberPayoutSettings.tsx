import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InstantCashout } from './InstantCashout';
import { PayoutSchedule } from './PayoutSchedule';
import { PayoutMethods } from './PayoutMethods';
import { EarningsOverview } from './EarningsOverview';
import { PayoutHistory } from './PayoutHistory';
import { PayoutAccountSetup } from '@/components/PayoutAccountSetup';
import { EarningsSummary } from '@/hooks/usePayoutData';
import { 
  Zap, 
  Calendar, 
  CreditCard, 
  History,
  Settings
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
  const [addMethodOpen, setAddMethodOpen] = useState(false);
  const isPayoutAccountActive = payoutAccount?.account_status === 'active';

  return (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <EarningsOverview summary={summary} growthPercentage={growthPercentage} />

      {/* Main Tabs */}
      <Tabs defaultValue="cashout" className="space-y-6">
        <TabsList className="w-full grid grid-cols-4 h-auto p-1 bg-muted/50">
          <TabsTrigger value="cashout" className="gap-2 py-3 data-[state=active]:bg-background">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Cash Out</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-2 py-3 data-[state=active]:bg-background">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Schedule</span>
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

        <TabsContent value="cashout" className="space-y-4">
          {isPayoutAccountActive ? (
            <InstantCashout
              availableBalance={summary.inEscrow}
              bankLast4={payoutAccount?.bank_last4}
              onSuccess={onRefresh}
            />
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  ⚠️ Set up a bank account to enable instant cashout and scheduled payouts.
                </p>
              </div>
              <PayoutAccountSetup />
            </div>
          )}
        </TabsContent>

        <TabsContent value="schedule">
          <PayoutSchedule payoutAccountActive={isPayoutAccountActive} />
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
