import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Award, 
  CheckCircle, 
  Zap, 
  Shield, 
  Star, 
  TrendingUp, 
  Trophy,
  Crown,
  Target,
  Medal
} from "lucide-react";

interface BadgeShowcaseProps {
  userId: string;
}

interface UserBadge {
  id: string;
  badge_type: string;
  badge_level: string | null;
  earned_at: string;
}

const badgeConfig: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  gradient: string;
  bgColor: string;
}> = {
  // Original badges
  top_rated: {
    icon: Star,
    label: "Top Rated",
    description: "Maintains exceptional rating with multiple reviews",
    gradient: "from-yellow-500 to-amber-600",
    bgColor: "bg-yellow-500/10",
  },
  reliable: {
    icon: CheckCircle,
    label: "Reliable",
    description: "Outstanding on-time completion rate",
    gradient: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-500/10",
  },
  quick_responder: {
    icon: Zap,
    label: "Quick Responder",
    description: "Responds to messages quickly",
    gradient: "from-orange-500 to-red-600",
    bgColor: "bg-orange-500/10",
  },
  verified_expert: {
    icon: Shield,
    label: "Verified Expert",
    description: "Background checked and certified professional",
    gradient: "from-green-500 to-emerald-600",
    bgColor: "bg-green-500/10",
  },
  frequent_user: {
    icon: TrendingUp,
    label: "Frequent User",
    description: "Active and engaged platform member",
    gradient: "from-indigo-500 to-violet-600",
    bgColor: "bg-indigo-500/10",
  },
  perfect_record: {
    icon: Award,
    label: "Perfect Record",
    description: "Zero disputes or cancellations",
    gradient: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-500/10",
  },
  // Leaderboard badges
  leaderboard_champion: {
    icon: Crown,
    label: "Leaderboard Champion",
    description: "Ranked #1 on the leaderboard",
    gradient: "from-yellow-400 to-amber-500",
    bgColor: "bg-yellow-400/10",
  },
  leaderboard_elite: {
    icon: Trophy,
    label: "Leaderboard Elite",
    description: "Ranked in the top 3 on the leaderboard",
    gradient: "from-purple-500 to-indigo-600",
    bgColor: "bg-purple-500/10",
  },
  leaderboard_top10: {
    icon: Trophy,
    label: "Top 10",
    description: "Ranked in the top 10 on the leaderboard",
    gradient: "from-indigo-400 to-purple-500",
    bgColor: "bg-indigo-400/10",
  },
  rating_champion: {
    icon: Star,
    label: "Rating Champion",
    description: "Highest rated tasker on the platform",
    gradient: "from-yellow-500 to-orange-600",
    bgColor: "bg-yellow-500/10",
  },
  highly_rated: {
    icon: Star,
    label: "Highly Rated",
    description: "Achieved a 4.8+ rating with 10+ reviews",
    gradient: "from-amber-400 to-orange-500",
    bgColor: "bg-amber-400/10",
  },
  century_tasker: {
    icon: Medal,
    label: "Century Tasker",
    description: "Completed 100+ tasks",
    gradient: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-500/10",
  },
  fifty_tasks: {
    icon: Target,
    label: "50 Tasks",
    description: "Completed 50+ tasks",
    gradient: "from-blue-400 to-indigo-500",
    bgColor: "bg-blue-400/10",
  },
  twentyfive_tasks: {
    icon: Target,
    label: "25 Tasks",
    description: "Completed 25+ tasks",
    gradient: "from-cyan-400 to-blue-500",
    bgColor: "bg-cyan-400/10",
  },
  ten_tasks: {
    icon: Target,
    label: "10 Tasks",
    description: "Completed 10+ tasks",
    gradient: "from-slate-400 to-gray-500",
    bgColor: "bg-slate-400/10",
  },
};

const levelColors: Record<string, string> = {
  bronze: "border-amber-700 text-amber-700",
  silver: "border-slate-400 text-slate-400",
  gold: "border-yellow-500 text-yellow-500",
  platinum: "border-purple-500 text-purple-500",
};

export const BadgeShowcase = ({ userId }: BadgeShowcaseProps) => {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchBadges();
    }
  }, [userId]);

  const fetchBadges = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from("badges")
        .select("*")
        .eq("user_id", userId)
        .order("earned_at", { ascending: false });

      if (data) setBadges(data);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Achievements & Badges
          </CardTitle>
          <CardDescription>Loading your achievements...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Achievements & Badges
        </CardTitle>
        <CardDescription>
          {badges.length > 0 
            ? `You've earned ${badges.length} badge${badges.length === 1 ? '' : 's'}! Keep up the great work.`
            : "Complete tasks and climb the leaderboard to earn badges!"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No badges earned yet</p>
            <p className="text-sm mt-1">Complete tasks and maintain great ratings to earn badges</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badges.map((badge) => {
              const config = badgeConfig[badge.badge_type];
              if (!config) return null;

              const Icon = config.icon;
              const levelClass = badge.badge_level ? levelColors[badge.badge_level] : "";

              return (
                <div
                  key={badge.id}
                  className={`relative p-4 rounded-lg border ${config.bgColor} border-border hover:border-primary/50 transition-all group`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient} text-white shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-sm">{config.label}</h4>
                        {badge.badge_level && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs capitalize ${levelClass}`}
                          >
                            {badge.badge_level}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {config.description}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-2">
                        Earned {new Date(badge.earned_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
