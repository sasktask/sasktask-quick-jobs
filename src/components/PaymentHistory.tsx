import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Receipt,
  ChevronRight,
  Loader2,
  FileText,
  Mail,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';

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
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [emailingId, setEmailingId] = useState<string | null>(null);
  const { toast } = useToast();

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

  const downloadInvoice = async (paymentId: string) => {
    setDownloadingId(paymentId);
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice', {
        body: { paymentId }
      });

      if (error) throw error;
      if (!data?.html) throw new Error('Failed to generate invoice');

      // Sanitize HTML content before rendering to prevent XSS
      const sanitizedHtml = DOMPurify.sanitize(data.html, {
        WHOLE_DOCUMENT: true,
        ALLOWED_TAGS: ['html', 'head', 'body', 'meta', 'title', 'style', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'p', 'h1', 'h2', 'h3', 'span', 'strong', 'br'],
        ALLOWED_ATTR: ['class', 'style', 'charset', 'name', 'content'],
      });

      // Create a new window with the sanitized invoice HTML and trigger print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(sanitizedHtml);
        printWindow.document.close();
        
        // Add print functionality
        printWindow.onload = () => {
          const printBtn = printWindow.document.createElement('button');
          printBtn.textContent = '🖨️ Print / Save as PDF';
          printBtn.style.cssText = 'position:fixed;top:10px;right:10px;padding:12px 24px;background:#2563eb;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;z-index:1000;';
          printBtn.onclick = () => printWindow.print();
          printWindow.document.body.appendChild(printBtn);
        };
      }

      toast({
        title: 'Invoice Generated',
        description: 'Your invoice is ready. Use the print button to save as PDF.',
      });
    } catch (error: any) {
      console.error('Invoice download error:', error);
      toast({
        title: 'Download Failed',
        description: error.message || 'Failed to generate invoice',
        variant: 'destructive',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const canDownloadInvoice = (payment: Payment) => {
    return payment.status === 'completed' || payment.escrow_status === 'held' || payment.escrow_status === 'released';
  };

  const emailInvoice = async (paymentId: string, recipientEmail?: string) => {
    setEmailingId(paymentId);
    try {
      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: { paymentId, recipientEmail }
      });

      if (error) throw error;

      toast({
        title: 'Invoice Sent',
        description: data.message || 'Invoice has been sent to your email.',
      });
    } catch (error: any) {
      console.error('Email invoice error:', error);
      toast({
        title: 'Email Failed',
        description: error.message || 'Failed to send invoice email',
        variant: 'destructive',
      });
    } finally {
      setEmailingId(null);
    }
  };

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

                  {/* Amount, Status & Actions */}
                  <div className="flex items-center gap-3">
                    <div className="text-right space-y-1">
                      <p className={`font-bold ${incoming ? 'text-green-600' : 'text-foreground'}`}>
                        {incoming ? '+' : '-'}${displayAmount.toFixed(2)}
                      </p>
                      {getStatusBadge(payment.status, payment.escrow_status)}
                    </div>
                    
                    {/* Invoice Actions */}
                    {canDownloadInvoice(payment) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0"
                            disabled={downloadingId === payment.id || emailingId === payment.id}
                          >
                            {(downloadingId === payment.id || emailingId === payment.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreVertical className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => downloadInvoice(payment.id)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Download Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => emailInvoice(payment.id)}>
                            <Mail className="h-4 w-4 mr-2" />
                            Email Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
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