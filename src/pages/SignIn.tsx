import { useState, useMemo } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { AppleSignInButton } from "@/components/auth/AppleSignInButton";
import { MagicLinkButton } from "@/components/auth/MagicLinkButton";
import { ForgotPasswordDialog } from "@/components/auth/ForgotPasswordDialog";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2,
  AlertCircle,
  Shield,
  Fingerprint
} from "lucide-react";
import { z } from "zod";

// Rate limiting
const RATE_LIMIT_KEY = "signin_attempts";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

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

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address");

const SignIn = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  // Real-time email validation
  const emailError = useMemo(() => {
    if (!touched.email || !email) return null;
    const result = emailSchema.safeParse(email);
    return result.success ? null : result.error.errors[0].message;
  }, [email, touched.email]);

  const handleSignIn = async () => {
    setFormErrors({});
    
    // Check rate limiting
    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) {
      toast({
        title: "Too many attempts",
        description: `Please wait ${rateLimit.remainingTime} minutes before trying again.`,
        variant: "destructive",
      });
      return;
    }

    // Validate email
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setFormErrors({ email: emailResult.error.errors[0].message });
      return;
    }

    if (!password) {
      setFormErrors({ password: "Password is required" });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailResult.data,
        password,
      });

      if (error) {
        recordAttempt(false);
        throw error;
      }

      recordAttempt(true);
      toast({ 
        title: "Welcome back!", 
        description: "Signing you in..." 
      });
      navigate("/dashboard");
    } catch (err: any) {
      let errorMessage = "Invalid email or password. Please try again.";
      
      if (err?.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (err?.message?.includes("Email not confirmed")) {
        errorMessage = "Please verify your email address before signing in.";
      }

      setFormErrors({ general: errorMessage });
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSignIn();
    }
  };

  return (
    <AuthLayout
      showProgress={false}
      title="Welcome back"
      subtitle="Sign in to continue to your account"
    >
      <div className="space-y-6">
        {/* Social sign-in options */}
        <div className="space-y-3">
          <GoogleSignInButton mode="signin" />
          <AppleSignInButton mode="signin" />
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

        {/* General error message */}
        <AnimatePresence>
          {formErrors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl"
            >
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-destructive">{formErrors.general}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form fields */}
        <div className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formErrors.email || formErrors.general) {
                    setFormErrors({});
                  }
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                onKeyDown={handleKeyDown}
                placeholder="you@example.com"
                className={`pl-10 h-12 ${formErrors.email || emailError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                autoComplete="email"
              />
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

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-xs text-primary hover:underline underline-offset-4 font-medium"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formErrors.password || formErrors.general) {
                    setFormErrors({});
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter your password"
                className={`pl-10 pr-12 h-12 ${formErrors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {formErrors.password && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-destructive flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                {formErrors.password}
              </motion.p>
            )}
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-2 cursor-pointer group">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(value) => setRememberMe(Boolean(value))}
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Remember me for 30 days
            </span>
          </label>
        </div>

        {/* Sign in button */}
        <Button
          onClick={handleSignIn}
          disabled={isLoading}
          className="w-full h-12 text-base font-semibold"
          variant="hero"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>

        {/* Magic link option */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-4 text-muted-foreground">
              Or try passwordless
            </span>
          </div>
        </div>

        <MagicLinkButton mode="signin" />

        {/* Security notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-4 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Secure login</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Biometric ready</span>
          </div>
        </motion.div>

        {/* Sign up link */}
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/signup/step-1"
            className="font-semibold text-primary hover:underline underline-offset-4"
          >
            Create one
          </Link>
        </p>
      </div>

      {/* Forgot password dialog */}
      <ForgotPasswordDialog
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
      />
    </AuthLayout>
  );
};

export default SignIn;
