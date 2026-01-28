import React from "react";
import { motion } from "framer-motion";
import { Check, User, Briefcase, Lock, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignupStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

const steps: SignupStep[] = [
  { id: 1, title: "Personal Info", description: "Name, email & verify", icon: User },
  { id: 2, title: "Your Role", description: "How you'll use SaskTask", icon: Briefcase },
  { id: 3, title: "Security", description: "Create a strong password", icon: Lock },
  { id: 4, title: "Phone & Terms", description: "Verify phone & accept", icon: Phone },
];

interface SignupProgressBarProps {
  currentStep: number;
}

export const SignupProgressBar: React.FC<SignupProgressBarProps> = ({ currentStep }) => {
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="w-full space-y-4">
      {/* Progress bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Step indicators - desktop */}
      <div className="hidden md:flex justify-between items-start">
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const StepIcon = step.icon;

          return (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center text-center flex-1",
                step.id < steps.length && "relative"
              )}
            >
              <motion.div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-colors",
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                      ? "bg-primary/20 text-primary border-2 border-primary"
                      : "bg-muted text-muted-foreground"
                )}
                initial={false}
                animate={isCompleted ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <StepIcon className="w-5 h-5" />
                )}
              </motion.div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isCurrent || isCompleted ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
              <span
                className={cn(
                  "text-[10px] mt-0.5",
                  isCurrent || isCompleted ? "text-muted-foreground" : "text-muted-foreground/60"
                )}
              >
                {step.description}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step indicator - mobile */}
      <div className="flex md:hidden items-center justify-between">
        <div className="flex items-center gap-2">
          {steps.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <motion.div
                key={step.id}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-colors",
                  isCompleted
                    ? "bg-primary"
                    : isCurrent
                      ? "bg-primary/60"
                      : "bg-muted"
                )}
                initial={false}
                animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              />
            );
          })}
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">
            {steps[currentStep - 1]?.title}
          </p>
          <p className="text-xs text-muted-foreground">
            Step {currentStep} of {steps.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export { steps };
