import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { TaskerCard } from "./TaskerCard";
import { TaskerFilters, TaskerFilterValues } from "./TaskerFilters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, Sparkles, ArrowRight, Grid3X3, List, 
  TrendingUp, Clock, Star
} from "lucide-react";
import { categories } from "@/lib/categories";

interface CategoryTaskerBrowseProps {
  initialCategory?: string;
}

export const CategoryTaskerBrowse = ({ initialCategory }: CategoryTaskerBrowseProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [taskers, setTaskers] = useState<any[]>([]);
  const [filteredTaskers, setFilteredTaskers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const categoryParam = searchParams.get("category") || initialCategory || "all";

  const [filters, setFilters] = useState<TaskerFilterValues>({
    search: "",
    category: categoryParam,
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
  }, []);

  useEffect(() => {
    applyFilters();
  }, [taskers, filters]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
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

      // Get task doers with their verification status and badges
      const verifiedTaskers = await Promise.all(
        (taskDoers || []).map(async (tasker) => {
          // Check if user has task_doer role
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", tasker.id)
            .eq("role", "task_doer")
            .maybeSingle();

          if (!roleData) return null;

          // Get verification status
          const { data: verification } = await supabase
            .from("verifications")
            .select("verification_status, id_verified, background_check_status, has_insurance")
            .eq("user_id", tasker.id)
            .maybeSingle();

          // Get badge count
          const { count: badgeCount } = await supabase
            .from("badges")
            .select("*", { count: "exact", head: true })
            .eq("user_id", tasker.id);

          // Check if currently online
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

    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter((t) =>
        t.full_name?.toLowerCase().includes(query) ||
        t.skills?.some((s: string) => s.toLowerCase().includes(query)) ||
        t.bio?.toLowerCase().includes(query)
      );
    }

    // Category filter (match skills)
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

  // Popular categories with icons
  const popularCategories = categories
    .filter((c) => c.featured)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Category Quick Select */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Popular Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.category === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFiltersChange({ ...filters, category: "all" })}
          >
            All Taskers
          </Button>
          {popularCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.title}
                variant={filters.category === cat.title ? "default" : "outline"}
                size="sm"
                onClick={() => handleFiltersChange({ ...filters, category: cat.title })}
                className="gap-1"
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.title}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <TaskerFilters
        onFiltersChange={handleFiltersChange}
        initialFilters={filters}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">
            {filters.category !== "all" ? `${filters.category} Taskers` : "All Taskers"}
          </h2>
          <Badge variant="secondary">
            {filteredTaskers.length} found
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-6 space-y-4">
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
        <div className="text-center py-16 bg-muted/50 rounded-lg">
          <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No taskers found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or browse all categories
          </p>
          <Button onClick={() => handleFiltersChange({ ...filters, category: "all" })}>
            View All Taskers
          </Button>
        </div>
      ) : (
        <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
          {filteredTaskers.map((tasker) => (
            <TaskerCard
              key={tasker.id}
              tasker={tasker}
              currentUserId={currentUserId || undefined}
            />
          ))}
        </div>
      )}

      {/* CTA */}
      {filteredTaskers.length > 0 && (
        <div className="text-center py-8 border-t border-border">
          <p className="text-muted-foreground mb-4">
            Can't find the right tasker? Post a task and let taskers come to you!
          </p>
          <Button onClick={() => navigate("/post-task")} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Post a Task
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
