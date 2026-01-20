// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";

// Email validation schema
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address")
  .max(255, "Email is too long");

// Phone validation (may be unused but included for isPhone helper)
const phoneSchema = z.string().regex(/^\+?[1-9]\d{6,14}$/, "Please enter a valid phone number (e.g., +1234567890)");

// Password validation
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

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
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const clearErrors = () => setFormErrors({});

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
        toast({
          title: "Verify your email",
          description: "Enter the 6-digit code sent to your email before continuing.",
          variant: "destructive",
        });
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
        toast({
          title: "Account created!",
          description: "Welcome to SaskTask. Signing you in...",
        });
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          console.error("Auto sign-in failed:", signInError);
        }
        navigate("/dashboard");
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


  // Password reset update handler
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setIsLoading(true);

    try {
      const passwordValidation = signUpSchema.shape.password.safeParse(newPassword);
      if (!passwordValidation.success) {
        setFormErrors({
          newPassword: passwordValidation.error.errors[0].message,
        });
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        // Handle specific error cases
        if (error.message && (error.message.includes("same") || error.message.includes("different from the old"))) {
          setFormErrors({
            newPassword: "New password must be different from your current password",
          });
          setIsLoading(false);
          return;
        }
        throw error;
      }

      toast({
        title: "Password updated!",
        description: "Your password has been successfully changed.",
      });

      setShowNewPassword(false);
      setNewPassword("");
      navigate("/dashboard");
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update password";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // (Sign-in reset flows omitted in the wizard refactor)

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
        <div className="container mx-auto px-4 pt-24 pb-16 max-w-xl">
          <Card className="shadow-2xl border border-border/60 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription>Use your email and password to continue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <Button className="w-full" onClick={handleSignIn} disabled={isSigningIn}>
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

      <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">

          {/* Right: Signup Wizard */}
          <div className="md:w-full">
            <Card className="shadow-2xl border-border bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold">Create your SaskTask account</CardTitle>
                <CardDescription>4 steps to get started: email → role → password → phone</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stepper indicator */}
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${s <= step ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/50"
                          }`}
                      >
                        {s}
                      </div>
                      {s < 4 && <div className={`h-[2px] w-8 ${s < step ? "bg-primary" : "bg-muted"}`} />}
                    </div>
                  ))}
                </div>

                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                        />
                        {formErrors.firstName && <p className="text-sm text-destructive">{formErrors.firstName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe"
                        />
                        {formErrors.lastName && <p className="text-sm text-destructive">{formErrors.lastName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Middle Name (optional)</Label>
                        <Input
                          value={middleName}
                          onChange={(e) => setMiddleName(e.target.value)}
                          placeholder="A."
                        />
                        {formErrors.middleName && <p className="text-sm text-destructive">{formErrors.middleName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          value={email}
                          onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
                          placeholder="you@example.com"
                          type="email"
                          autoComplete="email"
                        />
                        {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Date of Birth</Label>
                        <Input
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                        />
                        {formErrors.dateOfBirth && <p className="text-sm text-destructive">{formErrors.dateOfBirth}</p>}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label>Verification code</Label>
                      <Input
                        value={emailCode}
                        onChange={(e) => setEmailCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                      />
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isLoading}
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
                              Sending code...
                            </>
                          ) : (
                            "Send / Resend code"
                          )}
                        </Button>
                        <Button
                          type="button"
                          disabled={isVerifyingEmail}
                          onClick={() => handleVerifyEmail(emailCode)}
                        >
                          {isVerifyingEmail ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            "Verify & continue"
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">We’ll send a 6-digit code to verify your email before continuing.</p>
                    </div>
                    <div className="mt-2">
                      <Label>Already have an account?</Label>{" "}
                      <Button variant="link" className="px-1" onClick={() => navigate("/auth?mode=signin")}>
                        Sign in
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
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
                    <div className="flex justify-between gap-3">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button onClick={handleNext}>Continue</Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="new-password"
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
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          autoComplete="new-password"
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
                      {formErrors.confirmPassword && <p className="text-sm text-destructive">{formErrors.confirmPassword}</p>}
                    </div>
                    <div className="flex justify-between gap-3">
                      <Button variant="outline" onClick={() => setStep(2)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button onClick={handleNext}>Continue</Button>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <PhoneVerification
                        email={email}
                        initialPhone={phone}
                        onPhoneChange={(p) => {
                          setPhone(p);
                          setPhoneVerified(false);
                        }}
                        onVerified={(verifiedPhone) => {
                          setPhone(verifiedPhone);
                          setPhoneVerified(true);
                        }}
                      />
                      {formErrors.phone && <p className="text-sm text-destructive">{formErrors.phone}</p>}
                    </div>
                    <div className="space-y-3">
                      <div
                        className={`flex items-start space-x-3 p-4 rounded-lg border ${formErrors.termsAccepted ? "border-destructive bg-destructive/5" : "border-border"
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
                    <div className="flex justify-between gap-3">
                      <Button variant="outline" onClick={() => setStep(3)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button onClick={handleCreateAccount} disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          "Create account"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
