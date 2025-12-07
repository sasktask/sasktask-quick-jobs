import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BarChart, DollarSign, TrendingUp, Target, Gavel, Activity, CheckCircle } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart as RechartsBarChart, Bar, AreaChart, Area
} from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const [biddingData, setBiddingData] = useState<any[]>([]);
  const [bidsByCategory, setBidsByCategory] = useState<any[]>([]);
  const [tasksByPriority, setTasksByPriority] = useState<any[]>([]);
  const [tasksByStatus, setTasksByStatus] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState("30");
  const [stats, setStats] = useState({ totalTasks: 0, completionRate: 0, totalBids: 0, avgBidAmount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, [timeRange]);

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <div className="flex justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3"><BarChart className="h-10 w-10 text-primary" />Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track bidding trends and task completion rates</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Time Range" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Tasks</p><p className="text-3xl font-bold">{stats.totalTasks}</p></div><Target className="h-10 w-10 text-primary opacity-50" /></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Completion Rate</p><p className="text-3xl font-bold">{stats.completionRate.toFixed(1)}%</p></div><CheckCircle className="h-10 w-10 text-green-500 opacity-50" /></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Bids</p><p className="text-3xl font-bold">{stats.totalBids}</p></div><Gavel className="h-10 w-10 text-blue-500 opacity-50" /></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Avg Bid Amount</p><p className="text-3xl font-bold">${stats.avgBidAmount.toFixed(2)}</p></div><DollarSign className="h-10 w-10 text-amber-500 opacity-50" /></div></CardContent></Card>
        </div>

        <Tabs defaultValue="bidding" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bidding">Bidding Trends</TabsTrigger>
            <TabsTrigger value="status">Task Status</TabsTrigger>
            <TabsTrigger value="priority">Priority</TabsTrigger>
          </TabsList>

          <TabsContent value="bidding">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card><CardHeader><CardTitle>Bidding Trends</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}>{biddingData.length > 0 ? <AreaChart data={biddingData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Area type="monotone" dataKey="bids" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} /></AreaChart> : <div className="h-full flex items-center justify-center text-muted-foreground">No data</div>}</ResponsiveContainer></CardContent></Card>
              <Card><CardHeader><CardTitle>Avg Bid Amount</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}>{biddingData.length > 0 ? <LineChart data={biddingData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Line type="monotone" dataKey="avgAmount" stroke="#10b981" strokeWidth={2} /></LineChart> : <div className="h-full flex items-center justify-center text-muted-foreground">No data</div>}</ResponsiveContainer></CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="status">
            <Card><CardHeader><CardTitle>Tasks by Status</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}>{tasksByStatus.length > 0 ? <PieChart><Pie data={tasksByStatus} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>{tasksByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart> : <div className="h-full flex items-center justify-center text-muted-foreground">No data</div>}</ResponsiveContainer></CardContent></Card>
          </TabsContent>

          <TabsContent value="priority">
            <Card><CardHeader><CardTitle>Tasks by Priority</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}>{tasksByPriority.length > 0 ? <PieChart><Pie data={tasksByPriority} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>{tasksByPriority.map((entry, i) => <Cell key={i} fill={entry.name === 'Urgent' ? '#ef4444' : entry.name === 'High' ? '#f97316' : entry.name === 'Medium' ? '#3b82f6' : '#94a3b8'} />)}</Pie><Tooltip /><Legend /></PieChart> : <div className="h-full flex items-center justify-center text-muted-foreground">No data</div>}</ResponsiveContainer></CardContent></Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
