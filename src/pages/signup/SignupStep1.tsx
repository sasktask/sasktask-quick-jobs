import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getSignupDraft, saveSignupDraft } from "@/lib/signupDraft";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { AppleSignInButton } from "@/components/auth/AppleSignInButton";
import { EnhancedEmailVerification } from "@/components/auth/EnhancedEmailVerification";
import { AlertCircle, Calendar, Check } from "lucide-react";

const MIN_AGE = 18;

const validateAge = (dateOfBirth: string): { valid: boolean; age: number } => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return { valid: age >= MIN_AGE, age };
};

const SignupStep1 = () => {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [formErrors, setFormErrors] = useState<{ dateOfBirth?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const ageValidation = useMemo(() => {
    if (!dateOfBirth) return null;
    return validateAge(dateOfBirth);
  }, [dateOfBirth]);

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

  const handleStartVerification = () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email before requesting a code.",
        variant: "destructive",
      });
      return;
    }

    setShowEmailVerification(true);
  };

  const handleContinue = () => {
    if (!dateOfBirth) {
      setFormErrors((prev) => ({ ...prev, dateOfBirth: "Date of birth is required" }));
    }
    if (dateOfBirth && ageValidation && !ageValidation.valid) {
      setFormErrors((prev) => ({
        ...prev,
        dateOfBirth: `You must be at least ${MIN_AGE} years old to use SaskTask. You are ${ageValidation.age} years old.`,
      }));
    }
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !dateOfBirth) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields to continue.",
        variant: "destructive",
      });
      return;
    }
    if (ageValidation && !ageValidation.valid) {
      toast({
        title: "Age requirement",
        description: `You must be ${MIN_AGE}+ to use SaskTask.`,
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4 relative">
      {showEmailVerification ? (
        <EnhancedEmailVerification
          email={email.trim().toLowerCase()}
          verificationId={verificationId}
          onVerificationIdReceived={(id) => {
            setVerificationId(id);
            saveSignupDraft({ emailVerificationId: id });
          }}
          onVerified={() => {
            setEmailVerified(true);
            saveSignupDraft({ emailVerified: true });
            setShowEmailVerification(false);
          }}
          onBack={() => setShowEmailVerification(false)}
        />
      ) : (
        <Card className="w-full max-w-xl shadow-2xl border-border/50 bg-card/80 backdrop-blur-sm">
          <div className="absolute top-4 right-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate("/")}
            >
              Back home
            </Button>
          </div>
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
              <Label htmlFor="middleName">Middle name(optional)</Label>
              <Input
                id="middleName"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Middle name"
                className="h-11"
              />
              {middleName && (
                <p className="text-sm text-muted-foreground">
                  Middle name: {middleName}
                </p>
              )}
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
                  setShowEmailVerification(false);
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
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date of Birth *
              </Label>
              <Input
                type="date"
                value={dateOfBirth}
                onChange={(e) => {
                  setDateOfBirth(e.target.value);
                  if (formErrors.dateOfBirth) {
                    setFormErrors((prev) => ({ ...prev, dateOfBirth: undefined }));
                  }
                }}
                max={new Date().toISOString().split("T")[0]}
                className={formErrors.dateOfBirth ? "border-destructive h-11" : "h-11"}
              />
              {formErrors.dateOfBirth && <p className="text-sm text-destructive">{formErrors.dateOfBirth}</p>}
              {ageValidation && !ageValidation.valid && !formErrors.dateOfBirth && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  You must be {MIN_AGE}+ to use SaskTask
                </p>
              )}
              {ageValidation && ageValidation.valid && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Age verified ({ageValidation.age} years old)
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleStartVerification}
                className="w-full"
                variant="outline"
                disabled={emailVerified}
              >
                {emailVerified ? "Email verified" : "Verify email"}
              </Button>
            </div>

            <Button onClick={handleContinue} className="w-full" variant="hero" size="lg">
              Continue
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SignupStep1;
