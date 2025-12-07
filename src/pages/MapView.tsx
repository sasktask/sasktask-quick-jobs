import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TaskMap } from "@/components/TaskMap";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MapPin, List, Filter, Loader2 } from "lucide-react";
import { getCategoryTitles } from "@/lib/categories";

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const categories = getCategoryTitles();

  useEffect(() => {
    fetchMapboxToken();
    fetchTasks();
  }, []);

  const fetchMapboxToken = async () => {
    try {
      // Try to get from edge function
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (data?.token) {
        setMapboxToken(data.token);
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
      setTasks(data || []);
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

  const filteredTasks = categoryFilter === "all" 
    ? tasks 
    : tasks.filter(t => t.category === categoryFilter);

  const tasksWithLocation = filteredTasks.filter(t => t.latitude && t.longitude);
  const tasksWithoutLocation = filteredTasks.filter(t => !t.latitude || !t.longitude);

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <MapPin className="h-8 w-8 text-primary" />
              Map View
            </h1>
            <p className="text-muted-foreground">
              Find tasks near you in Saskatchewan
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={() => navigate("/browse")}>
              <List className="h-4 w-4 mr-2" />
              List View
            </Button>
          </div>
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
                <p className="text-xs text-muted-foreground">On Map</p>
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
          <Card className="border-border col-span-2">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Filter className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredTasks.length}</p>
                <p className="text-xs text-muted-foreground">
                  {categoryFilter === "all" ? "Total Open Tasks" : `${categoryFilter} Tasks`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <TaskMap 
          tasks={filteredTasks} 
          mapboxToken={mapboxToken}
          isLoading={isLoading}
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
                <Card 
                  key={task.id} 
                  className="border-border hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/task/${task.id}`)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate">{task.title}</h3>
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
