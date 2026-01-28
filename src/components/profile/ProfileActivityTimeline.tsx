import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek } from "date-fns";
import {
  History,
  User,
  Shield,
  CreditCard,
  MessageSquare,
  Briefcase,
  Star,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Edit,
  Eye,
  Upload,
  Download,
  Settings,
  Key,
  LogIn,
  LogOut,
  Trash2,
  Plus,
  RefreshCw,
  Filter,
} from "lucide-react";

interface ProfileActivityTimelineProps {
  userId: string;
}

interface ActivityEvent {
  id: string;
  type: 
    | "login"
    | "logout"
    | "profile_update"
    | "password_change"
    | "task_created"
    | "task_completed"
    | "booking_made"
    | "review_received"
    | "payment"
    | "verification"
    | "settings_change"
    | "message"
    | "document_upload";
  title: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  category: "security" | "profile" | "tasks" | "payments" | "communication";
}

const eventTypeConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  login: { icon: LogIn, color: "text-green-600", bgColor: "bg-green-500/10" },
  logout: { icon: LogOut, color: "text-gray-600", bgColor: "bg-gray-500/10" },
  profile_update: { icon: Edit, color: "text-blue-600", bgColor: "bg-blue-500/10" },
  password_change: { icon: Key, color: "text-amber-600", bgColor: "bg-amber-500/10" },
  task_created: { icon: Plus, color: "text-primary", bgColor: "bg-primary/10" },
  task_completed: { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-500/10" },
  booking_made: { icon: Briefcase, color: "text-purple-600", bgColor: "bg-purple-500/10" },
  review_received: { icon: Star, color: "text-yellow-600", bgColor: "bg-yellow-500/10" },
  payment: { icon: CreditCard, color: "text-emerald-600", bgColor: "bg-emerald-500/10" },
  verification: { icon: Shield, color: "text-blue-600", bgColor: "bg-blue-500/10" },
  settings_change: { icon: Settings, color: "text-gray-600", bgColor: "bg-gray-500/10" },
  message: { icon: MessageSquare, color: "text-indigo-600", bgColor: "bg-indigo-500/10" },
  document_upload: { icon: Upload, color: "text-cyan-600", bgColor: "bg-cyan-500/10" },
};

const categoryFilters = [
  { value: "all", label: "All Activity" },
  { value: "security", label: "Security" },
  { value: "profile", label: "Profile" },
  { value: "tasks", label: "Tasks" },
  { value: "payments", label: "Payments" },
];

export const ProfileActivityTimeline = ({ userId }: ProfileActivityTimelineProps) => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchActivityData();
  }, [userId]);

  const fetchActivityData = async () => {
    try {
      // Fetch various activity sources
      const [loginResult, profileResult, bookingsResult, paymentsResult] = await Promise.all([
        supabase
          .from('login_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('profiles')
          .select('updated_at, last_active')
          .eq('id', userId)
          .single(),
        supabase
          .from('bookings')
          .select('id, status, created_at, task_id')
          .or(`poster_id.eq.${userId},doer_id.eq.${userId}`)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('payments')
          .select('id, amount, status, created_at')
          .eq('payer_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      const events: ActivityEvent[] = [];

      // Process login history
      if (loginResult.data) {
        loginResult.data.forEach((login) => {
          const locationInfo = login.location_info as { city?: string; country?: string } | null;
          const locationStr = locationInfo ? `${locationInfo.city || 'Unknown'}` : 'Unknown location';
          events.push({
            id: `login-${login.id}`,
            type: login.success ? "login" : "login",
            title: login.success ? "Signed in successfully" : "Failed sign-in attempt",
            description: `From ${locationStr} · ${login.ip_address || 'Unknown IP'}`,
            metadata: { ip: login.ip_address, location: locationStr },
            timestamp: new Date(login.login_at),
            category: "security",
          });
        });
      }

      // Process bookings
      if (bookingsResult.data) {
        bookingsResult.data.forEach((booking) => {
          events.push({
            id: `booking-${booking.id}`,
            type: "booking_made",
            title: `Booking ${booking.status}`,
            description: `Booking status updated to ${booking.status}`,
            timestamp: new Date(booking.created_at),
            category: "tasks",
          });
        });
      }

      // Process payments
      if (paymentsResult.data) {
        paymentsResult.data.forEach((payment) => {
          events.push({
            id: `payment-${payment.id}`,
            type: "payment",
            title: `Payment ${payment.status}`,
            description: `$${payment.amount} ${payment.status}`,
            timestamp: new Date(payment.created_at),
            category: "payments",
          });
        });
      }

      // Sort by timestamp
      events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setActivities(events);
    } catch (error) {
      console.error('Failed to fetch activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchActivityData();
    setIsRefreshing(false);
  };

  const filteredActivities = activeFilter === "all"
    ? activities
    : activities.filter(a => a.category === activeFilter);

  const groupActivitiesByDate = (activities: ActivityEvent[]) => {
    const groups: { label: string; activities: ActivityEvent[] }[] = [];
    const today: ActivityEvent[] = [];
    const yesterday: ActivityEvent[] = [];
    const thisWeek: ActivityEvent[] = [];
    const older: ActivityEvent[] = [];

    activities.forEach(activity => {
      if (isToday(activity.timestamp)) {
        today.push(activity);
      } else if (isYesterday(activity.timestamp)) {
        yesterday.push(activity);
      } else if (isThisWeek(activity.timestamp)) {
        thisWeek.push(activity);
      } else {
        older.push(activity);
      }
    });

    if (today.length > 0) groups.push({ label: "Today", activities: today });
    if (yesterday.length > 0) groups.push({ label: "Yesterday", activities: yesterday });
    if (thisWeek.length > 0) groups.push({ label: "This Week", activities: thisWeek });
    if (older.length > 0) groups.push({ label: "Earlier", activities: older });

    return groups;
  };

  const activityGroups = groupActivitiesByDate(filteredActivities);

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3">
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

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <History className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Activity Timeline</CardTitle>
              <CardDescription className="text-xs">
                Your account activity history
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {categoryFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={activeFilter === filter.value ? "default" : "outline"}
              size="sm"
              className="text-xs whitespace-nowrap"
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Timeline */}
        <ScrollArea className="h-[400px] pr-4">
          {activityGroups.length > 0 ? (
            <div className="space-y-6">
              {activityGroups.map((group, groupIndex) => (
                <div key={group.label}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {group.label}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
                    
                    <div className="space-y-4">
                      {group.activities.map((activity, index) => {
                        const config = eventTypeConfig[activity.type] || {
                          icon: Clock,
                          color: "text-muted-foreground",
                          bgColor: "bg-muted",
                        };
                        const Icon = config.icon;

                        return (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="relative pl-12"
                          >
                            {/* Icon */}
                            <div
                              className={`absolute left-0 p-2 rounded-full ${config.bgColor} border-2 border-background`}
                            >
                              <Icon className={`h-4 w-4 ${config.color}`} />
                            </div>

                            {/* Content */}
                            <div className="p-3 rounded-lg border border-border hover:border-primary/20 transition-colors bg-card">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-medium text-sm">{activity.title}</h4>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {activity.description}
                                  </p>
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {format(activity.timestamp, 'h:mm a')}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <h3 className="font-medium text-muted-foreground">No activity yet</h3>
              <p className="text-sm text-muted-foreground/70">
                Your account activity will appear here
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
