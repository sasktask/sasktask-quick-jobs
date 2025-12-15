import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  MessageSquare, 
  DollarSign, 
  Calendar, 
  AlertCircle,
  Briefcase,
  Star,
  Settings,
  Filter,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

const notificationIcons: Record<string, React.ReactNode> = {
  message: <MessageSquare className="h-5 w-5" />,
  payment: <DollarSign className="h-5 w-5" />,
  booking: <Calendar className="h-5 w-5" />,
  task: <Briefcase className="h-5 w-5" />,
  review: <Star className="h-5 w-5" />,
  alert: <AlertCircle className="h-5 w-5" />,
  default: <Bell className="h-5 w-5" />,
};

const notificationColors: Record<string, string> = {
  message: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  payment: "bg-green-500/10 text-green-500 border-green-500/20",
  booking: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  task: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  review: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  alert: "bg-red-500/10 text-red-500 border-red-500/20",
  default: "bg-muted text-muted-foreground border-border",
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  // Notification preferences
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    push_notifications: true,
    task_alerts: true,
    message_alerts: true,
    payment_alerts: true,
    booking_alerts: true,
  });

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUserId(session.user.id);
    await loadNotifications(session.user.id);
  };

  const loadNotifications = async (uid: string) => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotifications(data);
    }
    setIsLoading(false);
  };

  const markAsRead = async (ids: string[]) => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .in("id", ids);

    setNotifications(prev =>
      prev.map(n => ids.includes(n.id) ? { ...n, read: true } : n)
    );
    setSelectedIds(new Set());
    toast.success(`${ids.length} notification(s) marked as read`);
  };

  const deleteNotifications = async (ids: string[]) => {
    await supabase
      .from("notifications")
      .delete()
      .in("id", ids);

    setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
    setSelectedIds(new Set());
    toast.success(`${ids.length} notification(s) deleted`);
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead([notification.id]);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return new Date(date).toLocaleDateString();
  };

  const getIcon = (type: string) => notificationIcons[type] || notificationIcons.default;
  const getColor = (type: string) => notificationColors[type] || notificationColors.default;

  const filteredNotifications = notifications.filter(n => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Bell className="h-8 w-8 text-primary" />
                Notifications
              </h1>
              <p className="text-muted-foreground mt-1">
                {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" onClick={markAllAsRead} className="gap-2">
                  <CheckCheck className="h-4 w-4" />
                  Mark All Read
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="notifications" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Preferences
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notifications" className="space-y-4">
              {/* Filter Bar */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground mr-2">Filter:</span>
                    {["all", "unread", "message", "payment", "booking", "task"].map((f) => (
                      <Badge
                        key={f}
                        variant={filter === f ? "default" : "outline"}
                        className="cursor-pointer capitalize"
                        onClick={() => setFilter(f)}
                      >
                        {f}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bulk Actions */}
              {selectedIds.size > 0 && (
                <Card className="border-primary/50 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {selectedIds.size} selected
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => markAsRead(Array.from(selectedIds))}
                          className="gap-1"
                        >
                          <CheckCheck className="h-3 w-3" />
                          Mark Read
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteNotifications(Array.from(selectedIds))}
                          className="gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setSelectedIds(new Set())}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notifications List */}
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <div className="h-20 w-20 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                      <Bell className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                    <p className="text-muted-foreground">
                      {filter !== "all" ? "Try changing your filter" : "You're all caught up!"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <button 
                      onClick={selectAll}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {selectedIds.size === filteredNotifications.length ? "Deselect all" : "Select all"}
                    </button>
                  </div>
                  <AnimatePresence>
                    {filteredNotifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card 
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md",
                            !notification.read && "border-l-4 border-l-primary bg-primary/5",
                            selectedIds.has(notification.id) && "ring-2 ring-primary"
                          )}
                        >
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <div 
                                className="shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSelect(notification.id);
                                }}
                              >
                                <div className={cn(
                                  "h-12 w-12 rounded-full flex items-center justify-center border",
                                  getColor(notification.type)
                                )}>
                                  {getIcon(notification.type)}
                                </div>
                              </div>
                              <div 
                                className="flex-1 min-w-0"
                                onClick={() => handleNotificationClick(notification)}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className={cn(
                                    "font-semibold",
                                    !notification.read && "text-foreground"
                                  )}>
                                    {notification.title}
                                  </h4>
                                  <span className="text-xs text-muted-foreground shrink-0">
                                    {getTimeAgo(notification.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                {notification.link && (
                                  <Button 
                                    variant="link" 
                                    className="h-auto p-0 mt-2 text-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(notification.link!);
                                    }}
                                  >
                                    View Details →
                                  </Button>
                                )}
                              </div>
                              {!notification.read && (
                                <div className="h-3 w-3 rounded-full bg-primary shrink-0 mt-1" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Delivery Methods</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications in your browser
                          </p>
                        </div>
                        <Switch
                          checked={preferences.push_notifications}
                          onCheckedChange={(checked) => 
                            setPreferences(p => ({ ...p, push_notifications: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive important updates via email
                          </p>
                        </div>
                        <Switch
                          checked={preferences.email_notifications}
                          onCheckedChange={(checked) => 
                            setPreferences(p => ({ ...p, email_notifications: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6 space-y-4">
                    <h4 className="font-medium">Notification Types</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-orange-500" />
                          </div>
                          <div>
                            <Label>Task Alerts</Label>
                            <p className="text-sm text-muted-foreground">New tasks and updates</p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.task_alerts}
                          onCheckedChange={(checked) => 
                            setPreferences(p => ({ ...p, task_alerts: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <Label>Message Alerts</Label>
                            <p className="text-sm text-muted-foreground">New messages and replies</p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.message_alerts}
                          onCheckedChange={(checked) => 
                            setPreferences(p => ({ ...p, message_alerts: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <Label>Payment Alerts</Label>
                            <p className="text-sm text-muted-foreground">Payment confirmations and updates</p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.payment_alerts}
                          onCheckedChange={(checked) => 
                            setPreferences(p => ({ ...p, payment_alerts: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-purple-500" />
                          </div>
                          <div>
                            <Label>Booking Alerts</Label>
                            <p className="text-sm text-muted-foreground">Booking requests and status changes</p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.booking_alerts}
                          onCheckedChange={(checked) => 
                            setPreferences(p => ({ ...p, booking_alerts: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={() => toast.success("Preferences saved!")}>
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Notifications;
