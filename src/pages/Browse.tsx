import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Search, MapPin, DollarSign, Calendar, Briefcase, Wrench, SlidersHorizontal, X, Clock, Navigation, Sparkles, Bookmark, Utensils, Star, Shield, ChefHat, Leaf, Award, CheckCircle2, Package, Users, Flame, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { SmartSearchBar } from "@/components/SmartSearchBar";
import { QuickFilters } from "@/components/QuickFilters";
import { SaveSearchDialog } from "@/components/SaveSearchDialog";
import { TiffinProviderCard, TiffinMenuDialog, TiffinOrderForm } from "@/components/tiffin";
import { motion } from "framer-motion";
import { toast as sonnerToast } from "sonner";

// Tiffin cuisine types
const tiffinCuisineTypes = [
  { id: "indian", name: "Indian", emoji: "🇮🇳" },
  { id: "chinese", name: "Chinese", emoji: "🇨🇳" },
  { id: "middle-eastern", name: "Middle Eastern", emoji: "🌙" },
  { id: "african", name: "African", emoji: "🌍" },
  { id: "caribbean", name: "Caribbean", emoji: "🏝️" },
  { id: "asian", name: "Pan-Asian", emoji: "🥢" },
  { id: "european", name: "European", emoji: "🇪🇺" },
  { id: "canadian", name: "Canadian", emoji: "🍁" },
];

const tiffinDietaryFilters = [
  { id: "vegetarian", name: "Vegetarian", icon: Leaf, color: "text-green-500" },
  { id: "vegan", name: "Vegan", icon: Leaf, color: "text-emerald-500" },
  { id: "halal", name: "Halal", icon: Award, color: "text-amber-500" },
  { id: "gluten-free", name: "Gluten-Free", icon: CheckCircle2, color: "text-blue-500" },
];

// Featured tiffin providers
const featuredTiffinProviders = [
  {
    id: "1",
    businessName: "Grandma's Kitchen",
    cuisineType: ["North Indian", "Punjabi"],
    description: "Authentic home-style Punjabi food made with love. Fresh rotis, rich dals, and aromatic curries.",
    avgRating: 4.9,
    totalOrders: 234,
    isVegetarian: true,
    hygienicRating: 5,
    priceRange: "$12-18",
    deliveryAreas: ["Saskatoon", "Downtown", "Stonebridge"],
    kitchenCertified: true,
    coverImage: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400",
    deliveryTime: "30-45 min",
    spiceLevel: 3,
    specialties: ["Dal Makhani", "Butter Chicken", "Stuffed Parathas"]
  },
  {
    id: "2",
    businessName: "Spice Route",
    cuisineType: ["South Indian", "Kerala"],
    description: "Traditional South Indian meals with authentic spices. Dosa, idli, and banana leaf thalis.",
    avgRating: 4.8,
    totalOrders: 189,
    isVegetarian: false,
    isHalal: true,
    hygienicRating: 5,
    priceRange: "$10-15",
    deliveryAreas: ["Regina", "University"],
    kitchenCertified: true,
    coverImage: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400",
    deliveryTime: "35-50 min",
    spiceLevel: 4,
    specialties: ["Masala Dosa", "Kerala Fish Curry", "Sambar Rice"]
  },
  {
    id: "3",
    businessName: "Mediterranean Delights",
    cuisineType: ["Lebanese", "Turkish"],
    description: "Fresh Mediterranean cuisine with homemade hummus, falafel, and grilled meats.",
    avgRating: 4.7,
    totalOrders: 156,
    isVegetarian: false,
    isHalal: true,
    hygienicRating: 4,
    priceRange: "$14-20",
    deliveryAreas: ["Saskatoon", "Warman"],
    kitchenCertified: true,
    coverImage: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
    deliveryTime: "25-40 min",
    spiceLevel: 2,
    specialties: ["Shawarma Plate", "Falafel Wrap", "Mixed Grill"]
  },
  {
    id: "4",
    businessName: "Mom's Chinese Kitchen",
    cuisineType: ["Cantonese", "Hakka"],
    description: "Homestyle Chinese comfort food, dim sum weekends, and hearty noodle bowls.",
    avgRating: 4.6,
    totalOrders: 145,
    isVegetarian: false,
    hygienicRating: 5,
    priceRange: "$11-16",
    deliveryAreas: ["Regina", "Moose Jaw"],
    kitchenCertified: true,
    coverImage: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
    deliveryTime: "30-45 min",
    spiceLevel: 2,
    specialties: ["Dim Sum", "Hakka Noodles", "Sweet & Sour"]
  },
  {
    id: "5",
    businessName: "Ethiopian Flavors",
    cuisineType: ["Ethiopian", "Eritrean"],
    description: "Authentic East African cuisine with injera bread and flavorful stews.",
    avgRating: 4.8,
    totalOrders: 98,
    isVegetarian: false,
    isVegan: true,
    hygienicRating: 5,
    priceRange: "$13-18",
    deliveryAreas: ["Saskatoon", "Martensville"],
    kitchenCertified: true,
    coverImage: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400",
    deliveryTime: "40-55 min",
    spiceLevel: 3,
    specialties: ["Doro Wat", "Injera Combo", "Veggie Platter"]
  },
  {
    id: "6",
    businessName: "Thai Home Kitchen",
    cuisineType: ["Thai", "Laotian"],
    description: "Fresh Thai street food classics. Pad Thai, curries, and refreshing salads.",
    avgRating: 4.7,
    totalOrders: 112,
    isVegetarian: false,
    isGlutenFree: true,
    hygienicRating: 4,
    priceRange: "$12-17",
    deliveryAreas: ["Saskatoon", "Sutherland"],
    kitchenCertified: true,
    coverImage: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400",
    deliveryTime: "25-40 min",
    spiceLevel: 4,
    specialties: ["Pad Thai", "Green Curry", "Tom Yum Soup"]
  },
];

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
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);
  
  // Tiffin-specific state
  const [tiffinSearchQuery, setTiffinSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [tiffinFavorites, setTiffinFavorites] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [tiffinActiveTab, setTiffinActiveTab] = useState("providers");
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { location: userLocation, isLoading: locationLoading, requestLocation } = useUserLocation();
  
  // Get AI recommendations for scoring
  const { data: recommendationsData } = useTaskRecommendations(userId || undefined);

  const categories = getCategoryTitles();
  
  // Check if Tiffin category is selected
  const isTiffinCategory = categoryFilter === "Tiffin Services";

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
    setActiveQuickFilters([]);
  };

  const hasActiveFilters = searchTerm || categoryFilter !== "all" || dateFilter || budgetRange[0] > 0 || priorityFilter !== "all" || timeFilter !== "all" || distanceFilter < 100 || activeQuickFilters.length > 0;

  // Handle smart search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (term && !recentSearches.includes(term)) {
      setRecentSearches(prev => [term, ...prev.slice(0, 9)]);
    }
  }, [recentSearches]);

  // Handle quick filter toggle
  const handleQuickFilterToggle = useCallback((filterId: string, filterValue: any) => {
    setActiveQuickFilters(prev => {
      const isActive = prev.includes(filterId);
      if (isActive) {
        // Remove filter
        if (filterValue.priority) setPriorityFilter("all");
        if (filterValue.distance) setDistanceFilter(100);
        if (filterValue.time) setTimeFilter("all");
        if (filterValue.minBudget) setBudgetRange([0, budgetRange[1]]);
        if (filterValue.category) setCategoryFilter("all");
        if (filterValue.today) setDateFilter("");
        return prev.filter(id => id !== filterId);
      } else {
        // Apply filter
        if (filterValue.priority) setPriorityFilter(filterValue.priority);
        if (filterValue.distance) setDistanceFilter(filterValue.distance);
        if (filterValue.time) setTimeFilter(filterValue.time);
        if (filterValue.minBudget) setBudgetRange([filterValue.minBudget, budgetRange[1]]);
        if (filterValue.category) setCategoryFilter(filterValue.category);
        if (filterValue.today) setDateFilter(new Date().toISOString().split('T')[0]);
        return [...prev, filterId];
      }
    });
  }, [budgetRange]);

  // Get current search filters for saving
  const getCurrentFilters = useCallback(() => ({
    query: searchTerm || undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    minBudget: budgetRange[0] > 0 ? budgetRange[0] : undefined,
    maxBudget: budgetRange[1] < 1000 ? budgetRange[1] : undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
    distance: distanceFilter < 100 ? distanceFilter : undefined,
  }), [searchTerm, categoryFilter, budgetRange, priorityFilter, distanceFilter]);

  // Get time estimate for a task based on its duration
  const getTaskTimeEstimate = (duration: number | null): TimeEstimate => {
    if (!duration || duration <= 0.5) return "quick";
    if (duration <= 2) return "short";
    if (duration <= 4) return "medium";
    return "long";
  };

  // Tiffin-specific handlers
  const toggleDietary = (id: string) => {
    setSelectedDietary(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const toggleTiffinFavorite = (providerId: string) => {
    if (!userId) {
      sonnerToast.error("Please login to save favorites");
      return;
    }
    setTiffinFavorites(prev => 
      prev.includes(providerId) 
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
    sonnerToast.success(tiffinFavorites.includes(providerId) ? "Removed from favorites" : "Added to favorites");
  };

  const handleViewMenu = (provider: any) => {
    setSelectedProvider(provider);
    setIsMenuDialogOpen(true);
  };

  const handleOrder = (providerId: string, items: any[]) => {
    setCartItems(items);
    setIsMenuDialogOpen(false);
    setIsOrderFormOpen(true);
  };

  // Filter tiffin providers
  const filteredTiffinProviders = featuredTiffinProviders.filter(provider => {
    const matchesSearch = tiffinSearchQuery === "" || 
      provider.businessName.toLowerCase().includes(tiffinSearchQuery.toLowerCase()) ||
      provider.cuisineType.some(c => c.toLowerCase().includes(tiffinSearchQuery.toLowerCase())) ||
      provider.description.toLowerCase().includes(tiffinSearchQuery.toLowerCase());
    
    const matchesCuisine = !selectedCuisine || 
      tiffinCuisineTypes.find(c => c.id === selectedCuisine)?.name.toLowerCase() === provider.cuisineType[0]?.toLowerCase() ||
      provider.cuisineType.some(c => c.toLowerCase().includes(selectedCuisine));
    
    const matchesDietary = selectedDietary.length === 0 || 
      selectedDietary.every(filter => {
        if (filter === "vegetarian") return provider.isVegetarian;
        if (filter === "vegan") return (provider as any).isVegan;
        if (filter === "halal") return (provider as any).isHalal;
        if (filter === "gluten-free") return (provider as any).isGlutenFree;
        return true;
      });
    
    return matchesSearch && matchesCuisine && matchesDietary;
  });

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
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {isTiffinCategory 
                ? "Tiffin Services" 
                : userRole === "task_doer" 
                  ? "Recommended Tasks For You" 
                  : "Browse Available Tasks"}
            </h1>
            <p className="text-muted-foreground">
              {isTiffinCategory 
                ? "Authentic home-cooked meals delivered fresh to your door" 
                : userRole === "task_doer" 
                  ? "Tasks matched to your skills and preferences" 
                  : "Find and accept tasks near you instantly"}
            </p>
          </div>
          <div className="flex gap-2">
            {isTiffinCategory && (
              <Button variant="outline" onClick={() => setCategoryFilter("all")} className="gap-2">
                <X className="h-4 w-4" />
                View All Tasks
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate("/map")} className="gap-2">
              <MapPin className="h-4 w-4" />
              Map View
            </Button>
          </div>
        </div>

        {/* Tiffin-specific UI */}
        {isTiffinCategory ? (
          <>
            {/* Tiffin Hero Banner */}
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-orange-50 via-background to-amber-50 dark:from-orange-950/20 dark:via-background dark:to-amber-950/20 border">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                  <Utensils className="h-3 w-3 mr-1" />
                  Home-Cooked Goodness
                </Badge>
              </div>
              
              {/* Tiffin Search */}
              <div className="max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by cuisine, dish, or chef..."
                    className="pl-12 pr-4 h-12 rounded-full border-2 focus:border-primary"
                    value={tiffinSearchQuery}
                    onChange={(e) => setTiffinSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Cuisine Types */}
            <div className="mb-6 pb-4 border-b">
              <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Cuisines:</span>
                {tiffinCuisineTypes.map(cuisine => (
                  <Button
                    key={cuisine.id}
                    variant={selectedCuisine === cuisine.id ? "default" : "outline"}
                    size="sm"
                    className="rounded-full whitespace-nowrap"
                    onClick={() => setSelectedCuisine(selectedCuisine === cuisine.id ? null : cuisine.id)}
                  >
                    <span className="mr-1">{cuisine.emoji}</span>
                    {cuisine.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Dietary Filters */}
            <div className="mb-6 py-4 bg-muted/30 -mx-4 px-4 rounded-lg">
              <div className="flex items-center gap-4 overflow-x-auto pb-2">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Dietary:</span>
                {tiffinDietaryFilters.map(filter => (
                  <Button
                    key={filter.id}
                    variant={selectedDietary.includes(filter.id) ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => toggleDietary(filter.id)}
                  >
                    <filter.icon className={`h-4 w-4 mr-1 ${selectedDietary.includes(filter.id) ? "" : filter.color}`} />
                    {filter.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Safety Features Banner */}
            <div className="mb-6 py-4 px-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900/30">
              <div className="flex flex-wrap justify-center gap-6 md:gap-12">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Verified Kitchens</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Hygiene Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Safe Packaging</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Background Verified</span>
                </div>
              </div>
            </div>

            {/* Tiffin Tabs */}
            <Tabs value={tiffinActiveTab} onValueChange={setTiffinActiveTab} className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="providers">Home Chefs</TabsTrigger>
                <TabsTrigger value="subscriptions">Meal Plans</TabsTrigger>
                <TabsTrigger value="become-chef">Become a Chef</TabsTrigger>
              </TabsList>

              <TabsContent value="providers">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTiffinProviders.map(provider => (
                    <TiffinProviderCard
                      key={provider.id}
                      provider={provider}
                      onViewMenu={handleViewMenu}
                      onFavorite={toggleTiffinFavorite}
                      isFavorite={tiffinFavorites.includes(provider.id)}
                    />
                  ))}
                </div>
                {filteredTiffinProviders.length === 0 && (
                  <div className="text-center py-12">
                    <ChefHat className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No chefs found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="subscriptions">
                <div className="text-center mb-8">
                  <Badge className="mb-4 bg-primary/10 text-primary">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Save up to 20%
                  </Badge>
                  <h3 className="text-2xl font-bold mb-2">Meal Subscription Plans</h3>
                  <p className="text-muted-foreground">Never worry about cooking again</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { name: "Weekly Plan", meals: "5 meals/week", price: "$55", desc: "Perfect for weekday lunches", features: ["Choose your cuisine", "Flexible delivery", "Skip anytime"] },
                    { name: "Daily Plan", meals: "7 meals/week", price: "$70", desc: "Full week coverage", features: ["Daily fresh meals", "Weekend specials", "Priority delivery"], popular: true },
                    { name: "Family Plan", meals: "14 meals/week", price: "$120", desc: "Feed the whole family", features: ["4 servings/meal", "Mixed cuisines", "Custom preferences"] },
                  ].map((plan, i) => (
                    <Card key={i} className={`relative ${plan.popular ? 'border-primary ring-2 ring-primary/20' : ''}`}>
                      {plan.popular && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                          Most Popular
                        </Badge>
                      )}
                      <CardHeader className="text-center">
                        <CardTitle>{plan.name}</CardTitle>
                        <div className="text-3xl font-bold text-primary">{plan.price}<span className="text-sm font-normal text-muted-foreground">/week</span></div>
                        <p className="text-sm text-muted-foreground">{plan.meals}</p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>
                        <ul className="space-y-2 mb-6">
                          {plan.features.map((f, j) => (
                            <li key={j} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              {f}
                            </li>
                          ))}
                        </ul>
                        <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                          Choose Plan
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="become-chef">
                <Card className="max-w-2xl mx-auto">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <ChefHat className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Start Your Tiffin Business</CardTitle>
                    <p className="text-muted-foreground">Share your culinary heritage with the community</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { icon: DollarSign, title: "Set Your Prices", desc: "You control your rates" },
                        { icon: Clock, title: "Flexible Schedule", desc: "Cook when it suits you" },
                        { icon: Users, title: "Build Clientele", desc: "Grow your customer base" },
                        { icon: Shield, title: "Secure Payments", desc: "Get paid safely" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <item.icon className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full" size="lg" onClick={() => navigate("/become-tasker")}>
                      Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Tiffin Dialogs */}
            {selectedProvider && (
              <>
                <TiffinMenuDialog
                  isOpen={isMenuDialogOpen}
                  onClose={() => setIsMenuDialogOpen(false)}
                  provider={selectedProvider}
                  onOrder={handleOrder}
                />
                <TiffinOrderForm
                  isOpen={isOrderFormOpen}
                  onClose={() => setIsOrderFormOpen(false)}
                  providerId={selectedProvider.id}
                  providerName={selectedProvider.businessName}
                  cartItems={cartItems}
                />
              </>
            )}
          </>
        ) : (
          /* Standard task browse UI */
          <>

        {/* Smart Search */}
        <SmartSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onSearch={handleSearch}
          recentSearches={recentSearches}
          className="mb-6"
        />

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <QuickFilters
            activeFilters={activeQuickFilters}
            onToggle={handleQuickFilterToggle}
            hasLocation={!!userLocation}
          />
          <div className="ml-auto flex gap-2">
            {userId && (
              <SaveSearchDialog
                filters={getCurrentFilters()}
                userId={userId}
              />
            )}
            <Button variant="outline" onClick={() => navigate("/map")} className="gap-2">
              <MapPin className="h-4 w-4" />
              Map
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        <Card className="mb-6 border-border">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              {/* Category and filter toggle */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
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
                  More Filters
                  {hasActiveFilters && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </Button>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                    <X className="h-4 w-4" />
                    Clear All
                  </Button>
                )}
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
        </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Browse;
