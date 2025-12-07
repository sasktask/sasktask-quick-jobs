import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, DollarSign, Clock, X, Navigation, Crosshair, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { timeEstimateLabels, TimeEstimate } from '@/lib/categories';

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
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface TaskClusterMapProps {
  tasks: Task[];
  mapboxToken: string;
  isLoading?: boolean;
  userLocation?: UserLocation | null;
  radiusKm?: number;
  showHeatmap?: boolean;
}

const SASKATCHEWAN_CENTER: [number, number] = [-106.4509, 52.9399];

export function TaskClusterMap({ 
  tasks, 
  mapboxToken, 
  isLoading, 
  userLocation, 
  radiusKm = 50,
  showHeatmap = false 
}: TaskClusterMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [hoveredCluster, setHoveredCluster] = useState<{ count: number; x: number; y: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
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
        zoom: 11,
        duration: 1000
      });
    }
  }, [userLocation]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: userLocation ? [userLocation.longitude, userLocation.latitude] : SASKATCHEWAN_CENTER,
      zoom: userLocation ? 10 : 5,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    map.current.on('load', () => setMapLoaded(true));

    return () => {
      userMarkerRef.current?.remove();
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Add clustering and heatmap layers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const mapInstance = map.current;
    const tasksWithCoords = tasks.filter(t => t.latitude && t.longitude);

    // Remove existing sources/layers
    ['clusters', 'cluster-count', 'unclustered-point', 'task-heatmap'].forEach(id => {
      if (mapInstance.getLayer(id)) mapInstance.removeLayer(id);
    });
    if (mapInstance.getSource('tasks')) mapInstance.removeSource('tasks');

    if (tasksWithCoords.length === 0) return;

    // Create GeoJSON from tasks
    const geojson = {
      type: 'FeatureCollection' as const,
      features: tasksWithCoords.map(task => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [task.longitude!, task.latitude!] },
        properties: { ...task }
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
      // Heatmap layer
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
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 15, 20],
          'heatmap-opacity': 0.7
        }
      });
    } else {
      // Cluster circles
      mapInstance.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'tasks',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 10, '#f1f075', 30, '#f28cb1'],
          'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40]
        }
      });

      // Cluster count labels
      mapInstance.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'tasks',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        }
      });

      // Individual task points
      mapInstance.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'tasks',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': 'hsl(var(--primary))',
          'circle-radius': 10,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
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
            zoom: zoom!
          });
        });
      });

      mapInstance.on('click', 'unclustered-point', (e) => {
        const props = e.features?.[0]?.properties;
        if (props) {
          setSelectedTask({
            id: props.id,
            title: props.title,
            description: props.description,
            location: props.location,
            pay_amount: props.pay_amount,
            category: props.category,
            latitude: props.latitude,
            longitude: props.longitude,
            estimated_duration: props.estimated_duration,
            priority: props.priority
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
  }, [tasks, mapLoaded, showHeatmap]);

  // User location and radius circle
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLocation) return;

    const mapInstance = map.current;

    userMarkerRef.current?.remove();
    const el = document.createElement('div');
    el.innerHTML = `
      <div class="relative">
        <div class="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 rounded-full bg-white"></div>
        </div>
      </div>
    `;
    userMarkerRef.current = new mapboxgl.Marker(el)
      .setLngLat([userLocation.longitude, userLocation.latitude])
      .addTo(mapInstance);

    const circleData = createCircleGeoJSON([userLocation.longitude, userLocation.latitude], radiusKm);

    if (mapInstance.getSource('radius-circle')) {
      (mapInstance.getSource('radius-circle') as mapboxgl.GeoJSONSource).setData(circleData);
    } else {
      mapInstance.addSource('radius-circle', { type: 'geojson', data: circleData });
      mapInstance.addLayer({
        id: 'radius-circle-fill',
        type: 'fill',
        source: 'radius-circle',
        paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.1 }
      });
      mapInstance.addLayer({
        id: 'radius-circle-line',
        type: 'line',
        source: 'radius-circle',
        paint: { 'line-color': '#3b82f6', 'line-width': 2, 'line-dasharray': [2, 2] }
      });
    }
  }, [userLocation, radiusKm, mapLoaded, createCircleGeoJSON]);

  if (isLoading) {
    return (
      <div className="w-full h-[500px] rounded-xl bg-muted flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="w-full h-[500px] rounded-xl bg-muted flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Map Not Available</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-border">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Cluster hover tooltip */}
      {hoveredCluster && (
        <div 
          className="absolute z-20 bg-background/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none"
          style={{ left: hoveredCluster.x + 10, top: hoveredCluster.y - 30 }}
        >
          <span className="font-semibold">{hoveredCluster.count} tasks</span>
        </div>
      )}

      {/* Info badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm shadow-lg">
          <Layers className="h-3 w-3 mr-1" />
          {tasks.filter(t => t.latitude && t.longitude).length} tasks
        </Badge>
        {userLocation && (
          <Badge variant="secondary" className="bg-blue-500/90 text-white backdrop-blur-sm shadow-lg">
            <Navigation className="h-3 w-3 mr-1" />
            {radiusKm}km radius
          </Badge>
        )}
      </div>

      {/* Center button */}
      {userLocation && (
        <div className="absolute top-4 right-24 z-10">
          <Button
            variant="secondary"
            size="sm"
            onClick={centerOnUserLocation}
            className="bg-background/90 backdrop-blur-sm shadow-lg gap-1"
          >
            <Crosshair className="h-4 w-4" />
            Center
          </Button>
        </div>
      )}

      {/* Selected task popup */}
      {selectedTask && (
        <div className="absolute bottom-4 left-4 right-4 z-10 max-w-md mx-auto">
          <Card className="bg-background/95 backdrop-blur-sm shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{selectedTask.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{selectedTask.location}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedTask(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{selectedTask.description}</p>
              
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Badge variant="default" className="bg-primary">
                  <DollarSign className="h-3 w-3 mr-1" />${selectedTask.pay_amount}
                </Badge>
                <Badge variant="secondary">{selectedTask.category}</Badge>
                {selectedTask.estimated_duration && (
                  <Badge variant="outline" className={timeEstimateLabels[getTimeEstimate(selectedTask.estimated_duration)].color}>
                    <Clock className="h-3 w-3 mr-1" />
                    {timeEstimateLabels[getTimeEstimate(selectedTask.estimated_duration)].label}
                  </Badge>
                )}
              </div>
              
              <Button className="w-full mt-4" onClick={() => navigate(`/task/${selectedTask.id}`)}>
                View Details
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}