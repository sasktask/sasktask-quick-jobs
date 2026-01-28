import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  Mail, 
  ArrowLeft, 
  RefreshCw, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Sparkles,
  Copy,
  Inbox
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedEmailVerificationProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
  onVerificationIdReceived?: (id: string) => void;
  verificationId?: string | null;
}

const RESEND_COOLDOWN = 60; // seconds
const MAX_ATTEMPTS = 5;
const CODE_LENGTH = 6;

export const EnhancedEmailVerification: React.FC<EnhancedEmailVerificationProps> = ({
  email,
  onVerified,
  onBack,
  onVerificationIdReceived,
  verificationId: initialVerificationId,
}) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [verificationId, setVerificationId] = useState<string | null>(initialVerificationId || null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasSentInitial, setHasSentInitial] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Send OTP on mount
  useEffect(() => {
    if (!hasSentInitial) {
      sendOTP();
      setHasSentInitial(true);
    }
  }, [hasSentInitial]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-paste detection from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const pastedData = e.clipboardData?.getData("text");
      if (pastedData) {
        const cleanedCode = pastedData.replace(/\D/g, "").slice(0, CODE_LENGTH);
        if (cleanedCode.length === CODE_LENGTH) {
          setOtp(cleanedCode);
          // Auto-verify after paste
          setTimeout(() => {
            handleVerify(cleanedCode);
          }, 300);
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [verificationId, email]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const sendOTP = async () => {
    if (isSending) return;
    
    setIsSending(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("send-signup-otp", {
        body: { email },
      });

      if (error) {
        const errorMessage = data?.error || error.message || "Failed to send verification code";
        throw new Error(errorMessage);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.verificationId) {
        setVerificationId(data.verificationId);
        onVerificationIdReceived?.(data.verificationId);
      }

      toast({
        title: "Code sent!",
        description: `Check your inbox at ${maskEmail(email)}`,
      });
      
      setCountdown(RESEND_COOLDOWN);
      setAttempts(0);
      setOtp("");
    } catch (error: any) {
      console.error("Failed to send OTP:", error);

      const errorMessage = error.message || "Please try again";

      if (errorMessage.toLowerCase().includes("already registered")) {
        toast({
          title: "Email already registered",
          description: "This email is already registered. Please sign in instead.",
          variant: "destructive",
        });
        onBack();
        return;
      }

      if (errorMessage.toLowerCase().includes("too many")) {
        setError("Too many requests. Please wait before trying again.");
      } else {
        setError(errorMessage);
      }

      toast({
        title: "Failed to send code",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = useCallback(async (code?: string) => {
    const codeToVerify = code || otp;
    
    if (codeToVerify.length !== CODE_LENGTH) {
      return;
    }

    if (attempts >= MAX_ATTEMPTS) {
      setError("Too many failed attempts. Please request a new code.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke("verify-signup-otp", {
        body: {
          email,
          code: codeToVerify,
          verificationId,
        },
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || "Verification failed");
      }

      setIsSuccess(true);
      
      toast({
        title: "Email verified!",
        description: "Your email has been successfully verified.",
      });

      // Small delay for success animation
      setTimeout(() => {
        onVerified();
      }, 800);
    } catch (error: any) {
      console.error("Verification failed:", error);
      
      setAttempts((prev) => prev + 1);
      const remainingAttempts = MAX_ATTEMPTS - attempts - 1;
      
      if (remainingAttempts <= 0) {
        setError("Too many failed attempts. Please request a new code.");
      } else {
        setError(`Invalid code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? "s" : ""} remaining.`);
      }
      
      setOtp("");
      
      toast({
        title: "Verification failed",
        description: "Invalid or expired code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  }, [otp, email, verificationId, attempts, onVerified, toast]);

  const handleOTPChange = (value: string) => {
    setOtp(value);
    setError(null);
    
    // Auto-verify when complete
    if (value.length === CODE_LENGTH) {
      setTimeout(() => {
        handleVerify(value);
      }, 100);
    }
  };

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split("@");
    if (localPart.length <= 2) return email;
    return `${localPart.slice(0, 2)}${"•".repeat(Math.min(localPart.length - 2, 5))}@${domain}`;
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${secs}s`;
  };

  return (
    <Card className="shadow-2xl border-border/60 bg-card/95 backdrop-blur-sm overflow-hidden">
      <CardHeader className="text-center pb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-fit mb-2 -ml-2" 
          onClick={onBack}
          disabled={isVerifying || isSuccess}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <motion.div 
          className="mx-auto mb-4 relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500",
            isSuccess 
              ? "bg-green-500/20" 
              : error 
                ? "bg-destructive/10" 
                : "bg-primary/10"
          )}>
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", duration: 0.5 }}
                >
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </motion.div>
              ) : (
                <motion.div
                  key="mail"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                >
                  <Mail className="h-8 w-8 text-primary" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Animated ring */}
          {isSending && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/30"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.div>

        <CardTitle className="text-2xl font-bold">
          {isSuccess ? "Verified!" : "Check Your Email"}
        </CardTitle>
        <CardDescription className="text-base">
          {isSuccess ? (
            "Your email has been verified"
          ) : (
            <>
              We sent a 6-digit code to
              <br />
              <span className="font-medium text-foreground">{maskEmail(email)}</span>
            </>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {!isSuccess && (
          <>
            {/* OTP Input */}
            <div className="flex justify-center">
              <InputOTP 
                maxLength={CODE_LENGTH} 
                value={otp} 
                onChange={handleOTPChange} 
                disabled={isVerifying || isSuccess}
                ref={inputRef}
              >
                <InputOTPGroup className="gap-2">
                  {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                    <InputOTPSlot 
                      key={i} 
                      index={i}
                      className={cn(
                        "w-12 h-14 text-xl font-semibold transition-all",
                        error && "border-destructive focus:ring-destructive",
                        otp[i] && !error && "border-primary/50"
                      )}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="flex items-center justify-center gap-2 text-sm text-destructive"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Verify Button */}
            <Button
              onClick={() => handleVerify()}
              disabled={otp.length !== CODE_LENGTH || isVerifying || attempts >= MAX_ATTEMPTS}
              className="w-full"
              variant="hero"
              size="lg"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify Email
                </>
              )}
            </Button>

            {/* Resend Section */}
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">Didn't receive the code?</p>
              
              {countdown > 0 ? (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Resend in <span className="font-medium text-primary">{formatCountdown(countdown)}</span></span>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={sendOTP}
                  disabled={isSending}
                  className="gap-2"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Resend Code
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Tips Section */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Security Tips</p>
                  <ul className="text-xs text-muted-foreground space-y-1.5">
                    <li className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Code expires in 5 minutes
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="h-3 w-3" />
                      Never share this code with anyone
                    </li>
                    <li className="flex items-center gap-2">
                      <Inbox className="h-3 w-3" />
                      Check spam folder if not received
                    </li>
                    <li className="flex items-center gap-2">
                      <Copy className="h-3 w-3" />
                      Paste code directly for auto-fill
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Success Animation */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5, times: [0, 0.6, 1] }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4"
              >
                <Sparkles className="h-10 w-10 text-green-500" />
              </motion.div>
              <p className="text-lg font-medium text-foreground">Email Verified!</p>
              <p className="text-sm text-muted-foreground mt-1">Redirecting you...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default EnhancedEmailVerification;
