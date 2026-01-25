import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  DollarSign, 
  Shield,
  TrendingUp,
  Award,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHistoricalTrends } from "@/hooks/useHistoricalTrends";

interface QuickStatsBarProps {
  profile: any;
  stats: {
    totalBookings: number;
    pendingBookings: number;
    completedTasks: number;
    totalEarnings: number;
    unreadMessages: number;
  };
  badgeCount?: number;
  userId?: string;
}

export function QuickStatsBar({ profile, stats, badgeCount = 0, userId }: QuickStatsBarProps) {
  const historicalTrends = useHistoricalTrends(userId);
  
  // Use real historical data for trends when available
  const getTrend = (key: 'completedTasks' | 'earnings' | 'bookings') => {
    if (historicalTrends.loading) return null;
    const trend = historicalTrends[key];
    if (!trend) return null;
    return trend.trend === 'neutral' ? null : trend.trend;
  };

  const statItems = [
    {
      label: "Rating",
      value: profile?.rating?.toFixed(1) || "0.0",
      subValue: `${profile?.total_reviews || 0} reviews`,
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
      progress: (profile?.rating || 0) / 5 * 100,
    },
    {
      label: "Trust Score",
      value: profile?.trust_score || 50,
      subValue: profile?.trust_score >= 80 ? "Excellent" : profile?.trust_score >= 60 ? "Good" : "Building",
      icon: Shield,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      progress: profile?.trust_score || 50,
    },
    {
      label: "Reputation",
      value: Math.round(profile?.reputation_score || 0),
      subValue: "Score",
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      trend: null, // Reputation trend requires profile history which isn't tracked
    },
    {
      label: "Completed",
      value: stats.completedTasks,
      subValue: "Tasks",
      icon: CheckCircle,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      trend: getTrend('completedTasks'),
    },
    {
      label: "Pending",
      value: stats.pendingBookings,
      subValue: "Bookings",
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      highlight: stats.pendingBookings > 0,
    },
    {
      label: "Messages",
      value: stats.unreadMessages,
      subValue: "Unread",
      icon: MessageSquare,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      showBadge: stats.unreadMessages > 0,
      highlight: stats.unreadMessages > 0,
    },
    {
      label: "Badges",
      value: badgeCount,
      subValue: "Earned",
      icon: Award,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      label: "Earnings",
      value: `$${stats.totalEarnings.toFixed(0)}`,
      subValue: "Total",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-600/10",
      borderColor: "border-green-600/20",
      trend: getTrend('earnings'),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {statItems.map((item, index) => (
        <Card 
          key={item.label} 
          className={cn(
            "border hover:shadow-lg transition-all duration-300 group overflow-hidden",
            item.borderColor,
            item.highlight && "ring-2 ring-primary/50 animate-pulse"
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CardContent className="p-3 relative">
            {/* Background glow effect */}
            <div className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              item.bgColor
            )} style={{ filter: "blur(20px)" }} />
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                  item.bgColor
                )}>
                  <item.icon className={cn("h-4 w-4", item.color)} />
                </div>
                {item.trend && (
                  <div className={cn(
                    "ml-auto flex items-center text-xs font-medium",
                    item.trend === "up" ? "text-green-500" : "text-red-500"
                  )}>
                    {item.trend === "up" ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xl font-bold tracking-tight">{item.value}</p>
                  {item.showBadge && (
                    <Badge variant="destructive" className="h-4 text-[10px] px-1.5 animate-bounce">
                      New
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                
                {item.progress !== undefined && (
                  <Progress 
                    value={item.progress} 
                    className="h-1 mt-2" 
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
