import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, DollarSign, Clock, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  useEffect(() => {
    const fetchDetails = async () => {
      const { data: booking } = await supabase
        .from("bookings")
        .select("*, tasks(pay_amount, scheduled_date)")
        .eq("id", bookingId)
        .single();

      if (booking) {
        setBookingDetails(booking);
        
        // Calculate penalty based on booking status and timing
        const taskAmount = (booking.tasks as any)?.pay_amount || 0;
        let penalty = 0;

        if (booking.status === "accepted" || booking.status === "in_progress") {
          const hoursFromAcceptance = booking.agreed_at 
            ? (Date.now() - new Date(booking.agreed_at).getTime()) / (1000 * 60 * 60)
            : 0;

          // Penalty structure similar to Uber:
          // - Within 1 hour of acceptance: 10% of task amount
          // - 1-24 hours: 15% of task amount
          // - After 24 hours or in_progress: 20% of task amount
          if (booking.status === "in_progress") {
            penalty = taskAmount * 0.20;
          } else if (hoursFromAcceptance > 24) {
            penalty = taskAmount * 0.20;
          } else if (hoursFromAcceptance > 1) {
            penalty = taskAmount * 0.15;
          } else {
            penalty = taskAmount * 0.10;
          }
        }

        setPenaltyAmount(penalty);
      }
    };

    if (open) {
      fetchDetails();
    }
  }, [open, bookingId]);

  const handleCancel = async () => {
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
          cancellationFee: penaltyAmount
        },
      });

      if (error) throw error;

      toast({
        title: "Booking Cancelled",
        description: penaltyAmount > 0 
          ? `Cancellation fee of $${penaltyAmount.toFixed(2)} will be processed`
          : "Booking cancelled successfully",
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
                  {bookingDetails?.status === "in_progress" && "Cancelling work in progress incurs a 20% penalty"}
                  {bookingDetails?.status === "accepted" && "Cancelling after acceptance incurs a penalty (10-20% based on timing)"}
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Escrow Protection Info */}
          <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Escrow Protection:</strong> If payment is in escrow, cancellation fees help compensate the other party for their time commitment.
            </AlertDescription>
          </Alert>

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
            <p className="font-semibold mb-1">Cancellation Policy (Similar to Uber):</p>
            <ul className="space-y-1">
              <li>• Penalties protect both parties in the transaction</li>
              <li>• Frequent cancellations affect your reliability score</li>
              <li>• Fees are deducted from your payment method or future earnings</li>
              <li>• Cancellation fees compensate the other party for lost opportunity</li>
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
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : penaltyAmount > 0 ? `Confirm & Pay $${penaltyAmount.toFixed(2)} Penalty` : "Confirm Cancellation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
