import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { 
  Slider
} from '@/components/ui/slider';
import { 
  Flame, 
  Settings2,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import mapboxgl from 'mapbox-gl';

interface Task {
  id: string;
  latitude: number | null;
  longitude: number | null;
  budget: number | null;
  urgency_level?: string;
}

interface MapHeatmapLayerProps {
  map: mapboxgl.Map | null;
  tasks: Task[];
  isEnabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  className?: string;
}

export function MapHeatmapLayer({
  map,
  tasks,
  isEnabled = false,
  onToggle,
  className,
}: MapHeatmapLayerProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [intensity, setIntensity] = useState(1);
  const [radius, setRadius] = useState(20);
  const [opacity, setOpacity] = useState(0.8);

  // Update heatmap layer
  useEffect(() => {
    if (!map) return;

    const addHeatmapLayer = () => {
      if (!map.isStyleLoaded()) {
        map.once('style.load', addHeatmapLayer);
        return;
      }

      // Filter tasks with valid coordinates
      const validTasks = tasks.filter(
        (t) => t.latitude && t.longitude
      );

      // Create GeoJSON data
      const geojsonData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: validTasks.map((task) => ({
          type: 'Feature',
          properties: {
            budget: task.budget || 50,
            urgency: task.urgency_level === 'urgent' ? 2 : task.urgency_level === 'high' ? 1.5 : 1,
          },
          geometry: {
            type: 'Point',
            coordinates: [task.longitude!, task.latitude!],
          },
        })),
      };

      // Add or update source
      if (map.getSource('task-heatmap')) {
        (map.getSource('task-heatmap') as mapboxgl.GeoJSONSource).setData(geojsonData);
      } else {
        map.addSource('task-heatmap', {
          type: 'geojson',
          data: geojsonData,
        });
      }

      // Add or update layer
      if (!map.getLayer('task-heatmap-layer')) {
        map.addLayer(
          {
            id: 'task-heatmap-layer',
            type: 'heatmap',
            source: 'task-heatmap',
            paint: {
              // Weight based on budget and urgency
              'heatmap-weight': [
                'interpolate',
                ['linear'],
                ['*', ['get', 'budget'], ['get', 'urgency']],
                0, 0,
                100, 0.5,
                500, 1,
              ],
              // Intensity
              'heatmap-intensity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 0.5 * intensity,
                15, 1.5 * intensity,
              ],
              // Color ramp
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(0, 0, 255, 0)',
                0.1, 'rgb(65, 105, 225)',
                0.3, 'rgb(0, 255, 255)',
                0.5, 'rgb(0, 255, 0)',
                0.7, 'rgb(255, 255, 0)',
                1, 'rgb(255, 0, 0)',
              ],
              // Radius based on zoom
              'heatmap-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, radius * 0.5,
                15, radius * 1.5,
              ],
              'heatmap-opacity': opacity,
            },
          },
          'clusters' // Add below clusters if they exist
        );
      } else {
        // Update paint properties
        map.setPaintProperty('task-heatmap-layer', 'heatmap-intensity', [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 0.5 * intensity,
          15, 1.5 * intensity,
        ]);
        map.setPaintProperty('task-heatmap-layer', 'heatmap-radius', [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, radius * 0.5,
          15, radius * 1.5,
        ]);
        map.setPaintProperty('task-heatmap-layer', 'heatmap-opacity', opacity);
      }
    };

    const removeHeatmapLayer = () => {
      if (map.getLayer('task-heatmap-layer')) {
        map.removeLayer('task-heatmap-layer');
      }
      if (map.getSource('task-heatmap')) {
        map.removeSource('task-heatmap');
      }
    };

    if (isEnabled) {
      addHeatmapLayer();
    } else {
      removeHeatmapLayer();
    }

    return () => {
      // Don't remove on cleanup to prevent flashing
    };
  }, [map, tasks, isEnabled, intensity, radius, opacity]);

  // Get hotspot count
  const hotspotCount = tasks.filter((t) => t.latitude && t.longitude).length;

  return (
    <div className={cn('relative', className)}>
      {/* Toggle Button */}
      <Button
        variant={isEnabled ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToggle?.(!isEnabled)}
        className="gap-2"
      >
        {isEnabled ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
        <Flame className="h-4 w-4" />
        Heatmap
        {isEnabled && (
          <Badge variant="secondary" className="ml-1 text-xs">
            {hotspotCount}
          </Badge>
        )}
      </Button>

      {/* Settings Toggle */}
      {isEnabled && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 ml-1"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings2 className={cn('h-4 w-4 transition-transform', showSettings && 'rotate-90')} />
        </Button>
      )}

      {/* Settings Panel */}
      <AnimatePresence>
        {isEnabled && showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 z-50"
          >
            <Card className="w-64 bg-card/95 backdrop-blur-sm shadow-lg">
              <CardContent className="p-4 space-y-4">
                <h4 className="text-sm font-medium">Heatmap Settings</h4>

                {/* Intensity */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Intensity</span>
                    <span className="text-muted-foreground">{intensity.toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={[intensity]}
                    onValueChange={([v]) => setIntensity(v)}
                    min={0.5}
                    max={3}
                    step={0.25}
                  />
                </div>

                {/* Radius */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Spread Radius</span>
                    <span className="text-muted-foreground">{radius}px</span>
                  </div>
                  <Slider
                    value={[radius]}
                    onValueChange={([v]) => setRadius(v)}
                    min={5}
                    max={50}
                    step={5}
                  />
                </div>

                {/* Opacity */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Opacity</span>
                    <span className="text-muted-foreground">{Math.round(opacity * 100)}%</span>
                  </div>
                  <Slider
                    value={[opacity]}
                    onValueChange={([v]) => setOpacity(v)}
                    min={0.2}
                    max={1}
                    step={0.1}
                  />
                </div>

                {/* Legend */}
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Density Legend</p>
                  <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 via-green-500 via-yellow-500 to-red-500" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
