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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Flame, 
  Settings2,
  Eye,
  EyeOff,
  Palette,
  Clock,
  TrendingUp,
  Zap,
  MapPin
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
  category?: string;
  created_at?: string;
}

interface MapHeatmapLayerProps {
  map: mapboxgl.Map | null;
  tasks: Task[];
  isEnabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  className?: string;
}

type ColorScheme = 'fire' | 'ocean' | 'forest' | 'sunset' | 'neon' | 'thermal';
type TimeFilter = 'all' | '1h' | '24h' | '7d' | '30d';

const COLOR_SCHEMES: Record<ColorScheme, { name: string; colors: string[]; icon: string }> = {
  fire: {
    name: 'Fire',
    icon: '🔥',
    colors: [
      'rgba(0, 0, 0, 0)',
      'rgb(255, 69, 0)',
      'rgb(255, 140, 0)',
      'rgb(255, 215, 0)',
      'rgb(255, 255, 100)',
      'rgb(255, 255, 255)',
    ],
  },
  ocean: {
    name: 'Ocean',
    icon: '🌊',
    colors: [
      'rgba(0, 0, 0, 0)',
      'rgb(0, 50, 100)',
      'rgb(0, 100, 150)',
      'rgb(0, 180, 200)',
      'rgb(100, 220, 255)',
      'rgb(200, 255, 255)',
    ],
  },
  forest: {
    name: 'Forest',
    icon: '🌲',
    colors: [
      'rgba(0, 0, 0, 0)',
      'rgb(20, 60, 20)',
      'rgb(34, 139, 34)',
      'rgb(50, 205, 50)',
      'rgb(144, 238, 144)',
      'rgb(200, 255, 200)',
    ],
  },
  sunset: {
    name: 'Sunset',
    icon: '🌅',
    colors: [
      'rgba(0, 0, 0, 0)',
      'rgb(75, 0, 130)',
      'rgb(138, 43, 226)',
      'rgb(255, 20, 147)',
      'rgb(255, 105, 180)',
      'rgb(255, 182, 193)',
    ],
  },
  neon: {
    name: 'Neon',
    icon: '💜',
    colors: [
      'rgba(0, 0, 0, 0)',
      'rgb(0, 255, 255)',
      'rgb(0, 191, 255)',
      'rgb(138, 43, 226)',
      'rgb(255, 0, 255)',
      'rgb(255, 255, 255)',
    ],
  },
  thermal: {
    name: 'Thermal',
    icon: '🌡️',
    colors: [
      'rgba(0, 0, 0, 0)',
      'rgb(0, 0, 139)',
      'rgb(0, 100, 200)',
      'rgb(0, 200, 100)',
      'rgb(255, 255, 0)',
      'rgb(255, 0, 0)',
    ],
  },
};

const TIME_FILTERS: Record<TimeFilter, { label: string; hours: number | null }> = {
  all: { label: 'All Time', hours: null },
  '1h': { label: 'Last Hour', hours: 1 },
  '24h': { label: 'Last 24h', hours: 24 },
  '7d': { label: 'Last 7 Days', hours: 168 },
  '30d': { label: 'Last 30 Days', hours: 720 },
};

export function MapHeatmapLayer({
  map,
  tasks,
  isEnabled = false,
  onToggle,
  className,
}: MapHeatmapLayerProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [intensity, setIntensity] = useState(1.2);
  const [radius, setRadius] = useState(25);
  const [opacity, setOpacity] = useState(0.85);
  const [colorScheme, setColorScheme] = useState<ColorScheme>('fire');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [showHotspots, setShowHotspots] = useState(true);
  const [animate, setAnimate] = useState(true);

  // Filter tasks by time
  const filteredTasks = useCallback(() => {
    const hours = TIME_FILTERS[timeFilter].hours;
    if (!hours) return tasks;

    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hours);

    return tasks.filter((t) => {
      if (!t.created_at) return true;
      return new Date(t.created_at) >= cutoff;
    });
  }, [tasks, timeFilter]);

  // Calculate hotspot statistics
  const getHotspotStats = useCallback(() => {
    const validTasks = filteredTasks().filter((t) => t.latitude && t.longitude);
    const totalBudget = validTasks.reduce((sum, t) => sum + (t.budget || 0), 0);
    const urgentCount = validTasks.filter((t) => t.urgency_level === 'urgent').length;
    const avgBudget = validTasks.length > 0 ? totalBudget / validTasks.length : 0;

    return {
      count: validTasks.length,
      totalBudget,
      urgentCount,
      avgBudget,
    };
  }, [filteredTasks]);

  // Get color ramp for current scheme
  const getColorRamp = useCallback(() => {
    const colors = COLOR_SCHEMES[colorScheme].colors;
    return [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, colors[0],
      0.2, colors[1],
      0.4, colors[2],
      0.6, colors[3],
      0.8, colors[4],
      1, colors[5],
    ];
  }, [colorScheme]);

  // Update heatmap layer
  useEffect(() => {
    if (!map) return;

    const addHeatmapLayer = () => {
      if (!map.isStyleLoaded()) {
        map.once('style.load', addHeatmapLayer);
        return;
      }

      const validTasks = filteredTasks().filter((t) => t.latitude && t.longitude);

      // Create GeoJSON data
      const geojsonData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: validTasks.map((task) => ({
          type: 'Feature',
          properties: {
            budget: task.budget || 50,
            urgency: task.urgency_level === 'urgent' ? 3 : task.urgency_level === 'high' ? 2 : 1,
            weight: ((task.budget || 50) / 100) * (task.urgency_level === 'urgent' ? 2 : 1),
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

      // Remove existing layers
      ['task-heatmap-layer', 'task-heatmap-glow', 'task-hotspot-circles'].forEach((layerId) => {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
      });

      // Add glow layer (below main heatmap)
      map.addLayer({
        id: 'task-heatmap-glow',
        type: 'heatmap',
        source: 'task-heatmap',
        paint: {
          'heatmap-weight': ['get', 'weight'],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 0.3 * intensity,
            15, 1 * intensity,
          ],
          'heatmap-color': getColorRamp() as any,
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, radius * 0.8,
            15, radius * 2,
          ],
          'heatmap-opacity': opacity * 0.4,
        },
      });

      // Add main heatmap layer
      map.addLayer({
        id: 'task-heatmap-layer',
        type: 'heatmap',
        source: 'task-heatmap',
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['*', ['get', 'budget'], ['get', 'urgency']],
            0, 0,
            100, 0.5,
            500, 1,
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 0.5 * intensity,
            15, 1.5 * intensity,
          ],
          'heatmap-color': getColorRamp() as any,
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, radius * 0.5,
            15, radius * 1.5,
          ],
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7, opacity,
            15, opacity * 0.8,
          ],
        },
      });

      // Add hotspot circles at high zoom
      if (showHotspots) {
        map.addLayer({
          id: 'task-hotspot-circles',
          type: 'circle',
          source: 'task-heatmap',
          minzoom: 12,
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              12, 4,
              15, 8,
            ],
            'circle-color': COLOR_SCHEMES[colorScheme].colors[4],
            'circle-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              12, 0,
              14, 0.6,
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-opacity': 0.8,
          },
        });
      }
    };

    const removeHeatmapLayer = () => {
      ['task-heatmap-layer', 'task-heatmap-glow', 'task-hotspot-circles'].forEach((layerId) => {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
      });
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
  }, [map, filteredTasks, isEnabled, intensity, radius, opacity, colorScheme, getColorRamp, showHotspots]);

  const stats = getHotspotStats();

  return (
    <div className={cn('relative', className)}>
      {/* Toggle Button */}
      <Button
        variant={isEnabled ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToggle?.(!isEnabled)}
        className={cn(
          'gap-2 transition-all duration-300',
          isEnabled && 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-0'
        )}
      >
        <AnimatePresence mode="wait">
          {isEnabled ? (
            <motion.div
              key="enabled"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              <Flame className="h-4 w-4 animate-pulse" />
            </motion.div>
          ) : (
            <motion.div
              key="disabled"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex items-center gap-2"
            >
              <EyeOff className="h-4 w-4" />
              <Flame className="h-4 w-4" />
            </motion.div>
          )}
        </AnimatePresence>
        Heatmap
        {isEnabled && (
          <Badge variant="secondary" className="ml-1 text-xs bg-white/20 text-white">
            {stats.count}
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
          <Settings2 className={cn('h-4 w-4 transition-transform duration-300', showSettings && 'rotate-180')} />
        </Button>
      )}

      {/* Settings Panel */}
      <AnimatePresence>
        {isEnabled && showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 z-50"
          >
            <Card className="w-80 bg-card/95 backdrop-blur-md shadow-xl border-border/50">
              <CardContent className="p-4 space-y-5">
                {/* Header with Stats */}
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    Heatmap Settings
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {stats.count} tasks
                  </Badge>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <TrendingUp className="h-3 w-3 mx-auto mb-1 text-green-500" />
                    <p className="text-xs font-medium">${stats.avgBudget.toFixed(0)}</p>
                    <p className="text-[10px] text-muted-foreground">Avg Budget</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <Zap className="h-3 w-3 mx-auto mb-1 text-yellow-500" />
                    <p className="text-xs font-medium">{stats.urgentCount}</p>
                    <p className="text-[10px] text-muted-foreground">Urgent</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <MapPin className="h-3 w-3 mx-auto mb-1 text-blue-500" />
                    <p className="text-xs font-medium">${(stats.totalBudget / 1000).toFixed(1)}k</p>
                    <p className="text-[10px] text-muted-foreground">Total</p>
                  </div>
                </div>

                {/* Color Scheme */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <span>Color Scheme</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(COLOR_SCHEMES) as ColorScheme[]).map((scheme) => (
                      <button
                        key={scheme}
                        onClick={() => setColorScheme(scheme)}
                        className={cn(
                          'flex flex-col items-center p-2 rounded-lg border transition-all duration-200',
                          colorScheme === scheme
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        )}
                      >
                        <span className="text-lg">{COLOR_SCHEMES[scheme].icon}</span>
                        <span className="text-[10px] mt-1">{COLOR_SCHEMES[scheme].name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Filter */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Time Filter</span>
                  </div>
                  <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(TIME_FILTERS) as TimeFilter[]).map((filter) => (
                        <SelectItem key={filter} value={filter}>
                          {TIME_FILTERS[filter].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Intensity */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Intensity</span>
                    <span className="text-muted-foreground font-mono">{intensity.toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={[intensity]}
                    onValueChange={([v]) => setIntensity(v)}
                    min={0.5}
                    max={3}
                    step={0.1}
                    className="py-1"
                  />
                </div>

                {/* Radius */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Spread Radius</span>
                    <span className="text-muted-foreground font-mono">{radius}px</span>
                  </div>
                  <Slider
                    value={[radius]}
                    onValueChange={([v]) => setRadius(v)}
                    min={10}
                    max={60}
                    step={5}
                    className="py-1"
                  />
                </div>

                {/* Opacity */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Opacity</span>
                    <span className="text-muted-foreground font-mono">{Math.round(opacity * 100)}%</span>
                  </div>
                  <Slider
                    value={[opacity]}
                    onValueChange={([v]) => setOpacity(v)}
                    min={0.3}
                    max={1}
                    step={0.05}
                    className="py-1"
                  />
                </div>

                {/* Toggles */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm">Show Hotspot Points</span>
                  <Button
                    variant={showHotspots ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowHotspots(!showHotspots)}
                    className="h-7 text-xs"
                  >
                    {showHotspots ? 'On' : 'Off'}
                  </Button>
                </div>

                {/* Legend */}
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Density Legend</p>
                  <div 
                    className="h-4 rounded-full overflow-hidden"
                    style={{
                      background: `linear-gradient(to right, ${COLOR_SCHEMES[colorScheme].colors.slice(1).join(', ')})`,
                    }}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>Low Activity</span>
                    <span>Medium</span>
                    <span>High Activity</span>
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
