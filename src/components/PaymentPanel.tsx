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
  const platformFee = amount * platformFeePercentage;
  const payoutAmount = amount - platformFee;

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Create payment record
      const { error } = await supabase.from("payments").insert({
        booking_id: bookingId,
        task_id: taskId,
        payer_id: payerId,
        payee_id: payeeId,
        amount,
        platform_fee: platformFee,
        payout_amount: payoutAmount,
        status: "completed",
        payment_method: "mock_payment", // In production, integrate with Stripe
        transaction_id: `txn_${Date.now()}`,
        paid_at: new Date().toISOString(),
        payout_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Update booking status to completed
      await supabase
        .from("bookings")
        .update({ status: "completed" })
        .eq("id", bookingId);

      // Update task status to completed
      await supabase
        .from("tasks")
        .update({ status: "completed" })
        .eq("id", taskId);

      setPaymentComplete(true);
      
      toast({
        title: "Payment Successful!",
        description: `$${payoutAmount.toFixed(2)} will be sent to ${payeeName}.`,
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
      <Card className="border-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            Payment Complete
          </CardTitle>
          <CardDescription>
            The task has been completed and payment has been processed.
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
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Tasker Received:</span>
              <span className="text-green-600">${payoutAmount.toFixed(2)}</span>
            </div>
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
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Task Amount:</span>
              <span className="font-semibold">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Platform Fee (15%):</span>
              <span>-${platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span>Tasker Gets:</span>
              <span className="text-primary">${payoutAmount.toFixed(2)}</span>
            </div>
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