import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { RecommendedTasks } from "@/components/RecommendedTasks";
import { DashboardQuickFooter } from "@/components/DashboardQuickFooter";
import { TrustScoreCard } from "@/components/TrustScoreCard";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { 
  Briefcase, 
  DollarSign, 
  Star, 
  Plus,
  Search,
  User,
  MapPin,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Award,
  Loader2,
  Wallet,
  Trophy
} from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [verification, setVerification] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [badgeCount, setBadgeCount] = useState(0);
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

      // Fetch profile with reputation
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*, reputation_score, trust_score")
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

      // Fetch verification status
      const { data: verificationData } = await supabase
        .from("verifications")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      setVerification(verificationData);

      // Fetch badge count
      const { count: badges } = await supabase
        .from("badges")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);
      
      setBadgeCount(badges || 0);

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

  const isVerified = verification?.verification_status === "verified";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
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
      
      <main className="pt-16 pb-20 lg:pb-8 min-h-screen">
        <div className="container mx-auto px-4 py-6">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold">
                  Welcome, {profile?.full_name?.split(' ')[0] || 'there'}!
                </h1>
                {isVerified && (
                  <Badge variant="default" className="gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm flex items-center gap-2">
                {userRole === "task_giver" ? (
                  <>
                    <Briefcase className="h-4 w-4" />
                    Task Giver
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Task Doer • Score: {Math.round(profile?.reputation_score || 0)}
                  </>
                )}
              </p>
            </div>
            <div className="hidden md:flex gap-2">
              {userRole === "task_giver" ? (
                <Link to="/post-task">
                  <Button variant="default" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Post Task
                  </Button>
                </Link>
              ) : (
                <Link to="/browse">
                  <Button variant="default" size="sm" className="gap-2">
                    <Search className="h-4 w-4" />
                    Find Tasks
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{profile?.rating?.toFixed(1) || "0.0"}</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.completedTasks}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">${stats.totalEarnings}</p>
                    <p className="text-xs text-muted-foreground">Earnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Award className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{badgeCount}</p>
                    <p className="text-xs text-muted-foreground">Badges</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Verification Prompt */}
          {userRole === "task_doer" && !isVerified && (
            <Card className="mb-6 border-primary/50 bg-primary/5">
              <CardContent className="py-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <p className="text-sm font-medium">Get verified to boost visibility</p>
                  </div>
                  <Link to="/verification">
                    <Button variant="default" size="sm">
                      Verify <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Links - Desktop Only */}
          <div className="hidden lg:grid grid-cols-5 gap-3 mb-6">
            <Link to="/my-tasks">
              <Card className="cursor-pointer hover:shadow-md transition-all h-full">
                <CardContent className="p-3 text-center">
                  <Briefcase className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs font-medium">My Tasks</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/payments">
              <Card className="cursor-pointer hover:shadow-md transition-all h-full">
                <CardContent className="p-3 text-center">
                  <Wallet className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs font-medium">Payments</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/leaderboard">
              <Card className="cursor-pointer hover:shadow-md transition-all h-full">
                <CardContent className="p-3 text-center">
                  <Trophy className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs font-medium">Leaderboard</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/find-taskers">
              <Card className="cursor-pointer hover:shadow-md transition-all h-full">
                <CardContent className="p-3 text-center">
                  <User className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs font-medium">Find Taskers</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/account">
              <Card className="cursor-pointer hover:shadow-md transition-all h-full">
                <CardContent className="p-3 text-center">
                  <User className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs font-medium">Account</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Recommendations */}
              {userRole === "task_doer" && user?.id && (
                <RecommendedTasks userId={user.id} />
              )}

              {/* Recent Tasks */}
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {userRole === "task_giver" ? "Your Tasks" : "Available Tasks"}
                    </CardTitle>
                    <Link to={userRole === "task_giver" ? "/my-tasks" : "/browse"}>
                      <Button variant="ghost" size="sm" className="gap-1 text-xs">
                        View All <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {tasks.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No tasks yet</p>
                      {userRole === "task_giver" && (
                        <Link to="/post-task">
                          <Button variant="default" size="sm" className="mt-3">
                            Post Task
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tasks.slice(0, 4).map((task) => (
                        <div 
                          key={task.id} 
                          className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => navigate(`/task/${task.id}`)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">{task.category}</Badge>
                              <span className="text-xs text-green-600 font-medium">${task.pay_amount}</span>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Trust Score */}
              {userRole === "task_doer" && (
                <TrustScoreCard
                  trustScore={profile?.trust_score || 50}
                  verificationLevel={verification?.verification_status}
                  idVerified={verification?.id_verified}
                  backgroundCheck={verification?.background_check_status}
                  hasInsurance={verification?.has_insurance}
                  rating={profile?.rating}
                  responseRate={profile?.response_rate}
                  onTimeRate={profile?.on_time_rate}
                  completedTasks={profile?.completed_tasks}
                />
              )}

              {/* Badges */}
              {user?.id && badgeCount > 0 && (
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      Badges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BadgeDisplay userId={user.id} size="sm" />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Quick Footer */}
      <DashboardQuickFooter 
        userRole={userRole}
        unreadMessages={stats.unreadMessages}
        pendingBookings={stats.pendingBookings}
      />
    </div>
  );
};

export default Dashboard;
