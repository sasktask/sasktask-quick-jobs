import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Briefcase, 
  Search, 
  MessageSquare, 
  Shield, 
  DollarSign,
  Trophy,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Wrench,
  Target,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  tip?: string;
}

const taskGiverSteps: TutorialStep[] = [
  {
    title: "Welcome to SaskTask! 🎉",
    description: "You're now part of Saskatchewan's largest task marketplace. Let's show you how to get help with anything you need!",
    icon: Sparkles,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Post Your First Task",
    description: "Describe what you need done, set your budget, and choose a deadline. Be specific to attract the best taskers!",
    icon: Briefcase,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    tip: "Pro tip: Tasks with photos get 40% more bids!"
  },
  {
    title: "Review & Choose Taskers",
    description: "Compare bids, read reviews, and chat with taskers before hiring. Look for verified badges and high ratings.",
    icon: Search,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    tip: "Check the tasker's completion rate and response time"
  },
  {
    title: "Secure Payment System",
    description: "Your payment is held safely in escrow until the task is complete. Only released when you're satisfied!",
    icon: Shield,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "You're All Set!",
    description: "Ready to post your first task? Your perfect tasker is just a few clicks away!",
    icon: Trophy,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  }
];

const taskDoerSteps: TutorialStep[] = [
  {
    title: "Welcome to SaskTask! 🎉",
    description: "You're now part of Saskatchewan's largest task marketplace. Let's show you how to start earning!",
    icon: Sparkles,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Complete Your Profile",
    description: "Add your skills, experience, and a great photo. Complete profiles get 3x more job offers!",
    icon: Target,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    tip: "Add at least 3 skills to appear in more searches"
  },
  {
    title: "Browse & Bid on Tasks",
    description: "Find tasks in your area that match your skills. Submit competitive bids and stand out from the crowd.",
    icon: Wrench,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    tip: "Personalized bids win 60% more jobs"
  },
  {
    title: "Build Your Reputation",
    description: "Complete tasks on time, communicate clearly, and collect 5-star reviews to unlock premium opportunities.",
    icon: Star,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    title: "Get Paid Securely",
    description: "Payments are released instantly when tasks are completed. Set up your payout account to start earning!",
    icon: DollarSign,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "You're Ready to Earn!",
    description: "Your first task is waiting! Browse available tasks and start building your reputation today.",
    icon: Trophy,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  }
];

interface OnboardingTutorialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: "task_giver" | "task_doer" | "both";
  userName?: string;
}

export const OnboardingTutorialDialog: React.FC<OnboardingTutorialDialogProps> = ({
  open,
  onOpenChange,
  userRole,
  userName
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = userRole === "task_giver" ? taskGiverSteps : taskDoerSteps;
  const totalSteps = steps.length;
  const step = steps[currentStep];

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
    }
  }, [open]);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Last step - trigger confetti and close
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      localStorage.setItem("onboarding_completed", "true");
      onOpenChange(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("onboarding_completed", "true");
    onOpenChange(false);
  };

  const StepIcon = step.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0">
        {/* Header with gradient */}
        <div className={cn(
          "relative p-6 pb-8",
          "bg-gradient-to-br from-primary/20 via-primary/10 to-transparent"
        )}>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <motion.div
                key={index}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentStep 
                    ? "w-8 bg-primary" 
                    : index < currentStep 
                      ? "w-2 bg-primary/60" 
                      : "w-2 bg-muted"
                )}
                initial={false}
                animate={{ 
                  scale: index === currentStep ? 1 : 0.8,
                }}
              />
            ))}
          </div>

          {/* Icon */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center"
            >
              <div className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg",
                step.bgColor
              )}>
                <StepIcon className={cn("h-10 w-10", step.color)} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="p-6 pt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-4"
            >
              <h2 className="text-xl font-bold text-foreground">
                {currentStep === 0 && userName 
                  ? `Welcome, ${userName}! 🎉` 
                  : step.title
                }
              </h2>
              <p className="text-muted-foreground">
                {step.description}
              </p>

              {step.tip && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-left">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    {step.tip}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={cn(currentStep === 0 && "opacity-0 pointer-events-none")}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Skip tutorial
            </Button>

            <Button onClick={handleNext}>
              {currentStep === totalSteps - 1 ? (
                <>
                  Get Started
                  <Sparkles className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
