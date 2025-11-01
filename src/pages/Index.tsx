import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
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
  MoreHorizontal
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import logo from "@/assets/sasktask-logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Canva-Style Colorful Background */}
        <div className="absolute inset-0 -z-10">
          {/* Colorful Gradient Blobs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-20 right-0 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDuration: '5s' }} />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-br from-orange-400 to-red-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDuration: '5.5s' }} />
          
          {/* Decorative Circles */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full opacity-30" />
          <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-400 rounded-full opacity-30" />
          <div className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full opacity-30" />
          <div className="absolute bottom-20 right-10 w-14 h-14 bg-gradient-to-br from-orange-500 to-red-400 rounded-full opacity-30" />
          
          {/* Geometric Shapes */}
          <div className="absolute top-1/4 right-1/3 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-400 opacity-20 rotate-45" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
          <div className="absolute bottom-1/3 left-1/3 w-28 h-28 bg-gradient-to-br from-indigo-400 to-purple-400 opacity-20 rotate-12 rounded-lg" />
        </div>
        
        <div className="container mx-auto">
          <div className="text-center space-y-8 animate-fade-in max-w-5xl mx-auto">
            {/* Logo */}
            <div className="flex justify-center mb-4 animate-scale-in">
              <img 
                src={logo} 
                alt="SaskTask Logo" 
                className="h-28 w-auto hover-scale"
              />
            </div>

            {/* Search Feature */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative group">
                <Input
                  type="text"
                  placeholder="Search for tasks, services, or locations..."
                  className="h-14 pl-6 pr-32 text-lg bg-card/80 backdrop-blur-sm border-2 border-border focus:border-primary shadow-lg group-hover:shadow-xl transition-all"
                />
                <Button 
                  className="absolute right-2 top-2 h-10 px-6"
                  variant="hero"
                >
                  Search
                </Button>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-3 text-sm">
                <span className="text-muted-foreground">Popular:</span>
                <button className="text-primary hover:underline">Snow Removal</button>
                <span className="text-muted-foreground">•</span>
                <button className="text-primary hover:underline">Cleaning</button>
                <span className="text-muted-foreground">•</span>
                <button className="text-primary hover:underline">Moving Help</button>
                <span className="text-muted-foreground">•</span>
                <button className="text-primary hover:underline">Assembly</button>
              </div>
            </div>
            
            {/* Main Heading with Multiple Value Props */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-fade-in">
                  Your Tasks, Our Experts
                </span>
              </h1>
              
              <div className="flex flex-wrap justify-center gap-4 text-xl lg:text-2xl font-semibold text-muted-foreground">
                <span className="px-4 py-2 bg-primary/10 rounded-full border border-primary/20 hover:border-primary/50 transition-all hover-scale">
                  💪 Quick & Reliable
                </span>
                <span className="px-4 py-2 bg-secondary/10 rounded-full border border-secondary/20 hover:border-secondary/50 transition-all hover-scale">
                  ✓ Verified Taskers
                </span>
                <span className="px-4 py-2 bg-accent/10 rounded-full border border-accent/20 hover:border-accent/50 transition-all hover-scale">
                  ⚡ Same-Day Service
                </span>
              </div>
            </div>
            
            {/* Enhanced Description */}
            <div className="max-w-3xl mx-auto space-y-4">
              <p className="text-2xl lg:text-3xl font-bold text-foreground">
                Connect with trusted local Taskers in minutes
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                From home repairs to moving help, cleaning to assembly - find skilled professionals 
                for any task. Post your job or browse opportunities. Get it done today!
              </p>
            </div>

            {/* Key Benefits Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4">
              {[
                { icon: Shield, text: "Insured & Vetted", color: "from-blue-500 to-cyan-500" },
                { icon: Clock, text: "Fast Booking", color: "from-purple-500 to-pink-500" },
                { icon: DollarSign, text: "Fair Prices", color: "from-orange-500 to-red-500" },
                { icon: Star, text: "Top Rated", color: "from-green-500 to-emerald-500" }
              ].map((benefit, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover-scale">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${benefit.color} flex items-center justify-center`}>
                    <benefit.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium">{benefit.text}</span>
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
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Get started in three simple steps</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Post or Browse", desc: "Task givers post jobs, task doers browse available opportunities", icon: Users },
              { step: "2", title: "Connect & Agree", desc: "Connect with the right match, discuss details, and agree on terms", icon: Clock },
              { step: "3", title: "Complete & Pay", desc: "Complete the task, pay securely, and leave reviews", icon: DollarSign }
            ].map((item, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="relative inline-block">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto shadow-lg">
                    <item.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-accent text-white flex items-center justify-center font-bold shadow-md">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
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
