import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { 
  Activity, 
  MessageSquare, 
  Briefcase, 
  CheckCircle, 
  DollarSign, 
  Star,
  Clock,
  ArrowRight,
  Zap
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface ActivityItem {
  id: string;
  type: "message" | "booking" | "task" | "payment" | "review";
  title: string;
  description: string;
  timestamp: string;
  link?: string;
}

interface DashboardActivityFeedProps {
  userId: string;
  userRole: string | null;
}

export function DashboardActivityFeed({ userId, userRole }: DashboardActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const fetchActivities = async () => {
    try {
      const activityList: ActivityItem[] = [];

      // Fetch recent messages
      const { data: messages } = await supabase
        .from("messages")
        .select("id, message, created_at, sender_id")
        .eq("receiver_id", userId)
        .order("created_at", { ascending: false })
        .limit(3);

      messages?.forEach((msg) => {
        activityList.push({
          id: `msg-${msg.id}`,
          type: "message",
          title: "New message received",
          description: msg.message.slice(0, 50) + (msg.message.length > 50 ? "..." : ""),
          timestamp: msg.created_at,
          link: "/messages"
        });
      });

      // Fetch recent bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select("id, status, created_at, updated_at, task_id")
        .or(userRole === "task_doer" ? `task_doer_id.eq.${userId}` : `task_id.in.(select id from tasks where task_giver_id = '${userId}')`)
        .order("updated_at", { ascending: false })
        .limit(3);

      bookings?.forEach((booking) => {
        const statusMessages: Record<string, string> = {
          pending: "New booking request",
          accepted: "Booking accepted",
          in_progress: "Task in progress",
          completed: "Task completed",
          cancelled: "Booking cancelled"
        };
        activityList.push({
          id: `book-${booking.id}`,
          type: "booking",
          title: statusMessages[booking.status || "pending"] || "Booking update",
          description: `Status: ${booking.status}`,
          timestamp: booking.updated_at || booking.created_at,
          link: "/bookings"
        });
      });

      // Fetch recent payments
      const { data: payments } = await supabase
        .from("payments")
        .select("id, amount, status, created_at")
        .eq(userRole === "task_doer" ? "payee_id" : "payer_id", userId)
        .order("created_at", { ascending: false })
        .limit(2);

      payments?.forEach((payment) => {
        activityList.push({
          id: `pay-${payment.id}`,
          type: "payment",
          title: payment.status === "completed" ? "Payment received" : "Payment pending",
          description: `$${payment.amount.toFixed(2)}`,
          timestamp: payment.created_at,
          link: "/payments"
        });
      });

      // Sort by timestamp
      activityList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setActivities(activityList.slice(0, 8));
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "message":
        return { icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" };
      case "booking":
        return { icon: Briefcase, color: "text-primary", bg: "bg-primary/10" };
      case "task":
        return { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" };
      case "payment":
        return { icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" };
      case "review":
        return { icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" };
      default:
        return { icon: Activity, color: "text-muted-foreground", bg: "bg-muted" };
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No recent activity</p>
            <p className="text-xs mt-1">Your activity will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[320px] px-6">
          <div className="space-y-1 pb-4">
            {activities.map((activity, index) => {
              const { icon: Icon, color, bg } = getActivityIcon(activity.type);
              return (
                <Link
                  key={activity.id}
                  to={activity.link || "#"}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`h-10 w-10 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {activity.title}
                      </p>
                      <Badge variant="outline" className="text-xs shrink-0 gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {activity.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-center" />
                </Link>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
