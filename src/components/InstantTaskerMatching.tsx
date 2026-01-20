import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, 
  Clock, 
  Star, 
  CheckCircle, 
  Zap, 
  Navigation,
  User,
  Shield
} from "lucide-react";
import { calculateDistance } from "@/lib/distance";
import { motion, AnimatePresence } from "framer-motion";

interface NearbyTasker {
  id: string;
  full_name: string;
  avatar_url: string | null;
  rating: number | null;
  total_reviews: number | null;
  completed_tasks: number | null;
  hourly_rate: number | null;
  skills: string[] | null;
  latitude: number | null;
  longitude: number | null;
  is_online: boolean | null;
  availability_status: string | null;
  trust_score: number | null;
  distance: number;
  estimatedArrival: string;
}

interface InstantTaskerMatchingProps {
  taskCategory: string;
  taskLocation: { latitude: number; longitude: number } | null;
  onSelectTasker: (taskerId: string) => void;
  isUrgent?: boolean;
}

const AVERAGE_SPEED_KMH = 40; // Average urban driving speed

export const InstantTaskerMatching = ({
  taskCategory,
  taskLocation,
  onSelectTasker,
  isUrgent = false
}: InstantTaskerMatchingProps) => {
  const [nearbyTaskers, setNearbyTaskers] = useState<NearbyTasker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchRadius, setSearchRadius] = useState(10); // Start with 10km
  const [expandingSearch, setExpandingSearch] = useState(false);

  useEffect(() => {
    if (taskLocation) {
      fetchNearbyTaskers();
    }
  }, [taskLocation, taskCategory, searchRadius]);

  const calculateETA = (distanceKm: number): string => {
    const minutes = Math.round((distanceKm / AVERAGE_SPEED_KMH) * 60);
    if (minutes < 1) return "< 1 min";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const fetchNearbyTaskers = async () => {
    if (!taskLocation) return;
    
    setIsLoading(true);
    try {
      // Fetch task doers who are online or available
      const { data: taskers, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          avatar_url,
          rating,
          total_reviews,
          completed_tasks,
          hourly_rate,
          skills,
          latitude,
          longitude,
          is_online,
          availability_status,
          trust_score
        `)
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .or("is_online.eq.true,availability_status.eq.available");

      if (error) throw error;

      // Filter to only task doers by checking user_roles
      const { data: taskDoerRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", ["task_doer", "admin"]);

      const taskDoerIds = new Set(taskDoerRoles?.map(r => r.user_id) || []);

      // Calculate distance and filter
      const taskersWithDistance = (taskers || [])
        .filter(t => taskDoerIds.has(t.id) && t.latitude && t.longitude)
        .map(tasker => {
          const distance = calculateDistance(
            taskLocation.latitude,
            taskLocation.longitude,
            tasker.latitude!,
            tasker.longitude!
          );
          return {
            ...tasker,
            distance,
            estimatedArrival: calculateETA(distance)
          };
        })
        .filter(t => t.distance <= searchRadius)
        .sort((a, b) => {
          // Sort by: online status first, then distance
          if (a.is_online && !b.is_online) return -1;
          if (!a.is_online && b.is_online) return 1;
          return a.distance - b.distance;
        })
        .slice(0, 10);

      setNearbyTaskers(taskersWithDistance);

      // If no taskers found and radius < 100km, expand search
      if (taskersWithDistance.length === 0 && searchRadius < 100) {
        setExpandingSearch(true);
        setTimeout(() => {
          setSearchRadius(prev => Math.min(prev + 20, 100));
          setExpandingSearch(false);
        }, 1500);
      }
    } catch (error) {
      console.error("Error fetching nearby taskers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!taskLocation) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-muted-foreground">
          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Enter a location to find nearby available taskers</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isUrgent ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/20" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {isUrgent ? (
              <>
                <Zap className="h-5 w-5 text-orange-500" />
                Instant Match - Available Now
              </>
            ) : (
              <>
                <Navigation className="h-5 w-5 text-primary" />
                Nearby Taskers
              </>
            )}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Within {searchRadius}km
          </Badge>
        </div>
        {expandingSearch && (
          <p className="text-sm text-muted-foreground animate-pulse">
            Expanding search area...
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : nearbyTaskers.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <User className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="font-medium">No taskers available nearby</p>
            <p className="text-sm">We're expanding the search area...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {nearbyTaskers.map((tasker, index) => (
              <motion.div
                key={tasker.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                  tasker.is_online 
                    ? "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800" 
                    : "bg-card"
                }`}
                onClick={() => onSelectTasker(tasker.id)}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={tasker.avatar_url || undefined} />
                    <AvatarFallback>
                      {tasker.full_name?.charAt(0) || "T"}
                    </AvatarFallback>
                  </Avatar>
                  {tasker.is_online && (
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{tasker.full_name || "Tasker"}</p>
                    {(tasker.trust_score || 0) >= 80 && (
                      <Shield className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {tasker.rating && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        {tasker.rating.toFixed(1)}
                        {tasker.total_reviews && (
                          <span className="text-xs">({tasker.total_reviews})</span>
                        )}
                      </span>
                    )}
                    {tasker.completed_tasks && tasker.completed_tasks > 0 && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {tasker.completed_tasks} tasks
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span className={isUrgent ? "text-orange-600" : "text-primary"}>
                      {tasker.estimatedArrival}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {tasker.distance.toFixed(1)}km
                  </div>
                </div>

                <Button size="sm" variant={tasker.is_online ? "default" : "outline"}>
                  {tasker.is_online ? "Request" : "View"}
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {nearbyTaskers.length > 0 && (
          <p className="text-xs text-center text-muted-foreground pt-2">
            💡 Taskers shown are currently available. ETA is estimated based on distance.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
