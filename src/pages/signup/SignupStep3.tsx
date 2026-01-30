import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getSignupDraft, saveSignupDraft } from "@/lib/signupDraft";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Lock, 
  Check, 
  X,
  Shield,
  AlertTriangle,
  Info
} from "lucide-react";
import { z } from "zod";

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

// Common weak passwords to check against
const WEAK_PASSWORDS = [
  "password", "123456", "12345678", "qwerty", "abc123", "password1",
  "password123", "admin", "letmein", "welcome", "monkey", "dragon"
];

const SignupStep3 = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState({ password: false, confirmPassword: false });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for weak password
  const isWeakPassword = useMemo(() => {
    return WEAK_PASSWORDS.includes(password.toLowerCase());
  }, [password]);

  // Password match validation
  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  // Validate password against schema
  const passwordValidation = useMemo(() => {
    if (!password) return null;
    const result = passwordSchema.safeParse(password);
    return result.success ? null : result.error.errors[0].message;
  }, [password]);

  useEffect(() => {
    const draft = getSignupDraft();
    if (!draft.role) {
      navigate("/signup/step-2");
      return;
    }
    setPassword(draft.password);
    setConfirmPassword(draft.confirmPassword);
  }, [navigate]);

  const handleContinue = () => {
    const errors: Record<string, string> = {};

    // Validate password
    const result = passwordSchema.safeParse(password);
    if (!result.success) {
      errors.password = result.error.errors[0].message;
    }

    // Check for weak password
    if (isWeakPassword) {
      errors.password = "This password is too common. Please choose a stronger password.";
    }

    // Check passwords match
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast({
        title: "Please fix the errors",
        description: "Make sure your password meets all requirements.",
        variant: "destructive",
      });
      return;
    }

    saveSignupDraft({ password, confirmPassword });
    navigate("/signup/step-4");
  };

  return (
    <AuthLayout
      step={3}
      totalSteps={4}
      title="Secure your account"
      subtitle="Create a strong password to protect your account"
    >
      <div className="space-y-6">
        {/* Security notice */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl"
        >
          <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-foreground mb-1">Your security matters</p>
            <p className="text-muted-foreground">
              We use industry-standard encryption to protect your data. Never share your password with anyone.
            </p>
          </div>
        </motion.div>

        {/* Password field */}
        <div className="space-y-3">
          <Label htmlFor="password" className="text-sm font-medium">
            Password <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (formErrors.password) {
                  setFormErrors((prev) => ({ ...prev, password: "" }));
                }
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              placeholder="Create a strong password"
              className={`pl-10 pr-12 h-12 ${formErrors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
              autoComplete="new-password"
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
          
          {/* Weak password warning */}
          <AnimatePresence>
            {isWeakPassword && password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
              >
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-xs text-destructive">
                  This is a commonly used password and can be easily guessed. Please choose something more unique.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {formErrors.password && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-destructive flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              {formErrors.password}
            </motion.p>
          )}

          {/* Password strength indicator */}
          {password && <PasswordStrengthIndicator password={password} showRequirements />}
        </div>

        {/* Confirm password field */}
        <div className="space-y-3">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm password <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (formErrors.confirmPassword) {
                  setFormErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
              placeholder="Re-enter your password"
              className={`pl-10 pr-12 h-12 ${formErrors.confirmPassword || (touched.confirmPassword && passwordsMatch === false) ? "border-destructive focus-visible:ring-destructive" : ""}`}
              autoComplete="new-password"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          
          {/* Password match indicator */}
          <AnimatePresence>
            {confirmPassword && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`text-xs flex items-center gap-1 ${passwordsMatch ? "text-green-600" : "text-destructive"}`}
              >
                {passwordsMatch ? (
                  <>
                    <Check className="w-3 h-3" />
                    Passwords match
                  </>
                ) : (
                  <>
                    <X className="w-3 h-3" />
                    Passwords do not match
                  </>
                )}
              </motion.p>
            )}
          </AnimatePresence>

          {formErrors.confirmPassword && !confirmPassword && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-destructive flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              {formErrors.confirmPassword}
            </motion.p>
          )}
        </div>

        {/* Security tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-muted/50 rounded-xl space-y-3"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Password tips</span>
          </div>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 mt-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
              Use a unique password you don't use elsewhere
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 mt-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
              Consider using a passphrase (e.g., "Purple-Tiger-Runs-Fast!")
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 mt-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
              Avoid personal information like birthdays or names
            </li>
          </ul>
        </motion.div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/signup/step-2")}
            className="h-12"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleContinue}
            className="flex-1 h-12 text-base font-semibold"
            variant="hero"
            disabled={!password || !confirmPassword || passwordsMatch === false}
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignupStep3;
