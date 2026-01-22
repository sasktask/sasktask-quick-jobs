import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Power, 
  MapPin, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Navigation,
  BatteryMedium,
  Wifi
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLiveLocation } from '@/hooks/useLiveLocation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AvailabilityToggleProps {
  userId: string;
  className?: string;
  variant?: 'compact' | 'full';
  onStatusChange?: (isAvailable: boolean) => void;
}

export function AvailabilityToggle({ 
  userId, 
  className,
  variant = 'full',
  onStatusChange 
}: AvailabilityToggleProps) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [onlineDuration, setOnlineDuration] = useState(0);

  const { 
    location, 
    isTracking, 
    error: locationError, 
    startTracking, 
    stopTracking,
    requestPermission 
  } = useLiveLocation({
    enableHighAccuracy: true,
    updateInterval: 15000, // 15 seconds
    broadcastToServer: true
  });

  // Load initial availability status
  useEffect(() => {
    const loadStatus = async () => {
      try {
        // Use type assertion for new table
        const { data, error } = await (supabase as any)
          .from('doer_live_availability')
          .select('is_available, status, went_online_at')
          .eq('user_id', userId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setIsAvailable(data.is_available);
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

  // Update online duration counter
  useEffect(() => {
    if (!isAvailable) {
      setOnlineDuration(0);
      return;
    }

    const interval = setInterval(() => {
      setOnlineDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isAvailable]);

  // Format duration as HH:MM:SS
  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Go online
  const goOnline = useCallback(async () => {
    // First check location permission
    const hasPermission = await requestPermission();
    
    if (!hasPermission) {
      setShowPermissionDialog(true);
      return;
    }

    setIsLoading(true);
    
    try {
      // Start location tracking
      startTracking();

      // Update database - use type assertion
      const { error } = await (supabase as any)
        .from('doer_live_availability')
        .upsert({
          user_id: userId,
          is_available: true,
          status: 'available',
          went_online_at: new Date().toISOString(),
          last_ping: new Date().toISOString(),
          current_latitude: location?.latitude,
          current_longitude: location?.longitude
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Also update profiles table
      await supabase
        .from('profiles')
        .update({
          is_online: true,
          availability_status: 'available'
        })
        .eq('id', userId);

      setIsAvailable(true);
      onStatusChange?.(true);
      toast.success('You are now online and accepting requests!');
    } catch (err: any) {
      console.error('Error going online:', err);
      toast.error('Failed to go online');
      stopTracking();
    } finally {
      setIsLoading(false);
    }
  }, [userId, location, requestPermission, startTracking, stopTracking, onStatusChange]);

  // Go offline
  const goOffline = useCallback(async () => {
    setIsLoading(true);

    try {
      // Stop location tracking
      stopTracking();

      // Update database - use type assertion
      const { error } = await (supabase as any)
        .from('doer_live_availability')
        .update({
          is_available: false,
          status: 'offline',
          last_ping: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Also update profiles table
      await supabase
        .from('profiles')
        .update({
          is_online: false,
          availability_status: 'offline'
        })
        .eq('id', userId);

      setIsAvailable(false);
      onStatusChange?.(false);
      toast.info('You are now offline');
    } catch (err: any) {
      console.error('Error going offline:', err);
      toast.error('Failed to go offline');
    } finally {
      setIsLoading(false);
    }
  }, [userId, stopTracking, onStatusChange]);

  // Toggle availability
  const toggleAvailability = () => {
    if (isAvailable) {
      goOffline();
    } else {
      goOnline();
    }
  };

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Switch
          checked={isAvailable}
          onCheckedChange={toggleAvailability}
          disabled={isLoading}
          className={cn(
            isAvailable && 'data-[state=checked]:bg-green-500'
          )}
        />
        <span className={cn(
          'text-sm font-medium',
          isAvailable ? 'text-green-600' : 'text-muted-foreground'
        )}>
          {isLoading ? 'Loading...' : isAvailable ? 'Online' : 'Offline'}
        </span>
      </div>
    );
  }

  return (
    <>
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-4">
          {/* Main Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  scale: isAvailable ? [1, 1.1, 1] : 1,
                  opacity: isAvailable ? 1 : 0.5
                }}
                transition={{ repeat: isAvailable ? Infinity : 0, duration: 2 }}
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  isAvailable 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-400'
                )}
              >
                <Power className="w-6 h-6" />
              </motion.div>
              
              <div>
                <h3 className="font-semibold">
                  {isAvailable ? 'You\'re Online' : 'You\'re Offline'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isAvailable 
                    ? 'Accepting instant requests' 
                    : 'Go online to receive requests'}
                </p>
              </div>
            </div>

            <Switch
              checked={isAvailable}
              onCheckedChange={toggleAvailability}
              disabled={isLoading}
              className={cn(
                'scale-125',
                isAvailable && 'data-[state=checked]:bg-green-500'
              )}
            />
          </div>

          {/* Status indicators when online */}
          <AnimatePresence>
            {isAvailable && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                {/* Duration */}
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Online Duration</span>
                  </div>
                  <span className="font-mono font-semibold text-green-700">
                    {formatDuration(onlineDuration)}
                  </span>
                </div>

                {/* Location status */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {isTracking ? (
                      <Navigation className="w-4 h-4 text-blue-500 animate-pulse" />
                    ) : locationError ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">
                      {isTracking 
                        ? 'Location active' 
                        : locationError || 'Location inactive'}
                    </span>
                  </div>
                  {location && (
                    <Badge variant="outline" className="text-xs">
                      ±{Math.round(location.accuracy)}m
                    </Badge>
                  )}
                </div>

                {/* Connection status */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Wifi className="w-3 h-3" />
                    <span>Connected</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BatteryMedium className="w-3 h-3" />
                    <span>GPS Active</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Permission Dialog */}
      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Location Access Required
            </DialogTitle>
            <DialogDescription>
              To receive instant task requests, we need access to your location. 
              This helps us match you with nearby givers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Your privacy matters</p>
                <p className="text-xs text-muted-foreground">
                  Location is only shared when you're online and only with matched givers.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowPermissionDialog(false)}
                className="flex-1"
              >
                Not Now
              </Button>
              <Button 
                onClick={async () => {
                  setShowPermissionDialog(false);
                  const granted = await requestPermission();
                  if (granted) {
                    goOnline();
                  } else {
                    toast.error('Location permission denied. Please enable it in your browser settings.');
                  }
                }}
                className="flex-1"
              >
                Enable Location
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
