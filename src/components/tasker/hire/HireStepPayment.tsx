import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, ArrowRight, Wallet, Shield, Lock, 
  AlertTriangle, CheckCircle, TrendingDown, Loader2,
  CreditCard, RefreshCw, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { cn } from "@/lib/utils";

interface HireStepPaymentProps {
  budget: number;
  onNext: () => void;
  onBack: () => void;
  onAddFunds: () => void;
}

export const HireStepPayment = ({ 
  budget, 
  onNext, 
  onBack, 
  onAddFunds 
}: HireStepPaymentProps) => {
  const { 
    balance, 
    isLoading, 
    refresh, 
    hasSufficientBalance, 
    getBalanceAfterHold 
  } = useWalletBalance();
  
  const [agreedToHold, setAgreedToHold] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const holdAmount = budget;
  const platformFee = budget * 0.15;
  const taskerEarnings = budget - platformFee;
  const balanceAfterHold = getBalanceAfterHold(holdAmount);
  const hasFunds = hasSufficientBalance(holdAmount);
  const fundingGap = Math.max(0, holdAmount - balance);

  const balancePercentage = Math.min(100, (balance / holdAmount) * 100);

  useEffect(() => {
    refresh();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Wallet className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold">Secure Payment Hold</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Funds will be held securely until task completion
        </p>
      </div>

      {/* Wallet Balance Card */}
      <div className={cn(
        "rounded-xl p-5 border-2 transition-all duration-300",
        hasFunds 
          ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800" 
          : "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800"
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className={cn(
              "h-5 w-5",
              hasFunds ? "text-green-600" : "text-amber-600"
            )} />
            <span className="font-semibold">Your Wallet</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>

        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-3xl font-bold">
              ${isLoading ? "..." : balance.toFixed(2)}
            </p>
          </div>
          {hasFunds ? (
            <Badge className="bg-green-500 hover:bg-green-600 gap-1">
              <CheckCircle className="h-3.5 w-3.5" />
              Sufficient
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Insufficient
            </Badge>
          )}
        </div>

        {/* Balance Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress to hold amount</span>
            <span className="font-medium">{balancePercentage.toFixed(0)}%</span>
          </div>
          <Progress 
            value={balancePercentage} 
            className={cn(
              "h-2",
              hasFunds ? "[&>div]:bg-green-500" : "[&>div]:bg-amber-500"
            )}
          />
        </div>
      </div>

      {/* Hold Amount Breakdown */}
      <div className="bg-muted/30 rounded-xl p-5 space-y-4">
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <span className="font-semibold">Hold Amount</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">
              ${holdAmount.toFixed(2)}
            </span>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
        </button>

        <AnimatePresence>
          {showBreakdown && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Task Budget</span>
                  <span>${budget.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee (15%)</span>
                  <span className="text-muted-foreground">-${platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium pt-2 border-t border-dashed">
                  <span>Tasker Receives</span>
                  <span className="text-green-600">${taskerEarnings.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Balance After Hold */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <TrendingDown className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Balance After Hold</p>
            <p className="text-lg font-bold">${balanceAfterHold.toFixed(2)}</p>
          </div>
        </div>
        {hasFunds && (
          <CheckCircle className="h-6 w-6 text-green-500" />
        )}
      </div>

      {/* Insufficient Funds Warning */}
      {!hasFunds && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-destructive/10 border border-destructive/20 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-destructive">
                Insufficient Wallet Balance
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                You need <span className="font-bold">${fundingGap.toFixed(2)}</span> more to proceed with this booking.
              </p>
              <Button
                onClick={onAddFunds}
                className="mt-3 gap-2"
                size="sm"
              >
                <CreditCard className="h-4 w-4" />
                Add Funds to Wallet
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Agreement Checkbox */}
      {hasFunds && (
        <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
          <Checkbox
            id="hold-agreement"
            checked={agreedToHold}
            onCheckedChange={(checked) => setAgreedToHold(checked === true)}
          />
          <label htmlFor="hold-agreement" className="text-sm cursor-pointer">
            <span className="font-medium">I authorize this payment hold</span>
            <p className="text-muted-foreground mt-0.5">
              ${holdAmount.toFixed(2)} will be held from my wallet and released to the tasker upon successful task completion
            </p>
          </label>
        </div>
      )}

      {/* Security Notice */}
      <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm">
        <Shield className="h-4 w-4 text-green-600 shrink-0" />
        <span className="text-green-700 dark:text-green-400">
          Your payment is protected by our secure escrow system. Funds are only released when you confirm satisfaction.
        </span>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={onNext}
          disabled={!hasFunds || !agreedToHold}
          className="flex-1 gap-2"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};
