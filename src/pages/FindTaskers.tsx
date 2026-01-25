import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { CategoryTaskerBrowse } from "@/components/tasker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, TrendingUp, Award, Star, Briefcase, 
  Sparkles, ArrowRight, MapPin
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FindTaskers() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTaskers: 0,
    verifiedTaskers: 0,
    averageRating: 0,
    totalTasksCompleted: 0,
  });

  const categoryParam = searchParams.get("category") || undefined;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total task doers count
      const { count: totalCount } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "task_doer");

      // Get verified count
      const { count: verifiedCount } = await supabase
        .from("verifications")
        .select("*", { count: "exact", head: true })
        .eq("verification_status", "verified");

      // Get average rating
      const { data: ratingData } = await supabase
        .from("profiles")
        .select("rating")
        .not("rating", "is", null)
        .gt("rating", 0);

      const avgRating = ratingData?.length 
        ? ratingData.reduce((sum, p) => sum + (p.rating || 0), 0) / ratingData.length 
        : 0;

      // Get total completed tasks
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

  return (
    <>
      <SEOHead
        title="Find Trusted Taskers - SaskTask"
        description="Browse and hire verified taskers in Saskatchewan. Filter by category, hourly rate, and ratings to find the perfect help for your task."
      />

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 pt-28 pb-20">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Users className="h-3.5 w-3.5 mr-1" />
              TaskRabbit-Style Marketplace
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Find <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Trusted Taskers</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Browse skilled professionals by category, compare rates, read reviews, and hire instantly
            </p>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <Card className="bg-card/50 border-primary/10">
                <CardContent className="p-4 text-center">
                  <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{stats.totalTaskers}</p>
                  <p className="text-xs text-muted-foreground">Total Taskers</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-primary/10">
                <CardContent className="p-4 text-center">
                  <Award className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">{stats.verifiedTaskers}</p>
                  <p className="text-xs text-muted-foreground">Verified</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-primary/10">
                <CardContent className="p-4 text-center">
                  <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Avg Rating</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-primary/10">
                <CardContent className="p-4 text-center">
                  <Briefcase className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{stats.totalTasksCompleted.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Tasks Done</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="browse" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="browse" className="gap-2">
                <Users className="h-4 w-4" />
                Browse Taskers
              </TabsTrigger>
              <TabsTrigger value="categories" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                By Category
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse">
              <CategoryTaskerBrowse initialCategory={categoryParam} />
            </TabsContent>

            <TabsContent value="categories">
              <div className="space-y-8">
                {/* Popular Categories Grid */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">Browse by Category</h2>
                  <p className="text-muted-foreground mb-6">
                    Click a category to see taskers specializing in that service
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[
                      { name: "Cleaning", icon: "🧹", count: "50+" },
                      { name: "Moving & Delivery", icon: "📦", count: "35+" },
                      { name: "Handyman Services", icon: "🔧", count: "40+" },
                      { name: "Yard Work", icon: "🌿", count: "30+" },
                      { name: "Snow Removal", icon: "❄️", count: "25+" },
                      { name: "Assembly", icon: "🔩", count: "20+" },
                      { name: "Pet Care", icon: "🐕", count: "15+" },
                      { name: "Electrical Work", icon: "⚡", count: "12+" },
                    ].map((cat) => (
                      <Card 
                        key={cat.name}
                        className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all group"
                        onClick={() => navigate(`/find-taskers?category=${encodeURIComponent(cat.name)}`)}
                      >
                        <CardContent className="p-6 text-center">
                          <span className="text-4xl mb-3 block">{cat.icon}</span>
                          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                            {cat.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{cat.count} taskers</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                  <CardContent className="p-8 text-center">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-2xl font-bold mb-2">Can't find what you need?</h3>
                    <p className="text-muted-foreground mb-4">
                      Post a task and let taskers come to you with their best offers
                    </p>
                    <Button onClick={() => navigate("/post-task")} size="lg" className="gap-2">
                      Post a Task
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* How It Works */}
          <div className="mt-16 pt-16 border-t border-border">
            <h2 className="text-2xl font-bold text-center mb-8">How TaskRabbit-Style Hiring Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  step: "1",
                  title: "Browse Taskers",
                  description: "Filter by category, rate, and ratings to find the right match"
                },
                {
                  step: "2",
                  title: "View Profiles",
                  description: "Check reviews, portfolios, and verified credentials"
                },
                {
                  step: "3",
                  title: "Hire Instantly",
                  description: "Send a task offer directly or post for bids"
                },
                {
                  step: "4",
                  title: "Get It Done",
                  description: "Pay securely through escrow once the task is complete"
                },
              ].map((item) => (
                <Card key={item.step} className="text-center">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mx-auto mb-4">
                      {item.step}
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
}
