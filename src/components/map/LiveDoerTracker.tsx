import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Navigation, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Zap,
  Eye,
  EyeOff,
  Route,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import mapboxgl from 'mapbox-gl';

interface DoerLocation {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  timestamp: Date;
}

interface Doer {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  rating: number;
}

interface LiveDoerTrackerProps {
  map: mapboxgl.Map | null;
  doer: Doer;
  taskLocation: { latitude: number; longitude: number };
  bookingId: string;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
  onCall?: () => void;
  onMessage?: () => void;
}

export function LiveDoerTracker({
  map,
  doer,
  taskLocation,
  bookingId,
  isVisible = true,
  onToggleVisibility,
  onCall,
  onMessage,
}: LiveDoerTrackerProps) {
  const [doerLocation, setDoerLocation] = useState<DoerLocation | null>(null);
  const [eta, setEta] = useState<{ minutes: number; distance: number } | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<DoerLocation[]>([]);
  const [isTracking, setIsTracking] = useState(true);
  const doerMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const pulseMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Simulate doer location updates (in real app, this would be from Supabase realtime)
  useEffect(() => {
    if (!isTracking) return;

    // Simulate initial position closer to task
    const initialLat = taskLocation.latitude + (Math.random() - 0.5) * 0.02;
    const initialLng = taskLocation.longitude + (Math.random() - 0.5) * 0.02;
    
    setDoerLocation({
      latitude: initialLat,
      longitude: initialLng,
      heading: Math.random() * 360,
      speed: 30 + Math.random() * 20,
      accuracy: 5 + Math.random() * 10,
      timestamp: new Date(),
    });

    // Simulate movement towards task
    const interval = setInterval(() => {
      setDoerLocation((prev) => {
        if (!prev) return prev;

        const moveTowardsTask = 0.001;
        const latDiff = taskLocation.latitude - prev.latitude;
        const lngDiff = taskLocation.longitude - prev.longitude;
        const distance = Math.sqrt(latDiff ** 2 + lngDiff ** 2);

        if (distance < 0.001) return prev; // Arrived

        const newLat = prev.latitude + (latDiff / distance) * moveTowardsTask;
        const newLng = prev.longitude + (lngDiff / distance) * moveTowardsTask;

        const newLocation = {
          latitude: newLat,
          longitude: newLng,
          heading: Math.atan2(lngDiff, latDiff) * (180 / Math.PI),
          speed: 25 + Math.random() * 15,
          accuracy: 5 + Math.random() * 5,
          timestamp: new Date(),
        };

        // Add to breadcrumbs
        setBreadcrumbs((crumbs) => [...crumbs.slice(-50), prev]);

        return newLocation;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isTracking, taskLocation]);

  // Calculate ETA
  useEffect(() => {
    if (!doerLocation) return;

    const latDiff = taskLocation.latitude - doerLocation.latitude;
    const lngDiff = taskLocation.longitude - doerLocation.longitude;
    const distanceKm = Math.sqrt(latDiff ** 2 + lngDiff ** 2) * 111; // Rough km conversion
    const speedKmh = doerLocation.speed || 30;
    const etaMinutes = Math.round((distanceKm / speedKmh) * 60);

    setEta({
      minutes: Math.max(1, etaMinutes),
      distance: distanceKm,
    });
  }, [doerLocation, taskLocation]);

  // Update doer marker on map
  useEffect(() => {
    if (!map || !doerLocation || !isVisible) {
      doerMarkerRef.current?.remove();
      pulseMarkerRef.current?.remove();
      return;
    }

    // Create custom doer marker element
    const markerEl = document.createElement('div');
    markerEl.className = 'doer-marker';
    markerEl.innerHTML = `
      <div class="relative">
        <div class="w-12 h-12 rounded-full bg-primary border-4 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm overflow-hidden">
          ${doer.avatar ? `<img src="${doer.avatar}" class="w-full h-full object-cover" />` : doer.name.charAt(0)}
        </div>
        <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-primary"></div>
        ${doerLocation.heading !== undefined ? `
          <div class="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-md" style="transform: rotate(${doerLocation.heading}deg)">
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2l6 14H4l6-14z"/>
            </svg>
          </div>
        ` : ''}
      </div>
    `;

    // Create pulse effect element
    const pulseEl = document.createElement('div');
    pulseEl.className = 'doer-pulse';
    pulseEl.innerHTML = `
      <div class="absolute w-20 h-20 rounded-full bg-primary/30 animate-ping"></div>
      <div class="absolute w-16 h-16 rounded-full bg-primary/20"></div>
    `;
    pulseEl.style.cssText = 'display: flex; align-items: center; justify-content: center;';

    // Remove old markers
    doerMarkerRef.current?.remove();
    pulseMarkerRef.current?.remove();

    // Add pulse marker (behind doer marker)
    pulseMarkerRef.current = new mapboxgl.Marker({ element: pulseEl })
      .setLngLat([doerLocation.longitude, doerLocation.latitude])
      .addTo(map);

    // Add doer marker
    doerMarkerRef.current = new mapboxgl.Marker({ element: markerEl })
      .setLngLat([doerLocation.longitude, doerLocation.latitude])
      .addTo(map);

    return () => {
      doerMarkerRef.current?.remove();
      pulseMarkerRef.current?.remove();
    };
  }, [map, doerLocation, isVisible, doer]);

  // Draw breadcrumb trail
  useEffect(() => {
    if (!map || breadcrumbs.length < 2 || !isVisible) return;

    const sourceId = 'doer-breadcrumbs';
    const layerId = 'doer-breadcrumbs-layer';

    const coordinates = breadcrumbs.map((b) => [b.longitude, b.latitude]);

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates,
        },
      });
    } else {
      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates,
          },
        },
      });

      map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#8b5cf6',
          'line-width': 4,
          'line-opacity': 0.7,
          'line-dasharray': [2, 2],
        },
      });
    }

    return () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map, breadcrumbs, isVisible]);

  const getEtaColor = useCallback((minutes: number) => {
    if (minutes <= 5) return 'text-green-500';
    if (minutes <= 15) return 'text-amber-500';
    return 'text-red-500';
  }, []);

  const getEtaBadgeVariant = useCallback((minutes: number): 'default' | 'secondary' | 'destructive' => {
    if (minutes <= 5) return 'default';
    if (minutes <= 15) return 'secondary';
    return 'destructive';
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <Card className="bg-card/95 backdrop-blur-sm border-primary/20 shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Navigation className="h-4 w-4 text-primary animate-pulse" />
                Live Tracking
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onToggleVisibility}
                >
                  {isVisible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
                <Badge 
                  variant={isTracking ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {isTracking ? 'LIVE' : 'PAUSED'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Doer Info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-primary">
                <AvatarImage src={doer.avatar} alt={doer.name} />
                <AvatarFallback>{doer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{doer.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>⭐ {doer.rating.toFixed(1)}</span>
                  {doerLocation?.speed && (
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {Math.round(doerLocation.speed)} km/h
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={onCall}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={onMessage}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* ETA Display */}
            {eta && (
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Estimated Arrival
                  </span>
                  <Badge variant={getEtaBadgeVariant(eta.minutes)}>
                    {eta.minutes} min
                  </Badge>
                </div>
                <Progress 
                  value={Math.max(0, 100 - (eta.minutes / 30) * 100)} 
                  className="h-2"
                />
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Route className="h-3 w-3" />
                    {eta.distance.toFixed(1)} km away
                  </span>
                  {doerLocation?.accuracy && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      ±{Math.round(doerLocation.accuracy)}m
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Location Details */}
            {doerLocation && (
              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>
                  Last updated: {new Date(doerLocation.timestamp).toLocaleTimeString()}
                </span>
                <span className="flex items-center gap-1">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isTracking ? "bg-green-500 animate-pulse" : "bg-gray-400"
                  )} />
                  {isTracking ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            )}

            {/* Warning if poor accuracy */}
            {doerLocation?.accuracy && doerLocation.accuracy > 50 && (
              <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 rounded-lg p-2">
                <AlertCircle className="h-4 w-4" />
                Low GPS accuracy - location may be approximate
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
