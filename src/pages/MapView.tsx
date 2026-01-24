import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TaskClusterMap } from "@/components/TaskClusterMap";
import { MapCategoryFilter } from "@/components/map/MapCategoryFilter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMapRealtime } from "@/hooks/useMapRealtime";
import { MapPin, List, Loader2, Navigation, Target, Flame, Wifi, WifiOff, Sparkles, DollarSign } from "lucide-react";
import { useUserLocation } from "@/hooks/useUserLocation";
import { calculateDistance } from "@/lib/distance";
import { motion, AnimatePresence } from "framer-motion";

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

export default function MapView() {
  const [initialTasks, setInitialTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [minPay, setMinPay] = useState<number | undefined>();
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [radiusKm, setRadiusKm] = useState(50);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { location: userLocation, isLoading: locationLoading, error: locationError, requestLocation } = useUserLocation();
  
  // Real-time updates
  const { tasks: realtimeTasks, isConnected, getRecentlyAddedIds } = useMapRealtime(initialTasks);
  const recentlyAddedIds = getRecentlyAddedIds();

  useEffect(() => {
    fetchMapboxToken();
    fetchTasks();
  }, []);

  const fetchMapboxToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      
      if (error) {
        console.error("Error invoking get-mapbox-token:", error);
        return;
      }
      
      if (data?.token) {
        setMapboxToken(data.token);
      } else if (data?.error) {
        console.error("Mapbox token error:", data.error);
        toast({
          title: "Map Configuration",
          description: "Map is not fully configured. Please contact support.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching mapbox token:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInitialTasks(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Apply all filters
  const filteredTasks = useMemo(() => {
    let result = realtimeTasks;

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter(t => t.category === categoryFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.location.toLowerCase().includes(query)
      );
    }

    // Min pay filter
    if (minPay) {
      result = result.filter(t => t.pay_amount >= minPay);
    }

    // Urgent only filter
    if (showUrgentOnly) {
      result = result.filter(t => t.priority === 'urgent');
    }

    // Radius filter
    if (userLocation) {
      result = result.filter(task => {
        if (!task.latitude || !task.longitude) return true;
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          task.latitude,
          task.longitude
        );
        return distance <= radiusKm;
      });
    }

    return result;
  }, [realtimeTasks, categoryFilter, searchQuery, minPay, showUrgentOnly, userLocation, radiusKm]);

  const tasksWithLocation = filteredTasks.filter(t => t.latitude && t.longitude);
  const tasksWithoutLocation = filteredTasks.filter(t => !t.latitude || !t.longitude);
  
  // Calculate stats
  const totalValue = tasksWithLocation.reduce((sum, t) => sum + t.pay_amount, 0);
  const avgPay = tasksWithLocation.length > 0 ? Math.round(totalValue / tasksWithLocation.length) : 0;
  const urgentCount = tasksWithLocation.filter(t => t.priority === 'urgent').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-20">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading map view...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <MapPin className="h-8 w-8 text-primary" />
              Map View
              {isConnected && (
                <Badge variant="outline" className="gap-1 text-green-500 border-green-500/50">
                  <Wifi className="h-3 w-3" />
                  Live
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">
              Find tasks near you with real-time updates
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Location button */}
            <Button 
              variant={userLocation ? "default" : "outline"}
              onClick={requestLocation}
              disabled={locationLoading}
              className="gap-2"
            >
              {locationLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
              {userLocation ? "Location On" : "Use My Location"}
            </Button>

            {/* Radius slider */}
            {userLocation && (
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={[radiusKm]}
                  onValueChange={(v) => setRadiusKm(v[0])}
                  min={5}
                  max={200}
                  step={5}
                  className="w-24"
                />
                <span className="text-sm font-medium w-14">{radiusKm} km</span>
              </div>
            )}

            {/* Heatmap toggle */}
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <Label htmlFor="heatmap" className="text-sm cursor-pointer">Heatmap</Label>
              <Switch
                id="heatmap"
                checked={showHeatmap}
                onCheckedChange={setShowHeatmap}
              />
            </div>
            
            <Button variant="outline" onClick={() => navigate("/browse")}>
              <List className="h-4 w-4 mr-2" />
              List View
            </Button>
          </div>
        </div>

        {/* Location error message */}
        {locationError && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-600 dark:text-yellow-400">
            <Navigation className="h-4 w-4 inline mr-2" />
            {locationError}. You can still browse tasks without location filtering.
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-6">
          <MapCategoryFilter
            selectedCategory={categoryFilter}
            onCategoryChange={setCategoryFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            minPay={minPay}
            onMinPayChange={setMinPay}
            showUrgentOnly={showUrgentOnly}
            onUrgentOnlyChange={setShowUrgentOnly}
            totalResults={filteredTasks.length}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tasksWithLocation.length}</p>
                <p className="text-xs text-muted-foreground">
                  {userLocation ? `Within ${radiusKm}km` : "On Map"}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${avgPay}</p>
                <p className="text-xs text-muted-foreground">Avg Pay</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{urgentCount}</p>
                <p className="text-xs text-muted-foreground">Urgent Tasks</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <List className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tasksWithoutLocation.length}</p>
                <p className="text-xs text-muted-foreground">No Location</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New tasks notification */}
        <AnimatePresence>
          {recentlyAddedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4"
            >
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span>{recentlyAddedIds.length} new task{recentlyAddedIds.length > 1 ? 's' : ''} just added!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map */}
        <TaskClusterMap 
          tasks={filteredTasks} 
          mapboxToken={mapboxToken}
          isLoading={isLoading}
          userLocation={userLocation}
          radiusKm={radiusKm}
          showHeatmap={showHeatmap}
          recentlyAddedIds={recentlyAddedIds}
          onTaskSelect={setSelectedTask}
        />

        {/* Tasks without location */}
        {tasksWithoutLocation.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <List className="h-5 w-5" />
              Tasks Without Precise Location ({tasksWithoutLocation.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasksWithoutLocation.slice(0, 6).map(task => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                >
                  <Card 
                    className="border-border hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => navigate(`/task/${task.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold truncate">{task.title}</h3>
                        {task.priority === 'urgent' && (
                          <Badge className="bg-red-500 shrink-0 text-xs">Urgent</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {task.location}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="default">${task.pay_amount}</Badge>
                        <Badge variant="secondary">{task.category}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            {tasksWithoutLocation.length > 6 && (
              <div className="text-center mt-4">
                <Button variant="outline" onClick={() => navigate("/browse")}>
                  View All Tasks
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
