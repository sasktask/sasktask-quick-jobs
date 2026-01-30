import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ServicesCategoryGrid,
  ServicesSearchBar,
  AIRecommendedServices,
  ServiceQuickActions
} from "@/components/services";
import {
  Sparkles, TrendingUp, Zap, MapPin, Users, ArrowRight, Star,
  Clock, Shield, Award, ChevronRight, Target
} from "lucide-react";
import { useAuth } from "@/hooks/useAuthContext";

// Stats data
const platformStats = [
  { label: "Active Tasks", value: "2,450+", icon: Target, color: "text-blue-500" },
  { label: "Verified Taskers", value: "850+", icon: Shield, color: "text-green-500" },
  { label: "Completed Today", value: "127", icon: Zap, color: "text-yellow-500" },
  { label: "Avg. Rating", value: "4.8", icon: Star, color: "text-orange-500" }
];

export default function ServicesHub() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, userRoles, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("discover");
  
  const isTaskGiver = userRoles.includes('task_giver');
  const isTaskDoer = userRoles.includes('task_doer');
  const hasBothRoles = isTaskGiver && isTaskDoer;
  
  const userRole: "task_giver" | "task_doer" | "both" = hasBothRoles 
    ? "both" 
    : isTaskDoer 
      ? "task_doer" 
      : "task_giver";

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth?redirect=/services-hub");
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <SEOHead
        title="Services Hub - SaskTask"
        description="Discover and access all SaskTask services. Find tasks, hire professionals, or earn money completing work."
        url="/services-hub"
      />

      <div className="container max-w-7xl py-6 space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-6 md:p-8"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Services Hub</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {isTaskDoer ? "Find Work That Matches Your Skills" : "Get Help With Any Task"}
            </h1>
            <p className="text-muted-foreground max-w-2xl mb-6">
              {isTaskDoer 
                ? "Discover tasks in your area, set your availability, and start earning today."
                : "Post a task or browse our verified professionals to get things done quickly and safely."}
            </p>

            {/* Platform Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {platformStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-background/80 backdrop-blur-sm rounded-lg p-3 border"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-lg font-bold">{stat.value}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </motion.div>

        {/* Quick Actions */}
        <ServiceQuickActions userRole={userRole} />

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <ServicesSearchBar />
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="discover" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <Target className="w-4 h-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="trending" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-8">
            {/* AI Recommendations */}
            <AIRecommendedServices userId={user?.id} userRole={userRole} />

            {/* Featured Categories */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Popular Categories</h2>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("categories")}>
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <ServicesCategoryGrid showCounts={true} />
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4">All Service Categories</h2>
                <p className="text-muted-foreground mb-6">
                  Browse all available service categories and find exactly what you need
                </p>
              </div>
              <ServicesCategoryGrid showCounts={true} />
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Trending Services</h2>
              <p className="text-muted-foreground mb-6">
                Most requested services this week in Saskatchewan
              </p>
            </div>
            
            {/* Trending services list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Snow Removal", requests: 89, growth: "+45%", icon: "❄️" },
                { title: "House Cleaning", requests: 67, growth: "+23%", icon: "🧹" },
                { title: "Furniture Assembly", requests: 54, growth: "+18%", icon: "🪑" },
                { title: "Moving Help", requests: 48, growth: "+12%", icon: "📦" },
                { title: "Handyman Services", requests: 42, growth: "+8%", icon: "🔧" },
                { title: "Dog Walking", requests: 38, growth: "+15%", icon: "🐕" }
              ].map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => navigate(`/browse?q=${encodeURIComponent(service.title)}`)}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="text-3xl">{service.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{service.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {service.requests} requests this week
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {service.growth}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold mb-2">
              {isTaskDoer ? "Ready to Start Earning?" : "Need Something Done?"}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {isTaskDoer 
                ? "Go online now and accept instant tasks in your area"
                : "Post your task and get matched with verified professionals instantly"}
            </p>
            <div className="flex gap-4 justify-center">
              {isTaskDoer && (
                <Button size="lg" onClick={() => navigate("/instant-work")}>
                  <Zap className="w-5 h-5 mr-2" />
                  Go Online
                </Button>
              )}
              {isTaskGiver && (
                <Button size="lg" variant={isTaskDoer ? "outline" : "default"} onClick={() => navigate("/post-task")}>
                  Post a Task
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
