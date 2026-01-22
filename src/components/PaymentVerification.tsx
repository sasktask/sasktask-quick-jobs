import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, CreditCard, Shield, Loader2, Wallet } from "lucide-react";

interface PaymentVerificationProps {
  userId: string;
  onVerified?: () => void;
  showCard?: boolean;
}

const VERIFICATION_AMOUNT = 2; // 2 CAD

export const PaymentVerification = ({ userId, onVerified, showCard = true }: PaymentVerificationProps) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    checkVerificationStatus();
  }, [userId]);

  const checkVerificationStatus = async () => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("payment_verified, wallet_balance")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;

      setIsVerified(!!profile?.payment_verified);
      setWalletBalance(profile?.wallet_balance || 0);
    } catch (error) {
      console.error("Error checking payment verification:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    setIsProcessing(true);

    try {
      // Check if user has enough wallet balance
      if (walletBalance >= VERIFICATION_AMOUNT) {
        // Use wallet balance for verification
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            payment_verified: true,
            payment_verified_at: new Date().toISOString(),
            wallet_balance: walletBalance - VERIFICATION_AMOUNT
          })
          .eq("id", userId);

        if (updateError) throw updateError;

        // Record wallet transaction
        await supabase
          .from("wallet_transactions")
          .insert({
            user_id: userId,
            amount: -VERIFICATION_AMOUNT,
            transaction_type: "payment_verification",
            description: "Payment verification fee",
            balance_after: walletBalance - VERIFICATION_AMOUNT
          });

        setIsVerified(true);
        setWalletBalance(prev => prev - VERIFICATION_AMOUNT);
        toast.success("Payment verified successfully!");
        onVerified?.();
      } else {
        // Redirect to add funds with verification intent
        const { data, error } = await supabase.functions.invoke('add-wallet-funds', {
          body: { 
            amount: VERIFICATION_AMOUNT,
            purpose: "payment_verification"
          }
        });

        if (error) throw error;

        if (data?.url) {
          // Store verification intent in sessionStorage
          sessionStorage.setItem('payment_verification_pending', 'true');
          window.location.href = data.url;
        }
      }
    } catch (error: any) {
      console.error("Error verifying payment:", error);
      toast.error(error.message || "Failed to process payment verification");
    } finally {
      setIsProcessing(false);
    }
  };

  // Check for returning from payment
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isSuccess = urlParams.get('wallet_deposit') === 'success';
    const isPending = sessionStorage.getItem('payment_verification_pending');

    if (isSuccess && isPending) {
      sessionStorage.removeItem('payment_verification_pending');
      // Complete verification after successful deposit
      completeVerificationAfterDeposit();
    }
  }, []);

  const completeVerificationAfterDeposit = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          payment_verified: true,
          payment_verified_at: new Date().toISOString()
        })
        .eq("id", userId);

      if (error) throw error;

      setIsVerified(true);
      toast.success("Payment verified successfully!");
      onVerified?.();
    } catch (error) {
      console.error("Error completing verification:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isVerified) {
    if (!showCard) return null;
    
    return (
      <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700 dark:text-green-400">
          Payment verified! You can now post tasks and place bids.
        </AlertDescription>
      </Alert>
    );
  }

  if (!showCard) {
    return (
      <Button onClick={handleVerifyPayment} disabled={isProcessing} className="w-full">
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Verify Payment (${VERIFICATION_AMOUNT} CAD)
          </>
        )}
      </Button>
    );
  }

  return (
    <Card className="border-amber-500/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              Payment Verification Required
            </CardTitle>
            <CardDescription>
              Complete a one-time verification to unlock all features
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-amber-600 border-amber-500">
            ${VERIFICATION_AMOUNT} CAD
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
            <span>Post unlimited tasks as a task giver</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
            <span>Place bids on tasks as a task doer</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
            <span>The $2 is added to your wallet balance</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>Helps prevent spam and fraud on the platform</span>
          </div>
        </div>

        {walletBalance >= VERIFICATION_AMOUNT && (
          <Alert>
            <Wallet className="h-4 w-4" />
            <AlertDescription>
              You have ${walletBalance.toFixed(2)} in your wallet. The verification fee will be deducted from your balance.
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleVerifyPayment} 
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : walletBalance >= VERIFICATION_AMOUNT ? (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Use Wallet Balance (${VERIFICATION_AMOUNT} CAD)
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay ${VERIFICATION_AMOUNT} CAD to Verify
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Secure payment processed by Stripe. Your payment info is never stored.
        </p>
      </CardContent>
    </Card>
  );
};

// Hook to check payment verification status
export const usePaymentVerification = (userId: string | null) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("payment_verified")
          .eq("id", userId)
          .maybeSingle();

        if (error) throw error;
        setIsVerified(!!data?.payment_verified);
      } catch (error) {
        console.error("Error checking payment verification:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [userId]);

  return { isPaymentVerified: isVerified, isLoading };
};
