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
import { Sparkles, Star, Shield, Clock, DollarSign, Users, Wrench, Briefcase, FileEdit, CheckCircle2, Search, MessageSquare, TrendingUp, Calendar, MapPin, Bell, Award, ShieldCheck, Lock, ArrowRight, Zap, User } from "lucide-react";
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
        title="Get Things Done - Find Trusted Help Anywhere"
        description="SaskTask connects you with verified professionals for any task. From home repairs to deliveries, find trusted help worldwide or earn money completing tasks."
        url="/"
        keywords={["task marketplace", "local help", "handyman", "cleaning services", "gig economy", "earn money", "hire help", "trusted professionals"]}
      />
      <HomePageSchema />
      <Navbar />

      {/* Spacer for fixed navbar */}
      <div className="h-16" />

      {/* Urgency Banner */}
      <UrgencyBanner />

      {/* Hero Section */}
      <section className="pt-12 sm:pt-20 pb-12 sm:pb-24 px-4 relative overflow-hidden">
        {/* Enhanced Background with mesh gradient */}
        <div className="absolute inset-0 bg-gradient-mesh -z-10" />
        <div className="absolute inset-0 bg-gradient-radial-lg -z-10" />

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow -z-10" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow -z-10" style={{ animationDelay: '1s' }} />

        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center max-w-7xl mx-auto">
            {/* Left: Text Content */}
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
              {/* Premium Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-semibold text-primary animate-fade-in shadow-sm"
                style={{ animationDelay: '0.1s' }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                {user ? "Welcome Back!" : "Trusted by Thousands Worldwide"}
              </div>

              {/* Main Headline */}
              <h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] animate-fade-up"
                style={{ animationDelay: '0.2s' }}
              >
                {user ? (
                  <>
                    Your Dashboard
                    <span className="block text-gradient-hero mt-2">
                      Awaits
                    </span>
                  </>
                ) : (
                  <>
                    Get Things Done
                    <span className="block text-gradient-hero mt-2">
                      The Easy Way
                    </span>
                  </>
                )}
              </h1>

              <p
                className="text-base sm:text-xl text-muted-foreground leading-relaxed animate-fade-up max-w-xl mx-auto lg:mx-0"
                style={{ animationDelay: '0.3s' }}
              >
                {user
                  ? "Access your dashboard to manage tasks, bookings, and connect with clients."
                  : "Connect with verified professionals. Trusted help for any task, anywhere."
                }
              </p>

              {/* Hero Search - Only for non-logged in users */}
              {!user && (
                <div className="animate-fade-up" style={{ animationDelay: '0.4s' }}>
                  <HeroSearch />
                </div>
              )}

              {/* CTA Buttons - For logged in users */}
              {user && (
                <div
                  className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-up justify-center lg:justify-start"
                  style={{ animationDelay: '0.4s' }}
                >
                  <Link to="/dashboard">
                    <Button size="lg" variant="premium" className="w-full sm:w-auto text-base sm:text-lg h-14 px-8 gap-3">
                      <Briefcase className="h-5 w-5" />
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/browse">
                    <Button size="lg" variant="premium-outline" className="w-full sm:w-auto text-base sm:text-lg h-14 px-8 gap-3">
                      <Search className="h-5 w-5" />
                      Browse Tasks
                    </Button>
                  </Link>
                </div>
              )}

              {/* Trust Indicators - Enhanced with glass effect */}
              <div
                className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 pt-6 sm:pt-8 animate-fade-up"
                style={{ animationDelay: '0.5s' }}
              >
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl glass-sm">
                      <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-colored">
                        <Briefcase className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm text-foreground">Dashboard</p>
                        <p className="text-xs text-muted-foreground">Quick Access</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl glass-sm">
                      <div className="h-10 w-10 rounded-xl bg-gradient-secondary flex items-center justify-center shadow-md">
                        <MessageSquare className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm text-foreground">Messages</p>
                        <p className="text-xs text-muted-foreground">Stay Connected</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl glass-sm hover:shadow-premium-md transition-all">
                      <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-colored">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm text-foreground">Verified Taskers</p>
                        <p className="text-xs text-muted-foreground">Background checked</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl glass-sm hover:shadow-premium-md transition-all">
                      <div className="h-10 w-10 rounded-xl bg-gradient-secondary flex items-center justify-center shadow-md">
                        <Lock className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm text-foreground">Secure Pay</p>
                        <p className="text-xs text-muted-foreground">Protected payments</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 px-4 py-3 rounded-2xl glass-sm hover:shadow-premium-md transition-all">
                      <div className="h-10 w-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-md">
                        <Star className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm text-foreground">4.9★ Rating</p>
                        <p className="text-xs text-muted-foreground">Trusted service</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right: Infographic with Dynamic Stats - Hidden on small mobile */}
            <div className="relative animate-scale-in hidden sm:block" style={{ animationDelay: '0.3s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl -z-10" />
              <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-border shadow-2xl hover-lift">
                <img
                  src={heroInfographic}
                  alt="SaskTask workflow: Post task, connect with verified professionals, get it done"
                  className="w-full h-auto rounded-xl sm:rounded-2xl"
                  loading="lazy"
                />
              </div>

              {/* Floating stats cards with real data - Adjusted for responsiveness */}
              <div className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 bg-card border border-border rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-xl animate-float">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    {stats.isLoading ? (
                      <>
                        <Skeleton className="h-6 sm:h-7 w-14 sm:w-16 mb-1" />
                        <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                      </>
                    ) : (
                      <>
                        <p className="text-xl sm:text-2xl font-bold text-foreground">
                          <StatsCounter end={stats.totalUsers} suffix={stats.totalUsers > 0 ? "" : ""} />
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Users</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 bg-card border border-border rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-xl animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    {stats.isLoading ? (
                      <>
                        <Skeleton className="h-6 sm:h-7 w-14 sm:w-16 mb-1" />
                        <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                      </>
                    ) : (
                      <>
                        <p className="text-xl sm:text-2xl font-bold text-foreground">
                          <StatsCounter end={stats.totalTasksCompleted} suffix="" />
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Tasks Done</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 -right-4 sm:-right-6 bg-card border border-border rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-xl animate-float hidden lg:block" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-sm sm:text-base text-foreground">
                    {stats.averageRating > 0 ? stats.averageRating : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For logged in users - show full content */}
      {user && (
        <>
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
            </div>
          </section>

          {/* Popular Taskers Section */}
          <PopularTaskers />

          {/* FAQ Section */}
          <FAQSection />

          {/* Testimonials Section */}
          <TestimonialsSection />
        </>
      )}

      {/* For guests - show privacy-focused content */}
      {!user && (
        <>
          {/* Social Proof Bar */}
          <SocialProofBar />

          {/* Why Join Section */}
          <section className="py-20 px-4 bg-gradient-to-b from-background via-muted/20 to-background">
            <div className="container mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Why Join SaskTask?
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Your privacy and security are our top priorities
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {[{
                  icon: Shield,
                  title: "Privacy Protected",
                  desc: "Your personal information is encrypted and never shared without consent"
                }, {
                  icon: Lock,
                  title: "Secure Payments",
                  desc: "Bank-level encryption protects all financial transactions"
                }, {
                  icon: ShieldCheck,
                  title: "Verified Members",
                  desc: "All users undergo identity verification for a trusted community"
                }, {
                  icon: Users,
                  title: "Local Community",
                  desc: "Connect with verified professionals in your Saskatchewan community"
                }, {
                  icon: Star,
                  title: "Trusted Reviews",
                  desc: "Transparent ratings from real users help you make informed decisions"
                }, {
                  icon: DollarSign,
                  title: "Fair Pricing",
                  desc: "Set your own rates with transparent, competitive commission"
                }].map((feature, i) => (
                  <Card key={i} className="border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                    <CardContent className="p-8 space-y-4">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <feature.icon className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works Preview */}
          <section className="py-20 px-4 bg-muted/30">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Simple & Secure</h2>
                <p className="text-xl text-muted-foreground">Get started in three easy steps</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {[{
                  step: "1",
                  title: "Create Account",
                  desc: "Sign up securely and verify your identity",
                  icon: User
                }, {
                  step: "2",
                  title: "Post or Find Tasks",
                  desc: "Connect with verified local professionals",
                  icon: Briefcase
                }, {
                  step: "3",
                  title: "Get It Done",
                  desc: "Complete tasks with secure payments",
                  icon: CheckCircle2
                }].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="relative inline-flex mb-6">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl">
                        <item.icon className="h-10 w-10 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm shadow-md">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section for Guests */}
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
                      <span className="text-white/90 text-sm font-medium">Join thousands of Saskatchewan users</span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                      Ready to Get Started?
                    </h2>
                    <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                      Create your free account and discover a trusted community of local professionals
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                      <Link to="/auth?tab=signup">
                        <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 shadow-xl text-lg h-14 px-8 gap-2">
                          Create Free Account
                          <ArrowRight className="h-5 w-5" />
                        </Button>
                      </Link>
                      <Link to="/auth?tab=signin">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border-white/30 text-white shadow-xl text-lg h-14 px-8">
                          Sign In
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
                        <span>Privacy protected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-yellow-300" />
                        <span>Secure & encrypted</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
};

export default Index;
