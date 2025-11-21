import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Award, CheckCircle, Zap, Shield, Star, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BadgeDisplayProps {
  userId: string;
  size?: "sm" | "md" | "lg";
}

interface UserBadge {
  badge_type: string;
  badge_level: string;
  earned_at: string;
}

const badgeConfig = {
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
};

export const BadgeDisplay = ({ userId, size = "md" }: BadgeDisplayProps) => {
  const [badges, setBadges] = useState<UserBadge[]>([]);

  useEffect(() => {
    fetchBadges();
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
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => {
          const config = badgeConfig[badge.badge_type as keyof typeof badgeConfig];
          if (!config) return null;

          const Icon = config.icon;
          const colorClass = config.colors[badge.badge_level as keyof typeof config.colors];

          return (
            <Tooltip key={badge.badge_type}>
              <TooltipTrigger>
                <Badge
                  variant="secondary"
                  className={`${colorClass} text-white border-0 flex items-center gap-1.5`}
                >
                  <Icon className={sizeClasses[size]} />
                  <span className="capitalize">{badge.badge_level}</span>
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
