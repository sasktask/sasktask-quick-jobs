import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Plus, Trash2, Shield } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

const AddPaymentMethodForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) throw error;
      if (!paymentMethod) throw new Error("Failed to create payment method");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Save to database
      const { error: dbError } = await supabase
        .from("payment_methods")
        .insert({
          user_id: user.id,
          stripe_payment_method_id: paymentMethod.id,
          card_brand: paymentMethod.card?.brand,
          card_last4: paymentMethod.card?.last4,
          card_exp_month: paymentMethod.card?.exp_month,
          card_exp_year: paymentMethod.card?.exp_year,
        });

      if (dbError) throw dbError;

      toast({
        title: "Card Added!",
        description: "Your payment method has been saved securely.",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": { color: "#aab7c4" },
              },
            },
          }}
        />
      </div>
      <Button type="submit" disabled={!stripe || isProcessing} className="w-full">
        {isProcessing ? "Processing..." : "Add Card"}
      </Button>
    </form>
  );
};

export const PaymentMethodManager = () => {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("payment_methods")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Card Removed",
        description: "Payment method has been deleted.",
      });

      fetchPaymentMethods();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading payment methods...</div>;
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>Manage your credit and debit cards</CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Card
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <Elements stripe={stripePromise}>
            <AddPaymentMethodForm
              onSuccess={() => {
                setShowAddForm(false);
                fetchPaymentMethods();
              }}
            />
          </Elements>
        )}

        {paymentMethods.length === 0 && !showAddForm && (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No payment methods saved</p>
            <p className="text-sm">Add a card to make payments easier</p>
          </div>
        )}

        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold capitalize">
                    {method.card_brand} •••• {method.card_last4}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires {method.card_exp_month}/{method.card_exp_year}
                  </p>
                </div>
                {method.is_default && (
                  <Badge variant="secondary">Default</Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(method.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg text-sm">
          <Shield className="h-4 w-4 text-primary mt-0.5" />
          <p className="text-muted-foreground">
            Your payment information is securely stored and encrypted by Stripe. 
            We never store your full card details.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
