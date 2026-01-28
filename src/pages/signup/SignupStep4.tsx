import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { PhoneVerification } from "@/components/PhoneVerification";
import { supabase } from "@/integrations/supabase/client";
import { clearSignupDraft, getSignupDraft, saveSignupDraft } from "@/lib/signupDraft";
import { Loader2 } from "lucide-react";

const SignupStep4 = () => {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
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
    if (!termsAccepted) {
      toast({
        title: "Terms required",
        description: "Please accept the terms and conditions to continue.",
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
            date_of_birth: draft.dateOfBirth || null,
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
        navigate("/dashboard");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-xl shadow-2xl border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Verify your phone</CardTitle>
          <CardDescription>Step 4 of 4: Phone verification & terms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(value) => {
                const next = Boolean(value);
                setTermsAccepted(next);
                saveSignupDraft({ termsAccepted: next });
              }}
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/signup/step-3")} disabled={loading}>
              Back
            </Button>
            <Button className="flex-1" variant="hero" size="lg" onClick={handleCreateAccount} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupStep4;
