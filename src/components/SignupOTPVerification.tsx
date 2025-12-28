import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, ArrowLeft, RefreshCw, Shield, CheckCircle } from "lucide-react";

interface SignupOTPVerificationProps {
  email: string;
  signupData: {
    email: string;
    password: string;
    fullName: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    phone: string;
    role: string;
    wantsBothRoles: boolean;
  };
  onVerified: () => void;
  onBack: () => void;
}

export const SignupOTPVerification: React.FC<SignupOTPVerificationProps> = ({
  email,
  signupData,
  onVerified,
  onBack,
}) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const { toast } = useToast();

  // Send OTP on mount
  useEffect(() => {
    sendOTP();
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOTP = async () => {
    setIsResending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-signup-otp", {
        body: { email },
      });

      // Handle error response from edge function
      if (error) {
        // Try to get error message from response context
        const errorMessage = data?.error || error.message || "Failed to send verification code";
        throw new Error(errorMessage);
      }

      // Check if data contains an error (edge function returned error in body)
      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.verificationId) {
        setVerificationId(data.verificationId);
      }

      toast({
        title: "Verification code sent",
        description: `We've sent a 6-digit code to ${email}`,
      });
      setCountdown(60);
    } catch (error: any) {
      console.error("Failed to send OTP:", error);

      const errorMessage = error.message || "Please try again";

      // If email already registered, show specific message and go back
      if (errorMessage.toLowerCase().includes("already registered")) {
        toast({
          title: "Email already registered",
          description: "This email is already registered. Please sign in instead.",
          variant: "destructive",
        });
        onBack();
        return;
      }

      toast({
        title: "Failed to send code",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const verifyOTP = async () => {
    // if (otp.length !== 6) {
    //   toast({
    //     title: "Invalid code",
    //     description: "Please enter all 6 digits",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    setIsVerifying(true);
    try {
      // Verify the OTP
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-signup-otp", {
        body: {
          email,
          code: otp,
          verificationId,
        },
      });

      if (verifyError) throw verifyError;

      if (!verifyData?.success) {
        throw new Error(verifyData?.error || "Verification failed");
      }

      // OTP verified, now create the account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.fullName,
            first_name: signupData.firstName,
            middle_name: signupData.middleName,
            last_name: signupData.lastName,
            phone: signupData.phone,
            role: signupData.role,
            wants_both_roles: signupData.wantsBothRoles,
            email_verified: true,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) {
        if (signUpError.message?.toLowerCase().includes("already registered")) {
          throw new Error("This email is already registered. Please sign in instead.");
        }
        throw signUpError;
      }

      if (signUpData?.user) {
        toast({
          title: "Account created!",
          description: "Welcome to SaskTask. Signing you in...",
        });

        // Auto sign-in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: signupData.email,
          password: signupData.password,
        });

        if (signInError) {
          console.error("Auto sign-in failed:", signInError);
        }

        onVerified();
      }
    } catch (error: any) {
      console.error("Verification failed:", error);
      toast({
        title: "Verification failed",
        description: error.message || "Invalid or expired code. Please try again.",
        variant: "destructive",
      });
      setOtp("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOTPComplete = (value: string) => {
    setOtp(value);
    if (value.length === 6) {
      // Auto-verify when 6 digits entered
      setTimeout(() => verifyOTP(), 100);
    }
  };

  return (
    <Card className="shadow-2xl border-border">
      <CardHeader className="text-center">
        <Button variant="ghost" size="sm" className="w-fit mb-2" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a 6-digit verification code to
          <br />
          <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={otp} onChange={handleOTPComplete} disabled={isVerifying}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button onClick={verifyOTP} className="w-full" disabled={isVerifying || otp.length !== 6} variant="hero">
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Verify & Create Account
            </>
          )}
        </Button>

        <div className="text-center">
          {countdown > 0 ? (
            <p className="text-sm text-muted-foreground">
              Resend code in <span className="font-medium text-primary">{countdown}s</span>
            </p>
          ) : (
            <Button variant="ghost" size="sm" onClick={sendOTP} disabled={isResending}>
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend Code
                </>
              )}
            </Button>
          )}
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Security Tips</p>
              <ul className="space-y-1 text-xs">
                <li>• This code expires in 5 minutes</li>
                <li>• Never share this code with anyone</li>
                <li>• Check spam folder if you don't see the email</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
