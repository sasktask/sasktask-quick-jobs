import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Shield, FileText, Image } from "lucide-react";
import { DisputeEvidenceUpload } from "@/components/DisputeEvidenceUpload";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  taskId: string;
  againstUserId: string;
}

interface ExistingEvidence {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  evidence_type: string;
  description: string | null;
  created_at: string;
}

export const DisputeDialog = ({ open, onOpenChange, bookingId, taskId, againstUserId }: DisputeDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDetails, setDisputeDetails] = useState("");
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [existingEvidence, setExistingEvidence] = useState<ExistingEvidence[]>([]);
  const [step, setStep] = useState<'details' | 'evidence'>('details');

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setDisputeReason("");
      setDisputeDetails("");
      setDisputeId(null);
      setExistingEvidence([]);
      setStep('details');
    }
  }, [open]);

  // Fetch evidence if dispute exists
  const fetchEvidence = async (dispId: string) => {
    const { data } = await supabase
      .from('dispute_evidence')
      .select('*')
      .eq('dispute_id', dispId)
      .order('created_at', { ascending: true });
    
    setExistingEvidence(data || []);
  };

  const handleSubmitDetails = async () => {
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

      const { data, error } = await supabase.from("disputes").insert({
        booking_id: bookingId,
        task_id: taskId,
        raised_by: user.id,
        against_user: againstUserId,
        dispute_reason: disputeReason,
        dispute_details: disputeDetails,
        status: "open"
      }).select().single();

      if (error) throw error;

      setDisputeId(data.id);
      setStep('evidence');

      toast({
        title: "Dispute Created",
        description: "Now upload evidence to support your dispute.",
      });
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

  const handleEvidenceUploaded = () => {
    if (disputeId) {
      fetchEvidence(disputeId);
    }
  };

  const handleComplete = () => {
    toast({
      title: "Dispute Submitted",
      description: "Your dispute and evidence have been submitted. Our team will review it within 24-48 hours.",
    });
    onOpenChange(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'photo':
      case 'screenshot':
        return <Image className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Raise a Dispute
          </DialogTitle>
          <DialogDescription>
            {step === 'details' 
              ? "Submit a dispute if you're experiencing issues with this task."
              : "Upload evidence to support your dispute."
            }
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`flex-1 h-1 rounded-full ${step === 'details' ? 'bg-primary' : 'bg-primary'}`} />
          <div className={`flex-1 h-1 rounded-full ${step === 'evidence' ? 'bg-primary' : 'bg-muted'}`} />
        </div>

        {step === 'details' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Dispute Reason *</Label>
              <Select value={disputeReason} onValueChange={setDisputeReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work_quality">Poor Work Quality</SelectItem>
                  <SelectItem value="not_completed">Task Not Completed</SelectItem>
                  <SelectItem value="payment_issue">Payment Issue</SelectItem>
                  <SelectItem value="communication">Communication Problem</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                  <SelectItem value="property_damage">Property Damage</SelectItem>
                  <SelectItem value="safety_concern">Safety Concern</SelectItem>
                  <SelectItem value="false_claims">False Claims by Other Party</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Detailed Description *</Label>
              <Textarea
                id="details"
                placeholder="Provide as much detail as possible about the issue. Include dates, times, and specific problems encountered..."
                value={disputeDetails}
                onChange={(e) => setDisputeDetails(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Be specific and factual. This information will be reviewed by our trust & safety team.
              </p>
            </div>

            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">What happens next?</p>
                  <ul className="text-muted-foreground text-xs space-y-1">
                    <li>• You'll upload evidence (photos, screenshots, documents)</li>
                    <li>• Our team reviews within 24-48 hours</li>
                    <li>• Both parties can respond to the dispute</li>
                    <li>• We'll make a fair decision based on evidence</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitDetails} 
                disabled={isSubmitting || !disputeReason || !disputeDetails} 
                className="flex-1"
              >
                {isSubmitting ? "Submitting..." : "Continue to Evidence"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Existing Evidence */}
            {existingEvidence.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Evidence ({existingEvidence.length})</Label>
                <div className="grid grid-cols-3 gap-2">
                  {existingEvidence.map((ev) => (
                    <div key={ev.id} className="relative rounded-lg overflow-hidden border">
                      {ev.file_type.startsWith('image/') ? (
                        <img src={ev.file_url} alt="" className="w-full h-16 object-cover" />
                      ) : (
                        <div className="w-full h-16 flex items-center justify-center bg-muted">
                          {getTypeIcon(ev.evidence_type)}
                        </div>
                      )}
                      <Badge className="absolute bottom-1 left-1 text-[10px] px-1">
                        {ev.evidence_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Component */}
            {disputeId && (
              <DisputeEvidenceUpload
                disputeId={disputeId}
                onUploadComplete={handleEvidenceUploaded}
              />
            )}

            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                💡 <strong>Tip:</strong> Strong evidence includes timestamped photos, chat screenshots, 
                and any documentation of the issue. The more evidence you provide, the faster we can resolve your dispute.
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('details')} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleComplete} 
                className="flex-1"
              >
                {existingEvidence.length > 0 ? 'Submit Dispute' : 'Skip & Submit'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};