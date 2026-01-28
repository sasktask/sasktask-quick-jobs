import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Wallet, 
  ArrowRight, 
  Shield, 
  Loader2, 
  Zap, 
  Clock,
  Calculator,
  Info,
  CheckCircle2,
  Building2,
  Receipt,
  AlertTriangle,
  Lock
} from 'lucide-react';

interface SecureWithdrawalFlowProps {
  availableBalance: number;
  inEscrow: number;
  bankLast4: string | null;
  onSuccess: () => void;
}

interface WithdrawalBreakdown {
  grossAmount: number;
  platformFee: number;
  instantFee: number;
  netAmount: number;
  estimatedTaxLiability: number;
  gstAmount: number;
  pstAmount: number;
}

export function SecureWithdrawalFlow({ 
  availableBalance, 
  inEscrow,
  bankLast4, 
  onSuccess 
}: SecureWithdrawalFlowProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState(Math.min(100, availableBalance));
  const [isInstant, setIsInstant] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [step, setStep] = useState<'amount' | 'review' | 'confirm'>('amount');

  // Tax rates (Saskatchewan) & Uber-style fees
  const PLATFORM_FEE_RATE = 0; // Already deducted during payment
  const INSTANT_FEE = 1.25; // $1.25 per instant transfer (Uber standard)
  const GST_RATE = 0.05;
  const PST_RATE = 0.06;
  const MAX_DAILY_CASHOUTS = 6; // Maximum 6 cashouts per day

  const calculateBreakdown = (): WithdrawalBreakdown => {
    const grossAmount = amount;
    const platformFee = 0; // Already taken during payment creation
    const instantFee = isInstant ? INSTANT_FEE : 0;
    const netAmount = grossAmount - platformFee - instantFee;
    
    // Tax is informational only - user is responsible for paying
    const gstAmount = Math.round(grossAmount * GST_RATE * 100) / 100;
    const pstAmount = Math.round(grossAmount * PST_RATE * 100) / 100;
    const estimatedTaxLiability = gstAmount + pstAmount;

    return {
      grossAmount,
      platformFee,
      instantFee,
      netAmount,
      estimatedTaxLiability,
      gstAmount,
      pstAmount
    };
  };

  const breakdown = calculateBreakdown();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const handleWithdraw = async () => {
    if (!acceptedTerms) {
      toast({
        title: 'Terms Required',
        description: 'Please accept the terms to continue.',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('request-withdrawal', {
        body: { 
          amount: breakdown.grossAmount,
          isInstant,
          taxBreakdown: {
            grossAmount: breakdown.grossAmount,
            platformFee: breakdown.platformFee,
            instantFee: breakdown.instantFee,
            netAmount: breakdown.netAmount,
            estimatedTaxLiability: breakdown.estimatedTaxLiability
          }
        }
      });

      if (error) throw error;

      // Send notification
      try {
        await supabase.functions.invoke('send-payout-notification', {
          body: { 
            payoutAmount: breakdown.netAmount,
            payoutType: isInstant ? 'instant' : 'standard',
            bankLast4
          }
        });
      } catch (e) {
        console.error('Notification failed:', e);
      }

      toast({
        title: isInstant ? '⚡ Instant Payout Sent!' : '✅ Withdrawal Requested',
        description: isInstant 
          ? `${formatCurrency(breakdown.netAmount)} is on its way. Arrives in minutes.`
          : `${formatCurrency(breakdown.netAmount)} will arrive in 2-3 business days.`
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Withdrawal Failed',
        description: error.message || 'Unable to process withdrawal.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (availableBalance < 1) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Wallet className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No Funds Available</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Complete tasks to earn money. Funds become available after the 72-hour 
            escrow period or when the task giver confirms completion.
          </p>
          {inEscrow > 0 && (
            <div className="mt-4 p-3 bg-amber-500/10 rounded-lg inline-block">
              <p className="text-sm text-amber-600">
                <Clock className="h-4 w-4 inline mr-1" />
                {formatCurrency(inEscrow)} in escrow (pending release)
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Secure Withdrawal</CardTitle>
              <CardDescription>Transfer funds to your bank</CardDescription>
            </div>
          </div>
          <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
            <Lock className="h-3 w-3 mr-1" />
            Secure
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Available Balance */}
        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/5 rounded-xl border border-blue-500/20">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Available to Withdraw</p>
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(availableBalance)}</p>
            </div>
            {inEscrow > 0 && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">In Escrow</p>
                <p className="text-sm font-medium text-amber-600">{formatCurrency(inEscrow)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Amount Selection */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Select Amount</Label>
          
          {/* Amount Display */}
          <div className="text-center py-4 bg-muted/30 rounded-lg">
            <p className="text-4xl font-bold">{formatCurrency(amount)}</p>
          </div>

          {/* Slider */}
          <Slider
            value={[amount]}
            onValueChange={(v) => setAmount(v[0])}
            max={availableBalance}
            min={1}
            step={1}
            className="py-4"
          />

          {/* Quick Amounts */}
          <div className="flex gap-2">
            {[25, 50, 100, availableBalance].filter((a, i, arr) => 
              a <= availableBalance && (i < 3 || arr.indexOf(a) === i)
            ).map((quickAmount, i) => (
              <Button
                key={quickAmount}
                variant={amount === quickAmount ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAmount(quickAmount)}
                className="flex-1"
              >
                {i === 3 || quickAmount === availableBalance ? 'Max' : formatCurrency(quickAmount)}
              </Button>
            ))}
          </div>
        </div>

        {/* Transfer Speed */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Transfer Speed</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsInstant(false)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                !isInstant 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Standard</span>
              </div>
              <p className="text-xs text-muted-foreground">2-3 business days</p>
              <p className="text-sm font-semibold text-green-600 mt-1">Free</p>
            </button>

            <button
              onClick={() => setIsInstant(true)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                isInstant 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Instant</span>
              </div>
              <p className="text-xs text-muted-foreground">Within 30 minutes</p>
              <p className="text-sm font-semibold text-amber-600 mt-1">{formatCurrency(INSTANT_FEE)} fee</p>
              <p className="text-xs text-muted-foreground mt-1">Max {MAX_DAILY_CASHOUTS}x/day</p>
            </button>
          </div>
        </div>

        <Separator />

        {/* Breakdown */}
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="h-4 w-4" />
            <span className="font-medium text-sm">Payout Summary</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Withdrawal Amount</span>
            <span className="font-medium">{formatCurrency(breakdown.grossAmount)}</span>
          </div>

          {isInstant && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Instant Transfer Fee</span>
              <span className="text-red-500">-{formatCurrency(breakdown.instantFee)}</span>
            </div>
          )}

          <Separator className="my-2" />

          <div className="flex justify-between">
            <span className="font-semibold">You'll Receive</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(breakdown.netAmount)}</span>
          </div>
        </div>

        {/* Tax Information */}
        <Alert className="bg-amber-500/10 border-amber-500/30">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm">
            <strong>Tax Reminder:</strong> As a self-employed contractor, you're responsible 
            for reporting this income. Estimated tax on this withdrawal: 
            <strong className="ml-1">{formatCurrency(breakdown.estimatedTaxLiability)}</strong>
            <span className="text-xs block mt-1 text-muted-foreground">
              (GST: {formatCurrency(breakdown.gstAmount)} + PST: {formatCurrency(breakdown.pstAmount)})
            </span>
          </AlertDescription>
        </Alert>

        {/* Bank Account */}
        {bankLast4 && (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Depositing to</p>
              <p className="text-xs text-muted-foreground">Bank Account •••• {bankLast4}</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
        )}

        {/* Terms */}
        <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
          <Checkbox
            id="terms"
            checked={acceptedTerms}
            onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
          />
          <Label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
            I confirm I am the account holder and understand I'm responsible for reporting 
            this income and paying applicable taxes. I agree to the withdrawal terms.
          </Label>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleWithdraw}
          disabled={isProcessing || !acceptedTerms || amount < 1}
          className="w-full h-12 text-base gap-2"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing Securely...
            </>
          ) : (
            <>
              {isInstant ? <Zap className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
              Withdraw {formatCurrency(breakdown.netAmount)}
              {isInstant && ' Instantly'}
            </>
          )}
        </Button>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>Bank-level encryption</span>
          </div>
          <div className="flex items-center gap-1">
            <Receipt className="h-3 w-3" />
            <span>CRA compliant</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
