import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PenTool, 
  Trash2, 
  Check,
  Square,
  Circle,
  Lasso
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import mapboxgl from 'mapbox-gl';

interface MapDrawSelectionProps {
  map: mapboxgl.Map | null;
  onSelectionComplete: (bounds: [number, number, number, number] | null) => void;
  isActive: boolean;
  onActiveChange: (active: boolean) => void;
}

type DrawMode = 'rectangle' | 'circle' | 'freehand';

export function MapDrawSelection({
  map,
  onSelectionComplete,
  isActive,
  onActiveChange,
}: MapDrawSelectionProps) {
  const [drawMode, setDrawMode] = useState<DrawMode>('rectangle');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const freehandPathRef = useRef<[number, number][]>([]);

  const clearSelection = useCallback(() => {
    if (!map) return;
    
    if (map.getLayer('selection-fill')) map.removeLayer('selection-fill');
    if (map.getLayer('selection-line')) map.removeLayer('selection-line');
    if (map.getSource('selection-area')) map.removeSource('selection-area');
    
    onSelectionComplete(null);
  }, [map, onSelectionComplete]);

  const drawRectangle = useCallback((start: [number, number], end: [number, number]) => {
    if (!map) return;

    const bounds: [number, number, number, number] = [
      Math.min(start[0], end[0]),
      Math.min(start[1], end[1]),
      Math.max(start[0], end[0]),
      Math.max(start[1], end[1]),
    ];

    const polygon = {
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [bounds[0], bounds[1]],
          [bounds[2], bounds[1]],
          [bounds[2], bounds[3]],
          [bounds[0], bounds[3]],
          [bounds[0], bounds[1]],
        ]],
      },
      properties: {},
    };

    if (map.getSource('selection-area')) {
      (map.getSource('selection-area') as mapboxgl.GeoJSONSource).setData(polygon);
    } else {
      map.addSource('selection-area', { type: 'geojson', data: polygon });
      
      map.addLayer({
        id: 'selection-fill',
        type: 'fill',
        source: 'selection-area',
        paint: {
          'fill-color': '#8b5cf6',
          'fill-opacity': 0.15,
        },
      });
      
      map.addLayer({
        id: 'selection-line',
        type: 'line',
        source: 'selection-area',
        paint: {
          'line-color': '#8b5cf6',
          'line-width': 2,
          'line-dasharray': [3, 2],
        },
      });
    }

    onSelectionComplete(bounds);
  }, [map, onSelectionComplete]);

  const handleMouseDown = useCallback((e: mapboxgl.MapMouseEvent) => {
    if (!isActive || !map) return;
    
    setIsDrawing(true);
    setStartPoint([e.lngLat.lng, e.lngLat.lat]);
    map.dragPan.disable();
    
    if (drawMode === 'freehand') {
      freehandPathRef.current = [[e.lngLat.lng, e.lngLat.lat]];
    }
  }, [isActive, map, drawMode]);

  const handleMouseMove = useCallback((e: mapboxgl.MapMouseEvent) => {
    if (!isDrawing || !startPoint || !map) return;
    
    if (drawMode === 'rectangle') {
      drawRectangle(startPoint, [e.lngLat.lng, e.lngLat.lat]);
    } else if (drawMode === 'freehand') {
      freehandPathRef.current.push([e.lngLat.lng, e.lngLat.lat]);
    }
  }, [isDrawing, startPoint, map, drawMode, drawRectangle]);

  const handleMouseUp = useCallback((e: mapboxgl.MapMouseEvent) => {
    if (!isDrawing || !map) return;
    
    setIsDrawing(false);
    map.dragPan.enable();
    
    if (drawMode === 'rectangle' && startPoint) {
      drawRectangle(startPoint, [e.lngLat.lng, e.lngLat.lat]);
    } else if (drawMode === 'freehand' && freehandPathRef.current.length > 2) {
      // Calculate bounding box from freehand path
      const lngs = freehandPathRef.current.map(p => p[0]);
      const lats = freehandPathRef.current.map(p => p[1]);
      const bounds: [number, number, number, number] = [
        Math.min(...lngs),
        Math.min(...lats),
        Math.max(...lngs),
        Math.max(...lats),
      ];
      onSelectionComplete(bounds);
    }
    
    setStartPoint(null);
    freehandPathRef.current = [];
  }, [isDrawing, map, drawMode, startPoint, drawRectangle, onSelectionComplete]);

  useEffect(() => {
    if (!map) return;

    if (isActive) {
      map.getCanvas().style.cursor = 'crosshair';
      map.on('mousedown', handleMouseDown);
      map.on('mousemove', handleMouseMove);
      map.on('mouseup', handleMouseUp);
    } else {
      map.getCanvas().style.cursor = '';
      map.off('mousedown', handleMouseDown);
      map.off('mousemove', handleMouseMove);
      map.off('mouseup', handleMouseUp);
    }

    return () => {
      if (map) {
        map.off('mousedown', handleMouseDown);
        map.off('mousemove', handleMouseMove);
        map.off('mouseup', handleMouseUp);
      }
    };
  }, [map, isActive, handleMouseDown, handleMouseMove, handleMouseUp]);

  const toggleDrawMode = () => {
    if (isActive) {
      onActiveChange(false);
      clearSelection();
    } else {
      onActiveChange(true);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isActive ? 'default' : 'outline'}
        size="sm"
        onClick={toggleDrawMode}
        className="gap-1.5"
      >
        <PenTool className="h-4 w-4" />
        {isActive ? 'Drawing' : 'Draw Area'}
      </Button>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="flex items-center gap-1 overflow-hidden"
          >
            <div className="flex bg-muted rounded-md p-0.5">
              <Button
                variant={drawMode === 'rectangle' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setDrawMode('rectangle')}
              >
                <Square className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={drawMode === 'freehand' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setDrawMode('freehand')}
              >
                <Lasso className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={clearSelection}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="default"
              size="icon"
              className="h-7 w-7"
              onClick={() => onActiveChange(false)}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {isDrawing && (
        <Badge variant="secondary" className="animate-pulse">
          Drawing...
        </Badge>
      )}
    </div>
  );
}
