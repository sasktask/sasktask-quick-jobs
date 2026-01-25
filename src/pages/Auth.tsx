// @ts-nocheck
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { PhoneVerification } from "@/components/PhoneVerification";
import { SignupProgressBar, WelcomeAnimation, GoogleSignInButton, SignupStepInfo, MagicLinkButton, AppleSignInButton, OnboardingTutorialDialog } from "@/components/auth";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Mail,
  ArrowLeft,
  Shield,
  Loader2,
  Check,
  AlertCircle,
  Lock,
  User,
  Briefcase,
  Wrench,
  Users,
  Calendar,
  CheckCircle2,
} from "lucide-react";

// Minimum age requirement
const MIN_AGE = 18;

// Email validation schema
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address")
  .max(255, "Email is too long");

// Password validation
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

// Age validation helper
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

// Signup step schemas
const step1Schema = z.object({
  firstName: z.string().trim().min(2, "First name must be at least 2 characters").max(50, "First name is too long"),
  middleName: z.string().trim().max(50, "Middle name is too long").optional().or(z.literal("")),
  lastName: z.string().trim().min(2, "Last name must be at least 2 characters").max(50, "Last name is too long"),
  email: emailSchema,
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

const step2Schema = z.object({
  role: z.enum(["task_giver", "task_doer", "both"]),
});

const step3Schema = z.object({
  password: passwordSchema,
  confirmPassword: passwordSchema,
});

const step4Schema = z.object({
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{6,14}$/, "Phone number is required (e.g., +1234567890)")
    .min(1, "Phone number is required"),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
});

// Password strength checker
const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Weak", color: "bg-destructive" };
  if (score <= 4) return { score, label: "Medium", color: "bg-yellow-500" };
  return { score, label: "Strong", color: "bg-green-500" };
};

// Rate limiting helper
const RATE_LIMIT_KEY = "auth_attempts";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Scoped styles for the custom radio inputs used in role selection
const roleStyles = `
.auth-role .radio-input {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.auth-role .radio-input * {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.auth-role .radio-input label {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 0 20px;
  width: 100%;
  cursor: pointer;
  min-height: 64px;
  position: relative;
  color: hsl(var(--foreground));
}

.auth-role .radio-input label::before {
  position: absolute;
  content: "";
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 56px;
  z-index: -1;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border-radius: 10px;
  border: 2px solid transparent;
  background: hsl(var(--card));
  border-color: hsl(var(--border));
}

.auth-role .radio-input label:hover::before {
  transition: all 0.2s ease;
  background-color: hsl(var(--muted));
}

.auth-role .radio-input .label:has(input:checked)::before {
  background-color: hsla(var(--primary), 0.12);
  border-color: hsl(var(--primary));
  height: 60px;
}

.auth-role .radio-input .label .text {
  color: hsl(var(--foreground));
}

.auth-role .radio-input .label input[type="radio"] {
  background-color: hsl(var(--muted));
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid hsl(var(--border));
}

.auth-role .radio-input .label input[type="radio"]:checked {
  background-color: hsl(var(--primary));
  animation: auth-role-pulse 0.7s forwards;
  border-color: hsl(var(--primary));
}

.auth-role .radio-input .label input[type="radio"]::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  transition: all 0.1s cubic-bezier(0.165, 0.84, 0.44, 1);
  background-color: hsl(var(--primary-foreground, 0 0% 100%));
  transform: scale(0);
}

.auth-role .radio-input .label input[type="radio"]:checked::before {
  transform: scale(1);
}

@keyframes auth-role-pulse {
  0% {
    box-shadow: 0 0 0 0 hsla(var(--primary), 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px hsla(var(--primary), 0);
  }
  100% {
    box-shadow: 0 0 0 0 hsla(var(--primary), 0);
  }
}
`;

const checkRateLimit = (): { allowed: boolean; remainingTime: number } => {
  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  if (!stored) return { allowed: true, remainingTime: 0 };

  try {
    const { attempts, lockoutUntil } = JSON.parse(stored);

    if (lockoutUntil && Date.now() < lockoutUntil) {
      return {
        allowed: false,
        remainingTime: Math.ceil((lockoutUntil - Date.now()) / 1000 / 60),
      };
    }

    if (lockoutUntil && Date.now() >= lockoutUntil) {
      localStorage.removeItem(RATE_LIMIT_KEY);
      return { allowed: true, remainingTime: 0 };
    }

    return { allowed: attempts < MAX_ATTEMPTS, remainingTime: 0 };
  } catch {
    localStorage.removeItem(RATE_LIMIT_KEY);
    return { allowed: true, remainingTime: 0 };
  }
};

const recordAttempt = (success: boolean) => {
  if (success) {
    localStorage.removeItem(RATE_LIMIT_KEY);
    return;
  }
  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  let data: { attempts: number; lockoutUntil: number | null };

  try {
    data = stored ? JSON.parse(stored) : { attempts: 0, lockoutUntil: null };
  } catch {
    data = { attempts: 0, lockoutUntil: null };
  }

  data.attempts += 1;

  if (data.attempts >= MAX_ATTEMPTS) {
    data.lockoutUntil = Date.now() + LOCKOUT_DURATION;
  }

  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
};

const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "signin" ? "signin" : "signup";
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showWelcome, setShowWelcome] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Refs for autofocus
  const firstNameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Step state
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerificationId, setEmailVerificationId] = useState<string | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [role, setRole] = useState<"task_giver" | "task_doer" | "both">("task_doer");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sign-in state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Real-time validation states
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  // Real-time password match check
  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const clearErrors = () => setFormErrors({});

  // Mark field as touched for real-time validation
  const handleBlur = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  // Real-time validation for email
  const emailError = useMemo(() => {
    if (!touchedFields.email || !email) return null;
    const result = emailSchema.safeParse(email);
    return result.success ? null : result.error.errors[0].message;
  }, [email, touchedFields.email]);

  // Real-time age validation
  const ageValidation = useMemo(() => {
    if (!dateOfBirth) return null;
    return validateAge(dateOfBirth);
  }, [dateOfBirth]);

  // Autofocus on step change
  useEffect(() => {
    if (step === 1 && firstNameRef.current) {
      firstNameRef.current.focus();
    } else if (step === 3 && passwordRef.current) {
      passwordRef.current.focus();
    }
  }, [step]);

  // Auth state onAuthStateChange + session check
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/dashboard");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && mode === "signin") {
        navigate("/dashboard");
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate, mode]);

  // Step helpers
  const validateStep1 = () => {
    const validation = step1Schema.safeParse({
      firstName,
      middleName: middleName || "",
      lastName,
      email,
      dateOfBirth,
    });
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        errors[field] = err.message;
      });
      setFormErrors(errors);
      return null;
    }

    // Age validation
    const { valid, age } = validateAge(dateOfBirth);
    if (!valid) {
      setFormErrors({ dateOfBirth: `You must be at least ${MIN_AGE} years old to use SaskTask. You are ${age} years old.` });
      return null;
    }

    return validation.data;
  };

  const validateStep2 = () => {
    const validation = step2Schema.safeParse({ role });
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        errors[field] = err.message;
      });
      setFormErrors(errors);
      return null;
    }
    return validation.data;
  };

  const validateStep3 = () => {
    const validation = step3Schema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        errors[field] = err.message;
      });
      setFormErrors(errors);
      return null;
    }
    if (validation.data.password !== validation.data.confirmPassword) {
      setFormErrors({ confirmPassword: "Passwords do not match" });
      return null;
    }
    return validation.data;
  };

  const validateStep4 = () => {
    const validation = step4Schema.safeParse({ phone, termsAccepted });
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        errors[field] = err.message;
      });
      setFormErrors(errors);
      return null;
    }
    return validation.data;
  };

  const checkEmailExists = async (emailToCheck: string) => {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", emailToCheck)
      .maybeSingle();
    return !!existing;
  };

  const sendEmailOTP = async (emailToSend: string) => {
    const exists = await checkEmailExists(emailToSend);
    if (exists) {
      toast({
        title: "Account exists",
        description: "This email is already registered. Please sign in.",
        variant: "destructive",
      });
      navigate("/auth?mode=signin");
      return;
    }
    const { data, error } = await supabase.functions.invoke("send-signup-otp", {
      body: { email: emailToSend },
    });
    if (error) {
      throw new Error(data?.error || error.message || "Failed to send verification code");
    }
    if (data?.error) {
      throw new Error(data.error);
    }
    if (data?.verificationId) {
      setEmailVerificationId(data.verificationId);
      toast({
        title: "Verification code sent",
        description: `We've sent a 6-digit code to ${emailToSend}`,
      });
    }
  };

  const handleNext = async () => {
    clearErrors();
    if (step === 1) {
      const validated = validateStep1();
      if (!validated) return;
      if (!emailVerified) {
        if (emailCode.trim().length === 6) {
          await handleVerifyEmail(emailCode);
          if (emailVerified) {
            setStep(2);
          }
        } else {
          toast({
            title: "Verify your email",
            description: "Enter the 6-digit code sent to your email before continuing.",
            variant: "destructive",
          });
        }
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const validated = validateStep2();
      if (!validated) return;
      setStep(3);
    } else if (step === 3) {
      const validated = validateStep3();
      if (!validated) return;
      setStep(4);
    }
  };

  const handleVerifyEmail = async (code?: string) => {
    const otp = (code || emailCode).trim();
    if (otp.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Enter the 6-digit code sent to your email.",
        variant: "destructive",
      });
      return;
    }
    setIsVerifyingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-signup-otp", {
        body: {
          email,
          code: otp,
          verificationId: emailVerificationId,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Verification failed");
      setEmailVerified(true);
      toast({
        title: "Email verified",
        description: "Continue to role selection",
      });
      setStep(2);
    } catch (err: any) {
      toast({
        title: "Verification failed",
        description: err?.message || "Invalid or expired code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleSignIn = async () => {
    clearErrors();
    setIsSigningIn(true);
    try {
      const validation = emailSchema.safeParse(signInEmail.trim());
      if (!validation.success) {
        setFormErrors({ signInEmail: validation.error.errors[0].message });
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: validation.data,
        password: signInPassword,
      });
      if (error) throw error;
      toast({ title: "Welcome back!", description: "Signing you in..." });
    } catch (err: any) {
      toast({
        title: "Sign in failed",
        description: err?.message || "Unable to sign in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleCreateAccount = async () => {
    clearErrors();
    const validated = validateStep4();
    if (!validated) return;
    if (!emailVerified) {
      toast({
        title: "Email not verified",
        description: "Please verify your email before continuing.",
        variant: "destructive",
      });
      setStep(1);
      return;
    }
    if (!phoneVerified) {
      toast({
        title: "Phone not verified",
        description: "Please verify your phone before creating your account.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");
      const primaryRole = role === "both" ? "task_giver" : role;
      const wantsBothRoles = role === "both";

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            first_name: firstName,
            middle_name: middleName || null,
            last_name: lastName,
            date_of_birth: dateOfBirth || null,
            phone,
            role: primaryRole,
            wants_both_roles: wantsBothRoles,
            email_verified: true,
            phone_verified: true,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) throw signUpError;

      if (signUpData?.user) {
        // Show welcome animation
        setShowWelcome(true);

        // Auto sign-in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          console.error("Auto sign-in failed:", signInError);
        }
      }
    } catch (err: any) {
      toast({
        title: "Signup failed",
        description: err?.message || "Unable to create your account.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWelcomeComplete = useCallback(() => {
    setShowWelcome(false);
    // Show onboarding tutorial after welcome animation
    const hasSeenOnboarding = localStorage.getItem("onboarding_completed");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    } else {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
    navigate("/dashboard");
  }, [navigate]);

  // Dedicated sign-in page when mode=signin
  if (mode === "signin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <SEOHead
          title="Sign In - SaskTask"
          description="Sign in to your SaskTask account"
          url="/auth?mode=signin"
        />
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="shadow-2xl border border-border/60 bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                <CardDescription>Sign in to continue to SaskTask</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Social Sign In Options */}
                <div className="space-y-3">
                  <GoogleSignInButton mode="signin" />
                  <AppleSignInButton mode="signin" />
                </div>

                {/* Magic Link Option */}
                <MagicLinkButton mode="signin" />

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or use password</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value.trim())}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  {formErrors.signInEmail && <p className="text-sm text-destructive">{formErrors.signInEmail}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Your password"
                    autoComplete="current-password"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="signin-remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                  />
                  <Label htmlFor="signin-remember" className="text-sm text-foreground/80">Remember me</Label>
                </div>
                <Button className="w-full h-12" onClick={handleSignIn} disabled={isSigningIn}>
                  {isSigningIn ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                <div className="text-center text-sm text-foreground/70">
                  New to SaskTask?{" "}
                  <Button variant="link" className="px-1" onClick={() => navigate("/auth")}>
                    Create an account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <style>{roleStyles}</style>
      <SEOHead
        title="Get Started - SaskTask"
        description="Create your SaskTask account or sign in to find local help or earn money completing tasks."
        url="/auth"
      />
      <Navbar />

      {/* Welcome Animation Overlay */}
      <WelcomeAnimation
        isVisible={showWelcome}
        userName={firstName}
        onComplete={handleWelcomeComplete}
      />

      {/* Onboarding Tutorial Dialog */}
      <OnboardingTutorialDialog
        open={showOnboarding}
        onOpenChange={handleOnboardingComplete}
        userRole={role === "both" ? "task_doer" : role}
        userName={firstName}
      />

      <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Left: Step Info (desktop) */}
          <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              <SignupStepInfo step={step} />

              {/* Quick stats */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <h4 className="font-semibold text-sm text-foreground mb-3">Why join SaskTask?</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Trusted by 10,000+ users</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Secure payments & escrow</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Verified taskers</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right: Signup Wizard */}
          <div className="flex-1 max-w-xl mx-auto lg:mx-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="shadow-2xl border-border bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold">Create your SaskTask account</CardTitle>
                  <CardDescription>Join thousands of people getting things done</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Social Sign Up Options */}
                  <div className="space-y-3">
                    <GoogleSignInButton mode="signup" />
                    <AppleSignInButton mode="signup" />
                  </div>

                  {/* Magic Link Option */}
                  <MagicLinkButton mode="signup" />

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or fill out the form</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <SignupProgressBar currentStep={step} />

                  {/* Step info (mobile) */}
                  <div className="lg:hidden">
                    <SignupStepInfo step={step} />
                  </div>

                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>First Name *</Label>
                            <Input
                              ref={firstNameRef}
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              onBlur={() => handleBlur("firstName")}
                              placeholder="John"
                              className={formErrors.firstName ? "border-destructive" : ""}
                            />
                            {formErrors.firstName && <p className="text-sm text-destructive">{formErrors.firstName}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label>Last Name *</Label>
                            <Input
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              onBlur={() => handleBlur("lastName")}
                              placeholder="Doe"
                              className={formErrors.lastName ? "border-destructive" : ""}
                            />
                            {formErrors.lastName && <p className="text-sm text-destructive">{formErrors.lastName}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Middle Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
                            <Input
                              value={middleName}
                              onChange={(e) => setMiddleName(e.target.value)}
                              placeholder="A."
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
                              onChange={(e) => setDateOfBirth(e.target.value)}
                              max={new Date().toISOString().split("T")[0]}
                              className={formErrors.dateOfBirth ? "border-destructive" : ""}
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
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email *
                          </Label>
                          <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
                            onBlur={() => handleBlur("email")}
                            placeholder="you@example.com"
                            type="email"
                            autoComplete="email"
                            className={formErrors.email || emailError ? "border-destructive" : emailVerified ? "border-green-500" : ""}
                          />
                          {(formErrors.email || emailError) && (
                            <p className="text-sm text-destructive">{formErrors.email || emailError}</p>
                          )}
                          {emailVerified && (
                            <p className="text-sm text-green-600 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Email verified
                            </p>
                          )}
                        </div>

                        {!emailVerified && (
                          <div className="space-y-3 p-4 rounded-lg bg-muted/50 border border-border">
                            <Label>Verification Code</Label>
                            <Input
                              value={emailCode}
                              onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                              placeholder="Enter 6-digit code"
                              maxLength={6}
                              className="text-center text-lg tracking-widest font-mono"
                            />
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                disabled={isLoading || !email || !!emailError}
                                onClick={async () => {
                                  const validated = validateStep1();
                                  if (!validated) return;
                                  setIsLoading(true);
                                  try {
                                    await sendEmailOTP(validated.email);
                                  } catch (err: any) {
                                    toast({
                                      title: "Email verification failed",
                                      description: err?.message || "Unable to send verification code",
                                      variant: "destructive",
                                    });
                                  } finally {
                                    setIsLoading(false);
                                  }
                                }}
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  "Send / Resend Code"
                                )}
                              </Button>
                              <Button
                                type="button"
                                className="flex-1"
                                disabled={isVerifyingEmail || emailCode.length !== 6}
                                onClick={() => handleVerifyEmail(emailCode)}
                              >
                                {isVerifyingEmail ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Verifying...
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Verify
                                  </>
                                )}
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              We'll send a 6-digit code to verify your email.
                            </p>
                          </div>
                        )}

                        <div className="pt-2 flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Button variant="link" className="px-1 h-auto" onClick={() => navigate("/auth?mode=signin")}>
                              Sign in
                            </Button>
                          </p>
                          <Button onClick={handleNext} disabled={!emailVerified}>
                            Continue
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <Label className="text-sm font-semibold text-foreground">Select your role</Label>
                        <div className="auth-role">
                          <div className="radio-input">
                            <label className="label" htmlFor="task_doer_step">
                              <input
                                id="task_doer_step"
                                type="radio"
                                name="user-role-step"
                                value="task_doer"
                                checked={role === "task_doer"}
                                onChange={() => setRole("task_doer")}
                              />
                              <div className="text flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Wrench className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-foreground">Find Tasks & Earn Money</span>
                                  <span className="text-sm font-medium text-foreground/60">
                                    Browse and complete tasks posted by others
                                  </span>
                                </div>
                              </div>
                            </label>

                            <label className="label" htmlFor="task_giver_step">
                              <input
                                id="task_giver_step"
                                type="radio"
                                name="user-role-step"
                                value="task_giver"
                                checked={role === "task_giver"}
                                onChange={() => setRole("task_giver")}
                              />
                              <div className="text flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Briefcase className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-foreground">Post Tasks & Get Help</span>
                                  <span className="text-sm font-medium text-foreground/60">
                                    Hire local taskers to help with your needs
                                  </span>
                                </div>
                              </div>
                            </label>

                            <label className="label" htmlFor="both_step">
                              <input
                                id="both_step"
                                type="radio"
                                name="user-role-step"
                                value="both"
                                checked={role === "both"}
                                onChange={() => setRole("both")}
                              />
                              <div className="text flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                  <Users className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-foreground">Both - Do & Post Tasks</span>
                                  <span className="text-sm font-medium text-foreground/60">
                                    Earn money and hire help whenever you need
                                  </span>
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>
                        {formErrors.role && <p className="text-sm text-destructive">{formErrors.role}</p>}
                        <div className="flex justify-between gap-3 pt-2">
                          <Button variant="outline" onClick={() => setStep(1)}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                          </Button>
                          <Button onClick={handleNext}>Continue</Button>
                        </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Create Password
                          </Label>
                          <div className="relative">
                            <Input
                              ref={passwordRef}
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              autoComplete="new-password"
                              className={formErrors.password ? "border-destructive pr-10" : "pr-10"}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPassword((s) => !s)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          {formErrors.password && <p className="text-sm text-destructive">{formErrors.password}</p>}

                          {/* Password strength indicator */}
                          {password && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                  <motion.div
                                    className={`h-full ${passwordStrength.color}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                                    transition={{ duration: 0.3 }}
                                  />
                                </div>
                                <span className={`text-xs font-medium ${
                                  passwordStrength.label === "Strong" ? "text-green-500" :
                                  passwordStrength.label === "Medium" ? "text-yellow-500" : "text-destructive"
                                }`}>
                                  {passwordStrength.label}
                                </span>
                              </div>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                <li className={password.length >= 8 ? "text-green-500" : ""}>
                                  {password.length >= 8 ? "✓" : "○"} At least 8 characters
                                </li>
                                <li className={/[A-Z]/.test(password) ? "text-green-500" : ""}>
                                  {/[A-Z]/.test(password) ? "✓" : "○"} One uppercase letter
                                </li>
                                <li className={/[a-z]/.test(password) ? "text-green-500" : ""}>
                                  {/[a-z]/.test(password) ? "✓" : "○"} One lowercase letter
                                </li>
                                <li className={/[0-9]/.test(password) ? "text-green-500" : ""}>
                                  {/[0-9]/.test(password) ? "✓" : "○"} One number
                                </li>
                                <li className={/[^A-Za-z0-9]/.test(password) ? "text-green-500" : ""}>
                                  {/[^A-Za-z0-9]/.test(password) ? "✓" : "○"} One special character
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Confirm Password</Label>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              autoComplete="new-password"
                              className={`pr-10 ${
                                formErrors.confirmPassword ? "border-destructive" :
                                passwordsMatch === true ? "border-green-500" :
                                passwordsMatch === false ? "border-destructive" : ""
                              }`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword((s) => !s)}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          {formErrors.confirmPassword && (
                            <p className="text-sm text-destructive">{formErrors.confirmPassword}</p>
                          )}
                          {passwordsMatch === true && (
                            <p className="text-sm text-green-600 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Passwords match
                            </p>
                          )}
                          {passwordsMatch === false && !formErrors.confirmPassword && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Passwords do not match
                            </p>
                          )}
                        </div>

                        <div className="flex justify-between gap-3 pt-2">
                          <Button variant="outline" onClick={() => setStep(2)}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                          </Button>
                          <Button onClick={handleNext} disabled={!passwordsMatch}>
                            Continue
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {step === 4 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <PhoneVerification
                            email={email}
                            initialPhone={phone}
                            error={formErrors.phone ? "Phone number is required" : undefined}
                            onPhoneChange={(p) => {
                              setPhone((prev) => {
                                if (prev !== p) {
                                  setPhoneVerified(false);
                                }
                                return p;
                              });
                            }}
                            onVerified={(verifiedPhone) => {
                              setPhone(verifiedPhone);
                              setPhoneVerified(true);
                            }}
                          />
                        </div>

                        <div className="space-y-3">
                          <div
                            className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors ${
                              formErrors.termsAccepted
                                ? "border-destructive bg-destructive/5"
                                : termsAccepted
                                  ? "border-green-500/50 bg-green-500/5"
                                  : "border-border"
                            }`}
                          >
                            <Checkbox
                              id="terms-accept"
                              checked={termsAccepted}
                              onCheckedChange={(checked) => {
                                setTermsAccepted(!!checked);
                                if (formErrors.termsAccepted) clearErrors();
                              }}
                              className="mt-1"
                            />
                            <Label htmlFor="terms-accept" className="cursor-pointer text-sm leading-relaxed text-foreground">
                              I agree to the{" "}
                              <a href="/terms" className="text-primary hover:underline font-semibold" target="_blank" rel="noopener noreferrer">
                                Terms of Service
                              </a>{" "}
                              and{" "}
                              <a href="/privacy" className="text-primary hover:underline font-semibold" target="_blank" rel="noopener noreferrer">
                                Privacy Policy
                              </a>
                              .
                            </Label>
                          </div>
                          {formErrors.termsAccepted && (
                            <p className="text-sm font-medium text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {formErrors.termsAccepted}
                            </p>
                          )}
                        </div>

                        <div className="flex justify-between gap-3 pt-2">
                          <Button variant="outline" onClick={() => setStep(3)}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                          </Button>
                          <Button
                            onClick={handleCreateAccount}
                            disabled={isLoading || !phoneVerified || !termsAccepted}
                            className="min-w-[140px]"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              "Create Account"
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
