import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, ExternalLink, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BillingSettingsProps {
  user: any;
}

export const BillingSettings = ({ user }: BillingSettingsProps) => {
  const [hasStripe, setHasStripe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkStripe = () => {
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      setHasStripe(!!stripeKey);
    };
    checkStripe();
  }, []);

  const openStripeBilling = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to access billing");
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-billing-portal', {
        body: { return_url: window.location.href },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        toast.error("Failed to open billing portal");
      }
    } catch (error: any) {
      console.error("Billing portal error:", error);
      if (error.message?.includes("No such customer") || error.message?.includes("customer")) {
        toast.info("No billing history found. Complete a purchase first.");
      } else {
        toast.error("Unable to open billing portal. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasStripe) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing & Invoices
          </CardTitle>
          <CardDescription>
            Manage your billing information and view invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Billing information is not currently available for your account.
            </p>
            <p className="text-sm text-muted-foreground">
              Payment features will be available once you complete your first transaction.
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
          <CreditCard className="h-5 w-5" />
          Billing & Invoices
        </CardTitle>
        <CardDescription>
          Manage your billing information and view payment history
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Payment Method</h4>
          <p className="text-sm text-muted-foreground mb-4">
            View and update your payment methods, billing address, and payment history through the secure billing portal.
          </p>
          <Button onClick={openStripeBilling} variant="outline" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            Open Billing Portal
          </Button>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Invoice History</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Access all your past invoices and receipts through the billing portal.
          </p>
          <Button onClick={openStripeBilling} variant="outline" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Receipt className="mr-2 h-4 w-4" />
            )}
            View Invoices
          </Button>
        </div>

        <div className="flex items-start gap-2 text-sm text-muted-foreground p-3 bg-green-500/10 rounded-lg border border-green-500/20">
          <AlertCircle className="h-4 w-4 text-green-600 mt-0.5" />
          <p>
            All payments are processed securely by Stripe. Your payment information is never stored on our servers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
