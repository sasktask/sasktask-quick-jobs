import { useState, useEffect, useCallback } from 'react';

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface UseUserLocationResult {
  location: UserLocation | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => void;
}

export function useUserLocation(): UseUserLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(() => {
    // Try to restore from localStorage
    const cached = localStorage.getItem('userLocation');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setLocation(newLocation);
        localStorage.setItem('userLocation', JSON.stringify(newLocation));
        setIsLoading(false);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // Cache for 5 minutes
      }
    );
  }, []);

  // Auto-request location on first load if not cached
  useEffect(() => {
    if (!location && !isLoading && !error) {
      // Check if we've already asked before
      const hasAsked = localStorage.getItem('locationPermissionAsked');
      if (!hasAsked) {
        localStorage.setItem('locationPermissionAsked', 'true');
      }
    }
  }, [location, isLoading, error]);

  return { location, isLoading, error, requestLocation };
}
