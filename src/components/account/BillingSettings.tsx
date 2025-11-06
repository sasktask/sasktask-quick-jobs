import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, ExternalLink, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface BillingSettingsProps {
  user: any;
}

export const BillingSettings = ({ user }: BillingSettingsProps) => {
  const [hasStripe, setHasStripe] = useState(false);

  useEffect(() => {
    // Check if Stripe is configured
    const checkStripe = () => {
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      setHasStripe(!!stripeKey);
    };
    checkStripe();
  }, []);

  const openStripeBilling = () => {
    // This would open the Stripe customer portal
    // You would need to implement a backend endpoint to create a portal session
    toast.info("Stripe billing portal integration coming soon!");
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
              Stripe integration is not configured. Contact your administrator if you need access to billing features.
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
            View and update your payment methods, billing address, and payment history through the Stripe billing portal.
          </p>
          <Button onClick={openStripeBilling} variant="outline">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Billing Portal
          </Button>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Invoice History</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Access all your past invoices and receipts through the billing portal.
          </p>
          <Button onClick={openStripeBilling} variant="outline">
            <Receipt className="mr-2 h-4 w-4" />
            View Invoices
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            All payments are processed securely by Stripe. Your payment information is never stored on our servers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
