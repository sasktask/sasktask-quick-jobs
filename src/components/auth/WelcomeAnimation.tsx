import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles, PartyPopper } from "lucide-react";
import confetti from "canvas-confetti";

interface WelcomeAnimationProps {
  isVisible: boolean;
  userName: string;
  onComplete: () => void;
}

export const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({
  isVisible,
  userName,
  onComplete,
}) => {
  const [stage, setStage] = useState<"check" | "welcome" | "redirect">("check");

  useEffect(() => {
    if (isVisible) {
      // Trigger confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      const interval: NodeJS.Timeout = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      // Stage transitions
      const timer1 = setTimeout(() => setStage("welcome"), 800);
      const timer2 = setTimeout(() => setStage("redirect"), 2500);
      const timer3 = setTimeout(() => onComplete(), 3500);

      return () => {
        clearInterval(interval);
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
      >
        <div className="text-center space-y-6 px-4">
          {stage === "check" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center"
            >
              <CheckCircle2 className="w-14 h-14 text-green-500" />
            </motion.div>
          )}

          {stage === "welcome" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <motion.div
                className="flex items-center justify-center gap-2"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                <PartyPopper className="w-8 h-8 text-yellow-500" />
                <Sparkles className="w-6 h-6 text-primary" />
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Welcome to SaskTask!
              </h1>
              <p className="text-lg text-muted-foreground">
                Great to have you, <span className="font-semibold text-primary">{userName}</span>!
              </p>
            </motion.div>
          )}

          {stage === "redirect" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                />
              </div>
              <p className="text-muted-foreground">
                Taking you to your dashboard...
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
