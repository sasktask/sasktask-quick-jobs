import { usePlatformStats } from "@/hooks/usePlatformStats";
import { StatsCounter } from "@/components/StatsCounter";
import { Star, Users, CheckCircle, Shield, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SocialProofBarProps {
  className?: string;
  variant?: "default" | "compact";
}

export function SocialProofBar({ className, variant = "default" }: SocialProofBarProps) {
  const stats = usePlatformStats();

  const proofItems = [
    {
      icon: Users,
      value: stats.totalUsers,
      suffix: "",
      label: "Users",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: CheckCircle,
      value: stats.totalTasksCompleted,
      suffix: "",
      label: "Tasks Done",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      icon: Star,
      value: stats.averageRating > 0 ? stats.averageRating : "N/A",
      suffix: "",
      label: "Avg Rating",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      isRating: true
    },
    {
      icon: Shield,
      value: stats.totalActiveTaskers,
      suffix: "",
      label: "Active Taskers",
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ];

  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap justify-center gap-6 py-4", className)}>
        {proofItems.map((item, index) => (
          <div 
            key={item.label}
            className="flex items-center gap-2 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <item.icon className={cn("h-4 w-4", item.color)} />
            <span className="font-bold text-foreground">
              {stats.isLoading ? (
                <Skeleton className="h-4 w-8 inline-block" />
              ) : item.isRating ? (
                item.value
              ) : typeof item.value === 'number' ? (
                <StatsCounter end={item.value} suffix={item.suffix} />
              ) : (
                item.value
              )}
            </span>
            <span className="text-sm text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-gradient-to-r from-muted/50 via-background to-muted/50 border-y border-border py-6",
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center lg:justify-between items-center gap-6 lg:gap-4">
          {/* Trust badge */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-5 w-5 text-primary" />
            <span>Trusted by Saskatchewan</span>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
            {proofItems.map((item, index) => (
              <div 
                key={item.label}
                className="flex items-center gap-3 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", item.bgColor)}>
                  <item.icon className={cn("h-5 w-5", item.color)} />
                </div>
                <div>
                  <p className="font-bold text-lg text-foreground">
                    {stats.isLoading ? (
                      <Skeleton className="h-5 w-12" />
                    ) : item.isRating ? (
                      <span className="flex items-center gap-1">
                        {item.value}
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      </span>
                    ) : typeof item.value === 'number' ? (
                      <StatsCounter end={item.value} suffix={item.suffix} />
                    ) : (
                      item.value
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trending */}
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <span className="text-emerald-500 font-medium">Growing Fast</span>
          </div>
        </div>
      </div>
    </div>
  );
}
