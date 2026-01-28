import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Power, 
  MapPin, 
  Clock, 
  Zap, 
  Navigation,
  Battery,
  BatteryCharging,
  Wifi,
  WifiOff,
  Signal
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface OnlineStatusBarProps {
  userId: string;
  className?: string;
}

export function OnlineStatusBar({ userId, className }: OnlineStatusBarProps) {
  const [isOnline, setIsOnline] = useState(false);
  const [onlineSince, setOnlineSince] = useState<Date | null>(null);
  const [duration, setDuration] = useState('0:00');
  const [hasLocation, setHasLocation] = useState(false);

  useEffect(() => {
    const loadStatus = async () => {
      const { data } = await (supabase as any)
        .from('doer_live_availability')
        .select('is_available, went_online_at, current_latitude')
        .eq('user_id', userId)
        .maybeSingle();

      if (data) {
        setIsOnline(data.is_available);
        if (data.went_online_at) {
          setOnlineSince(new Date(data.went_online_at));
        }
        setHasLocation(!!data.current_latitude);
      }
    };

    loadStatus();

    // Subscribe to changes
    const channel = supabase
      .channel(`status-bar-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'doer_live_availability',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          if (payload.new) {
            setIsOnline(payload.new.is_available);
            if (payload.new.went_online_at) {
              setOnlineSince(new Date(payload.new.went_online_at));
            } else {
              setOnlineSince(null);
            }
            setHasLocation(!!payload.new.current_latitude);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Update duration
  useEffect(() => {
    if (!isOnline || !onlineSince) {
      setDuration('0:00');
      return;
    }

    const updateDuration = () => {
      const seconds = Math.floor((Date.now() - onlineSince.getTime()) / 1000);
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      
      if (h > 0) {
        setDuration(`${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      } else {
        setDuration(`${m}:${s.toString().padStart(2, '0')}`);
      }
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);

    return () => clearInterval(interval);
  }, [isOnline, onlineSince]);

  if (!isOnline) return null;

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      className={cn(
        'fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg',
        className
      )}
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left - Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-white shadow-lg shadow-white/50"
              />
              <span className="font-medium text-sm">Online</span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-green-100">
              <Clock className="w-3 h-3" />
              <span className="text-xs font-mono">{duration}</span>
            </div>
          </div>

          {/* Center - Indicators */}
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex items-center gap-1 text-xs',
              hasLocation ? 'text-white' : 'text-green-200'
            )}>
              <Navigation className={cn('w-3 h-3', hasLocation && 'animate-pulse')} />
              <span className="hidden sm:inline">{hasLocation ? 'GPS Active' : 'No GPS'}</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-white">
              <Wifi className="w-3 h-3" />
              <span className="hidden sm:inline">Connected</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-white">
              <Zap className="w-3 h-3" />
              <span className="hidden sm:inline">Instant Requests</span>
            </div>
          </div>

          {/* Right - Duration on mobile */}
          <div className="sm:hidden flex items-center gap-1 text-green-100">
            <Clock className="w-3 h-3" />
            <span className="text-xs font-mono">{duration}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
