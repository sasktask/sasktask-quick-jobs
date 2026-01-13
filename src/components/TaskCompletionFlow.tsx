import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, AlertCircle, Shield, Clock, DollarSign, Heart, Camera, Image } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TipDialog } from "@/components/TipDialog";
import { WorkEvidenceUpload } from "@/components/WorkEvidenceUpload";
import { EvidenceGallery } from "@/components/EvidenceGallery";
import { Badge } from "@/components/ui/badge";
interface TaskCompletionFlowProps {
  bookingId: string;
  taskId: string;
  taskTitle?: string;
  currentUserId: string;
  taskDoerId: string;
  taskDoerName?: string;
  taskDoerAvatar?: string;
  taskGiverId: string;
  bookingStatus: string;
  taskStatus: string;
  paymentAmount: number;
  onStatusUpdate: () => void;
}

export const TaskCompletionFlow = ({
  bookingId,
  taskId,
  taskTitle = "Task",
  currentUserId,
  taskDoerId,
  taskDoerName = "Tasker",
  taskDoerAvatar,
  taskGiverId,
  bookingStatus,
  taskStatus,
  paymentAmount,
  onStatusUpdate
}: TaskCompletionFlowProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [showTipDialog, setShowTipDialog] = useState(false);
  const [tipAdded, setTipAdded] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [showEvidenceUpload, setShowEvidenceUpload] = useState(false);
  
  const isTaskDoer = currentUserId === taskDoerId;
  const isTaskGiver = currentUserId === taskGiverId;
  
  // Calculate payment breakdown
  const platformFee = (paymentAmount * 0.15).toFixed(2);
  const tax = (paymentAmount * 0.05).toFixed(2);
  const taskerPayout = (paymentAmount - parseFloat(platformFee) - parseFloat(tax)).toFixed(2);

  // Fetch payment status and evidence count
  useEffect(() => {
    const fetchPaymentStatus = async () => {
      const { data } = await supabase
        .from("payments")
        .select("*")
        .eq("booking_id", bookingId)
        .maybeSingle();
      
      setPaymentStatus(data);
    };

    const fetchEvidenceCount = async () => {
      const { count } = await supabase
        .from("work_evidence")
        .select("*", { count: 'exact', head: true })
        .eq("booking_id", bookingId);
      
      setEvidenceCount(count || 0);
    };

    fetchPaymentStatus();
    fetchEvidenceCount();
  }, [bookingId]);

  const handleEvidenceUploaded = async () => {
    const { count } = await supabase
      .from("work_evidence")
      .select("*", { count: 'exact', head: true })
      .eq("booking_id", bookingId);
    
    setEvidenceCount(count || 0);
    setShowEvidenceUpload(false);
  };

  // Task Doer marks task as completed
  const handleMarkComplete = async () => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ 
          status: "completed"
        })
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "Task Marked Complete! ✅",
        description: "Waiting for task giver to confirm and release payment.",
      });
      
      onStatusUpdate();
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

  // Task Giver confirms completion and releases payment - with automatic transfer
  const handleConfirmAndRelease = async () => {
    setIsProcessing(true);
    try {
      // Get payment details
      const { data: payment, error: fetchError } = await supabase
        .from("payments")
        .select("*")
        .eq("booking_id", bookingId)
        .single();

      if (fetchError) throw fetchError;

      // Update payment to released and status to completed
      const { error: paymentError } = await supabase
        .from("payments")
        .update({ 
          status: "completed",
          escrow_status: "released",
          released_at: new Date().toISOString()
        })
        .eq("booking_id", bookingId);

      if (paymentError) throw paymentError;

      // Update task to completed
      const { error: taskError } = await supabase
        .from("tasks")
        .update({ status: "completed" })
        .eq("id", taskId);

      if (taskError) throw taskError;

      // Trigger automatic payout to task doer
      const { error: payoutError } = await supabase.functions.invoke('process-payout', {
        body: { paymentId: payment.id }
      });

      if (payoutError) {
        console.error("Payout error:", payoutError);
        toast({
          title: "Payment Released",
          description: "Payment released from escrow. Automatic transfer to tasker may take a few minutes.",
        });
      } else {
        toast({
          title: "Success! 💰",
          description: `Payment of $${taskerPayout} automatically transferred to tasker. Task completed!`,
        });
      }
      
      onStatusUpdate();
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

  const handleTipComplete = (amount: number) => {
    setTipAmount(amount);
    setTipAdded(true);
  };

  // If task is already fully completed
  if (taskStatus === "completed" && paymentStatus?.escrow_status === "released") {
    return (
      <>
        <Card className="border-green-500 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-6 w-6" />
              Task Completed & Payment Released
            </CardTitle>
            <CardDescription>
              This task has been successfully completed and payment has been released.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Task Amount:</span>
                  <span className="font-semibold">${paymentAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Platform Fee (15%):</span>
                  <span className="text-red-600">-${platformFee}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Tax (5% GST):</span>
                  <span className="text-red-600">-${tax}</span>
                </div>
                {tipAdded && tipAmount > 0 && (
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Heart className="h-3 w-3 text-pink-500" />
                      Tip Added:
                    </span>
                    <span className="text-pink-500 font-semibold">+${tipAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-green-200 dark:border-green-800">
                  <span className="font-bold">Tasker Received:</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    ${(parseFloat(taskerPayout) + tipAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Add Tip Button - Only for Task Giver */}
              {isTaskGiver && !tipAdded && (
                <Button
                  variant="outline"
                  onClick={() => setShowTipDialog(true)}
                  className="w-full gap-2 border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700 dark:border-pink-800 dark:hover:bg-pink-950"
                >
                  <Heart className="h-4 w-4" />
                  Add a Tip
                </Button>
              )}

              {tipAdded && (
                <div className="text-center text-sm text-pink-600 dark:text-pink-400 flex items-center justify-center gap-1">
                  <Heart className="h-4 w-4 fill-pink-500" />
                  Thank you for your generosity!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <TipDialog
          open={showTipDialog}
          onOpenChange={setShowTipDialog}
          taskTitle={taskTitle}
          taskerName={taskDoerName}
          taskerAvatar={taskDoerAvatar}
          taskAmount={paymentAmount}
          bookingId={bookingId}
          paymentId={paymentStatus?.id}
          onTipComplete={handleTipComplete}
        />
      </>
    );
  }

  // Task Doer View - waiting for payment or can mark complete
  if (isTaskDoer) {
    if (bookingStatus === "accepted" && !paymentStatus?.escrow_status) {
      return (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Waiting for task giver to make payment. Once payment is secured in escrow, you can start the task.
          </AlertDescription>
        </Alert>
      );
    }

    if (bookingStatus === "in_progress" && paymentStatus?.escrow_status === "held") {
      return (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Payment Secured - Ready to Complete
              </CardTitle>
              <CardDescription>
                Upload proof of work before marking the task as complete. This protects you in case of disputes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-primary/5 border-primary/20">
                <DollarSign className="h-4 w-4 text-primary" />
                <AlertDescription>
                  <strong>${paymentAmount.toFixed(2)}</strong> is held in escrow. You'll receive <strong>${taskerPayout}</strong> after confirmation.
                </AlertDescription>
              </Alert>

              {/* Evidence Status */}
              <div className="p-3 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Work Evidence</span>
                  </div>
                  <Badge variant={evidenceCount > 0 ? "default" : "secondary"}>
                    {evidenceCount} file{evidenceCount !== 1 ? 's' : ''} uploaded
                  </Badge>
                </div>
                {evidenceCount === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    ⚠️ We strongly recommend uploading photos as proof of completed work
                  </p>
                )}
              </div>

              {/* Evidence Upload or Gallery */}
              {showEvidenceUpload ? (
                <WorkEvidenceUpload
                  bookingId={bookingId}
                  taskId={taskId}
                  onUploadComplete={handleEvidenceUploaded}
                  title="Upload Completion Proof"
                  description="Add photos showing your completed work"
                />
              ) : evidenceCount > 0 ? (
                <div className="space-y-2">
                  <EvidenceGallery bookingId={bookingId} title="Your Evidence" showUploader={false} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => setShowEvidenceUpload(true)}
                  >
                    <Image className="h-4 w-4" />
                    Add More Evidence
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setShowEvidenceUpload(true)}
                >
                  <Camera className="h-4 w-4" />
                  Upload Work Evidence
                </Button>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Completion Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about the completed work..."
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleMarkComplete}
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? "Processing..." : "Mark Task Complete"}
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (bookingStatus === "completed" && paymentStatus?.escrow_status === "held") {
      return (
        <Alert className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            ⏳ Waiting for task giver to confirm completion and release your payment of <strong>${taskerPayout}</strong>.
          </AlertDescription>
        </Alert>
      );
    }
  }

  // Task Giver View - can confirm and release payment
  if (isTaskGiver) {
    if (bookingStatus === "accepted" && !paymentStatus?.escrow_status) {
      return (
        <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Please make payment to secure the booking. Payment will be held in escrow until you confirm task completion.
          </AlertDescription>
        </Alert>
      );
    }

    if (bookingStatus === "in_progress" && paymentStatus?.escrow_status === "held") {
      return (
        <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            💼 Payment of <strong>${paymentAmount.toFixed(2)}</strong> is secured in escrow. Waiting for tasker to complete the job.
          </AlertDescription>
        </Alert>
      );
    }

    if (bookingStatus === "completed" && paymentStatus?.escrow_status === "held") {
      return (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              Confirm Completion & Release Payment
            </CardTitle>
            <CardDescription>
              The tasker has marked this task as complete. Review the work evidence and release payment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                ✅ Tasker has completed the task and is waiting for your confirmation.
              </AlertDescription>
            </Alert>

            {/* Evidence Gallery for Task Giver to Review */}
            {evidenceCount > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Camera className="h-4 w-4" />
                  Work Evidence Provided
                  <Badge variant="secondary">{evidenceCount} file{evidenceCount !== 1 ? 's' : ''}</Badge>
                </div>
                <EvidenceGallery bookingId={bookingId} title="Review Work Evidence" />
              </div>
            )}

            <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Task Amount:</span>
                <span className="font-semibold">${paymentAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Platform Fee (15%):</span>
                <span>-${platformFee}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Tax (5% GST):</span>
                <span>-${tax}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-bold">Tasker Will Receive:</span>
                <span className="text-lg font-bold text-primary">${taskerPayout}</span>
              </div>
            </div>

            <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                🔒 <strong>Secure Process:</strong> By confirming, you release the payment from escrow. 
                The tasker will receive ${taskerPayout} and the task will be marked as complete.
              </p>
            </div>

            <Button 
              onClick={handleConfirmAndRelease}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              size="lg"
            >
              {isProcessing ? "Processing..." : `Confirm & Release $${taskerPayout}`}
            </Button>
          </CardContent>
        </Card>
      );
    }
  }

  return null;
};
