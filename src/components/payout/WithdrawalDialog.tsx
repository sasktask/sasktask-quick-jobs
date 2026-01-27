import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowDownToLine, 
  Loader2,
  Wallet,
  Clock,
  Shield,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance: number;
  bankLast4: string | null;
  onSuccess: () => void;
}

export function WithdrawalDialog({ 
  open, 
  onOpenChange, 
  availableBalance, 
  bankLast4,
  onSuccess 
}: WithdrawalDialogProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid withdrawal amount.',
        variant: 'destructive'
      });
      return;
    }

    if (withdrawAmount > availableBalance) {
      toast({
        title: 'Insufficient Balance',
        description: 'You cannot withdraw more than your available escrow balance.',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('request-withdrawal', {
        body: { amount: withdrawAmount }
      });

      if (error) throw error;

      // Send payout notification email
      try {
        await supabase.functions.invoke('send-payout-notification', {
          body: { 
            payoutAmount: withdrawAmount,
            payoutType: 'manual',
            bankLast4: bankLast4,
            transactionCount: data?.processedCount || 1
          }
        });
      } catch (emailError) {
        console.error('Failed to send payout notification:', emailError);
      }

      toast({
        title: 'Withdrawal Requested! 🎉',
        description: `Your withdrawal of $${withdrawAmount.toFixed(2)} has been submitted. Funds will arrive in 2-3 business days.`
      });

      onOpenChange(false);
      setAmount('');
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Withdrawal Failed',
        description: error.message || 'Failed to process withdrawal request.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const quickAmounts = [25, 50, 100].filter(a => a <= availableBalance);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDownToLine className="h-5 w-5" />
            Request Withdrawal
          </DialogTitle>
          <DialogDescription>
            Transfer funds from escrow to your bank account.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Available Balance Card */}
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-muted-foreground">Available Balance</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">${availableBalance.toFixed(2)}</span>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          {quickAmounts.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Quick Select</Label>
              <div className="flex gap-2">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant={amount === quickAmount.toString() ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAmount(quickAmount.toString())}
                    className="flex-1"
                  >
                    ${quickAmount}
                  </Button>
                ))}
                <Button
                  variant={amount === availableBalance.toFixed(2) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAmount(availableBalance.toFixed(2))}
                  className="flex-1"
                >
                  Max
                </Button>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={availableBalance}
                placeholder="0.00"
                className="pl-7 text-lg font-medium"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Bank Account Info */}
          {bankLast4 && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-muted-foreground">Transferring to account ending in</span>
              <span className="font-mono font-medium">•••• {bankLast4}</span>
            </div>
          )}

          {/* Info Alert */}
          <Alert className="bg-muted/50 border-muted">
            <Clock className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Withdrawals are typically processed within <strong>2-3 business days</strong>. 
              You'll receive an email confirmation once the transfer is complete.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleWithdraw} 
            disabled={isProcessing || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Confirm Withdrawal
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
