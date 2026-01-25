import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar, AreaChart, Area, ComposedChart
} from "recharts";
import {
  TrendingUp, TrendingDown, Users, DollarSign, CheckCircle, Clock,
  AlertTriangle, Gavel, Target, Activity, RefreshCw, Calendar,
  ArrowUpRight, ArrowDownRight, Percent, CreditCard, UserCheck, 
  FileText, ShieldAlert, Zap, Server
} from "lucide-react";
import { format, subDays, startOfDay, eachDayOfInterval, parseISO } from "date-fns";
import BackendHealthDashboard from "@/components/admin/BackendHealthDashboard";

const COLORS = {
  primary: 'hsl(var(--primary))',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  cyan: '#06b6d4',
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

interface Stats {
  totalUsers: number;
  newUsersThisPeriod: number;
  userGrowthPercent: number;
  totalTasks: number;
  newTasksThisPeriod: number;
  taskGrowthPercent: number;
  completedTasks: number;
  completionRate: number;
  totalRevenue: number;
  revenueThisPeriod: number;
  revenueGrowthPercent: number;
  totalDisputes: number;
  openDisputes: number;
  disputeRate: number;
  avgTaskValue: number;
  totalBids: number;
  avgBidsPerTask: number;
  onlineUsers: number;
  verifiedUsers: number;
  verificationRate: number;
}

interface ChartData {
  userGrowth: { date: string; users: number; cumulative: number }[];
  taskActivity: { date: string; created: number; completed: number }[];
  revenue: { date: string; amount: number; fees: number }[];
  categoryBreakdown: { name: string; value: number }[];
  taskStatus: { name: string; value: number; color: string }[];
  disputeStatus: { name: string; value: number }[];
  topCategories: { category: string; tasks: number; revenue: number }[];
}

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("30");
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0, newUsersThisPeriod: 0, userGrowthPercent: 0,
    totalTasks: 0, newTasksThisPeriod: 0, taskGrowthPercent: 0,
    completedTasks: 0, completionRate: 0,
    totalRevenue: 0, revenueThisPeriod: 0, revenueGrowthPercent: 0,
    totalDisputes: 0, openDisputes: 0, disputeRate: 0,
    avgTaskValue: 0, totalBids: 0, avgBidsPerTask: 0,
    onlineUsers: 0, verifiedUsers: 0, verificationRate: 0,
  });
  const [chartData, setChartData] = useState<ChartData>({
    userGrowth: [], taskActivity: [], revenue: [],
    categoryBreakdown: [], taskStatus: [], disputeStatus: [], topCategories: [],
  });

  const days = parseInt(timeRange);
  const startDate = useMemo(() => subDays(new Date(), days), [days]);
  const previousStartDate = useMemo(() => subDays(startDate, days), [startDate, days]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setRefreshing(true);
    try {
      const [
        usersRes, tasksRes, paymentsRes, disputesRes, bidsRes, bookingsRes
      ] = await Promise.all([
        supabase.from("profiles").select("id, created_at, is_online, last_seen, verified_by_admin"),
        supabase.from("tasks").select("id, created_at, status, category, pay_amount"),
        supabase.from("payments").select("id, created_at, amount, platform_fee, status"),
        supabase.from("disputes").select("id, created_at, status"),
        supabase.from("task_bids").select("id, created_at, task_id, bid_amount"),
        supabase.from("bookings").select("id, created_at, status"),
      ]);

      const users = usersRes.data || [];
      const tasks = tasksRes.data || [];
      const payments = paymentsRes.data || [];
      const disputes = disputesRes.data || [];
      const bids = bidsRes.data || [];

      // Calculate stats
      const isRecentlyActive = (lastSeen: string | null) => {
        if (!lastSeen) return false;
        return new Date(lastSeen) > subDays(new Date(), 0.0035); // 5 minutes
      };

      const usersInPeriod = users.filter(u => new Date(u.created_at) >= startDate);
      const usersInPrevPeriod = users.filter(u => {
        const d = new Date(u.created_at);
        return d >= previousStartDate && d < startDate;
      });
      const userGrowthPercent = usersInPrevPeriod.length > 0 
        ? ((usersInPeriod.length - usersInPrevPeriod.length) / usersInPrevPeriod.length) * 100 
        : usersInPeriod.length > 0 ? 100 : 0;

      const tasksInPeriod = tasks.filter(t => new Date(t.created_at) >= startDate);
      const tasksInPrevPeriod = tasks.filter(t => {
        const d = new Date(t.created_at);
        return d >= previousStartDate && d < startDate;
      });
      const taskGrowthPercent = tasksInPrevPeriod.length > 0
        ? ((tasksInPeriod.length - tasksInPrevPeriod.length) / tasksInPrevPeriod.length) * 100
        : tasksInPeriod.length > 0 ? 100 : 0;

      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

      const completedPayments = payments.filter(p => p.status === 'completed');
      const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.platform_fee || 0), 0);
      const revenueInPeriod = completedPayments
        .filter(p => new Date(p.created_at) >= startDate)
        .reduce((sum, p) => sum + Number(p.platform_fee || 0), 0);
      const revenueInPrevPeriod = completedPayments
        .filter(p => {
          const d = new Date(p.created_at);
          return d >= previousStartDate && d < startDate;
        })
        .reduce((sum, p) => sum + Number(p.platform_fee || 0), 0);
      const revenueGrowthPercent = revenueInPrevPeriod > 0
        ? ((revenueInPeriod - revenueInPrevPeriod) / revenueInPrevPeriod) * 100
        : revenueInPeriod > 0 ? 100 : 0;

      const openDisputes = disputes.filter(d => d.status === 'open' || d.status === 'pending').length;
      const disputeRate = tasks.length > 0 ? (disputes.length / tasks.length) * 100 : 0;

      const avgTaskValue = tasks.length > 0 
        ? tasks.reduce((sum, t) => sum + Number(t.pay_amount || 0), 0) / tasks.length 
        : 0;

      const avgBidsPerTask = tasks.length > 0 ? bids.length / tasks.length : 0;

      const onlineUsers = users.filter(u => u.is_online || isRecentlyActive(u.last_seen)).length;
      const verifiedUsers = users.filter(u => u.verified_by_admin).length;
      const verificationRate = users.length > 0 ? (verifiedUsers / users.length) * 100 : 0;

      setStats({
        totalUsers: users.length,
        newUsersThisPeriod: usersInPeriod.length,
        userGrowthPercent,
        totalTasks: tasks.length,
        newTasksThisPeriod: tasksInPeriod.length,
        taskGrowthPercent,
        completedTasks,
        completionRate,
        totalRevenue,
        revenueThisPeriod: revenueInPeriod,
        revenueGrowthPercent,
        totalDisputes: disputes.length,
        openDisputes,
        disputeRate,
        avgTaskValue,
        totalBids: bids.length,
        avgBidsPerTask,
        onlineUsers,
        verifiedUsers,
        verificationRate,
      });

      // Build chart data
      const dateRange = eachDayOfInterval({ start: startDate, end: new Date() });

      // User growth chart
      const userGrowthData = dateRange.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const usersOnDate = users.filter(u => format(new Date(u.created_at), 'yyyy-MM-dd') === dateStr).length;
        const cumulativeUsers = users.filter(u => new Date(u.created_at) <= date).length;
        return { date: format(date, 'MMM d'), users: usersOnDate, cumulative: cumulativeUsers };
      });

      // Task activity chart
      const taskActivityData = dateRange.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const created = tasks.filter(t => format(new Date(t.created_at), 'yyyy-MM-dd') === dateStr).length;
        const completed = tasks.filter(t => 
          t.status === 'completed' && format(new Date(t.created_at), 'yyyy-MM-dd') === dateStr
        ).length;
        return { date: format(date, 'MMM d'), created, completed };
      });

      // Revenue chart
      const revenueData = dateRange.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayPayments = completedPayments.filter(p => 
          format(new Date(p.created_at), 'yyyy-MM-dd') === dateStr
        );
        const amount = dayPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
        const fees = dayPayments.reduce((sum, p) => sum + Number(p.platform_fee || 0), 0);
        return { date: format(date, 'MMM d'), amount, fees };
      });

      // Category breakdown
      const categoryCount: Record<string, number> = {};
      tasks.forEach(t => {
        categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
      });
      const categoryBreakdown = Object.entries(categoryCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

      // Task status breakdown
      const statusCount: Record<string, number> = {};
      tasks.forEach(t => {
        const status = t.status || 'unknown';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      const taskStatus = Object.entries(statusCount).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: name === 'completed' ? COLORS.success : 
               name === 'open' ? COLORS.info : 
               name === 'in_progress' ? COLORS.warning : COLORS.danger,
      }));

      // Dispute status
      const disputeStatusCount: Record<string, number> = {};
      disputes.forEach(d => {
        const status = d.status || 'unknown';
        disputeStatusCount[status] = (disputeStatusCount[status] || 0) + 1;
      });
      const disputeStatus = Object.entries(disputeStatusCount).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));

      // Top categories by revenue
      const categoryRevenue: Record<string, { tasks: number; revenue: number }> = {};
      tasks.forEach(t => {
        if (!categoryRevenue[t.category]) {
          categoryRevenue[t.category] = { tasks: 0, revenue: 0 };
        }
        categoryRevenue[t.category].tasks += 1;
        categoryRevenue[t.category].revenue += Number(t.pay_amount || 0);
      });
      const topCategories = Object.entries(categoryRevenue)
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 6);

      setChartData({
        userGrowth: userGrowthData,
        taskActivity: taskActivityData,
        revenue: revenueData,
        categoryBreakdown,
        taskStatus,
        disputeStatus,
        topCategories,
      });

    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const StatCard = ({ 
    title, value, subtitle, icon: Icon, trend, trendValue, color = "primary" 
  }: { 
    title: string; value: string | number; subtitle?: string; 
    icon: any; trend?: "up" | "down" | "neutral"; trendValue?: string; color?: string;
  }) => (
    <Card className="glass-card overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl bg-${color}/10`}>
            <Icon className={`h-6 w-6 text-${color}`} />
          </div>
        </div>
        {trend && trendValue && (
          <div className={`mt-4 flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : 
             trend === 'down' ? <ArrowDownRight className="h-4 w-4" /> : null}
            <span className="font-medium">{trendValue}</span>
            <span className="text-muted-foreground">vs previous period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <AdminLayout title="Analytics Dashboard" description="Loading...">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <SEOHead title="Analytics Dashboard - SaskTask Admin" description="Platform analytics and insights" />
      <AdminLayout title="Analytics Dashboard" description="Comprehensive platform metrics and insights">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Activity className="h-3 w-3" />
              Real-time Data
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Calendar className="h-3 w-3" />
              Last updated: {format(new Date(), 'h:mm a')}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchAnalytics} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            subtitle={`${stats.newUsersThisPeriod} new this period`}
            icon={Users}
            trend={stats.userGrowthPercent > 0 ? "up" : stats.userGrowthPercent < 0 ? "down" : "neutral"}
            trendValue={`${Math.abs(stats.userGrowthPercent).toFixed(1)}%`}
          />
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks.toLocaleString()}
            subtitle={`${stats.newTasksThisPeriod} new this period`}
            icon={FileText}
            trend={stats.taskGrowthPercent > 0 ? "up" : stats.taskGrowthPercent < 0 ? "down" : "neutral"}
            trendValue={`${Math.abs(stats.taskGrowthPercent).toFixed(1)}%`}
          />
          <StatCard
            title="Platform Revenue"
            value={`$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle={`$${stats.revenueThisPeriod.toFixed(2)} this period`}
            icon={DollarSign}
            trend={stats.revenueGrowthPercent > 0 ? "up" : stats.revenueGrowthPercent < 0 ? "down" : "neutral"}
            trendValue={`${Math.abs(stats.revenueGrowthPercent).toFixed(1)}%`}
          />
          <StatCard
            title="Completion Rate"
            value={`${stats.completionRate.toFixed(1)}%`}
            subtitle={`${stats.completedTasks} completed tasks`}
            icon={CheckCircle}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <StatCard
            title="Online Now"
            value={stats.onlineUsers}
            subtitle="Active users"
            icon={Zap}
          />
          <StatCard
            title="Verified Users"
            value={`${stats.verificationRate.toFixed(1)}%`}
            subtitle={`${stats.verifiedUsers} verified`}
            icon={UserCheck}
          />
          <StatCard
            title="Open Disputes"
            value={stats.openDisputes}
            subtitle={`${stats.disputeRate.toFixed(2)}% dispute rate`}
            icon={ShieldAlert}
          />
          <StatCard
            title="Avg Task Value"
            value={`$${stats.avgTaskValue.toFixed(2)}`}
            subtitle={`${stats.avgBidsPerTask.toFixed(1)} avg bids/task`}
            icon={Target}
          />
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="backend" className="flex items-center gap-1">
              <Server className="h-3 w-3" /> Backend
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* User Growth */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    User Growth
                  </CardTitle>
                  <CardDescription>Daily new users and cumulative growth</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    {chartData.userGrowth.length > 0 ? (
                      <ComposedChart data={chartData.userGrowth}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis yAxisId="left" className="text-xs" />
                        <YAxis yAxisId="right" orientation="right" className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px' 
                          }} 
                        />
                        <Bar yAxisId="left" dataKey="users" fill={COLORS.info} radius={[4, 4, 0, 0]} name="New Users" />
                        <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke={COLORS.success} strokeWidth={2} name="Total Users" />
                      </ComposedChart>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Task Activity */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Task Activity
                  </CardTitle>
                  <CardDescription>Tasks created vs completed over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    {chartData.taskActivity.length > 0 ? (
                      <AreaChart data={chartData.taskActivity}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px' 
                          }} 
                        />
                        <Area type="monotone" dataKey="created" stackId="1" stroke={COLORS.info} fill={COLORS.info} fillOpacity={0.3} name="Created" />
                        <Area type="monotone" dataKey="completed" stackId="2" stroke={COLORS.success} fill={COLORS.success} fillOpacity={0.3} name="Completed" />
                        <Legend />
                      </AreaChart>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Category and Status Breakdown */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Category Distribution */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Top Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    {chartData.categoryBreakdown.length > 0 ? (
                      <PieChart>
                        <Pie
                          data={chartData.categoryBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {chartData.categoryBreakdown.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">No data</div>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Task Status */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Task Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    {chartData.taskStatus.length > 0 ? (
                      <PieChart>
                        <Pie
                          data={chartData.taskStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {chartData.taskStatus.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">No data</div>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Disputes */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-primary" />
                    Disputes by Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    {chartData.disputeStatus.length > 0 ? (
                      <PieChart>
                        <Pie
                          data={chartData.disputeStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {chartData.disputeStatus.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">No disputes</div>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>User Registration Trend</CardTitle>
                <CardDescription>New user signups over time with cumulative growth</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  {chartData.userGrowth.length > 0 ? (
                    <ComposedChart data={chartData.userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis yAxisId="left" className="text-xs" />
                      <YAxis yAxisId="right" orientation="right" className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px' 
                        }} 
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="users" fill={COLORS.info} radius={[4, 4, 0, 0]} name="New Users" />
                      <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke={COLORS.purple} strokeWidth={2} dot={false} name="Cumulative Users" />
                    </ComposedChart>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Task Creation & Completion</CardTitle>
                  <CardDescription>Daily task activity trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    {chartData.taskActivity.length > 0 ? (
                      <BarChart data={chartData.taskActivity}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px' 
                          }} 
                        />
                        <Legend />
                        <Bar dataKey="created" fill={COLORS.info} radius={[4, 4, 0, 0]} name="Created" />
                        <Bar dataKey="completed" fill={COLORS.success} radius={[4, 4, 0, 0]} name="Completed" />
                      </BarChart>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Top Categories by Revenue</CardTitle>
                  <CardDescription>Category performance breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    {chartData.topCategories.length > 0 ? (
                      <BarChart data={chartData.topCategories} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" className="text-xs" />
                        <YAxis type="category" dataKey="category" className="text-xs" width={100} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px' 
                          }}
                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                        />
                        <Bar dataKey="revenue" fill={COLORS.success} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Revenue & Platform Fees
                </CardTitle>
                <CardDescription>Transaction volume and platform earnings over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  {chartData.revenue.length > 0 ? (
                    <AreaChart data={chartData.revenue}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(value) => `$${value}`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px' 
                        }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`]}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="amount" stroke={COLORS.info} fill={COLORS.info} fillOpacity={0.2} name="Transaction Volume" />
                      <Area type="monotone" dataKey="fees" stroke={COLORS.success} fill={COLORS.success} fillOpacity={0.3} name="Platform Fees" />
                    </AreaChart>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">No revenue data available</div>
              )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backend" className="space-y-6">
            <BackendHealthDashboard />
          </TabsContent>
        </Tabs>
      </AdminLayout>
    </>
  );
}
