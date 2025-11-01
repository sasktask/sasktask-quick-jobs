import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Search, MessageSquare, CheckCircle, DollarSign, Star } from "lucide-react";

export default function HowItWorks() {
  const taskGiverSteps = [
    {
      icon: Search,
      title: "Post Your Task",
      description: "Describe what you need done, set your budget, and choose your preferred date and time.",
    },
    {
      icon: Users,
      title: "Review Proposals",
      description: "Browse Taskers who are interested, check their ratings, reviews, and experience.",
    },
    {
      icon: CheckCircle,
      title: "Accept & Schedule",
      description: "Choose the best Tasker for your needs and confirm the booking details.",
    },
    {
      icon: MessageSquare,
      title: "Communicate",
      description: "Chat with your Tasker to discuss specifics and coordinate details.",
    },
    {
      icon: DollarSign,
      title: "Pay Securely",
      description: "Once the task is complete, pay securely through our platform.",
    },
    {
      icon: Star,
      title: "Leave a Review",
      description: "Rate your experience to help other users and build trust in the community.",
    },
  ];

  const taskDoerSteps = [
    {
      icon: Search,
      title: "Browse Tasks",
      description: "Find tasks that match your skills, schedule, and location preferences.",
    },
    {
      icon: MessageSquare,
      title: "Submit Proposal",
      description: "Send a proposal explaining why you're the best fit for the job.",
    },
    {
      icon: CheckCircle,
      title: "Get Accepted",
      description: "Wait for the task giver to review and accept your proposal.",
    },
    {
      icon: Users,
      title: "Complete the Task",
      description: "Show up on time, do great work, and communicate throughout.",
    },
    {
      icon: DollarSign,
      title: "Get Paid",
      description: "Receive payment securely after the task is completed and approved.",
    },
    {
      icon: Star,
      title: "Build Reputation",
      description: "Earn positive reviews to unlock better opportunities and higher rates.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            How <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">SaskTask</span> Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Whether you need help or want to offer your services, getting started is simple
          </p>
        </div>

        {/* For Task Givers */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">For Task Givers</h2>
            <p className="text-lg text-muted-foreground">Get things done with trusted local help</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {taskGiverSteps.map((step, idx) => (
              <Card key={idx} className="border-border hover:shadow-lg transition-all group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* For Task Doers */}
        <section className="py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">For Task Doers</h2>
            <p className="text-lg text-muted-foreground">Turn your skills into income</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {taskDoerSteps.map((step, idx) => (
              <Card key={idx} className="border-border hover:shadow-lg transition-all group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                      <step.icon className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Safety & Trust */}
        <section className="mt-20 py-12 px-6 bg-muted/30 rounded-2xl">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Safety & Trust</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Your safety is our priority. All users undergo verification, and every task is backed by our platform protection.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <h3 className="font-bold mb-2">✓ Identity Verified</h3>
                <p className="text-sm text-muted-foreground">All Taskers complete background checks</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">✓ Secure Payments</h3>
                <p className="text-sm text-muted-foreground">Your money is protected until job completion</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">✓ Insurance Coverage</h3>
                <p className="text-sm text-muted-foreground">Every task is covered by our insurance</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
}