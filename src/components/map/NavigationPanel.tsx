import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  Navigation, 
  Clock, 
  MapPin, 
  Car, 
  PersonStanding, 
  Bike,
  X,
  ExternalLink,
  Route as RouteIcon,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  CornerUpRight,
  CornerDownLeft,
  CornerUpLeft,
  ArrowUp,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  Target,
  Loader2,
  Share2,
  Copy,
  Check,
  Locate,
  Flag,
  CircleDot,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: string;
  name?: string;
}

interface RouteInfo {
  distance: number;
  duration: number;
  geometry?: GeoJSON.LineString;
  steps?: RouteStep[];
}

interface NavigationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  destination?: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  } | null;
  origin?: {
    name: string;
    latitude: number;
    longitude: number;
  } | null;
  mapboxToken: string;
  onRouteCalculated?: (route: RouteInfo | null, mode: string) => void;
  onStepHover?: (stepIndex: number | null) => void;
}

type TravelMode = 'driving' | 'walking' | 'cycling';

const travelModes: { mode: TravelMode; icon: React.ReactNode; label: string; color: string }[] = [
  { mode: 'driving', icon: <Car className="h-4 w-4" />, label: 'Drive', color: 'text-blue-500' },
  { mode: 'walking', icon: <PersonStanding className="h-4 w-4" />, label: 'Walk', color: 'text-green-500' },
  { mode: 'cycling', icon: <Bike className="h-4 w-4" />, label: 'Bike', color: 'text-orange-500' },
];

// Maneuver type to icon mapping
const getManeuverIcon = (maneuver: string) => {
  const iconClass = "h-5 w-5";
  
  if (maneuver.includes('turn-right') || maneuver.includes('right')) {
    return <CornerUpRight className={`${iconClass} text-primary`} />;
  }
  if (maneuver.includes('turn-left') || maneuver.includes('left')) {
    return <CornerUpLeft className={`${iconClass} text-primary`} />;
  }
  if (maneuver.includes('sharp-right')) {
    return <CornerDownRight className={`${iconClass} text-primary`} />;
  }
  if (maneuver.includes('sharp-left')) {
    return <CornerDownLeft className={`${iconClass} text-primary`} />;
  }
  if (maneuver.includes('uturn') || maneuver.includes('u-turn')) {
    return <RotateCw className={`${iconClass} text-primary`} />;
  }
  if (maneuver.includes('straight') || maneuver.includes('continue')) {
    return <ArrowUp className={`${iconClass} text-primary`} />;
  }
  if (maneuver.includes('arrive') || maneuver.includes('destination')) {
    return <Flag className={`${iconClass} text-green-500`} />;
  }
  if (maneuver.includes('depart') || maneuver.includes('start')) {
    return <CircleDot className={`${iconClass} text-blue-500`} />;
  }
  if (maneuver.includes('roundabout') || maneuver.includes('rotary')) {
    return <RotateCw className={`${iconClass} text-primary`} />;
  }
  if (maneuver.includes('merge')) {
    return <ChevronRight className={`${iconClass} text-primary`} />;
  }
  
  return <ArrowUp className={`${iconClass} text-muted-foreground`} />;
};

export function NavigationPanel({ 
  isOpen,
  onClose,
  destination,
  origin,
  mapboxToken,
  onRouteCalculated,
  onStepHover,
}: NavigationPanelProps) {
  const [selectedMode, setSelectedMode] = useState<TravelMode>('driving');
  const [routes, setRoutes] = useState<Record<TravelMode, RouteInfo | null>>({
    driving: null,
    walking: null,
    cycling: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showAllSteps, setShowAllSteps] = useState(true);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Fetch routes when destination/origin changes
  useEffect(() => {
    if (destination && origin && mapboxToken && isOpen) {
      fetchAllRoutes();
    }
  }, [destination, origin, mapboxToken, isOpen]);

  const fetchRoute = async (mode: TravelMode): Promise<RouteInfo | null> => {
    if (!destination || !origin) return null;

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${mode}/` +
        `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}` +
        `?geometries=geojson&overview=full&steps=true&voice_instructions=true&banner_instructions=true&access_token=${mapboxToken}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch route');
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const steps: RouteStep[] = route.legs[0]?.steps?.map((step: any) => ({
          instruction: step.maneuver?.instruction || 'Continue',
          distance: step.distance,
          duration: step.duration,
          maneuver: step.maneuver?.type + (step.maneuver?.modifier ? `-${step.maneuver.modifier}` : ''),
          name: step.name,
        })) || [];

        return {
          distance: route.distance,
          duration: route.duration,
          geometry: route.geometry,
          steps,
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
      console.error('Route calculation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (mode: TravelMode) => {
    setSelectedMode(mode);
    onRouteCalculated?.(routes[mode], mode);
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)} sec`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    return `${hours} hr ${mins} min`;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatStepDistance = (meters: number): string => {
    if (meters < 100) return `${Math.round(meters)} m`;
    if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const openInGoogleMaps = () => {
    if (!destination || !origin) return;
    const url = `https://www.google.com/maps/dir/${origin.latitude},${origin.longitude}/${destination.latitude},${destination.longitude}/@${destination.latitude},${destination.longitude},14z/data=!4m2!4m1!3e${selectedMode === 'driving' ? '0' : selectedMode === 'walking' ? '2' : '1'}`;
    window.open(url, '_blank');
  };

  const openInAppleMaps = () => {
    if (!destination || !origin) return;
    const dirflg = selectedMode === 'driving' ? 'd' : selectedMode === 'walking' ? 'w' : 'b';
    const url = `https://maps.apple.com/?saddr=${origin.latitude},${origin.longitude}&daddr=${destination.latitude},${destination.longitude}&dirflg=${dirflg}`;
    window.open(url, '_blank');
  };

  const copyDirectionsLink = async () => {
    if (!destination) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=${selectedMode}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Link copied!", description: "Share this link with others" });
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleStepClick = (index: number) => {
    setActiveStepIndex(activeStepIndex === index ? null : index);
    onStepHover?.(index);
  };

  const currentRoute = routes[selectedMode];
  const arrivalTime = currentRoute 
    ? new Date(Date.now() + currentRoute.duration * 1000).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    : null;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -320 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -320 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute top-4 left-4 bottom-4 z-30 w-[340px] flex flex-col"
    >
      <Card className="flex-1 flex flex-col bg-background/95 backdrop-blur-md shadow-2xl border-border overflow-hidden">
        {/* Header */}
        <CardHeader className="pb-3 shrink-0 bg-primary/5 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Navigation className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-lg">Directions</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Origin & Destination */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 flex justify-center">
                <div className="h-3 w-3 rounded-full bg-blue-500 ring-2 ring-blue-500/30" />
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium truncate">{origin?.name || 'Your location'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-3">
              <div className="w-0.5 h-4 bg-border" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 flex justify-center">
                <div className="h-3 w-3 rounded-full bg-red-500 ring-2 ring-red-500/30" />
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium truncate">{destination?.name || 'Destination'}</p>
                <p className="text-xs text-muted-foreground truncate">{destination?.address}</p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Travel Mode Selector */}
          <div className="p-3 border-b border-border shrink-0">
            <div className="grid grid-cols-3 gap-2">
              {travelModes.map(({ mode, icon, label, color }) => {
                const route = routes[mode];
                return (
                  <Button
                    key={mode}
                    variant={selectedMode === mode ? 'default' : 'outline'}
                    size="sm"
                    className={`flex flex-col h-auto py-2 gap-1 ${selectedMode === mode ? '' : 'hover:bg-muted/50'}`}
                    onClick={() => handleModeChange(mode)}
                    disabled={isLoading || !route}
                  >
                    <span className={selectedMode === mode ? '' : color}>{icon}</span>
                    <span className="text-xs">{label}</span>
                    {route && (
                      <span className="text-[10px] font-normal opacity-80">
                        {formatDuration(route.duration)}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Route Summary */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Calculating routes...</p>
              </div>
            </div>
          ) : !origin ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <Locate className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Enable location to get directions</p>
              </div>
            </div>
          ) : currentRoute ? (
            <>
              {/* Summary Bar */}
              <div className="p-4 bg-primary/5 border-b border-border shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-2xl font-bold">{formatDuration(currentRoute.duration)}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({formatDistance(currentRoute.distance)})
                    </span>
                  </div>
                  {arrivalTime && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Arrive by</p>
                      <p className="text-sm font-semibold">{arrivalTime}</p>
                    </div>
                  )}
                </div>
                
                {/* Best route indicator */}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs gap-1">
                    <RouteIcon className="h-3 w-3" />
                    Fastest route
                  </Badge>
                </div>
              </div>

              {/* Turn-by-turn directions */}
              <div className="shrink-0 px-4 pt-3 pb-2 flex items-center justify-between">
                <span className="text-sm font-medium">
                  Step-by-step ({currentRoute.steps?.length || 0} steps)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setShowAllSteps(!showAllSteps)}
                >
                  {showAllSteps ? (
                    <>
                      <ChevronUp className="h-3 w-3" />
                      Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      Expand
                    </>
                  )}
                </Button>
              </div>

              <ScrollArea className="flex-1 px-4">
                <AnimatePresence>
                  {showAllSteps && currentRoute.steps && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1 pb-4"
                    >
                      {currentRoute.steps.map((step, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                            activeStepIndex === index 
                              ? 'bg-primary/10 ring-1 ring-primary/30' 
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => handleStepClick(index)}
                          onMouseEnter={() => onStepHover?.(index)}
                          onMouseLeave={() => onStepHover?.(null)}
                        >
                          <div className="shrink-0 mt-0.5">
                            {getManeuverIcon(step.maneuver)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-snug">
                              {step.instruction}
                            </p>
                            {step.name && step.name !== '' && (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {step.name}
                              </p>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-xs font-medium">{formatStepDistance(step.distance)}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {Math.round(step.duration / 60)} min
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </ScrollArea>

              {/* Action Buttons */}
              <div className="p-3 border-t border-border shrink-0 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={openInGoogleMaps} className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Google Maps
                  </Button>
                  <Button variant="outline" onClick={openInAppleMaps} className="gap-2">
                    <Navigation className="h-4 w-4" />
                    Apple Maps
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full gap-2" 
                  onClick={copyDirectionsLink}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      Share Directions
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <RouteIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No route available</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Try a different destination</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}