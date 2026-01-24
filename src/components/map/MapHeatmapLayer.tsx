import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Flame, 
  Settings2,
  Eye,
  EyeOff,
  Palette,
  Clock,
  TrendingUp,
  Zap,
  MapPin,
  Layers,
  Sparkles,
  Target,
  BarChart3,
  RefreshCw
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

type ColorScheme = 'fire' | 'ocean' | 'forest' | 'sunset' | 'neon' | 'thermal' | 'aurora' | 'magma';
type TimeFilter = 'all' | '1h' | '24h' | '7d' | '30d';
type ViewMode = 'density' | 'value' | 'urgency';
type Preset = 'default' | 'subtle' | 'intense' | 'focused';

const COLOR_SCHEMES: Record<ColorScheme, { name: string; colors: string[]; icon: string; gradient: string }> = {
  fire: {
    name: 'Fire',
    icon: '🔥',
    gradient: 'from-orange-500 via-red-500 to-yellow-400',
    colors: [
      'rgba(0, 0, 0, 0)',
      'rgb(128, 0, 38)',
      'rgb(227, 26, 28)',
      'rgb(252, 78, 42)',
      'rgb(253, 141, 60)',
      'rgb(254, 217, 118)',
    ],
  },
  ocean: {
    name: 'Ocean',
    icon: '🌊',
    gradient: 'from-blue-600 via-cyan-500 to-teal-300',
    colors: [
      'rgba(0, 0, 0, 0)',
      'rgb(8, 29, 88)',
      'rgb(37, 52, 148)',
      'rgb(34, 94, 168)',
      'rgb(29, 145, 192)',
      'rgb(127, 205, 187)',
    ],
  },
  forest: {
    name: 'Forest',
    icon: '🌲',
    gradient: 'from-green-700 via-emerald-500 to-lime-300',
    colors: [
      'rgba(0, 0, 0, 0)',
      'rgb(0, 68, 27)',
      'rgb(35, 139, 69)',
      'rgb(65, 171, 93)',
      'rgb(116, 196, 118)',
      'rgb(186, 228, 179)',
    ],
  },
  sunset: {
    name: 'Sunset',
    icon: '🌅',
    gradient: 'from-purple-600 via-pink-500 to-orange-400',
    colors: [
      'rgba(0, 0, 0, 0)',
      'rgb(63, 0, 125)',
      'rgb(135, 0, 157)',
      'rgb(214, 47, 123)',
      'rgb(247, 109, 94)',
      'rgb(253, 187, 132)',
    ],
  },
  neon: {
    name: 'Neon',
    icon: '💜',
    gradient: 'from-cyan-400 via-purple-500 to-pink-500',
    colors: [
      'rgba(0, 0, 0, 0)',
      'rgb(0, 255, 255)',
      'rgb(0, 191, 255)',
      'rgb(138, 43, 226)',
      'rgb(255, 0, 255)',
      'rgb(255, 182, 255)',
    ],
  },
  thermal: {
    name: 'Thermal',
    icon: '🌡️',
    gradient: 'from-blue-600 via-green-400 to-red-500',
    colors: [
      'rgba(0, 0, 0, 0)',
      'rgb(0, 0, 139)',
      'rgb(0, 100, 200)',
      'rgb(0, 200, 100)',
      'rgb(255, 255, 0)',
      'rgb(255, 0, 0)',
    ],
  },
  aurora: {
    name: 'Aurora',
    icon: '✨',
    gradient: 'from-green-400 via-blue-500 to-purple-600',
    colors: [
      'rgba(0, 0, 0, 0)',
      'rgb(16, 185, 129)',
      'rgb(34, 197, 94)',
      'rgb(59, 130, 246)',
      'rgb(139, 92, 246)',
      'rgb(217, 70, 239)',
    ],
  },
  magma: {
    name: 'Magma',
    icon: '🌋',
    gradient: 'from-gray-900 via-red-700 to-yellow-400',
    colors: [
      'rgba(0, 0, 0, 0)',
      'rgb(0, 0, 4)',
      'rgb(81, 18, 79)',
      'rgb(183, 55, 121)',
      'rgb(252, 137, 97)',
      'rgb(252, 253, 191)',
    ],
  },
};

const TIME_FILTERS: Record<TimeFilter, { label: string; hours: number | null; short: string }> = {
  all: { label: 'All Time', hours: null, short: 'All' },
  '1h': { label: 'Last Hour', hours: 1, short: '1h' },
  '24h': { label: 'Last 24 Hours', hours: 24, short: '24h' },
  '7d': { label: 'Last 7 Days', hours: 168, short: '7d' },
  '30d': { label: 'Last 30 Days', hours: 720, short: '30d' },
};

const VIEW_MODES: Record<ViewMode, { label: string; icon: typeof Flame; description: string }> = {
  density: { label: 'Density', icon: Layers, description: 'Task concentration' },
  value: { label: 'Value', icon: TrendingUp, description: 'Budget weighted' },
  urgency: { label: 'Urgency', icon: Zap, description: 'Priority focused' },
};

const PRESETS: Record<Preset, { name: string; intensity: number; radius: number; opacity: number }> = {
  default: { name: 'Default', intensity: 1.2, radius: 25, opacity: 0.85 },
  subtle: { name: 'Subtle', intensity: 0.8, radius: 35, opacity: 0.6 },
  intense: { name: 'Intense', intensity: 2, radius: 20, opacity: 0.95 },
  focused: { name: 'Focused', intensity: 1.5, radius: 15, opacity: 0.9 },
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
  const [viewMode, setViewMode] = useState<ViewMode>('density');
  const [showHotspots, setShowHotspots] = useState(true);
  const [showContours, setShowContours] = useState(false);
  const [animatePulse, setAnimatePulse] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    tasks.forEach((t) => {
      if (t.category) cats.add(t.category);
    });
    return ['all', ...Array.from(cats)];
  }, [tasks]);

  // Filter tasks by time and category
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Time filter
    const hours = TIME_FILTERS[timeFilter].hours;
    if (hours) {
      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - hours);
      result = result.filter((t) => {
        if (!t.created_at) return true;
        return new Date(t.created_at) >= cutoff;
      });
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.category === selectedCategory);
    }

    return result;
  }, [tasks, timeFilter, selectedCategory]);

  // Calculate hotspot statistics
  const stats = useMemo(() => {
    const validTasks = filteredTasks.filter((t) => t.latitude && t.longitude);
    const totalBudget = validTasks.reduce((sum, t) => sum + (t.budget || 0), 0);
    const urgentCount = validTasks.filter((t) => t.urgency_level === 'urgent').length;
    const highCount = validTasks.filter((t) => t.urgency_level === 'high').length;
    const avgBudget = validTasks.length > 0 ? totalBudget / validTasks.length : 0;
    const maxBudget = Math.max(...validTasks.map((t) => t.budget || 0), 0);

    return {
      count: validTasks.length,
      totalBudget,
      urgentCount,
      highCount,
      avgBudget,
      maxBudget,
    };
  }, [filteredTasks]);

  // Get weight expression based on view mode
  const getWeightExpression = useCallback(() => {
    switch (viewMode) {
      case 'value':
        return [
          'interpolate',
          ['linear'],
          ['get', 'budget'],
          0, 0.1,
          100, 0.5,
          500, 1,
        ];
      case 'urgency':
        return ['get', 'urgency'];
      default:
        return 1;
    }
  }, [viewMode]);

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

  // Apply preset
  const applyPreset = (preset: Preset) => {
    const p = PRESETS[preset];
    setIntensity(p.intensity);
    setRadius(p.radius);
    setOpacity(p.opacity);
  };

  // Update heatmap layer
  useEffect(() => {
    if (!map) return;

    const addHeatmapLayer = () => {
      if (!map.isStyleLoaded()) {
        map.once('style.load', addHeatmapLayer);
        return;
      }

      const validTasks = filteredTasks.filter((t) => t.latitude && t.longitude);

      // Create GeoJSON data
      const geojsonData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: validTasks.map((task) => ({
          type: 'Feature',
          properties: {
            id: task.id,
            budget: task.budget || 50,
            urgency: task.urgency_level === 'urgent' ? 1 : task.urgency_level === 'high' ? 0.7 : 0.4,
            category: task.category || 'other',
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
      const layerIds = [
        'task-heatmap-layer',
        'task-heatmap-glow',
        'task-heatmap-contour',
        'task-hotspot-circles',
        'task-hotspot-pulse',
        'task-hotspot-labels',
      ];
      layerIds.forEach((layerId) => {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
      });

      // Add ambient glow layer
      map.addLayer({
        id: 'task-heatmap-glow',
        type: 'heatmap',
        source: 'task-heatmap',
        paint: {
          'heatmap-weight': getWeightExpression() as any,
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 0.2 * intensity,
            12, 0.8 * intensity,
          ],
          'heatmap-color': getColorRamp() as any,
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, radius * 1.5,
            12, radius * 3,
          ],
          'heatmap-opacity': opacity * 0.3,
        },
      });

      // Add main heatmap layer
      map.addLayer({
        id: 'task-heatmap-layer',
        type: 'heatmap',
        source: 'task-heatmap',
        paint: {
          'heatmap-weight': getWeightExpression() as any,
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 0.5 * intensity,
            12, 1.5 * intensity,
          ],
          'heatmap-color': getColorRamp() as any,
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, radius * 0.5,
            12, radius * 1.2,
          ],
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7, opacity,
            14, opacity * 0.7,
          ],
        },
      });

      // Add contour lines if enabled
      if (showContours) {
        map.addLayer({
          id: 'task-heatmap-contour',
          type: 'heatmap',
          source: 'task-heatmap',
          paint: {
            'heatmap-weight': getWeightExpression() as any,
            'heatmap-intensity': intensity * 0.5,
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'transparent',
              0.3, 'rgba(255,255,255,0.1)',
              0.31, 'transparent',
              0.5, 'rgba(255,255,255,0.15)',
              0.51, 'transparent',
              0.7, 'rgba(255,255,255,0.2)',
              0.71, 'transparent',
              0.9, 'rgba(255,255,255,0.25)',
              0.91, 'transparent',
            ],
            'heatmap-radius': radius * 1.2,
            'heatmap-opacity': 0.8,
          },
        });
      }

      // Add hotspot circles at high zoom
      if (showHotspots) {
        // Pulse ring (animated via CSS)
        map.addLayer({
          id: 'task-hotspot-pulse',
          type: 'circle',
          source: 'task-heatmap',
          minzoom: 11,
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              11, 8,
              14, 16,
            ],
            'circle-color': 'transparent',
            'circle-stroke-width': [
              'case',
              ['==', ['get', 'urgency'], 1], 3,
              2,
            ],
            'circle-stroke-color': [
              'case',
              ['==', ['get', 'urgency'], 1],
              COLOR_SCHEMES[colorScheme].colors[4],
              COLOR_SCHEMES[colorScheme].colors[3],
            ],
            'circle-stroke-opacity': animatePulse ? [
              'interpolate',
              ['linear'],
              ['zoom'],
              11, 0,
              13, 0.5,
            ] : 0.5,
          },
        });

        // Core circles
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
              12, 5,
              15, 10,
            ],
            'circle-color': [
              'case',
              ['==', ['get', 'urgency'], 1],
              COLOR_SCHEMES[colorScheme].colors[5],
              COLOR_SCHEMES[colorScheme].colors[4],
            ],
            'circle-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              12, 0,
              13, 0.9,
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-opacity': 0.9,
          },
        });

        // Budget labels at very high zoom
        map.addLayer({
          id: 'task-hotspot-labels',
          type: 'symbol',
          source: 'task-heatmap',
          minzoom: 14,
          layout: {
            'text-field': ['concat', '$', ['to-string', ['get', 'budget']]],
            'text-size': 11,
            'text-offset': [0, 1.8],
            'text-anchor': 'top',
            'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': 'rgba(0,0,0,0.75)',
            'text-halo-width': 1.5,
            'text-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              14, 0,
              15, 1,
            ],
          },
        });
      }
    };

    const removeHeatmapLayer = () => {
      const layerIds = [
        'task-heatmap-layer',
        'task-heatmap-glow',
        'task-heatmap-contour',
        'task-hotspot-circles',
        'task-hotspot-pulse',
        'task-hotspot-labels',
      ];
      layerIds.forEach((layerId) => {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
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

    return () => {};
  }, [map, filteredTasks, isEnabled, intensity, radius, opacity, colorScheme, viewMode, getColorRamp, getWeightExpression, showHotspots, showContours, animatePulse]);

  const ModeIcon = VIEW_MODES[viewMode].icon;

  return (
    <div className={cn('relative', className)}>
      {/* Toggle Button */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant={isEnabled ? 'default' : 'outline'}
          size="sm"
          onClick={() => onToggle?.(!isEnabled)}
          className={cn(
            'gap-2 transition-all duration-300 shadow-lg',
            isEnabled && `bg-gradient-to-r ${COLOR_SCHEMES[colorScheme].gradient} hover:opacity-90 border-0 text-white`
          )}
        >
          <AnimatePresence mode="wait">
            {isEnabled ? (
              <motion.div
                key="enabled"
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                <Flame className="h-4 w-4" />
              </motion.div>
            ) : (
              <motion.div
                key="disabled"
                initial={{ rotate: 180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -180, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2"
              >
                <EyeOff className="h-4 w-4" />
                <Flame className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="font-medium">Heatmap</span>
          {isEnabled && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <Badge variant="secondary" className="ml-1 text-xs bg-white/25 text-white border-0">
                {stats.count}
              </Badge>
            </motion.div>
          )}
        </Button>
      </motion.div>

      {/* Settings Toggle */}
      {isEnabled && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-block ml-1"
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary/10"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings2 className={cn('h-4 w-4 transition-transform duration-500', showSettings && 'rotate-[360deg]')} />
          </Button>
        </motion.div>
      )}

      {/* Settings Panel */}
      <AnimatePresence>
        {isEnabled && showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute top-full left-0 mt-2 z-50"
          >
            <Card className="w-[340px] bg-card/95 backdrop-blur-xl shadow-2xl border-border/50 overflow-hidden">
              {/* Gradient Header */}
              <div className={cn('h-1 bg-gradient-to-r', COLOR_SCHEMES[colorScheme].gradient)} />
              
              <CardContent className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <span className="text-lg">{COLOR_SCHEMES[colorScheme].icon}</span>
                    Heatmap Controls
                  </h4>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs font-mono">
                      {stats.count} pts
                    </Badge>
                  </div>
                </div>

                {/* View Mode Tabs */}
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="w-full">
                  <TabsList className="grid grid-cols-3 h-9">
                    {(Object.keys(VIEW_MODES) as ViewMode[]).map((mode) => {
                      const Icon = VIEW_MODES[mode].icon;
                      return (
                        <TabsTrigger key={mode} value={mode} className="text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                          <Icon className="h-3 w-3" />
                          {VIEW_MODES[mode].label}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { icon: MapPin, value: stats.count, label: 'Tasks', color: 'text-blue-500' },
                    { icon: TrendingUp, value: `$${stats.avgBudget.toFixed(0)}`, label: 'Avg', color: 'text-green-500' },
                    { icon: Zap, value: stats.urgentCount, label: 'Urgent', color: 'text-yellow-500' },
                    { icon: BarChart3, value: `$${(stats.totalBudget / 1000).toFixed(1)}k`, label: 'Total', color: 'text-purple-500' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-muted/40 rounded-lg p-2 text-center hover:bg-muted/60 transition-colors"
                    >
                      <stat.icon className={cn('h-3.5 w-3.5 mx-auto mb-0.5', stat.color)} />
                      <p className="text-xs font-bold">{stat.value}</p>
                      <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Time Filter Pills */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> Time Range
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {(Object.keys(TIME_FILTERS) as TimeFilter[]).map((filter) => (
                      <Button
                        key={filter}
                        size="sm"
                        variant={timeFilter === filter ? 'default' : 'outline'}
                        className={cn('h-7 text-xs px-2.5', timeFilter === filter && 'shadow-md')}
                        onClick={() => setTimeFilter(filter)}
                      >
                        {TIME_FILTERS[filter].short}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                {categories.length > 2 && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Target className="h-3 w-3" /> Category
                    </label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat} className="text-xs">
                            {cat === 'all' ? 'All Categories' : cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Color Scheme Grid */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Palette className="h-3 w-3" /> Color Theme
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(Object.keys(COLOR_SCHEMES) as ColorScheme[]).map((scheme) => (
                      <motion.button
                        key={scheme}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setColorScheme(scheme)}
                        className={cn(
                          'relative flex flex-col items-center p-1.5 rounded-lg border-2 transition-all',
                          colorScheme === scheme
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-transparent bg-muted/30 hover:bg-muted/50'
                        )}
                      >
                        <span className="text-base">{COLOR_SCHEMES[scheme].icon}</span>
                        <span className="text-[9px] mt-0.5 font-medium">{COLOR_SCHEMES[scheme].name}</span>
                        {colorScheme === scheme && (
                          <motion.div
                            layoutId="scheme-indicator"
                            className="absolute inset-0 rounded-lg border-2 border-primary"
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Presets */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" /> Quick Presets
                  </label>
                  <div className="flex gap-1.5">
                    {(Object.keys(PRESETS) as Preset[]).map((preset) => (
                      <Button
                        key={preset}
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs flex-1"
                        onClick={() => applyPreset(preset)}
                      >
                        {PRESETS[preset].name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Sliders */}
                <div className="space-y-3 pt-2 border-t border-border/50">
                  {[
                    { label: 'Intensity', value: intensity, setValue: setIntensity, min: 0.5, max: 3, step: 0.1, format: (v: number) => `${v.toFixed(1)}x` },
                    { label: 'Radius', value: radius, setValue: setRadius, min: 10, max: 60, step: 2, format: (v: number) => `${v}px` },
                    { label: 'Opacity', value: opacity, setValue: setOpacity, min: 0.3, max: 1, step: 0.05, format: (v: number) => `${Math.round(v * 100)}%` },
                  ].map((slider) => (
                    <div key={slider.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{slider.label}</span>
                        <span className="font-mono text-foreground">{slider.format(slider.value)}</span>
                      </div>
                      <Slider
                        value={[slider.value]}
                        onValueChange={([v]) => slider.setValue(v)}
                        min={slider.min}
                        max={slider.max}
                        step={slider.step}
                        className="py-0.5"
                      />
                    </div>
                  ))}
                </div>

                {/* Toggle Options */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                  {[
                    { label: 'Hotspots', value: showHotspots, toggle: () => setShowHotspots(!showHotspots) },
                    { label: 'Contours', value: showContours, toggle: () => setShowContours(!showContours) },
                    { label: 'Animate', value: animatePulse, toggle: () => setAnimatePulse(!animatePulse) },
                  ].map((opt) => (
                    <Button
                      key={opt.label}
                      size="sm"
                      variant={opt.value ? 'default' : 'outline'}
                      className="h-7 text-xs gap-1"
                      onClick={opt.toggle}
                    >
                      {opt.value ? '✓' : '○'} {opt.label}
                    </Button>
                  ))}
                </div>

                {/* Dynamic Legend */}
                <div className="pt-3 border-t border-border/50">
                  <p className="text-[10px] text-muted-foreground mb-1.5 flex items-center justify-between">
                    <span>Density Legend</span>
                    <span className="font-mono">{VIEW_MODES[viewMode].description}</span>
                  </p>
                  <div
                    className="h-3 rounded-full overflow-hidden shadow-inner"
                    style={{
                      background: `linear-gradient(to right, ${COLOR_SCHEMES[colorScheme].colors.slice(1).join(', ')})`,
                    }}
                  />
                  <div className="flex justify-between text-[9px] text-muted-foreground mt-1 font-medium">
                    <span>Low</span>
                    <span>Medium</span>
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
