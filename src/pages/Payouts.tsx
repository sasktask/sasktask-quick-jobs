import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PayoutAccountSetup } from '@/components/PayoutAccountSetup';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Wallet,
  ArrowDownToLine,
  Calendar,
  BarChart3,
  AlertCircle,
  Loader2,
  CreditCard,
  BanknoteIcon,
  ArrowUpRight
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EarningsSummary {
  totalEarnings: number;
  availableBalance: number;
  pendingEarnings: number;
  inEscrow: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  completedTasks: number;
  pendingPayouts: number;
}

interface PayoutTransaction {
  id: string;
  amount: number;
  payout_amount: number;
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

export default function Payouts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<PayoutTransaction[]>([]);
  const [payoutAccount, setPayoutAccount] = useState<any>(null);
  const [summary, setSummary] = useState<EarningsSummary>({
    totalEarnings: 0,
    availableBalance: 0,
    pendingEarnings: 0,
    inEscrow: 0,
    thisMonthEarnings: 0,
    lastMonthEarnings: 0,
    completedTasks: 0,
    pendingPayouts: 0
  });
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

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
    await Promise.all([
      fetchEarnings(user.id),
      fetchPayoutAccount(user.id)
    ]);
  };

  const fetchPayoutAccount = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('payout_accounts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      setPayoutAccount(data);
    } catch (error) {
      console.error('Error fetching payout account:', error);
    }
  };

  const fetchEarnings = async (userId: string) => {
    try {
      const { data: payments } = await supabase
        .from('payments')
        .select(`
          *,
          task:tasks (title, category),
          payer:profiles!payments_payer_id_fkey (full_name)
        `)
        .eq('payee_id', userId)
        .order('created_at', { ascending: false });

      if (payments) {
        setTransactions(payments as unknown as PayoutTransaction[]);

        const now = new Date();
        const thisMonth = now.getMonth();
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const thisYear = now.getFullYear();
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

        const totalEarnings = payments
          .filter(p => p.escrow_status === 'released')
          .reduce((sum, p) => sum + (p.payout_amount || 0), 0);

        const inEscrow = payments
          .filter(p => p.escrow_status === 'held')
          .reduce((sum, p) => sum + (p.payout_amount || 0), 0);

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

        const completedTasks = payments.filter(p => p.escrow_status === 'released').length;

        setSummary({
          totalEarnings,
          availableBalance: totalEarnings, // Already paid out
          pendingEarnings,
          inEscrow,
          thisMonthEarnings,
          lastMonthEarnings,
          completedTasks,
          pendingPayouts: payments.filter(p => p.escrow_status === 'held').length
        });
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid withdrawal amount.',
        variant: 'destructive'
      });
      return;
    }

    if (parseFloat(withdrawAmount) > summary.inEscrow) {
      toast({
        title: 'Insufficient Balance',
        description: 'You cannot withdraw more than your available escrow balance.',
        variant: 'destructive'
      });
      return;
    }

    setIsWithdrawing(true);
    try {
      const { data, error } = await supabase.functions.invoke('request-withdrawal', {
        body: { amount: parseFloat(withdrawAmount) }
      });

      if (error) throw error;

      toast({
        title: 'Withdrawal Requested',
        description: `Your withdrawal of $${withdrawAmount} has been submitted for processing.`
      });

      setWithdrawDialogOpen(false);
      setWithdrawAmount('');
      
      // Refresh data
      if (user) fetchEarnings(user.id);
    } catch (error: any) {
      toast({
        title: 'Withdrawal Failed',
        description: error.message || 'Failed to process withdrawal request.',
        variant: 'destructive'
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const getStatusBadge = (status: string, escrowStatus: string | null) => {
    const displayStatus = escrowStatus || status;
    
    const config: Record<string, { color: string; label: string }> = {
      released: { color: 'bg-green-500/10 text-green-600 border-green-500/20', label: 'Paid Out' },
      held: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', label: 'In Escrow' },
      pending: { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', label: 'Pending' },
      completed: { color: 'bg-green-500/10 text-green-600 border-green-500/20', label: 'Completed' },
    };

    const { color, label } = config[displayStatus] || config.pending;

    return (
      <Badge variant="outline" className={`${color} capitalize`}>
        {label}
      </Badge>
    );
  };

  const growthPercentage = summary.lastMonthEarnings > 0 
    ? ((summary.thisMonthEarnings - summary.lastMonthEarnings) / summary.lastMonthEarnings * 100).toFixed(1)
    : summary.thisMonthEarnings > 0 ? '100' : '0';

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <div className="grid md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-96" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Payouts - SaskTask"
        description="Track your earnings, manage payouts, and request withdrawals on SaskTask"
      />
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
            <p className="text-muted-foreground mt-1">Track your earnings and manage withdrawals</p>
          </div>
          <div className="flex gap-3">
            {payoutAccount?.account_status === 'active' && summary.inEscrow > 0 && (
              <Button onClick={() => setWithdrawDialogOpen(true)}>
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                Request Withdrawal
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">${summary.totalEarnings.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{summary.completedTasks} tasks completed</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Escrow</p>
                  <p className="text-2xl font-bold text-blue-600">${summary.inEscrow.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{summary.pendingPayouts} pending</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">${summary.thisMonthEarnings.toFixed(2)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {parseFloat(growthPercentage) >= 0 ? (
                      <ArrowUpRight className="h-3 w-3 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-3 w-3 text-red-600 rotate-90" />
                    )}
                    <span className={`text-xs ${parseFloat(growthPercentage) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {growthPercentage}%
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Last Month</p>
                  <p className="text-2xl font-bold">${summary.lastMonthEarnings.toFixed(2)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payout Account Status Alert */}
        {!payoutAccount || payoutAccount.account_status !== 'active' ? (
          <Card className="mb-8 border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Set Up Your Payout Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Add your bank details to receive payments for completed tasks.
                  </p>
                </div>
                <Button variant="outline" onClick={() => navigate('/account')}>
                  Set Up Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 border-green-500/30 bg-green-500/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-700 dark:text-green-400">Payout Account Active</h3>
                  <p className="text-sm text-muted-foreground">
                    Bank account ending in •••• {payoutAccount.bank_last4} is ready to receive payments.
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/account')}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="transactions" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              <BanknoteIcon className="h-4 w-4" />
              Payout Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Earnings History</CardTitle>
                <CardDescription>All payments received for completed tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">No Earnings Yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete tasks to start earning money!
                    </p>
                    <Button className="mt-4" onClick={() => navigate('/browse')}>
                      Browse Tasks
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {tx.task?.title || 'Task Payment'}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>From: {tx.payer?.full_name || 'Client'}</span>
                            <span className="text-muted-foreground/50">•</span>
                            <span>{format(new Date(tx.created_at), 'MMM d, yyyy')}</span>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <p className="font-bold text-green-600">
                            +${tx.payout_amount.toFixed(2)}
                          </p>
                          {getStatusBadge(tx.status, tx.escrow_status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <PayoutAccountSetup />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      {/* Withdrawal Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
            <DialogDescription>
              Request a withdrawal from your escrow balance to your bank account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 bg-blue-500/10 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Available Balance</span>
                <span className="text-xl font-bold text-blue-600">${summary.inEscrow.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Withdrawal Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={summary.inEscrow}
                  placeholder="0.00"
                  className="pl-7"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>
              <Button 
                variant="link" 
                size="sm" 
                className="h-auto p-0"
                onClick={() => setWithdrawAmount(summary.inEscrow.toFixed(2))}
              >
                Withdraw Full Balance
              </Button>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <p>💰 Withdrawals are typically processed within 2-3 business days.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleWithdraw} 
              disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowDownToLine className="h-4 w-4 mr-2" />
                  Request Withdrawal
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
