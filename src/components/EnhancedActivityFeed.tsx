import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Briefcase, 
  DollarSign, 
  CheckCircle,
  Clock,
  Star,
  Bell,
  ArrowRight,
  RefreshCw,
  Filter
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "message" | "booking" | "payment" | "review" | "task";
  title: string;
  description: string;
  timestamp: string;
  link: string;
  isNew?: boolean;
}

interface EnhancedActivityFeedProps {
  userId: string;
  userRole?: string;
}

export function EnhancedActivityFeed({ userId, userRole }: EnhancedActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "messages" | "bookings" | "payments">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchActivities = async () => {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const allActivities: ActivityItem[] = [];

      // Fetch messages
      const { data: messages } = await supabase
        .from("messages")
        .select(`
          id,
          message,
          created_at,
          booking_id,
          sender_id,
          read_at
        `)
        .eq("receiver_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (messages) {
        for (const msg of messages) {
          const { data: sender } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", msg.sender_id)
            .maybeSingle();

          allActivities.push({
            id: msg.id,
            type: "message",
            title: `Message from ${sender?.full_name || "Someone"}`,
            description: msg.message.slice(0, 50) + (msg.message.length > 50 ? "..." : ""),
            timestamp: msg.created_at,
            link: `/messages?booking=${msg.booking_id}`,
            isNew: !msg.read_at && new Date(msg.created_at) > oneHourAgo
          });
        }
      }

      // Fetch bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select(`
          id,
          status,
          created_at,
          updated_at,
          task:tasks(title)
        `)
        .or(`task_doer_id.eq.${userId}`)
        .order("updated_at", { ascending: false })
        .limit(10);

      if (bookings) {
        bookings.forEach((booking) => {
          allActivities.push({
            id: booking.id,
            type: "booking",
            title: `Booking ${booking.status}`,
            description: booking.task?.title || "Task booking",
            timestamp: booking.updated_at || booking.created_at,
            link: `/bookings`,
            isNew: new Date(booking.updated_at || booking.created_at) > oneHourAgo
          });
        });
      }

      // Fetch payments
      const { data: payments } = await supabase
        .from("payments")
        .select("id, amount, status, created_at, updated_at")
        .or(`payer_id.eq.${userId},payee_id.eq.${userId}`)
        .order("updated_at", { ascending: false })
        .limit(10);

      if (payments) {
        payments.forEach((payment) => {
          allActivities.push({
            id: payment.id,
            type: "payment",
            title: `Payment ${payment.status}`,
            description: `$${payment.amount.toFixed(2)}`,
            timestamp: payment.updated_at || payment.created_at,
            link: `/payments`,
            isNew: new Date(payment.updated_at || payment.created_at) > oneHourAgo
          });
        });
      }

      // Sort by timestamp
      allActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(allActivities.slice(0, 15));
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchActivities();
    }
  }, [userId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchActivities();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === "all") return true;
    if (filter === "messages") return activity.type === "message";
    if (filter === "bookings") return activity.type === "booking";
    if (filter === "payments") return activity.type === "payment";
    return true;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "message":
        return { icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" };
      case "booking":
        return { icon: Briefcase, color: "text-orange-500", bg: "bg-orange-500/10" };
      case "payment":
        return { icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" };
      case "review":
        return { icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" };
      case "task":
        return { icon: CheckCircle, color: "text-purple-500", bg: "bg-purple-500/10" };
      default:
        return { icon: Bell, color: "text-muted-foreground", bg: "bg-muted" };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Activity Feed
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn(
              "h-4 w-4",
              isRefreshing && "animate-spin"
            )} />
          </Button>
        </div>
        
        {/* Filter tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mt-2">
          <TabsList className="grid w-full grid-cols-4 h-8">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="messages" className="text-xs">Messages</TabsTrigger>
            <TabsTrigger value="bookings" className="text-xs">Bookings</TabsTrigger>
            <TabsTrigger value="payments" className="text-xs">Payments</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[350px]">
          <AnimatePresence mode="popLayout">
            {filteredActivities.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredActivities.map((activity, index) => {
                  const { icon: Icon, color, bg } = getActivityIcon(activity.type);
                  
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={activity.link}
                        className={cn(
                          "flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors",
                          activity.isNew && "bg-primary/5"
                        )}
                      >
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                          bg
                        )}>
                          <Icon className={cn("h-5 w-5", color)} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">
                              {activity.title}
                            </p>
                            {activity.isNew && (
                              <Badge variant="default" className="h-4 text-[10px] px-1.5">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {activity.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
