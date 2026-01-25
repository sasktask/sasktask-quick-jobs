import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FileText, Shield, Scale, AlertTriangle, Check, Loader2, Gavel, HardHat, Ban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TermsAcceptanceDialogProps {
  open: boolean;
  onAccepted: () => void;
  userRole: "task_giver" | "task_doer" | "both";
}

export function TermsAcceptanceDialog({ open, onAccepted, userRole }: TermsAcceptanceDialogProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [conductAccepted, setConductAccepted] = useState(false);
  const [liabilityAccepted, setLiabilityAccepted] = useState(false);
  const [arbitrationAccepted, setArbitrationAccepted] = useState(false);
  const [indemnificationAccepted, setIndemnificationAccepted] = useState(false);
  const [safetyAccepted, setSafetyAccepted] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const allAccepted = termsAccepted && privacyAccepted && ageVerified && conductAccepted && liabilityAccepted && arbitrationAccepted && indemnificationAccepted && safetyAccepted;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = async () => {
    if (!allAccepted) {
      toast.error("Please accept all terms and conditions");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      // Check if verification record exists
      const { data: existingVerification } = await supabase
        .from("verifications")
        .select("id")
        .eq("user_id", user.id)
        .single();

      // Log to audit trail for legal compliance
      await supabase.from("audit_trail_events").insert({
        user_id: user.id,
        event_type: "terms_accepted",
        event_category: "legal",
        event_data: {
          terms_version: "2026-01-25",
          acceptances: {
            terms_of_service: termsAccepted,
            privacy_policy: privacyAccepted,
            age_verification: ageVerified,
            user_conduct: conductAccepted,
            liability_waiver: liabilityAccepted,
            arbitration_agreement: arbitrationAccepted,
            indemnification: indemnificationAccepted,
            safety_guidelines: safetyAccepted,
          },
          user_role: userRole,
          accepted_at: new Date().toISOString(),
        },
      });

      if (existingVerification) {
        // Update existing record
        const { error } = await supabase
          .from("verifications")
          .update({
            terms_accepted: true,
            terms_accepted_at: new Date().toISOString(),
            privacy_accepted: true,
            privacy_accepted_at: new Date().toISOString(),
            age_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from("verifications")
          .insert({
            user_id: user.id,
            terms_accepted: true,
            terms_accepted_at: new Date().toISOString(),
            privacy_accepted: true,
            privacy_accepted_at: new Date().toISOString(),
            age_verified: true
          });

        if (error) throw error;
      }

      toast.success("Terms and conditions accepted successfully");
      onAccepted();
    } catch (error) {
      console.error("Error accepting terms:", error);
      toast.error("Failed to save acceptance. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleSpecificTerms = userRole === "task_doer" || userRole === "both" 
    ? `As a Task Doer, you agree to: accurately represent your skills and qualifications; complete accepted tasks professionally; maintain required insurance and certifications; comply with all applicable laws and licensing requirements; and maintain confidentiality of Task Giver information.`
    : "";

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-3xl w-[95vw] max-h-[95vh] p-0 flex flex-col overflow-hidden" 
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header - Fixed */}
        <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4 flex-shrink-0 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
            <span>Terms of Service Agreement</span>
          </DialogTitle>
          <DialogDescription>
            Please read and accept the following terms to continue
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div 
          className="flex-1 overflow-y-auto px-4 sm:px-6 min-h-0" 
          onScroll={handleScroll}
          ref={scrollRef}
        >
          <div className="space-y-4 py-4">
            {/* Introduction */}
            <section>
              <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 mb-2">
                <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                <span>Legal Agreement</span>
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                This is a legally binding agreement between you and SaskTask. By accepting these terms, you agree to be bound by the Terms of Service, Privacy Policy, and all applicable laws and regulations of Canada.
              </p>
            </section>

            <Separator />

            {/* Key Terms Summary */}
            <section>
              <h3 className="font-semibold text-base sm:text-lg mb-2">Key Terms Summary</h3>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1.5">
                <li className="flex items-start gap-2">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Eligibility:</strong> You must be at least 18 years old.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Account:</strong> You are responsible for account security.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Payments:</strong> Processed through Stripe with escrow protection.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Taxes:</strong> You are responsible for your taxes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Disputes:</strong> Resolved through binding arbitration.</span>
                </li>
              </ul>
            </section>

            <Separator />

            {/* User Conduct */}
            <section>
              <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                <span>User Conduct</span>
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                You agree to provide accurate information, pay agreed amounts, and treat others with respect.
              </p>
              {roleSpecificTerms && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {roleSpecificTerms}
                </p>
              )}
            </section>

            <Separator />

            {/* Prohibited Activities */}
            <section>
              <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 mb-2">
                <Ban className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                <span>Prohibited Activities</span>
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                No illegal tasks, payment circumvention, harassment, fraud, or multiple accounts. Violations result in permanent ban.
              </p>
            </section>

            <Separator />

            {/* Safety Guidelines */}
            <section className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold text-sm sm:text-base mb-1 text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <HardHat className="w-4 h-4" />
                Safety & Insurance Requirements
              </h3>
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                Task Doers must maintain appropriate insurance. Certain tasks require WCB Saskatchewan coverage. Users are responsible for their own safety.
              </p>
            </section>

            <Separator />

            {/* Liability */}
            <section className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold text-sm sm:text-base mb-1 text-red-800 dark:text-red-200 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Limitation of Liability
              </h3>
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">
                SaskTask is a platform only. We are NOT liable for: task quality, user conduct, injuries, property damage, or any losses. Services provided "AS IS" without warranties.
              </p>
            </section>

            <Separator />

            {/* Indemnification */}
            <section>
              <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 mb-2">
                <Gavel className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                <span>Indemnification</span>
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                You agree to defend and hold harmless SaskTask from any claims, damages, or expenses arising from your use of the platform or violation of these terms.
              </p>
            </section>

            <Separator />

            {/* Arbitration */}
            <section className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-400 dark:border-amber-600 rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold text-sm sm:text-base mb-1 text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <Scale className="w-4 h-4" />
                BINDING ARBITRATION & CLASS ACTION WAIVER
              </h3>
              <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">
                <strong>⚠️ IMPORTANT:</strong> By accepting, you agree that ALL disputes will be resolved through BINDING ARBITRATION under Saskatchewan law. You WAIVE your right to participate in class actions, have disputes decided by a jury, or bring claims in court except as permitted by law.
              </p>
            </section>

            {/* Full Terms Link */}
            <section className="text-center py-2">
              <a 
                href="/terms" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline text-xs sm:text-sm"
              >
                Read Full Terms →
              </a>
              <span className="mx-2 text-muted-foreground">|</span>
              <a 
                href="/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline text-xs sm:text-sm"
              >
                Privacy Policy →
              </a>
            </section>

            {!hasScrolledToBottom && (
              <p className="text-center text-xs sm:text-sm text-muted-foreground animate-pulse pb-2">
                ↓ Scroll down to continue ↓
              </p>
            )}
          </div>
        </div>

        {/* Footer - Fixed with checkboxes and button */}
        <div className="flex-shrink-0 border-t bg-background p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="space-y-2 sm:space-y-3 max-h-[180px] overflow-y-auto">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <Checkbox 
                id="terms" 
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                disabled={!hasScrolledToBottom}
                className="mt-0.5"
              />
              <label htmlFor="terms" className="text-xs sm:text-sm leading-tight cursor-pointer">
                I agree to the <strong>Terms of Service</strong>
              </label>
            </div>

            <div className="flex items-start space-x-2 sm:space-x-3">
              <Checkbox 
                id="privacy" 
                checked={privacyAccepted}
                onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
                disabled={!hasScrolledToBottom}
                className="mt-0.5"
              />
              <label htmlFor="privacy" className="text-xs sm:text-sm leading-tight cursor-pointer">
                I agree to the <strong>Privacy Policy</strong>
              </label>
            </div>

            <div className="flex items-start space-x-2 sm:space-x-3">
              <Checkbox 
                id="age" 
                checked={ageVerified}
                onCheckedChange={(checked) => setAgeVerified(checked === true)}
                disabled={!hasScrolledToBottom}
                className="mt-0.5"
              />
              <label htmlFor="age" className="text-xs sm:text-sm leading-tight cursor-pointer">
                I am <strong>at least 18 years old</strong>
              </label>
            </div>

            <div className="flex items-start space-x-2 sm:space-x-3">
              <Checkbox 
                id="conduct" 
                checked={conductAccepted}
                onCheckedChange={(checked) => setConductAccepted(checked === true)}
                disabled={!hasScrolledToBottom}
                className="mt-0.5"
              />
              <label htmlFor="conduct" className="text-xs sm:text-sm leading-tight cursor-pointer">
                I agree to the <strong>User Conduct Rules</strong>
              </label>
            </div>

            <div className="flex items-start space-x-2 sm:space-x-3">
              <Checkbox 
                id="liability" 
                checked={liabilityAccepted}
                onCheckedChange={(checked) => setLiabilityAccepted(checked === true)}
                disabled={!hasScrolledToBottom}
                className="mt-0.5"
              />
              <label htmlFor="liability" className="text-xs sm:text-sm leading-tight cursor-pointer">
                I accept the <strong>Limitation of Liability</strong>
              </label>
            </div>

            <div className="flex items-start space-x-2 sm:space-x-3">
              <Checkbox 
                id="arbitration" 
                checked={arbitrationAccepted}
                onCheckedChange={(checked) => setArbitrationAccepted(checked === true)}
                disabled={!hasScrolledToBottom}
                className="mt-0.5"
              />
              <label htmlFor="arbitration" className="text-xs sm:text-sm leading-tight cursor-pointer text-amber-700 dark:text-amber-400">
                I agree to <strong>Binding Arbitration</strong> and waive class action rights
              </label>
            </div>

            <div className="flex items-start space-x-2 sm:space-x-3">
              <Checkbox 
                id="indemnification" 
                checked={indemnificationAccepted}
                onCheckedChange={(checked) => setIndemnificationAccepted(checked === true)}
                disabled={!hasScrolledToBottom}
                className="mt-0.5"
              />
              <label htmlFor="indemnification" className="text-xs sm:text-sm leading-tight cursor-pointer">
                I agree to <strong>Indemnify SaskTask</strong>
              </label>
            </div>

            <div className="flex items-start space-x-2 sm:space-x-3">
              <Checkbox 
                id="safety" 
                checked={safetyAccepted}
                onCheckedChange={(checked) => setSafetyAccepted(checked === true)}
                disabled={!hasScrolledToBottom}
                className="mt-0.5"
              />
              <label htmlFor="safety" className="text-xs sm:text-sm leading-tight cursor-pointer">
                I acknowledge the <strong>Safety Guidelines</strong> and insurance requirements
              </label>
            </div>
          </div>

          {!hasScrolledToBottom && (
            <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
              Please scroll through all terms to enable acceptance
            </p>
          )}

          <Button 
            onClick={handleAccept} 
            disabled={!allAccepted || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Accept & Continue
              </>
            )}
          </Button>

          <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
            This constitutes a legal electronic signature under Canadian law.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
