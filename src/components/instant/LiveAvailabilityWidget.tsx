import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Power,
  MapPin,
  Clock,
  Zap,
  Settings,
  Navigation,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  XCircle,
  ChevronUp,
  Loader2,
  Battery,
  Wifi,
  Signal,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLiveLocation } from '@/hooks/useLiveLocation';
import { useInstantRequests } from '@/hooks/useInstantRequests';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LiveAvailabilityWidgetProps {
  userId: string;
  className?: string;
}

interface DailyStats {
  todayOnlineSeconds: number;
  todayTasksCompleted: number;
  todayEarnings: number;
}

export function LiveAvailabilityWidget({ userId, className }: LiveAvailabilityWidgetProps) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [onlineDuration, setOnlineDuration] = useState(0);
  const [maxDistance, setMaxDistance] = useState(25);
  const [acceptsInstant, setAcceptsInstant] = useState(true);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    todayOnlineSeconds: 0,
    todayTasksCompleted: 0,
    todayEarnings: 0
  });

  const {
    location,
    isTracking,
    error: locationError,
    startTracking,
    stopTracking,
    requestPermission
  } = useLiveLocation({
    enableHighAccuracy: true,
    updateInterval: 15000,
    broadcastToServer: true
  });

  const { incomingRequests } = useInstantRequests({
    userId,
    role: 'doer',
    autoSubscribe: isAvailable
  });

  // Load initial status
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('doer_live_availability')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setIsAvailable(data.is_available);
          setMaxDistance(data.max_distance_km || 25);
          setAcceptsInstant(data.accepts_instant_requests ?? true);
          setDailyStats({
            todayOnlineSeconds: data.today_online_seconds || 0,
            todayTasksCompleted: data.today_tasks_completed || 0,
            todayEarnings: 0
          });

          if (data.is_available && data.went_online_at) {
            const onlineTime = new Date(data.went_online_at).getTime();
            setOnlineDuration(Math.floor((Date.now() - onlineTime) / 1000));
          }
        }
      } catch (err) {
        console.error('Error loading availability:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatus();
  }, [userId]);

  // Update duration counter
  useEffect(() => {
    if (!isAvailable) return;

    const interval = setInterval(() => {
      setOnlineDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isAvailable]);

  // Format duration
  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${h}h ${m}m`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Go online
  const goOnline = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      toast.error('Location permission is required to go online');
      return;
    }

    setIsLoading(true);
    try {
      startTracking();

      const { error } = await (supabase as any)
        .from('doer_live_availability')
        .upsert({
          user_id: userId,
          is_available: true,
          status: 'available',
          went_online_at: new Date().toISOString(),
          last_ping: new Date().toISOString(),
          current_latitude: location?.latitude,
          current_longitude: location?.longitude,
          location_accuracy: location?.accuracy,
          max_distance_km: maxDistance,
          accepts_instant_requests: acceptsInstant
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      await supabase
        .from('profiles')
        .update({
          is_online: true,
          availability_status: 'available'
        })
        .eq('id', userId);

      setIsAvailable(true);
      setOnlineDuration(0);
      toast.success("You're now online!", {
        description: 'You will receive instant task requests'
      });
    } catch (err) {
      console.error('Error going online:', err);
      toast.error('Failed to go online');
      stopTracking();
    } finally {
      setIsLoading(false);
    }
  };

  // Go offline
  const goOffline = async () => {
    setIsLoading(true);
    try {
      stopTracking();

      const { error } = await (supabase as any)
        .from('doer_live_availability')
        .update({
          is_available: false,
          status: 'offline',
          last_ping: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      await supabase
        .from('profiles')
        .update({
          is_online: false,
          availability_status: 'offline'
        })
        .eq('id', userId);

      setIsAvailable(false);
      toast.info("You're now offline");
    } catch (err) {
      console.error('Error going offline:', err);
      toast.error('Failed to go offline');
    } finally {
      setIsLoading(false);
    }
  };

  // Update settings
  const updateSettings = async () => {
    try {
      const { error } = await (supabase as any)
        .from('doer_live_availability')
        .update({
          max_distance_km: maxDistance,
          accepts_instant_requests: acceptsInstant
        })
        .eq('user_id', userId);

      if (error) throw error;
      toast.success('Settings updated');
      setShowSettings(false);
    } catch (err) {
      console.error('Error updating settings:', err);
      toast.error('Failed to update settings');
    }
  };

  if (isLoading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-4 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      layout
      className={cn('fixed bottom-20 left-4 right-4 z-40 lg:bottom-6 lg:left-auto lg:right-6 lg:w-80', className)}
    >
      <Card className={cn(
        'overflow-hidden shadow-xl border-2 transition-all',
        isAvailable 
          ? 'border-green-500/50 bg-gradient-to-br from-background to-green-500/5' 
          : 'border-border'
      )}>
        <CardContent className="p-0">
          {/* Main Toggle Bar */}
          <motion.div
            className="p-4 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Animated Power Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    isAvailable ? goOffline() : goOnline();
                  }}
                  disabled={isLoading}
                  className={cn(
                    'relative w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg',
                    isAvailable
                      ? 'bg-gradient-to-br from-green-400 to-green-600 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Power className="w-6 h-6" />
                  )}
                  
                  {/* Pulse animation when online */}
                  {isAvailable && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-green-400"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">
                      {isAvailable ? "You're Online" : "You're Offline"}
                    </span>
                    {incomingRequests.length > 0 && (
                      <Badge variant="destructive" className="animate-pulse">
                        {incomingRequests.length}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isAvailable 
                      ? `Online for ${formatDuration(onlineDuration)}`
                      : 'Tap to go online'
                    }
                  </p>
                </div>
              </div>

              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </div>
          </motion.div>

          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-4">
                  {/* Status Indicators */}
                  {isAvailable && (
                    <div className="grid grid-cols-3 gap-2">
                      {/* Location */}
                      <div className={cn(
                        'p-2 rounded-lg text-center',
                        isTracking ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'
                      )}>
                        <Navigation className={cn(
                          'w-4 h-4 mx-auto mb-1',
                          isTracking ? 'text-green-600 animate-pulse' : 'text-muted-foreground'
                        )} />
                        <span className="text-xs font-medium">
                          {isTracking ? 'GPS On' : 'GPS Off'}
                        </span>
                      </div>

                      {/* Connection */}
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-center">
                        <Wifi className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                        <span className="text-xs font-medium">Connected</span>
                      </div>

                      {/* Requests */}
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-center">
                        <Zap className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                        <span className="text-xs font-medium">
                          {acceptsInstant ? 'Instant On' : 'Instant Off'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Today's Stats */}
                  <div className="p-3 rounded-lg bg-muted/50">
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      Today's Activity
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <p className="text-lg font-bold">
                          {formatDuration(dailyStats.todayOnlineSeconds + onlineDuration)}
                        </p>
                        <p className="text-xs text-muted-foreground">Online</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{dailyStats.todayTasksCompleted}</p>
                        <p className="text-xs text-muted-foreground">Tasks</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">${dailyStats.todayEarnings}</p>
                        <p className="text-xs text-muted-foreground">Earned</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Settings */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Max Distance: {maxDistance}km</span>
                    </div>
                    <Sheet open={showSettings} onOpenChange={setShowSettings}>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Availability Settings</SheetTitle>
                          <SheetDescription>
                            Configure how you receive instant requests
                          </SheetDescription>
                        </SheetHeader>

                        <div className="space-y-6 py-6">
                          {/* Max Distance */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium">
                                Maximum Distance
                              </label>
                              <span className="text-sm text-muted-foreground">
                                {maxDistance} km
                              </span>
                            </div>
                            <Slider
                              value={[maxDistance]}
                              onValueChange={([value]) => setMaxDistance(value)}
                              min={5}
                              max={50}
                              step={5}
                            />
                            <p className="text-xs text-muted-foreground">
                              You'll only receive requests within this distance
                            </p>
                          </div>

                          {/* Accept Instant Requests */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Accept Instant Requests</p>
                              <p className="text-xs text-muted-foreground">
                                Receive real-time task notifications
                              </p>
                            </div>
                            <Switch
                              checked={acceptsInstant}
                              onCheckedChange={setAcceptsInstant}
                            />
                          </div>

                          <Button onClick={updateSettings} className="w-full">
                            Save Settings
                          </Button>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>

                  {/* Location Accuracy */}
                  {location && isAvailable && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Signal className="w-3 h-3" />
                      <span>Location accuracy: ±{Math.round(location.accuracy)}m</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
