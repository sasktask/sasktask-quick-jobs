import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PaymentHistory } from '@/components/PaymentHistory';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  CreditCard,
  Settings
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

export default function Payments() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalSpent: 0,
    pendingPayments: 0,
    completedPayments: 0,
    inEscrow: 0
  });

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
    fetchStats(user.id);
  };

  const fetchStats = async (userId: string) => {
    try {
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .or(`payer_id.eq.${userId},payee_id.eq.${userId}`);

      if (payments) {
        const earnings = payments
          .filter(p => p.payee_id === userId && (p.status === 'completed' || p.escrow_status === 'released'))
          .reduce((sum, p) => sum + (p.payout_amount || 0), 0);

        const spent = payments
          .filter(p => p.payer_id === userId && (p.status === 'completed' || p.escrow_status === 'held' || p.escrow_status === 'released'))
          .reduce((sum, p) => sum + (p.amount || 0), 0);

        const pending = payments
          .filter(p => p.status === 'pending' || p.status === 'processing')
          .length;

        const completed = payments
          .filter(p => p.status === 'completed' || p.escrow_status === 'released')
          .length;

        const escrow = payments
          .filter(p => p.escrow_status === 'held')
          .reduce((sum, p) => sum + (p.amount || 0), 0);

        setStats({
          totalEarnings: earnings,
          totalSpent: spent,
          pendingPayments: pending,
          completedPayments: completed,
          inEscrow: escrow
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
        title="Payments - SaskTask"
        description="Manage your payments, view transaction history, and track earnings on SaskTask"
      />
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
            <p className="text-muted-foreground mt-1">Manage your transactions and earnings</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/account')}>
              <Settings className="h-4 w-4 mr-2" />
              Payment Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">${stats.totalEarnings.toFixed(2)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Escrow</p>
                  <p className="text-2xl font-bold text-blue-600">${stats.inEscrow.toFixed(2)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedPayments}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <DollarSign className="h-4 w-4" />
              All Transactions
            </TabsTrigger>
            <TabsTrigger value="incoming" className="gap-2">
              <ArrowDownLeft className="h-4 w-4" />
              Incoming
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Outgoing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {user && <PaymentHistory userId={user.id} limit={50} />}
          </TabsContent>

          <TabsContent value="incoming">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownLeft className="h-5 w-5 text-green-600" />
                  Incoming Payments
                </CardTitle>
                <CardDescription>Payments received for completed tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {user && <PaymentHistory userId={user.id} limit={50} showHeader={false} />}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outgoing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-primary" />
                  Outgoing Payments
                </CardTitle>
                <CardDescription>Payments made for tasks you posted</CardDescription>
              </CardHeader>
              <CardContent>
                {user && <PaymentHistory userId={user.id} limit={50} showHeader={false} />}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
