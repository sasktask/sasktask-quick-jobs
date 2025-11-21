import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Upload } from "lucide-react";

interface DisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  taskId: string;
  againstUserId: string;
}

export const DisputeDialog = ({ open, onOpenChange, bookingId, taskId, againstUserId }: DisputeDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDetails, setDisputeDetails] = useState("");
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);

  const handleSubmit = async () => {
    if (!disputeReason || !disputeDetails) {
      toast({
        title: "Missing Information",
        description: "Please provide a reason and details for the dispute.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("disputes").insert({
        booking_id: bookingId,
        task_id: taskId,
        raised_by: user.id,
        against_user: againstUserId,
        dispute_reason: disputeReason,
        dispute_details: disputeDetails,
        evidence_urls: evidenceUrls,
        status: "open"
      });

      if (error) throw error;

      toast({
        title: "Dispute Submitted",
        description: "Your dispute has been submitted. Our team will review it within 24-48 hours.",
      });

      onOpenChange(false);
      setDisputeReason("");
      setDisputeDetails("");
      setEvidenceUrls([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Raise a Dispute
          </DialogTitle>
          <DialogDescription>
            Submit a dispute if you're experiencing issues with this task. Our team will review and mediate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Dispute Reason</Label>
            <Select value={disputeReason} onValueChange={setDisputeReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work_quality">Poor Work Quality</SelectItem>
                <SelectItem value="not_completed">Task Not Completed</SelectItem>
                <SelectItem value="payment_issue">Payment Issue</SelectItem>
                <SelectItem value="communication">Communication Problem</SelectItem>
                <SelectItem value="safety_concern">Safety Concern</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Detailed Description</Label>
            <Textarea
              id="details"
              placeholder="Provide as much detail as possible about the issue..."
              value={disputeDetails}
              onChange={(e) => setDisputeDetails(e.target.value)}
              rows={6}
            />
          </div>

          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <Upload className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Evidence (Optional)</p>
                <p>Upload photos, screenshots, or documents to support your dispute. This will help our team resolve the issue faster.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Submitting..." : "Submit Dispute"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
