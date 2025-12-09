import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  DollarSign, 
  Shield,
  TrendingUp,
  Award
} from "lucide-react";

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
}

export function QuickStatsBar({ profile, stats, badgeCount = 0 }: QuickStatsBarProps) {
  const statItems = [
    {
      label: "Rating",
      value: profile?.rating?.toFixed(1) || "0.0",
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Trust Score",
      value: profile?.trust_score || 50,
      icon: Shield,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Reputation",
      value: Math.round(profile?.reputation_score || 0),
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Completed",
      value: stats.completedTasks,
      icon: CheckCircle,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Pending",
      value: stats.pendingBookings,
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "Messages",
      value: stats.unreadMessages,
      icon: MessageSquare,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      showBadge: stats.unreadMessages > 0,
    },
    {
      label: "Badges",
      value: badgeCount,
      icon: Award,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Earnings",
      value: `$${stats.totalEarnings.toFixed(0)}`,
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {statItems.map((item) => (
        <Card key={item.label} className="border-border hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{item.label}</p>
                <div className="flex items-center gap-1">
                  <p className="text-lg font-bold">{item.value}</p>
                  {item.showBadge && (
                    <Badge variant="destructive" className="h-4 text-[10px] px-1">
                      New
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
