import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Wallet, AlertTriangle, Plus, History, Shield, RefreshCw, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MINIMUM_BALANCE = 50;
const QUICK_AMOUNTS = [25, 50, 100, 200];

interface WalletTransaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  balance_after: number;
  created_at: string;
}

export const WalletCard = () => {
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<string>("50");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [showTransactions, setShowTransactions] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchWalletData();
    
    // Check for wallet deposit confirmation from URL
    const params = new URLSearchParams(window.location.search);
    const walletDeposit = params.get("wallet_deposit");
    const amount = params.get("amount");
    
    if (walletDeposit === "success" && amount) {
      confirmWalletDeposit(parseFloat(amount));
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    } else if (walletDeposit === "cancelled") {
      toast({
        title: "Deposit cancelled",
        description: "Your wallet deposit was cancelled.",
        variant: "destructive",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const fetchWalletData = async () => {
    setIsFetching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsFetching(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      } else if (profile) {
        setWalletBalance(profile.wallet_balance || 0);
      }

      const { data: txns, error: txnError } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (txnError) {
        console.error("Error fetching transactions:", txnError);
      } else if (txns) {
        setTransactions(txns as WalletTransaction[]);
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const confirmWalletDeposit = async (amount: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Session expired",
          description: "Please log in again to complete the deposit.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("confirm-wallet-deposit", {
        body: { amount },
      });

      if (error) {
        console.error("Confirm deposit error:", error);
        throw error;
      }

      toast({
        title: "Deposit successful!",
        description: `$${amount.toFixed(2)} has been added to your wallet.`,
      });

      // Refresh wallet data
      await fetchWalletData();
    } catch (error) {
      console.error("Error confirming deposit:", error);
      toast({
        title: "Error",
        description: "Failed to confirm deposit. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handleAddFunds = async (amount?: number) => {
    const depositValue = amount || parseFloat(depositAmount);
    if (isNaN(depositValue) || depositValue < 10) {
      toast({
        title: "Invalid amount",
        description: "Minimum deposit is $10",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Initiating wallet deposit:", depositValue);
      
      const { data, error } = await supabase.functions.invoke("add-wallet-funds", {
        body: { amount: depositValue },
      });

      console.log("Add funds response:", { data, error });

      if (error) {
        console.error("Add funds error:", error);
        throw error;
      }

      if (data?.url) {
        console.log("Redirecting to:", data.url);
        window.location.href = data.url;
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("Error adding funds:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to initiate deposit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isBalanceLow = walletBalance < MINIMUM_BALANCE;

  return (
    <Card className={isBalanceLow ? "border-destructive" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Wallet Balance</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchWalletData}
              disabled={isFetching}
              className="h-8 w-8"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
            {isBalanceLow ? (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Low Balance
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" />
                Protected
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          Minimum $50 required to book or accept tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-4">
          <p className="text-4xl font-bold text-primary">
            ${walletBalance.toFixed(2)}
          </p>
          {isBalanceLow && (
            <p className="text-sm text-destructive mt-2">
              Add ${(MINIMUM_BALANCE - walletBalance).toFixed(2)} more to meet minimum requirement
            </p>
          )}
        </div>

        {/* Quick deposit buttons */}
        <div className="grid grid-cols-4 gap-2">
          {QUICK_AMOUNTS.map((amt) => (
            <Button
              key={amt}
              variant="outline"
              size="sm"
              onClick={() => handleAddFunds(amt)}
              disabled={isLoading}
              className="text-xs"
            >
              ${amt}
            </Button>
          ))}
        </div>

        {/* Custom amount */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              min="10"
              step="5"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Custom amount"
              className="pl-8"
            />
          </div>
          <Button 
            onClick={() => handleAddFunds()} 
            disabled={isLoading} 
            className="gap-2 min-w-[120px]"
          >
            <Plus className="h-4 w-4" />
            {isLoading ? "Processing..." : "Add Funds"}
          </Button>
        </div>

        <div className="pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTransactions(!showTransactions)}
            className="gap-2 w-full"
          >
            <History className="h-4 w-4" />
            {showTransactions ? "Hide" : "View"} Transaction History
          </Button>

          {showTransactions && transactions.length > 0 && (
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
                >
                  <div>
                    <p className="font-medium">{txn.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(txn.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={txn.amount > 0 ? "text-green-600" : "text-destructive"}>
                      {txn.amount > 0 ? "+" : ""}${Math.abs(txn.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Bal: ${txn.balance_after.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showTransactions && transactions.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-4">
              No transactions yet
            </p>
          )}
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg text-sm">
          <p className="font-medium text-amber-800 dark:text-amber-200">
            Cancellation Policy
          </p>
          <ul className="text-amber-700 dark:text-amber-300 text-xs mt-1 space-y-1">
            <li>• 25% penalty if cancelled less than 24h before task</li>
            <li>• Full refund if cancelled 24h+ in advance</li>
            <li>• Penalties affect your trust score</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
