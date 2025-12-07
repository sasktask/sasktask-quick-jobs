import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Receipt,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

interface Payment {
  id: string;
  amount: number;
  platform_fee: number;
  payout_amount: number;
  status: string;
  escrow_status: string | null;
  created_at: string;
  paid_at: string | null;
  released_at: string | null;
  payer_id: string;
  payee_id: string;
  task: {
    title: string;
    category: string;
  } | null;
  payer: {
    full_name: string;
  } | null;
  payee: {
    full_name: string;
  } | null;
}

interface PaymentHistoryProps {
  userId: string;
  limit?: number;
  showHeader?: boolean;
}

export function PaymentHistory({ userId, limit = 10, showHeader = true }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [userId]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          task:tasks!payments_task_id_fkey (
            title,
            category
          ),
          payer:profiles!payments_payer_id_fkey (
            full_name
          ),
          payee:profiles!payments_payee_id_fkey (
            full_name
          )
        `)
        .or(`payer_id.eq.${userId},payee_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(showAll ? 50 : limit);

      if (error) throw error;

      // Type assertion to handle the response
      setPayments((data as unknown as Payment[]) || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string, escrowStatus: string | null) => {
    const displayStatus = escrowStatus || status;
    
    const config: Record<string, { color: string; icon: React.ReactNode }> = {
      completed: { color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: <CheckCircle className="h-3 w-3" /> },
      released: { color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: <CheckCircle className="h-3 w-3" /> },
      held: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: <Clock className="h-3 w-3" /> },
      pending: { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: <Clock className="h-3 w-3" /> },
      processing: { color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', icon: <RefreshCw className="h-3 w-3 animate-spin" /> },
      failed: { color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: <XCircle className="h-3 w-3" /> },
      refunded: { color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', icon: <ArrowDownLeft className="h-3 w-3" /> },
    };

    const { color, icon } = config[displayStatus] || config.pending;

    return (
      <Badge variant="outline" className={`${color} gap-1 capitalize`}>
        {icon}
        {displayStatus}
      </Badge>
    );
  };

  const isIncoming = (payment: Payment) => payment.payee_id === userId;

  if (isLoading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Payment History
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Payment History
          </CardTitle>
          <CardDescription>
            Your recent transactions and earnings
          </CardDescription>
        </CardHeader>
      )}
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => {
              const incoming = isIncoming(payment);
              const otherParty = incoming ? payment.payer?.full_name : payment.payee?.full_name;
              const displayAmount = incoming ? payment.payout_amount : payment.amount;

              return (
                <div
                  key={payment.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  {/* Direction Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    incoming 
                      ? 'bg-green-500/10 text-green-600' 
                      : 'bg-red-500/10 text-red-600'
                  }`}>
                    {incoming ? (
                      <ArrowDownLeft className="h-5 w-5" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5" />
                    )}
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {payment.task?.title || 'Task Payment'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{incoming ? 'From' : 'To'}: {otherParty || 'Unknown'}</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span>{format(new Date(payment.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>

                  {/* Amount & Status */}
                  <div className="text-right space-y-1">
                    <p className={`font-bold ${incoming ? 'text-green-600' : 'text-foreground'}`}>
                      {incoming ? '+' : '-'}${displayAmount.toFixed(2)}
                    </p>
                    {getStatusBadge(payment.status, payment.escrow_status)}
                  </div>
                </div>
              );
            })}

            {payments.length >= limit && !showAll && (
              <Button
                variant="ghost"
                className="w-full mt-2"
                onClick={() => setShowAll(true)}
              >
                View All Transactions
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}