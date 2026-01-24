import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Navigation, 
  Clock, 
  MapPin, 
  Car, 
  PersonStanding, 
  Bike,
  X,
  ExternalLink,
  Route as RouteIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RouteInfo {
  distance: number; // in meters
  duration: number; // in seconds
  geometry?: GeoJSON.LineString;
}

interface MapRoutePanelProps {
  task: {
    id: string;
    title: string;
    location: string;
    latitude?: number;
    longitude?: number;
  } | null;
  userLocation: { latitude: number; longitude: number } | null;
  mapboxToken: string;
  onRouteCalculated?: (route: RouteInfo | null, mode: string) => void;
  onClose: () => void;
}

type TravelMode = 'driving' | 'walking' | 'cycling';

const travelModes: { mode: TravelMode; icon: React.ReactNode; label: string }[] = [
  { mode: 'driving', icon: <Car className="h-4 w-4" />, label: 'Drive' },
  { mode: 'walking', icon: <PersonStanding className="h-4 w-4" />, label: 'Walk' },
  { mode: 'cycling', icon: <Bike className="h-4 w-4" />, label: 'Bike' },
];

export function MapRoutePanel({ 
  task, 
  userLocation, 
  mapboxToken,
  onRouteCalculated,
  onClose 
}: MapRoutePanelProps) {
  const [selectedMode, setSelectedMode] = useState<TravelMode>('driving');
  const [routes, setRoutes] = useState<Record<TravelMode, RouteInfo | null>>({
    driving: null,
    walking: null,
    cycling: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task?.latitude && task?.longitude && userLocation && mapboxToken) {
      fetchAllRoutes();
    }
  }, [task, userLocation, mapboxToken]);

  const fetchRoute = async (mode: TravelMode): Promise<RouteInfo | null> => {
    if (!task?.latitude || !task?.longitude || !userLocation) return null;

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${mode}/${userLocation.longitude},${userLocation.latitude};${task.longitude},${task.latitude}?geometries=geojson&overview=full&access_token=${mapboxToken}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch route');
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        return {
          distance: data.routes[0].distance,
          duration: data.routes[0].duration,
          geometry: data.routes[0].geometry,
        };
      }
      return null;
    } catch (err) {
      console.error(`Error fetching ${mode} route:`, err);
      return null;
    }
  };

  const fetchAllRoutes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [driving, walking, cycling] = await Promise.all([
        fetchRoute('driving'),
        fetchRoute('walking'),
        fetchRoute('cycling'),
      ]);
      
      setRoutes({ driving, walking, cycling });
      
      // Notify parent of selected route
      if (driving) {
        onRouteCalculated?.(driving, 'driving');
      }
    } catch (err) {
      setError('Failed to calculate routes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (mode: TravelMode) => {
    setSelectedMode(mode);
    onRouteCalculated?.(routes[mode], mode);
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const openInGoogleMaps = () => {
    if (!task?.latitude || !task?.longitude) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${task.latitude},${task.longitude}&travelmode=${selectedMode}`;
    window.open(url, '_blank');
  };

  const currentRoute = routes[selectedMode];

  if (!task) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="absolute top-20 left-4 z-20 w-80"
      >
        <Card className="bg-background/95 backdrop-blur-sm shadow-xl border-border">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base flex items-center gap-2">
                  <RouteIcon className="h-4 w-4 text-primary" />
                  Directions
                </CardTitle>
                <p className="text-sm text-muted-foreground truncate mt-1">
                  To: {task.title}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Travel mode selector */}
            <div className="flex gap-2">
              {travelModes.map(({ mode, icon, label }) => (
                <Button
                  key={mode}
                  variant={selectedMode === mode ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => handleModeChange(mode)}
                  disabled={isLoading || !routes[mode]}
                >
                  {icon}
                  <span className="sr-only sm:not-sr-only">{label}</span>
                </Button>
              ))}
            </div>

            <Separator />

            {/* Route info */}
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : error ? (
              <p className="text-sm text-destructive text-center py-2">{error}</p>
            ) : !userLocation ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                Enable location to see directions
              </p>
            ) : currentRoute ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-lg font-bold">{formatDuration(currentRoute.duration)}</p>
                    <p className="text-xs text-muted-foreground">Travel time</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <Navigation className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-lg font-bold">{formatDistance(currentRoute.distance)}</p>
                    <p className="text-xs text-muted-foreground">Distance</p>
                  </div>
                </div>

                {/* All mode comparison */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">All options:</p>
                  {travelModes.map(({ mode, icon, label }) => {
                    const route = routes[mode];
                    if (!route) return null;
                    return (
                      <div 
                        key={mode}
                        className={`flex items-center justify-between text-sm p-2 rounded-md cursor-pointer transition-colors ${
                          selectedMode === mode ? 'bg-primary/10' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleModeChange(mode)}
                      >
                        <div className="flex items-center gap-2">
                          {icon}
                          <span>{label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {formatDuration(route.duration)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistance(route.distance)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                {/* Destination */}
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{task.location}</span>
                </div>

                <Button 
                  className="w-full gap-2" 
                  onClick={openInGoogleMaps}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in Google Maps
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                No route available
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
