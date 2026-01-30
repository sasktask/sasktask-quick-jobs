import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { PhoneVerification } from "@/components/PhoneVerification";
import { supabase } from "@/integrations/supabase/client";
import { clearSignupDraft, getSignupDraft, saveSignupDraft } from "@/lib/signupDraft";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  ArrowLeft, 
  Check, 
  Shield, 
  FileText, 
  Phone,
  Sparkles,
  PartyPopper
} from "lucide-react";

const SignupStep4 = () => {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const draft = getSignupDraft();
    if (!draft.password || !draft.role || !draft.email) {
      navigate("/signup/step-3");
      return;
    }
    setEmail(draft.email);
    setPhone(draft.phone);
    setTermsAccepted(draft.termsAccepted);
  }, [navigate]);

  const handleCreateAccount = async () => {
    const draft = getSignupDraft();
    
    if (!phoneVerified) {
      setPhoneError("Please verify your phone number to continue.");
      return;
    }
    
    if (!termsAccepted || !privacyAccepted) {
      toast({
        title: "Agreement required",
        description: "Please accept both the Terms of Service and Privacy Policy to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const fullName = [draft.firstName, draft.middleName, draft.lastName].filter(Boolean).join(" ");
      const primaryRole = draft.role === "both" ? "task_giver" : draft.role;
      const wantsBothRoles = draft.role === "both";

      const { data, error } = await supabase.auth.signUp({
        email: draft.email,
        password: draft.password,
        options: {
          data: {
            full_name: fullName,
            first_name: draft.firstName,
            middle_name: draft.middleName || null,
            last_name: draft.lastName,
            phone,
            role: primaryRole,
            wants_both_roles: wantsBothRoles,
            phone_verified: true,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        throw error;
      }

      clearSignupDraft();

      if (data.session) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
        return;
      }

      toast({
        title: "Check your email",
        description: "Please confirm your email to complete signup, then sign in.",
      });
      navigate("/auth?mode=signin");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: error.message || "Unable to create your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Success animation
  if (showSuccess) {
    return (
      <AuthLayout step={4} totalSteps={4} showTrustBadges={false}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <PartyPopper className="w-12 h-12 text-green-600" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold mb-2"
          >
            Welcome to SaskTask!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground"
          >
            Your account has been created successfully.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6"
          >
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground mt-2">Redirecting to dashboard...</p>
          </motion.div>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      step={4}
      totalSteps={4}
      title="Almost there!"
      subtitle="Verify your phone and accept our terms to complete signup"
    >
      <div className="space-y-6">
        {/* Phone verification */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Phone verification</span>
            {phoneVerified && (
              <span className="ml-auto flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>
          
          <PhoneVerification
            email={email}
            initialPhone={phone}
            onVerified={(verifiedPhone) => {
              setPhone(verifiedPhone);
              setPhoneVerified(true);
              setPhoneError(null);
              saveSignupDraft({ phone: verifiedPhone });
            }}
            onPhoneChange={(nextPhone) => {
              setPhone(nextPhone);
              setPhoneVerified(false);
              saveSignupDraft({ phone: nextPhone });
              if (phoneError) {
                setPhoneError(null);
              }
            }}
            error={phoneError || undefined}
          />
        </div>

        {/* Legal agreements */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 p-4 bg-muted/50 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Legal agreements</span>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(value) => {
                  const next = Boolean(value);
                  setTermsAccepted(next);
                  saveSignupDraft({ termsAccepted: next });
                }}
                className="mt-0.5"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                I agree to the{" "}
                <Link 
                  to="/terms" 
                  target="_blank" 
                  className="text-primary hover:underline underline-offset-4 font-medium"
                >
                  Terms of Service
                </Link>
                {" "}and{" "}
                <Link 
                  to="/independent-contractor-agreement" 
                  target="_blank" 
                  className="text-primary hover:underline underline-offset-4 font-medium"
                >
                  Independent Contractor Agreement
                </Link>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <Checkbox
                id="privacy"
                checked={privacyAccepted}
                onCheckedChange={(value) => setPrivacyAccepted(Boolean(value))}
                className="mt-0.5"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                I have read and agree to the{" "}
                <Link 
                  to="/privacy" 
                  target="_blank" 
                  className="text-primary hover:underline underline-offset-4 font-medium"
                >
                  Privacy Policy
                </Link>
                {" "}and consent to the processing of my personal data
              </span>
            </label>
          </div>
        </motion.div>

        {/* Security reminder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl"
        >
          <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-foreground mb-1">Your data is protected</p>
            <p className="text-muted-foreground text-xs">
              We use bank-level encryption and never share your personal information with third parties without your consent.
            </p>
          </div>
        </motion.div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/signup/step-3")}
            disabled={loading}
            className="h-12"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleCreateAccount}
            disabled={loading || !phoneVerified || !termsAccepted || !privacyAccepted}
            className="flex-1 h-12 text-base font-semibold"
            variant="hero"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Create my account
              </>
            )}
          </Button>
        </div>

        {/* Sign in link */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/auth?mode=signin"
            className="font-semibold text-primary hover:underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignupStep4;
