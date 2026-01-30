import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getSignupDraft, saveSignupDraft, SignupRole } from "@/lib/signupDraft";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Wrench, 
  Users, 
  ArrowRight, 
  ArrowLeft,
  Check,
  DollarSign,
  Clock,
  Shield,
  Star
} from "lucide-react";

interface RoleCardProps {
  role: SignupRole;
  title: string;
  description: string;
  icon: React.ElementType;
  features: string[];
  isSelected: boolean;
  onClick: () => void;
  delay?: number;
}

const RoleCard: React.FC<RoleCardProps> = ({
  role,
  title,
  description,
  icon: Icon,
  features,
  isSelected,
  onClick,
  delay = 0,
}) => (
  <motion.button
    type="button"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    onClick={onClick}
    className={`relative w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 group ${
      isSelected
        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
        : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
    }`}
  >
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

    {/* Icon */}
    <div
      className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
        isSelected
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
      }`}
    >
      <Icon className="w-7 h-7" />
    </div>

    {/* Content */}
    <h3 className="text-lg font-semibold mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground mb-4">{description}</p>

    {/* Features */}
    <ul className="space-y-2">
      {features.map((feature, index) => (
        <li
          key={index}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Check className={`w-4 h-4 ${isSelected ? "text-primary" : "text-muted-foreground/50"}`} />
          {feature}
        </li>
      ))}
    </ul>

    {/* Popular badge for "both" option */}
    {role === "both" && (
      <div className="absolute -top-3 left-6 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full flex items-center gap-1">
        <Star className="w-3 h-3" />
        Most Popular
      </div>
    )}
  </motion.button>
);

const roleOptions = [
  {
    role: "task_giver" as SignupRole,
    title: "I need help",
    description: "Post tasks and hire trusted local helpers",
    icon: Briefcase,
    features: [
      "Post unlimited tasks",
      "Browse verified taskers",
      "Secure payment protection",
    ],
  },
  {
    role: "task_doer" as SignupRole,
    title: "I want to earn",
    description: "Get paid for completing tasks in your area",
    icon: Wrench,
    features: [
      "Set your own schedule",
      "Earn competitive rates",
      "Build your reputation",
    ],
  },
  {
    role: "both" as SignupRole,
    title: "I want both",
    description: "Post tasks and earn money helping others",
    icon: Users,
    features: [
      "Maximum flexibility",
      "All features included",
      "Switch roles anytime",
    ],
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
      title="How will you use SaskTask?"
      subtitle="You can always change this later in your settings"
    >
      <div className="space-y-6">
        {/* Role selection cards */}
        <div className="space-y-4">
          {roleOptions.map((option, index) => (
            <RoleCard
              key={option.role}
              {...option}
              isSelected={selectedRole === option.role}
              onClick={() => setSelectedRole(option.role)}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Benefits reminder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-3 p-4 bg-muted/50 rounded-xl"
        >
          <div className="text-center">
            <Shield className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Verified users</p>
          </div>
          <div className="text-center">
            <DollarSign className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Secure payments</p>
          </div>
          <div className="text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">24/7 support</p>
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
