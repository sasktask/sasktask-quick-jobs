import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEOHead } from "@/components/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { format, subDays, startOfDay, endOfDay, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    totalRevenue: 0,
    avgRating: 0,
    completedTasks: 0,
    activeBookings: 0,
    pendingVerifications: 0,
    openDisputes: 0,
  });
  const [trends, setTrends] = useState({
    usersTrend: 0,
    tasksTrend: 0,
    revenueTrend: 0,
    ratingTrend: 0,
  });
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [tasksByCategory, setTasksByCategory] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [taskStatusData, setTaskStatusData] = useState<any[]>([]);
  const [bookingTrends, setBookingTrends] = useState<any[]>([]);
  const [topTaskers, setTopTaskers] = useState<any[]>([]);

  const COLORS = [
    "hsl(174 62% 47%)", // primary teal
    "hsl(217 91% 60%)", // secondary blue
    "hsl(142 71% 45%)", // green
    "hsl(38 92% 50%)", // amber
    "hsl(340 82% 52%)", // pink
    "hsl(262 83% 58%)", // purple
  ];

  const getDaysForRange = (range: string) => {
    switch (range) {
      case "7d": return 7;
      case "30d": return 30;
      case "90d": return 90;
      case "1y": return 365;
      default: return 30;
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setRefreshing(true);
    try {
      const days = getDaysForRange(timeRange);
      const startDate = subDays(new Date(), days);
      const previousStartDate = subDays(startDate, days);

      // Load all data in parallel
      const [
        usersRes,
        tasksRes,
        paymentsRes,
        reviewsRes,
        bookingsRes,
        verificationsRes,
        disputesRes,
      ] = await Promise.all([
        supabase.from("profiles").select("id, created_at, completed_tasks, rating, full_name"),
        supabase.from("tasks").select("id, category, created_at, pay_amount, status"),
        supabase.from("payments").select("id, amount, platform_fee, created_at, status"),
        supabase.from("reviews").select("rating, created_at"),
        supabase.from("bookings").select("id, status, created_at"),
        supabase.from("verifications").select("id").eq("verification_status", "pending"),
        supabase.from("disputes").select("id").eq("status", "open"),
      ]);

      const users = usersRes.data || [];
      const tasks = tasksRes.data || [];
      const payments = paymentsRes.data || [];
      const reviews = reviewsRes.data || [];
      const bookings = bookingsRes.data || [];
      const verifications = verificationsRes.data || [];
      const disputes = disputesRes.data || [];

      // Calculate current period stats
      const currentUsers = users.filter(u => u.created_at && new Date(u.created_at) >= startDate);
      const previousUsers = users.filter(u => u.created_at && new Date(u.created_at) >= previousStartDate && new Date(u.created_at) < startDate);
      
      const currentTasks = tasks.filter(t => t.created_at && new Date(t.created_at) >= startDate);
      const previousTasks = tasks.filter(t => t.created_at && new Date(t.created_at) >= previousStartDate && new Date(t.created_at) < startDate);

      const completedPayments = payments.filter(p => p.status === "completed");
      const currentPayments = completedPayments.filter(p => p.created_at && new Date(p.created_at) >= startDate);
      const previousPayments = completedPayments.filter(p => p.created_at && new Date(p.created_at) >= previousStartDate && new Date(p.created_at) < startDate);

      const currentRevenue = currentPayments.reduce((sum, p) => sum + p.platform_fee, 0);
      const previousRevenue = previousPayments.reduce((sum, p) => sum + p.platform_fee, 0);

      const totalRevenue = completedPayments.reduce((sum, p) => sum + p.platform_fee, 0);
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      // Calculate trends (percentage change)
      const calcTrend = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      setStats({
        totalUsers: users.length,
        totalTasks: tasks.length,
        totalRevenue,
        avgRating,
        completedTasks: tasks.filter(t => t.status === "completed").length,
        activeBookings: bookings.filter(b => b.status === "accepted" || b.status === "in_progress").length,
        pendingVerifications: verifications.length,
        openDisputes: disputes.length,
      });

      setTrends({
        usersTrend: calcTrend(currentUsers.length, previousUsers.length),
        tasksTrend: calcTrend(currentTasks.length, previousTasks.length),
        revenueTrend: calcTrend(currentRevenue, previousRevenue),
        ratingTrend: 0,
      });

      // Generate time series data
      const dataPoints = Math.min(days, 30);
      const interval = Math.ceil(days / dataPoints);
      
      const timeSeriesData = Array.from({ length: dataPoints }, (_, i) => {
        const endDate = subDays(new Date(), i * interval);
        const startDatePoint = subDays(endDate, interval);
        
        return {
          date: format(endDate, days > 30 ? "MMM d" : "MMM d"),
          users: users.filter(u => 
            u.created_at && 
            new Date(u.created_at) >= startDatePoint &&
            new Date(u.created_at) <= endDate
          ).length,
          tasks: tasks.filter(t => 
            t.created_at && 
            new Date(t.created_at) >= startDatePoint &&
            new Date(t.created_at) <= endDate
          ).length,
          revenue: completedPayments
            .filter(p => p.created_at && new Date(p.created_at) >= startDatePoint && new Date(p.created_at) <= endDate)
            .reduce((sum, p) => sum + p.platform_fee, 0),
          bookings: bookings.filter(b => 
            b.created_at && 
            new Date(b.created_at) >= startDatePoint &&
            new Date(b.created_at) <= endDate
          ).length,
        };
      }).reverse();

      setUserGrowth(timeSeriesData);
      setRevenueData(timeSeriesData);
      setBookingTrends(timeSeriesData);

      // Tasks by category
      const categoryCount: Record<string, number> = {};
      tasks.forEach(t => {
        categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
      });
      const topCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, value]) => ({ name, value }));
      setTasksByCategory(topCategories);

      // Task status distribution
      const statusCount: Record<string, number> = {};
      tasks.forEach(t => {
        statusCount[t.status] = (statusCount[t.status] || 0) + 1;
      });
      setTaskStatusData(Object.entries(statusCount).map(([name, value]) => ({ name, value })));

      // Top taskers
      const sortedTaskers = users
        .filter(u => (u.completed_tasks || 0) > 0)
        .sort((a, b) => (b.completed_tasks || 0) - (a.completed_tasks || 0))
        .slice(0, 5);
      setTopTaskers(sortedTaskers);

    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const exportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      timeRange,
      stats,
      userGrowth,
      tasksByCategory,
      revenueData,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sasktask-analytics-${format(new Date(), "yyyy-MM-dd")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Analytics data exported");
  };

  const TrendBadge = ({ value }: { value: number }) => {
    const isPositive = value > 0;
    const isNeutral = value === 0;
    
    return (
      <div className={`flex items-center gap-1 text-xs font-medium ${
        isNeutral ? "text-muted-foreground" : isPositive ? "text-green-600" : "text-red-600"
      }`}>
        {isPositive ? <ArrowUpRight className="h-3 w-3" /> : isNeutral ? null : <ArrowDownRight className="h-3 w-3" />}
        <span>{isPositive ? "+" : ""}{value.toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <>
      <SEOHead title="Analytics - Admin" description="Platform analytics and insights" />
      <AdminLayout title="Analytics Dashboard" description="Comprehensive platform performance metrics and insights">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadAnalytics} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <TrendBadge value={trends.usersTrend} />
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <div className="text-2xl font-bold">{stats.totalTasks.toLocaleString()}</div>
                  <TrendBadge value={trends.tasksTrend} />
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Platform Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  <TrendBadge value={trends.revenueTrend} />
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)} ⭐</div>
                  <p className="text-xs text-muted-foreground">From all reviews</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed Tasks</p>
                  <p className="text-xl font-bold">{stats.completedTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Bookings</p>
                  <p className="text-xl font-bold">{stats.activeBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/20 bg-yellow-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending Verifications</p>
                  <p className="text-xl font-bold">{stats.pendingVerifications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Open Disputes</p>
                  <p className="text-xl font-bold">{stats.openDisputes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                User Growth & Task Creation
              </CardTitle>
              <CardDescription>New users and tasks over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                      <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="users" name="Users" stroke="hsl(174 62% 47%)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="tasks" name="Tasks" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenue Over Time
              </CardTitle>
              <CardDescription>Platform fees collected</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(142 71% 45%)"
                        fill="hsl(142 71% 45% / 0.2)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Tasks by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                {loading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tasksByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {tasksByCategory.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                {loading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={taskStatusData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Top Taskers
              </CardTitle>
              <CardDescription>By completed tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))
                ) : topTaskers.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No taskers yet</p>
                ) : (
                  topTaskers.map((tasker, index) => (
                    <div key={tasker.id} className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? "bg-yellow-500 text-white" :
                        index === 1 ? "bg-gray-400 text-white" :
                        index === 2 ? "bg-amber-700 text-white" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{tasker.full_name || "Unknown"}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{tasker.completed_tasks || 0} tasks</span>
                          {tasker.rating && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              {tasker.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
}
