import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TransactionDetailDialog } from './TransactionDetailDialog';
import { 
  ArrowDownToLine, 
  ArrowUpRight,
  CheckCircle,
  Clock,
  Zap,
  CalendarDays,
  ChevronRight,
  History,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  amount: number;
  payout_amount: number;
  platform_fee: number;
  status: string;
  escrow_status: string | null;
  released_at: string | null;
  payout_at: string | null;
  release_type?: string;
  created_at: string;
  task?: {
    title: string;
    category: string;
  } | null;
  payer?: {
    full_name: string;
  } | null;
}

interface PayoutHistoryProps {
  transactions: Transaction[];
}

export function PayoutHistory({ transactions }: PayoutHistoryProps) {
  const [showAll, setShowAll] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  const payouts = transactions
    .filter(t => t.escrow_status === 'released' && t.payout_at)
    .sort((a, b) => new Date(b.payout_at!).getTime() - new Date(a.payout_at!).getTime());

  const displayedPayouts = showAll ? payouts : payouts.slice(0, 5);

  const getPayoutIcon = (type?: string) => {
    switch (type) {
      case 'instant':
        return <Zap className="h-4 w-4 text-amber-500" />;
      case 'auto_72hr':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'mutual_confirmation':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <ArrowDownToLine className="h-4 w-4 text-primary" />;
    }
  };

  const getPayoutLabel = (type?: string) => {
    switch (type) {
      case 'instant':
        return 'Instant Cashout';
      case 'auto_72hr':
        return 'Auto Release';
      case 'mutual_confirmation':
        return 'Confirmed Release';
      default:
        return 'Manual Withdrawal';
    }
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailOpen(true);
  };

  if (payouts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <History className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No Payouts Yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Your payout history will appear here once you've completed tasks and received payments.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals
  const totalPaidOut = payouts.reduce((sum, p) => sum + p.payout_amount, 0);
  const thisMonthPayouts = payouts.filter(p => {
    const date = new Date(p.payout_at!);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonthPayouts.reduce((sum, p) => sum + p.payout_amount, 0);

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <History className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Payout History</CardTitle>
                <CardDescription>{payouts.length} payouts completed</CardDescription>
              </div>
            </div>
            {payouts.length > 5 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAll(!showAll)}
                className="gap-1"
              >
                {showAll ? 'Show Less' : 'View All'}
                <ChevronRight className={`h-4 w-4 transition-transform ${showAll ? 'rotate-90' : ''}`} />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-green-500/10 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Total Paid Out</p>
              <p className="text-xl font-bold text-green-600">${totalPaidOut.toFixed(2)}</p>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">This Month</p>
              <p className="text-xl font-bold text-blue-600">${thisMonthTotal.toFixed(2)}</p>
            </div>
          </div>

          <ScrollArea className={showAll ? 'h-[400px]' : ''}>
            <div className="space-y-2">
              {displayedPayouts.map((payout) => (
                <div 
                  key={payout.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer group"
                  onClick={() => handleViewDetails(payout)}
                >
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    {getPayoutIcon(payout.release_type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {payout.task?.title || getPayoutLabel(payout.release_type)}
                      </span>
                      <Badge variant="outline" className="text-xs text-green-600 border-green-500/30 shrink-0">
                        Completed
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {payout.payout_at 
                        ? format(new Date(payout.payout_at), 'MMM d, yyyy • h:mm a')
                        : 'Processing'
                      }
                    </p>
                  </div>

                  <div className="text-right flex items-center gap-2">
                    <div>
                      <p className="font-semibold text-green-600 flex items-center gap-1">
                        <ArrowUpRight className="h-4 w-4" />
                        +${payout.payout_amount.toFixed(2)}
                      </p>
                      {payout.task?.category && (
                        <p className="text-xs text-muted-foreground">{payout.task.category}</p>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(payout);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <TransactionDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        transaction={selectedTransaction}
      />
    </>
  );
}
