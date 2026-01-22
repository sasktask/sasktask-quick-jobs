import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Navigation,
  Signal,
  SignalLow,
  SignalMedium,
  SignalHigh,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { useLiveLocation } from '@/hooks/useLiveLocation';
import { cn } from '@/lib/utils';

interface LiveLocationTrackerProps {
  isActive: boolean;
  onLocationUpdate?: (location: { latitude: number; longitude: number }) => void;
  showCard?: boolean;
  className?: string;
}

export function LiveLocationTracker({
  isActive,
  onLocationUpdate,
  showCard = true,
  className
}: LiveLocationTrackerProps) {
  const [signalStrength, setSignalStrength] = useState<'low' | 'medium' | 'high'>('medium');
  const lastLocationRef = useRef<{ latitude: number; longitude: number } | null>(null);

  const {
    location,
    isTracking,
    error,
    startTracking,
    stopTracking
  } = useLiveLocation({
    enableHighAccuracy: true,
    updateInterval: 10000,
    broadcastToServer: true,
    onLocationUpdate: (loc) => {
      // Determine signal strength based on accuracy
      if (loc.accuracy < 20) {
        setSignalStrength('high');
      } else if (loc.accuracy < 50) {
        setSignalStrength('medium');
      } else {
        setSignalStrength('low');
      }

      // Only notify if location changed significantly (>10m)
      if (lastLocationRef.current) {
        const distance = Math.sqrt(
          Math.pow(loc.latitude - lastLocationRef.current.latitude, 2) +
          Math.pow(loc.longitude - lastLocationRef.current.longitude, 2)
        ) * 111000; // Rough conversion to meters

        if (distance > 10) {
          lastLocationRef.current = { latitude: loc.latitude, longitude: loc.longitude };
          onLocationUpdate?.({ latitude: loc.latitude, longitude: loc.longitude });
        }
      } else {
        lastLocationRef.current = { latitude: loc.latitude, longitude: loc.longitude };
        onLocationUpdate?.({ latitude: loc.latitude, longitude: loc.longitude });
      }
    }
  });

  // Start/stop tracking based on isActive prop
  useEffect(() => {
    if (isActive && !isTracking) {
      startTracking();
    } else if (!isActive && isTracking) {
      stopTracking();
    }
  }, [isActive, isTracking, startTracking, stopTracking]);

  // Get signal icon
  const SignalIcon = () => {
    switch (signalStrength) {
      case 'high':
        return <SignalHigh className="w-4 h-4 text-green-500" />;
      case 'medium':
        return <SignalMedium className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <SignalLow className="w-4 h-4 text-red-500" />;
      default:
        return <Signal className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!showCard) {
    // Invisible tracker - just runs in background
    return null;
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isTracking ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              >
                <Navigation className="w-5 h-5 text-primary" />
              </motion.div>
            ) : (
              <MapPin className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium">
                {isTracking ? 'Sharing Location' : 'Location Off'}
              </p>
              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}
              {location && !error && (
                <p className="text-xs text-muted-foreground">
                  Accuracy: ±{Math.round(location.accuracy)}m
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SignalIcon />
            <Badge 
              variant={isTracking ? 'default' : 'secondary'}
              className={cn(
                isTracking && 'bg-green-500 hover:bg-green-600'
              )}
            >
              {isTracking ? 'Live' : 'Off'}
            </Badge>
          </div>
        </div>

        {/* Speed indicator */}
        {location?.speed && location.speed > 0 && (
          <div className="mt-2 pt-2 border-t flex items-center gap-2 text-xs text-muted-foreground">
            <span>Speed: {Math.round(location.speed * 3.6)} km/h</span>
            {location.heading !== null && (
              <span>• Heading: {Math.round(location.heading)}°</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
