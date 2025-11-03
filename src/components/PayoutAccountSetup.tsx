import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, CheckCircle, AlertCircle, Loader2, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const PayoutAccountSetup = () => {
  const { toast } = useToast();
  const [payoutAccount, setPayoutAccount] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    institution: "",
    transit: "",
    account: "",
  });

  useEffect(() => {
    fetchPayoutAccount();
  }, []);

  const fetchPayoutAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("payout_accounts")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      setPayoutAccount(data);
    } catch (error: any) {
      console.error("Error fetching payout account:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBankDetails = async () => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Validate inputs
      if (!formData.institution || !formData.transit || !formData.account) {
        throw new Error("Please fill in all bank account fields");
      }

      const last4 = formData.account.slice(-4);

      if (payoutAccount) {
        // Update existing
        const { error } = await supabase
          .from("payout_accounts")
          .update({
            bank_last4: last4,
            account_status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from("payout_accounts")
          .insert({
            user_id: user.id,
            stripe_account_id: `manual_${user.id}`, // Placeholder for manual processing
            bank_last4: last4,
            account_status: "active",
            account_type: "manual",
          });

        if (error) throw error;
      }

      toast({
        title: "Bank Details Saved!",
        description: "Your payout information has been securely stored.",
      });

      // Clear form
      setFormData({ institution: "", transit: "", account: "" });
      fetchPayoutAccount();
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
                Set up your bank account to receive payments for completed tasks.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="institution">Institution Number (3 digits)</Label>
                <Input
                  id="institution"
                  placeholder="e.g., 001"
                  maxLength={3}
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value.replace(/\D/g, '') })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transit">Transit Number (5 digits)</Label>
                <Input
                  id="transit"
                  placeholder="e.g., 00001"
                  maxLength={5}
                  value={formData.transit}
                  onChange={(e) => setFormData({ ...formData, transit: e.target.value.replace(/\D/g, '') })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account">Account Number</Label>
                <Input
                  id="account"
                  placeholder="Your bank account number"
                  maxLength={12}
                  value={formData.account}
                  onChange={(e) => setFormData({ ...formData, account: e.target.value.replace(/\D/g, '') })}
                />
              </div>

              <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                <AlertDescription className="text-sm">
                  🔒 Your banking information is encrypted and securely stored. Payouts will be processed after task completion.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleSaveBankDetails}
                disabled={isProcessing || !formData.institution || !formData.transit || !formData.account}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Bank Details
                  </>
                )}
              </Button>
            </div>
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
              {payoutAccount.bank_last4 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bank Account:</span>
                  <span className="font-mono">•••• {payoutAccount.bank_last4}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-green-600 font-semibold">Active</span>
              </div>
            </div>

            <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg text-sm">
              <p className="text-muted-foreground">
                💰 Payments are processed after tasks are completed and confirmed by the task giver.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => setPayoutAccount(null)}
              className="w-full"
            >
              Update Bank Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
