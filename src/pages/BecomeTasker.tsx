import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, DollarSign, Calendar, Shield, Star, TrendingUp } from "lucide-react";

export default function BecomeTasker() {
  const benefits = [
    {
      icon: DollarSign,
      title: "Earn Extra Income",
      description: "Set your own rates and keep 85% of what you earn. No hidden fees.",
    },
    {
      icon: Calendar,
      title: "Flexible Schedule",
      description: "Work when you want, where you want. Complete control over your time.",
    },
    {
      icon: Shield,
      title: "Insurance Coverage",
      description: "All tasks are covered by our platform insurance for your protection.",
    },
    {
      icon: Star,
      title: "Build Reputation",
      description: "Earn reviews and ratings to unlock higher-paying opportunities.",
    },
    {
      icon: TrendingUp,
      title: "Grow Your Business",
      description: "Turn side gigs into a full-time business with our support.",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Sign Up",
      description: "Create your free account and tell us about your skills and experience.",
    },
    {
      number: "2",
      title: "Get Verified",
      description: "Complete identity verification and background check for trust and safety.",
    },
    {
      number: "3",
      title: "Start Earning",
      description: "Browse available tasks, submit proposals, and start making money.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            Become a <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">SaskTask Tasker</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of skilled professionals earning money by helping people in Saskatchewan
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" variant="hero" className="text-lg px-8 py-6">
                Get Started Today
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">$2,500+</div>
              <p className="text-muted-foreground">Average Monthly Earnings</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <p className="text-muted-foreground">Active Taskers</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">4.8/5</div>
              <p className="text-muted-foreground">Average Tasker Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Join SaskTask?</h2>
            <p className="text-xl text-muted-foreground">Everything you need to succeed</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, idx) => (
              <Card key={idx} className="border-border hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Get started in 3 simple steps</p>
          </div>

          <div className="space-y-8">
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {step.number}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="text-lg text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-br from-primary via-secondary to-accent border-0 text-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold mb-4">Ready to Start Earning?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join SaskTask today and turn your skills into income
              </p>
              <Link to="/auth">
                <Button size="lg" variant="accent" className="text-lg px-8 py-6">
                  Sign Up Now - It's Free
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}