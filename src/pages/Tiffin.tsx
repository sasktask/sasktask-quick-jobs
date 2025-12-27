import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { 
  TiffinProviderCard,
  TiffinMenuDialog,
  TiffinOrderForm,
  TiffinSubscriptionDialog
} from "@/components/tiffin";
import { 
  Utensils, 
  MapPin, 
  Star, 
  Clock, 
  Leaf, 
  Shield, 
  Heart,
  Search,
  Filter,
  ChefHat,
  Flame,
  Award,
  Package,
  Calendar,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Globe,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

// Cuisine types with cultural origins
const cuisineTypes = [
  { id: "indian", name: "Indian", emoji: "🇮🇳", regions: ["North Indian", "South Indian", "Gujarati", "Punjabi", "Bengali"] },
  { id: "chinese", name: "Chinese", emoji: "🇨🇳", regions: ["Cantonese", "Sichuan", "Hakka"] },
  { id: "middle-eastern", name: "Middle Eastern", emoji: "🌙", regions: ["Lebanese", "Turkish", "Persian"] },
  { id: "african", name: "African", emoji: "🌍", regions: ["Ethiopian", "Nigerian", "Moroccan"] },
  { id: "caribbean", name: "Caribbean", emoji: "🏝️", regions: ["Jamaican", "Trinidadian"] },
  { id: "asian", name: "Pan-Asian", emoji: "🥢", regions: ["Thai", "Vietnamese", "Korean", "Japanese"] },
  { id: "european", name: "European", emoji: "🇪🇺", regions: ["Italian", "Greek", "Ukrainian"] },
  { id: "canadian", name: "Canadian", emoji: "🍁", regions: ["Prairie", "French-Canadian"] },
];

const dietaryFilters = [
  { id: "vegetarian", name: "Vegetarian", icon: Leaf, color: "text-green-500" },
  { id: "vegan", name: "Vegan", icon: Leaf, color: "text-emerald-500" },
  { id: "halal", name: "Halal", icon: Award, color: "text-amber-500" },
  { id: "gluten-free", name: "Gluten-Free", icon: CheckCircle2, color: "text-blue-500" },
];

// Enhanced featured providers
const featuredProviders = [
  {
    id: "1",
    businessName: "Grandma's Kitchen",
    cuisineType: ["North Indian", "Punjabi"],
    description: "Authentic home-style Punjabi food made with love, just like grandma used to make. Fresh rotis, rich dals, and aromatic curries.",
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
    description: "Traditional South Indian meals with authentic spices and fresh ingredients. Dosa, idli, and banana leaf thalis.",
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
    description: "Fresh Mediterranean cuisine with homemade hummus, falafel, and grilled meats. Healthy and flavorful.",
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
    description: "Homestyle Chinese comfort food, dim sum weekends, and hearty noodle bowls. Family recipes passed down generations.",
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
    description: "Authentic East African cuisine with injera bread and flavorful stews. A unique dining experience.",
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
    description: "Fresh Thai street food classics made at home. Pad Thai, curries, and refreshing salads.",
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

export default function Tiffin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkAuth();
  }, []);

  const toggleDietary = (id: string) => {
    setSelectedDietary(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const toggleFavorite = (providerId: string) => {
    if (!user) {
      toast.error("Please login to save favorites");
      return;
    }
    setFavorites(prev => 
      prev.includes(providerId) 
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
    toast.success(favorites.includes(providerId) ? "Removed from favorites" : "Added to favorites");
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

  // Filter providers based on search and filters
  const filteredProviders = featuredProviders.filter(provider => {
    const matchesSearch = searchQuery === "" || 
      provider.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.cuisineType.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
      provider.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCuisine = !selectedCuisine || 
      cuisineTypes.find(c => c.id === selectedCuisine)?.regions.some(r => 
        provider.cuisineType.includes(r)
      );
    
    const matchesDietary = selectedDietary.length === 0 || 
      selectedDietary.every(filter => {
        if (filter === "vegetarian") return provider.isVegetarian;
        if (filter === "vegan") return provider.isVegan;
        if (filter === "halal") return provider.isHalal;
        if (filter === "gluten-free") return provider.isGlutenFree;
        return true;
      });
    
    return matchesSearch && matchesCuisine && matchesDietary;
  });

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Tiffin Services - Home-Cooked Meals Delivered | SaskTask"
        description="Order authentic home-cooked tiffin meals from local home chefs. Indian, Chinese, Middle Eastern, and more cuisines. Fresh, hygienic, and delivered to your door."
        url="/tiffin"
        keywords={["tiffin service", "home cooked meals", "Indian food delivery", "meal subscription", "food delivery"]}
      />
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-orange-50 via-background to-amber-50 dark:from-orange-950/20 dark:via-background dark:to-amber-950/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
              <Utensils className="h-3 w-3 mr-1" />
              Home-Cooked Goodness
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Tiffin Services
              <span className="block text-2xl md:text-3xl text-muted-foreground font-normal mt-2">
                Authentic Home-Cooked Meals, Delivered Fresh
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with local home chefs offering traditional recipes from around the world. 
              Fresh, hygienic, and made with love - just like home.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by cuisine, dish, or location..."
                className="pl-12 pr-4 h-14 text-lg rounded-full border-2 focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Cuisine Types */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Cuisines:</span>
            {cuisineTypes.map(cuisine => (
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
      </section>

      {/* Dietary Filters */}
      <section className="py-4 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Dietary:</span>
            {dietaryFilters.map(filter => (
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
      </section>

      {/* Safety Features Banner */}
      <section className="py-6 bg-green-50 dark:bg-green-950/20 border-b">
        <div className="container mx-auto px-4">
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
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Tabs defaultValue="providers" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="providers">Home Chefs</TabsTrigger>
              <TabsTrigger value="subscriptions">Meal Plans</TabsTrigger>
              <TabsTrigger value="become-chef">Become a Chef</TabsTrigger>
            </TabsList>

            <TabsContent value="providers">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProviders.map(provider => (
                  <TiffinProviderCard
                    key={provider.id}
                    provider={provider}
                    onViewMenu={handleViewMenu}
                    onFavorite={toggleFavorite}
                    isFavorite={favorites.includes(provider.id)}
                  />
                ))}
              </div>
              {filteredProviders.length === 0 && (
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
                  { 
                    name: "Weekly Plan", 
                    meals: "5 meals/week", 
                    price: "$55", 
                    desc: "Perfect for weekday lunches",
                    features: ["Choose your cuisine", "Flexible delivery times", "Skip anytime"]
                  },
                  { 
                    name: "Daily Plan", 
                    meals: "7 meals/week", 
                    price: "$70", 
                    desc: "Full week coverage",
                    features: ["Daily fresh meals", "Weekend specials", "Priority delivery"],
                    popular: true
                  },
                  { 
                    name: "Family Plan", 
                    meals: "14 meals/week", 
                    price: "$120", 
                    desc: "Feed the whole family",
                    features: ["4 servings per meal", "Mixed cuisines", "Custom preferences"]
                  },
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
                      <p className="text-center text-muted-foreground mb-4">{plan.desc}</p>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full" 
                        variant={plan.popular ? "default" : "outline"}
                        onClick={() => setIsSubscriptionDialogOpen(true)}
                      >
                        Subscribe Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="become-chef">
              <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <ChefHat className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Start Your Tiffin Business</CardTitle>
                  <p className="text-muted-foreground">Share your culinary heritage with the community</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { icon: Clock, title: "Flexible Hours", desc: "Cook when it suits you" },
                      { icon: Heart, title: "Share Your Culture", desc: "Traditional recipes welcome" },
                      { icon: Shield, title: "Safety Support", desc: "We help with certifications" },
                      { icon: Calendar, title: "Subscription Model", desc: "Predictable income" },
                    ].map((benefit, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <benefit.icon className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">{benefit.title}</p>
                          <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-amber-600" />
                      Safety Requirements
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Food handler certification (we can help)</li>
                      <li>• Kitchen hygiene inspection</li>
                      <li>• Background verification</li>
                      <li>• Regular health checks</li>
                    </ul>
                  </div>
                  
                  <Link to={user ? "/become-tiffin-provider" : "/auth"}>
                    <Button className="w-full" size="lg">
                      {user ? "Start Application" : "Sign Up to Get Started"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">How Tiffin Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: 1, icon: Search, title: "Browse", desc: "Explore local home chefs by cuisine & region" },
              { step: 2, icon: Utensils, title: "Choose", desc: "Select meals or subscribe to a plan" },
              { step: 3, icon: Calendar, title: "Schedule", desc: "Pick delivery times that work for you" },
              { step: 4, icon: Package, title: "Enjoy", desc: "Fresh home-cooked meals at your door" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative mx-auto mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}