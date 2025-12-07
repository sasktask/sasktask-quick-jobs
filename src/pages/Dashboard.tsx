import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { RecommendedTasks } from "@/components/RecommendedTasks";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { 
  Briefcase, 
  DollarSign, 
  Star, 
  Plus,
  Search,
  User,
  MapPin,
  MessageSquare,
  CheckCircle,
  Clock,
  Trophy
} from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedTasks: 0,
    totalEarnings: 0,
    unreadMessages: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Realtime notifications
  const handleNewTask = useCallback((task: any) => {
    if (userRole === "task_doer") {
      setTasks(prev => [task, ...prev.slice(0, 4)]);
    }
  }, [userRole]);

  const handleNewMessage = useCallback(() => {
    setStats(prev => ({ ...prev, unreadMessages: prev.unreadMessages + 1 }));
  }, []);

  const handleBookingUpdate = useCallback(() => {
    if (user?.id && userRole) {
      fetchStats(user.id, userRole);
    }
  }, [user?.id, userRole]);

  useRealtimeNotifications({
    userId: user?.id || null,
    onNewTask: handleNewTask,
    onNewMessage: handleNewMessage,
    onBookingUpdate: handleBookingUpdate,
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch user role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      setUserRole(roleData?.role || null);

      // Fetch stats
      await fetchStats(session.user.id, roleData?.role);

      // Fetch tasks based on role
      if (roleData?.role === "task_giver") {
        const { data: tasksData } = await supabase
          .from("tasks")
          .select("*")
          .eq("task_giver_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(5);
        setTasks(tasksData || []);
      } else {
        const { data: tasksData } = await supabase
          .from("tasks")
          .select("*")
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(5);
        setTasks(tasksData || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async (userId: string, role: string | undefined) => {
    try {
      // Get bookings count
      const { count: totalBookings } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("task_doer_id", userId);

      // Get pending bookings
      const { count: pendingBookings } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("task_doer_id", userId)
        .eq("status", "pending");

      // Get completed tasks
      const { count: completedTasks } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("task_doer_id", userId)
        .eq("status", "completed");

      // Get earnings (sum of completed payment amounts)
      const { data: payments } = await supabase
        .from("payments")
        .select("payout_amount")
        .eq("payee_id", userId)
        .eq("status", "completed");

      const totalEarnings = payments?.reduce((sum, p) => sum + (p.payout_amount || 0), 0) || 0;

      // Get unread messages
      const { count: unreadMessages } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", userId)
        .is("read_at", null);

      setStats({
        totalBookings: totalBookings || 0,
        pendingBookings: pendingBookings || 0,
        completedTasks: completedTasks || 0,
        totalEarnings,
        unreadMessages: unreadMessages || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Dashboard - SaskTask"
        description="Manage your tasks, bookings, and earnings on SaskTask"
        url="/dashboard"
      />
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {profile?.full_name || user?.email}!
            </h1>
            <p className="text-muted-foreground">
              {userRole === "task_giver" ? "Manage your tasks" : "Find your next opportunity"}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/bookings">
              <Button variant="default">
                <Briefcase className="mr-2 h-4 w-4" />
                Bookings
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </Link>
            {userRole === "task_doer" && (
              <Link to="/verification">
                <Button variant="secondary">
                  Get Verified
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold">{profile?.rating?.toFixed(1) || "0.0"}</p>
                </div>
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedTasks}</p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pendingBookings}</p>
                </div>
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Messages</p>
                  <p className="text-2xl font-bold">{stats.unreadMessages}</p>
                </div>
                <MessageSquare className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Earnings</p>
                  <p className="text-2xl font-bold">${stats.totalEarnings.toFixed(0)}</p>
                </div>
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link to={userRole === "task_giver" ? "/post-task" : "/browse"}>
            <Card className="cursor-pointer hover:shadow-lg transition-all border-primary/30 hover:border-primary h-full">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  {userRole === "task_giver" ? <Plus className="h-6 w-6 text-primary" /> : <Search className="h-6 w-6 text-primary" />}
                </div>
                <h3 className="font-bold">{userRole === "task_giver" ? "Post Task" : "Find Tasks"}</h3>
              </CardContent>
            </Card>
          </Link>

          <Link to="/bookings">
            <Card className="cursor-pointer hover:shadow-lg transition-all border-secondary/30 hover:border-secondary h-full">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-bold">Bookings</h3>
              </CardContent>
            </Card>
          </Link>

          <Link to="/messages">
            <Card className="cursor-pointer hover:shadow-lg transition-all border-blue-500/30 hover:border-blue-500 h-full">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-bold">Messages</h3>
                {stats.unreadMessages > 0 && (
                  <span className="text-xs text-blue-500">{stats.unreadMessages} unread</span>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link to="/leaderboard">
            <Card className="cursor-pointer hover:shadow-lg transition-all border-yellow-500/30 hover:border-yellow-500 h-full">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-3">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                </div>
                <h3 className="font-bold">Leaderboard</h3>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* AI-Powered Recommendations for Task Doers */}
        {userRole === "task_doer" && user?.id && (
          <div className="mb-8">
            <RecommendedTasks userId={user.id} />
          </div>
        )}

        {/* Recent Tasks */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {userRole === "task_giver" ? "Your Recent Tasks" : "Available Tasks - Accept Instantly"}
              {userRole === "task_doer" && (
                <span className="text-sm font-normal text-muted-foreground">
                  (Like Uber - One Tap Accept)
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {userRole === "task_giver" 
                ? "Manage your posted tasks" 
                : "Browse and instantly accept tasks near you"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tasks available yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <Card key={task.id} className="border-border hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-1">{task.title}</h4>
                          <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{task.description}</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                              {task.category}
                            </span>
                            <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-bold">
                              ${task.pay_amount}
                            </span>
                            <span className="px-3 py-1 bg-muted text-foreground rounded-full text-xs flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {task.location}
                            </span>
                          </div>
                        </div>
                        {userRole === "task_doer" ? (
                          <Button 
                            variant="default" 
                            size="lg"
                            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 font-bold shrink-0"
                            onClick={() => navigate(`/task/${task.id}`)}
                          >
                            Accept Task
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/task/${task.id}`)}
                          >
                            View Details
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
