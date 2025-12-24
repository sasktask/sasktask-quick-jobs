import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Briefcase, TrendingUp, Clock, MessageSquare, Shield, Award } from "lucide-react";

interface ProfileStatsCardProps {
  profile: any;
  trustScore: number;
}

export const ProfileStatsCard = ({ profile, trustScore }: ProfileStatsCardProps) => {
  const stats = [
    {
      icon: Star,
      label: "Rating",
      value: profile?.rating?.toFixed(1) || "0.0",
      suffix: "/5",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      icon: Award,
      label: "Reviews",
      value: profile?.total_reviews || 0,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Briefcase,
      label: "Completed",
      value: profile?.completed_tasks || 0,
      suffix: " tasks",
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      icon: TrendingUp,
      label: "Response Rate",
      value: profile?.response_rate || 100,
      suffix: "%",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: Clock,
      label: "On-Time",
      value: profile?.on_time_rate || 100,
      suffix: "%",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    }
  ];

  const getTrustLevel = () => {
    if (trustScore >= 90) return { label: "Excellent", color: "text-green-600" };
    if (trustScore >= 70) return { label: "Good", color: "text-blue-600" };
    if (trustScore >= 50) return { label: "Average", color: "text-yellow-600" };
    return { label: "Building", color: "text-orange-600" };
  };

  const trustLevel = getTrustLevel();

  return (
    <Card className="border-border overflow-hidden">
      <CardContent className="p-0">
        {/* Trust Score Section */}
        <div className="p-5 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Trust Score</h3>
                <p className={`text-xs ${trustLevel.color}`}>{trustLevel.label}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-primary">{trustScore}</span>
              <span className="text-muted-foreground text-sm">/100</span>
            </div>
          </div>
          <Progress value={trustScore} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="p-5">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Performance Metrics
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className={`flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors ${
                  index === stats.length - 1 && stats.length % 2 !== 0 ? 'col-span-2' : ''
                }`}
              >
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-semibold">
                    {stat.value}
                    {stat.suffix && <span className="text-muted-foreground text-sm">{stat.suffix}</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
