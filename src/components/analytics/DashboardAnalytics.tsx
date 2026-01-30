import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, Briefcase, Star, Clock,
  Users, Target, Award, Zap, CalendarDays, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardAnalyticsProps {
  userId?: string;
  userRole?: "task_giver" | "task_doer" | "both";
}

interface AnalyticsData {
  earnings: { date: string; amount: number }[];
  tasks: { date: string; completed: number; posted: number }[];
  ratings: { month: string; rating: number }[];
  categoryBreakdown: { name: string; value: number; color: string }[];
  stats: {
    totalEarnings: number;
    earningsChange: number;
    completedTasks: number;
    tasksChange: number;
    avgRating: number;
    ratingChange: number;
    responseRate: number;
    responseChange: number;
  };
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export function DashboardAnalytics({ userId, userRole }: DashboardAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  const isTaskDoer = userRole === "task_doer" || userRole === "both";
  const isTaskGiver = userRole === "task_giver" || userRole === "both";

  useEffect(() => {
    fetchAnalytics();
  }, [userId, timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Generate mock data for demonstration
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const earnings = [];
      const tasks = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        earnings.push({
          date: dateStr,
          amount: Math.floor(Math.random() * 200) + 50
        });
        
        tasks.push({
          date: dateStr,
          completed: Math.floor(Math.random() * 5),
          posted: Math.floor(Math.random() * 3)
        });
      }

      const ratings = [
        { month: 'Jan', rating: 4.5 },
        { month: 'Feb', rating: 4.6 },
        { month: 'Mar', rating: 4.7 },
        { month: 'Apr', rating: 4.8 },
        { month: 'May', rating: 4.7 },
        { month: 'Jun', rating: 4.9 }
      ];

      const categoryBreakdown = [
        { name: 'Cleaning', value: 35, color: '#8b5cf6' },
        { name: 'Handyman', value: 25, color: '#3b82f6' },
        { name: 'Moving', value: 20, color: '#10b981' },
        { name: 'Yard Work', value: 12, color: '#f59e0b' },
        { name: 'Other', value: 8, color: '#6b7280' }
      ];

      // Fetch real stats if available
      let totalEarnings = 0;
      let completedTasks = 0;
      let avgRating = 4.8;

      if (userId) {
        // Get earnings
        const { data: payments } = await supabase
          .from("payments")
          .select("payout_amount")
          .eq("payee_id", userId)
          .eq("status", "completed");
        
        totalEarnings = payments?.reduce((sum, p) => sum + (p.payout_amount || 0), 0) || 0;

        // Get completed tasks
        const { count } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("task_doer_id", userId)
          .eq("status", "completed");
        
        completedTasks = count || 0;

        // Get rating
        const { data: profile } = await supabase
          .from("profiles")
          .select("rating, response_rate")
          .eq("id", userId)
          .single();
        
        avgRating = profile?.rating || 4.8;
      }

      setData({
        earnings,
        tasks,
        ratings,
        categoryBreakdown,
        stats: {
          totalEarnings,
          earningsChange: 12.5,
          completedTasks,
          tasksChange: 8.3,
          avgRating,
          ratingChange: 0.2,
          responseRate: 94,
          responseChange: 2.1
        }
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/2 mb-4" />
              <div className="h-8 bg-muted rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const StatCard = ({ 
    title, value, change, icon: Icon, prefix = "", suffix = "", positive = true 
  }: {
    title: string;
    value: number | string;
    change: number;
    icon: React.ElementType;
    prefix?: string;
    suffix?: string;
    positive?: boolean;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </h3>
          <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            <span>{Math.abs(change)}% vs last period</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Time range selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Performance Analytics
        </h2>
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
          <TabsList>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isTaskDoer && (
          <StatCard
            title="Total Earnings"
            value={data.stats.totalEarnings}
            change={data.stats.earningsChange}
            icon={DollarSign}
            prefix="$"
          />
        )}
        <StatCard
          title="Completed Tasks"
          value={data.stats.completedTasks}
          change={data.stats.tasksChange}
          icon={Briefcase}
        />
        <StatCard
          title="Average Rating"
          value={data.stats.avgRating.toFixed(1)}
          change={data.stats.ratingChange}
          icon={Star}
        />
        <StatCard
          title="Response Rate"
          value={data.stats.responseRate}
          change={data.stats.responseChange}
          icon={Zap}
          suffix="%"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings chart (for doers) */}
        {isTaskDoer && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Earnings Over Time</CardTitle>
              <CardDescription>Your earnings trend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.earnings}>
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`$${value}`, "Earnings"]}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#colorEarnings)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tasks chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Task Activity</CardTitle>
            <CardDescription>Tasks completed vs posted</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.tasks.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  {isTaskGiver && (
                    <Bar dataKey="posted" fill="hsl(var(--primary) / 0.5)" radius={[4, 4, 0, 0]} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category Breakdown</CardTitle>
            <CardDescription>Tasks by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, ""]}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {data.categoryBreakdown.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm">{cat.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rating trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rating Trend</CardTitle>
            <CardDescription>Your rating over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.ratings}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    domain={[4, 5]}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    formatter={(value: number) => [value.toFixed(1), "Rating"]}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
