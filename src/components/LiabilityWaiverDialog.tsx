import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  AlertTriangle, 
  Scale, 
  FileText, 
  Check, 
  Loader2,
  Heart,
  HardHat,
  Car,
  Home,
  Gavel
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LiabilityWaiverDialogProps {
  open: boolean;
  onAccepted: () => void;
  onDeclined?: () => void;
  bookingId?: string;
  taskTitle?: string;
  taskCategory?: string;
  isTaskDoer?: boolean;
}

export function LiabilityWaiverDialog({ 
  open, 
  onAccepted, 
  onDeclined,
  bookingId,
  taskTitle,
  taskCategory,
  isTaskDoer = false
}: LiabilityWaiverDialogProps) {
  const [waivers, setWaivers] = useState({
    safetyAcknowledgment: false,
    liabilityRelease: false,
    insuranceAcknowledgment: false,
    indemnification: false,
    arbitrationAgreement: false,
    independentContractor: false,
    riskAssumption: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allAccepted = Object.values(waivers).every(v => v);

  const handleAccept = async () => {
    if (!allAccepted) {
      toast.error("Please accept all waivers to continue");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      // Log the waiver acceptance in audit trail
      await supabase.from("audit_trail_events").insert({
        user_id: user.id,
        booking_id: bookingId,
        event_type: "liability_waiver_signed",
        event_category: "legal",
        event_data: {
          waivers_accepted: Object.keys(waivers),
          task_title: taskTitle,
          task_category: taskCategory,
          is_task_doer: isTaskDoer,
          signed_at: new Date().toISOString(),
          ip_consent: true,
        },
      });

      toast.success("Liability waiver accepted");
      onAccepted();
    } catch (error) {
      console.error("Error accepting waiver:", error);
      toast.error("Failed to save waiver. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = () => {
    toast.info("You must accept the liability waiver to proceed with this booking");
    onDeclined?.();
  };

  const isHighRiskCategory = ["construction", "electrical", "plumbing", "roofing", "moving"].includes(
    taskCategory?.toLowerCase() || ""
  );

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-2xl w-[95vw] max-h-[90vh] p-0 flex flex-col overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-4 sm:p-6 pb-2 flex-shrink-0 border-b bg-red-50 dark:bg-red-950/30">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl text-red-700 dark:text-red-400">
            <Gavel className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            <span>Liability Waiver & Release Agreement</span>
          </DialogTitle>
          <DialogDescription className="text-red-600 dark:text-red-500">
            IMPORTANT LEGAL DOCUMENT - Please read carefully before proceeding
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4 sm:px-6">
          <div className="space-y-4 py-4">
            {/* Warning Banner */}
            <div className="bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-400 dark:border-amber-600 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800 dark:text-amber-200">
                    READ THIS CAREFULLY
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    By accepting this waiver, you are giving up certain legal rights, including the right to sue 
                    SaskTask for injuries, damages, or losses. This is a legally binding document.
                  </p>
                </div>
              </div>
            </div>

            {isHighRiskCategory && (
              <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-600 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <HardHat className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-800 dark:text-red-200">
                      HIGH-RISK TASK CATEGORY
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      This task involves activities that may pose increased physical risk. 
                      {isTaskDoer ? " Ensure you have appropriate WCB coverage and insurance." : " Ensure the Task Doer is properly insured."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Task Info */}
            {taskTitle && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">
                  <strong>Task:</strong> {taskTitle}
                  {taskCategory && <span className="ml-2 text-primary">({taskCategory})</span>}
                </p>
              </div>
            )}

            {/* Platform Role */}
            <section className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Scale className="w-5 h-5 text-primary" />
                Platform Role Acknowledgment
              </h3>
              <p className="text-sm text-muted-foreground">
                I understand and acknowledge that SaskTask is a <strong>technology platform</strong> that 
                connects Task Givers with Task Doers. SaskTask is NOT:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
                <li>• An employer of Task Doers</li>
                <li>• A party to the service agreement between users</li>
                <li>• Responsible for the quality, safety, or legality of tasks</li>
                <li>• A guarantor of user identity, background, or abilities</li>
                <li>• An insurer of tasks or damages</li>
              </ul>
            </section>

            {/* Assumption of Risk */}
            <section className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Assumption of Risk
              </h3>
              <p className="text-sm text-muted-foreground">
                I voluntarily assume all risks associated with using the SaskTask platform and participating 
                in tasks, including but not limited to:
              </p>
              <div className="grid sm:grid-cols-2 gap-2 mt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Heart className="w-4 h-4 text-red-500" />
                  Personal injury or illness
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Home className="w-4 h-4 text-blue-500" />
                  Property damage or loss
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Car className="w-4 h-4 text-green-500" />
                  Vehicle or equipment damage
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-purple-500" />
                  Third-party claims
                </div>
              </div>
            </section>

            {/* Release of Liability */}
            <section className="bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-800 rounded-lg p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-2 text-red-700 dark:text-red-400">
                <Gavel className="w-5 h-5" />
                Release of Liability
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400">
                I HEREBY RELEASE, WAIVE, DISCHARGE, AND COVENANT NOT TO SUE SaskTask, its officers, 
                directors, employees, agents, and affiliates from any and all liability, claims, demands, 
                actions, or causes of action arising out of or related to any loss, damage, or injury 
                that may be sustained by me or my property while using the platform or participating 
                in any task, WHETHER CAUSED BY NEGLIGENCE OR OTHERWISE.
              </p>
            </section>

            {/* Indemnification */}
            <section className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-primary" />
                Indemnification Agreement
              </h3>
              <p className="text-sm text-muted-foreground">
                I agree to indemnify, defend, and hold harmless SaskTask from any claims, damages, 
                losses, liabilities, costs, and expenses (including reasonable attorney's fees) arising 
                from my use of the platform, my participation in tasks, my violation of these terms, 
                or my violation of any rights of another party.
              </p>
            </section>

            {/* Insurance Notice */}
            <section className="bg-blue-50 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400">
                <FileText className="w-5 h-5" />
                Insurance Notice
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                {isTaskDoer ? (
                  <>
                    As a Task Doer, I understand that I am responsible for maintaining appropriate 
                    insurance coverage for my activities, including liability insurance and, where required 
                    by Saskatchewan law, Workers' Compensation Board (WCB) coverage. SaskTask does not 
                    provide insurance coverage for Task Doers.
                  </>
                ) : (
                  <>
                    As a Task Giver, I understand that SaskTask does not verify or guarantee the insurance 
                    status of Task Doers. I am encouraged to verify insurance coverage directly with the 
                    Task Doer before allowing work to begin.
                  </>
                )}
              </p>
            </section>

            {/* Arbitration */}
            <section className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-400 dark:border-amber-600 rounded-lg p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-2 text-amber-800 dark:text-amber-200">
                <Scale className="w-5 h-5" />
                Binding Arbitration & Class Action Waiver
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                Any dispute arising out of or relating to this agreement shall be resolved by BINDING 
                ARBITRATION in accordance with the laws of Saskatchewan, Canada. BY ACCEPTING THIS 
                WAIVER, I WAIVE MY RIGHT TO:
              </p>
              <ul className="text-sm text-amber-700 dark:text-amber-300 ml-4 space-y-1">
                <li>• Participate in a class action lawsuit</li>
                <li>• Have disputes decided by a jury</li>
                <li>• Bring claims in any court except as permitted by law</li>
              </ul>
            </section>

            {/* Saskatchewan Law */}
            <section className="bg-green-50 dark:bg-green-950/30 border border-green-300 dark:border-green-800 rounded-lg p-4">
              <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                Governing Law
              </h3>
              <p className="text-sm text-green-700 dark:text-green-400">
                This waiver shall be governed by and construed in accordance with the laws of the 
                Province of Saskatchewan, Canada. I consent to the exclusive jurisdiction of the 
                courts of Saskatchewan for any disputes not subject to arbitration.
              </p>
            </section>
          </div>
        </ScrollArea>

        {/* Acceptance Section */}
        <div className="flex-shrink-0 border-t bg-background p-4 sm:p-6 space-y-3">
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="safety"
                checked={waivers.safetyAcknowledgment}
                onCheckedChange={(checked) => setWaivers(w => ({...w, safetyAcknowledgment: checked === true}))}
              />
              <label htmlFor="safety" className="text-xs sm:text-sm cursor-pointer">
                I have read and understand the <strong>Safety Guidelines</strong>
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="liability"
                checked={waivers.liabilityRelease}
                onCheckedChange={(checked) => setWaivers(w => ({...w, liabilityRelease: checked === true}))}
              />
              <label htmlFor="liability" className="text-xs sm:text-sm cursor-pointer">
                I agree to the <strong>Release of Liability</strong>
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="insurance"
                checked={waivers.insuranceAcknowledgment}
                onCheckedChange={(checked) => setWaivers(w => ({...w, insuranceAcknowledgment: checked === true}))}
              />
              <label htmlFor="insurance" className="text-xs sm:text-sm cursor-pointer">
                I acknowledge the <strong>Insurance Notice</strong>
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="indemnify"
                checked={waivers.indemnification}
                onCheckedChange={(checked) => setWaivers(w => ({...w, indemnification: checked === true}))}
              />
              <label htmlFor="indemnify" className="text-xs sm:text-sm cursor-pointer">
                I agree to <strong>Indemnify SaskTask</strong>
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="arbitration"
                checked={waivers.arbitrationAgreement}
                onCheckedChange={(checked) => setWaivers(w => ({...w, arbitrationAgreement: checked === true}))}
              />
              <label htmlFor="arbitration" className="text-xs sm:text-sm cursor-pointer">
                I agree to <strong>Binding Arbitration</strong> and waive class action rights
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="contractor"
                checked={waivers.independentContractor}
                onCheckedChange={(checked) => setWaivers(w => ({...w, independentContractor: checked === true}))}
              />
              <label htmlFor="contractor" className="text-xs sm:text-sm cursor-pointer">
                I understand SaskTask users are <strong>Independent Contractors</strong>
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="risk"
                checked={waivers.riskAssumption}
                onCheckedChange={(checked) => setWaivers(w => ({...w, riskAssumption: checked === true}))}
              />
              <label htmlFor="risk" className="text-xs sm:text-sm cursor-pointer">
                I <strong>Voluntarily Assume All Risks</strong> associated with this task
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={handleDecline}
              disabled={isSubmitting}
              className="flex-1"
            >
              Decline
            </Button>
            <Button 
              onClick={handleAccept}
              disabled={!allAccepted || isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  I Accept This Waiver
                </>
              )}
            </Button>
          </div>

          <p className="text-[10px] text-center text-muted-foreground">
            This constitutes your electronic signature under Canadian law. Date: {new Date().toLocaleDateString()}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
