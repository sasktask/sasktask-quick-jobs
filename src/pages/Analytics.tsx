import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BarChart, DollarSign, TrendingUp, Users, Clock, Target, Calendar } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart as RechartsBarChart,
  Bar
} from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const [earningsData, setEarningsData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalTasks: 0,
    avgTaskValue: 0,
    completionRate: 0,
  });
  const [peakHours, setPeakHours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch earnings summary (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: earnings } = await supabase
        .from("earnings_summary" as any)
        .select("*")
        .eq("user_id", user.id)
        .gte("date", thirtyDaysAgo.toISOString())
        .order("date");

      if (earnings) {
        const formattedEarnings = earnings.map((e: any) => ({
          date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          earnings: e.total_earnings,
          tasks: e.total_tasks
        }));
        setEarningsData(formattedEarnings);

        // Calculate category breakdown
        const categoryMap: { [key: string]: number } = {};
        earnings.forEach((e: any) => {
          if (e.category_breakdown) {
            Object.entries(e.category_breakdown as any).forEach(([category, amount]) => {
              categoryMap[category] = (categoryMap[category] || 0) + (amount as number);
            });
          }
        });

        const categoryArray = Object.entries(categoryMap).map(([name, value]) => ({
          name,
          value: Number(value.toFixed(2))
        }));
        setCategoryData(categoryArray);
      }

      // Calculate stats
      const { data: completedPayments } = await supabase
        .from("payments")
        .select("amount")
        .eq("payee_id", user.id)
        .eq("status", "completed");

      const totalEarnings = completedPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const totalTasks = completedPayments?.length || 0;
      const avgTaskValue = totalTasks > 0 ? totalEarnings / totalTasks : 0;

      const { data: allBookings } = await supabase
        .from("bookings")
        .select("status")
        .eq("task_doer_id", user.id);

      const completed = allBookings?.filter(b => b.status === "completed").length || 0;
      const total = allBookings?.length || 0;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;

      setStats({
        totalEarnings,
        totalTasks,
        avgTaskValue,
        completionRate
      });

      // Fetch peak hours data
      const { data: events } = await supabase
        .from("analytics_events" as any)
        .select("created_at")
        .eq("user_id", user.id)
        .eq("event_type", "task_accepted")
        .gte("created_at", thirtyDaysAgo.toISOString());

      const hourCounts: { [key: number]: number } = {};
      events?.forEach((e: any) => {
        const hour = new Date(e.created_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const peakHoursData = Object.entries(hourCounts)
        .map(([hour, count]) => ({
          hour: `${hour}:00`,
          tasks: count
        }))
        .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

      setPeakHours(peakHoursData);
    } catch (error) {
      console.error("Analytics Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <BarChart className="h-10 w-10 text-primary" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">Track your performance and earnings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-3xl font-bold text-primary">${stats.totalEarnings.toFixed(2)}</p>
                </div>
                <DollarSign className="h-10 w-10 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                  <p className="text-3xl font-bold">{stats.totalTasks}</p>
                </div>
                <Target className="h-10 w-10 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Task Value</p>
                  <p className="text-3xl font-bold">${stats.avgTaskValue.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-3xl font-bold">{stats.completionRate.toFixed(1)}%</p>
                </div>
                <Users className="h-10 w-10 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="earnings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="earnings">Earnings Trend</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="hours">Peak Hours</TabsTrigger>
          </TabsList>

          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Over Time</CardTitle>
                <CardDescription>Your daily earnings for the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={earningsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="earnings" stroke="#3b82f6" strokeWidth={2} name="Earnings ($)" />
                    <Line type="monotone" dataKey="tasks" stroke="#10b981" strokeWidth={2} name="Tasks" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Earnings by Category</CardTitle>
                <CardDescription>Distribution of your earnings across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours">
            <Card>
              <CardHeader>
                <CardTitle>Peak Activity Hours</CardTitle>
                <CardDescription>When you're most active accepting tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsBarChart data={peakHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tasks" fill="#3b82f6" name="Tasks Accepted" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
