import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Trophy, Flame, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  completedTasks: number;
  targetTasks?: number;
  level?: number;
  xp?: number;
  xpToNextLevel?: number;
}

export function ProgressRing({
  completedTasks,
  targetTasks = 10,
  level = 1,
  xp = 0,
  xpToNextLevel = 100
}: ProgressRingProps) {
  const progress = Math.min((completedTasks / targetTasks) * 100, 100);
  const xpProgress = (xp / xpToNextLevel) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getMotivationalMessage = () => {
    if (completedTasks === 0) return "Start your first task!";
    if (progress < 25) return "Great start! Keep going!";
    if (progress < 50) return "You're making progress!";
    if (progress < 75) return "Halfway there!";
    if (progress < 100) return "Almost at your goal!";
    return "Goal achieved! 🎉";
  };

  const getLevelTitle = () => {
    if (level < 3) return "Newcomer";
    if (level < 5) return "Rising Star";
    if (level < 10) return "Pro Tasker";
    if (level < 20) return "Elite";
    return "Legend";
  };

  return (
    <Card className="border-border/50 bg-gradient-to-br from-background via-background to-muted/20">
      <CardContent className="p-5">
        <div className="flex items-center gap-5">
          {/* Progress Ring */}
          <div className="relative flex-shrink-0">
            <svg width="120" height="120" className="-rotate-90">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="45"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                className="text-muted/30"
              />
              {/* Progress circle */}
              <motion.circle
                cx="60"
                cy="60"
                r="45"
                stroke="url(#progressGradient)"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{
                  strokeDasharray: circumference,
                }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--primary) / 0.7)" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="text-center"
              >
                <p className="text-2xl font-bold">{completedTasks}</p>
                <p className="text-xs text-muted-foreground">/ {targetTasks}</p>
              </motion.div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Weekly Goal</span>
              </div>
              <p className="text-xs text-muted-foreground">{getMotivationalMessage()}</p>
            </div>

            {/* Level indicator */}
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Level {level}</p>
                    <p className="text-xs text-muted-foreground">{getLevelTitle()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Flame className="h-4 w-4" />
                  <span className="text-sm font-medium">{xp} XP</span>
                </div>
              </div>
              
              {/* XP Progress bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {xpToNextLevel - xp} XP to next level
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
