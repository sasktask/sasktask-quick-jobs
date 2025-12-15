import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FileText, Shield, Scale, AlertTriangle, Check, Loader2 } from "lucide-react";
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
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const allAccepted = termsAccepted && privacyAccepted && ageVerified && conductAccepted && liabilityAccepted;

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
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="p-6 pb-0 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FileText className="w-6 h-6 text-primary flex-shrink-0" />
            <span className="break-words">Terms of Service Agreement</span>
          </DialogTitle>
          <DialogDescription className="break-words">
            Please read and accept the following terms to continue using SaskTask
          </DialogDescription>
        </DialogHeader>

        <div 
          className="h-[350px] overflow-y-auto px-6 scroll-smooth" 
          onScroll={handleScroll}
          ref={scrollRef}
        >
          <div className="space-y-6 py-4 pr-2">
            {/* Introduction */}
            <section>
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                <Scale className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Legal Agreement</span>
              </h3>
              <p className="text-sm text-muted-foreground break-words">
                This is a legally binding agreement between you and SaskTask. By accepting these terms, you agree to be bound by the Terms of Service, Privacy Policy, and all applicable laws and regulations of Canada, specifically the Province of Saskatchewan.
              </p>
            </section>

            <Separator />

            {/* Key Terms Summary */}
            <section>
              <h3 className="font-semibold text-lg mb-2">Key Terms Summary</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="break-words"><strong>Eligibility:</strong> You must be at least 18 years old and have legal capacity to enter into contracts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="break-words"><strong>Account:</strong> You are responsible for maintaining account security and all activities under your account.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="break-words"><strong>Payments:</strong> All payments are processed through Stripe and held in escrow until task completion.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="break-words"><strong>Taxes:</strong> You are solely responsible for all applicable taxes on your earnings.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="break-words"><strong>Disputes:</strong> Disputes are resolved through platform mediation and binding arbitration in Saskatchewan.</span>
                </li>
              </ul>
            </section>

            <Separator />

            {/* User Conduct */}
            <section>
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                <span>User Conduct Requirements</span>
              </h3>
              <p className="text-sm text-muted-foreground mb-2 break-words">
                As a Task Giver, you agree to: provide accurate task descriptions; pay agreed amounts upon task completion; provide a safe environment for in-person tasks; and treat Task Doers with respect.
              </p>
              {roleSpecificTerms && (
                <p className="text-sm text-muted-foreground break-words">
                  {roleSpecificTerms}
                </p>
              )}
            </section>

            <Separator />

            {/* Prohibited Activities */}
            <section>
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span>Prohibited Activities</span>
              </h3>
              <p className="text-sm text-muted-foreground break-words">
                You agree NOT to: post or accept illegal tasks; circumvent the payment system; harass or discriminate against other users; post false or fraudulent information; create multiple accounts; use automated systems to access the platform; or engage in any activity that violates these terms or applicable law.
              </p>
            </section>

            <Separator />

            {/* Liability */}
            <section>
              <h3 className="font-semibold text-lg mb-2">Limitation of Liability</h3>
              <p className="text-sm text-muted-foreground break-words">
                SaskTask is a platform connecting Task Givers and Task Doers. We do not employ or control Task Doers, and we do not guarantee the quality, safety, or legality of tasks. The platform is provided "as is" without warranties. To the maximum extent permitted by law, SaskTask shall not be liable for indirect, incidental, special, consequential, or punitive damages.
              </p>
            </section>

            <Separator />

            {/* Privacy */}
            <section>
              <h3 className="font-semibold text-lg mb-2">Privacy & Data Protection</h3>
              <p className="text-sm text-muted-foreground break-words">
                We comply with the Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable provincial privacy legislation. Your personal information is collected, used, and protected in accordance with our Privacy Policy. By using the platform, you consent to our data collection and use practices as described in the Privacy Policy.
              </p>
            </section>

            <Separator />

            {/* Arbitration */}
            <section className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 text-amber-800 dark:text-amber-200">
                Arbitration Agreement
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 break-words">
                <strong>IMPORTANT:</strong> By accepting these terms, you agree that any disputes arising from your use of the Platform will be resolved through binding arbitration in accordance with the Arbitration Act of Saskatchewan, rather than in court. You waive your right to participate in class action lawsuits.
              </p>
            </section>

            <Separator />

            {/* Full Terms Link */}
            <section className="text-center">
              <a 
                href="/terms" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                Read the complete Terms of Service →
              </a>
              <span className="mx-2 text-muted-foreground">|</span>
              <a 
                href="/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                Read the Privacy Policy →
              </a>
            </section>

            {!hasScrolledToBottom && (
              <p className="text-center text-sm text-muted-foreground animate-pulse">
                ↓ Please scroll to read all terms ↓
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Acceptance Checkboxes */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="terms" 
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                disabled={!hasScrolledToBottom}
              />
              <label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
                I have read and agree to the <strong>Terms of Service</strong>
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="privacy" 
                checked={privacyAccepted}
                onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
                disabled={!hasScrolledToBottom}
              />
              <label htmlFor="privacy" className="text-sm leading-tight cursor-pointer">
                I have read and agree to the <strong>Privacy Policy</strong> and consent to the collection and use of my personal information
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="age" 
                checked={ageVerified}
                onCheckedChange={(checked) => setAgeVerified(checked === true)}
                disabled={!hasScrolledToBottom}
              />
              <label htmlFor="age" className="text-sm leading-tight cursor-pointer">
                I confirm that I am <strong>at least 18 years of age</strong> and have the legal capacity to enter into this agreement
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="conduct" 
                checked={conductAccepted}
                onCheckedChange={(checked) => setConductAccepted(checked === true)}
                disabled={!hasScrolledToBottom}
              />
              <label htmlFor="conduct" className="text-sm leading-tight cursor-pointer">
                I agree to abide by the <strong>User Conduct Requirements</strong> and will not engage in any prohibited activities
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="liability" 
                checked={liabilityAccepted}
                onCheckedChange={(checked) => setLiabilityAccepted(checked === true)}
                disabled={!hasScrolledToBottom}
              />
              <label htmlFor="liability" className="text-sm leading-tight cursor-pointer">
                I understand and accept the <strong>Limitation of Liability</strong> and <strong>Arbitration Agreement</strong>
              </label>
            </div>
          </div>

          {!hasScrolledToBottom && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Please scroll through and read all terms before accepting
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
                I Accept All Terms and Conditions
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By clicking "I Accept", you are electronically signing this agreement. 
            This constitutes a legal signature under the Electronic Transactions Act of Saskatchewan.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
