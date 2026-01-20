import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Clock, 
  Star, 
  CheckCircle, 
  Zap, 
  Navigation,
  User,
  Shield,
  Radar,
  Car,
  Phone,
  MessageCircle,
  Award,
  TrendingUp,
  RefreshCw,
  ChevronRight,
  Sparkles,
  X
} from "lucide-react";
import { calculateDistance } from "@/lib/distance";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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
  response_rate: number | null;
  on_time_rate: number | null;
  distance: number;
  estimatedArrival: string;
  estimatedMinutes: number;
}

interface InstantTaskerMatchingProps {
  taskCategory: string;
  taskLocation: { latitude: number; longitude: number } | null;
  onSelectTasker: (taskerId: string) => void;
  isUrgent?: boolean;
  taskTitle?: string;
  taskBudget?: number;
}

const AVERAGE_SPEED_KMH = 40;

export const InstantTaskerMatching = ({
  taskCategory,
  taskLocation,
  onSelectTasker,
  isUrgent = false,
  taskTitle = "Task",
  taskBudget = 0
}: InstantTaskerMatchingProps) => {
  const [nearbyTaskers, setNearbyTaskers] = useState<NearbyTasker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchRadius, setSearchRadius] = useState(5);
  const [expandingSearch, setExpandingSearch] = useState(false);
  const [selectedTasker, setSelectedTasker] = useState<NearbyTasker | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [radarPulse, setRadarPulse] = useState(true);

  // Animated radar effect
  useEffect(() => {
    if (isLoading || expandingSearch) {
      setRadarPulse(true);
      const progressInterval = setInterval(() => {
        setSearchProgress(prev => Math.min(prev + 2, 100));
      }, 50);
      return () => clearInterval(progressInterval);
    } else {
      setSearchProgress(100);
      setTimeout(() => setRadarPulse(false), 500);
    }
  }, [isLoading, expandingSearch]);

  useEffect(() => {
    if (taskLocation) {
      fetchNearbyTaskers();
    }
  }, [taskLocation, taskCategory, searchRadius]);

  // Real-time subscription for tasker availability
  useEffect(() => {
    if (!taskLocation) return;

    const channel = supabase
      .channel('tasker-availability')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: 'is_online=eq.true'
        },
        () => {
          fetchNearbyTaskers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskLocation]);

  const calculateETA = (distanceKm: number): { text: string; minutes: number } => {
    const minutes = Math.round((distanceKm / AVERAGE_SPEED_KMH) * 60);
    if (minutes < 1) return { text: "< 1 min", minutes: 1 };
    if (minutes < 60) return { text: `${minutes} min`, minutes };
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return { text: `${hours}h ${remainingMinutes}m`, minutes };
  };

  const fetchNearbyTaskers = async () => {
    if (!taskLocation) return;
    
    setIsLoading(true);
    setSearchProgress(0);
    
    try {
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
          trust_score,
          response_rate,
          on_time_rate
        `)
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .or("is_online.eq.true,availability_status.eq.available");

      if (error) throw error;

      // Check user_roles for task doers
      const { data: taskDoerRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", ["task_doer", "admin"]);

      const taskDoerIds = new Set(taskDoerRoles?.map(r => r.user_id) || []);

      // Filter by category skills if available
      const taskersWithDistance = (taskers || [])
        .filter(t => {
          if (!taskDoerIds.has(t.id) || !t.latitude || !t.longitude) return false;
          // Optional: filter by skills matching category
          if (taskCategory && t.skills?.length) {
            const categoryLower = taskCategory.toLowerCase();
            return t.skills.some(s => s.toLowerCase().includes(categoryLower));
          }
          return true;
        })
        .map(tasker => {
          const distance = calculateDistance(
            taskLocation.latitude,
            taskLocation.longitude,
            tasker.latitude!,
            tasker.longitude!
          );
          const eta = calculateETA(distance);
          return {
            ...tasker,
            distance,
            estimatedArrival: eta.text,
            estimatedMinutes: eta.minutes
          };
        })
        .filter(t => t.distance <= searchRadius)
        .sort((a, b) => {
          // Priority: online + closest + highest rated
          const onlineScore = (a.is_online ? 1000 : 0) - (b.is_online ? 1000 : 0);
          const ratingScore = ((b.rating || 0) - (a.rating || 0)) * 10;
          const distanceScore = a.distance - b.distance;
          return onlineScore + ratingScore + distanceScore;
        })
        .slice(0, 8);

      setNearbyTaskers(taskersWithDistance);

      // Expand search if needed
      if (taskersWithDistance.length < 3 && searchRadius < 100) {
        setExpandingSearch(true);
        setTimeout(() => {
          setSearchRadius(prev => Math.min(prev + 15, 100));
          setExpandingSearch(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error fetching nearby taskers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = async (tasker: NearbyTasker) => {
    setIsRequesting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to request a tasker");
        return;
      }

      // Create notification for the tasker
      await supabase.from("notifications").insert({
        user_id: tasker.id,
        title: "New Task Request",
        message: `You've been requested for: ${taskTitle}`,
        type: "task_request",
        link: `/browse`
      });

      toast.success(`Request sent to ${tasker.full_name}!`, {
        description: "They'll be notified and can accept your task."
      });

      onSelectTasker(tasker.id);
    } catch (error: any) {
      toast.error("Failed to send request");
    } finally {
      setIsRequesting(false);
      setSelectedTasker(null);
    }
  };

  const getMatchScore = (tasker: NearbyTasker): number => {
    let score = 70;
    if (tasker.rating && tasker.rating >= 4.5) score += 15;
    else if (tasker.rating && tasker.rating >= 4) score += 10;
    if (tasker.completed_tasks && tasker.completed_tasks >= 50) score += 10;
    else if (tasker.completed_tasks && tasker.completed_tasks >= 20) score += 5;
    if (tasker.is_online) score += 5;
    if ((tasker.trust_score || 0) >= 80) score += 5;
    return Math.min(score, 99);
  };

  if (!taskLocation) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="py-12 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative inline-block">
              <MapPin className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/30"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <p className="text-muted-foreground font-medium">Enter a location to find nearby taskers</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              We'll show you available taskers with estimated arrival times
            </p>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isUrgent ? "border-orange-500/50 bg-gradient-to-br from-orange-50/50 to-amber-50/30 dark:from-orange-950/20 dark:to-amber-950/10" : "border-primary/20"}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {isUrgent ? (
              <>
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Zap className="h-5 w-5 text-orange-500" />
                </motion.div>
                <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Instant Match
                </span>
              </>
            ) : (
              <>
                <Navigation className="h-5 w-5 text-primary" />
                Nearby Taskers
              </>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {(isLoading || expandingSearch) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Radar className="h-4 w-4 text-primary" />
                </motion.div>
                <span className="text-xs text-muted-foreground">Scanning...</span>
              </motion.div>
            )}
            <Badge variant="outline" className="text-xs font-medium">
              {searchRadius}km radius
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={fetchNearbyTaskers}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Search progress */}
        {(isLoading || expandingSearch) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Progress value={searchProgress} className="h-1 mt-2" />
            {expandingSearch && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Expanding search area to find more taskers...
              </p>
            )}
          </motion.div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading && !expandingSearch ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-4 rounded-xl border bg-card"
              >
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : nearbyTaskers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="relative inline-block mb-3">
              <User className="h-14 w-14 text-muted-foreground/30" />
              {expandingSearch && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary/40"
                  animate={{ scale: [1, 2], opacity: [0.6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>
            <p className="font-medium text-muted-foreground">
              Searching for available taskers...
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Expanding search to {searchRadius}km radius
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {nearbyTaskers.map((tasker, index) => {
              const matchScore = getMatchScore(tasker);
              return (
                <motion.div
                  key={tasker.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
                  whileHover={{ scale: 1.01 }}
                  className={`relative p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedTasker?.id === tasker.id
                      ? "ring-2 ring-primary border-primary bg-primary/5"
                      : tasker.is_online 
                        ? "bg-gradient-to-r from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10 border-green-200 dark:border-green-800/50 hover:shadow-lg hover:shadow-green-500/10" 
                        : "bg-card hover:shadow-md"
                  }`}
                  onClick={() => setSelectedTasker(selectedTasker?.id === tasker.id ? null : tasker)}
                >
                  {/* Match score indicator */}
                  {index < 3 && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className={`${
                        matchScore >= 90 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                        matchScore >= 80 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                        'bg-gradient-to-r from-gray-500 to-slate-500'
                      } text-white border-0 text-xs px-2`}>
                        {matchScore}% match
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    {/* Avatar with status */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-14 w-14 ring-2 ring-offset-2 ring-offset-background ring-primary/20">
                        <AvatarImage src={tasker.avatar_url || undefined} />
                        <AvatarFallback className="text-lg bg-gradient-to-br from-primary/80 to-primary text-white">
                          {tasker.full_name?.charAt(0) || "T"}
                        </AvatarFallback>
                      </Avatar>
                      {tasker.is_online && (
                        <motion.span
                          className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold truncate">{tasker.full_name || "Tasker"}</p>
                        {(tasker.trust_score || 0) >= 80 && (
                          <Shield className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        )}
                        {(tasker.completed_tasks || 0) >= 100 && (
                          <Award className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                        {tasker.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium text-foreground">{tasker.rating.toFixed(1)}</span>
                            {tasker.total_reviews && (
                              <span className="text-xs">({tasker.total_reviews})</span>
                            )}
                          </span>
                        )}
                        {tasker.completed_tasks && tasker.completed_tasks > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                            {tasker.completed_tasks}
                          </span>
                        )}
                        {tasker.on_time_rate && tasker.on_time_rate >= 90 && (
                          <span className="flex items-center gap-1 text-xs">
                            <TrendingUp className="h-3 w-3 text-blue-500" />
                            {tasker.on_time_rate}% on-time
                          </span>
                        )}
                      </div>

                      {/* Skills preview */}
                      {tasker.skills && tasker.skills.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {tasker.skills.slice(0, 3).map((skill, i) => (
                            <Badge key={i} variant="secondary" className="text-xs px-1.5 py-0">
                              {skill}
                            </Badge>
                          ))}
                          {tasker.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                              +{tasker.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ETA and Action */}
                    <div className="text-right space-y-2 flex-shrink-0">
                      <div className="flex items-center justify-end gap-1.5">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className={`text-lg font-bold ${
                          isUrgent ? "text-orange-600" : "text-primary"
                        }`}>
                          {tasker.estimatedArrival}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {tasker.distance.toFixed(1)}km away
                      </div>
                      {tasker.hourly_rate && (
                        <p className="text-xs text-muted-foreground">
                          ${tasker.hourly_rate}/hr
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Expanded actions */}
                  <AnimatePresence>
                    {selectedTasker?.id === tasker.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t flex gap-2"
                      >
                        <Button
                          className="flex-1 gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRequest(tasker);
                          }}
                          disabled={isRequesting}
                        >
                          {isRequesting ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Zap className="h-4 w-4" />
                          )}
                          Request Now
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/profile/${tasker.id}`, '_blank');
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* Footer info */}
        {nearbyTaskers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between pt-3 border-t"
          >
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {nearbyTaskers.filter(t => t.is_online).length} online now
            </p>
            <p className="text-xs text-muted-foreground">
              ETA based on {AVERAGE_SPEED_KMH}km/h avg
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};