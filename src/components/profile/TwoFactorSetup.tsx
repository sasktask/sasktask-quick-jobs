import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  Smartphone,
  Key,
  Copy,
  Check,
  Download,
  RefreshCw,
  AlertTriangle,
  Loader2,
  QrCode,
  Lock,
  Unlock,
  Eye,
  EyeOff,
} from "lucide-react";

interface TwoFactorSetupProps {
  userId: string;
  onStatusChange?: (enabled: boolean) => void;
}

interface BackupCode {
  code: string;
  used: boolean;
}

export const TwoFactorSetup = ({ userId, onStatusChange }: TwoFactorSetupProps) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupStep, setSetupStep] = useState<"start" | "qr" | "verify" | "backup" | "complete">("start");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [backupCodes, setBackupCodes] = useState<BackupCode[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [disableCode, setDisableCode] = useState("");

  // Mock QR code data - in production, this would come from the server
  const qrCodeSecret = "JBSWY3DPEHPK3PXP";
  const qrCodeUrl = `otpauth://totp/SaskTask:user@example.com?secret=${qrCodeSecret}&issuer=SaskTask`;

  useEffect(() => {
    checkTwoFactorStatus();
  }, [userId]);

  const checkTwoFactorStatus = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('two_factor_enabled')
        .eq('id', userId)
        .single();

      if (profile) {
        setIsEnabled(profile.two_factor_enabled || false);
      }
    } catch (error) {
      console.error('Failed to check 2FA status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startSetup = () => {
    setIsSettingUp(true);
    setSetupStep("qr");
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setIsVerifying(true);
    
    // Simulate verification - in production, verify with server
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo, accept any 6-digit code
    if (verificationCode.length === 6) {
      // Generate backup codes
      const codes: BackupCode[] = Array.from({ length: 8 }, () => ({
        code: generateBackupCode(),
        used: false,
      }));
      setBackupCodes(codes);
      setSetupStep("backup");
    } else {
      toast.error("Invalid verification code");
    }
    
    setIsVerifying(false);
  };

  const completeSetup = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          two_factor_enabled: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      setIsEnabled(true);
      setSetupStep("complete");
      onStatusChange?.(true);
      toast.success("Two-factor authentication enabled!");
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
      toast.error("Failed to enable 2FA");
    }
  };

  const handleDisable = async () => {
    if (disableCode.length !== 6) {
      toast.error("Please enter your verification code");
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          two_factor_enabled: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      setIsEnabled(false);
      setShowDisableDialog(false);
      setDisableCode("");
      onStatusChange?.(false);
      toast.success("Two-factor authentication disabled");
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      toast.error("Failed to disable 2FA");
    }
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success("Code copied to clipboard");
  };

  const downloadBackupCodes = () => {
    const content = `SaskTask Backup Codes\n${"=".repeat(30)}\n\nKeep these codes safe. Each code can only be used once.\n\n${backupCodes.map((c, i) => `${i + 1}. ${c.code}`).join('\n')}\n\nGenerated: ${new Date().toLocaleDateString()}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sasktask-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup codes downloaded");
  };

  const resetSetup = () => {
    setIsSettingUp(false);
    setSetupStep("start");
    setVerificationCode("");
    setBackupCodes([]);
  };

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isEnabled ? 'bg-green-500/10' : 'bg-muted'}`}>
              {isEnabled ? (
                <ShieldCheck className="h-5 w-5 text-green-500" />
              ) : (
                <Shield className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
              <CardDescription className="text-xs">
                Add an extra layer of security to your account
              </CardDescription>
            </div>
          </div>
          <Badge variant={isEnabled ? "default" : "secondary"} className={isEnabled ? "bg-green-500" : ""}>
            {isEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {!isSettingUp ? (
            <motion.div
              key="status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {isEnabled ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-700 dark:text-green-400">
                          Your account is protected
                        </h4>
                        <p className="text-sm text-green-600 dark:text-green-500">
                          Two-factor authentication is active on your account
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowBackupCodes(true)}>
                      <Key className="h-4 w-4 mr-2" />
                      View Backup Codes
                    </Button>
                    <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <ShieldOff className="h-4 w-4 mr-2" />
                          Disable 2FA
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will make your account less secure. Enter your verification code to confirm.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                          <Label className="text-sm font-medium mb-2 block">Verification Code</Label>
                          <InputOTP
                            value={disableCode}
                            onChange={setDisableCode}
                            maxLength={6}
                          >
                            <InputOTPGroup>
                              {[0, 1, 2, 3, 4, 5].map((index) => (
                                <InputOTPSlot key={index} index={index} />
                              ))}
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDisable} className="bg-destructive text-destructive-foreground">
                            Disable 2FA
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-700 dark:text-amber-400">
                          Recommended Security Feature
                        </h4>
                        <p className="text-sm text-amber-600 dark:text-amber-500">
                          Enable 2FA to protect your account from unauthorized access
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                      <Smartphone className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h5 className="font-medium text-sm">Authenticator App</h5>
                        <p className="text-xs text-muted-foreground">
                          Use Google Authenticator, Authy, or any TOTP app
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                      <Key className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h5 className="font-medium text-sm">Backup Codes</h5>
                        <p className="text-xs text-muted-foreground">
                          Get 8 backup codes for account recovery
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" onClick={startSetup}>
                    <Shield className="h-4 w-4 mr-2" />
                    Enable Two-Factor Authentication
                  </Button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {setupStep === "qr" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="font-semibold mb-2">Scan QR Code</h3>
                    <p className="text-sm text-muted-foreground">
                      Scan this QR code with your authenticator app
                    </p>
                  </div>

                  {/* QR Code placeholder */}
                  <div className="flex justify-center">
                    <div className="w-48 h-48 bg-white p-4 rounded-lg border-2 border-border flex items-center justify-center">
                      <QrCode className="h-32 w-32 text-foreground" />
                    </div>
                  </div>

                  {/* Manual entry */}
                  <div className="space-y-2">
                    <p className="text-xs text-center text-muted-foreground">
                      Or enter this code manually:
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="px-3 py-2 bg-muted rounded font-mono text-sm">
                        {qrCodeSecret}
                      </code>
                      <Button variant="ghost" size="icon" onClick={() => copyCode(qrCodeSecret)}>
                        {copiedCode === qrCodeSecret ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={resetSetup}>
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={() => setSetupStep("verify")}>
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {setupStep === "verify" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="font-semibold mb-2">Verify Setup</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter the 6-digit code from your authenticator app
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <InputOTP
                      value={verificationCode}
                      onChange={setVerificationCode}
                      maxLength={6}
                    >
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setSetupStep("qr")}>
                      Back
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={handleVerify}
                      disabled={isVerifying || verificationCode.length !== 6}
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {setupStep === "backup" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="font-semibold mb-2">Save Backup Codes</h3>
                    <p className="text-sm text-muted-foreground">
                      Store these codes safely. You can use them if you lose access to your authenticator.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((backup, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded font-mono text-sm"
                      >
                        <span>{backup.code}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyCode(backup.code)}
                        >
                          {copiedCode === backup.code ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={downloadBackupCodes}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button className="flex-1" onClick={completeSetup}>
                      I've Saved My Codes
                    </Button>
                  </div>
                </div>
              )}

              {setupStep === "complete" && (
                <div className="space-y-6 text-center">
                  <div className="flex justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="p-4 rounded-full bg-green-500/10"
                    >
                      <ShieldCheck className="h-12 w-12 text-green-500" />
                    </motion.div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">2FA Enabled Successfully!</h3>
                    <p className="text-sm text-muted-foreground">
                      Your account is now protected with two-factor authentication
                    </p>
                  </div>

                  <Button onClick={resetSetup}>Done</Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Backup Codes Dialog */}
        <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Backup Codes</DialogTitle>
              <DialogDescription>
                Use these codes to sign in if you lose access to your authenticator app
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2 py-4">
              {backupCodes.length > 0 ? (
                backupCodes.map((backup, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded font-mono text-sm ${
                      backup.used ? 'bg-muted/50 line-through text-muted-foreground' : 'bg-muted'
                    }`}
                  >
                    <span>{backup.code}</span>
                    {!backup.used && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyCode(backup.code)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="col-span-2 text-center text-muted-foreground py-4">
                  No backup codes available. Generate new codes to use as backup.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBackupCodes(false)}>
                Close
              </Button>
              <Button onClick={downloadBackupCodes}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// Helper function to generate backup codes
function generateBackupCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
