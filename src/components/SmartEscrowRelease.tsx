import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  Timer,
  Zap,
  Users,
  Lock,
  Unlock
} from "lucide-react";
import { formatDistanceToNow, differenceInHours, format } from "date-fns";

interface SmartEscrowReleaseProps {
  bookingId: string;
  paymentId?: string;
  currentUserId: string;
  taskGiverId: string;
  taskDoerId: string;
  amount: number;
  payoutAmount: number;
  escrowStatus: string;
  autoReleaseAt?: string | null;
  taskGiverConfirmed?: boolean;
  taskDoerConfirmed?: boolean;
  releaseType?: string | null;
  onRelease?: () => void;
}

export const SmartEscrowRelease = ({
  bookingId,
  paymentId,
  currentUserId,
  taskGiverId,
  taskDoerId,
  amount,
  payoutAmount,
  escrowStatus,
  autoReleaseAt,
  taskGiverConfirmed = false,
  taskDoerConfirmed = false,
  releaseType,
  onRelease
}: SmartEscrowReleaseProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [progress, setProgress] = useState(0);

  const isTaskGiver = currentUserId === taskGiverId;
  const isTaskDoer = currentUserId === taskDoerId;
  const isReleased = escrowStatus === "released";

  // Calculate time remaining and progress
  useEffect(() => {
    if (!autoReleaseAt || isReleased) return;

    const updateTimer = () => {
      const releaseDate = new Date(autoReleaseAt);
      const now = new Date();
      const hoursRemaining = differenceInHours(releaseDate, now);
      const totalHours = 72;
      const elapsed = totalHours - Math.max(0, hoursRemaining);
      const progressPercent = Math.min(100, (elapsed / totalHours) * 100);

      setProgress(progressPercent);

      if (releaseDate > now) {
        setTimeRemaining(formatDistanceToNow(releaseDate, { addSuffix: true }));
      } else {
        setTimeRemaining("Processing...");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [autoReleaseAt, isReleased]);

  const handleConfirmRelease = async () => {
    if (!paymentId) return;
    setIsProcessing(true);

    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (isTaskGiver) {
        updateData.task_giver_confirmed = true;
        // If doer already confirmed, this triggers mutual release
        if (taskDoerConfirmed) {
          updateData.escrow_status = "released";
          updateData.released_at = new Date().toISOString();
          updateData.release_type = "mutual_confirmation";
        }
      }

      const { error } = await supabase
        .from("payments")
        .update(updateData)
        .eq("id", paymentId);

      if (error) throw error;

      // If both confirmed, trigger payout
      if (taskDoerConfirmed || isTaskGiver) {
        try {
          await supabase.functions.invoke("process-payout", {
            body: { paymentId }
          });
        } catch (payoutError) {
          console.error("Payout error:", payoutError);
        }
      }

      toast({
        title: taskDoerConfirmed ? "Payment Released! 💰" : "Confirmation Recorded",
        description: taskDoerConfirmed 
          ? "Funds have been released via mutual confirmation."
          : "Your confirmation has been recorded. Awaiting other party.",
      });

      onRelease?.();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to process";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Released state
  if (isReleased) {
    return (
      <Card className="border-green-500/50 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
            Payment Released
          </CardTitle>
          <CardDescription>
            {releaseType === "mutual_confirmation" && "Released via mutual confirmation"}
            {releaseType === "auto_72hr" && "Auto-released after 72 hours"}
            {releaseType === "manual" && "Manually released by task giver"}
            {releaseType === "dispute_resolution" && "Released after dispute resolution"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
            <span className="text-sm text-muted-foreground">Amount Released</span>
            <span className="text-xl font-bold text-green-600">${payoutAmount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Smart Escrow Protection
        </CardTitle>
        <CardDescription>
          Secure payment release with automatic 72-hour protection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Display */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Held in Escrow</span>
          </div>
          <span className="text-lg font-bold">${amount.toFixed(2)}</span>
        </div>

        {/* Auto-Release Timer */}
        {autoReleaseAt && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-amber-500" />
                <span>Auto-release</span>
              </div>
              <span className="font-medium text-amber-600 dark:text-amber-400">
                {timeRemaining}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {format(new Date(autoReleaseAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        )}

        {/* Confirmation Status */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg border ${taskDoerConfirmed ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' : 'bg-muted/50'}`}>
            <div className="flex items-center gap-2 mb-1">
              {taskDoerConfirmed ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Clock className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-xs font-medium">Task Doer</span>
            </div>
            <Badge variant={taskDoerConfirmed ? "default" : "secondary"} className="text-xs">
              {taskDoerConfirmed ? "Confirmed" : "Pending"}
            </Badge>
          </div>
          <div className={`p-3 rounded-lg border ${taskGiverConfirmed ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' : 'bg-muted/50'}`}>
            <div className="flex items-center gap-2 mb-1">
              {taskGiverConfirmed ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Clock className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-xs font-medium">Task Giver</span>
            </div>
            <Badge variant={taskGiverConfirmed ? "default" : "secondary"} className="text-xs">
              {taskGiverConfirmed ? "Confirmed" : "Pending"}
            </Badge>
          </div>
        </div>

        {/* Quick Release Alert */}
        {taskDoerConfirmed && !taskGiverConfirmed && isTaskGiver && (
          <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
            <Zap className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Quick Release Available!</strong> Confirm now for instant release, or wait for auto-release {timeRemaining}.
            </AlertDescription>
          </Alert>
        )}

        {/* Mutual Confirmation Info */}
        {!taskGiverConfirmed && !taskDoerConfirmed && (
          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              Both parties can confirm for <strong>instant release</strong>, or payment auto-releases after 72 hours if no dispute.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        {isTaskGiver && !taskGiverConfirmed && escrowStatus === "held" && (
          <Button
            onClick={handleConfirmRelease}
            disabled={isProcessing}
            className="w-full gap-2"
            size="lg"
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <Unlock className="h-4 w-4" />
                {taskDoerConfirmed ? "Confirm & Release Now" : "Confirm Completion"}
              </>
            )}
          </Button>
        )}

        {isTaskGiver && taskGiverConfirmed && !taskDoerConfirmed && (
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-sm text-muted-foreground">
              You've confirmed. Waiting for tasker or auto-release.
            </p>
          </div>
        )}

        {isTaskDoer && escrowStatus === "held" && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">You'll receive: ${payoutAmount.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {taskGiverConfirmed 
                ? "Task giver has confirmed! Payment releasing soon."
                : `Payment will auto-release ${timeRemaining} if no dispute.`}
            </p>
          </div>
        )}

        {/* Safety Info */}
        <div className="flex items-start gap-2 p-2 text-xs text-muted-foreground">
          <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
          <span>
            Raise a dispute before auto-release if there are issues with the work.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
