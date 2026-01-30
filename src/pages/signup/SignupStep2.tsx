import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getSignupDraft, saveSignupDraft, SignupRole } from "@/lib/signupDraft";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Hammer, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Check,
  DollarSign,
  Clock,
  Shield,
  Star,
  TrendingUp,
  Zap,
  BadgeCheck
} from "lucide-react";

interface RoleCardProps {
  role: SignupRole;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  features: string[];
  isSelected: boolean;
  onClick: () => void;
  delay?: number;
  badge?: string;
  badgeIcon?: React.ElementType;
}

const RoleCard: React.FC<RoleCardProps> = ({
  role,
  title,
  subtitle,
  description,
  icon: Icon,
  features,
  isSelected,
  onClick,
  delay = 0,
  badge,
  badgeIcon: BadgeIcon,
}) => (
  <motion.button
    type="button"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    onClick={onClick}
    className={`relative w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 group ${
      isSelected
        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.02]"
        : "border-border bg-card hover:border-primary/50 hover:bg-muted/50 hover:scale-[1.01]"
    }`}
  >
    {/* Badge */}
    {badge && (
      <div className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-md">
        {BadgeIcon && <BadgeIcon className="w-3 h-3" />}
        {badge}
      </div>
    )}

    {/* Selection indicator */}
    <div
      className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
        isSelected
          ? "border-primary bg-primary"
          : "border-muted-foreground/30 bg-transparent group-hover:border-primary/50"
      }`}
    >
      {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
    </div>

    <div className="flex items-start gap-4">
      {/* Icon */}
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
          isSelected
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
        }`}
      >
        <Icon className="w-7 h-7" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        <p className="text-sm font-medium text-primary mb-1">{subtitle}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>

    {/* Features */}
    <ul className="mt-4 grid grid-cols-1 gap-2">
      {features.map((feature, index) => (
        <li
          key={index}
          className="flex items-center gap-2 text-sm"
        >
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
            isSelected ? "bg-primary/20" : "bg-muted"
          }`}>
            <Check className={`w-3 h-3 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <span className={isSelected ? "text-foreground" : "text-muted-foreground"}>
            {feature}
          </span>
        </li>
      ))}
    </ul>
  </motion.button>
);

const roleOptions = [
  {
    role: "task_doer" as SignupRole,
    title: "Service Provider",
    subtitle: "Earn money on your schedule",
    description: "Offer your skills and get paid for completing tasks in your community",
    icon: Hammer,
    features: [
      "Set your own rates & availability",
      "Get paid securely within 24 hours",
      "Build your professional reputation",
      "Access to instant job notifications",
    ],
    badge: "Start Earning",
    badgeIcon: TrendingUp,
  },
  {
    role: "task_giver" as SignupRole,
    title: "Client",
    subtitle: "Get things done faster",
    description: "Post tasks and hire verified professionals for any job, big or small",
    icon: Briefcase,
    features: [
      "Post tasks in under 2 minutes",
      "Browse verified local professionals",
      "Secure payment protection",
      "Real-time progress tracking",
    ],
  },
  {
    role: "both" as SignupRole,
    title: "Flexible Member",
    subtitle: "Best of both worlds",
    description: "Hire help when you need it and earn extra income when you have time",
    icon: Sparkles,
    features: [
      "Full access to all features",
      "Switch between roles instantly",
      "Maximize your earning potential",
      "Priority customer support",
    ],
    badge: "Most Popular",
    badgeIcon: Star,
  },
];

const SignupStep2 = () => {
  const [selectedRole, setSelectedRole] = useState<SignupRole | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const draft = getSignupDraft();
    if (!draft.email || !draft.firstName || !draft.lastName) {
      navigate("/signup/step-1");
      return;
    }
    if (draft.role) {
      setSelectedRole(draft.role as SignupRole);
    }
  }, [navigate]);

  const handleContinue = () => {
    if (!selectedRole) {
      toast({
        title: "Select how you'll use SaskTask",
        description: "Please choose one option to continue.",
        variant: "destructive",
      });
      return;
    }
    
    const wantsBoth = selectedRole === "both";
    saveSignupDraft({ 
      role: selectedRole, 
      wantsBothRoles: wantsBoth 
    });
    navigate("/signup/step-3");
  };

  return (
    <AuthLayout
      step={2}
      totalSteps={4}
      title="Choose your path"
      subtitle="Select how you'd like to use SaskTask — you can change this anytime"
    >
      <div className="space-y-6">
        {/* Role selection cards */}
        <div className="space-y-4">
          {roleOptions.map((option, index) => (
            <RoleCard
              key={option.role}
              role={option.role}
              title={option.title}
              subtitle={option.subtitle}
              description={option.description}
              icon={option.icon}
              features={option.features}
              badge={option.badge}
              badgeIcon={option.badgeIcon}
              isSelected={selectedRole === option.role}
              onClick={() => setSelectedRole(option.role)}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-4 gap-2 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/10"
        >
          <div className="text-center">
            <Shield className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Verified</p>
          </div>
          <div className="text-center">
            <DollarSign className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Secure Pay</p>
          </div>
          <div className="text-center">
            <Zap className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Instant</p>
          </div>
          <div className="text-center">
            <BadgeCheck className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Insured</p>
          </div>
        </motion.div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/signup/step-1")}
            className="h-12"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleContinue}
            className="flex-1 h-12 text-base font-semibold"
            variant="hero"
            disabled={!selectedRole}
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignupStep2;
