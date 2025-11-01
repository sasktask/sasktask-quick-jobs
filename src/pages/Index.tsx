import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="text-center space-y-8 animate-fade-in max-w-4xl mx-auto">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img 
                src={logo} 
                alt="SaskTask Logo" 
                className="h-24 w-auto"
              />
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Trusted help,
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                when and how you need it.
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              SaskTask makes it easy to find trusted local Taskers, schedule help, 
              and get your to-dos done fast.
            </p>
            
            {/* What do you need help with? */}
            <div className="pt-8">
              <h2 className="text-2xl font-semibold mb-6">What do you need help with?</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {[
                  { icon: Package, label: "Assembly" },
                  { icon: Monitor, label: "Mounting" },
                  { icon: Truck, label: "Moving" },
                  { icon: Sparkles, label: "Cleaning" },
                  { icon: Trees, label: "Outdoor Help" },
                  { icon: Home, label: "Home Repairs" },
                  { icon: PaintBucket, label: "Painting" },
                  { icon: MoreHorizontal, label: "Many More" }
                ].map((category, i) => (
                  <Link key={i} to="/browse">
                    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-border hover:border-primary/50 h-full">
                      <CardContent className="p-4 flex flex-col items-center justify-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <category.icon className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-center">{category.label}</span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 pt-6">
              <Link to="/auth">
                <Button variant="hero" size="lg" className="group">
                  Get Started
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Button>
              </Link>
              <Link to="/browse">
                <Button variant="outline" size="lg">
                  Browse Tasks
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="flex items-center justify-center gap-8 pt-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-accent text-accent" />
                <span className="text-sm font-medium">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">10K+ Active Users</span>
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
