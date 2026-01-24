import { useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  PersonStanding, 
  Bike,
  X,
  Clock,
  Navigation,
  Route as RouteIcon,
  ChevronRight,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TravelMode = 'driving' | 'walking' | 'cycling';

interface RouteInfo {
  distance: number;
  duration: number;
  geometry: GeoJSON.LineString;
}

interface MultiRouteLayerProps {
  map: mapboxgl.Map | null;
  mapboxToken: string;
  origin: { latitude: number; longitude: number } | null;
  destination: { latitude: number; longitude: number; name?: string; address?: string } | null;
  isOpen: boolean;
  onClose: () => void;
  onModeChange?: (mode: TravelMode) => void;
}

const ROUTE_COLORS: Record<TravelMode, { main: string; outline: string; glow: string }> = {
  driving: { main: '#3b82f6', outline: '#1d4ed8', glow: 'rgba(59, 130, 246, 0.4)' },
  walking: { main: '#22c55e', outline: '#15803d', glow: 'rgba(34, 197, 94, 0.4)' },
  cycling: { main: '#f97316', outline: '#c2410c', glow: 'rgba(249, 115, 22, 0.4)' },
};

const TRAVEL_MODES: { mode: TravelMode; icon: React.ReactNode; label: string }[] = [
  { mode: 'driving', icon: <Car className="h-5 w-5" />, label: 'Drive' },
  { mode: 'walking', icon: <PersonStanding className="h-5 w-5" />, label: 'Walk' },
  { mode: 'cycling', icon: <Bike className="h-5 w-5" />, label: 'Cycle' },
];

export function MultiRouteLayer({
  map,
  mapboxToken,
  origin,
  destination,
  isOpen,
  onClose,
  onModeChange,
}: MultiRouteLayerProps) {
  const [routes, setRoutes] = useState<Record<TravelMode, RouteInfo | null>>({
    driving: null,
    walking: null,
    cycling: null,
  });
  const [selectedMode, setSelectedMode] = useState<TravelMode>('driving');
  const [visibleModes, setVisibleModes] = useState<Set<TravelMode>>(new Set(['driving']));
  const [isLoading, setIsLoading] = useState(false);
  const [showAllRoutes, setShowAllRoutes] = useState(false);

  // Fetch route for a specific mode
  const fetchRoute = useCallback(async (mode: TravelMode): Promise<RouteInfo | null> => {
    if (!origin || !destination || !mapboxToken) return null;

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${mode}/` +
        `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}` +
        `?geometries=geojson&overview=full&access_token=${mapboxToken}`
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
  }, [origin, destination, mapboxToken]);

  // Fetch all routes when destination changes
  useEffect(() => {
    if (origin && destination && mapboxToken && isOpen) {
      setIsLoading(true);
      Promise.all([
        fetchRoute('driving'),
        fetchRoute('walking'),
        fetchRoute('cycling'),
      ]).then(([driving, walking, cycling]) => {
        setRoutes({ driving, walking, cycling });
        setIsLoading(false);
      });
    }
  }, [origin, destination, mapboxToken, isOpen, fetchRoute]);

  // Draw routes on map
  useEffect(() => {
    if (!map || !isOpen) return;

    // Clean up existing layers
    const cleanupLayers = () => {
      TRAVEL_MODES.forEach(({ mode }) => {
        ['glow', 'outline', 'main', 'dashed'].forEach(suffix => {
          const layerId = `route-${mode}-${suffix}`;
          if (map.getLayer(layerId)) map.removeLayer(layerId);
        });
        const sourceId = `route-${mode}`;
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      });
    };

    cleanupLayers();

    // Add route sources and layers
    const modesToShow = showAllRoutes ? new Set(TRAVEL_MODES.map(t => t.mode)) : visibleModes;

    TRAVEL_MODES.forEach(({ mode }) => {
      const route = routes[mode];
      if (!route?.geometry) return;

      const sourceId = `route-${mode}`;
      const isVisible = modesToShow.has(mode);
      const isSelected = mode === selectedMode;
      const colors = ROUTE_COLORS[mode];

      // Add source
      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: route.geometry,
        },
      });

      // Add glow effect layer (for selected route)
      if (isSelected && isVisible) {
        map.addLayer({
          id: `route-${mode}-glow`,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': colors.glow,
            'line-width': 18,
            'line-blur': 8,
          },
        });
      }

      // Add outline layer
      if (isVisible) {
        map.addLayer({
          id: `route-${mode}-outline`,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': colors.outline,
            'line-width': isSelected ? 10 : 6,
            'line-opacity': isSelected ? 1 : 0.5,
          },
        });

        // Add main line layer
        map.addLayer({
          id: `route-${mode}-main`,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': colors.main,
            'line-width': isSelected ? 6 : 4,
            'line-opacity': isSelected ? 1 : 0.6,
          },
        });

        // Add dashed animation for non-driving
        if (mode !== 'driving' && isSelected) {
          map.addLayer({
            id: `route-${mode}-dashed`,
            type: 'line',
            source: sourceId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#ffffff',
              'line-width': 2,
              'line-dasharray': mode === 'walking' ? [0.5, 2] : [2, 4],
              'line-opacity': 0.6,
            },
          });
        }
      }
    });

    // Fit map to selected route bounds
    const selectedRoute = routes[selectedMode];
    if (selectedRoute?.geometry?.coordinates?.length > 1) {
      const coordinates = selectedRoute.geometry.coordinates as [number, number][];
      const bounds = coordinates.reduce(
        (bounds, coord) => bounds.extend(coord as mapboxgl.LngLatLike),
        new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
      );
      map.fitBounds(bounds, { padding: 100, duration: 800 });
    }

    return () => {
      if (map) cleanupLayers();
    };
  }, [map, routes, selectedMode, visibleModes, showAllRoutes, isOpen]);

  // Clean up when closed
  useEffect(() => {
    if (!isOpen && map) {
      TRAVEL_MODES.forEach(({ mode }) => {
        ['glow', 'outline', 'main', 'dashed'].forEach(suffix => {
          const layerId = `route-${mode}-${suffix}`;
          if (map.getLayer(layerId)) map.removeLayer(layerId);
        });
        const sourceId = `route-${mode}`;
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      });
    }
  }, [isOpen, map]);

  const handleModeSelect = (mode: TravelMode) => {
    setSelectedMode(mode);
    setVisibleModes(new Set([mode]));
    onModeChange?.(mode);
  };

  const toggleModeVisibility = (mode: TravelMode) => {
    const newVisible = new Set(visibleModes);
    if (newVisible.has(mode)) {
      newVisible.delete(mode);
    } else {
      newVisible.add(mode);
    }
    setVisibleModes(newVisible);
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
    if (!destination || !origin) return;
    const modeMap: Record<TravelMode, string> = {
      driving: 'driving',
      walking: 'walking',
      cycling: 'bicycling',
    };
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&travelmode=${modeMap[selectedMode]}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  const selectedRoute = routes[selectedMode];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute top-20 left-4 z-20 w-80"
      >
        <Card className="bg-background/95 backdrop-blur-md shadow-2xl border-border overflow-hidden">
          <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <RouteIcon className="h-5 w-5 text-primary" />
                Route Options
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {destination && (
              <p className="text-sm text-muted-foreground truncate">
                To: {destination.name || destination.address}
              </p>
            )}
          </CardHeader>

          <CardContent className="p-3 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Travel mode cards */}
                <div className="space-y-2">
                  {TRAVEL_MODES.map(({ mode, icon, label }) => {
                    const route = routes[mode];
                    const isSelected = mode === selectedMode;
                    const isVisible = visibleModes.has(mode);
                    const colors = ROUTE_COLORS[mode];

                    return (
                      <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`relative rounded-lg border-2 transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-primary bg-primary/5 shadow-lg' 
                            : 'border-border hover:border-primary/50 hover:bg-muted/30'
                        }`}
                        onClick={() => handleModeSelect(mode)}
                      >
                        {/* Color indicator bar */}
                        <div 
                          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                          style={{ backgroundColor: colors.main }}
                        />

                        <div className="p-3 pl-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="h-10 w-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${colors.main}20`, color: colors.main }}
                            >
                              {icon}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{label}</p>
                              {route ? (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDuration(route.duration)}</span>
                                  <span>•</span>
                                  <Navigation className="h-3 w-3" />
                                  <span>{formatDistance(route.distance)}</span>
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">Not available</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isSelected && route && (
                              <Badge 
                                variant="secondary" 
                                className="text-[10px] px-2"
                                style={{ backgroundColor: `${colors.main}20`, color: colors.main }}
                              >
                                Selected
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleModeVisibility(mode);
                              }}
                            >
                              {isVisible ? (
                                <Eye className="h-4 w-4 text-primary" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Show all routes toggle */}
                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                  <span className="text-xs text-muted-foreground">Compare all routes</span>
                  <Button
                    variant={showAllRoutes ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => setShowAllRoutes(!showAllRoutes)}
                  >
                    {showAllRoutes ? 'Hide' : 'Show All'}
                  </Button>
                </div>

                {/* Route legend */}
                {showAllRoutes && (
                  <div className="flex items-center justify-center gap-4 py-2">
                    {TRAVEL_MODES.map(({ mode, label }) => (
                      <div key={mode} className="flex items-center gap-1.5">
                        <div 
                          className="h-2 w-6 rounded-full"
                          style={{ backgroundColor: ROUTE_COLORS[mode].main }}
                        />
                        <span className="text-[10px] text-muted-foreground">{label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Open in Google Maps */}
                <Button 
                  className="w-full gap-2 mt-2" 
                  onClick={openInGoogleMaps}
                  disabled={!selectedRoute}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in Google Maps
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
