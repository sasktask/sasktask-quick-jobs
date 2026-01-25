import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Power, Loader2, MapPin, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLiveLocation } from '@/hooks/useLiveLocation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GoOnlineButtonProps {
  userId: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  showLabel?: boolean;
  onStatusChange?: (isOnline: boolean) => void;
}

export function GoOnlineButton({
  userId,
  className,
  size = 'default',
  showLabel = true,
  onStatusChange
}: GoOnlineButtonProps) {
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState(0);

  const {
    location,
    isTracking,
    startTracking,
    stopTracking,
    requestPermission
  } = useLiveLocation({
    enableHighAccuracy: true,
    updateInterval: 15000,
    broadcastToServer: true
  });

  // Load initial status
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('doer_live_availability')
          .select('is_available')
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          setIsOnline(data.is_available);
          if (data.is_available) {
            startTracking();
          }
        }
      } catch (err) {
        console.error('Error loading status:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatus();

    // Subscribe to pending requests count
    const channel = supabase
      .channel(`pending-requests-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'instant_request_responses',
          filter: `doer_id=eq.${userId}`
        },
        async () => {
          const { count } = await (supabase as any)
            .from('instant_request_responses')
            .select('*', { count: 'exact', head: true })
            .eq('doer_id', userId)
            .eq('status', 'pending');
          setPendingRequests(count || 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, startTracking]);

  const toggleOnline = async () => {
    if (isOnline) {
      // Go offline
      setIsLoading(true);
      try {
        stopTracking();

        await (supabase as any)
          .from('doer_live_availability')
          .update({
            is_available: false,
            status: 'offline',
            last_ping: new Date().toISOString()
          })
          .eq('user_id', userId);

        await supabase
          .from('profiles')
          .update({ is_online: false, availability_status: 'offline' })
          .eq('id', userId);

        setIsOnline(false);
        onStatusChange?.(false);
        toast.info("You're now offline");
      } catch (err) {
        console.error('Error going offline:', err);
        toast.error('Failed to go offline');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Go online
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        toast.error('Location permission is required');
        return;
      }

      setIsLoading(true);
      try {
        startTracking();

        await (supabase as any)
          .from('doer_live_availability')
          .upsert({
            user_id: userId,
            is_available: true,
            status: 'available',
            went_online_at: new Date().toISOString(),
            last_ping: new Date().toISOString(),
            current_latitude: location?.latitude,
            current_longitude: location?.longitude
          }, { onConflict: 'user_id' });

        await supabase
          .from('profiles')
          .update({ is_online: true, availability_status: 'available' })
          .eq('id', userId);

        setIsOnline(true);
        onStatusChange?.(true);
        toast.success("You're now online!");
      } catch (err) {
        console.error('Error going online:', err);
        toast.error('Failed to go online');
        stopTracking();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    default: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    default: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative inline-flex">
            <Button
              onClick={toggleOnline}
              disabled={isLoading}
              className={cn(
                'relative transition-all',
                sizeClasses[size],
                isOnline
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/25'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
                className
              )}
            >
              {isLoading ? (
                <Loader2 className={cn('animate-spin', iconSizes[size])} />
              ) : (
                <>
                  <Power className={cn('mr-2', iconSizes[size])} />
                  {showLabel && (isOnline ? 'Online' : 'Go Online')}
                  {isOnline && isTracking && (
                    <MapPin className={cn('ml-2 animate-pulse', iconSizes[size])} />
                  )}
                </>
              )}

              {/* Pulse effect when online */}
              {isOnline && !isLoading && (
                <motion.span
                  className="absolute inset-0 rounded-md bg-green-400"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </Button>

            {/* Pending requests badge */}
            <AnimatePresence>
              {pendingRequests > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-2 -right-2"
                >
                  <Badge
                    variant="destructive"
                    className="h-5 w-5 p-0 flex items-center justify-center animate-bounce"
                  >
                    {pendingRequests}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isOnline ? 'Click to go offline' : 'Click to start receiving instant requests'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
