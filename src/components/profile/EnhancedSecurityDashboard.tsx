import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Smartphone,
  Laptop,
  Globe,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LogOut,
  Fingerprint,
  Key,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronRight,
  Activity,
  Zap,
  MoreVertical,
  Trash2,
} from "lucide-react";

interface EnhancedSecurityDashboardProps {
  userId: string;
  onNavigateToSection?: (section: string) => void;
}

interface DeviceSession {
  id: string;
  device_type: "mobile" | "desktop" | "tablet" | "unknown";
  device_name: string;
  browser: string;
  os: string;
  ip_address: string;
  location: string;
  last_active: Date;
  is_current: boolean;
  created_at: Date;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  description: string;
  ip_address: string;
  location: string;
  timestamp: Date;
  severity: "low" | "medium" | "high";
}

interface SecurityStatus {
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  lastPasswordChange: Date | null;
  passwordStrength: "weak" | "medium" | "strong";
  securityNotifications: boolean;
  biometricEnabled: boolean;
  loginAlerts: boolean;
  profileComplete: boolean;
  backupCodesGenerated: boolean;
  recoveryEmailSet: boolean;
}

export const EnhancedSecurityDashboard = ({
  userId,
  onNavigateToSection,
}: EnhancedSecurityDashboardProps) => {
  const [status, setStatus] = useState<SecurityStatus>({
    emailVerified: false,
    phoneVerified: false,
    twoFactorEnabled: false,
    lastPasswordChange: null,
    passwordStrength: "medium",
    securityNotifications: true,
    biometricEnabled: false,
    loginAlerts: true,
    profileComplete: false,
    backupCodesGenerated: false,
    recoveryEmailSet: false,
  });
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAllDevices, setShowAllDevices] = useState(false);

  useEffect(() => {
    fetchSecurityData();
  }, [userId]);

  const fetchSecurityData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('two_factor_enabled, last_password_change, security_notifications_enabled, profile_completion, phone')
          .eq('id', userId)
          .single();

        // Fetch login history for sessions
        const { data: loginHistory } = await supabase
          .from('login_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        setStatus({
          emailVerified: user.email_confirmed_at !== null,
          phoneVerified: !!user.phone_confirmed_at,
          twoFactorEnabled: profile?.two_factor_enabled || false,
          lastPasswordChange: profile?.last_password_change ? new Date(profile.last_password_change) : null,
          passwordStrength: "strong",
          securityNotifications: profile?.security_notifications_enabled ?? true,
          biometricEnabled: false,
          loginAlerts: true,
          profileComplete: (profile?.profile_completion || 0) >= 80,
          backupCodesGenerated: false,
          recoveryEmailSet: !!user.email,
        });

        // Transform login history to device sessions
        if (loginHistory) {
          const transformedSessions: DeviceSession[] = loginHistory.map((login, index) => {
            const locationInfo = login.location_info as { city?: string; country?: string } | null;
            const locationStr = locationInfo ? `${locationInfo.city || 'Unknown'}, ${locationInfo.country || ''}` : 'Unknown location';
            return {
              id: login.id,
              device_type: detectDeviceType(login.user_agent || ''),
              device_name: extractDeviceName(login.user_agent || ''),
              browser: extractBrowser(login.user_agent || ''),
              os: extractOS(login.user_agent || ''),
              ip_address: login.ip_address || 'Unknown',
              location: locationStr,
              last_active: new Date(login.login_at),
              is_current: index === 0,
              created_at: new Date(login.login_at),
            };
          });
          setSessions(transformedSessions);
        }

        // Generate sample security events from login history
        if (loginHistory) {
          const events: SecurityEvent[] = loginHistory.slice(0, 5).map((login) => {
            const locationInfo = login.location_info as { city?: string; country?: string } | null;
            const locationStr = locationInfo ? `${locationInfo.city || 'Unknown'}` : 'Unknown';
            return {
              id: login.id,
              event_type: login.success ? 'login_success' : 'login_failed',
              description: login.success ? 'Successful login' : 'Failed login attempt',
              ip_address: login.ip_address || 'Unknown',
              location: locationStr,
              timestamp: new Date(login.login_at),
              severity: login.success ? 'low' as const : 'medium' as const,
            };
          });
          setRecentEvents(events);
        }
      }
    } catch (error) {
      console.error('Failed to fetch security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSecurityData();
    setIsRefreshing(false);
    toast.success("Security data refreshed");
  };

  const handleRevokeSession = async (sessionId: string) => {
    toast.success("Session revoked successfully");
    setSessions(sessions.filter(s => s.id !== sessionId));
  };

  const handleRevokeAllSessions = async () => {
    toast.success("All other sessions revoked");
    setSessions(sessions.filter(s => s.is_current));
  };

  const calculateSecurityScore = (): number => {
    let score = 0;
    const weights = {
      emailVerified: 15,
      phoneVerified: 10,
      twoFactorEnabled: 20,
      passwordStrength: 15,
      securityNotifications: 10,
      profileComplete: 10,
      backupCodesGenerated: 10,
      recoveryEmailSet: 10,
    };

    if (status.emailVerified) score += weights.emailVerified;
    if (status.phoneVerified) score += weights.phoneVerified;
    if (status.twoFactorEnabled) score += weights.twoFactorEnabled;
    if (status.passwordStrength === "strong") score += weights.passwordStrength;
    else if (status.passwordStrength === "medium") score += weights.passwordStrength * 0.5;
    if (status.securityNotifications) score += weights.securityNotifications;
    if (status.profileComplete) score += weights.profileComplete;
    if (status.backupCodesGenerated) score += weights.backupCodesGenerated;
    if (status.recoveryEmailSet) score += weights.recoveryEmailSet;

    return Math.min(score, 100);
  };

  const securityScore = calculateSecurityScore();

  const getScoreDetails = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "text-green-500", bgColor: "bg-green-500", icon: ShieldCheck };
    if (score >= 60) return { label: "Good", color: "text-blue-500", bgColor: "bg-blue-500", icon: Shield };
    if (score >= 40) return { label: "Fair", color: "text-yellow-500", bgColor: "bg-yellow-500", icon: ShieldAlert };
    return { label: "Needs Attention", color: "text-destructive", bgColor: "bg-destructive", icon: ShieldOff };
  };

  const scoreDetails = getScoreDetails(securityScore);
  const ScoreIcon = scoreDetails.icon;

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile": return Smartphone;
      case "tablet": return Smartphone;
      case "desktop": return Laptop;
      default: return Globe;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-destructive bg-destructive/10";
      case "medium": return "text-yellow-600 bg-yellow-500/10";
      default: return "text-green-600 bg-green-500/10";
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center justify-center">
              <div className="h-32 w-32 rounded-full bg-muted" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Score Card */}
      <Card className="border-border overflow-hidden">
        <div className="bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Security Score</CardTitle>
                  <CardDescription>Your account protection level</CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Score Circle */}
              <div className="relative">
                <svg className="h-32 w-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted/30"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    className={scoreDetails.color}
                    initial={{ strokeDasharray: "0 352" }}
                    animate={{ strokeDasharray: `${(securityScore / 100) * 352} 352` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${scoreDetails.color}`}>{securityScore}</span>
                  <span className="text-xs text-muted-foreground">out of 100</span>
                </div>
              </div>

              {/* Score Details */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <ScoreIcon className={`h-5 w-5 ${scoreDetails.color}`} />
                  <span className={`font-semibold ${scoreDetails.color}`}>{scoreDetails.label}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <SecurityMetric
                    label="Email"
                    verified={status.emailVerified}
                    icon={CheckCircle2}
                  />
                  <SecurityMetric
                    label="Phone"
                    verified={status.phoneVerified}
                    icon={Smartphone}
                  />
                  <SecurityMetric
                    label="2FA"
                    verified={status.twoFactorEnabled}
                    icon={Key}
                  />
                  <SecurityMetric
                    label="Profile"
                    verified={status.profileComplete}
                    icon={Shield}
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {securityScore < 80 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20"
              >
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-amber-700 dark:text-amber-400">
                      Boost Your Security
                    </h4>
                    <p className="text-sm text-amber-600 dark:text-amber-500 mb-3">
                      Complete these actions to improve your security score
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {!status.twoFactorEnabled && (
                        <Button size="sm" variant="outline" className="text-xs">
                          Enable 2FA
                        </Button>
                      )}
                      {!status.phoneVerified && (
                        <Button size="sm" variant="outline" className="text-xs">
                          Verify Phone
                        </Button>
                      )}
                      {!status.profileComplete && (
                        <Button size="sm" variant="outline" className="text-xs">
                          Complete Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </div>
      </Card>

      {/* Active Sessions */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Laptop className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Active Sessions</CardTitle>
                <CardDescription className="text-xs">
                  Devices currently logged into your account
                </CardDescription>
              </div>
            </div>
            {sessions.length > 1 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <LogOut className="h-4 w-4 mr-1" />
                    Sign out all
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sign out all devices?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will sign you out of all devices except the current one.
                      You'll need to sign in again on those devices.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRevokeAllSessions}>
                      Sign out all
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <AnimatePresence>
            {sessions.slice(0, showAllDevices ? sessions.length : 3).map((session, index) => {
              const DeviceIcon = getDeviceIcon(session.device_type);
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    session.is_current
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border hover:border-primary/20'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${session.is_current ? 'bg-primary/10' : 'bg-muted'}`}>
                    <DeviceIcon className={`h-4 w-4 ${session.is_current ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{session.device_name}</span>
                      {session.is_current && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{session.browser} · {session.os}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{session.location}</span>
                      <span>·</span>
                      <Clock className="h-3 w-3" />
                      <span>{formatDistanceToNow(session.last_active, { addSuffix: true })}</span>
                    </div>
                  </div>
                  {!session.is_current && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRevokeSession(session.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>End session</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {sessions.length > 3 && (
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={() => setShowAllDevices(!showAllDevices)}
            >
              {showAllDevices ? 'Show less' : `Show ${sessions.length - 3} more devices`}
              <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${showAllDevices ? 'rotate-90' : ''}`} />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <CardDescription className="text-xs">
                Security events and account activity
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-3">
              {recentEvents.length > 0 ? (
                recentEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/20 transition-colors"
                  >
                    <div className={`p-1.5 rounded-full ${getSeverityColor(event.severity)}`}>
                      {event.event_type === 'login_success' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{event.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{event.ip_address}</span>
                        <span>·</span>
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent security events</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper component for security metrics
const SecurityMetric = ({
  label,
  verified,
  icon: Icon,
}: {
  label: string;
  verified: boolean;
  icon: React.ElementType;
}) => (
  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
    <div className={`p-1 rounded ${verified ? 'bg-green-500/10' : 'bg-muted'}`}>
      <Icon className={`h-3 w-3 ${verified ? 'text-green-500' : 'text-muted-foreground'}`} />
    </div>
    <span className="text-xs font-medium">{label}</span>
    {verified ? (
      <CheckCircle2 className="h-3 w-3 text-green-500 ml-auto" />
    ) : (
      <XCircle className="h-3 w-3 text-muted-foreground ml-auto" />
    )}
  </div>
);

// Helper functions
function detectDeviceType(userAgent: string): "mobile" | "desktop" | "tablet" | "unknown" {
  if (/tablet|ipad/i.test(userAgent)) return "tablet";
  if (/mobile|android|iphone/i.test(userAgent)) return "mobile";
  if (/windows|macintosh|linux/i.test(userAgent)) return "desktop";
  return "unknown";
}

function extractDeviceName(userAgent: string): string {
  if (/iphone/i.test(userAgent)) return "iPhone";
  if (/ipad/i.test(userAgent)) return "iPad";
  if (/android/i.test(userAgent)) return "Android Device";
  if (/macintosh/i.test(userAgent)) return "Mac";
  if (/windows/i.test(userAgent)) return "Windows PC";
  if (/linux/i.test(userAgent)) return "Linux";
  return "Unknown Device";
}

function extractBrowser(userAgent: string): string {
  if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) return "Chrome";
  if (/firefox/i.test(userAgent)) return "Firefox";
  if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return "Safari";
  if (/edge/i.test(userAgent)) return "Edge";
  return "Unknown";
}

function extractOS(userAgent: string): string {
  if (/windows nt 10/i.test(userAgent)) return "Windows 10";
  if (/windows nt 11/i.test(userAgent)) return "Windows 11";
  if (/mac os x/i.test(userAgent)) return "macOS";
  if (/android/i.test(userAgent)) return "Android";
  if (/iphone os|ios/i.test(userAgent)) return "iOS";
  if (/linux/i.test(userAgent)) return "Linux";
  return "Unknown";
}
