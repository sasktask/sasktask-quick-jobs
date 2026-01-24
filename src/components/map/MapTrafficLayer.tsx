import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { 
  Car, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import mapboxgl from 'mapbox-gl';

interface TrafficCondition {
  level: 'low' | 'moderate' | 'heavy' | 'severe';
  description: string;
  avgSpeed: number;
  congestionPercent: number;
}

interface MapTrafficLayerProps {
  map: mapboxgl.Map | null;
  isEnabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  className?: string;
}

export function MapTrafficLayer({
  map,
  isEnabled = false,
  onToggle,
  className,
}: MapTrafficLayerProps) {
  const [trafficCondition, setTrafficCondition] = useState<TrafficCondition>({
    level: 'moderate',
    description: 'Normal traffic conditions',
    avgSpeed: 45,
    congestionPercent: 25,
  });
  const [showDetails, setShowDetails] = useState(false);

  // Add/remove traffic layer
  useEffect(() => {
    if (!map) return;

    const addTrafficLayer = () => {
      // Check if style is loaded
      if (!map.isStyleLoaded()) {
        map.once('style.load', addTrafficLayer);
        return;
      }

      // Add traffic source if not exists
      if (!map.getSource('mapbox-traffic')) {
        map.addSource('mapbox-traffic', {
          type: 'vector',
          url: 'mapbox://mapbox.mapbox-traffic-v1',
        });
      }

      // Add traffic flow layer
      if (!map.getLayer('traffic-flow')) {
        map.addLayer({
          id: 'traffic-flow',
          type: 'line',
          source: 'mapbox-traffic',
          'source-layer': 'traffic',
          paint: {
            'line-width': 2.5,
            'line-color': [
              'match',
              ['get', 'congestion'],
              'low', '#10b981', // Green
              'moderate', '#f59e0b', // Amber
              'heavy', '#ef4444', // Red
              'severe', '#7f1d1d', // Dark red
              '#6b7280', // Default gray
            ],
            'line-opacity': 0.8,
          },
        });
      }

      // Add traffic incidents layer
      if (!map.getLayer('traffic-incidents')) {
        map.addLayer({
          id: 'traffic-incidents',
          type: 'circle',
          source: 'mapbox-traffic',
          'source-layer': 'traffic',
          filter: ['==', ['get', 'congestion'], 'severe'],
          paint: {
            'circle-radius': 8,
            'circle-color': '#ef4444',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.9,
          },
        });
      }
    };

    const removeTrafficLayer = () => {
      if (map.getLayer('traffic-flow')) {
        map.removeLayer('traffic-flow');
      }
      if (map.getLayer('traffic-incidents')) {
        map.removeLayer('traffic-incidents');
      }
    };

    if (isEnabled) {
      addTrafficLayer();
    } else {
      removeTrafficLayer();
    }

    return () => {
      removeTrafficLayer();
    };
  }, [map, isEnabled]);

  // Simulate traffic condition updates
  useEffect(() => {
    if (!isEnabled) return;

    const updateTrafficCondition = () => {
      const conditions: TrafficCondition[] = [
        { level: 'low', description: 'Light traffic - clear roads', avgSpeed: 55, congestionPercent: 10 },
        { level: 'moderate', description: 'Normal traffic conditions', avgSpeed: 45, congestionPercent: 30 },
        { level: 'heavy', description: 'Heavy traffic - expect delays', avgSpeed: 25, congestionPercent: 60 },
        { level: 'severe', description: 'Severe congestion - major delays', avgSpeed: 10, congestionPercent: 85 },
      ];

      // Weight towards moderate/low for Saskatchewan
      const weights = [0.4, 0.4, 0.15, 0.05];
      const random = Math.random();
      let cumulative = 0;
      for (let i = 0; i < weights.length; i++) {
        cumulative += weights[i];
        if (random < cumulative) {
          setTrafficCondition(conditions[i]);
          break;
        }
      }
    };

    updateTrafficCondition();
    const interval = setInterval(updateTrafficCondition, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [isEnabled]);

  const getTrafficColor = (level: TrafficCondition['level']) => {
    switch (level) {
      case 'low': return 'text-green-500 bg-green-500/10';
      case 'moderate': return 'text-amber-500 bg-amber-500/10';
      case 'heavy': return 'text-red-500 bg-red-500/10';
      case 'severe': return 'text-red-700 bg-red-700/10';
    }
  };

  const getTrafficIcon = (level: TrafficCondition['level']) => {
    switch (level) {
      case 'low': return <TrendingDown className="h-4 w-4" />;
      case 'moderate': return <Minus className="h-4 w-4" />;
      case 'heavy':
      case 'severe': return <TrendingUp className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Toggle Button */}
      <Button
        variant={isEnabled ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToggle?.(!isEnabled)}
        className={cn(
          'gap-2',
          isEnabled && getTrafficColor(trafficCondition.level)
        )}
      >
        <Car className="h-4 w-4" />
        Traffic
        {isEnabled && (
          <Badge 
            variant="secondary" 
            className={cn('ml-1 text-xs capitalize', getTrafficColor(trafficCondition.level))}
          >
            {trafficCondition.level}
          </Badge>
        )}
      </Button>

      {/* Traffic Details Card */}
      <AnimatePresence>
        {isEnabled && showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 z-50"
          >
            <Card className="w-64 bg-card/95 backdrop-blur-sm shadow-lg">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Traffic Conditions</span>
                  <Badge 
                    className={cn('capitalize', getTrafficColor(trafficCondition.level))}
                  >
                    {getTrafficIcon(trafficCondition.level)}
                    {trafficCondition.level}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground">
                  {trafficCondition.description}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{trafficCondition.avgSpeed}</div>
                    <div className="text-xs text-muted-foreground">km/h avg</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{trafficCondition.congestionPercent}%</div>
                    <div className="text-xs text-muted-foreground">congested</div>
                  </div>
                </div>

                {trafficCondition.level === 'severe' && (
                  <div className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 rounded-lg p-2">
                    <AlertTriangle className="h-4 w-4" />
                    Expect significant delays
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Updated just now
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover trigger */}
      {isEnabled && (
        <div
          className="absolute inset-0"
          onMouseEnter={() => setShowDetails(true)}
          onMouseLeave={() => setShowDetails(false)}
        />
      )}
    </div>
  );
}
