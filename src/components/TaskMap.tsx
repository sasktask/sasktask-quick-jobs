import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, DollarSign, Clock, X, Navigation } from 'lucide-react';
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

interface TaskMapProps {
  tasks: Task[];
  mapboxToken: string;
  isLoading?: boolean;
  userLocation?: UserLocation | null;
  radiusKm?: number;
}

// Saskatchewan center coordinates
const SASKATCHEWAN_CENTER: [number, number] = [-106.4509, 52.9399];

export function TaskMap({ tasks, mapboxToken, isLoading, userLocation, radiusKm = 50 }: TaskMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const navigate = useNavigate();

  const getTimeEstimate = (duration: number | undefined): TimeEstimate => {
    if (!duration || duration <= 0.5) return "quick";
    if (duration <= 2) return "short";
    if (duration <= 4) return "medium";
    return "long";
  };

  // Create a circle GeoJSON for the radius
  const createCircleGeoJSON = (center: [number, number], radiusKm: number) => {
    const points = 64;
    const coords: [number, number][] = [];
    const distanceX = radiusKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
    const distanceY = radiusKm / 110.574;

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      const x = distanceX * Math.cos(theta);
      const y = distanceY * Math.sin(theta);
      coords.push([center[0] + x, center[1] + y]);
    }
    coords.push(coords[0]); // Close the circle

    return {
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [coords],
      },
      properties: {},
    };
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: userLocation 
        ? [userLocation.longitude, userLocation.latitude] 
        : SASKATCHEWAN_CENTER,
      zoom: userLocation ? 10 : 5,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      userMarkerRef.current?.remove();
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Handle user location marker and radius circle
  useEffect(() => {
    if (!map.current || !userLocation) return;

    const mapInstance = map.current;

    // Wait for map style to load
    const addUserLocationLayer = () => {
      // Remove existing user marker
      userMarkerRef.current?.remove();

      // Add user location marker
      const el = document.createElement('div');
      el.innerHTML = `
        <div class="relative">
          <div class="w-6 h-6 rounded-full bg-blue-500 border-3 border-white shadow-lg flex items-center justify-center animate-pulse">
            <div class="w-2 h-2 rounded-full bg-white"></div>
          </div>
          <div class="absolute -inset-2 rounded-full bg-blue-500/20 animate-ping"></div>
        </div>
      `;

      userMarkerRef.current = new mapboxgl.Marker(el)
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .addTo(mapInstance);

      // Add or update radius circle
      const circleData = createCircleGeoJSON(
        [userLocation.longitude, userLocation.latitude],
        radiusKm
      );

      if (mapInstance.getSource('radius-circle')) {
        (mapInstance.getSource('radius-circle') as mapboxgl.GeoJSONSource).setData(circleData);
      } else {
        mapInstance.addSource('radius-circle', {
          type: 'geojson',
          data: circleData,
        });

        mapInstance.addLayer({
          id: 'radius-circle-fill',
          type: 'fill',
          source: 'radius-circle',
          paint: {
            'fill-color': '#3b82f6',
            'fill-opacity': 0.1,
          },
        });

        mapInstance.addLayer({
          id: 'radius-circle-line',
          type: 'line',
          source: 'radius-circle',
          paint: {
            'line-color': '#3b82f6',
            'line-width': 2,
            'line-dasharray': [2, 2],
          },
        });
      }
    };

    if (mapInstance.isStyleLoaded()) {
      addUserLocationLayer();
    } else {
      mapInstance.on('load', addUserLocationLayer);
    }
  }, [userLocation, radiusKm]);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for tasks with coordinates
    tasks.forEach(task => {
      if (task.latitude && task.longitude) {
        const el = document.createElement('div');
        el.className = 'task-marker';
        el.innerHTML = `
          <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `;
        
        el.addEventListener('click', () => {
          setSelectedTask(task);
        });

        const marker = new mapboxgl.Marker(el)
          .setLngLat([task.longitude, task.latitude])
          .addTo(map.current!);

        markersRef.current.push(marker);
      }
    });

    // Fit bounds to show all markers (including user location if available)
    const bounds = new mapboxgl.LngLatBounds();
    
    if (userLocation) {
      bounds.extend([userLocation.longitude, userLocation.latitude]);
    }
    
    tasks.forEach(task => {
      if (task.latitude && task.longitude) {
        bounds.extend([task.longitude, task.latitude]);
      }
    });
    
    if (!bounds.isEmpty() && (markersRef.current.length > 0 || userLocation)) {
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }, [tasks, userLocation]);

  if (isLoading) {
    return (
      <div className="w-full h-[500px] rounded-xl bg-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="w-full h-[500px] rounded-xl bg-muted flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Map Not Available</h3>
          <p className="text-muted-foreground">Map token not configured</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-border">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Info badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm shadow-lg">
          <MapPin className="h-3 w-3 mr-1" />
          {tasks.filter(t => t.latitude && t.longitude).length} tasks on map
        </Badge>
        {userLocation && (
          <Badge variant="secondary" className="bg-blue-500/90 text-white backdrop-blur-sm shadow-lg">
            <Navigation className="h-3 w-3 mr-1" />
            Your location • {radiusKm}km radius
          </Badge>
        )}
      </div>

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
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => setSelectedTask(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {selectedTask.description}
              </p>
              
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Badge variant="default" className="bg-primary">
                  <DollarSign className="h-3 w-3 mr-1" />
                  ${selectedTask.pay_amount}
                </Badge>
                <Badge variant="secondary">{selectedTask.category}</Badge>
                {selectedTask.estimated_duration && (
                  <Badge 
                    variant="outline" 
                    className={timeEstimateLabels[getTimeEstimate(selectedTask.estimated_duration)].color}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {timeEstimateLabels[getTimeEstimate(selectedTask.estimated_duration)].label}
                  </Badge>
                )}
              </div>
              
              <Button 
                className="w-full mt-4" 
                onClick={() => navigate(`/task/${selectedTask.id}`)}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
