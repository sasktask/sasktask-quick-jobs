import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, Sparkles, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveEarningsTickerProps {
  totalEarnings: number;
  thisWeekEarnings?: number;
  thisMonthEarnings?: number;
  completedTasks: number;
}

export function LiveEarningsTicker({
  totalEarnings,
  thisWeekEarnings = 0,
  thisMonthEarnings = 0,
  completedTasks
}: LiveEarningsTickerProps) {
  const [displayedEarnings, setDisplayedEarnings] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate earnings counter on mount
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = totalEarnings / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(increment * step, totalEarnings);
      setDisplayedEarnings(current);
      
      if (step >= steps) {
        clearInterval(timer);
        setDisplayedEarnings(totalEarnings);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [totalEarnings]);

  // Simulate live update effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const avgPerTask = completedTasks > 0 ? totalEarnings / completedTasks : 0;

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 animate-pulse" />
      
      <CardContent className="p-5 relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <DollarSign className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Total Earnings</h3>
              <p className="text-xs text-muted-foreground">Lifetime</p>
            </div>
          </div>
          <motion.div
            animate={{ scale: isAnimating ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Sparkles className={cn(
              "h-5 w-5 transition-colors",
              isAnimating ? "text-yellow-500" : "text-muted-foreground/50"
            )} />
          </motion.div>
        </div>

        {/* Main earnings display */}
        <div className="mb-5">
          <motion.div 
            className="text-4xl font-bold tracking-tight"
            animate={{ scale: isAnimating ? [1, 1.02, 1] : 1 }}
          >
            <span className="text-primary">$</span>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={displayedEarnings.toFixed(0)}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
              >
                {displayedEarnings.toLocaleString('en-US', { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2 
                })}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-background/80 rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-1 text-green-500 text-xs mb-1">
              <ArrowUpRight className="h-3 w-3" />
              <span>This Week</span>
            </div>
            <p className="font-semibold">${thisWeekEarnings.toFixed(0)}</p>
          </div>
          
          <div className="bg-background/80 rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-1 text-blue-500 text-xs mb-1">
              <TrendingUp className="h-3 w-3" />
              <span>This Month</span>
            </div>
            <p className="font-semibold">${thisMonthEarnings.toFixed(0)}</p>
          </div>
          
          <div className="bg-background/80 rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-1 text-purple-500 text-xs mb-1">
              <DollarSign className="h-3 w-3" />
              <span>Avg/Task</span>
            </div>
            <p className="font-semibold">${avgPerTask.toFixed(0)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
