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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  CheckCircle, 
  ArrowLeft, 
  HelpCircle,
  User,
  Mail,
  Phone,
  FileText,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface ContactSupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "form" | "success";

export const ContactSupportDialog: React.FC<ContactSupportDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [step, setStep] = useState<Step>("form");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Form state
  const [fullName, setFullName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [accountDetails, setAccountDetails] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleReset = () => {
    setStep("form");
    setFullName("");
    setContactEmail("");
    setContactPhone("");
    setAccountDetails("");
    setErrors({});
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!contactEmail.trim() && !contactPhone.trim()) {
      newErrors.contact = "Please provide at least an email or phone number";
    }

    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address";
    }

    if (!accountDetails.trim()) {
      newErrors.accountDetails = "Please provide account details";
    } else if (accountDetails.trim().length < 20) {
      newErrors.accountDetails = "Please provide more details (at least 20 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // In production, this would create a support ticket via edge function
      console.log("Support request submitted:", {
        fullName,
        contactEmail,
        contactPhone,
        accountDetails,
        timestamp: new Date().toISOString(),
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Request submitted",
        description: "Our support team will contact you within 24-48 hours.",
      });
      setStep("success");
    } catch (error: any) {
      console.error("Support submission error:", error);
      toast({
        title: "Submission failed",
        description: "Please try again or email support@sasktask.com directly.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Contact Support
          </DialogTitle>
          <DialogDescription>
            Can't access your account? Our support team is here to help.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 pt-4"
            >
              <div className="space-y-2">
                <Label htmlFor="support-name" className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  Full Name *
                </Label>
                <Input
                  id="support-name"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={errors.fullName ? "border-destructive" : ""}
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive">{errors.fullName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="support-email" className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    Contact Email
                  </Label>
                  <Input
                    id="support-email"
                    type="email"
                    placeholder="your@email.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className={errors.contactEmail ? "border-destructive" : ""}
                  />
                  {errors.contactEmail && (
                    <p className="text-xs text-destructive">{errors.contactEmail}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-phone" className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    Contact Phone
                  </Label>
                  <Input
                    id="support-phone"
                    type="tel"
                    placeholder="(306) 555-0123"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
              </div>
              {errors.contact && (
                <p className="text-xs text-destructive">{errors.contact}</p>
              )}

              <div className="space-y-2">
                <Label htmlFor="support-details" className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  Account Details *
                </Label>
                <Textarea
                  id="support-details"
                  placeholder="Please describe any details that could help identify your account:&#10;• Previous email or phone number&#10;• Username or display name&#10;• Approximate date you joined&#10;• Tasks you completed or posted"
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  className={`min-h-[120px] ${errors.accountDetails ? "border-destructive" : ""}`}
                />
                {errors.accountDetails && (
                  <p className="text-xs text-destructive">{errors.accountDetails}</p>
                )}
              </div>

              <Card className="border-muted bg-muted/30">
                <CardContent className="p-3 flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Our support team typically responds within 24-48 hours. For urgent issues, email us directly at{" "}
                    <a href="mailto:support@sasktask.com" className="text-primary hover:underline">
                      support@sasktask.com
                    </a>
                  </p>
                </CardContent>
              </Card>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </div>
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
                <p className="font-medium text-foreground text-lg">Request Submitted!</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Our support team will review your request and contact you at the provided email or phone within 24-48 hours.
                </p>
              </div>
              
              <Card className="border-muted bg-muted/30 text-left">
                <CardContent className="p-4 space-y-2">
                  <p className="text-xs font-medium text-foreground">What happens next:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>1. Our team will verify your identity</li>
                    <li>2. We'll locate your account using the details provided</li>
                    <li>3. You'll receive account recovery instructions</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="pt-2 flex gap-2">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  New Request
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
