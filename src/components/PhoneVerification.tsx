import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Phone, RefreshCw, Shield, CheckCircle } from "lucide-react";

interface PhoneVerificationProps {
  userId?: string;
  email?: string;
  initialPhone?: string;
  onVerified: (phone: string) => void;
}

export const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  userId,
  email,
  initialPhone = "",
  onVerified,
}) => {
  const [phone, setPhone] = useState(initialPhone);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");

    // Format as Canadian phone number
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    // Reset verification if phone changes
    if (isVerified) {
      setIsVerified(false);
    }
  };

  const getDigitsOnly = (phoneNumber: string) => {
    return phoneNumber.replace(/\D/g, "");
  };

  const sendOTP = async () => {
    const digits = getDigitsOnly(phone);

    if (digits.length !== 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      if (!userId && !email) {
        throw new Error("Missing user identifier for phone verification.");
      }

      const { data, error } = await supabase.functions.invoke("send-phone-otp", {
        body: {
          phone: `+1${digits}`,
          userId,
          email,
        },
      });

      if (error) {
        throw new Error(data?.error || error.message || "Failed to send verification code");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.verificationId) {
        setVerificationId(data.verificationId);
      }

      toast({
        title: "Verification code sent",
        description: `We've sent a 6-digit code to ${phone}`,
      });
      setShowOTP(true);
      setCountdown(60);
    } catch (error: any) {
      console.error("Failed to send OTP:", error);
      toast({
        title: "Failed to send code",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) return;

    setIsVerifying(true);
    try {
      const digits = getDigitsOnly(phone);

      if (!userId && !email) {
        throw new Error("Missing user identifier for phone verification.");
      }

      const { data, error } = await supabase.functions.invoke("verify-phone-otp", {
        body: {
          phone: `+1${digits}`,
          code: otp,
          userId,
          email,
          verificationId,
        },
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || "Verification failed");
      }

      setIsVerified(true);
      toast({
        title: "Phone verified!",
        description: "Your phone number has been verified successfully.",
      });
      onVerified(`+1${digits}`);
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
      setTimeout(() => verifyOTP(), 100);
    }
  };

  if (isVerified) {
    return (
      <div className="space-y-3">
        <Label>Phone Number *</Label>
        <div className="flex items-center gap-3 p-4 border border-primary/30 bg-primary/5 rounded-lg">
          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">{phone}</p>
            <p className="text-sm text-muted-foreground">Phone verified successfully</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsVerified(false);
              setShowOTP(false);
              setOtp("");
            }}
          >
            Change
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label htmlFor="phone">Phone Number *</Label>
        <div className="flex gap-2">
          <div className="flex items-center px-3 bg-muted rounded-md border border-input">
            <span className="text-sm text-muted-foreground">+1</span>
          </div>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="(306) 555-0123"
            disabled={showOTP && countdown > 0}
            className="flex-1"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Canadian phone number required for identity verification
        </p>
      </div>

      {!showOTP ? (
        <Button
          type="button"
          onClick={sendOTP}
          disabled={isSending || getDigitsOnly(phone).length !== 10}
          className="w-full"
          variant="outline"
        >
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending code...
            </>
          ) : (
            <>
              <Phone className="h-4 w-4 mr-2" />
              Send Verification Code
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">Enter the 6-digit code sent to {phone}</p>
          </div>

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

          <Button
            type="button"
            onClick={verifyOTP}
            className="w-full"
            disabled={isVerifying || otp.length !== 6}
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify Phone
              </>
            )}
          </Button>

          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-muted-foreground">
                Resend code in <span className="font-medium text-primary">{countdown}s</span>
              </p>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const fromNumber = (import.meta as any).env?.VITE_TWILIO_FROM_NUMBER;
                  console.log("PhoneVerification resend clicked. From number:", fromNumber || "not set in VITE_TWILIO_FROM_NUMBER");
                  sendOTP();
                }}
                disabled={isSending}
              >
                {isSending ? (
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

          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>Code expires in 5 minutes. Never share this code with anyone.</span>
          </div>
        </div>
      )}
    </div>
  );
};
