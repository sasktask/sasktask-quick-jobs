import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Target, 
  CheckCircle, 
  Circle,
  Sparkles,
  MessageSquare,
  Briefcase,
  Star,
  Gift,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface Goal {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  link: string;
  xp: number;
}

interface DailyGoalsProps {
  userRole: string | null;
  stats: {
    completedTasks: number;
    unreadMessages: number;
    pendingBookings: number;
  };
}

export function DailyGoals({ userRole, stats }: DailyGoalsProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    // Generate daily goals based on user role
    const baseGoals: Goal[] = [
      {
        id: "login",
        title: "Daily Check-in",
        description: "Log in to your dashboard",
        icon: Sparkles,
        completed: true, // Always completed if they're viewing this
        link: "/dashboard",
        xp: 10
      },
      {
        id: "messages",
        title: "Respond to Messages",
        description: "Reply to unread messages",
        icon: MessageSquare,
        completed: stats.unreadMessages === 0,
        link: "/messages",
        xp: 20
      }
    ];

    if (userRole === "task_doer") {
      baseGoals.push(
        {
          id: "browse",
          title: "Browse Tasks",
          description: "Explore available tasks in your area",
          icon: Briefcase,
          completed: false, // Would track via analytics
          link: "/browse",
          xp: 15
        },
        {
          id: "profile",
          title: "Update Profile",
          description: "Keep your profile fresh and updated",
          icon: Star,
          completed: false,
          link: "/profile",
          xp: 25
        }
      );
    } else {
      baseGoals.push(
        {
          id: "post",
          title: "Post a Task",
          description: "Get something done today",
          icon: Briefcase,
          completed: false,
          link: "/post-task",
          xp: 30
        },
        {
          id: "review",
          title: "Review Pending Bookings",
          description: "Check and manage your bookings",
          icon: CheckCircle,
          completed: stats.pendingBookings === 0,
          link: "/bookings",
          xp: 20
        }
      );
    }

    setGoals(baseGoals);
    setXpEarned(baseGoals.filter(g => g.completed).reduce((sum, g) => sum + g.xp, 0));
  }, [userRole, stats]);

  const totalXp = goals.reduce((sum, g) => sum + g.xp, 0);
  const completedCount = goals.filter(g => g.completed).length;
  const progress = (completedCount / goals.length) * 100;

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Daily Goals
          </CardTitle>
          <Badge variant="secondary" className="gap-1">
            <Gift className="h-3 w-3" />
            {xpEarned}/{totalXp} XP
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {completedCount} of {goals.length} completed
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Goals list */}
        <div className="space-y-2">
          {goals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={goal.link}>
                <div className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-md group",
                  goal.completed 
                    ? "bg-primary/5 border-primary/20" 
                    : "bg-card border-border hover:border-primary/30"
                )}>
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                    goal.completed ? "bg-primary/10" : "bg-muted"
                  )}>
                    <goal.icon className={cn(
                      "h-5 w-5",
                      goal.completed ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "font-medium text-sm",
                        goal.completed && "line-through text-muted-foreground"
                      )}>
                        {goal.title}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        +{goal.xp} XP
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {goal.description}
                    </p>
                  </div>

                  {goal.completed ? (
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bonus message */}
        {progress === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20"
          >
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="font-semibold text-sm">All goals completed!</p>
            <p className="text-xs text-muted-foreground">
              Come back tomorrow for new goals and rewards
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
