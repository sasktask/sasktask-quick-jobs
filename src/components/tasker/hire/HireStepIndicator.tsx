import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface HireStepIndicatorProps {
  currentStep: number;
  steps: { label: string; icon: React.ReactNode }[];
}

export const HireStepIndicator = ({ currentStep, steps }: HireStepIndicatorProps) => {
  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto mb-8">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        
        return (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "border-primary bg-primary/10 text-primary",
                  !isCompleted && !isCurrent && "border-muted-foreground/30 text-muted-foreground/50"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.icon
                )}
              </motion.div>
              <span className={cn(
                "text-xs mt-2 font-medium",
                isCurrent ? "text-primary" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 mb-6">
                <div className={cn(
                  "h-full transition-all duration-500",
                  isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                )} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
