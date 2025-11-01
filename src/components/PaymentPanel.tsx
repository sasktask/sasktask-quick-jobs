import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, CreditCard, CheckCircle } from "lucide-react";

interface PaymentPanelProps {
  bookingId: string;
  taskId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  payeeName: string;
}

export const PaymentPanel = ({ bookingId, taskId, payerId, payeeId, amount, payeeName }: PaymentPanelProps) => {
  const [loading, setLoading] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const { toast } = useToast();

  const platformFeePercentage = 0.15; // 15% platform fee
  const taxPercentage = 0.05; // 5% GST in Saskatchewan
  const platformFee = amount * platformFeePercentage;
  const taxAmount = amount * taxPercentage;
  const payoutAmount = amount - platformFee - taxAmount;

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Create payment record with escrow (held status)
      const { error } = await supabase.from("payments").insert({
        booking_id: bookingId,
        task_id: taskId,
        payer_id: payerId,
        payee_id: payeeId,
        amount,
        platform_fee: platformFee,
        tax_deducted: taxAmount,
        payout_amount: payoutAmount,
        status: "completed",
        escrow_status: "held", // Payment held in escrow
        payment_method: "mock_payment", // In production, integrate with Stripe
        transaction_id: `txn_${Date.now()}`,
        paid_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Update booking status to in_progress with payment agreed
      await supabase
        .from("bookings")
        .update({ 
          status: "in_progress",
          payment_agreed: true,
          agreed_at: new Date().toISOString()
        })
        .eq("id", bookingId);

      setPaymentComplete(true);
      
      toast({
        title: "Payment Held in Escrow! 🎉",
        description: `$${amount.toFixed(2)} is held securely. ${payeeName} will receive $${payoutAmount.toFixed(2)} after task completion.`,
      });
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (paymentComplete) {
    return (
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <CheckCircle className="h-6 w-6" />
            Payment Held in Escrow
          </CardTitle>
          <CardDescription>
            Payment is secured. Tasker will be paid after you confirm task completion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Amount Paid:</span>
              <span className="font-semibold">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Platform Fee (15%):</span>
              <span>-${platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax (5% GST):</span>
              <span>-${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Tasker Will Receive:</span>
              <span className="text-primary">${payoutAmount.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
            <p className="text-xs text-muted-foreground">
              💼 Like Uber: Payment is held securely until task completion. Confirm completion to release funds to the tasker.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          Complete Payment
        </CardTitle>
        <CardDescription>
          Pay {payeeName} for completing the task
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-4 rounded-lg border border-primary/20 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Task Amount:</span>
              <span className="text-xl font-bold">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Platform Fee (15%):</span>
              <span className="text-destructive font-semibold">-${platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tax (5% GST):</span>
              <span className="text-destructive font-semibold">-${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-primary/20">
              <span>Tasker Gets (After Completion):</span>
              <span className="text-primary">${payoutAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💰 <strong>Escrow Protection:</strong> Your payment will be held securely until you confirm task completion. 
              The tasker receives payout only after you approve, just like Uber!
            </p>
          </div>

          <div className="space-y-3">
            <Label>Payment Method</Label>
            <div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-card">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Mock Payment (Demo)</span>
            </div>
            <p className="text-xs text-muted-foreground">
              In production, this would integrate with Stripe for secure payment processing.
            </p>
          </div>

          <Button 
            onClick={handlePayment} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By clicking Pay, you agree to the payment terms and authorize the transaction.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};