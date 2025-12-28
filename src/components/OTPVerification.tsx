import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, RefreshCw, ArrowLeft } from "lucide-react";

interface OTPVerificationProps {
  email: string;
  userId: string;
  onVerified: () => void;
  onBack: () => void;
}

export const OTPVerification = ({ email, userId, onVerified, onBack }: OTPVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Send OTP when component mounts
    sendOTP();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOTP = async () => {
    setIsResending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { email, userId },
      });

      if (error) throw error;

      toast({
        title: "Verification code sent",
        description: `A 6-digit code has been sent to ${email}`,
      });
      setCountdown(60); // 60 second cooldown before resend
    } catch (error: any) {
      console.error("Failed to send OTP:", error);
      toast({
        title: "Failed to send code",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const verifyOTP = async () => {
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { email, code: otp },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Verified!",
          description: "Login successful. Redirecting...",
        });
        onVerified();
      } else {
        throw new Error(data.error || "Verification failed");
      }
    } catch (error: any) {
      console.error("OTP verification failed:", error);
      toast({
        title: "Verification failed",
        description: error.message || "Invalid or expired code",
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
      setTimeout(() => {
        const verifyBtn = document.getElementById("verify-otp-btn");
        verifyBtn?.click();
      }, 100);
    }
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, "$1***$3");

  return (
    <Card className="shadow-2xl border-border glass">
      <CardHeader className="text-center">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit mb-2"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Button>
        <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to <strong>{maskedEmail}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={handleOTPComplete}
            disabled={isVerifying}
          >
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

        <Button
          id="verify-otp-btn"
          onClick={verifyOTP}
          disabled={otp.length !== 6 || isVerifying}
          className="w-full"
          variant="hero"
        >
          {isVerifying ? "Verifying..." : "Verify Code"}
        </Button>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Didn't receive the code?
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={sendOTP}
            disabled={isResending || countdown > 0}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isResending ? "animate-spin" : ""}`} />
            {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
          </Button>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Security tips:</strong>
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Code expires in 5 minutes</li>
            <li>• Never share your code with anyone</li>
            <li>• SaskTask will never ask for your code</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
