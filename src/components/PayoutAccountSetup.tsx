import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, ExternalLink, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const PayoutAccountSetup = () => {
  const { toast } = useToast();
  const [payoutAccount, setPayoutAccount] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPayoutAccount();
  }, []);

  const fetchPayoutAccount = async () => {
    try {
      const { data, error } = await supabase
        .from("payout_accounts")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setPayoutAccount(data);
    } catch (error: any) {
      console.error("Error fetching payout account:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupPayout = async () => {
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("setup-payout-account", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.url) {
        // Open Stripe onboarding in new tab
        window.open(data.url, "_blank");
        toast({
          title: "Opening Stripe Setup",
          description: "Complete your payout account setup in the new tab.",
        });
      }

      // Refresh account status after a delay
      setTimeout(fetchPayoutAccount, 2000);
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

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading payout information...</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    if (!payoutAccount) return null;
    
    switch (payoutAccount.account_status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
      default:
        return <Badge variant="outline">Not Set Up</Badge>;
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payout Account
            </CardTitle>
            <CardDescription>Receive payments for completed tasks</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!payoutAccount || payoutAccount.account_status !== "active" ? (
          <>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {!payoutAccount 
                  ? "Set up your payout account to receive payments directly to your bank account."
                  : "Complete your payout account setup to start receiving payments."}
              </AlertDescription>
            </Alert>

            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold">What you'll need:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Government-issued ID (Driver's License or Passport)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Bank account details (Institution, Transit, and Account numbers)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Social Insurance Number (SIN) for tax reporting</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Business details (if applicable)</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={handleSetupPayout}
              disabled={isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {!payoutAccount ? "Set Up Payout Account" : "Continue Setup"}
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                ✅ Your payout account is active and ready to receive payments!
              </AlertDescription>
            </Alert>

            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Account ID:</span>
                <span className="font-mono">{payoutAccount.stripe_account_id.slice(-8)}</span>
              </div>
              {payoutAccount.bank_last4 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bank Account:</span>
                  <span>•••• {payoutAccount.bank_last4}</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg text-sm">
              <p className="text-muted-foreground">
                💰 Payments are automatically transferred to your account after tasks are completed and confirmed.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
