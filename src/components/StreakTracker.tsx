import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Calendar, Target, Gift, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakTrackerProps {
  userId: string;
  currentStreak?: number;
  longestStreak?: number;
  lastActiveDate?: string;
}

export function StreakTracker({ 
  userId, 
  currentStreak = 0, 
  longestStreak = 0,
  lastActiveDate 
}: StreakTrackerProps) {
  const [streak, setStreak] = useState(currentStreak);
  const [isToday, setIsToday] = useState(false);

  useEffect(() => {
    // Check if last active was today
    if (lastActiveDate) {
      const today = new Date().toDateString();
      const lastActive = new Date(lastActiveDate).toDateString();
      setIsToday(today === lastActive);
    }
  }, [lastActiveDate]);

  // Calculate streak milestone
  const getStreakMilestone = (days: number) => {
    if (days >= 30) return { milestone: 30, next: 60, reward: "Gold Badge" };
    if (days >= 14) return { milestone: 14, next: 30, reward: "Silver Badge" };
    if (days >= 7) return { milestone: 7, next: 14, reward: "Bronze Badge" };
    if (days >= 3) return { milestone: 3, next: 7, reward: "Starter Badge" };
    return { milestone: 0, next: 3, reward: "First Milestone" };
  };

  const milestoneInfo = getStreakMilestone(streak);
  const progressToNext = ((streak - milestoneInfo.milestone) / (milestoneInfo.next - milestoneInfo.milestone)) * 100;

  // Generate week view
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
  const today = new Date().getDay();

  return (
    <Card className="border-border overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center",
                streak > 0 
                  ? "bg-gradient-to-br from-orange-500 to-red-500" 
                  : "bg-muted"
              )}
              animate={streak > 0 ? { 
                scale: [1, 1.1, 1],
              } : {}}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Flame className={cn(
                "h-6 w-6",
                streak > 0 ? "text-white" : "text-muted-foreground"
              )} />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{streak}</span>
                <span className="text-muted-foreground text-sm">day streak</span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Target className="h-3 w-3" />
                Best: {longestStreak} days
              </p>
            </div>
          </div>
          
          {streak >= 7 && (
            <Badge variant="secondary" className="gap-1 bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-600 border-orange-500/20">
              <Zap className="h-3 w-3" />
              On Fire!
            </Badge>
          )}
        </div>

        {/* Week calendar */}
        <div className="flex justify-between mb-4">
          {weekDays.map((day, index) => {
            const isPast = index < today;
            const isCurrentDay = index === today;
            const hasStreak = isPast && streak > (today - index);
            
            return (
              <motion.div
                key={index}
                className={cn(
                  "flex flex-col items-center",
                  isCurrentDay && "relative"
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <span className="text-xs text-muted-foreground mb-1">{day}</span>
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                  isCurrentDay && isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                  hasStreak && "bg-gradient-to-br from-orange-500 to-red-500 text-white",
                  isCurrentDay && !isToday && "bg-muted text-muted-foreground",
                  isCurrentDay && isToday && "bg-primary text-primary-foreground",
                  !isPast && !isCurrentDay && "bg-muted/50 text-muted-foreground/50"
                )}>
                  {hasStreak ? (
                    <Flame className="h-4 w-4" />
                  ) : isCurrentDay && isToday ? (
                    <Flame className="h-4 w-4" />
                  ) : (
                    <Calendar className="h-3 w-3" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress to next milestone */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {milestoneInfo.next - streak} days to {milestoneInfo.reward}
            </span>
            <span className="font-medium flex items-center gap-1">
              <Gift className="h-3 w-3 text-primary" />
              {milestoneInfo.next} days
            </span>
          </div>
          <Progress value={progressToNext} className="h-2" />
        </div>

        {/* Motivation message */}
        <p className="text-xs text-center text-muted-foreground mt-3">
          {streak === 0 && "Start your streak today! Complete a task or log in daily."}
          {streak > 0 && streak < 3 && "Great start! Keep going to unlock your first badge."}
          {streak >= 3 && streak < 7 && "You're building momentum! One week streak coming up."}
          {streak >= 7 && streak < 14 && "Amazing consistency! You're in the top 20% of users."}
          {streak >= 14 && "You're unstoppable! Legend status achieved."}
        </p>
      </CardContent>
    </Card>
  );
}
