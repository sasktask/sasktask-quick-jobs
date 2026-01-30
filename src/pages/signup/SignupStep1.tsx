import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getSignupDraft, saveSignupDraft } from "@/lib/signupDraft";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { AppleSignInButton } from "@/components/auth/AppleSignInButton";
import { EnhancedEmailVerification } from "@/components/auth/EnhancedEmailVerification";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { motion } from "framer-motion";
import { AlertCircle, Check, Mail, User, ArrowRight, Sparkles } from "lucide-react";
import { z } from "zod";

// Validation schemas
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address")
  .max(255, "Email is too long");

const nameSchema = z
  .string()
  .trim()
  .min(2, "Must be at least 2 characters")
  .max(50, "Must be less than 50 characters")
  .regex(/^[a-zA-Z\s'-]+$/, "Only letters, spaces, hyphens and apostrophes allowed");

const SignupStep1 = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  // Real-time email validation
  const emailError = useMemo(() => {
    if (!touchedFields.email || !email) return null;
    const result = emailSchema.safeParse(email);
    return result.success ? null : result.error.errors[0].message;
  }, [email, touchedFields.email]);

  // Real-time name validation
  const firstNameError = useMemo(() => {
    if (!touchedFields.firstName || !firstName) return null;
    const result = nameSchema.safeParse(firstName);
    return result.success ? null : result.error.errors[0].message;
  }, [firstName, touchedFields.firstName]);

  const lastNameError = useMemo(() => {
    if (!touchedFields.lastName || !lastName) return null;
    const result = nameSchema.safeParse(lastName);
    return result.success ? null : result.error.errors[0].message;
  }, [lastName, touchedFields.lastName]);

  useEffect(() => {
    const draft = getSignupDraft();
    setFirstName(draft.firstName);
    setLastName(draft.lastName);
    setEmail(draft.email);
    setVerificationId(draft.emailVerificationId || null);
    setEmailVerified(Boolean(draft.emailVerified));
  }, []);

  const handleBlur = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const handleStartVerification = () => {
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setFormErrors({ email: result.error.errors[0].message });
      toast({
        title: "Invalid email",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }
    setShowEmailVerification(true);
  };

  const handleContinue = () => {
    const errors: Record<string, string> = {};

    // Validate all fields
    if (!firstName.trim()) {
      errors.firstName = "First name is required";
    } else {
      const result = nameSchema.safeParse(firstName);
      if (!result.success) errors.firstName = result.error.errors[0].message;
    }

    if (!lastName.trim()) {
      errors.lastName = "Last name is required";
    } else {
      const result = nameSchema.safeParse(lastName);
      if (!result.success) errors.lastName = result.error.errors[0].message;
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else {
      const result = emailSchema.safeParse(email);
      if (!result.success) errors.email = result.error.errors[0].message;
    }

    if (!emailVerified) {
      errors.emailVerified = "Please verify your email to continue";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast({
        title: "Please fix the errors",
        description: "Some information needs to be corrected before continuing.",
        variant: "destructive",
      });
      return;
    }

    saveSignupDraft({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
    });
    navigate("/signup/step-2");
  };

  if (showEmailVerification) {
    return (
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
    );
  }

  return (
    <AuthLayout
      step={1}
      totalSteps={4}
      title="Create your account"
      subtitle="Join thousands of Canadians getting things done"
    >
      <div className="space-y-6">
        {/* Social sign-in options */}
        <div className="space-y-3">
          <GoogleSignInButton mode="signup" />
          <AppleSignInButton mode="signup" />
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-4 text-muted-foreground font-medium">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">
                First name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (formErrors.firstName) {
                      setFormErrors((prev) => ({ ...prev, firstName: "" }));
                    }
                  }}
                  onBlur={() => handleBlur("firstName")}
                  placeholder="John"
                  className={`pl-10 h-12 ${formErrors.firstName || firstNameError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
              </div>
              {(formErrors.firstName || firstNameError) && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-destructive flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.firstName || firstNameError}
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (formErrors.lastName) {
                    setFormErrors((prev) => ({ ...prev, lastName: "" }));
                  }
                }}
                onBlur={() => handleBlur("lastName")}
                placeholder="Doe"
                className={`h-12 ${formErrors.lastName || lastNameError ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {(formErrors.lastName || lastNameError) && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-destructive flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.lastName || lastNameError}
                </motion.p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email address <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailVerified(false);
                  setVerificationId(null);
                  saveSignupDraft({
                    email: e.target.value.trim().toLowerCase(),
                    emailVerified: false,
                    emailVerificationId: null,
                  });
                  if (formErrors.email) {
                    setFormErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
                onBlur={() => handleBlur("email")}
                placeholder="you@example.com"
                className={`pl-10 h-12 ${formErrors.email || emailError ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {emailVerified && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-full">
                    <Check className="w-3 h-3" />
                    Verified
                  </div>
                </div>
              )}
            </div>
            {(formErrors.email || emailError) && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-destructive flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                {formErrors.email || emailError}
              </motion.p>
            )}
          </div>

          {/* Email verification button */}
          {!emailVerified && email && !emailError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-dashed border-2 hover:border-primary hover:bg-primary/5"
                onClick={handleStartVerification}
              >
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                Verify your email address
              </Button>
              {formErrors.emailVerified && (
                <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.emailVerified}
                </p>
              )}
            </motion.div>
          )}
        </div>

        {/* Continue button */}
        <Button
          onClick={handleContinue}
          className="w-full h-12 text-base font-semibold"
          variant="hero"
          size="lg"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

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

export default SignupStep1;
