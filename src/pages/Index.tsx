import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Snowflake, 
  Sparkles, 
  Truck, 
  Star, 
  Shield, 
  Clock,
  DollarSign,
  Users,
  Wrench,
  Package,
  Monitor,
  Trees,
  Home,
  PaintBucket,
  MoreHorizontal,
  Briefcase,
  FileEdit,
  CheckCircle2,
  Search,
  MessageSquare,
  TrendingUp,
  Calendar,
  MapPin,
  Bell,
  Award,
  ShieldCheck,
  Lock
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import logo from "@/assets/sasktask-logo.png";

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const categories = [
    { name: "Snow Removal", icon: "❄️", path: "/browse?category=Snow Removal" },
    { name: "Cleaning", icon: "🧹", path: "/browse?category=Cleaning" },
    { name: "Moving", icon: "📦", path: "/browse?category=Moving" },
    { name: "Delivery", icon: "🚚", path: "/browse?category=Delivery" },
    { name: "Handyman", icon: "🔧", path: "/browse?category=Handyman" },
    { name: "Gardening", icon: "🌱", path: "/browse?category=Gardening" },
    { name: "Pet Care", icon: "🐾", path: "/browse?category=Pet Care" },
    { name: "Painting", icon: "🎨", path: "/browse?category=Painting" },
  ];

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
        const { data: tasks, error } = await supabase
          .from("tasks")
          .select("*")
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`)
          .eq("status", "open")
          .limit(5);

        if (error) throw error;

        // Combine with category matches
        const categoryMatches = categories.filter(cat =>
          cat.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const results = [
          ...categoryMatches.map(cat => ({ type: "category", ...cat })),
          ...(tasks || []).map(task => ({ type: "task", ...task }))
        ];

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Unique Corner Decorative Elements - Better than TaskRabbit */}
        <div className="absolute inset-0 -z-10">
          {/* Top Left Corner - Flowing Organic Shape with Patterns */}
          <div className="absolute -top-48 -left-48 w-[550px] h-[550px] pointer-events-none">
            {/* Main gradient blob */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/15 to-transparent rounded-full blur-3xl animate-float" />
            {/* Accent ring */}
            <div className="absolute top-24 left-24 w-80 h-80 bg-gradient-to-br from-accent/30 to-transparent rounded-full animate-pulse" style={{ animationDuration: "3s" }} />
            {/* Dots Grid Pattern */}
            <div className="absolute top-36 left-36 grid grid-cols-6 gap-3 opacity-40">
              {[...Array(24)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-2 h-2 bg-primary rounded-full animate-glow-pulse" 
                  style={{ animationDelay: `${i * 0.1}s` }} 
                />
              ))}
            </div>
            {/* Diagonal Stripes SVG */}
            <svg className="absolute top-0 left-0 w-full h-full opacity-15" viewBox="0 0 550 550">
              <defs>
                <pattern id="stripes-tl" patternUnits="userSpaceOnUse" width="12" height="12" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="12" stroke="hsl(var(--primary))" strokeWidth="2.5" />
                </pattern>
              </defs>
              <circle cx="100" cy="100" r="220" fill="url(#stripes-tl)" />
            </svg>
          </div>

          {/* Top Right Corner - Layered Geometric Elements */}
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] pointer-events-none">
            {/* Main glow */}
            <div className="absolute inset-0 bg-gradient-to-bl from-secondary/30 via-accent/20 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
            {/* Rotating ring */}
            <div className="absolute top-20 right-20 w-80 h-80 border-4 border-secondary/30 rounded-full animate-spin" style={{ animationDuration: "20s" }} />
            {/* Inner pulsing circle */}
            <div className="absolute top-28 right-28 w-64 h-64 bg-gradient-to-br from-primary/40 via-accent/30 to-transparent rounded-full animate-pulse" style={{ animationDuration: "4s" }} />
            {/* Floating accent ring */}
            <div className="absolute top-36 right-24 w-40 h-40 border-8 border-accent/40 rounded-full animate-float" style={{ animationDelay: "0.5s", animationDuration: "4s" }} />
            {/* Small accent circle with glow */}
            <div className="absolute top-24 right-36 w-20 h-20 bg-gradient-accent rounded-full shadow-glow animate-glow-pulse" />
            {/* Dots constellation */}
            <div className="absolute top-40 right-44">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-3 h-3 bg-secondary rounded-full animate-pulse"
                  style={{ 
                    left: `${Math.cos(i * Math.PI / 4) * 40}px`,
                    top: `${Math.sin(i * Math.PI / 4) * 40}px`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Bottom Left Corner - Wave & Grid Pattern */}
          <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] pointer-events-none">
            {/* Main gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/30 via-secondary/20 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
            {/* Concentric expanding waves */}
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="absolute bottom-0 left-0 border-2 border-secondary/25 rounded-full animate-pulse"
                style={{ 
                  width: `${(i + 1) * 130}px`, 
                  height: `${(i + 1) * 130}px`,
                  animationDelay: `${i * 0.4}s`,
                  animationDuration: "3s"
                }}
              />
            ))}
            {/* Grid of small squares */}
            <div className="absolute bottom-24 left-24 w-48 h-48 opacity-25">
              <div className="grid grid-cols-10 grid-rows-10 gap-1.5 h-full">
                {[...Array(100)].map((_, i) => (
                  <div 
                    key={i} 
                    className="bg-accent/50 rounded-sm animate-fade-in" 
                    style={{ animationDelay: `${i * 0.015}s` }} 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Right Corner - Organic Blob with Scatter Pattern */}
          <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] pointer-events-none">
            {/* Main gradient blob */}
            <div className="absolute inset-0 bg-gradient-to-tl from-primary/30 via-secondary/20 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
            {/* Animated organic shape */}
            <svg className="absolute bottom-0 right-0 w-full h-full opacity-20 animate-spin" style={{ animationDuration: "25s" }} viewBox="0 0 520 520">
              <defs>
                <linearGradient id="blob-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="hsl(var(--secondary))" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <path 
                d="M420,260 Q500,180 420,100 Q340,20 260,100 Q180,180 260,260 Q340,340 420,260 Z" 
                fill="url(#blob-gradient)" 
              />
            </svg>
            {/* Scattered glowing dots */}
            <div className="absolute bottom-28 right-28 w-56 h-56">
              {[...Array(16)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-3 h-3 bg-gradient-to-br from-accent via-secondary to-primary rounded-full animate-pulse shadow-glow"
                  style={{ 
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.25}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
            {/* Rotating partial ring */}
            <div className="absolute bottom-32 right-32 w-48 h-48 border-t-4 border-r-4 border-primary/40 rounded-full animate-spin" style={{ animationDuration: "15s" }} />
          </div>

          {/* Center ambient glow for depth */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-glow-pulse" />
        </div>
        
        <div className="container mx-auto">
          <div className="text-center space-y-8 max-w-5xl mx-auto">
            {/* Logo with glow effect */}
            <div className="flex justify-center mb-6 animate-fade-in">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-hero rounded-full blur-2xl opacity-30 animate-glow-pulse" />
                <img 
                  src={logo} 
                  alt="SaskTask Logo" 
                  className="h-32 w-auto relative z-10 hover:scale-110 transition-transform duration-500 drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Search Feature with enhanced glass design */}
            <div className="max-w-2xl mx-auto mb-8 relative z-10 animate-fade-up" ref={searchRef}>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-hero rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative glass rounded-2xl p-2">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary pointer-events-none z-10" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                    placeholder="Search for tasks, services, or locations..."
                    className="h-16 pl-16 pr-40 text-lg bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-medium placeholder:text-muted-foreground/70"
                  />
                  <Button 
                    className="absolute right-3 top-3 h-12 px-8 rounded-xl"
                    variant="hero"
                    onClick={handleSearchClick}
                  >
                    Search
                  </Button>
                </div>
              </div>

              {/* Search Results Dropdown */}
              {showResults && (
                <div className="absolute w-full mt-3 glass rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-50 border-2 border-primary/20">
                  {isSearching ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-primary mx-auto glow-sm"></div>
                      <p className="mt-3 text-sm font-medium text-muted-foreground">Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((result, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleResultClick(result)}
                          className="w-full px-4 py-3 hover:bg-muted/50 flex items-start gap-3 text-left transition-colors"
                        >
                          {result.type === "category" ? (
                            <>
                              <span className="text-2xl">{result.icon}</span>
                              <div>
                                <p className="font-semibold">{result.name}</p>
                                <p className="text-xs text-muted-foreground">Browse category</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <Briefcase className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{result.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                                <div className="flex gap-2 mt-1">
                                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                    {result.category}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-600 rounded-full font-bold">
                                    ${result.pay_amount}
                                  </span>
                                </div>
                              </div>
                            </>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No results found for "{searchQuery}"</p>
                      <p className="text-sm mt-1">Try browsing categories or post your own task</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-2 mt-3 text-sm">
                <span className="text-muted-foreground">Popular:</span>
                {popularSearches.map((term, idx) => (
                  <React.Fragment key={term}>
                    <button
                      onClick={() => handlePopularSearchClick(term)}
                      className="text-primary hover:underline font-medium"
                    >
                      {term}
                    </button>
                    {idx < popularSearches.length - 1 && (
                      <span className="text-muted-foreground">•</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            
            {/* Main Heading with gradient text */}
            <div className="space-y-6 animate-fade-up">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-tight">
                <span className="text-gradient animate-glow-pulse">
                  Your Tasks, Our Experts
                </span>
              </h1>
              
              <div className="flex flex-wrap justify-center gap-4 text-lg lg:text-xl font-semibold">
                <span className="px-6 py-3 bg-gradient-primary rounded-2xl text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-default">
                  💪 Quick & Reliable
                </span>
                <span className="px-6 py-3 bg-gradient-secondary rounded-2xl text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-default">
                  ✓ Verified Taskers
                </span>
                <span className="px-6 py-3 bg-gradient-accent rounded-2xl text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-default">
                  ⚡ Same-Day Service
                </span>
              </div>
            </div>
            
            {/* Enhanced Description */}
            <div className="max-w-3xl mx-auto space-y-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <p className="text-2xl lg:text-3xl font-heading font-bold text-foreground leading-tight">
                Connect with trusted local Taskers in minutes
              </p>
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                From home repairs to moving help, cleaning to assembly - find skilled professionals 
                for any task. Post your job or browse opportunities. Get it done today!
              </p>
            </div>

            {/* Key Benefits Grid with modern cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              {[
                { icon: Shield, text: "Insured & Vetted", gradient: "from-primary to-primary-glow" },
                { icon: Clock, text: "Fast Booking", gradient: "from-secondary via-cyan-500 to-secondary" },
                { icon: DollarSign, text: "Fair Prices", gradient: "from-accent to-pink-500" },
                { icon: Star, text: "Top Rated", gradient: "from-amber-500 to-orange-500" }
              ].map((benefit, i) => (
                <div key={i} className="group relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-all duration-300`} />
                  <div className="relative flex flex-col items-center gap-3 p-6 rounded-2xl glass hover:scale-105 transition-all duration-300 cursor-default">
                    <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all`}>
                      <benefit.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-bold font-heading">{benefit.text}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* What do you need help with? */}
            <div className="pt-8">
              <h2 className="text-3xl lg:text-4xl font-bold mb-3">What do you need help with?</h2>
              <p className="text-muted-foreground mb-6">Choose a service to get started</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {[
                  { icon: Package, label: "Assembly", color: "from-blue-500 to-cyan-500" },
                  { icon: Monitor, label: "Mounting", color: "from-purple-500 to-pink-500" },
                  { icon: Truck, label: "Moving", color: "from-orange-500 to-red-500" },
                  { icon: Sparkles, label: "Cleaning", color: "from-green-500 to-emerald-500" },
                  { icon: Trees, label: "Outdoor Help", color: "from-teal-500 to-cyan-500" },
                  { icon: Home, label: "Home Repairs", color: "from-rose-500 to-pink-500" },
                  { icon: PaintBucket, label: "Painting", color: "from-amber-500 to-orange-500" },
                  { icon: MoreHorizontal, label: "Many More", color: "from-violet-500 to-purple-500" }
                ].map((category, i) => (
                  <Link key={i} to="/browse">
                    <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-border hover:border-primary/50 h-full hover:-translate-y-1">
                      <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
                        <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                          <category.icon className="h-7 w-7 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-center">{category.label}</span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 pt-8">
              <Link to="/auth">
                <Button variant="hero" size="lg" className="group shadow-xl hover:shadow-2xl transition-all text-lg px-8 py-6">
                  Get Started Free
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Button>
              </Link>
              <Link to="/browse">
                <Button variant="outline" size="lg" className="shadow-lg hover:shadow-xl transition-all text-lg px-8 py-6">
                  Explore Tasks
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                <Star className="h-6 w-6 fill-accent text-accent" />
                <span className="font-bold text-lg">4.9/5</span>
                <span className="text-sm text-muted-foreground">Rating</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Users className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">10K+</span>
                <span className="text-sm text-muted-foreground">Active Users</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
                <Shield className="h-6 w-6 text-secondary" />
                <span className="font-bold text-lg">100%</span>
                <span className="text-sm text-muted-foreground">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Popular Categories</h2>
            <p className="text-xl text-muted-foreground">Whatever the task, we have someone ready to help</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Snowflake, title: "Snow Removal", desc: "Quick snow clearing services", color: "from-blue-500 to-cyan-500" },
              { icon: Sparkles, title: "Cleaning", desc: "Professional cleaning help", color: "from-purple-500 to-pink-500" },
              { icon: Truck, title: "Moving", desc: "Help with moving items", color: "from-orange-500 to-red-500" },
              { icon: Users, title: "General Labor", desc: "Various short-term tasks", color: "from-green-500 to-emerald-500" }
            ].map((category, i) => (
              <Card key={i} className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-border hover:border-primary/50">
                <CardContent className="p-6">
                  <div className={`h-14 w-14 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <category.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                  <p className="text-muted-foreground">{category.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

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
              {[
                { 
                  icon: FileEdit, 
                  title: "Post Your Task", 
                  desc: "Describe what you need done, set your budget, location, and timeline",
                  color: "from-blue-500 to-cyan-500"
                },
                { 
                  icon: Users, 
                  title: "Browse Proposals", 
                  desc: "Receive offers from verified task doers with ratings, reviews, and profiles",
                  color: "from-purple-500 to-pink-500"
                },
                { 
                  icon: CheckCircle2, 
                  title: "Select & Connect", 
                  desc: "Choose the best match, discuss details via secure messaging, and confirm booking",
                  color: "from-green-500 to-emerald-500"
                },
                { 
                  icon: Star, 
                  title: "Pay & Review", 
                  desc: "Complete payment securely after task completion and leave feedback",
                  color: "from-yellow-500 to-orange-500"
                }
              ].map((item, i) => (
                <Card key={i} className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50">
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
              {[
                { 
                  icon: Search, 
                  title: "Browse Tasks", 
                  desc: "Explore available tasks by category, location, budget, and schedule",
                  color: "from-indigo-500 to-blue-500"
                },
                { 
                  icon: MessageSquare, 
                  title: "Submit Proposals", 
                  desc: "Send offers with your rates, availability, and showcase your verified credentials",
                  color: "from-violet-500 to-purple-500"
                },
                { 
                  icon: Briefcase, 
                  title: "Get Hired", 
                  desc: "Get selected by task givers, confirm details, and schedule the work",
                  color: "from-cyan-500 to-teal-500"
                },
                { 
                  icon: TrendingUp, 
                  title: "Build Reputation", 
                  desc: "Complete tasks, receive payments instantly, and earn 5-star reviews",
                  color: "from-amber-500 to-orange-500"
                }
              ].map((item, i) => (
                <Card key={i} className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 hover:border-secondary/50">
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
              {[
                { icon: MessageSquare, title: "Real-Time Messaging", desc: "Chat instantly with task givers and doers through our secure platform" },
                { icon: DollarSign, title: "Secure Payments", desc: "Escrow protection ensures payment only after successful completion" },
                { icon: Calendar, title: "Smart Scheduling", desc: "Built-in calendar to manage multiple tasks and bookings effortlessly" },
                { icon: MapPin, title: "Location Tracking", desc: "GPS-based task matching connects you with nearby opportunities" },
                { icon: Bell, title: "Instant Notifications", desc: "Get real-time alerts for new offers, messages, and booking updates" },
                { icon: Award, title: "Achievement Badges", desc: "Earn recognition badges as you complete more tasks and build expertise" }
              ].map((item, i) => (
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
              {[
                { 
                  icon: ShieldCheck, 
                  title: "ID Verification", 
                  desc: "All users undergo mandatory identity verification with government-issued documents",
                  badge: "Required"
                },
                { 
                  icon: Shield, 
                  title: "Background Checks", 
                  desc: "Optional enhanced background screening for task doers in sensitive categories",
                  badge: "Optional"
                },
                { 
                  icon: Lock, 
                  title: "Secure Payments", 
                  desc: "Bank-level encryption and escrow protection for all financial transactions",
                  badge: "Protected"
                },
                { 
                  icon: Star, 
                  title: "Rating System", 
                  desc: "Transparent reviews and ratings help you make informed decisions every time",
                  badge: "Verified"
                }
              ].map((item, i) => (
                <Card key={i} className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 bg-background">
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
            {[
              { icon: Shield, title: "Verified Users", desc: "All users are verified with ratings and reviews" },
              { icon: Clock, title: "Quick Matching", desc: "Find the right person for your task in minutes" },
              { icon: DollarSign, title: "Fair Pricing", desc: "Set your own rates with transparent commission" },
              { icon: Star, title: "Rating System", desc: "Build your reputation with verified reviews" },
              { icon: Users, title: "Large Network", desc: "Thousands of task givers and doers" },
              { icon: Shield, title: "Secure Payments", desc: "Protected payment processing" }
            ].map((feature, i) => (
              <Card key={i} className="border-border hover:shadow-lg transition-shadow">
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
    </div>
  );
};

export default Index;
