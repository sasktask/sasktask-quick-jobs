import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  MapPin, 
  DollarSign, 
  Clock, 
  X, 
  Navigation, 
  Crosshair, 
  Layers,
  Route,
  Sparkles,
  Zap,
  Compass,
  Fullscreen,
  Sun,
  Moon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { timeEstimateLabels, TimeEstimate } from '@/lib/categories';
import { MapRoutePanel } from '@/components/map/MapRoutePanel';
import { MapDrawSelection } from '@/components/map/MapDrawSelection';
import { MapExplorerPanel } from '@/components/map/MapExplorerPanel';
import { MapTaskPreview } from '@/components/map/MapTaskPreview';
import { MapWeatherWidget } from '@/components/map/MapWeatherWidget';
import { MapQuickActions } from '@/components/map/MapQuickActions';
import { MapStatsOverlay } from '@/components/map/MapStatsOverlay';
import { motion, AnimatePresence } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  description: string;
  location: string;
  pay_amount: number;
  category: string;
  latitude?: number;
  longitude?: number;
  estimated_duration?: number;
  priority?: string;
  created_at?: string;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface RouteGeometry {
  geometry?: GeoJSON.LineString;
}

interface TaskClusterMapProps {
  tasks: Task[];
  mapboxToken: string;
  isLoading?: boolean;
  userLocation?: UserLocation | null;
  radiusKm?: number;
  showHeatmap?: boolean;
  recentlyAddedIds?: string[];
  onTaskSelect?: (task: Task | null) => void;
  isConnected?: boolean;
}

const SASKATCHEWAN_CENTER: [number, number] = [-106.4509, 52.9399];

// Cluster paint with animations
const clusterPaint = {
  'circle-color': [
    'step',
    ['get', 'point_count'],
    '#8b5cf6', // Purple for small clusters
    10, '#f59e0b', // Amber for medium
    30, '#ef4444'  // Red for large
  ],
  'circle-radius': [
    'step',
    ['get', 'point_count'],
    20, 10, 30, 30, 40
  ],
  'circle-stroke-width': 3,
  'circle-stroke-color': '#ffffff',
  'circle-opacity': 0.9,
};

export function TaskClusterMap({ 
  tasks, 
  mapboxToken, 
  isLoading, 
  userLocation, 
  radiusKm = 50,
  showHeatmap = false,
  recentlyAddedIds = [],
  onTaskSelect,
  isConnected = false,
}: TaskClusterMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const taskMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const [showExplorer, setShowExplorer] = useState(false);
  const [hoveredCluster, setHoveredCluster] = useState<{ count: number; x: number; y: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectionBounds, setSelectionBounds] = useState<[number, number, number, number] | null>(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');
  const [is3DEnabled, setIs3DEnabled] = useState(false);
  const [savedTasks, setSavedTasks] = useState<string[]>([]);
  const navigate = useNavigate();

  const getTimeEstimate = (duration: number | undefined): TimeEstimate => {
    if (!duration || duration <= 0.5) return "quick";
    if (duration <= 2) return "short";
    if (duration <= 4) return "medium";
    return "long";
  };

  const createCircleGeoJSON = useCallback((center: [number, number], radiusKm: number) => {
    const points = 64;
    const coords: [number, number][] = [];
    const distanceX = radiusKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
    const distanceY = radiusKm / 110.574;

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      coords.push([center[0] + distanceX * Math.cos(theta), center[1] + distanceY * Math.sin(theta)]);
    }
    coords.push(coords[0]);

    return {
      type: 'Feature' as const,
      geometry: { type: 'Polygon' as const, coordinates: [coords] },
      properties: {},
    };
  }, []);

  const centerOnUserLocation = useCallback(() => {
    if (map.current && userLocation) {
      map.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 12,
        duration: 1500,
        essential: true
      });
    }
  }, [userLocation]);

  const handleZoomIn = useCallback(() => {
    if (map.current) {
      map.current.zoomIn({ duration: 300 });
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (map.current) {
      map.current.zoomOut({ duration: 300 });
    }
  }, []);

  const handleResetView = useCallback(() => {
    if (map.current) {
      map.current.flyTo({
        center: userLocation ? [userLocation.longitude, userLocation.latitude] : SASKATCHEWAN_CENTER,
        zoom: userLocation ? 11 : 5,
        pitch: 0,
        bearing: 0,
        duration: 1000,
      });
    }
  }, [userLocation]);

  const handleStyleChange = useCallback((style: string) => {
    if (map.current) {
      setMapStyle(style);
      map.current.setStyle(style);
    }
  }, []);

  const handleLocationSelect = useCallback((lat: number, lng: number, zoom?: number) => {
    if (map.current) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: zoom || 14,
        duration: 1000,
      });
    }
  }, []);

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    onTaskSelect?.(task);
    
    // Fly to task location
    if (map.current && task.latitude && task.longitude) {
      map.current.flyTo({
        center: [task.longitude, task.latitude],
        zoom: 14,
        duration: 1000,
      });
    }
  }, [onTaskSelect]);

  const handleRouteCalculated = useCallback((route: RouteGeometry | null, mode: string) => {
    if (!map.current || !mapLoaded) return;

    // Remove existing route layer
    if (map.current.getLayer('route-line')) map.current.removeLayer('route-line');
    if (map.current.getSource('route')) map.current.removeSource('route');

    if (route?.geometry) {
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: route.geometry,
          properties: {},
        },
      });

      map.current.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': mode === 'driving' ? '#3b82f6' : mode === 'cycling' ? '#22c55e' : '#f59e0b',
          'line-width': 5,
          'line-opacity': 0.8,
        },
      });
    }
  }, [mapLoaded]);

  const toggleSaveTask = useCallback((taskId: string) => {
    setSavedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  }, []);

  // Calculate distance for selected task
  const getTaskDistance = useCallback((task: Task) => {
    if (!userLocation || !task.latitude || !task.longitude) return undefined;
    
    const R = 6371;
    const dLat = (task.latitude - userLocation.latitude) * Math.PI / 180;
    const dLon = (task.longitude - userLocation.longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(userLocation.latitude * Math.PI / 180) * Math.cos(task.latitude * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, [userLocation]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: userLocation ? [userLocation.longitude, userLocation.latitude] : SASKATCHEWAN_CENTER,
      zoom: userLocation ? 11 : 5,
      pitch: 0,
      bearing: 0,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    map.current.on('load', () => setMapLoaded(true));

    return () => {
      userMarkerRef.current?.remove();
      taskMarkersRef.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Add clustering and heatmap layers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const mapInstance = map.current;
    const tasksWithCoords = tasks.filter(t => t.latitude && t.longitude);

    // Remove existing sources/layers
    ['clusters', 'cluster-count', 'unclustered-point', 'task-heatmap', 'unclustered-glow'].forEach(id => {
      if (mapInstance.getLayer(id)) mapInstance.removeLayer(id);
    });
    if (mapInstance.getSource('tasks')) mapInstance.removeSource('tasks');

    // Clear old individual markers
    taskMarkersRef.current.forEach(marker => marker.remove());
    taskMarkersRef.current.clear();

    if (tasksWithCoords.length === 0) return;

    // Create GeoJSON from tasks
    const geojson = {
      type: 'FeatureCollection' as const,
      features: tasksWithCoords.map(task => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [task.longitude!, task.latitude!] },
        properties: { 
          ...task,
          isNew: recentlyAddedIds.includes(task.id),
          isUrgent: task.priority === 'urgent',
        }
      }))
    };

    mapInstance.addSource('tasks', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    if (showHeatmap) {
      // Enhanced heatmap layer
      mapInstance.addLayer({
        id: 'task-heatmap',
        type: 'heatmap',
        source: 'tasks',
        maxzoom: 15,
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'pay_amount'], 0, 0, 500, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(139, 92, 246, 0)',
            0.2, 'rgba(139, 92, 246, 0.4)',
            0.4, 'rgba(168, 85, 247, 0.6)',
            0.6, 'rgba(217, 70, 239, 0.7)',
            0.8, 'rgba(236, 72, 153, 0.8)',
            1, 'rgba(239, 68, 68, 0.9)'
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 4, 15, 30],
          'heatmap-opacity': 0.8
        }
      });
    } else {
      // Animated cluster circles
      mapInstance.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'tasks',
        filter: ['has', 'point_count'],
        paint: clusterPaint as any,
      });

      // Cluster count labels
      mapInstance.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'tasks',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
          'text-size': 14
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // Glow effect for unclustered points
      mapInstance.addLayer({
        id: 'unclustered-glow',
        type: 'circle',
        source: 'tasks',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': 20,
          'circle-color': [
            'case',
            ['==', ['get', 'isUrgent'], true], '#ef4444',
            ['==', ['get', 'isNew'], true], '#22c55e',
            '#8b5cf6'
          ],
          'circle-opacity': 0.3,
          'circle-blur': 1
        }
      });

      // Individual task points
      mapInstance.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'tasks',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'case',
            ['==', ['get', 'isUrgent'], true], '#ef4444',
            ['==', ['get', 'isNew'], true], '#22c55e',
            '#8b5cf6'
          ],
          'circle-radius': 10,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Click handlers
      mapInstance.on('click', 'clusters', (e) => {
        const features = mapInstance.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties?.cluster_id;
        (mapInstance.getSource('tasks') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          mapInstance.easeTo({
            center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
            zoom: zoom!,
            duration: 500
          });
        });
      });

      mapInstance.on('click', 'unclustered-point', (e) => {
        const props = e.features?.[0]?.properties;
        if (props) {
          handleTaskClick({
            id: props.id,
            title: props.title,
            description: props.description,
            location: props.location,
            pay_amount: props.pay_amount,
            category: props.category,
            latitude: props.latitude,
            longitude: props.longitude,
            estimated_duration: props.estimated_duration,
            priority: props.priority,
            created_at: props.created_at,
          });
        }
      });

      // Hover effects
      mapInstance.on('mouseenter', 'clusters', (e) => {
        mapInstance.getCanvas().style.cursor = 'pointer';
        const count = e.features?.[0]?.properties?.point_count || 0;
        setHoveredCluster({ count, x: e.point.x, y: e.point.y });
      });

      mapInstance.on('mouseleave', 'clusters', () => {
        mapInstance.getCanvas().style.cursor = '';
        setHoveredCluster(null);
      });

      mapInstance.on('mouseenter', 'unclustered-point', () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
      });

      mapInstance.on('mouseleave', 'unclustered-point', () => {
        mapInstance.getCanvas().style.cursor = '';
      });
    }
  }, [tasks, mapLoaded, showHeatmap, recentlyAddedIds, handleTaskClick]);

  // User location and radius circle
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLocation) return;

    const mapInstance = map.current;

    userMarkerRef.current?.remove();
    
    // Animated user location marker
    const el = document.createElement('div');
    el.className = 'user-location-marker';
    el.innerHTML = `
      <div class="relative">
        <div class="absolute -inset-4 rounded-full bg-blue-500/20 animate-ping"></div>
        <div class="absolute -inset-2 rounded-full bg-blue-500/30 animate-pulse"></div>
        <div class="relative w-5 h-5 rounded-full bg-blue-500 border-3 border-white shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 rounded-full bg-white"></div>
        </div>
      </div>
    `;
    
    userMarkerRef.current = new mapboxgl.Marker(el)
      .setLngLat([userLocation.longitude, userLocation.latitude])
      .addTo(mapInstance);

    // Radius circle
    const circleData = createCircleGeoJSON([userLocation.longitude, userLocation.latitude], radiusKm);

    if (mapInstance.getSource('radius-circle')) {
      (mapInstance.getSource('radius-circle') as mapboxgl.GeoJSONSource).setData(circleData);
    } else {
      mapInstance.addSource('radius-circle', { type: 'geojson', data: circleData });
      
      // Gradient fill for radius
      mapInstance.addLayer({
        id: 'radius-circle-fill',
        type: 'fill',
        source: 'radius-circle',
        paint: { 
          'fill-color': '#3b82f6', 
          'fill-opacity': 0.08 
        }
      }, 'clusters');
      
      mapInstance.addLayer({
        id: 'radius-circle-line',
        type: 'line',
        source: 'radius-circle',
        paint: { 
          'line-color': '#3b82f6', 
          'line-width': 2, 
          'line-dasharray': [4, 2],
          'line-opacity': 0.6
        }
      }, 'clusters');
    }
  }, [userLocation, radiusKm, mapLoaded, createCircleGeoJSON]);

  // Filter tasks by selection bounds
  const filteredBySelection = selectionBounds
    ? tasks.filter(t => {
        if (!t.latitude || !t.longitude) return false;
        return (
          t.longitude >= selectionBounds[0] &&
          t.latitude >= selectionBounds[1] &&
          t.longitude <= selectionBounds[2] &&
          t.latitude <= selectionBounds[3]
        );
      })
    : null;

  if (isLoading) {
    return (
      <div className="w-full h-[600px] rounded-xl bg-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="w-full h-[600px] rounded-xl bg-muted flex items-center justify-center">
        <div className="text-center p-6">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Map Loading...</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            The map is loading. If it doesn't appear, please refresh the page.
          </p>
          <Loader2 className="h-6 w-6 mx-auto mt-4 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden border border-border shadow-lg">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Draw Selection Controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <MapDrawSelection
          map={map.current}
          isActive={isDrawing}
          onActiveChange={setIsDrawing}
          onSelectionComplete={setSelectionBounds}
        />
      </div>

      {/* Cluster hover tooltip */}
      <AnimatePresence>
        {hoveredCluster && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-20 bg-background/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none border border-border"
            style={{ left: hoveredCluster.x + 10, top: hoveredCluster.y - 30 }}
          >
            <span className="font-semibold">{hoveredCluster.count} tasks</span>
            <p className="text-xs text-muted-foreground">Click to expand</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection results */}
      <AnimatePresence>
        {filteredBySelection && filteredBySelection.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-10"
          >
            <Badge className="bg-primary shadow-lg gap-1">
              <Sparkles className="h-3 w-3" />
              {filteredBySelection.length} tasks in selection
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Overlay - Top Left */}
      <MapStatsOverlay
        tasks={tasks}
        radiusKm={radiusKm}
        isConnected={isConnected}
        className="absolute top-4 left-4 z-10 w-80"
      />

      {/* Weather Widget - Bottom Left */}
      <MapWeatherWidget
        latitude={userLocation?.latitude}
        longitude={userLocation?.longitude}
        className="absolute bottom-24 left-4 z-10"
      />

      {/* Quick Actions - Right Side */}
      <MapQuickActions
        onCenterLocation={centerOnUserLocation}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        onToggleExplorer={() => setShowExplorer(true)}
        onStyleChange={handleStyleChange}
        currentStyle={mapStyle}
        hasUserLocation={!!userLocation}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
      />

      {/* Recently Added Badge */}
      {recentlyAddedIds.length > 0 && (
        <Badge className="absolute top-4 right-20 bg-green-500/90 text-white backdrop-blur-sm shadow-lg animate-pulse z-10">
          <Sparkles className="h-3 w-3 mr-1" />
          {recentlyAddedIds.length} new
        </Badge>
      )}

      {/* Route Panel */}
      {showRoutePanel && selectedTask && (
        <MapRoutePanel
          task={selectedTask}
          userLocation={userLocation}
          mapboxToken={mapboxToken}
          onRouteCalculated={handleRouteCalculated}
          onClose={() => {
            setShowRoutePanel(false);
            // Remove route from map
            if (map.current?.getLayer('route-line')) map.current.removeLayer('route-line');
            if (map.current?.getSource('route')) map.current.removeSource('route');
          }}
        />
      )}

      {/* Enhanced Task Preview */}
      <AnimatePresence>
        {selectedTask && !showRoutePanel && (
          <MapTaskPreview
            task={selectedTask}
            distance={getTaskDistance(selectedTask)}
            userLocation={userLocation}
            onClose={() => setSelectedTask(null)}
            onShowRoute={() => setShowRoutePanel(true)}
            isSaved={savedTasks.includes(selectedTask.id)}
            onToggleSave={() => toggleSaveTask(selectedTask.id)}
          />
        )}
      </AnimatePresence>

      {/* Explorer Panel */}
      <MapExplorerPanel
        tasks={tasks}
        userLocation={userLocation}
        onTaskSelect={handleTaskClick}
        onLocationSelect={handleLocationSelect}
        isOpen={showExplorer}
        onOpenChange={setShowExplorer}
      />
    </div>
  );
}
