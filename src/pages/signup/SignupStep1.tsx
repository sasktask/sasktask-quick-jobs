import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getSignupDraft, saveSignupDraft } from "@/lib/signupDraft";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { AppleSignInButton } from "@/components/auth/AppleSignInButton";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const SignupStep1 = () => {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const draft = getSignupDraft();
    setFirstName(draft.firstName);
    setMiddleName(draft.middleName);
    setLastName(draft.lastName);
    setEmail(draft.email);
    setDateOfBirth(draft.dateOfBirth);
    setVerificationId(draft.emailVerificationId || null);
    setEmailVerified(Boolean(draft.emailVerified));
  }, []);

  const sendOtp = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email before requesting a code.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-signup-otp", {
        body: { email: email.trim().toLowerCase() },
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || "Failed to send code");
      }

      if (data?.verificationId) {
        setVerificationId(data.verificationId);
        saveSignupDraft({ emailVerificationId: data.verificationId });
      }

      toast({
        title: "Verification code sent",
        description: "Check your email for the 6-digit code.",
      });
    } catch (err: any) {
      toast({
        title: "Failed to send code",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const verifyOtp = async () => {
    if (!emailCode.trim() || emailCode.trim().length !== 6) {
      toast({
        title: "Invalid code",
        description: "Enter the 6-digit code from your email.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-signup-otp", {
        body: {
          email: email.trim().toLowerCase(),
          code: emailCode.trim(),
          verificationId,
        },
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || "Failed to verify code");
      }

      setEmailVerified(true);
      saveSignupDraft({ emailVerified: true });
      toast({
        title: "Email verified",
        description: "Your email has been verified successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Verification failed",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContinue = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !dateOfBirth) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields to continue.",
        variant: "destructive",
      });
      return;
    }
    if (!emailVerified) {
      toast({
        title: "Verify your email",
        description: "Please verify your email before continuing.",
        variant: "destructive",
      });
      return;
    }

    saveSignupDraft({
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      dateOfBirth,
    });
    navigate("/signup/step-2");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-xl shadow-2xl border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Step 1 of 4: Basic information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <GoogleSignInButton mode="signup" />
            <AppleSignInButton mode="signup" />
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or sign up with email
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">First name *</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="middleName">Middle name</Label>
            <Input
              id="middleName"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              placeholder="Middle name"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name *</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailVerified(false);
                setVerificationId(null);
                setEmailCode("");
                saveSignupDraft({
                  email: e.target.value.trim().toLowerCase(),
                  emailVerified: false,
                  emailVerificationId: null,
                });
              }}
              placeholder="you@example.com"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of birth *</Label>
            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Button onClick={sendOtp} className="w-full" variant="outline" disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending code...
                </>
              ) : (
                "Send verification code"
              )}
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailCode">Verification code *</Label>
            <Input
              id="emailCode"
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value)}
              placeholder="6-digit code"
              className="h-11"
              inputMode="numeric"
            />
          </div>
          <Button onClick={verifyOtp} className="w-full" variant="outline" disabled={isVerifying}>
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : emailVerified ? (
              "Email verified"
            ) : (
              "Verify email"
            )}
          </Button>

          <Button onClick={handleContinue} className="w-full" variant="hero" size="lg">
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupStep1;
