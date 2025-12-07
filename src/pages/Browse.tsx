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
import { Search, MapPin, DollarSign, Calendar, Briefcase, Wrench, SlidersHorizontal, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const Browse = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 1000]);
  const [dateFilter, setDateFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const categories = [
    "Snow Removal",
    "Cleaning",
    "Moving",
    "Delivery",
    "Handyman",
    "Gardening",
    "Pet Care",
    "Other"
  ];

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
  }, [searchTerm, categoryFilter, budgetRange, dateFilter, tasks]);

  const checkAuthAndFetchTasks = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

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

    // Smart recommendations for task doers
    if (userRole === "task_doer" && userProfile) {
      filtered = filtered.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        if (userProfile.preferred_categories?.includes(a.category)) scoreA += 10;
        if (userProfile.preferred_categories?.includes(b.category)) scoreB += 10;

        const aSkillMatches = userProfile.skills?.filter((skill: string) => 
          a.description.toLowerCase().includes(skill.toLowerCase()) ||
          a.title.toLowerCase().includes(skill.toLowerCase())
        ).length || 0;
        const bSkillMatches = userProfile.skills?.filter((skill: string) => 
          b.description.toLowerCase().includes(skill.toLowerCase()) ||
          b.title.toLowerCase().includes(skill.toLowerCase())
        ).length || 0;

        scoreA += aSkillMatches * 5;
        scoreB += bSkillMatches * 5;

        return scoreB - scoreA;
      });
    }

    setFilteredTasks(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setBudgetRange([0, 1000]);
    setDateFilter("");
  };

  const hasActiveFilters = searchTerm || categoryFilter !== "all" || dateFilter || budgetRange[0] > 0;

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {userRole === "task_doer" ? "Recommended Tasks For You" : "Browse Available Tasks"}
          </h1>
          <p className="text-muted-foreground">
            {userRole === "task_doer" 
              ? "Tasks matched to your skills and preferences" 
              : "Find and accept tasks near you instantly"}
          </p>
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
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Budget Range */}
                    <div className="space-y-3">
                      <Label>Budget Range: ${budgetRange[0]} - ${budgetRange[1]}</Label>
                      <Slider
                        value={budgetRange}
                        onValueChange={(value) => setBudgetRange(value as [number, number])}
                        min={0}
                        max={1000}
                        step={10}
                        className="w-full"
                      />
                    </div>

                    {/* Date Filter */}
                    <div className="space-y-2">
                      <Label>Scheduled Date</Label>
                      <Input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                      />
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-end">
                      <Button 
                        variant="ghost" 
                        className="gap-2 text-muted-foreground"
                        onClick={clearFilters}
                      >
                        <X className="h-4 w-4" />
                        Clear Filters
                      </Button>
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
