import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Shield, Wallet } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MINIMUM_BALANCE = 50;
const PENALTY_RATE = 0.25; // 25% penalty

interface CancellationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  taskId: string;
  onSuccess: () => void;
}

export const CancellationDialog = ({
  open,
  onOpenChange,
  bookingId,
  taskId,
  onSuccess,
}: CancellationDialogProps) => {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [penaltyAmount, setPenaltyAmount] = useState<number>(0);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [hoursUntilTask, setHoursUntilTask] = useState<number>(999);

  useEffect(() => {
    const fetchDetails = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch wallet balance
      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", user.id)
        .single();

      if (profile) {
        setWalletBalance(profile.wallet_balance || 0);
      }

      // Fetch booking details
      const { data: booking } = await supabase
        .from("bookings")
        .select("*, tasks(pay_amount, scheduled_date)")
        .eq("id", bookingId)
        .single();

      if (booking) {
        setBookingDetails(booking);
        
        const taskAmount = (booking.tasks as any)?.pay_amount || 0;
        const scheduledDate = (booking.tasks as any)?.scheduled_date;
        
        // Calculate hours until task
        let hours = 999;
        if (scheduledDate) {
          hours = (new Date(scheduledDate).getTime() - Date.now()) / (1000 * 60 * 60);
        }
        setHoursUntilTask(hours);

        // Calculate penalty: 25% if accepted and less than 24h notice
        let penalty = 0;
        if ((booking.status === "accepted" || booking.status === "in_progress") && hours < 24) {
          penalty = taskAmount * PENALTY_RATE;
        }

        setPenaltyAmount(penalty);
      }
    };

    if (open) {
      fetchDetails();
    }
  }, [open, bookingId]);

  const canCancel = penaltyAmount === 0 || walletBalance >= penaltyAmount;

  const handleCancel = async () => {
    if (!canCancel) {
      toast({
        title: "Insufficient Balance",
        description: `You need at least $${penaltyAmount.toFixed(2)} in your wallet to cover the cancellation penalty.`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("handle-cancellation", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          bookingId,
          taskId,
          reason,
          cancelledBy: session.user.id,
        },
      });

      if (error) throw error;

      toast({
        title: "Booking Cancelled",
        description: data?.message || "Booking cancelled successfully",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Cancellation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Cancel Booking
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this booking? Cancellation fees may apply.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
        {/* Cancellation Fee Warning */}
          {penaltyAmount > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Cancellation Penalty: ${penaltyAmount.toFixed(2)}</strong>
                <p className="text-sm mt-1">
                  25% penalty applies for cancelling less than 24 hours before the task.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Wallet Balance Check */}
          {penaltyAmount > 0 && (
            <Alert className={walletBalance >= penaltyAmount ? "bg-green-50 dark:bg-green-950/20 border-green-200" : "bg-amber-50 dark:bg-amber-950/20 border-amber-200"}>
              <Wallet className="h-4 w-4" />
              <AlertDescription>
                <strong>Your Wallet Balance: ${walletBalance.toFixed(2)}</strong>
                {walletBalance < penaltyAmount ? (
                  <p className="text-sm mt-1 text-destructive">
                    Insufficient balance! Add ${(penaltyAmount - walletBalance).toFixed(2)} more to cancel.
                  </p>
                ) : (
                  <p className="text-sm mt-1 text-green-700 dark:text-green-300">
                    ${penaltyAmount.toFixed(2)} will be deducted from your wallet.
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* No Penalty Notice */}
          {penaltyAmount === 0 && hoursUntilTask >= 24 && (
            <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>No cancellation penalty!</strong>
                <p className="text-sm mt-1">
                  Cancelling 24+ hours before the task means full refund with no penalty.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Cancellation Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Cancellation (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Let us know why you're cancelling..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Policy Info */}
          <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
            <p className="font-semibold mb-1">Cancellation Policy:</p>
            <ul className="space-y-1">
              <li>• 25% penalty if cancelled less than 24h before task</li>
              <li>• Full refund with no penalty if 24h+ notice given</li>
              <li>• Penalties are deducted from your wallet balance</li>
              <li>• Late cancellations affect your trust score</li>
              <li>• Minimum $50 wallet balance required for bookings</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Keep Booking
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isProcessing || !canCancel}
          >
            {isProcessing 
              ? "Processing..." 
              : !canCancel 
                ? "Insufficient Balance"
                : penaltyAmount > 0 
                  ? `Confirm & Pay $${penaltyAmount.toFixed(2)} Penalty` 
                  : "Confirm Cancellation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
