import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, DollarSign, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CancellationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  taskAmount: number;
  scheduledDate: string;
  onSuccess: () => void;
}

const calculateEstimatedFee = (scheduledDate: string, taskAmount: number) => {
  const scheduled = new Date(scheduledDate);
  const now = new Date();
  const hoursUntilTask = (scheduled.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilTask < 1) return taskAmount * 0.5;
  if (hoursUntilTask < 24) return taskAmount * 0.25;
  return 5;
};

export const CancellationDialog = ({
  open,
  onOpenChange,
  bookingId,
  taskAmount,
  scheduledDate,
  onSuccess,
}: CancellationDialogProps) => {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const estimatedFee = calculateEstimatedFee(scheduledDate, taskAmount);
  const hoursUntilTask = Math.max(0, (new Date(scheduledDate).getTime() - new Date().getTime()) / (1000 * 60 * 60));

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
          reason,
        },
      });

      if (error) throw error;

      toast({
        title: "Booking Cancelled",
        description: data.message,
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
          <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <DollarSign className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Cancellation Fee: ${estimatedFee.toFixed(2)}</strong>
              <p className="text-sm mt-1">
                {hoursUntilTask < 1
                  ? "Less than 1 hour until task - 50% fee applies"
                  : hoursUntilTask < 24
                  ? "Less than 24 hours until task - 25% fee applies"
                  : "More than 24 hours - $5 flat fee"}
              </p>
            </AlertDescription>
          </Alert>

          {/* Time Until Task */}
          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              Time until task: <strong>{Math.floor(hoursUntilTask)} hours</strong>
            </span>
          </div>

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
              <li>• Frequent cancellations affect your reliability score</li>
              <li>• Refunds are processed within 5-10 business days</li>
              <li>• Cancellation fees support the other party</li>
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
            {isProcessing ? "Processing..." : `Cancel & Pay $${estimatedFee.toFixed(2)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
