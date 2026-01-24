import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Box, 
  Mountain, 
  Building2, 
  Layers, 
  RotateCw,
  Compass,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import mapboxgl from 'mapbox-gl';

interface Map3DControlsProps {
  map: mapboxgl.Map | null;
  className?: string;
}

export function Map3DControls({ map, className }: Map3DControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [is3DEnabled, setIs3DEnabled] = useState(false);
  const [showBuildings, setShowBuildings] = useState(true);
  const [showTerrain, setShowTerrain] = useState(true);
  const [pitch, setPitch] = useState(0);
  const [bearing, setBearing] = useState(0);
  const [exaggeration, setExaggeration] = useState(1.5);

  // Enable/disable 3D mode
  useEffect(() => {
    if (!map) return;

    const enable3D = () => {
      if (!map.isStyleLoaded()) {
        map.once('style.load', enable3D);
        return;
      }

      // Add terrain
      if (showTerrain) {
        if (!map.getSource('mapbox-dem')) {
          map.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14,
          });
        }
        map.setTerrain({ source: 'mapbox-dem', exaggeration });
      } else {
        map.setTerrain(null);
      }

      // Add 3D buildings
      if (showBuildings) {
        const layers = map.getStyle().layers;
        const labelLayerId = layers?.find(
          (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
        )?.id;

        if (!map.getLayer('3d-buildings')) {
          map.addLayer(
            {
              id: '3d-buildings',
              source: 'composite',
              'source-layer': 'building',
              filter: ['==', 'extrude', 'true'],
              type: 'fill-extrusion',
              minzoom: 14,
              paint: {
                'fill-extrusion-color': [
                  'interpolate',
                  ['linear'],
                  ['get', 'height'],
                  0, 'hsl(var(--muted))',
                  50, 'hsl(var(--muted-foreground))',
                  100, 'hsl(var(--foreground))',
                ],
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'min_height'],
                'fill-extrusion-opacity': 0.7,
              },
            },
            labelLayerId
          );
        }
      } else {
        if (map.getLayer('3d-buildings')) {
          map.removeLayer('3d-buildings');
        }
      }

      // Set pitch for 3D view
      map.easeTo({
        pitch: is3DEnabled ? pitch : 0,
        bearing: is3DEnabled ? bearing : 0,
        duration: 1000,
      });

      // Add sky layer for 3D effect
      if (is3DEnabled && !map.getLayer('sky')) {
        map.addLayer({
          id: 'sky',
          type: 'sky',
          paint: {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 90.0],
            'sky-atmosphere-sun-intensity': 15,
          },
        });
      } else if (!is3DEnabled && map.getLayer('sky')) {
        map.removeLayer('sky');
      }
    };

    const disable3D = () => {
      if (map.getLayer('3d-buildings')) {
        map.removeLayer('3d-buildings');
      }
      if (map.getLayer('sky')) {
        map.removeLayer('sky');
      }
      map.setTerrain(null);
      map.easeTo({ pitch: 0, bearing: 0, duration: 500 });
    };

    if (is3DEnabled) {
      enable3D();
    } else {
      disable3D();
    }
  }, [map, is3DEnabled, showBuildings, showTerrain, pitch, bearing, exaggeration]);

  // Update pitch/bearing when sliders change
  useEffect(() => {
    if (!map || !is3DEnabled) return;
    map.easeTo({ pitch, bearing, duration: 300 });
  }, [map, pitch, bearing, is3DEnabled]);

  // Reset view
  const resetView = useCallback(() => {
    setPitch(60);
    setBearing(0);
    setExaggeration(1.5);
    if (map) {
      map.easeTo({ pitch: 60, bearing: 0, duration: 500 });
    }
  }, [map]);

  // Rotate view
  const rotateView = useCallback(() => {
    const newBearing = (bearing + 45) % 360;
    setBearing(newBearing);
  }, [bearing]);

  return (
    <div className={cn('relative', className)}>
      {/* Toggle Button */}
      <Button
        variant={is3DEnabled ? 'default' : 'outline'}
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="gap-2"
      >
        <Box className="h-4 w-4" />
        3D View
        {isExpanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </Button>

      {/* Controls Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 z-50"
          >
            <Card className="w-72 bg-card/95 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    3D Controls
                  </span>
                  <Switch
                    checked={is3DEnabled}
                    onCheckedChange={setIs3DEnabled}
                  />
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Layer Toggles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      3D Buildings
                    </Label>
                    <Switch
                      checked={showBuildings}
                      onCheckedChange={setShowBuildings}
                      disabled={!is3DEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-sm">
                      <Mountain className="h-4 w-4 text-muted-foreground" />
                      Terrain
                    </Label>
                    <Switch
                      checked={showTerrain}
                      onCheckedChange={setShowTerrain}
                      disabled={!is3DEnabled}
                    />
                  </div>
                </div>

                {/* Sliders */}
                {is3DEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-3 border-t"
                  >
                    {/* Pitch Control */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Pitch (Tilt)</Label>
                        <span className="text-xs text-muted-foreground">{pitch}°</span>
                      </div>
                      <Slider
                        value={[pitch]}
                        onValueChange={([value]) => setPitch(value)}
                        min={0}
                        max={85}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    {/* Bearing Control */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Rotation</Label>
                        <span className="text-xs text-muted-foreground">{bearing}°</span>
                      </div>
                      <Slider
                        value={[bearing]}
                        onValueChange={([value]) => setBearing(value)}
                        min={0}
                        max={360}
                        step={15}
                        className="w-full"
                      />
                    </div>

                    {/* Terrain Exaggeration */}
                    {showTerrain && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Terrain Height</Label>
                          <span className="text-xs text-muted-foreground">{exaggeration.toFixed(1)}x</span>
                        </div>
                        <Slider
                          value={[exaggeration]}
                          onValueChange={([value]) => setExaggeration(value)}
                          min={0.5}
                          max={3}
                          step={0.25}
                          className="w-full"
                        />
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={rotateView}
                        className="flex-1 gap-1"
                      >
                        <RotateCw className="h-3 w-3" />
                        Rotate 45°
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetView}
                        className="flex-1 gap-1"
                      >
                        <Compass className="h-3 w-3" />
                        Reset
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Disabled State */}
                {!is3DEnabled && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Enable 3D view to access controls
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
