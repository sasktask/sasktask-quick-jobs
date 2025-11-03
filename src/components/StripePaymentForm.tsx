import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const StripePaymentForm = ({ 
  clientSecret, 
  amount,
  onSuccess, 
  onCancel 
}: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card element not found");
      setLoading(false);
      return;
    }

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (confirmError) {
        setError(confirmError.message || "Payment failed");
        toast({
          title: "Payment Failed",
          description: confirmError.message,
          variant: "destructive",
        });
      } else if (paymentIntent?.status === "succeeded") {
        toast({
          title: "Payment Successful!",
          description: "Your payment has been secured in escrow.",
        });
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const platformFee = amount * 0.15;
  const tax = amount * 0.05;
  const total = amount + platformFee + tax;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Task Amount</span>
          <span className="font-semibold">${amount.toFixed(2)} CAD</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Platform Fee (15%)</span>
          <span>${platformFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">GST (5%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-bold text-lg">
          <span>Total to Pay</span>
          <span className="text-primary">${total.toFixed(2)} CAD</span>
        </div>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Card Details</span>
        </div>
        <div className="bg-background p-3 rounded border">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "hsl(var(--foreground))",
                  "::placeholder": {
                    color: "hsl(var(--muted-foreground))",
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <AlertDescription className="text-sm">
          💰 <strong>Escrow Protection:</strong> Your payment will be held securely until you confirm the task is completed satisfactorily.
        </AlertDescription>
      </Alert>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Pay ${total.toFixed(2)}
        </Button>
      </div>
    </form>
  );
};
