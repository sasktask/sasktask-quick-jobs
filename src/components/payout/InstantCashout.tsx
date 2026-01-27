import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Zap, 
  Clock, 
  Loader2,
  CreditCard,
  ArrowRight,
  Info
} from 'lucide-react';

interface InstantCashoutProps {
  availableBalance: number;
  bankLast4: string | null;
  onSuccess: () => void;
}

export function InstantCashout({ availableBalance, bankLast4, onSuccess }: InstantCashoutProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState(Math.min(50, availableBalance));
  const [isProcessing, setIsProcessing] = useState(false);
  
  const instantFee = 0.50; // $0.50 instant transfer fee
  const netAmount = amount - instantFee;
  
  const handleInstantCashout = async () => {
    if (amount < 1) {
      toast({
        title: 'Minimum $1 Required',
        description: 'Please select at least $1 for instant cashout.',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('request-withdrawal', {
        body: { amount, isInstant: true }
      });

      if (error) throw error;

      toast({
        title: 'Instant Cashout Sent! ⚡',
        description: `$${netAmount.toFixed(2)} is on its way to your bank ending in ${bankLast4}. Arrives in minutes.`
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Cashout Failed',
        description: error.message || 'Failed to process instant cashout.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (availableBalance < 1) {
    return (
      <Card className="border-muted">
        <CardContent className="py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Instant Cashout</h3>
          <p className="text-muted-foreground text-sm">
            Earn at least $1.00 to unlock instant cashout
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Instant Cashout</CardTitle>
                <CardDescription>Get your money in minutes</CardDescription>
              </div>
            </div>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              <Clock className="h-3 w-3 mr-1" />
              Instant
            </Badge>
          </div>
        </CardHeader>
      </div>
      
      <CardContent className="space-y-6 pt-4">
        {/* Amount Display */}
        <div className="text-center py-4">
          <div className="text-5xl font-bold text-foreground tracking-tight">
            ${amount.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Available: ${availableBalance.toFixed(2)}
          </p>
        </div>

        {/* Amount Slider */}
        <div className="px-2">
          <Slider
            value={[amount]}
            onValueChange={(values) => setAmount(values[0])}
            max={availableBalance}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>$1</span>
            <span>${availableBalance.toFixed(0)}</span>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex gap-2">
          {[25, 50, 100].filter(a => a <= availableBalance).map((quickAmount) => (
            <Button
              key={quickAmount}
              variant={amount === quickAmount ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAmount(quickAmount)}
              className="flex-1"
            >
              ${quickAmount}
            </Button>
          ))}
          <Button
            variant={amount === availableBalance ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAmount(availableBalance)}
            className="flex-1"
          >
            All
          </Button>
        </div>

        {/* Fee Breakdown */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cashout amount</span>
            <span className="font-medium">${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              Instant fee
              <Info className="h-3 w-3" />
            </span>
            <span className="text-amber-600">-${instantFee.toFixed(2)}</span>
          </div>
          <div className="border-t border-border pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-semibold">You'll receive</span>
              <span className="font-bold text-lg text-primary">${netAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Destination */}
        {bankLast4 && (
          <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">To: Bank Account</p>
              <p className="text-xs text-muted-foreground">•••• •••• •••• {bankLast4}</p>
            </div>
            <Badge variant="outline" className="text-xs">Debit Card</Badge>
          </div>
        )}

        {/* Cashout Button */}
        <Button 
          onClick={handleInstantCashout}
          disabled={isProcessing || amount < 1}
          className="w-full h-12 text-base gap-2"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              Cash Out ${netAmount.toFixed(2)} Instantly
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Funds typically arrive in 30 minutes or less
        </p>
      </CardContent>
    </Card>
  );
}
