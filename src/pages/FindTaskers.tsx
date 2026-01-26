import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { 
  TaskerHeroSection, 
  TaskerCategoryGrid, 
  TaskerFilters,
  EnhancedTaskerCard,
  EnhancedHireWizard,
  TaskerHowItWorks,
  TaskerFilterValues
} from "@/components/tasker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, Grid3X3, List, Sparkles, ArrowRight, 
  LayoutGrid, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FindTaskers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [taskers, setTaskers] = useState<any[]>([]);
  const [filteredTaskers, setFilteredTaskers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedTasker, setSelectedTasker] = useState<any>(null);
  const [isHireDialogOpen, setIsHireDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [stats, setStats] = useState({
    totalTaskers: 0,
    verifiedTaskers: 0,
    averageRating: 0,
    totalTasksCompleted: 0,
  });

  const [filters, setFilters] = useState<TaskerFilterValues>({
    search: "",
    category: searchParams.get("category") || "all",
    minRate: 0,
    maxRate: 200,
    minRating: 0,
    sortBy: "rating",
    verifiedOnly: false,
    availableNow: false,
  });

  useEffect(() => {
    fetchCurrentUser();
    fetchTaskers();
    fetchStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [taskers, filters, searchQuery]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchStats = async () => {
    try {
      const { count: totalCount } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "task_doer");

      const { count: verifiedCount } = await supabase
        .from("verifications")
        .select("*", { count: "exact", head: true })
        .eq("verification_status", "verified");

      const { data: ratingData } = await supabase
        .from("profiles")
        .select("rating")
        .not("rating", "is", null)
        .gt("rating", 0);

      const avgRating = ratingData?.length 
        ? ratingData.reduce((sum, p) => sum + (p.rating || 0), 0) / ratingData.length 
        : 0;

      const { data: completedData } = await supabase
        .from("profiles")
        .select("completed_tasks")
        .not("completed_tasks", "is", null);

      const totalCompleted = completedData?.reduce((sum, p) => sum + (p.completed_tasks || 0), 0) || 0;

      setStats({
        totalTaskers: totalCount || 0,
        verifiedTaskers: verifiedCount || 0,
        averageRating: avgRating,
        totalTasksCompleted: totalCompleted,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchTaskers = async () => {
    try {
      setIsLoading(true);

      const { data: taskDoers, error } = await supabase
        .from("profiles")
        .select("*")
        .not("full_name", "is", null)
        .not("full_name", "eq", "")
        .order("reputation_score", { ascending: false })
        .order("rating", { ascending: false });

      if (error) throw error;

      const verifiedTaskers = await Promise.all(
        (taskDoers || []).map(async (tasker) => {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", tasker.id)
            .eq("role", "task_doer")
            .maybeSingle();

          if (!roleData) return null;

          const { data: verification } = await supabase
            .from("verifications")
            .select("verification_status, id_verified, background_check_status, has_insurance")
            .eq("user_id", tasker.id)
            .maybeSingle();

          const { count: badgeCount } = await supabase
            .from("badges")
            .select("*", { count: "exact", head: true })
            .eq("user_id", tasker.id);

          const { data: availability } = await supabase
            .from("doer_live_availability")
            .select("is_available, last_ping")
            .eq("user_id", tasker.id)
            .maybeSingle();

          const isOnline = availability?.is_available && 
            availability?.last_ping && 
            new Date(availability.last_ping) > new Date(Date.now() - 5 * 60 * 1000);

          return {
            ...tasker,
            verifications: verification,
            badgeCount: badgeCount || 0,
            is_online: isOnline || tasker.is_online,
          };
        })
      );

      setTaskers(verifiedTaskers.filter(Boolean));
    } catch (error: any) {
      console.error("Error fetching taskers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...taskers];

    // Combined search (from hero + filters)
    const query = (searchQuery || filters.search).toLowerCase();
    if (query) {
      result = result.filter((t) =>
        t.full_name?.toLowerCase().includes(query) ||
        t.skills?.some((s: string) => s.toLowerCase().includes(query)) ||
        t.bio?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category && filters.category !== "all") {
      result = result.filter((t) =>
        t.skills?.some((s: string) => 
          s.toLowerCase().includes(filters.category.toLowerCase())
        )
      );
    }

    // Hourly rate filter
    result = result.filter((t) => {
      const rate = t.hourly_rate || 0;
      return rate >= filters.minRate && (filters.maxRate >= 200 || rate <= filters.maxRate);
    });

    // Rating filter
    if (filters.minRating > 0) {
      result = result.filter((t) => (t.rating || 0) >= filters.minRating);
    }

    // Verified only
    if (filters.verifiedOnly) {
      result = result.filter((t) => 
        t.verifications?.verification_status === "verified"
      );
    }

    // Available now
    if (filters.availableNow) {
      result = result.filter((t) => t.is_online);
    }

    // Sort
    switch (filters.sortBy) {
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "reviews":
        result.sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0));
        break;
      case "tasks":
        result.sort((a, b) => (b.completed_tasks || 0) - (a.completed_tasks || 0));
        break;
      case "rate_low":
        result.sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0));
        break;
      case "rate_high":
        result.sort((a, b) => (b.hourly_rate || 0) - (a.hourly_rate || 0));
        break;
      case "newest":
        result.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }

    setFilteredTaskers(result);
  };

  const handleFiltersChange = (newFilters: TaskerFilterValues) => {
    setFilters(newFilters);
    if (newFilters.category !== filters.category) {
      setSearchParams({ category: newFilters.category });
    }
  };

  const handleCategorySelect = (category: string) => {
    handleFiltersChange({ ...filters, category });
  };

  const handleQuickFilter = (filter: string) => {
    switch (filter) {
      case "verified":
        handleFiltersChange({ ...filters, verifiedOnly: !filters.verifiedOnly });
        break;
      case "available":
        handleFiltersChange({ ...filters, availableNow: !filters.availableNow });
        break;
      case "topRated":
        handleFiltersChange({ ...filters, minRating: filters.minRating >= 4 ? 0 : 4 });
        break;
    }
  };

  const handleHire = (taskerId: string) => {
    const tasker = taskers.find(t => t.id === taskerId);
    if (tasker) {
      setSelectedTasker(tasker);
      setIsHireDialogOpen(true);
    }
  };

  return (
    <>
      <SEOHead
        title="Find Trusted Taskers - SaskTask"
        description="Browse and hire verified taskers in Saskatchewan. Filter by category, hourly rate, and ratings to find the perfect help for your task."
      />

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 pt-24 pb-20">
          {/* Hero Section */}
          <TaskerHeroSection
            stats={stats}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onQuickFilter={handleQuickFilter}
          />

          {/* Main Content Tabs */}
          <Tabs defaultValue="browse" className="mt-12 space-y-8">
            <div className="flex items-center justify-between">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="browse" className="gap-2 data-[state=active]:bg-background">
                  <LayoutGrid className="h-4 w-4" />
                  Browse Taskers
                </TabsTrigger>
                <TabsTrigger value="categories" className="gap-2 data-[state=active]:bg-background">
                  <Layers className="h-4 w-4" />
                  By Category
                </TabsTrigger>
              </TabsList>

              {/* View Mode Toggle */}
              <div className="hidden md:flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="gap-1"
                >
                  <Grid3X3 className="h-4 w-4" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="gap-1"
                >
                  <List className="h-4 w-4" />
                  List
                </Button>
              </div>
            </div>

            <TabsContent value="browse" className="space-y-6">
              {/* Filters */}
              <TaskerFilters
                onFiltersChange={handleFiltersChange}
                initialFilters={filters}
              />

              {/* Results Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">
                    {filters.category !== "all" ? `${filters.category} Taskers` : "All Taskers"}
                  </h2>
                  <Badge variant="secondary" className="text-sm">
                    {filteredTaskers.length} found
                  </Badge>
                </div>
              </div>

              {/* Results Grid */}
              {isLoading ? (
                <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-card border border-border rounded-2xl p-6 space-y-4">
                      <div className="flex items-start gap-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-6 w-32" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-40" />
                        </div>
                      </div>
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              ) : filteredTaskers.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border"
                >
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">No taskers found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Try adjusting your filters or search terms to find more taskers
                  </p>
                  <Button onClick={() => handleFiltersChange({ ...filters, category: "all" })} className="gap-2">
                    View All Taskers
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={filters.category + filters.sortBy}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
                  >
                    {filteredTaskers.map((tasker, index) => (
                      <EnhancedTaskerCard
                        key={tasker.id}
                        tasker={tasker}
                        currentUserId={currentUserId || undefined}
                        onHire={handleHire}
                        index={index}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* CTA */}
              {filteredTaskers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center py-12 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-2xl border border-border/50"
                >
                  <Sparkles className="h-10 w-10 mx-auto mb-4 text-primary" />
                  <h3 className="text-2xl font-bold mb-2">Can't find the right match?</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Post a task and let taskers come to you with their best offers
                  </p>
                  <Button onClick={() => navigate("/post-task")} size="lg" className="gap-2">
                    Post a Task
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="categories" className="space-y-8">
              <TaskerCategoryGrid
                onCategorySelect={handleCategorySelect}
                selectedCategory={filters.category}
              />
              
              {/* Show taskers for selected category */}
              {filters.category !== "all" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">{filters.category} Specialists</h2>
                    <Badge variant="secondary">{filteredTaskers.length} available</Badge>
                  </div>
                  
                  {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-80 rounded-2xl" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredTaskers.slice(0, 6).map((tasker, index) => (
                        <EnhancedTaskerCard
                          key={tasker.id}
                          tasker={tasker}
                          currentUserId={currentUserId || undefined}
                          onHire={handleHire}
                          index={index}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* How It Works Section */}
          <TaskerHowItWorks />
        </div>
        
        <Footer />
      </div>

      {/* Enhanced Hire Wizard */}
      {selectedTasker && (
        <EnhancedHireWizard
          tasker={selectedTasker}
          open={isHireDialogOpen}
          onOpenChange={(open) => {
            setIsHireDialogOpen(open);
            if (!open) setSelectedTasker(null);
          }}
        />
      )}
    </>
  );
}
