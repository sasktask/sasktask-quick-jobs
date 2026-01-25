import React from "react";
import { motion } from "framer-motion";
import { Shield, Clock, CheckCircle2 } from "lucide-react";

interface SignupStepInfoProps {
  step: number;
}

const stepInfo: Record<number, { title: string; tips: string[]; icon: React.ElementType }> = {
  1: {
    title: "Let's get to know you",
    tips: [
      "Use your real name for trust & verification",
      "We'll verify your email with a 6-digit code",
      "You must be 18+ to use SaskTask",
    ],
    icon: CheckCircle2,
  },
  2: {
    title: "Choose how you'll use SaskTask",
    tips: [
      "Task Doers earn money completing tasks",
      "Task Givers post tasks and hire help",
      "Choose 'Both' for maximum flexibility",
    ],
    icon: Shield,
  },
  3: {
    title: "Secure your account",
    tips: [
      "Use a unique password you don't use elsewhere",
      "Include uppercase, lowercase, numbers & symbols",
      "Longer passwords are stronger",
    ],
    icon: Shield,
  },
  4: {
    title: "Final verification",
    tips: [
      "Phone verification protects your account",
      "Review our terms before accepting",
      "You're almost ready to start!",
    ],
    icon: Clock,
  },
};

export const SignupStepInfo: React.FC<SignupStepInfoProps> = ({ step }) => {
  const info = stepInfo[step];
  if (!info) return null;

  const Icon = info.icon;

  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.2 }}
      className="p-4 rounded-xl bg-primary/5 border border-primary/10"
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">{info.title}</h3>
      </div>
      <ul className="space-y-2">
        {info.tips.map((tip, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-primary mt-0.5">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};
