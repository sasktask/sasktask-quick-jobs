import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { RecommendedTasks } from "@/components/RecommendedTasks";
import { PaymentHistory } from "@/components/PaymentHistory";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { QuickStatsBar } from "@/components/QuickStatsBar";
import { TrustScoreCard } from "@/components/TrustScoreCard";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { DashboardActivityFeed } from "@/components/DashboardActivityFeed";
import { WelcomeTour } from "@/components/WelcomeTour";
import { StreakTracker } from "@/components/StreakTracker";
import { DailyGoals } from "@/components/DailyGoals";
import { LiveEarningsTicker } from "@/components/LiveEarningsTicker";
import { ProgressRing } from "@/components/ProgressRing";
import { EnhancedActivityFeed } from "@/components/EnhancedActivityFeed";
import { QuickActionsFAB } from "@/components/QuickActionsFAB";
import { TaskCalendar } from "@/components/calendar";
import { QuickRebook } from "@/components/QuickRebook";
import { ProfileCompletionNudge } from "@/components/auth";
import { LiveAvailabilityWidget, OnlineStatusBar } from "@/components/instant";

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
  Trophy,
  ShieldCheck,
  TrendingUp,
  Bell,
  ArrowRight,
  Sparkles,
  Award,
  Loader2,
  Calendar,
  Zap,
  Copy,
  Check
} from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [verification, setVerification] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [badgeCount, setBadgeCount] = useState(0);
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
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

  // Computed role flags
  const isTaskGiver = userRoles.includes('task_giver');
  const isTaskDoer = userRoles.includes('task_doer');
  const hasBothRoles = isTaskGiver && isTaskDoer;

  // Realtime notifications
  const handleNewTask = useCallback((task: any) => {
    if (isTaskDoer) {
      setTasks(prev => [task, ...prev.slice(0, 4)]);
    }
  }, [isTaskDoer]);

  const handleNewMessage = useCallback(() => {
    setStats(prev => ({ ...prev, unreadMessages: prev.unreadMessages + 1 }));
  }, []);

  const handleBookingUpdate = useCallback(() => {
    if (user?.id && userRoles.length > 0) {
      fetchStats(user.id, userRoles);
    }
  }, [user?.id, userRoles]);

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

      // Fetch user roles
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      
      const roles = rolesData?.map(r => r.role) || [];
      setUserRoles(roles);
      // Set primary role: admin > task_doer > task_giver
      const adminRole = roles.find(r => r === 'admin');
      const taskDoerRole = roles.find(r => r === 'task_doer');
      const taskGiverRole = roles.find(r => r === 'task_giver');
      setUserRole(adminRole || taskDoerRole || taskGiverRole || null);

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

      // Check role flags for fetching tasks
      const hasTaskGiverRole = roles.includes('task_giver');
      const hasTaskDoerRole = roles.includes('task_doer');

      // Fetch stats
      await fetchStats(session.user.id, roles);

      // Fetch tasks based on roles - if task_doer, show available tasks; if only task_giver, show their tasks
      if (hasTaskDoerRole) {

        // Task doers see available tasks
        const { data: tasksData } = await supabase
          .from("tasks")
          .select("*")
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(5);
        setTasks(tasksData || []);
      } else if (hasTaskGiverRole) {
        // Task givers see their own tasks
        const { data: tasksData } = await supabase
          .from("tasks")
          .select("*")
          .eq("task_giver_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(5);
        setTasks(tasksData || []);
      }

      // Check if this is a new user (show welcome tour)
      const isNewUser = !profileData?.bio && (badges || 0) === 0;
      const hasSeenTour = localStorage.getItem(`welcome_tour_${session.user.id}`);
      if (isNewUser && !hasSeenTour) {
        setShowWelcomeTour(true);
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

  const fetchStats = async (userId: string, roles: string[]) => {
    const hasTaskDoerRole = roles.includes('task_doer');
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

  const handleTourComplete = () => {
    if (user?.id) {
      localStorage.setItem(`welcome_tour_${user.id}`, 'true');
    }
    setShowWelcomeTour(false);
  };

  const handleTourDismiss = () => {
    if (user?.id) {
      localStorage.setItem(`welcome_tour_${user.id}`, 'true');
    }
    setShowWelcomeTour(false);
  };

  const copyUserId = async () => {
    if (profile?.user_id_number) {
      await navigator.clipboard.writeText(profile.user_id_number);
      setCopiedId(true);
      toast({ title: "Copied!", description: "User ID copied to clipboard" });
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

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
      {/* Welcome Tour for new users */}
      <AnimatePresence>
        {showWelcomeTour && (
          <WelcomeTour
            userRole={userRole}
            isVerified={isVerified}
            onComplete={handleTourComplete}
            onDismiss={handleTourDismiss}
          />
        )}
      </AnimatePresence>

      <SEOHead 
        title="Dashboard - SaskTask"
        description="Manage your tasks, bookings, and earnings on SaskTask"
        url="/dashboard"
      />
      <Navbar />
      
      <div className="flex pt-16">
        {/* Sidebar - Hidden on mobile */}
        <DashboardSidebar
          userRole={userRole}
          userRoles={userRoles}
          unreadMessages={stats.unreadMessages}
          pendingBookings={stats.pendingBookings}
          isVerified={isVerified}
          userId={user?.id}
          className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)]"
        />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 min-h-[calc(100vh-4rem)]">
          <div className="container mx-auto px-4 py-6 md:py-8">
            {/* Welcome Header - Enhanced */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative">
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                      Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!
                    </h1>
                    <Sparkles className="absolute -top-2 -right-6 h-5 w-5 text-yellow-500 animate-pulse" />
                  </div>
                  {isVerified && (
                    <Badge variant="default" className="gap-1 animate-scale-in">
                      <ShieldCheck className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-muted-foreground flex-wrap">
                  {profile?.user_id_number && (
                    <button
                      onClick={copyUserId}
                      className="flex items-center gap-1.5 bg-primary/10 px-2 py-0.5 rounded-md font-mono text-sm font-medium text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      #{profile.user_id_number}
                      {copiedId ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 opacity-60" />
                      )}
                    </button>
                  )}
                  {hasBothRoles ? (
                    <span className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      <Zap className="h-4 w-4 text-primary" />
                      Full Access Dashboard
                    </span>
                  ) : isTaskGiver ? (
                    <span className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Task Giver Dashboard
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      Task Doer Dashboard
                    </span>
                  )}
                  <span className="hidden sm:flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 animate-fade-in" style={{ animationDelay: "100ms" }}>
                {isTaskGiver && (
                  <Link to="/post-task">
                    <Button variant="default" className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
                      <Plus className="h-4 w-4" />
                      Post New Task
                    </Button>
                  </Link>
                )}
                {isTaskDoer && (
                  <Link to="/browse">
                    <Button variant={isTaskGiver ? "outline" : "default"} className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
                      <Search className="h-4 w-4" />
                      Find Tasks
                    </Button>
                  </Link>
                )}
                <Link to="/profile">
                  <Button variant="outline" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="mb-6">
              <QuickStatsBar profile={profile} stats={stats} badgeCount={badgeCount} />
            </div>

            {/* Profile Completion Nudge */}
            {profile && (
              <div className="mb-6">
                <ProfileCompletionNudge
                  profile={profile}
                  userRole={userRole as "task_giver" | "task_doer" | "both"}
                  variant="card"
                />
              </div>
            )}

            {/* Verification Prompt for Task Doers */}
            {isTaskDoer && !isVerified && (
              <Card className="mb-6 border-primary/50 bg-primary/5">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Get Verified to Boost Your Visibility</p>
                        <p className="text-sm text-muted-foreground">
                          Verified taskers appear at the top and get 3x more work suggestions
                        </p>
                      </div>
                    </div>
                    <Link to="/verification">
                      <Button variant="default" className="gap-2">
                        Get Verified <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Tasks and Recommendations */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Actions */}
                <div className="grid sm:grid-cols-4 gap-4">
                  {isTaskGiver && (
                    <Link to="/post-task">
                      <Card className="cursor-pointer hover:shadow-lg transition-all border-primary/30 hover:border-primary h-full">
                        <CardContent className="p-4 text-center">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                            <Plus className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="font-semibold text-sm">Post Task</h3>
                        </CardContent>
                      </Card>
                    </Link>
                  )}
                  {isTaskDoer && (
                    <Link to="/browse">
                      <Card className="cursor-pointer hover:shadow-lg transition-all border-primary/30 hover:border-primary h-full">
                        <CardContent className="p-4 text-center">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                            <Search className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="font-semibold text-sm">Find Tasks</h3>
                        </CardContent>
                      </Card>
                    </Link>
                  )}

                  <Link to="/bookings">
                    <Card className="cursor-pointer hover:shadow-lg transition-all border-secondary/30 hover:border-secondary h-full">
                      <CardContent className="p-4 text-center">
                        <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-2">
                          <Briefcase className="h-5 w-5 text-secondary" />
                        </div>
                        <h3 className="font-semibold text-sm">Bookings</h3>
                        {stats.pendingBookings > 0 && (
                          <Badge variant="secondary" className="mt-1 text-xs">{stats.pendingBookings} pending</Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>

                  <Link to="/messages">
                    <Card className="cursor-pointer hover:shadow-lg transition-all border-blue-500/30 hover:border-blue-500 h-full">
                      <CardContent className="p-4 text-center">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
                          <MessageSquare className="h-5 w-5 text-blue-500" />
                        </div>
                        <h3 className="font-semibold text-sm">Messages</h3>
                        {stats.unreadMessages > 0 && (
                          <Badge variant="destructive" className="mt-1 text-xs">{stats.unreadMessages} new</Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>

                  <Link to="/leaderboard">
                    <Card className="cursor-pointer hover:shadow-lg transition-all border-yellow-500/30 hover:border-yellow-500 h-full">
                      <CardContent className="p-4 text-center">
                        <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-2">
                          <Trophy className="h-5 w-5 text-yellow-500" />
                        </div>
                        <h3 className="font-semibold text-sm">Leaderboard</h3>
                      </CardContent>
                    </Card>
                  </Link>
                </div>

                {/* Quick Rebook for Task Givers */}
                {isTaskGiver && user?.id && (
                  <QuickRebook userId={user.id} />
                )}

                {/* Task Calendar */}
                {user?.id && (
                  <TaskCalendar userId={user.id} userRole={userRole} />
                )}

                {/* AI-Powered Recommendations for Task Doers */}
                {isTaskDoer && user?.id && (
                  <RecommendedTasks userId={user.id} />
                )}

                {/* Recent Tasks */}
                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {isTaskDoer ? "Available Tasks" : "Your Recent Tasks"}
                      </CardTitle>
                      <Link to={isTaskDoer ? "/browse" : "/my-tasks"}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          View All <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                    <CardDescription>
                      {isTaskDoer 
                        ? "Accept tasks instantly to start earning"
                        : "Manage your posted tasks"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tasks.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No tasks available yet</p>
                        {userRole === "task_giver" && (
                          <Link to="/post-task">
                            <Button variant="default" className="mt-4">
                              Post Your First Task
                            </Button>
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tasks.map((task) => (
                          <Card key={task.id} className="border-border hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold mb-1 truncate">{task.title}</h4>
                                  <p className="text-muted-foreground text-sm mb-2 line-clamp-1">{task.description}</p>
                                  <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {task.category}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs text-green-600 border-green-600/50">
                                      ${task.pay_amount}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {task.location}
                                    </Badge>
                                  </div>
                                </div>
                                <Button 
                                  variant={userRole === "task_doer" ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => navigate(`/task/${task.id}`)}
                                  className="shrink-0"
                                >
                                  {userRole === "task_doer" ? "Accept" : "View"}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Stats and Info */}
              <div className="space-y-6">
                {/* Live Earnings Ticker - For Task Doers */}
                {userRole === "task_doer" && (
                  <LiveEarningsTicker
                    totalEarnings={stats.totalEarnings}
                    thisWeekEarnings={stats.totalEarnings * 0.15}
                    thisMonthEarnings={stats.totalEarnings * 0.4}
                    completedTasks={stats.completedTasks}
                  />
                )}

                {/* Progress Ring */}
                <ProgressRing
                  completedTasks={stats.completedTasks}
                  targetTasks={10}
                  level={Math.floor(stats.completedTasks / 5) + 1}
                  xp={(stats.completedTasks * 25) % 100}
                  xpToNextLevel={100}
                />

                {/* Streak Tracker */}
                {user?.id && (
                  <StreakTracker 
                    userId={user.id}
                    currentStreak={profile?.completed_tasks ? Math.min(profile.completed_tasks, 14) : 1}
                    longestStreak={profile?.completed_tasks ? Math.min(profile.completed_tasks + 3, 30) : 1}
                    lastActiveDate={profile?.last_active || new Date().toISOString()}
                  />
                )}

                {/* Daily Goals */}
                <DailyGoals userRole={userRole} stats={stats} />

                {/* Enhanced Activity Feed */}
                {user?.id && (
                  <EnhancedActivityFeed userId={user.id} userRole={userRole} />
                )}

                {/* Trust Score Card */}
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

                {/* Badges Section */}
                {user?.id && badgeCount > 0 && (
                  <Card className="border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Award className="h-5 w-5 text-primary" />
                        Your Badges
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BadgeDisplay userId={user.id} size="md" />
                    </CardContent>
                  </Card>
                )}

                {/* Payment History */}
                {user?.id && (
                  <PaymentHistory userId={user.id} limit={5} />
                )}

                {/* Find Taskers - For Task Givers */}
                {userRole === "task_giver" && (
                  <Card className="border-border bg-gradient-to-br from-primary/5 to-transparent">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Find Top Taskers</CardTitle>
                      <CardDescription>Browse verified professionals</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link to="/find-taskers">
                        <Button variant="default" className="w-full gap-2">
                          <Search className="h-4 w-4" />
                          Browse Taskers
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
          
          <Footer />
        </main>
      </div>
      
      {/* Online Status Bar for Task Doers */}
      {isTaskDoer && user?.id && (
        <OnlineStatusBar userId={user.id} />
      )}
      
      {/* Live Availability Widget for Task Doers */}
      {isTaskDoer && user?.id && (
        <LiveAvailabilityWidget userId={user.id} />
      )}
      
      {/* Quick Actions FAB */}
      <QuickActionsFAB userRole={userRole} />
    </div>
  );
};

export default Dashboard;
