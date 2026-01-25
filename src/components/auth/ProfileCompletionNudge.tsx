import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Camera, 
  Phone, 
  MapPin, 
  FileText, 
  Briefcase, 
  Shield, 
  X,
  ChevronRight,
  Sparkles,
  Trophy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface ProfileStep {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  link: string;
  points: number;
}

interface ProfileCompletionNudgeProps {
  profile: any;
  userRole?: "task_giver" | "task_doer" | "both";
  onDismiss?: () => void;
  variant?: "banner" | "card" | "minimal";
}

export const ProfileCompletionNudge: React.FC<ProfileCompletionNudgeProps> = ({
  profile,
  userRole = "task_doer",
  onDismiss,
  variant = "card"
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [steps, setSteps] = useState<ProfileStep[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    if (!profile) return;

    const profileSteps: ProfileStep[] = [
      {
        id: "name",
        label: "Add your name",
        description: "Let others know who you are",
        icon: User,
        completed: !!profile.full_name?.trim(),
        link: "/profile",
        points: 15,
      },
      {
        id: "photo",
        label: "Upload a profile photo",
        description: "Profiles with photos get 10x more responses",
        icon: Camera,
        completed: !!profile.avatar_url,
        link: "/profile",
        points: 20,
      },
      {
        id: "phone",
        label: "Verify phone number",
        description: "Enable instant notifications",
        icon: Phone,
        completed: !!profile.phone,
        link: "/profile",
        points: 10,
      },
      {
        id: "location",
        label: "Set your location",
        description: "Find tasks and taskers near you",
        icon: MapPin,
        completed: !!profile.city || !!profile.address,
        link: "/profile",
        points: 10,
      },
      {
        id: "bio",
        label: "Write a bio",
        description: "Tell others about yourself",
        icon: FileText,
        completed: !!profile.bio && profile.bio.length >= 20,
        link: "/profile",
        points: 15,
      },
    ];

    // Add role-specific steps for task doers
    if (userRole === "task_doer" || userRole === "both") {
      profileSteps.push(
        {
          id: "skills",
          label: "Add your skills",
          description: "Show what you're good at",
          icon: Briefcase,
          completed: !!profile.skills && profile.skills.length > 0,
          link: "/profile",
          points: 15,
        },
        {
          id: "verification",
          label: "Get verified",
          description: "Verified taskers earn 3x more",
          icon: Shield,
          completed: profile.verified_by_admin === true,
          link: "/verification",
          points: 25,
        }
      );
    }

    setSteps(profileSteps);

    // Calculate completion percentage
    const totalPoints = profileSteps.reduce((sum, step) => sum + step.points, 0);
    const earnedPoints = profileSteps
      .filter(step => step.completed)
      .reduce((sum, step) => sum + step.points, 0);
    
    setCompletionPercentage(Math.round((earnedPoints / totalPoints) * 100));
  }, [profile, userRole]);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const incompleteSteps = steps.filter(step => !step.completed);
  const nextStep = incompleteSteps[0];

  // Don't show if dismissed or profile is complete
  if (isDismissed || completionPercentage === 100 || !profile) {
    return null;
  }

  // Minimal variant - just a small indicator
  if (variant === "minimal") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 text-sm"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{completionPercentage}%</span>
          </div>
        </div>
        <Button
          variant="link"
          size="sm"
          className="text-primary p-0 h-auto"
          onClick={() => navigate("/profile")}
        >
          Complete profile
        </Button>
      </motion.div>
    );
  }

  // Banner variant - horizontal bar
  if (variant === "banner") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/20 p-3"
      >
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Profile {completionPercentage}% complete</span>
            </div>
            <Progress value={completionPercentage} className="w-24 h-2" />
            {nextStep && (
              <span className="text-sm text-muted-foreground hidden md:block">
                Next: {nextStep.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => navigate(nextStep?.link || "/profile")}
            >
              Complete Now
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default card variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {completionPercentage >= 80 ? (
                    <Trophy className="h-6 w-6 text-primary" />
                  ) : (
                    <span className="text-lg font-bold text-primary">{completionPercentage}%</span>
                  )}
                </div>
                <motion.div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <Sparkles className="h-3 w-3 text-primary-foreground" />
                </motion.div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Complete Your Profile</h3>
                <p className="text-sm text-muted-foreground">
                  {incompleteSteps.length} step{incompleteSteps.length !== 1 ? "s" : ""} remaining
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress bar */}
          <Progress value={completionPercentage} className="h-2 mb-4" />

          {/* Expandable steps list */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 mb-4 overflow-hidden"
              >
                {steps.map((step) => {
                  const StepIcon = step.icon;
                  return (
                    <div
                      key={step.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg transition-colors",
                        step.completed 
                          ? "bg-green-500/10" 
                          : "bg-muted/50 hover:bg-muted cursor-pointer"
                      )}
                      onClick={() => !step.completed && navigate(step.link)}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        step.completed ? "bg-green-500/20" : "bg-muted"
                      )}>
                        <StepIcon className={cn(
                          "h-4 w-4",
                          step.completed ? "text-green-500" : "text-muted-foreground"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium",
                          step.completed ? "text-green-600 line-through" : "text-foreground"
                        )}>
                          {step.label}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {step.description}
                        </p>
                      </div>
                      <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        step.completed 
                          ? "bg-green-500/20 text-green-600" 
                          : "bg-primary/10 text-primary"
                      )}>
                        +{step.points}
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-1"
            >
              {isExpanded ? "Show Less" : "View All Steps"}
            </Button>
            {nextStep && (
              <Button
                size="sm"
                onClick={() => navigate(nextStep.link)}
                className="flex-1"
              >
                {nextStep.label}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
