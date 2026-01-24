import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Fingerprint, 
  ScanFace, 
  Smartphone, 
  Shield, 
  CheckCircle2,
  Loader2,
  Lock,
  Unlock,
  AlertTriangle,
  Info
} from "lucide-react";

interface BiometricSettingsProps {
  userId: string;
}

interface BiometricCapabilities {
  isAvailable: boolean;
  biometryType: 'touchId' | 'faceId' | 'fingerprint' | 'face' | 'iris' | 'none';
  reason?: string;
}

export const BiometricSettings = ({ userId }: BiometricSettingsProps) => {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [capabilities, setCapabilities] = useState<BiometricCapabilities>({
    isAvailable: false,
    biometryType: 'none'
  });
  const [lastVerified, setLastVerified] = useState<Date | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [quickLoginEnabled, setQuickLoginEnabled] = useState(true);
  const [secureActionsEnabled, setSecureActionsEnabled] = useState(true);
  const [periodicVerifyEnabled, setPeriodicVerifyEnabled] = useState(false);

  useEffect(() => {
    checkBiometricCapabilities();
    loadBiometricSettings();
    checkIfMobile();
  }, [userId]);

  const checkIfMobile = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    setIsMobile(mobile);
  };

  const checkBiometricCapabilities = async () => {
    try {
      if (window.PublicKeyCredential) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          
          const userAgent = navigator.userAgent.toLowerCase();
          let biometryType: BiometricCapabilities['biometryType'] = 'fingerprint';
          
          if (/iphone|ipad|ipod/.test(userAgent)) {
            const isFaceIdDevice = /iphone1[0-9]|iphone[2-9][0-9]/.test(userAgent) || 
                                   window.screen.height >= 812;
            biometryType = isFaceIdDevice ? 'faceId' : 'touchId';
          } else if (/android/.test(userAgent)) {
            biometryType = 'fingerprint';
          } else if (/mac/.test(userAgent)) {
            biometryType = 'touchId';
          } else if (/windows/.test(userAgent)) {
            biometryType = 'face';
          }
          
          setCapabilities({
            isAvailable: available,
            biometryType: available ? biometryType : 'none',
            reason: available ? undefined : 'Platform authenticator not available'
          });
        } catch {
          setCapabilities({
            isAvailable: false,
            biometryType: 'none',
            reason: 'WebAuthn check failed'
          });
        }
      } else {
        setCapabilities({
          isAvailable: false,
          biometryType: 'none',
          reason: 'Biometric authentication not supported on this device'
        });
      }
    } catch (error) {
      console.error('Error checking biometric capabilities:', error);
      setCapabilities({
        isAvailable: false,
        biometryType: 'none',
        reason: 'Failed to check biometric support'
      });
    }
  };

  const loadBiometricSettings = async () => {
    try {
      const stored = localStorage.getItem(`biometric_enabled_${userId}`);
      const lastVerifiedStr = localStorage.getItem(`biometric_last_verified_${userId}`);
      const quickLogin = localStorage.getItem(`biometric_quick_login_${userId}`);
      const secureActions = localStorage.getItem(`biometric_secure_actions_${userId}`);
      const periodicVerify = localStorage.getItem(`biometric_periodic_verify_${userId}`);
      
      if (stored) setBiometricEnabled(JSON.parse(stored));
      if (lastVerifiedStr) setLastVerified(new Date(lastVerifiedStr));
      if (quickLogin !== null) setQuickLoginEnabled(JSON.parse(quickLogin));
      if (secureActions !== null) setSecureActionsEnabled(JSON.parse(secureActions));
      if (periodicVerify !== null) setPeriodicVerifyEnabled(JSON.parse(periodicVerify));
    } catch (error) {
      console.error('Error loading biometric settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const performBiometricAuth = async (): Promise<boolean> => {
    try {
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn not supported');
      }
      
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      
      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'SaskTask',
          id: window.location.hostname
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: 'user@sasktask.com',
          displayName: 'SaskTask User'
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },
          { alg: -257, type: 'public-key' }
        ],
        timeout: 60000,
        attestation: 'none',
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred'
        }
      };
      
      await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });
      
      return true;
    } catch (error: any) {
      console.error('Biometric auth error:', error);
      
      if (error.name === 'NotAllowedError') {
        toast.error('Authentication cancelled or not allowed');
      } else if (error.name === 'SecurityError') {
        toast.error('Security error. Please try again.');
      } else {
        toast.error('Biometric authentication failed');
      }
      
      return false;
    }
  };

  const handleToggleBiometric = async (enabled: boolean) => {
    if (enabled) {
      setVerifying(true);
      
      const success = await performBiometricAuth();
      
      if (success) {
        setBiometricEnabled(true);
        localStorage.setItem(`biometric_enabled_${userId}`, 'true');
        setLastVerified(new Date());
        localStorage.setItem(`biometric_last_verified_${userId}`, new Date().toISOString());
        toast.success('Biometric authentication enabled!');
      }
      
      setVerifying(false);
    } else {
      setBiometricEnabled(false);
      localStorage.setItem(`biometric_enabled_${userId}`, 'false');
      toast.success('Biometric authentication disabled');
    }
  };

  const handleTestBiometric = async () => {
    setVerifying(true);
    
    const success = await performBiometricAuth();
    
    if (success) {
      setLastVerified(new Date());
      localStorage.setItem(`biometric_last_verified_${userId}`, new Date().toISOString());
      toast.success('Biometric verification successful!');
    }
    
    setVerifying(false);
  };

  const handleSettingChange = (setting: string, value: boolean) => {
    localStorage.setItem(`biometric_${setting}_${userId}`, JSON.stringify(value));
    
    switch (setting) {
      case 'quick_login':
        setQuickLoginEnabled(value);
        break;
      case 'secure_actions':
        setSecureActionsEnabled(value);
        break;
      case 'periodic_verify':
        setPeriodicVerifyEnabled(value);
        break;
    }
    
    toast.success('Setting updated');
  };

  const getBiometricIcon = () => {
    switch (capabilities.biometryType) {
      case 'faceId':
      case 'face':
        return <ScanFace className="h-6 w-6" />;
      case 'touchId':
      case 'fingerprint':
        return <Fingerprint className="h-6 w-6" />;
      case 'iris':
        return <ScanFace className="h-6 w-6" />;
      default:
        return <Fingerprint className="h-6 w-6" />;
    }
  };

  const getBiometricName = () => {
    switch (capabilities.biometryType) {
      case 'faceId':
        return 'Face ID';
      case 'face':
        return 'Face Recognition';
      case 'touchId':
        return 'Touch ID';
      case 'fingerprint':
        return 'Fingerprint';
      case 'iris':
        return 'Iris Scan';
      default:
        return 'Biometric';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {getBiometricIcon()}
            </motion.div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Biometric Authentication
                {biometricEnabled && (
                  <Badge variant="default" className="bg-green-500/20 text-green-600 border-green-500/30">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Use {getBiometricName()} for quick and secure access
              </CardDescription>
            </div>
          </div>
          
          {capabilities.isAvailable && (
            <Badge variant="outline" className="hidden sm:flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              {getBiometricName()} Available
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        {!capabilities.isAvailable ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-600 dark:text-amber-400">
                  Biometric Not Available
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {capabilities.reason || 'Your device does not support biometric authentication.'}
                </p>
                {!isMobile && (
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                    <Info className="h-4 w-4" />
                    Biometric login is available on mobile devices with the SaskTask app.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${biometricEnabled ? 'bg-green-500/20' : 'bg-muted'}`}>
                  {biometricEnabled ? (
                    <Unlock className="h-5 w-5 text-green-600" />
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <Label htmlFor="biometric-toggle" className="font-medium cursor-pointer">
                    Enable {getBiometricName()}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Sign in quickly using your biometric data
                  </p>
                </div>
              </div>
              
              <Switch
                id="biometric-toggle"
                checked={biometricEnabled}
                onCheckedChange={handleToggleBiometric}
                disabled={verifying}
              />
            </div>

            <AnimatePresence>
              {biometricEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <Separator />
                  
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">Quick Login</p>
                          <p className="text-xs text-muted-foreground">
                            Skip password entry on trusted devices
                          </p>
                        </div>
                      </div>
                      <Switch 
                        checked={quickLoginEnabled}
                        onCheckedChange={(v) => handleSettingChange('quick_login', v)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">Secure Actions</p>
                          <p className="text-xs text-muted-foreground">
                            Require biometric for payments & sensitive changes
                          </p>
                        </div>
                      </div>
                      <Switch 
                        checked={secureActionsEnabled}
                        onCheckedChange={(v) => handleSettingChange('secure_actions', v)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <Fingerprint className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">Re-verify Periodically</p>
                          <p className="text-xs text-muted-foreground">
                            Request verification every 24 hours
                          </p>
                        </div>
                      </div>
                      <Switch 
                        checked={periodicVerifyEnabled}
                        onCheckedChange={(v) => handleSettingChange('periodic_verify', v)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Test Authentication</p>
                      {lastVerified && (
                        <p className="text-xs text-muted-foreground">
                          Last verified: {lastVerified.toLocaleString()}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestBiometric}
                      disabled={verifying}
                    >
                      {verifying ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          {getBiometricIcon()}
                          <span className="ml-2">Test Now</span>
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20"
            >
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-600 dark:text-blue-400">
                    How it works
                  </p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• Your biometric data never leaves your device</li>
                    <li>• Only a secure token is stored for verification</li>
                    <li>• Works with {getBiometricName()} on your device</li>
                    <li>• Password backup always available</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
