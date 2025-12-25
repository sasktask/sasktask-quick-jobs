// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
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
  Phone,
  Briefcase,
  Wrench,
  Users,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Email validation schema
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address")
  .max(255, "Email is too long");

// Phone validation (may be unused but included for isPhone helper)
const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{6,14}$/, "Please enter a valid phone number (e.g., +1234567890)");

// Sign in validation
const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Sign up validation with strong password requirements
const signUpSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name is too long"),
  middleName: z
    .string()
    .trim()
    .max(50, "Middle name is too long")
    .optional()
    .or(z.literal("")),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name is too long"),
  email: emailSchema,
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{6,14}$/, "Phone number is required (e.g., +1234567890)")
    .min(1, "Phone number is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  role: z.enum(["task_giver", "task_doer", "both"]),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
});

// Password strength checker
const getPasswordStrength = (
  password: string
): { score: number; label: string; color: string } => {
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
  const isPasswordReset = searchParams.get("reset") === "true";

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"task_giver" | "task_doer" | "both">("task_doer");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showNewPassword, setShowNewPassword] = useState(isPasswordReset);
  const [newPassword, setNewPassword] = useState("");
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  // Unified identifier (email or phone)
  const [identifier, setIdentifier] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordStrength = getPasswordStrength(password);

  // Helper to detect if input is email or phone
  const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isPhone = (value: string) => /^\+?[1-9]\d{6,14}$/.test(value);

  const clearErrors = () => {
    setFormErrors({});
  };

  // Auth state onAuthStateChange + session check
  useEffect(() => {
    // Subscribe to auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        setTimeout(async () => {
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("profile_completion")
              .eq("id", session.user.id)
              .single();

            if (!profile || (profile.profile_completion ?? 0) < 80) {
              navigate("/onboarding");
            } else {
              navigate("/dashboard");
            }
          } catch {
            navigate("/dashboard");
          }
        }, 0);
      }
      if (event === "PASSWORD_RECOVERY") {
        setShowNewPassword(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !isPasswordReset) {
        navigate("/dashboard");
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, isPasswordReset]);

  // Sign up handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setIsLoading(true);

    try {
      if (password !== confirmPassword) {
        setFormErrors({ confirmPassword: "Passwords do not match" });
        setIsLoading(false);
        return;
      }
      const validation = signUpSchema.safeParse({
        firstName,
        middleName: middleName || undefined,
        lastName,
        email,
        phone,
        password,
        role,
        termsAccepted,
      });

      if (!validation.success) {
        const errors: Record<string, string> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          errors[field] = err.message;
        });
        setFormErrors(errors);
        setIsLoading(false);
        return;
      }

      // Construct full name from parts
      const fullName = [
        validation.data.firstName,
        validation.data.middleName,
        validation.data.lastName,
      ]
        .filter(Boolean)
        .join(" ");

      const primaryRole =
        validation.data.role === "both" ? "task_giver" : validation.data.role;
      const wantsBothRoles = validation.data.role === "both";

      const { data, error } = await supabase.auth.signUp({
        email: validation.data.email,
        password: validation.data.password,
        options: {
          data: {
            full_name: fullName,
            first_name: validation.data.firstName,
            middle_name: validation.data.middleName || null,
            last_name: validation.data.lastName,
            phone: validation.data.phone,
            role: primaryRole,
            wants_both_roles: wantsBothRoles,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        if (
          error.message &&
          typeof error.message === "string" &&
          error.message.toLowerCase().includes("already registered")
        ) {
          setFormErrors({
            email: "This email is already registered. Please sign in instead.",
          });
          setIsLoading(false);
          return;
        }
        throw error;
      }

      if (data && data.user) {
        toast({
          title: "Account created!",
          description: "Welcome to SaskTask. Please sign in with your credentials.",
        });
        // Auto sign-in after signup
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: validation.data.email,
          password: validation.data.password,
        });

        if (signInError) {
          // Could log the error if desired
        }
        // Redirect handled by onAuthStateChange
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to create account. Please try again.";
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setRateLimitError(null);

    // Check rate limiting
    const { allowed, remainingTime } = checkRateLimit();
    if (!allowed) {
      setRateLimitError(
        `Too many failed attempts. Please try again in ${remainingTime} minutes.`
      );
      return;
    }

    setIsLoading(true);

    try {
      const trimmedIdentifier = identifier.trim();
      const detectedType = isEmail(trimmedIdentifier)
        ? "email"
        : isPhone(trimmedIdentifier)
          ? "phone"
          : null;

      if (!detectedType) {
        setFormErrors({
          identifier: "Please enter a valid email address or phone number",
        });
        setIsLoading(false);
        return;
      }

      if (detectedType === "phone") {
        toast({
          title: "Phone login coming soon",
          description: "Please use your email address for now.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const validation = signInSchema.safeParse({
        email: trimmedIdentifier,
        password,
      });

      if (!validation.success) {
        const errors: Record<string, string> = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (field === "email") {
            errors["identifier"] = err.message;
          } else {
            errors[field] = err.message;
          }
        });
        setFormErrors(errors);
        setIsLoading(false);
        return;
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: validation.data.email,
        password: validation.data.password,
      });

      if (authError) {
        recordAttempt(false);

        if (
          authError.message &&
          typeof authError.message === "string" &&
          authError.message.includes("Invalid login credentials")
        ) {
          setFormErrors({
            password: "Invalid email or password. Please check your credentials.",
          });
          setIsLoading(false);
          return;
        }
        if (
          authError.message &&
          typeof authError.message === "string" &&
          authError.message.includes("Email not confirmed")
        ) {
          setFormErrors({
            identifier: "Please verify your email before signing in. Check your inbox.",
          });
          setIsLoading(false);
          return;
        }
        throw authError;
      }

      recordAttempt(true);
      toast({
        title: "Welcome back!",
        description: "Signing you in...",
      });
      // Redirect handled by onAuthStateChange
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.";
      toast({
        title: "Sign in failed",
        description: errorMessage,
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
        if (
          error.message &&
          (error.message.includes("same") ||
            error.message.includes("different from the old"))
        ) {
          setFormErrors({
            newPassword:
              "New password must be different from your current password",
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
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update password";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setIsLoading(true);

    try {
      const emailValidation = emailSchema.safeParse(resetEmail);
      if (!emailValidation.success) {
        setFormErrors({
          resetEmail: emailValidation.error.errors[0].message,
        });
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) throw error;

      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });

      setShowForgotPassword(false);
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send reset email";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Password Reset View
  if (showNewPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <SEOHead
          title="Set New Password - SaskTask"
          description="Set a new password for your SaskTask account"
          url="/auth"
        />
        <Navbar />

        <div className="container mx-auto px-4 pt-32 pb-20">
          <div className="max-w-md mx-auto">
            <Card className="shadow-2xl border-border">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Set New Password</CardTitle>
                <CardDescription>Enter your new password below</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={formErrors.newPassword ? "border-destructive" : ""}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword((show) => !show)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {formErrors.newPassword && (
                      <p className="text-sm text-destructive">
                        {formErrors.newPassword}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Must be 8+ characters with uppercase, lowercase, number, and special character
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading} variant="hero">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Forgot Password View
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <style>{roleStyles}</style>
        <SEOHead
          title="Reset Password - SaskTask"
          description="Reset your SaskTask account password"
          url="/auth"
        />
        <Navbar />

        <div className="container mx-auto px-4 pt-32 pb-20">
          <div className="max-w-md mx-auto">
            <Card className="shadow-2xl border-border">
              <CardHeader>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-fit mb-2"
                  onClick={() => {
                    setShowForgotPassword(false);
                    clearErrors();
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
                <CardTitle className="text-2xl">Reset Password</CardTitle>
                <CardDescription>
                  Enter your email to receive a password reset link
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="you@example.com"
                        value={resetEmail}
                        onChange={(e) => {
                          setResetEmail(e.target.value);
                          if (formErrors.resetEmail) clearErrors();
                        }}
                        className={`pl-10 ${formErrors.resetEmail ? "border-destructive" : ""}`}
                        required
                      />
                    </div>
                    {formErrors.resetEmail && (
                      <p className="text-sm text-destructive">
                        {formErrors.resetEmail}
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading} variant="hero">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <style>{roleStyles}</style>
      <SEOHead
        title="Sign In or Sign Up - SaskTask"
        description="Create your SaskTask account or sign in to find local help or earn money completing tasks in Saskatchewan"
        url="/auth"
      />
      <Navbar />

      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold mb-2 text-gradient">
              Welcome to SaskTask
            </h1>
            <p className="text-muted-foreground">
              Your local task marketplace
            </p>
          </div>

          <Card className="shadow-2xl border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-2xl">Get Started</CardTitle>
              </div>
              <CardDescription>
                Sign in or create your free account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin" onClick={clearErrors}>
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" onClick={clearErrors}>
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  {rateLimitError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{rateLimitError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Credentials Form */}
                  <div className="space-y-4">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-identifier">Email or Phone</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signin-identifier"
                            type="text"
                            placeholder="you@example.com or +1234567890"
                            value={identifier}
                            onChange={(e) => {
                              setIdentifier(e.target.value);
                              if (formErrors.identifier) clearErrors();
                            }}
                            className={`pl-10 ${formErrors.identifier ? "border-destructive" : ""}`}
                            required
                            autoComplete="email tel"
                            disabled={!!rateLimitError}
                          />
                        </div>
                        {formErrors.identifier && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {formErrors.identifier}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="signin-password">Password</Label>
                          <Button
                            type="button"
                            variant="link"
                            className="p-0 h-auto text-xs"
                            onClick={() => setShowForgotPassword(true)}
                          >
                            Forgot password?
                          </Button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signin-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (formErrors.password) clearErrors();
                            }}
                            className={`pl-10 pr-10 ${formErrors.password ? "border-destructive" : ""}`}
                            required
                            autoComplete="current-password"
                            disabled={!!rateLimitError}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPassword((show) => !show)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {formErrors.password && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {formErrors.password}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember-me"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(!!checked)}
                        />
                        <Label
                          htmlFor="remember-me"
                          className="text-sm font-normal cursor-pointer"
                        >
                          Remember me for 30 days
                        </Label>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || !!rateLimitError}
                        variant="hero"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </form>
                  </div>
                </TabsContent>

                <TabsContent value="signup">
                  {/* Signup Form */}
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstname">
                        First Name <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-firstname"
                          type="text"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            if (formErrors.firstName) clearErrors();
                          }}
                          className={`pl-10 ${formErrors.firstName ? "border-destructive" : ""}`}
                          required
                          autoComplete="given-name"
                        />
                      </div>
                      {formErrors.firstName && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-middlename">
                        Middle Name{" "}
                        <span className="text-muted-foreground text-xs">
                          (optional)
                        </span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-middlename"
                          type="text"
                          placeholder="Robert"
                          value={middleName}
                          onChange={(e) => {
                            setMiddleName(e.target.value);
                            if (formErrors.middleName) clearErrors();
                          }}
                          className={`pl-10 ${formErrors.middleName ? "border-destructive" : ""}`}
                          autoComplete="additional-name"
                        />
                      </div>
                      {formErrors.middleName && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.middleName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-lastname">
                        Last Name <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-lastname"
                          type="text"
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            if (formErrors.lastName) clearErrors();
                          }}
                          className={`pl-10 ${formErrors.lastName ? "border-destructive" : ""}`}
                          required
                          autoComplete="family-name"
                        />
                      </div>
                      {formErrors.lastName && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.lastName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value.toLowerCase().trim());
                            if (formErrors.email) clearErrors();
                          }}
                          className={`pl-10 ${formErrors.email ? "border-destructive" : ""}`}
                          required
                          autoComplete="email"
                        />
                      </div>
                      {formErrors.email && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="+1234567890"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (formErrors.phone) clearErrors();
                          }}
                          className={`pl-10 ${formErrors.phone ? "border-destructive" : ""}`}
                          autoComplete="tel"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Include country code (e.g., +1 for Canada/US)
                      </p>
                      {formErrors.phone && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.phone}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (formErrors.password) clearErrors();
                          }}
                          className={`pl-10 pr-10 ${formErrors.password ? "border-destructive" : ""}`}
                          required
                          autoComplete="new-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword((show) => !show)}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {password && (
                        <div className="space-y-1">
                          <div className="flex gap-1">
                            {[...Array(6)].map((_, i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded ${i < passwordStrength.score
                                  ? passwordStrength.color
                                  : "bg-muted"
                                  }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Password strength:{" "}
                            <span
                              className={
                                passwordStrength.score >= 5
                                  ? "text-green-600"
                                  : passwordStrength.score >= 3
                                    ? "text-yellow-600"
                                    : "text-destructive"
                              }
                            >
                              {passwordStrength.label}
                            </span>
                          </p>
                        </div>
                      )}
                      {formErrors.password && (
                        <p className="text-sm text-destructive">
                          {formErrors.password}
                        </p>
                      )}
                      <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                        <li
                          className={`flex items-center gap-1 ${password.length >= 8 ? "text-green-600" : ""
                            }`}
                        >
                          {password.length >= 8 ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          At least 8 characters
                        </li>
                        <li
                          className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? "text-green-600" : ""
                            }`}
                        >
                          {/[A-Z]/.test(password) ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          One uppercase letter
                        </li>
                        <li
                          className={`flex items-center gap-1 ${/[a-z]/.test(password) ? "text-green-600" : ""
                            }`}
                        >
                          {/[a-z]/.test(password) ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          One lowercase letter
                        </li>
                        <li
                          className={`flex items-center gap-1 ${/[0-9]/.test(password) ? "text-green-600" : ""
                            }`}
                        >
                          {/[0-9]/.test(password) ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          One number
                        </li>
                        <li
                          className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(password)
                            ? "text-green-600"
                            : ""
                            }`}
                        >
                          {/[^A-Za-z0-9]/.test(password) ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          One special character
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (formErrors.confirmPassword) clearErrors();
                          }}
                          className={`pl-10 pr-10 ${formErrors.confirmPassword ? "border-destructive" : ""
                            }`}
                          required
                          autoComplete="new-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword((show) => !show)
                          }
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {formErrors.confirmPassword && (
                        <p className="text-sm text-destructive">
                          {formErrors.confirmPassword}
                        </p>
                      )}
                      {confirmPassword &&
                        password === confirmPassword && (
                          <p className="text-sm text-green-600 flex items-center gap-1">
                            <Check className="h-3 w-3" /> Passwords match
                          </p>
                        )}
                    </div>
                    <div className="space-y-3">
                      <Label>I want to:</Label>
                      <div className="auth-role">
                        <div className="radio-input">
                          <label className="label" htmlFor="task_doer">
                            <input
                              id="task_doer"
                              type="radio"
                              name="user-role"
                              value="task_doer"
                              checked={role === "task_doer"}
                              onChange={() => setRole("task_doer")}
                            />
                            <div className="text flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Wrench className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold">
                                  Find Tasks & Earn Money
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  Browse and complete tasks posted by others
                                </span>
                              </div>
                            </div>
                          </label>

                          <label className="label" htmlFor="task_giver">
                            <input
                              id="task_giver"
                              type="radio"
                              name="user-role"
                              value="task_giver"
                              checked={role === "task_giver"}
                              onChange={() => setRole("task_giver")}
                            />
                            <div className="text flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Briefcase className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold">
                                  Post Tasks & Get Help
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  Hire local taskers to help with your needs
                                </span>
                              </div>
                            </div>
                          </label>

                          <label className="label" htmlFor="both">
                            <input
                              id="both"
                              type="radio"
                              name="user-role"
                              value="both"
                              checked={role === "both"}
                              onChange={() => setRole("both")}
                            />
                            <div className="text flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold">
                                  Both - Do & Post Tasks
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  Earn money and hire help whenever you need
                                </span>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div
                        className={`flex items-start space-x-3 p-4 rounded-lg border ${formErrors.termsAccepted
                          ? "border-destructive bg-destructive/5"
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
                        <Label
                          htmlFor="terms-accept"
                          className="cursor-pointer text-sm leading-relaxed"
                        >
                          I agree to the{" "}
                          <a
                            href="/terms"
                            className="text-primary hover:underline font-medium"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a
                            href="/privacy"
                            className="text-primary hover:underline font-medium"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Privacy Policy
                          </a>
                          . I understand that SaskTask requires identity verification for safety.
                        </Label>
                      </div>
                      {formErrors.termsAccepted && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.termsAccepted}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                      variant="hero"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          <User className="h-4 w-4 mr-2" />
                          Create Account
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Need help?{" "}
            <a href="/contact" className="text-primary hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
