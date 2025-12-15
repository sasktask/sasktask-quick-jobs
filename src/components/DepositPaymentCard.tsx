import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Loader2,
  RefreshCcw,
  BadgePercent
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DepositPaymentCardProps {
  taskId: string;
  taskTitle: string;
  totalAmount: number;
  depositPaid?: boolean;
  depositAmount?: number;
  scheduledDate?: string;
  isTaskOwner: boolean;
  onDepositPaid?: () => void;
}

export function DepositPaymentCard({
  taskId,
  taskTitle,
  totalAmount,
  depositPaid = false,
  depositAmount = 0,
  scheduledDate,
  isTaskOwner,
  onDepositPaid
}: DepositPaymentCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const { toast } = useToast();

  const calculatedDeposit = totalAmount * 0.25;
  const remainingAmount = totalAmount - calculatedDeposit;
  
  // Check if task is scheduled for future
  const isFutureTask = scheduledDate && new Date(scheduledDate) > new Date();
  const hoursUntilTask = scheduledDate 
    ? (new Date(scheduledDate).getTime() - new Date().getTime()) / (1000 * 60 * 60)
    : 0;
  const canRefund = hoursUntilTask >= 24;

  const handlePayDeposit = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-deposit-payment', {
        body: { taskId, amount: totalAmount }
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Redirecting to payment",
          description: "Complete your 25% deposit payment in the new tab.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefundDeposit = async () => {
    if (!canRefund) {
      toast({
        title: "Refund Not Available",
        description: "Refunds are only available for cancellations made 24+ hours before the task.",
        variant: "destructive",
      });
      return;
    }

    setIsRefunding(true);
    try {
      const { data, error } = await supabase.functions.invoke('refund-deposit', {
        body: { taskId }
      });

      if (error) throw error;
      
      toast({
        title: "Deposit Refunded",
        description: "Your deposit has been refunded successfully.",
      });
      
      onDepositPaid?.();
    } catch (error: any) {
      toast({
        title: "Refund Error",
        description: error.message || "Failed to process refund",
        variant: "destructive",
      });
    } finally {
      setIsRefunding(false);
    }
  };

  if (!isTaskOwner) {
    // Show deposit status to task doers
    return (
      <Card className={cn(
        "border-2",
        depositPaid ? "border-green-500/30 bg-green-50/50 dark:bg-green-950/20" : "border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className={cn("h-5 w-5", depositPaid ? "text-green-600" : "text-amber-600")} />
            <CardTitle className="text-lg">Deposit Protection</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {depositPaid ? (
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">25% deposit paid - Task secured!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Clock className="h-5 w-5" />
              <span>Waiting for task owner to pay deposit</span>
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {depositPaid 
              ? "This task is protected. You'll receive payment upon completion."
              : "Once the deposit is paid, you can be confident the task owner is committed."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  // Task owner view
  return (
    <Card className={cn(
      "border-2",
      depositPaid 
        ? "border-green-500/30 bg-green-50/50 dark:bg-green-950/20" 
        : isFutureTask 
          ? "border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20"
          : "border-border"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BadgePercent className={cn(
              "h-5 w-5",
              depositPaid ? "text-green-600" : "text-amber-600"
            )} />
            <CardTitle className="text-lg">25% Advance Deposit</CardTitle>
          </div>
          {depositPaid && (
            <Badge className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Paid
            </Badge>
          )}
        </div>
        <CardDescription>
          {depositPaid 
            ? "Your deposit is secured. Pay remaining 75% after accepting a tasker."
            : "Pay a 25% deposit to show commitment and attract quality taskers."
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Breakdown */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Task Amount</span>
            <span className="font-medium">${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Deposit (25%)</span>
            <span className={cn(
              "font-bold",
              depositPaid ? "text-green-600" : "text-amber-600"
            )}>
              ${calculatedDeposit.toFixed(2)}
            </span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Remaining (after accepting tasker)</span>
            <span className="font-medium">${remainingAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" />
            Builds trust with taskers
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            Full refund if 24h+ notice
          </div>
        </div>

        {!depositPaid ? (
          <Button 
            onClick={handlePayDeposit}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay ${calculatedDeposit.toFixed(2)} Deposit
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Deposit paid successfully!</span>
            </div>
            
            {canRefund && (
              <Button 
                variant="outline"
                onClick={handleRefundDeposit}
                disabled={isRefunding}
                className="w-full text-destructive hover:text-destructive"
              >
                {isRefunding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Refund...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Cancel & Refund Deposit
                  </>
                )}
              </Button>
            )}
            
            {!canRefund && hoursUntilTask > 0 && (
              <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                Refunds not available within 24 hours of task
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
