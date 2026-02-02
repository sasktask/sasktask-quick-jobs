import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { markUserOffline } from "@/hooks/useOnlinePresence";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2, AlertTriangle, Mail, Shield, Trash2, RefreshCw } from "lucide-react";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    email: string;
  };
}

type Step = "confirm" | "otp" | "final";

export const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({
  open,
  onOpenChange,
  user,
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("confirm");
  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [confirmations, setConfirmations] = useState({
    understand: false,
    dataLoss: false,
    irreversible: false,
  });

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setStep("confirm");
      setOtp("");
      setVerificationId(null);
      setConfirmations({ understand: false, dataLoss: false, irreversible: false });
    }
  }, [open]);

  const allConfirmed = confirmations.understand && confirmations.dataLoss && confirmations.irreversible;

  const sendOTP = async () => {
    setSendingOTP(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-delete-account-otp", {
        body: {
          userId: user.id,
          email: user.email,
        },
      });

      if (error) {
        // Try to extract server error message
        let errorMessage = "Failed to send verification code";
        try {
          const context = (error as any)?.context;
          if (context?.body) {
            const parsed = typeof context.body === "string" ? JSON.parse(context.body) : context.body;
            if (parsed?.error) errorMessage = parsed.error;
          }
        } catch {
          // ignore parse errors
        }
        throw new Error(errorMessage);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.verificationId) {
        setVerificationId(data.verificationId);
      }

      toast.success("Verification code sent to your email");
      setStep("otp");
      setCountdown(60);
    } catch (error: any) {
      console.error("Failed to send OTP:", error);
      toast.error(error.message || "Failed to send verification code");
    } finally {
      setSendingOTP(false);
    }
  };

  const verifyAndDelete = async () => {
    if (otp.length !== 6 || !verificationId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-account", {
        body: {
          userId: user.id,
          verificationId,
          code: otp,
        },
      });

      if (error) {
        let errorMessage = "Failed to delete account";
        try {
          const context = (error as any)?.context;
          if (context?.body) {
            const parsed = typeof context.body === "string" ? JSON.parse(context.body) : context.body;
            if (parsed?.error) errorMessage = parsed.error;
          }
        } catch {
          // ignore
        }
        throw new Error(errorMessage);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Success - show final message and sign out
      toast.success(data?.message || "Your account has been deleted");
      onOpenChange(false);

      // Mark offline and sign out before redirect
      await markUserOffline(user.id);
      await supabase.auth.signOut();
      navigate("/");
    } catch (error: any) {
      console.error("Account deletion failed:", error);
      toast.error(error.message || "Failed to delete account");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPComplete = (value: string) => {
    setOtp(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            {step === "confirm" && "Please confirm you understand the consequences of deleting your account."}
            {step === "otp" && "Enter the verification code sent to your email."}
            {step === "final" && "Verifying and deleting your account..."}
          </DialogDescription>
        </DialogHeader>

        {step === "confirm" && (
          <div className="space-y-4">
            {/* Warning Banner */}
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-destructive">This action is permanent!</p>
                  <p className="text-sm text-muted-foreground">
                    Once deleted, your account and all associated data cannot be recovered.
                  </p>
                </div>
              </div>
            </div>

            {/* Confirmation Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="understand"
                  checked={confirmations.understand}
                  onCheckedChange={(checked) =>
                    setConfirmations((prev) => ({ ...prev, understand: checked === true }))
                  }
                />
                <label htmlFor="understand" className="text-sm leading-tight cursor-pointer">
                  I understand that my account will be permanently deleted
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="dataLoss"
                  checked={confirmations.dataLoss}
                  onCheckedChange={(checked) =>
                    setConfirmations((prev) => ({ ...prev, dataLoss: checked === true }))
                  }
                />
                <label htmlFor="dataLoss" className="text-sm leading-tight cursor-pointer">
                  I understand that all my tasks, bookings, reviews, and earnings history will be lost
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="irreversible"
                  checked={confirmations.irreversible}
                  onCheckedChange={(checked) =>
                    setConfirmations((prev) => ({ ...prev, irreversible: checked === true }))
                  }
                />
                <label htmlFor="irreversible" className="text-sm leading-tight cursor-pointer">
                  I understand this action is <strong>irreversible</strong> and cannot be undone
                </label>
              </div>
            </div>

            {/* Email Display */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Verification code will be sent to:</span>
              </div>
              <p className="font-medium ml-6">{user.email}</p>
            </div>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                We've sent a 6-digit verification code to <strong>{user.email}</strong>
              </p>
            </div>

            {/* OTP Input */}
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={handleOTPComplete}
                disabled={loading}
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

            {/* Resend Button */}
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
                  onClick={sendOTP}
                  disabled={sendingOTP}
                >
                  {sendingOTP ? (
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

            {/* Warning Reminder */}
            <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
              <p className="text-xs text-destructive text-center">
                ⚠️ Entering this code will permanently delete your account
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step === "confirm" && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={sendOTP}
                disabled={!allConfirmed || sendingOTP}
              >
                {sendingOTP ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Verification Code
                  </>
                )}
              </Button>
            </>
          )}

          {step === "otp" && (
            <>
              <Button variant="outline" onClick={() => setStep("confirm")}>
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={verifyAndDelete}
                disabled={otp.length !== 6 || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete My Account
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
