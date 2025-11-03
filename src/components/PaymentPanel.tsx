import { useState, useEffect } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { StripePaymentForm } from "./StripePaymentForm";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentPanelProps {
  bookingId: string;
  taskId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  payeeName: string;
  onPaymentComplete?: () => void;
}

export const PaymentPanel = ({ 
  bookingId, 
  taskId, 
  payerId, 
  payeeId, 
  amount, 
  payeeName,
  onPaymentComplete 
}: PaymentPanelProps) => {
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const { toast } = useToast();

  // Fetch Stripe publishable key on mount
  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const { data, error: configError } = await supabase.functions.invoke("get-stripe-config");
        
        if (configError) throw configError;
        if (!data?.publishableKey) throw new Error("Publishable key not found");
        
        setStripePromise(loadStripe(data.publishableKey));
      } catch (err: any) {
        console.error("Failed to initialize Stripe:", err);
        setError("Failed to initialize payment system. Please try again later.");
      }
    };

    initializeStripe();
  }, []);

  const platformFeePercentage = 0.15; // 15% platform fee
  const taxPercentage = 0.05; // 5% GST in Saskatchewan
  const platformFee = amount * platformFeePercentage;
  const taxAmount = amount * taxPercentage;
  const payoutAmount = amount - platformFee;

  const handleInitiatePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call edge function to create payment intent
      const { data, error: functionError } = await supabase.functions.invoke(
        "create-payment-intent",
        {
          body: {
            amount,
            bookingId,
            taskId,
            payeeId,
          },
        }
      );

      if (functionError) throw functionError;
      if (!data?.clientSecret) throw new Error("Failed to create payment intent");

      setClientSecret(data.clientSecret);
    } catch (err: any) {
      console.error("Payment initiation error:", err);
      setError(err.message || "Failed to initiate payment");
      toast({
        title: "Payment Error",
        description: err.message || "Failed to initiate payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setPaymentComplete(true);
    
    toast({
      title: "Payment Successful! 🎉",
      description: "Your payment is secured in escrow. The tasker will be paid after task completion.",
    });

    // Refresh the booking page
    if (onPaymentComplete) {
      onPaymentComplete();
    }
  };

  if (paymentComplete) {
    return (
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <CheckCircle className="h-6 w-6" />
            Payment Secured in Escrow
          </CardTitle>
          <CardDescription>
            Payment is held securely. Tasker will be paid after you confirm task completion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Task Amount:</span>
              <span className="font-semibold">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Platform Fee (15%):</span>
              <span>${platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax (5% GST):</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Tasker Will Receive:</span>
              <span className="text-primary">${payoutAmount.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
            <p className="text-xs text-muted-foreground">
              💼 Payment is held securely until task completion. Confirm completion to release funds to the tasker.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !clientSecret) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-6 w-6" />
            Payment Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={handleInitiatePayment} variant="outline" className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (clientSecret && stripePromise) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Complete Payment
          </CardTitle>
          <CardDescription>
            Pay {payeeName} securely with Stripe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripePaymentForm
              clientSecret={clientSecret}
              amount={amount}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setClientSecret(null)}
            />
          </Elements>
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
              <span>${platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tax (5% GST):</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-primary/20">
              <span>Total to Pay:</span>
              <span className="text-primary">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground pt-2">
              <span>Tasker Gets (After Completion):</span>
              <span className="font-semibold">${payoutAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💰 <strong>Escrow Protection:</strong> Your payment will be held securely until you confirm task completion. 
              The tasker receives payout only after you approve.
            </p>
          </div>

          <Button 
            onClick={handleInitiatePayment} 
            disabled={loading || !stripePromise}
            className="w-full"
            size="lg"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!stripePromise ? "Initializing..." : loading ? "Preparing Payment..." : `Pay $${amount.toFixed(2)} CAD`}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By clicking Pay, you agree to the payment terms and authorize the transaction via Stripe.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
