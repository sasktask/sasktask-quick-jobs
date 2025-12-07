import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Award, CheckCircle, Zap, Shield, Star, TrendingUp, Crown, Trophy, Target, Medal } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BadgeDisplayProps {
  userId: string;
  size?: "sm" | "md" | "lg";
}

interface UserBadge {
  badge_type: string;
  badge_level: string | null;
  earned_at: string;
}

const badgeConfig: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  colors: Record<string, string>;
}> = {
  // Original badges
  top_rated: {
    icon: Star,
    label: "Top Rated",
    description: "Maintains 4.8+ rating with 10+ reviews",
    colors: {
      bronze: "bg-amber-700",
      silver: "bg-slate-400",
      gold: "bg-yellow-500",
      platinum: "bg-purple-500",
    },
  },
  reliable: {
    icon: CheckCircle,
    label: "Reliable",
    description: "95%+ on-time completion rate with 20+ tasks",
    colors: {
      bronze: "bg-blue-700",
      silver: "bg-blue-400",
      gold: "bg-blue-500",
      platinum: "bg-cyan-500",
    },
  },
  quick_responder: {
    icon: Zap,
    label: "Quick Responder",
    description: "Responds within 1 hour on average",
    colors: {
      bronze: "bg-orange-700",
      silver: "bg-orange-400",
      gold: "bg-orange-500",
      platinum: "bg-red-500",
    },
  },
  verified_expert: {
    icon: Shield,
    label: "Verified Expert",
    description: "Background checked and certified",
    colors: {
      bronze: "bg-green-700",
      silver: "bg-green-400",
      gold: "bg-green-500",
      platinum: "bg-emerald-500",
    },
  },
  frequent_user: {
    icon: TrendingUp,
    label: "Frequent User",
    description: "Completed 50+ tasks",
    colors: {
      bronze: "bg-indigo-700",
      silver: "bg-indigo-400",
      gold: "bg-indigo-500",
      platinum: "bg-violet-500",
    },
  },
  perfect_record: {
    icon: Award,
    label: "Perfect Record",
    description: "Zero disputes or cancellations",
    colors: {
      bronze: "bg-pink-700",
      silver: "bg-pink-400",
      gold: "bg-pink-500",
      platinum: "bg-rose-500",
    },
  },
  // Leaderboard badges
  leaderboard_champion: {
    icon: Crown,
    label: "Leaderboard Champion",
    description: "Ranked #1 on the leaderboard",
    colors: { gold: "bg-yellow-500", silver: "bg-slate-400", bronze: "bg-amber-700", platinum: "bg-purple-500" },
  },
  leaderboard_elite: {
    icon: Trophy,
    label: "Leaderboard Elite",
    description: "Ranked in the top 3",
    colors: { gold: "bg-purple-500", silver: "bg-slate-400", bronze: "bg-amber-700", platinum: "bg-purple-600" },
  },
  leaderboard_top10: {
    icon: Trophy,
    label: "Top 10",
    description: "Ranked in the top 10",
    colors: { silver: "bg-indigo-500", gold: "bg-indigo-600", bronze: "bg-indigo-400", platinum: "bg-indigo-700" },
  },
  rating_champion: {
    icon: Star,
    label: "Rating Champion",
    description: "Highest rated tasker",
    colors: { gold: "bg-yellow-500", silver: "bg-slate-400", bronze: "bg-amber-700", platinum: "bg-purple-500" },
  },
  highly_rated: {
    icon: Star,
    label: "Highly Rated",
    description: "4.8+ rating with 10+ reviews",
    colors: { gold: "bg-amber-500", silver: "bg-slate-400", bronze: "bg-amber-700", platinum: "bg-purple-500" },
  },
  century_tasker: {
    icon: Medal,
    label: "Century Tasker",
    description: "Completed 100+ tasks",
    colors: { gold: "bg-emerald-500", silver: "bg-slate-400", bronze: "bg-amber-700", platinum: "bg-purple-500" },
  },
  fifty_tasks: {
    icon: Target,
    label: "50 Tasks",
    description: "Completed 50+ tasks",
    colors: { silver: "bg-blue-500", gold: "bg-blue-600", bronze: "bg-blue-400", platinum: "bg-blue-700" },
  },
  twentyfive_tasks: {
    icon: Target,
    label: "25 Tasks",
    description: "Completed 25+ tasks",
    colors: { bronze: "bg-cyan-500", silver: "bg-cyan-400", gold: "bg-cyan-600", platinum: "bg-cyan-700" },
  },
  ten_tasks: {
    icon: Target,
    label: "10 Tasks",
    description: "Completed 10+ tasks",
    colors: { bronze: "bg-slate-500", silver: "bg-slate-400", gold: "bg-slate-600", platinum: "bg-slate-700" },
  },
};

export const BadgeDisplay = ({ userId, size = "md" }: BadgeDisplayProps) => {
  const [badges, setBadges] = useState<UserBadge[]>([]);

  useEffect(() => {
    if (userId) {
      fetchBadges();
    }
  }, [userId]);

  const fetchBadges = async () => {
    const { data } = await supabase
      .from("badges")
      .select("*")
      .eq("user_id", userId)
      .order("earned_at", { ascending: false });

    if (data) setBadges(data);
  };

  if (badges.length === 0) return null;

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => {
          const config = badgeConfig[badge.badge_type];
          if (!config) return null;

          const Icon = config.icon;
          const level = badge.badge_level || "gold";
          const colorClass = config.colors[level] || config.colors.gold || "bg-primary";

          return (
            <Tooltip key={badge.badge_type}>
              <TooltipTrigger>
                <Badge
                  variant="secondary"
                  className={`${colorClass} text-white border-0 flex items-center gap-1.5 cursor-pointer`}
                >
                  <Icon className={sizeClasses[size]} />
                  {badge.badge_level && <span className="capitalize text-xs">{badge.badge_level}</span>}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-semibold">{config.label}</p>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Earned: {new Date(badge.earned_at).toLocaleDateString()}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};
