import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Circle, 
  ChevronRight, 
  Sparkles,
  User,
  Camera,
  Phone,
  MapPin,
  FileText,
  Briefcase,
  DollarSign,
  Shield,
  Star,
  TrendingUp,
  Zap,
  Gift
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface ProfileStep {
  id: string;
  label: string;
  description: string;
  icon: any;
  completed: boolean;
  link: string;
  points: number;
  priority: "high" | "medium" | "low";
}

interface ProfileStrengthMeterProps {
  profile: any;
  userRole: string | null;
  className?: string;
}

export function ProfileStrengthMeter({ profile, userRole, className }: ProfileStrengthMeterProps) {
  const [steps, setSteps] = useState<ProfileStep[]>([]);
  const [strength, setStrength] = useState(0);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      calculateStrength(profile);
    }
  }, [profile, userRole]);

  const calculateStrength = (profile: any) => {
    const profileSteps: ProfileStep[] = [
      {
        id: "name",
        label: "Add your name",
        description: "Let others know who you are",
        icon: User,
        completed: !!profile.full_name && profile.full_name.trim().length > 0,
        link: "/profile",
        points: 15,
        priority: "high"
      },
      {
        id: "photo",
        label: "Upload a photo",
        description: "Profiles with photos get 10x more responses",
        icon: Camera,
        completed: !!profile.avatar_url,
        link: "/profile",
        points: 20,
        priority: "high"
      },
      {
        id: "phone",
        label: "Verify phone number",
        description: "Enable instant notifications",
        icon: Phone,
        completed: !!profile.phone,
        link: "/profile",
        points: 10,
        priority: "medium"
      },
      {
        id: "location",
        label: "Set your location",
        description: "Find tasks and taskers near you",
        icon: MapPin,
        completed: !!profile.city || !!profile.address,
        link: "/profile",
        points: 10,
        priority: "medium"
      },
      {
        id: "bio",
        label: "Write a bio",
        description: "Tell others about yourself and your experience",
        icon: FileText,
        completed: !!profile.bio && profile.bio.length >= 20,
        link: "/profile",
        points: 15,
        priority: "high"
      }
    ];

    // Add role-specific steps
    if (userRole === "task_doer") {
      profileSteps.push(
        {
          id: "skills",
          label: "Add your skills",
          description: "Show what you're good at",
          icon: Briefcase,
          completed: !!profile.skills && profile.skills.length > 0,
          link: "/profile",
          points: 15,
          priority: "high"
        },
        {
          id: "rate",
          label: "Set hourly rate",
          description: "Let clients know your pricing",
          icon: DollarSign,
          completed: !!profile.hourly_rate && profile.hourly_rate > 0,
          link: "/profile",
          points: 10,
          priority: "medium"
        },
        {
          id: "verification",
          label: "Get verified",
          description: "Verified taskers earn 3x more",
          icon: Shield,
          completed: profile.verified_by_admin === true,
          link: "/verification",
          points: 25,
          priority: "high"
        }
      );
    }

    setSteps(profileSteps);

    // Calculate total strength
    const totalPoints = profileSteps.reduce((sum, step) => sum + step.points, 0);
    const earnedPoints = profileSteps
      .filter(step => step.completed)
      .reduce((sum, step) => sum + step.points, 0);
    
    setStrength(Math.round((earnedPoints / totalPoints) * 100));
  };

  const getStrengthLevel = () => {
    if (strength >= 90) return { label: "Excellent", color: "text-green-500", bgColor: "bg-green-500" };
    if (strength >= 70) return { label: "Strong", color: "text-blue-500", bgColor: "bg-blue-500" };
    if (strength >= 50) return { label: "Good", color: "text-yellow-500", bgColor: "bg-yellow-500" };
    if (strength >= 25) return { label: "Fair", color: "text-orange-500", bgColor: "bg-orange-500" };
    return { label: "Weak", color: "text-red-500", bgColor: "bg-red-500" };
  };

  const strengthLevel = getStrengthLevel();
  const incompleteSteps = steps.filter(s => !s.completed);
  const highPriorityIncomplete = incompleteSteps.filter(s => s.priority === "high");
  const nextStep = highPriorityIncomplete[0] || incompleteSteps[0];

  return (
    <Card className={cn("border-border overflow-hidden", className)}>
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Profile Strength
          </CardTitle>
          <Badge 
            variant="secondary" 
            className={cn("gap-1", strengthLevel.color)}
          >
            <Zap className="h-3 w-3" />
            {strengthLevel.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Strength Meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{strength}%</span>
            <span className="text-sm text-muted-foreground">
              {steps.filter(s => s.completed).length}/{steps.length} completed
            </span>
          </div>
          <div className="relative">
            <Progress value={strength} className="h-3" />
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: "30%" }}
            />
          </div>
        </div>

        {/* Next Step Suggestion */}
        {nextStep && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-primary/5 border border-primary/20 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <nextStep.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm">Next: {nextStep.label}</p>
                  <Badge variant="outline" className="text-xs">+{nextStep.points} pts</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{nextStep.description}</p>
              </div>
              <Link to={nextStep.link}>
                <Button size="sm" className="shrink-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Progress Steps */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Complete your profile</p>
          <div className="grid gap-2">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-all cursor-pointer",
                  step.completed 
                    ? "bg-green-500/5" 
                    : "hover:bg-muted/50",
                  expandedStep === step.id && "bg-muted/50"
                )}
                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
              >
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                  step.completed ? "bg-green-500/10" : "bg-muted"
                )}>
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <step.icon className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm",
                    step.completed 
                      ? "text-muted-foreground line-through" 
                      : "font-medium"
                  )}>
                    {step.label}
                  </p>
                  <AnimatePresence>
                    {expandedStep === step.id && !step.completed && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="text-xs text-muted-foreground mt-1"
                      >
                        {step.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {!step.completed && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs shrink-0",
                      step.priority === "high" && "border-primary/50 text-primary"
                    )}
                  >
                    +{step.points}
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Completion Reward */}
        {strength < 100 && (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
            <Gift className="h-5 w-5 text-yellow-500 shrink-0" />
            <div className="text-xs">
              <p className="font-medium">Complete your profile to unlock:</p>
              <p className="text-muted-foreground">Priority in search results & exclusive badges</p>
            </div>
          </div>
        )}

        {strength === 100 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg"
          >
            <Star className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="font-semibold text-green-600">Profile Complete!</p>
            <p className="text-xs text-muted-foreground">You're ready to get more opportunities</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
