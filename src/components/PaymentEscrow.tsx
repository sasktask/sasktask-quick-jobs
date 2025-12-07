import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Lock,
  Unlock,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface PaymentDetails {
  id: string;
  amount: number;
  platform_fee: number;
  payout_amount: number;
  status: string;
  escrow_status: string;
  created_at: string;
  paid_at: string | null;
  released_at: string | null;
}

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  status: string;
  milestone_order: number;
  completed_at: string | null;
  paid_at: string | null;
}

interface PaymentEscrowProps {
  bookingId: string;
  taskId: string;
  isTaskGiver: boolean;
  payment?: PaymentDetails | null;
  milestones?: Milestone[];
  onPaymentComplete?: () => void;
}

export function PaymentEscrow({ 
  bookingId, 
  taskId, 
  isTaskGiver, 
  payment,
  milestones = [],
  onPaymentComplete 
}: PaymentEscrowProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_escrow': case 'held': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'released': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': case 'released': return <CheckCircle className="h-4 w-4" />;
      case 'in_escrow': case 'held': return <Lock className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const initiatePayment = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { bookingId, taskId }
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
      
      toast({
        title: 'Payment Initiated',
        description: 'Complete your payment in the new window.',
      });
      
      onPaymentComplete?.();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to initiate payment',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const releasePayment = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('confirm-payment', {
        body: { bookingId, action: 'release' }
      });

      if (error) throw error;

      toast({
        title: 'Payment Released',
        description: 'Funds have been released to the tasker.',
      });
      
      onPaymentComplete?.();
    } catch (error: any) {
      console.error('Release error:', error);
      toast({
        title: 'Release Failed',
        description: error.message || 'Failed to release payment',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const totalMilestones = milestones.length;
  const milestoneProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Secure Payment
        </CardTitle>
        <CardDescription>
          Payments are held in escrow until the task is completed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Status */}
        {payment ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="text-2xl font-bold">${payment.amount.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Amount</p>
              </div>
              <Badge className={`${getStatusColor(payment.escrow_status || payment.status)} text-white gap-1`}>
                {getStatusIcon(payment.escrow_status || payment.status)}
                {payment.escrow_status || payment.status}
              </Badge>
            </div>

            {/* Payment breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Task Payment</span>
                <span>${payment.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee (10%)</span>
                <span>-${payment.platform_fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>Tasker Receives</span>
                <span className="text-green-600">${payment.payout_amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  payment.created_at ? 'bg-green-500 text-white' : 'bg-muted'
                }`}>
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Payment Created</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(payment.created_at), 'PPp')}
                  </p>
                </div>
              </div>
              
              <div className="ml-4 w-0.5 h-6 bg-border" />
              
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  payment.paid_at ? 'bg-green-500 text-white' : 'bg-muted'
                }`}>
                  {payment.paid_at ? <Lock className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                </div>
                <div>
                  <p className="font-medium">Held in Escrow</p>
                  <p className="text-xs text-muted-foreground">
                    {payment.paid_at ? format(new Date(payment.paid_at), 'PPp') : 'Pending payment'}
                  </p>
                </div>
              </div>
              
              <div className="ml-4 w-0.5 h-6 bg-border" />
              
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  payment.released_at ? 'bg-green-500 text-white' : 'bg-muted'
                }`}>
                  {payment.released_at ? <Unlock className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </div>
                <div>
                  <p className="font-medium">Released to Tasker</p>
                  <p className="text-xs text-muted-foreground">
                    {payment.released_at ? format(new Date(payment.released_at), 'PPp') : 'Upon completion'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {isTaskGiver && payment.escrow_status === 'held' && (
              <Button 
                onClick={releasePayment} 
                disabled={isProcessing}
                className="w-full gap-2"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Unlock className="h-4 w-4" />
                )}
                Release Payment
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">
              No payment has been made for this task yet.
            </p>
            {isTaskGiver && (
              <Button onClick={initiatePayment} disabled={isProcessing} className="gap-2">
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                Pay & Hold in Escrow
              </Button>
            )}
          </div>
        )}

        {/* Milestones */}
        {milestones.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Milestones</h4>
              <span className="text-sm text-muted-foreground">
                {completedMilestones}/{totalMilestones} complete
              </span>
            </div>
            <Progress value={milestoneProgress} className="h-2" />
            <div className="space-y-2">
              {milestones.map((milestone, index) => (
                <div 
                  key={milestone.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    milestone.status === 'completed' ? 'bg-green-500/10' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      milestone.status === 'completed' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-muted-foreground/20'
                    }`}>
                      {milestone.status === 'completed' ? <CheckCircle className="h-3 w-3" /> : index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{milestone.title}</p>
                      {milestone.description && (
                        <p className="text-xs text-muted-foreground">{milestone.description}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={milestone.status === 'completed' ? 'default' : 'outline'}>
                    ${milestone.amount}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security notice */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 text-sm">
          <Shield className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-600 dark:text-blue-400">Secure Escrow Protection</p>
            <p className="text-muted-foreground mt-1">
              Your payment is held securely until you confirm the task is complete. 
              If there's a dispute, our team will help resolve it.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}