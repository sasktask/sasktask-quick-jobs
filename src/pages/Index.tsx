import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { InstallAppButton } from "@/components/InstallAppButton";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { SEOHead } from "@/components/SEOHead";
import { FeaturedCategories } from "@/components/FeaturedCategories";
import { PopularThisWeek } from "@/components/PopularThisWeek";
import { SeasonalRecommendations } from "@/components/SeasonalRecommendations";
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Snowflake, Sparkles, Truck, Star, Shield, Clock, DollarSign, Users, Wrench, Package, Monitor, Trees, Home, PaintBucket, MoreHorizontal, Briefcase, FileEdit, CheckCircle2, Search, MessageSquare, TrendingUp, Calendar, MapPin, Bell, Award, ShieldCheck, Lock, Plus } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import heroInfographic from "@/assets/hero-infographic.jpg";
import logo from "@/assets/sasktask-logo.png";

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);

  // Check if user is logged in
  useEffect(() => {
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
  const categories = [{
    name: "Snow Removal",
    icon: "❄️",
    path: "/browse?category=Snow Removal"
  }, {
    name: "Cleaning",
    icon: "🧹",
    path: "/browse?category=Cleaning"
  }, {
    name: "Moving",
    icon: "📦",
    path: "/browse?category=Moving"
  }, {
    name: "Delivery",
    icon: "🚚",
    path: "/browse?category=Delivery"
  }, {
    name: "Handyman",
    icon: "🔧",
    path: "/browse?category=Handyman"
  }, {
    name: "Gardening",
    icon: "🌱",
    path: "/browse?category=Gardening"
  }, {
    name: "Pet Care",
    icon: "🐾",
    path: "/browse?category=Pet Care"
  }, {
    name: "Painting",
    icon: "🎨",
    path: "/browse?category=Painting"
  }];
  const popularSearches = ["Snow Removal", "Cleaning", "Moving Help", "Assembly"];

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search functionality
  useEffect(() => {
    const searchTasks = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }
      setIsSearching(true);
      setShowResults(true);
      try {
        // Search in tasks
        const {
          data: tasks,
          error
        } = await supabase.from("tasks").select("*").or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`).eq("status", "open").limit(5);
        if (error) throw error;

        // Combine with category matches
        const categoryMatches = categories.filter(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase()));
        const results = [...categoryMatches.map(cat => ({
          type: "category",
          ...cat
        })), ...(tasks || []).map(task => ({
          type: "task",
          ...task
        }))];
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    const debounce = setTimeout(searchTasks, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);
  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
    }
  };
  const handlePopularSearchClick = (term: string) => {
    setSearchQuery(term);
    navigate(`/browse?category=${encodeURIComponent(term)}`);
  };
  const handleResultClick = (result: any) => {
    if (result.type === "category") {
      navigate(result.path);
    } else {
      navigate(`/task/${result.id}`);
    }
    setShowResults(false);
    setSearchQuery("");
  };

  return <div className="min-h-screen bg-background">
      <SEOHead 
        title="SaskTask - Find Local Help or Earn Money in Saskatchewan"
        description="SaskTask connects you with verified local professionals for any task. From snow removal to home repairs, find trusted help in your Saskatchewan community or earn money completing tasks."
        url="/"
      />
      <Navbar />
      
      {/* Hero Section - Different for logged in vs logged out */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 -z-10" />
        
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left: Text Content */}
            <div className="space-y-6 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                {user ? "Welcome Back!" : "Saskatchewan's #1 Task Platform"}
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                {user ? (
                  <>
                    Your Dashboard
                    <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                      Awaits
                    </span>
                  </>
                ) : (
                  <>
                    Get Things Done
                    <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                      The Easy Way
                    </span>
                  </>
                )}
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                {user 
                  ? "Access your professional dashboard to manage tasks, view bookings, track earnings, and connect with clients or find work opportunities."
                  : "Connect with verified local professionals for any task. From snow removal to home repairs, find trusted help in your Saskatchewan community."
                }
              </p>

              {/* CTA Buttons - Different for logged in users */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {user ? (
                  <>
                    <Link to="/dashboard">
                      <Button size="lg" variant="hero" className="w-full sm:w-auto text-lg h-14 px-8">
                        <Briefcase className="mr-2 h-5 w-5" />
                        Go to Dashboard
                      </Button>
                    </Link>
                    <Link to="/browse">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 border-2">
                        <Search className="mr-2 h-5 w-5" />
                        Browse Tasks
                      </Button>
                    </Link>
                    <Link to="/find-taskers">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 border-2">
                        <Users className="mr-2 h-5 w-5" />
                        Find Taskers
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/browse">
                      <Button size="lg" variant="hero" className="w-full sm:w-auto text-lg h-14 px-8">
                        <Search className="mr-2 h-5 w-5" />
                        Browse Tasks
                      </Button>
                    </Link>
                    <Link to="/post-task">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 border-2">
                        <FileEdit className="mr-2 h-5 w-5" />
                        Post a Task
                      </Button>
                    </Link>
                    <InstallAppButton 
                      variant="outline" 
                      size="lg" 
                      className="w-full sm:w-auto text-lg h-14 px-8 border-2 border-primary/50 hover:bg-primary/10"
                      showOnDesktop={true}
                    />
                  </>
                )}
              </div>

              {/* Trust Indicators - Different for logged in */}
              <div className="flex flex-wrap gap-6 pt-6 border-t border-border">
                {user ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">Quick Access</p>
                        <p className="text-sm text-muted-foreground">Dashboard</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">Messages</p>
                        <p className="text-sm text-muted-foreground">Stay Connected</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">Earnings</p>
                        <p className="text-sm text-muted-foreground">Track Progress</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">Verified</p>
                        <p className="text-sm text-muted-foreground">Taskers</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Lock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">Secure</p>
                        <p className="text-sm text-muted-foreground">Payments</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Star className="h-5 w-5 text-primary fill-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">Top Rated</p>
                        <p className="text-sm text-muted-foreground">Service</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right: Infographic */}
            <div className="relative animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl -z-10" />
              <div className="relative bg-card/50 backdrop-blur-sm rounded-3xl p-4 border border-border shadow-2xl">
                <img 
                  src={heroInfographic} 
                  alt="SaskTask workflow: Post task, connect with verified professionals, get it done" 
                  className="w-full h-auto rounded-2xl"
                />
              </div>

              {/* Floating stats cards */}
              <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-2xl p-4 shadow-xl animate-bounce-slow">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">1000+</p>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 bg-card border border-border rounded-2xl p-4 shadow-xl animate-bounce-slow" style={{animationDelay: '0.5s'}}>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">500+</p>
                    <p className="text-sm text-muted-foreground">Tasks Completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
            }].map((item, i) => <Card key={i} className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50">
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
                </Card>)}
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
            }].map((item, i) => <Card key={i} className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 hover:border-secondary/50">
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
                </Card>)}
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
            }].map((item, i) => <Card key={i} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border hover:border-primary/50">
                  <CardContent className="p-6 space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-bold text-lg">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>)}
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
            }].map((item, i) => <Card key={i} className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 bg-background">
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
                </Card>)}
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
          }].map((feature, i) => <Card key={i} className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-br from-primary via-primary/90 to-secondary border-0 overflow-hidden relative">
            <CardContent className="p-12 text-center relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of task givers and doers who trust SaskTask for their short-term job needs
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/auth">
                  <Button variant="accent" size="lg" className="shadow-xl">
                    Sign Up Now
                  </Button>
                </Link>
                <Link to="/browse">
                  <Button variant="outline" size="lg" className="bg-white hover:bg-white/90 border-0 shadow-xl">
                    Explore Tasks
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Index;