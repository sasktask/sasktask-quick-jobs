import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  Timer, 
  Shield, 
  AlertTriangle,
  Lock,
  LogOut,
  Activity,
  Eye,
  RefreshCw,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface SessionTimeoutSettingsProps {
  userId: string;
}

interface TimeoutConfig {
  enabled: boolean;
  timeoutMinutes: number;
  warnBeforeMinutes: number;
  lockOnTimeout: boolean;
  extendOnActivity: boolean;
  logoutOnClose: boolean;
}

const TIMEOUT_PRESETS = [
  { label: "5 min", value: 5, description: "High security" },
  { label: "15 min", value: 15, description: "Recommended" },
  { label: "30 min", value: 30, description: "Standard" },
  { label: "1 hour", value: 60, description: "Relaxed" },
  { label: "4 hours", value: 240, description: "Extended" },
];

export const SessionTimeoutSettings = ({ userId }: SessionTimeoutSettingsProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<TimeoutConfig>({
    enabled: true,
    timeoutMinutes: 30,
    warnBeforeMinutes: 2,
    lockOnTimeout: true,
    extendOnActivity: true,
    logoutOnClose: false,
  });
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  // Load settings
  useEffect(() => {
    loadSettings();
  }, [userId]);

  // Activity tracking
  useEffect(() => {
    if (!config.enabled) return;

    const updateActivity = () => {
      setLastActivity(new Date());
      setShowWarning(false);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    
    if (config.extendOnActivity) {
      events.forEach(event => {
        window.addEventListener(event, updateActivity, { passive: true });
      });
    }

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, [config.enabled, config.extendOnActivity]);

  // Timeout countdown
  useEffect(() => {
    if (!config.enabled) {
      setTimeRemaining(null);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = (now.getTime() - lastActivity.getTime()) / 1000 / 60;
      const remaining = config.timeoutMinutes - elapsed;
      
      setTimeRemaining(Math.max(0, remaining));

      // Show warning
      if (remaining <= config.warnBeforeMinutes && remaining > 0) {
        setShowWarning(true);
      }

      // Auto logout
      if (remaining <= 0) {
        handleAutoLogout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [config.enabled, config.timeoutMinutes, config.warnBeforeMinutes, lastActivity]);

  // Logout on browser close
  useEffect(() => {
    if (!config.logoutOnClose) return;

    const handleBeforeUnload = () => {
      // Mark session for cleanup
      localStorage.setItem(`session_ended_${userId}`, 'true');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [config.logoutOnClose, userId]);

  // Check for pending logout on mount
  useEffect(() => {
    const sessionEnded = localStorage.getItem(`session_ended_${userId}`);
    if (sessionEnded === 'true') {
      localStorage.removeItem(`session_ended_${userId}`);
      handleAutoLogout();
    }
  }, [userId]);

  const loadSettings = async () => {
    try {
      const stored = localStorage.getItem(`session_timeout_config_${userId}`);
      if (stored) {
        setConfig(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading session settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newConfig: TimeoutConfig) => {
    setSaving(true);
    try {
      localStorage.setItem(`session_timeout_config_${userId}`, JSON.stringify(newConfig));
      setConfig(newConfig);
      toast.success('Session settings saved');
    } catch (error) {
      console.error('Error saving session settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAutoLogout = async () => {
    toast.info('Session expired due to inactivity');
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleExtendSession = useCallback(() => {
    setLastActivity(new Date());
    setShowWarning(false);
    toast.success('Session extended');
  }, []);

  const formatTimeRemaining = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return `${hours}h ${mins}m`;
    }
    if (minutes >= 1) {
      return `${Math.round(minutes)} min`;
    }
    return `${Math.round(minutes * 60)} sec`;
  };

  const getTimeoutColor = (minutes: number): string => {
    if (minutes <= config.warnBeforeMinutes) return "text-destructive";
    if (minutes <= config.timeoutMinutes * 0.25) return "text-amber-500";
    return "text-green-500";
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
    <>
      {/* Warning Dialog */}
      <AnimatePresence>
        {showWarning && config.enabled && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4"
          >
            <Card className="border-amber-500/50 bg-amber-500/10 backdrop-blur-lg shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-amber-500/20">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-amber-600 dark:text-amber-400">
                      Session Expiring Soon
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You'll be logged out in {timeRemaining !== null && formatTimeRemaining(timeRemaining)}
                    </p>
                  </div>
                  <Button size="sm" onClick={handleExtendSession}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Extend
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-500/5 via-orange-500/10 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Timer className="h-6 w-6 text-orange-500" />
              </motion.div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Session Timeout
                  {config.enabled && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                      Active
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Auto-logout after periods of inactivity
                </CardDescription>
              </div>
            </div>
            
            {config.enabled && timeRemaining !== null && (
              <div className="text-right hidden sm:block">
                <p className="text-xs text-muted-foreground">Time remaining</p>
                <p className={`font-mono font-bold ${getTimeoutColor(timeRemaining)}`}>
                  {formatTimeRemaining(timeRemaining)}
                </p>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          {/* Main Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${config.enabled ? 'bg-orange-500/20' : 'bg-muted'}`}>
                {config.enabled ? (
                  <Shield className="h-5 w-5 text-orange-500" />
                ) : (
                  <Clock className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <Label htmlFor="timeout-toggle" className="font-medium cursor-pointer">
                  Enable Session Timeout
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically log out after inactivity
                </p>
              </div>
            </div>
            
            <Switch
              id="timeout-toggle"
              checked={config.enabled}
              onCheckedChange={(enabled) => saveSettings({ ...config, enabled })}
              disabled={saving}
            />
          </div>

          <AnimatePresence>
            {config.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6"
              >
                <Separator />

                {/* Timeout Duration Presets */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Inactivity Timeout</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {TIMEOUT_PRESETS.map((preset) => (
                      <motion.button
                        key={preset.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => saveSettings({ ...config, timeoutMinutes: preset.value })}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          config.timeoutMinutes === preset.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-card hover:border-primary/50'
                        }`}
                      >
                        <p className="font-medium text-sm">{preset.label}</p>
                        <p className="text-xs text-muted-foreground">{preset.description}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Custom Duration Slider */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Custom Duration</Label>
                    <Badge variant="secondary">{formatTimeRemaining(config.timeoutMinutes)}</Badge>
                  </div>
                  <Slider
                    value={[config.timeoutMinutes]}
                    onValueChange={([value]) => saveSettings({ ...config, timeoutMinutes: value })}
                    min={1}
                    max={480}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 min</span>
                    <span>8 hours</span>
                  </div>
                </div>

                {/* Warning Time */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Warn Before Logout</Label>
                    <Badge variant="outline">{config.warnBeforeMinutes} min before</Badge>
                  </div>
                  <Slider
                    value={[config.warnBeforeMinutes]}
                    onValueChange={([value]) => saveSettings({ ...config, warnBeforeMinutes: value })}
                    min={1}
                    max={Math.min(10, config.timeoutMinutes - 1)}
                    step={1}
                    className="w-full"
                  />
                </div>

                <Separator />

                {/* Additional Options */}
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">Extend on Activity</p>
                        <p className="text-xs text-muted-foreground">
                          Reset timer when you interact with the app
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={config.extendOnActivity}
                      onCheckedChange={(v) => saveSettings({ ...config, extendOnActivity: v })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">Lock Screen on Timeout</p>
                        <p className="text-xs text-muted-foreground">
                          Show lock screen instead of full logout
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={config.lockOnTimeout}
                      onCheckedChange={(v) => saveSettings({ ...config, lockOnTimeout: v })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <LogOut className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">Logout on Browser Close</p>
                        <p className="text-xs text-muted-foreground">
                          End session when you close the browser
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={config.logoutOnClose}
                      onCheckedChange={(v) => saveSettings({ ...config, logoutOnClose: v })}
                    />
                  </div>
                </div>

                <Separator />

                {/* Session Status */}
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Eye className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Current Session</p>
                        <p className="text-xs text-muted-foreground">
                          Last activity: {lastActivity.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExtendSession}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refresh
                    </Button>
                  </div>
                  
                  {timeRemaining !== null && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Session expires in</span>
                        <span className={`font-medium ${getTimeoutColor(timeRemaining)}`}>
                          {formatTimeRemaining(timeRemaining)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className={`h-full ${
                            timeRemaining <= config.warnBeforeMinutes 
                              ? 'bg-destructive' 
                              : timeRemaining <= config.timeoutMinutes * 0.25 
                                ? 'bg-amber-500' 
                                : 'bg-green-500'
                          }`}
                          initial={{ width: '100%' }}
                          animate={{ 
                            width: `${(timeRemaining / config.timeoutMinutes) * 100}%` 
                          }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </>
  );
};
