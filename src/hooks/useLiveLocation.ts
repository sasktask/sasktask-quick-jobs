import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LiveLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

interface UseLiveLocationOptions {
  enableHighAccuracy?: boolean;
  updateInterval?: number; // ms
  broadcastToServer?: boolean;
  onLocationUpdate?: (location: LiveLocation) => void;
}

interface UseLiveLocationResult {
  location: LiveLocation | null;
  isTracking: boolean;
  error: string | null;
  startTracking: () => void;
  stopTracking: () => void;
  requestPermission: () => Promise<boolean>;
}

export function useLiveLocation(options: UseLiveLocationOptions = {}): UseLiveLocationResult {
  const {
    enableHighAccuracy = true,
    updateInterval = 10000, // 10 seconds default
    broadcastToServer = true,
    onLocationUpdate
  } = options;

  const [location, setLocation] = useState<LiveLocation | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastBroadcastRef = useRef<number>(0);

  // Broadcast location to server
  const broadcastLocation = useCallback(async (loc: LiveLocation) => {
    if (!broadcastToServer) return;

    // Throttle broadcasts
    const now = Date.now();
    if (now - lastBroadcastRef.current < updateInterval) return;
    lastBroadcastRef.current = now;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use type assertion for new table (created via migration)
      const { error: upsertError } = await (supabase as any)
        .from('doer_live_availability')
        .upsert({
          user_id: user.id,
          current_latitude: loc.latitude,
          current_longitude: loc.longitude,
          location_accuracy: loc.accuracy,
          heading: loc.heading,
          speed: loc.speed,
          last_location_update: new Date().toISOString(),
          last_ping: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) {
        console.error('Error broadcasting location:', upsertError);
      }
    } catch (err) {
      console.error('Failed to broadcast location:', err);
    }
  }, [broadcastToServer, updateInterval]);

  // Handle position update
  const handlePositionUpdate = useCallback((position: GeolocationPosition) => {
    const newLocation: LiveLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp
    };

    setLocation(newLocation);
    setError(null);

    if (onLocationUpdate) {
      onLocationUpdate(newLocation);
    }

    broadcastLocation(newLocation);
  }, [onLocationUpdate, broadcastLocation]);

  // Handle position error
  const handlePositionError = useCallback((err: GeolocationPositionError) => {
    let errorMessage = 'Unable to get location';

    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = 'Location permission denied';
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = 'Location unavailable';
        break;
      case err.TIMEOUT:
        errorMessage = 'Location request timed out';
        break;
    }

    setError(errorMessage);
    console.error('Geolocation error:', errorMessage);
  }, []);

  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handlePositionUpdate(position);
          resolve(true);
        },
        (err) => {
          handlePositionError(err);
          resolve(false);
        },
        { enableHighAccuracy, timeout: 10000 }
      );
    });
  }, [enableHighAccuracy, handlePositionUpdate, handlePositionError]);

  // Start tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    if (isTracking) return;

    setIsTracking(true);
    setError(null);

    // Watch position continuously
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handlePositionError,
      {
        enableHighAccuracy,
        maximumAge: updateInterval,
        timeout: 30000
      }
    );

    // Also poll periodically for more consistent updates
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        handlePositionUpdate,
        handlePositionError,
        { enableHighAccuracy, timeout: 10000 }
      );
    }, updateInterval);

    console.log('Started location tracking');
  }, [isTracking, enableHighAccuracy, updateInterval, handlePositionUpdate, handlePositionError]);

  // Stop tracking
  const stopTracking = useCallback(async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsTracking(false);

    // Update server to show offline
    if (broadcastToServer) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await (supabase as any)
            .from('doer_live_availability')
            .update({
              is_available: false,
              status: 'offline',
              last_ping: new Date().toISOString()
            })
            .eq('user_id', user.id);
        }
      } catch (err) {
        console.error('Failed to update offline status:', err);
      }
    }

    console.log('Stopped location tracking');
  }, [broadcastToServer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isTracking) {
        // Reduce tracking frequency when page is hidden
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = setInterval(() => {
            navigator.geolocation.getCurrentPosition(
              handlePositionUpdate,
              () => { },
              { enableHighAccuracy: false, timeout: 10000 }
            );
          }, 60000); // Once per minute when hidden
        }
      } else if (document.visibilityState === 'visible' && isTracking) {
        // Resume normal frequency
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = setInterval(() => {
            navigator.geolocation.getCurrentPosition(
              handlePositionUpdate,
              handlePositionError,
              { enableHighAccuracy, timeout: 10000 }
            );
          }, updateInterval);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTracking, enableHighAccuracy, updateInterval, handlePositionUpdate, handlePositionError]);

  return {
    location,
    isTracking,
    error,
    startTracking,
    stopTracking,
    requestPermission
  };
}
