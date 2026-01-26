import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Search, UserCheck, MessageCircle, CheckCircle2 } from "lucide-react";

export const TaskerHowItWorks = () => {
  const steps = [
    {
      icon: Search,
      step: "01",
      title: "Browse & Filter",
      description: "Search by skill, category, or location. Use filters to find your perfect match.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: UserCheck,
      step: "02",
      title: "Review Profiles",
      description: "Check ratings, reviews, verified credentials, and portfolio work.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: MessageCircle,
      step: "03",
      title: "Hire & Discuss",
      description: "Send a task offer directly or chat to discuss details before booking.",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: CheckCircle2,
      step: "04",
      title: "Get It Done",
      description: "Track progress, communicate easily, and pay securely through escrow.",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="py-16 border-t border-border">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Hire trusted professionals in four simple steps
          </p>
        </motion.div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {steps.map((stepItem, index) => (
          <motion.div key={stepItem.step} variants={item}>
            <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 h-full group">
              {/* Step Number Background */}
              <div className="absolute -top-4 -right-4 text-8xl font-black text-muted/10 group-hover:text-primary/10 transition-colors">
                {stepItem.step}
              </div>
              
              <CardContent className="p-6 relative">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stepItem.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <stepItem.icon className="h-7 w-7 text-white" />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold bg-gradient-to-r ${stepItem.color} bg-clip-text text-transparent`}>
                      STEP {stepItem.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                    {stepItem.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {stepItem.description}
                  </p>
                </div>

                {/* Connector Line (not on last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 border-t-2 border-dashed border-muted-foreground/30" />
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
