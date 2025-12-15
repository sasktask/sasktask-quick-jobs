import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Target,
  MessageSquare,
  ShieldCheck,
  Trophy,
  Briefcase,
  DollarSign,
  CheckCircle,
  Rocket
} from "lucide-react";

interface WelcomeTourProps {
  userRole: string | null;
  isVerified: boolean;
  onComplete: () => void;
  onDismiss: () => void;
}

const tourSteps = {
  task_giver: [
    {
      title: "Welcome to SaskTask!",
      description: "Post tasks and get them done by verified local professionals. Let's show you around!",
      icon: Sparkles,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Post Your First Task",
      description: "Click 'Post New Task' to describe what you need done. Set your budget and location.",
      icon: Briefcase,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Review Bids & Hire",
      description: "Taskers will bid on your job. Review profiles, ratings, and choose the best fit.",
      icon: Target,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Chat & Coordinate",
      description: "Message your tasker directly to discuss details, schedule, and requirements.",
      icon: MessageSquare,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Pay Securely",
      description: "Payment is held in escrow until the task is complete. Rate your tasker when done!",
      icon: DollarSign,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    }
  ],
  task_doer: [
    {
      title: "Welcome to SaskTask!",
      description: "Find local tasks, bid on jobs, and earn money doing what you're good at!",
      icon: Sparkles,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Complete Your Profile",
      description: "Add skills, bio, and portfolio items. A complete profile gets 3x more jobs!",
      icon: Target,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Get Verified",
      description: "Verified taskers appear first in search and earn more trust from clients.",
      icon: ShieldCheck,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Browse & Bid",
      description: "Find tasks in your area, submit competitive bids, and showcase your experience.",
      icon: Briefcase,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Earn & Grow",
      description: "Complete tasks, get reviews, and climb the leaderboard to unlock more opportunities!",
      icon: Trophy,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    }
  ]
};

export function WelcomeTour({ userRole, isVerified, onComplete, onDismiss }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = tourSteps[userRole as keyof typeof tourSteps] || tourSteps.task_doer;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentTourStep = steps[currentStep];
  const Icon = currentTourStep.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden">
          {/* Header with progress */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b border-border/50">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="secondary" className="gap-1">
                <Rocket className="h-3 w-3" />
                Getting Started
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Progress value={progress} className="h-1.5" />
            <p className="text-xs text-muted-foreground mt-2">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>

          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                {/* Icon */}
                <motion.div
                  className={`mx-auto h-20 w-20 rounded-2xl ${currentTourStep.bgColor} flex items-center justify-center mb-6`}
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <Icon className={`h-10 w-10 ${currentTourStep.color}`} />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3">{currentTourStep.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {currentTourStep.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Step indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {steps.map((_, index) => (
                <motion.button
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? "w-6 bg-primary"
                      : index < currentStep
                      ? "w-2 bg-primary/50"
                      : "w-2 bg-muted"
                  }`}
                  onClick={() => setCurrentStep(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex-1"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button
                variant="default"
                onClick={handleNext}
                className="flex-1 gap-1"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {/* Skip link */}
            <Button
              variant="link"
              className="w-full mt-2 text-muted-foreground"
              onClick={onDismiss}
            >
              Skip tour
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
