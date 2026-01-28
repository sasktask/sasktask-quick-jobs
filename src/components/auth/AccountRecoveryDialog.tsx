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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Phone, User, HelpCircle, CheckCircle, ArrowLeft, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AccountRecoveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type RecoveryMethod = "email" | "phone" | "support";
type RecoveryStep = "select" | "verify" | "success";

export const AccountRecoveryDialog: React.FC<AccountRecoveryDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod>("email");
  const [step, setStep] = useState<RecoveryStep>("select");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Form states
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [lastKnownEmail, setLastKnownEmail] = useState("");
  const [accountDetails, setAccountDetails] = useState("");

  const handleReset = () => {
    setStep("select");
    setPhone("");
    setFullName("");
    setLastKnownEmail("");
    setAccountDetails("");
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const handleRecoverByPhone = async () => {
    if (!phone.trim()) {
      toast({
        title: "Phone required",
        description: "Please enter your registered phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Check if phone exists in profiles
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("phone", phone.trim())
        .maybeSingle();

      if (error) throw error;

      if (profile?.email) {
        // Send password reset to the associated email
        const maskedEmail = maskEmail(profile.email);
        
        await supabase.auth.resetPasswordForEmail(profile.email, {
          redirectTo: `${window.location.origin}/auth?mode=reset-password`,
        });

        toast({
          title: "Account found!",
          description: `We've sent a reset link to ${maskedEmail}`,
        });
        setStep("success");
      } else {
        toast({
          title: "Account not found",
          description: "No account is associated with this phone number. Please contact support.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Phone recovery error:", error);
      toast({
        title: "Recovery failed",
        description: "Unable to find your account. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSupport = async () => {
    if (!fullName.trim() || !accountDetails.trim()) {
      toast({
        title: "Information required",
        description: "Please provide your name and account details.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Log the support request (in a real app, this would create a support ticket)
      console.log("Support request:", {
        fullName,
        lastKnownEmail,
        accountDetails,
        requestedAt: new Date().toISOString(),
      });

      toast({
        title: "Support request submitted",
        description: "Our team will review your request and contact you within 24-48 hours.",
      });
      setStep("success");
    } catch (error: any) {
      console.error("Support request error:", error);
      toast({
        title: "Request failed",
        description: "Please try again or email support@sasktask.com directly.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const maskEmail = (email: string): string => {
    const [local, domain] = email.split("@");
    if (local.length <= 2) return `${local[0]}***@${domain}`;
    return `${local.substring(0, 2)}***${local.substring(local.length - 1)}@${domain}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Account Recovery
          </DialogTitle>
          <DialogDescription>
            Can't access your account? We'll help you recover it.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 pt-4"
            >
              <Tabs value={recoveryMethod} onValueChange={(v) => setRecoveryMethod(v as RecoveryMethod)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="email" className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span className="hidden sm:inline">Email</span>
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span className="hidden sm:inline">Phone</span>
                  </TabsTrigger>
                  <TabsTrigger value="support" className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Support</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="space-y-4 mt-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      Forgot your email?
                    </h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      If you remember your phone number, use the "Phone" tab to recover your account.
                      Otherwise, contact support with your account details.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setRecoveryMethod("phone")}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Recover using Phone
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setRecoveryMethod("support")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </TabsContent>

                <TabsContent value="phone" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="recovery-phone">Registered Phone Number</Label>
                    <Input
                      id="recovery-phone"
                      type="tel"
                      placeholder="+1 (306) 555-0123"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the phone number linked to your account
                    </p>
                  </div>
                  <Button
                    onClick={handleRecoverByPhone}
                    disabled={isLoading || !phone.trim()}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Find My Account
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="support" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="support-name">Full Name</Label>
                      <Input
                        id="support-name"
                        placeholder="Your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="support-email">Last Known Email (optional)</Label>
                      <Input
                        id="support-email"
                        type="email"
                        placeholder="Previous email if you remember"
                        value={lastKnownEmail}
                        onChange={(e) => setLastKnownEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="support-details">Account Details</Label>
                      <textarea
                        id="support-details"
                        className="flex min-h-[80px] w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2 text-sm placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        placeholder="Describe any details that could help identify your account (username, tasks completed, date joined, etc.)"
                        value={accountDetails}
                        onChange={(e) => setAccountDetails(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleContactSupport}
                    disabled={isLoading || !fullName.trim() || !accountDetails.trim()}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Submit Support Request
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 py-6"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">Request Submitted!</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {recoveryMethod === "phone"
                    ? "Check your email for the password reset link."
                    : "Our support team will review your request and contact you within 24-48 hours."}
                </p>
              </div>
              <div className="pt-2 flex gap-2">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleClose} className="flex-1">
                  Done
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
