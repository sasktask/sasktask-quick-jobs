import { useState, useEffect, useCallback } from "react";
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
import { Eye, EyeOff, Mail, ArrowLeft, Shield, Loader2, Check, AlertCircle, Lock, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Email validation schema
const emailSchema = z.string().trim().toLowerCase().email("Please enter a valid email address").max(255, "Email is too long");

// Sign in validation
const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Sign up validation with strong password requirements
const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: emailSchema,
  phone: z.string()
    .regex(/^\+?[1-9]\d{6,14}$/, "Please enter a valid phone number (e.g., +1234567890)")
    .optional()
    .or(z.literal("")),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  role: z.enum(["task_giver", "task_doer"]),
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

const checkRateLimit = (): { allowed: boolean; remainingTime: number } => {
  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  if (!stored) return { allowed: true, remainingTime: 0 };
  
  const { attempts, lockoutUntil } = JSON.parse(stored);
  
  if (lockoutUntil && Date.now() < lockoutUntil) {
    return { allowed: false, remainingTime: Math.ceil((lockoutUntil - Date.now()) / 1000 / 60) };
  }
  
  if (lockoutUntil && Date.now() >= lockoutUntil) {
    localStorage.removeItem(RATE_LIMIT_KEY);
    return { allowed: true, remainingTime: 0 };
  }
  
  return { allowed: attempts < MAX_ATTEMPTS, remainingTime: 0 };
};

const recordAttempt = (success: boolean) => {
  if (success) {
    localStorage.removeItem(RATE_LIMIT_KEY);
    return;
  }
  
  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  const data = stored ? JSON.parse(stored) : { attempts: 0, lockoutUntil: null };
  
  data.attempts += 1;
  
  if (data.attempts >= MAX_ATTEMPTS) {
    data.lockoutUntil = Date.now() + LOCKOUT_DURATION;
  }
  
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
};

const Auth = () => {
  const [searchParams] = useSearchParams();
  const isPasswordReset = searchParams.get("reset") === "true";
  
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"task_giver" | "task_doer">("task_doer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showNewPassword, setShowNewPassword] = useState(isPasswordReset);
  const [newPassword, setNewPassword] = useState("");
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordStrength = getPasswordStrength(password);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Defer navigation to avoid deadlock
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

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !isPasswordReset) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, isPasswordReset]);

  const clearErrors = () => {
    setFormErrors({});
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setIsLoading(true);

    try {
      // Check password confirmation
      if (password !== confirmPassword) {
        setFormErrors({ confirmPassword: "Passwords do not match" });
        setIsLoading(false);
        return;
      }

      // Validate all inputs
      const validation = signUpSchema.safeParse({
        fullName,
        email,
        phone: phone || undefined,
        password,
        role,
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

      const { data, error } = await supabase.auth.signUp({
        email: validation.data.email,
        password: validation.data.password,
        options: {
          data: {
            full_name: validation.data.fullName,
            phone: validation.data.phone || null,
            role: validation.data.role,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes("already registered")) {
          setFormErrors({ email: "This email is already registered. Please sign in instead." });
          return;
        }
        throw error;
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        toast({
          title: "Check your email",
          description: "We've sent you a verification link. Please check your email to complete registration.",
        });
      } else if (data.session) {
        toast({
          title: "Account created!",
          description: "Welcome to SaskTask. Redirecting...",
        });
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unable to create account. Please try again.";
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setRateLimitError(null);
    
    // Check rate limiting
    const { allowed, remainingTime } = checkRateLimit();
    if (!allowed) {
      setRateLimitError(`Too many failed attempts. Please try again in ${remainingTime} minutes.`);
      return;
    }
    
    setIsLoading(true);

    try {
      const validation = signInSchema.safeParse({ email, password });

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

      const { error } = await supabase.auth.signInWithPassword({
        email: validation.data.email,
        password: validation.data.password,
      });

      if (error) {
        recordAttempt(false);
        
        if (error.message.includes("Invalid login credentials")) {
          setFormErrors({ password: "Invalid email or password. Please check your credentials." });
          return;
        }
        if (error.message.includes("Email not confirmed")) {
          setFormErrors({ email: "Please verify your email before signing in. Check your inbox." });
          return;
        }
        throw error;
      }

      recordAttempt(true);
      toast({
        title: "Welcome back!",
        description: "Signing you in...",
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unable to sign in. Please try again.";
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setIsLoading(true);

    try {
      const emailValidation = emailSchema.safeParse(resetEmail);
      if (!emailValidation.success) {
        setFormErrors({ resetEmail: emailValidation.error.errors[0].message });
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) throw error;

      toast({
        title: "Reset link sent",
        description: "Check your email for a password reset link.",
      });
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setIsLoading(true);

    try {
      const passwordValidation = signUpSchema.shape.password.safeParse(newPassword);
      if (!passwordValidation.success) {
        setFormErrors({ newPassword: passwordValidation.error.errors[0].message });
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password. Please try again.",
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
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {formErrors.newPassword && (
                      <p className="text-sm text-destructive">{formErrors.newPassword}</p>
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
                <CardDescription>Enter your email to receive a password reset link</CardDescription>
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
                      <p className="text-sm text-destructive">{formErrors.resetEmail}</p>
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
      <SEOHead 
        title="Sign In or Sign Up - SaskTask"
        description="Create your SaskTask account or sign in to find local help or earn money completing tasks in Saskatchewan"
        url="/auth"
      />
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold mb-2 text-gradient">Welcome to SaskTask</h1>
            <p className="text-muted-foreground">Your local task marketplace</p>
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
                  <TabsTrigger value="signin" onClick={clearErrors}>Sign In</TabsTrigger>
                  <TabsTrigger value="signup" onClick={clearErrors}>Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    {rateLimitError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{rateLimitError}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
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
                          disabled={!!rateLimitError}
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
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
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
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {formErrors.password && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.password}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="remember" 
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        />
                        <Label htmlFor="remember" className="text-sm cursor-pointer">Remember me</Label>
                      </div>
                      <Button 
                        type="button" 
                        variant="link" 
                        className="p-0 h-auto text-sm"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading || !!rateLimitError} variant="hero">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Sign In Securely
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="John Doe"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (formErrors.fullName) clearErrors();
                          }}
                          className={`pl-10 ${formErrors.fullName ? "border-destructive" : ""}`}
                          required
                          autoComplete="name"
                        />
                      </div>
                      {formErrors.fullName && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.fullName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
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
                      <Label htmlFor="signup-phone">Phone Number (Optional)</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="+1234567890"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (formErrors.phone) clearErrors();
                        }}
                        className={formErrors.phone ? "border-destructive" : ""}
                        autoComplete="tel"
                      />
                      {formErrors.phone && (
                        <p className="text-sm text-destructive">{formErrors.phone}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (formErrors.password) clearErrors();
                          }}
                          className={formErrors.password ? "border-destructive" : ""}
                          required
                          autoComplete="new-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {password && (
                        <div className="space-y-1">
                          <div className="flex gap-1">
                            {[...Array(6)].map((_, i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded ${
                                  i < passwordStrength.score ? passwordStrength.color : "bg-muted"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Password strength: <span className={passwordStrength.score >= 5 ? "text-green-600" : passwordStrength.score >= 3 ? "text-yellow-600" : "text-destructive"}>{passwordStrength.label}</span>
                          </p>
                        </div>
                      )}
                      {formErrors.password && (
                        <p className="text-sm text-destructive">{formErrors.password}</p>
                      )}
                      <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                        <li className={`flex items-center gap-1 ${password.length >= 8 ? "text-green-600" : ""}`}>
                          {password.length >= 8 ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          At least 8 characters
                        </li>
                        <li className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? "text-green-600" : ""}`}>
                          {/[A-Z]/.test(password) ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          One uppercase letter
                        </li>
                        <li className={`flex items-center gap-1 ${/[a-z]/.test(password) ? "text-green-600" : ""}`}>
                          {/[a-z]/.test(password) ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          One lowercase letter
                        </li>
                        <li className={`flex items-center gap-1 ${/[0-9]/.test(password) ? "text-green-600" : ""}`}>
                          {/[0-9]/.test(password) ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          One number
                        </li>
                        <li className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(password) ? "text-green-600" : ""}`}>
                          {/[^A-Za-z0-9]/.test(password) ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          One special character
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (formErrors.confirmPassword) clearErrors();
                          }}
                          className={formErrors.confirmPassword ? "border-destructive" : ""}
                          required
                          autoComplete="new-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {formErrors.confirmPassword && (
                        <p className="text-sm text-destructive">{formErrors.confirmPassword}</p>
                      )}
                      {confirmPassword && password === confirmPassword && (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Passwords match
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>I want to:</Label>
                      <RadioGroup value={role} onValueChange={(value: "task_giver" | "task_doer") => setRole(value)}>
                        <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                          <RadioGroupItem value="task_doer" id="task_doer" />
                          <Label htmlFor="task_doer" className="cursor-pointer flex-1">
                            <div className="font-medium">Find Tasks to Do</div>
                            <div className="text-sm text-muted-foreground">Earn money by completing tasks</div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                          <RadioGroupItem value="task_giver" id="task_giver" />
                          <Label htmlFor="task_giver" className="cursor-pointer flex-1">
                            <div className="font-medium">Post Tasks</div>
                            <div className="text-sm text-muted-foreground">Get help with your tasks</div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        By signing up, you agree to our Terms of Service and Privacy Policy. Your data is encrypted and secure.
                      </AlertDescription>
                    </Alert>

                    <Button type="submit" className="w-full" disabled={isLoading} variant="hero">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
