import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Phone, 
  CheckCircle, 
  ArrowLeft, 
  Shield, 
  Mail,
  User,
  AlertTriangle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface ForgotEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToPassword?: () => void;
}

type Step = "phone" | "found" | "not-found";

export const ForgotEmailDialog: React.FC<ForgotEmailDialogProps> = ({
  open,
  onOpenChange,
  onSwitchToPassword,
}) => {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>("phone");
  const [foundEmail, setFoundEmail] = useState("");
  const [foundName, setFoundName] = useState("");
  const { toast } = useToast();

  const handleReset = () => {
    setPhone("");
    setStep("phone");
    setFoundEmail("");
    setFoundName("");
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    
    // Format as Canadian/US phone
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const getCleanPhone = (formatted: string) => {
    const digits = formatted.replace(/\D/g, "");
    return digits.length === 10 ? `+1${digits}` : `+${digits}`;
  };

  const maskEmail = (email: string): string => {
    const [local, domain] = email.split("@");
    if (!domain) return email;
    if (local.length <= 2) return `${local[0]}***@${domain}`;
    return `${local.substring(0, 2)}${"*".repeat(Math.min(local.length - 3, 5))}${local.substring(local.length - 1)}@${domain}`;
  };

  const handleFindAccount = async () => {
    const cleanPhone = getCleanPhone(phone);
    
    if (cleanPhone.length < 11) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Search by phone number
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("phone", cleanPhone)
        .maybeSingle();

      if (error) throw error;

      if (profile?.email) {
        setFoundEmail(profile.email);
        setFoundName(profile.full_name || "");
        setStep("found");
      } else {
        setStep("not-found");
      }
    } catch (error: any) {
      console.error("Find account error:", error);
      toast({
        title: "Search failed",
        description: "Unable to search for your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetLink = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(foundEmail, {
        redirectTo: `${window.location.origin}/auth?mode=reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Reset link sent!",
        description: `Check ${maskEmail(foundEmail)} for the password reset link.`,
      });
      handleClose();
    } catch (error: any) {
      console.error("Send reset error:", error);
      toast({
        title: "Failed to send reset link",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Find Your Account
          </DialogTitle>
          <DialogDescription>
            Enter your registered phone number to find your account email.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "phone" && (
            <motion.div
              key="phone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 pt-4"
            >
              <div className="space-y-2">
                <Label htmlFor="find-phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="find-phone"
                    type="tel"
                    placeholder="(306) 555-0123"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="pl-10"
                    autoComplete="tel"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the phone number linked to your SaskTask account
                </p>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Your phone number is used securely to locate your account. We'll show you a masked version of your email for privacy.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleFindAccount}
                  disabled={isLoading || phone.replace(/\D/g, "").length < 10}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    "Find Account"
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === "found" && (
            <motion.div
              key="found"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 py-4"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <p className="font-medium text-foreground">Account Found!</p>
              </div>

              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      {foundName && (
                        <p className="font-medium text-foreground">{foundName}</p>
                      )}
                      <p className="text-sm text-muted-foreground">{maskEmail(foundEmail)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2 pt-2">
                <Button onClick={handleSendResetLink} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Password Reset Link
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleReset} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Search Again
                </Button>
              </div>
            </motion.div>
          )}

          {step === "not-found" && (
            <motion.div
              key="not-found"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 py-4"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                </div>
                <p className="font-medium text-foreground">Account Not Found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  We couldn't find an account with that phone number.
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <p className="text-sm font-medium text-foreground">What you can do:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Try a different phone number</li>
                  <li>• Check if you registered with a different number</li>
                  <li>• Contact support for help</li>
                </ul>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={handleClose} className="flex-1">
                  Close
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
