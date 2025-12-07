import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Search, MapPin, DollarSign, Calendar, Briefcase, Wrench, SlidersHorizontal, X, Clock, Navigation, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TaskPriorityBadge, type TaskPriority } from "@/components/TaskPriorityBadge";
import { getCategoryTitles, timeEstimateLabels, TimeEstimate } from "@/lib/categories";
import { useUserLocation } from "@/hooks/useUserLocation";
import { calculateDistance, formatDistance } from "@/lib/distance";
import { useTaskRecommendations } from "@/hooks/useTaskRecommendations";

const Browse = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 1000]);
  const [dateFilter, setDateFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [distanceFilter, setDistanceFilter] = useState<number>(100);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { location: userLocation, isLoading: locationLoading, requestLocation } = useUserLocation();
  
  // Get AI recommendations for scoring
  const { data: recommendationsData } = useTaskRecommendations(userId || undefined);

  const categories = getCategoryTitles();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    const categoryParam = params.get('category');
    
    if (searchParam) setSearchTerm(searchParam);
    if (categoryParam) setCategoryFilter(categoryParam);
    
    checkAuthAndFetchTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [searchTerm, categoryFilter, budgetRange, dateFilter, priorityFilter, timeFilter, distanceFilter, sortBy, tasks, userLocation, recommendationsData]);

  const checkAuthAndFetchTasks = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();
      
      setUserProfile(profileData);
      setUserRole(roleData?.role || null);

      fetchTasks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          profiles!tasks_task_giver_id_fkey (
            full_name,
            rating,
            avatar_url
          )
        `)
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
      setFilteredTasks(data || []);
      
      // Set max budget based on tasks
      if (data && data.length > 0) {
        const maxBudget = Math.max(...data.map(t => t.pay_amount || 0));
        setBudgetRange([0, Math.ceil(maxBudget / 100) * 100 || 1000]);
      }
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

  // Build recommendation scores map
  const getRecommendationScore = (taskId: string): number | null => {
    if (!recommendationsData?.recommendations) return null;
    const rec = recommendationsData.recommendations.find((r: any) => r.id === taskId);
    return rec?.matchScore ?? null;
  };

  // Calculate distance for a task
  const getTaskDistance = (task: any): number | null => {
    if (!userLocation || !task.latitude || !task.longitude) return null;
    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      task.latitude,
      task.longitude
    );
  };

  const filterTasks = () => {
    let filtered = tasks;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(task => task.category === categoryFilter);
    }

    // Budget filter
    filtered = filtered.filter(task => 
      task.pay_amount >= budgetRange[0] && task.pay_amount <= budgetRange[1]
    );

    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(task => {
        if (!task.scheduled_date) return false;
        const taskDate = new Date(task.scheduled_date);
        return taskDate.toDateString() === filterDate.toDateString();
      });
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Time estimate filter based on estimated_duration
    if (timeFilter !== "all") {
      filtered = filtered.filter(task => {
        const duration = task.estimated_duration || 0;
        switch (timeFilter) {
          case "quick": return duration <= 0.5;
          case "short": return duration > 0.5 && duration <= 2;
          case "medium": return duration > 2 && duration <= 4;
          case "long": return duration > 4;
          default: return true;
        }
      });
    }

    // Distance filter (only if user location is available)
    if (userLocation && distanceFilter < 100) {
      filtered = filtered.filter(task => {
        const distance = getTaskDistance(task);
        return distance === null || distance <= distanceFilter;
      });
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "best_match": {
          const scoreA = getRecommendationScore(a.id) ?? 0;
          const scoreB = getRecommendationScore(b.id) ?? 0;
          return scoreB - scoreA;
        }
        case "distance": {
          const distA = getTaskDistance(a) ?? Infinity;
          const distB = getTaskDistance(b) ?? Infinity;
          return distA - distB;
        }
        case "pay_high":
          return (b.pay_amount || 0) - (a.pay_amount || 0);
        case "pay_low":
          return (a.pay_amount || 0) - (b.pay_amount || 0);
        case "priority": {
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2) - 
                 (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2);
        }
        case "newest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredTasks(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setBudgetRange([0, 1000]);
    setDateFilter("");
    setPriorityFilter("all");
    setTimeFilter("all");
    setDistanceFilter(100);
    setSortBy("newest");
  };

  const hasActiveFilters = searchTerm || categoryFilter !== "all" || dateFilter || budgetRange[0] > 0 || priorityFilter !== "all" || timeFilter !== "all" || distanceFilter < 100;

  // Get time estimate for a task based on its duration
  const getTaskTimeEstimate = (duration: number | null): TimeEstimate => {
    if (!duration || duration <= 0.5) return "quick";
    if (duration <= 2) return "short";
    if (duration <= 4) return "medium";
    return "long";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {userRole === "task_doer" ? "Recommended Tasks For You" : "Browse Available Tasks"}
            </h1>
            <p className="text-muted-foreground">
              {userRole === "task_doer" 
                ? "Tasks matched to your skills and preferences" 
                : "Find and accept tasks near you instantly"}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/map")} className="gap-2">
            <MapPin className="h-4 w-4" />
            Map View
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 border-border">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              {/* Main search row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks, location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border z-[100]">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </Button>
              </div>

              {/* Advanced Filters */}
              <Collapsible open={showFilters} onOpenChange={setShowFilters}>
                <CollapsibleContent className="space-y-4 pt-4 border-t">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4">
                    {/* Sort By */}
                    <div className="space-y-2">
                      <Label>Sort By</Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border z-[100]">
                          <SelectItem value="newest">🕐 Newest First</SelectItem>
                          <SelectItem value="best_match">
                            <span className="flex items-center gap-1">
                              <Sparkles className="h-3 w-3" /> Best Match
                            </span>
                          </SelectItem>
                          {userLocation && <SelectItem value="distance">📍 Nearest</SelectItem>}
                          <SelectItem value="pay_high">💰 Highest Pay</SelectItem>
                          <SelectItem value="pay_low">💵 Lowest Pay</SelectItem>
                          <SelectItem value="priority">🔥 Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Budget Range */}
                    <div className="space-y-3">
                      <Label>Budget: ${budgetRange[0]} - ${budgetRange[1]}</Label>
                      <Slider
                        value={budgetRange}
                        onValueChange={(value) => setBudgetRange(value as [number, number])}
                        min={0}
                        max={1000}
                        step={10}
                        className="w-full"
                      />
                    </div>

                    {/* Distance Filter */}
                    <div className="space-y-3">
                      <Label className="flex items-center justify-between">
                        <span>Distance: {distanceFilter === 100 ? 'Any' : `${distanceFilter}km`}</span>
                        {!userLocation && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-xs text-primary"
                            onClick={requestLocation}
                            disabled={locationLoading}
                          >
                            <Navigation className="h-3 w-3 mr-1" />
                            Enable
                          </Button>
                        )}
                      </Label>
                      <Slider
                        value={[distanceFilter]}
                        onValueChange={(value) => setDistanceFilter(value[0])}
                        min={5}
                        max={100}
                        step={5}
                        className="w-full"
                        disabled={!userLocation}
                      />
                    </div>

                    {/* Priority Filter */}
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Priorities" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border z-[100]">
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="urgent">🔴 Urgent</SelectItem>
                          <SelectItem value="high">🟠 High</SelectItem>
                          <SelectItem value="medium">🔵 Medium</SelectItem>
                          <SelectItem value="low">⚪ Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Time Estimate Filter */}
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Select value={timeFilter} onValueChange={setTimeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Durations" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border z-[100]">
                          <SelectItem value="all">All Durations</SelectItem>
                          <SelectItem value="quick">⚡ Quick</SelectItem>
                          <SelectItem value="short">🕐 1-2 hrs</SelectItem>
                          <SelectItem value="medium">🕑 2-4 hrs</SelectItem>
                          <SelectItem value="long">🕓 Half Day+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Filter + Clear */}
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="shrink-0"
                          onClick={clearFilters}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </p>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-12 text-center">
              <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="border-border hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold mb-1">{task.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Posted by {task.profiles?.full_name || "Anonymous"}
                            {task.profiles?.rating && (
                              <span className="ml-2">⭐ {task.profiles.rating.toFixed(1)}</span>
                            )}
                          </p>
                        </div>
                        <span className="text-2xl font-bold text-primary">${task.pay_amount}</span>
                      </div>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-2">{task.description}</p>
                      
                      <div className="flex flex-wrap gap-3 mb-4">
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{task.location}</span>
                        </div>
                        {task.scheduled_date && (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(task.scheduled_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-sm">
                          <Wrench className="h-4 w-4 text-muted-foreground" />
                          <span>{task.tools_provided ? "Tools provided" : "Bring tools"}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {/* Match Score Badge */}
                        {(() => {
                          const matchScore = getRecommendationScore(task.id);
                          if (matchScore && matchScore > 50) {
                            return (
                              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                                <Sparkles className="h-3 w-3 mr-1" />
                                {matchScore}% match
                              </Badge>
                            );
                          }
                          return null;
                        })()}
                        {/* Distance Badge */}
                        {(() => {
                          const distance = getTaskDistance(task);
                          if (distance !== null) {
                            return (
                              <Badge variant="outline" className="text-xs">
                                <Navigation className="h-3 w-3 mr-1" />
                                {formatDistance(distance)}
                              </Badge>
                            );
                          }
                          return null;
                        })()}
                        <TaskPriorityBadge priority={(task.priority || 'medium') as TaskPriority} />
                        {(() => {
                          const timeEst = getTaskTimeEstimate(task.estimated_duration);
                          const timeInfo = timeEstimateLabels[timeEst];
                          return (
                            <Badge variant="outline" className={`${timeInfo.color} text-xs`}>
                              <Clock className="h-3 w-3 mr-1" />
                              {timeInfo.label}
                            </Badge>
                          );
                        })()}
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          {task.category}
                        </span>
                        <span className="px-3 py-1 bg-secondary/10 text-secondary-foreground rounded-full text-xs font-medium">
                          {task.budget_type === "hourly" ? "Hourly" : "Fixed"}
                        </span>
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2 md:justify-center shrink-0">
                      <Button 
                        onClick={() => navigate(`/task/${task.id}`)}
                        className="flex-1 md:flex-none"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Browse;
