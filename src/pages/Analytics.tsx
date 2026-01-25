import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BarChart, DollarSign, TrendingUp, Target, Gavel, Activity, CheckCircle, RefreshCw, Users, Clock, AlertTriangle } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

interface BackendHealth {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  checks: {
    database: { status: string; latency_ms: number };
    stripe: { configured: boolean };
    email: { configured: boolean };
    ai: { configured: boolean };
  };
  metrics: {
    active_users_24h: number;
    tasks_created_24h: number;
    payments_processed_24h: number;
    avg_response_time_ms: number;
  };
}

export default function Analytics() {
  const [biddingData, setBiddingData] = useState<{ date: string; bids: number; avgAmount: number }[]>([]);
  const [bidsByCategory, setBidsByCategory] = useState<{ name: string; value: number }[]>([]);
  const [tasksByPriority, setTasksByPriority] = useState<{ name: string; value: number }[]>([]);
  const [tasksByStatus, setTasksByStatus] = useState<{ name: string; value: number }[]>([]);
  const [timeRange, setTimeRange] = useState("30");
  const [stats, setStats] = useState({ totalTasks: 0, completionRate: 0, totalBids: 0, avgBidAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  useEffect(() => { 
    fetchAnalytics(); 
    fetchBackendHealth();
  }, [timeRange]);

  const fetchBackendHealth = async () => {
    setHealthLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("backend-health");
      if (!error && data) {
        setBackendHealth(data);
      }
    } catch (err) {
      console.error("Health check error:", err);
    } finally {
      setHealthLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

      const { data: bids } = await supabase.from("task_bids").select("*").gte("created_at", daysAgo.toISOString());
      const { data: tasks } = await supabase.from("tasks").select("*").gte("created_at", daysAgo.toISOString());

      const totalBids = bids?.length || 0;
      const avgBidAmount = totalBids > 0 ? (bids?.reduce((sum, b) => sum + Number(b.bid_amount), 0) || 0) / totalBids : 0;
      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(t => t.status === "completed").length || 0;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      const bidsByDate: Record<string, { count: number; sum: number }> = {};
      bids?.forEach(bid => {
        const date = new Date(bid.created_at).toLocaleDateString();
        if (!bidsByDate[date]) bidsByDate[date] = { count: 0, sum: 0 };
        bidsByDate[date].count += 1;
        bidsByDate[date].sum += Number(bid.bid_amount);
      });
      setBiddingData(Object.entries(bidsByDate).map(([date, d]) => ({ date, bids: d.count, avgAmount: d.count > 0 ? d.sum / d.count : 0 })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

      const categoryBidCount: Record<string, number> = {};
      if (tasks && bids) tasks.forEach(task => { const c = bids.filter(b => b.task_id === task.id).length; categoryBidCount[task.category] = (categoryBidCount[task.category] || 0) + c; });
      setBidsByCategory(Object.entries(categoryBidCount).map(([name, value]) => ({ name, value })));

      const statusCount: Record<string, number> = {};
      tasks?.forEach(t => { statusCount[t.status || "unknown"] = (statusCount[t.status || "unknown"] || 0) + 1; });
      setTasksByStatus(Object.entries(statusCount).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));

      const priorityCount: Record<string, number> = {};
      tasks?.forEach(t => { priorityCount[t.priority || "medium"] = (priorityCount[t.priority || "medium"] || 0) + 1; });
      setTasksByPriority(Object.entries(priorityCount).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));

      setStats({ totalTasks, completionRate, totalBids, avgBidAmount });
    } catch (error) { console.error("Analytics Error:", error); } finally { setLoading(false); }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "bg-green-500";
      case "degraded": return "bg-yellow-500";
      case "unhealthy": return "bg-red-500";
      default: return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <BarChart className="h-10 w-10 text-primary" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">Track bidding trends, task metrics, and backend health</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Time Range" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => { fetchAnalytics(); fetchBackendHealth(); }}>
              <RefreshCw className={`h-4 w-4 ${loading || healthLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Backend Health Status */}
        {backendHealth && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Backend Health
                </CardTitle>
                <Badge variant={backendHealth.status === "healthy" ? "default" : "destructive"} className="capitalize">
                  <span className={`w-2 h-2 rounded-full mr-2 ${getHealthStatusColor(backendHealth.status)}`} />
                  {backendHealth.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Database</p>
                  <p className="font-medium">{backendHealth.checks.database.latency_ms}ms latency</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Active Users (24h)</p>
                  <p className="font-medium">{backendHealth.metrics.active_users_24h}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tasks Created (24h)</p>
                  <p className="font-medium">{backendHealth.metrics.tasks_created_24h}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Payments (24h)</p>
                  <p className="font-medium">{backendHealth.metrics.payments_processed_24h}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant={backendHealth.checks.stripe.configured ? "secondary" : "outline"}>
                  Stripe {backendHealth.checks.stripe.configured ? "✓" : "✗"}
                </Badge>
                <Badge variant={backendHealth.checks.email.configured ? "secondary" : "outline"}>
                  Email {backendHealth.checks.email.configured ? "✓" : "✗"}
                </Badge>
                <Badge variant={backendHealth.checks.ai.configured ? "secondary" : "outline"}>
                  AI {backendHealth.checks.ai.configured ? "✓" : "✗"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-3xl font-bold">{stats.completionRate.toFixed(1)}%</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bids</p>
                  <p className="text-3xl font-bold">{stats.totalBids}</p>
                </div>
                <Gavel className="h-10 w-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Bid Amount</p>
                  <p className="text-3xl font-bold">${stats.avgBidAmount.toFixed(2)}</p>
                </div>
                <DollarSign className="h-10 w-10 text-amber-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bidding" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bidding">Bidding Trends</TabsTrigger>
            <TabsTrigger value="status">Task Status</TabsTrigger>
            <TabsTrigger value="priority">Priority</TabsTrigger>
          </TabsList>

          <TabsContent value="bidding">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bidding Trends</CardTitle>
                  <CardDescription>Daily bid volume over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    {biddingData.length > 0 ? (
                      <AreaChart data={biddingData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                        <Area type="monotone" dataKey="bids" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                      </AreaChart>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">No data</div>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Avg Bid Amount</CardTitle>
                  <CardDescription>Average bid value per day</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    {biddingData.length > 0 ? (
                      <LineChart data={biddingData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                        <Line type="monotone" dataKey="avgAmount" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                      </LineChart>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">No data</div>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle>Tasks by Status</CardTitle>
                <CardDescription>Distribution of task statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  {tasksByStatus.length > 0 ? (
                    <PieChart>
                      <Pie 
                        data={tasksByStatus} 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={100} 
                        dataKey="value" 
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {tasksByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">No data</div>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="priority">
            <Card>
              <CardHeader>
                <CardTitle>Tasks by Priority</CardTitle>
                <CardDescription>Task priority distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  {tasksByPriority.length > 0 ? (
                    <PieChart>
                      <Pie 
                        data={tasksByPriority} 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={100} 
                        dataKey="value" 
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {tasksByPriority.map((entry, i) => (
                          <Cell 
                            key={i} 
                            fill={
                              entry.name === 'Urgent' ? 'hsl(var(--destructive))' : 
                              entry.name === 'High' ? 'hsl(var(--chart-3))' : 
                              entry.name === 'Medium' ? 'hsl(var(--primary))' : 
                              'hsl(var(--muted-foreground))'
                            } 
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">No data</div>
                  )}
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
