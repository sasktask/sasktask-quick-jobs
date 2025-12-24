import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { InstallAppButton } from "@/components/InstallAppButton";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { SEOHead, HomePageSchema } from "@/components/SEOHead";
import { FeaturedCategories } from "@/components/FeaturedCategories";
import { PopularThisWeek } from "@/components/PopularThisWeek";
import { SeasonalRecommendations } from "@/components/SeasonalRecommendations";
import { PopularTaskers } from "@/components/PopularTaskers";
import { FAQSection } from "@/components/FAQSection";
import { HeroSearch } from "@/components/HeroSearch";
import { UrgencyBanner } from "@/components/UrgencyBanner";
import { StatsCounter } from "@/components/StatsCounter";
import { SocialProofBar } from "@/components/SocialProofBar";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Star, Shield, Clock, DollarSign, Users, Wrench, Briefcase, FileEdit, CheckCircle2, Search, MessageSquare, TrendingUp, Calendar, MapPin, Bell, Award, ShieldCheck, Lock, ArrowRight, Zap } from "lucide-react";
import heroInfographic from "@/assets/hero-infographic.jpg";
import { initPerformanceOptimizations } from "@/lib/performance";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const stats = usePlatformStats();

  // Check if user is logged in and init performance
  useEffect(() => {
    initPerformanceOptimizations();
    
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsCheckingAuth(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Find Local Help or Earn Money in Saskatchewan"
        description="SaskTask connects you with verified local professionals for any task. From snow removal to home repairs, find trusted help in your Saskatchewan community or earn money completing tasks."
        url="/"
        keywords={["Saskatchewan tasks", "local help", "handyman", "cleaning services", "gig economy", "earn money", "hire help"]}
      />
      <HomePageSchema />
      <Navbar />
      
      {/* Urgency Banner */}
      <UrgencyBanner />
      
      {/* Hero Section - Bold & Vibrant */}
      <section className="pt-8 sm:pt-20 pb-16 sm:pb-24 px-4 relative overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 bg-gradient-mesh -z-10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-blob -z-10" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-blob animation-delay-2000 -z-10" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-blob animation-delay-4000 -z-10" />
        
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-7xl mx-auto">
            {/* Left: Text Content */}
            <div className="space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-full text-sm font-semibold text-primary animate-fade-in"
                style={{ animationDelay: '0.1s' }}
              >
                <Sparkles className="h-4 w-4 animate-pulse" />
                {user ? "Welcome Back!" : "Saskatchewan's #1 Task Platform"}
                <ArrowRight className="h-3 w-3" />
              </div>
              
              {/* Main Heading */}
              <h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight animate-fade-up"
                style={{ animationDelay: '0.2s' }}
              >
                {user ? (
                  <>
                    <span className="text-foreground">Your Dashboard</span>
                    <span className="block text-gradient-hero mt-2">Awaits</span>
                  </>
                ) : (
                  <>
                    <span className="text-foreground">Get Things Done</span>
                    <span className="block text-gradient-hero mt-2">The Easy Way</span>
                  </>
                )}
              </h1>
              
              {/* Subheading */}
              <p 
                className="text-lg sm:text-xl text-muted-foreground leading-relaxed animate-fade-up max-w-xl mx-auto lg:mx-0"
                style={{ animationDelay: '0.3s' }}
              >
                {user 
                  ? "Access your dashboard to manage tasks, bookings, and connect with clients."
                  : "Connect with verified local professionals for any task. Find trusted help in your Saskatchewan community."
                }
              </p>

              {/* Hero Search or CTA Buttons */}
              {!user ? (
                <div className="animate-fade-up pt-2" style={{ animationDelay: '0.4s' }}>
                  <HeroSearch />
                </div>
              ) : (
                <div 
                  className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-up justify-center lg:justify-start"
                  style={{ animationDelay: '0.4s' }}
                >
                  <Link to="/dashboard">
                    <Button size="lg" variant="hero" className="w-full sm:w-auto text-base sm:text-lg h-14 px-8 gap-2">
                      <Briefcase className="h-5 w-5" />
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link to="/browse">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg h-14 px-8 gap-2">
                      <Search className="h-5 w-5" />
                      Browse Tasks
                    </Button>
                  </Link>
                </div>
              )}

              {/* Trust Indicators */}
              <div 
                className="flex flex-wrap justify-center lg:justify-start gap-6 pt-8 animate-fade-up"
                style={{ animationDelay: '0.5s' }}
              >
                {user ? (
                  <>
                    <div className="flex items-center gap-3 group">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-foreground">Dashboard</p>
                        <p className="text-sm text-muted-foreground">Quick Access</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 group">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageSquare className="h-6 w-6 text-secondary" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-foreground">Messages</p>
                        <p className="text-sm text-muted-foreground">Stay Connected</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 group">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-foreground">Verified</p>
                        <p className="text-sm text-muted-foreground">Taskers</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 group">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Lock className="h-6 w-6 text-secondary" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-foreground">Secure</p>
                        <p className="text-sm text-muted-foreground">Payments</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 group">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Star className="h-6 w-6 text-accent fill-accent" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-foreground">Top Rated</p>
                        <p className="text-sm text-muted-foreground">Service</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right: Enhanced Hero Visual */}
            <div className="relative animate-scale-in hidden sm:block" style={{ animationDelay: '0.3s' }}>
              {/* Glow effect behind image */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30 rounded-3xl blur-3xl scale-110 -z-10" />
              
              {/* Main image card */}
              <div className="relative bg-card/80 backdrop-blur-xl rounded-3xl p-4 border border-border/50 shadow-2xl hover-lift">
                <img 
                  src={heroInfographic} 
                  alt="SaskTask workflow: Post task, connect with verified professionals, get it done" 
                  className="w-full h-auto rounded-2xl"
                  loading="lazy"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-4 rounded-2xl bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating stats - Users */}
              <div className="absolute -bottom-4 -left-4 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-4 shadow-xl animate-float">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-lg">
                    <Users className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    {stats.isLoading ? (
                      <>
                        <Skeleton className="h-7 w-16 mb-1" />
                        <Skeleton className="h-4 w-12" />
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-foreground">
                          <StatsCounter end={stats.totalUsers} />
                        </p>
                        <p className="text-sm text-muted-foreground">Users</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Floating stats - Tasks */}
              <div className="absolute -top-4 -right-4 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-4 shadow-xl animate-float" style={{animationDelay: '0.5s'}}>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div>
                    {stats.isLoading ? (
                      <>
                        <Skeleton className="h-7 w-16 mb-1" />
                        <Skeleton className="h-4 w-20" />
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-foreground">
                          <StatsCounter end={stats.totalTasksCompleted} />
                        </p>
                        <p className="text-sm text-muted-foreground">Tasks Done</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating badge */}
              <div className="absolute top-1/2 -translate-y-1/2 -right-6 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl px-4 py-3 shadow-xl animate-float hidden lg:flex items-center gap-2" style={{animationDelay: '1s'}}>
                <Star className="h-5 w-5 text-warning fill-warning" />
                <span className="font-bold text-foreground">
                  {stats.averageRating > 0 ? stats.averageRating : "5.0"}
                </span>
              </div>

              {/* Live indicator */}
              <div className="absolute bottom-1/4 -left-6 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl px-4 py-2 shadow-xl animate-float hidden lg:flex items-center gap-2" style={{animationDelay: '1.5s'}}>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                </span>
                <span className="text-sm font-medium text-foreground">Live Now</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Stats Section */}
      <section className="py-12 px-4 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold text-foreground">
                  {stats.isLoading ? <Skeleton className="h-8 w-12 inline-block" /> : <StatsCounter end={stats.totalTasksPostedToday} />}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Tasks Posted Today</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-5 w-5 text-secondary" />
                <span className="text-3xl font-bold text-foreground">
                  {stats.isLoading ? <Skeleton className="h-8 w-12 inline-block" /> : <StatsCounter end={stats.totalActiveTaskers} />}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Active Taskers</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-5 w-5 text-warning fill-warning" />
                <span className="text-3xl font-bold text-foreground">
                  {stats.isLoading ? <Skeleton className="h-8 w-12 inline-block" /> : (stats.averageRating > 0 ? stats.averageRating : "5.0")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="text-3xl font-bold text-foreground">
                  {stats.isLoading ? <Skeleton className="h-8 w-12 inline-block" /> : <StatsCounter end={stats.totalTasksCompleted} />}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      {!user && <SocialProofBar />}

      {/* Featured Categories Section */}
      <FeaturedCategories />

      {/* Seasonal Recommendations */}
      <SeasonalRecommendations />

      {/* Popular This Week Section */}
      <PopularThisWeek />

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">How SaskTask Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">A seamless platform connecting task givers with skilled task doers</p>
          </div>

          {/* For Task Givers */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 bg-primary/10 px-6 py-3 rounded-full mb-4">
                <Briefcase className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-bold text-primary">For Task Givers</h3>
              </div>
              <p className="text-muted-foreground">Post tasks and find reliable help in minutes</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[{
                icon: FileEdit,
                title: "Post Your Task",
                desc: "Describe what you need done, set your budget, location, and timeline",
                color: "from-blue-500 to-cyan-500"
              }, {
                icon: Users,
                title: "Browse Proposals",
                desc: "Receive offers from verified task doers with ratings, reviews, and profiles",
                color: "from-purple-500 to-pink-500"
              }, {
                icon: CheckCircle2,
                title: "Select & Connect",
                desc: "Choose the best match, discuss details via secure messaging, and confirm booking",
                color: "from-green-500 to-emerald-500"
              }, {
                icon: Star,
                title: "Pay & Review",
                desc: "Complete payment securely after task completion and leave feedback",
                color: "from-yellow-500 to-orange-500"
              }].map((item, i) => (
                <Card key={i} className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 hover-lift">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color}`}></div>
                  <CardContent className="p-6 space-y-4">
                    <div className="relative">
                      <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <item.icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md">
                        {i + 1}
                      </div>
                    </div>
                    <h4 className="text-lg font-bold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* For Task Doers */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 bg-secondary/10 px-6 py-3 rounded-full mb-4">
                <Wrench className="h-6 w-6 text-secondary" />
                <h3 className="text-2xl font-bold text-secondary">For Task Doers</h3>
              </div>
              <p className="text-muted-foreground">Find flexible work opportunities and grow your business</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[{
                icon: Search,
                title: "Browse Tasks",
                desc: "Explore available tasks by category, location, budget, and schedule",
                color: "from-indigo-500 to-blue-500"
              }, {
                icon: MessageSquare,
                title: "Submit Proposals",
                desc: "Send offers with your rates, availability, and showcase your verified credentials",
                color: "from-violet-500 to-purple-500"
              }, {
                icon: Briefcase,
                title: "Get Hired",
                desc: "Get selected by task givers, confirm details, and schedule the work",
                color: "from-cyan-500 to-teal-500"
              }, {
                icon: TrendingUp,
                title: "Build Reputation",
                desc: "Complete tasks, receive payments instantly, and earn 5-star reviews",
                color: "from-amber-500 to-orange-500"
              }].map((item, i) => (
                <Card key={i} className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 hover:border-secondary/50 hover-lift">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color}`}></div>
                  <CardContent className="p-6 space-y-4">
                    <div className="relative">
                      <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <item.icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm shadow-md">
                        {i + 1}
                      </div>
                    </div>
                    <h4 className="text-lg font-bold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Advanced Features */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Advanced Features</h3>
              <p className="text-muted-foreground">Everything you need for a seamless experience</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[{
                icon: MessageSquare,
                title: "Real-Time Messaging",
                desc: "Chat instantly with task givers and doers through our secure platform"
              }, {
                icon: DollarSign,
                title: "Secure Payments",
                desc: "Escrow protection ensures payment only after successful completion"
              }, {
                icon: Calendar,
                title: "Smart Scheduling",
                desc: "Built-in calendar to manage multiple tasks and bookings effortlessly"
              }, {
                icon: MapPin,
                title: "Location Tracking",
                desc: "GPS-based task matching connects you with nearby opportunities"
              }, {
                icon: Bell,
                title: "Instant Notifications",
                desc: "Get real-time alerts for new offers, messages, and booking updates"
              }, {
                icon: Award,
                title: "Achievement Badges",
                desc: "Earn recognition badges as you complete more tasks and build expertise"
              }].map((item, i) => (
                <Card key={i} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border hover:border-primary/50">
                  <CardContent className="p-6 space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-bold text-lg">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Safety & Trust */}
          <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-3xl p-8 md:p-12 border-2 border-primary/10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-3 bg-primary/10 px-6 py-3 rounded-full mb-4">
                <ShieldCheck className="h-7 w-7 text-primary" />
                <h3 className="text-3xl font-bold">Safety & Trust</h3>
              </div>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">Your security is our top priority. We've built multiple layers of protection</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[{
                icon: ShieldCheck,
                title: "ID Verification",
                desc: "All users undergo mandatory identity verification with government-issued documents",
                badge: "Required"
              }, {
                icon: Shield,
                title: "Background Checks",
                desc: "Optional enhanced background screening for task doers in sensitive categories",
                badge: "Optional"
              }, {
                icon: Lock,
                title: "Secure Payments",
                desc: "Bank-level encryption and escrow protection for all financial transactions",
                badge: "Protected"
              }, {
                icon: Star,
                title: "Rating System",
                desc: "Transparent reviews and ratings help you make informed decisions every time",
                badge: "Verified"
              }].map((item, i) => (
                <Card key={i} className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 bg-background hover-lift">
                  <CardContent className="p-6 space-y-4 relative">
                    <div className="absolute top-4 right-4">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary">
                        {item.badge}
                      </span>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <item.icon className="h-7 w-7 text-white" />
                    </div>
                    <h4 className="font-bold text-lg pr-16">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-10 text-center">
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                <Shield className="inline h-4 w-4 mr-1" />
                Our 24/7 support team monitors all activities and is ready to assist with disputes or concerns
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Choose SaskTask?</h2>
            <p className="text-xl text-muted-foreground">Built for trust, speed, and reliability</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[{
              icon: Shield,
              title: "Verified Users",
              desc: "All users are verified with ratings and reviews"
            }, {
              icon: Clock,
              title: "Quick Matching",
              desc: "Find the right person for your task in minutes"
            }, {
              icon: DollarSign,
              title: "Fair Pricing",
              desc: "Set your own rates with transparent commission"
            }, {
              icon: Star,
              title: "Rating System",
              desc: "Build your reputation with verified reviews"
            }, {
              icon: Users,
              title: "Large Network",
              desc: "Thousands of task givers and doers"
            }, {
              icon: Shield,
              title: "Secure Payments",
              desc: "Protected payment processing"
            }].map((feature, i) => (
              <Card key={i} className="border-border hover:shadow-lg transition-shadow hover-lift">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Taskers Section */}
      <PopularTaskers />

      {/* FAQ Section */}
      <FAQSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section - Enhanced */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-br from-primary via-primary/90 to-secondary border-0 overflow-hidden relative">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <CardContent className="p-8 md:p-16 relative z-10">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
                  <Zap className="h-4 w-4 text-yellow-300" />
                  <span className="text-white/90 text-sm font-medium">Join 5,000+ Saskatchewan users</span>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  Ready to Get Things Done?
                </h2>
                <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  Whether you need help with tasks or want to earn money, SaskTask connects you with your community
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                  <Link to="/auth">
                    <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 shadow-xl text-lg h-14 px-8 gap-2">
                      Get Started Free
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/browse">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border-white/30 text-white shadow-xl text-lg h-14 px-8">
                      Explore Tasks
                    </Button>
                  </Link>
                </div>

                {/* Trust indicators */}
                <div className="flex flex-wrap justify-center gap-6 text-white/70 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    <span>Free to sign up</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-300" />
                    <span>Secure payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-300" />
                    <span>4.9 average rating</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
