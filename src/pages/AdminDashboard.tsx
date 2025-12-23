import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Users,
  Briefcase,
  DollarSign,
  AlertTriangle,
  Shield,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  ArrowRight,
  Calendar,
  Flag,
  Activity,
  CreditCard,
} from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";

interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalTasks: number;
  openTasks: number;
  completedTasks: number;
  totalBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  platformFees: number;
  pendingVerifications: number;
  openDisputes: number;
  fraudAlerts: number;
  newUsersToday: number;
  newTasksToday: number;
  userTrend: number;
  taskTrend: number;
}

interface RecentActivity {
  id: string;
  type: "user" | "task" | "booking" | "payment" | "dispute" | "verification";
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

interface PendingItem {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  timestamp: string;
  severity?: "low" | "medium" | "high";
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0, activeUsers: 0, totalTasks: 0, openTasks: 0, completedTasks: 0,
    totalBookings: 0, pendingBookings: 0, totalRevenue: 0, platformFees: 0,
    pendingVerifications: 0, openDisputes: 0, fraudAlerts: 0, newUsersToday: 0,
    newTasksToday: 0, userTrend: 0, taskTrend: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    setRefreshing(true);
    await Promise.all([loadStats(), loadRecentActivities(), loadPendingItems(), loadRecentUsers()]);
    setLoading(false);
    setRefreshing(false);
  };

  const loadStats = async () => {
    const today = startOfDay(new Date());
    const lastWeek = subDays(today, 7);
    const [
      { count: totalUsers }, { count: activeUsers }, { count: totalTasks }, { count: openTasks },
      { count: completedTasks }, { count: totalBookings }, { count: pendingBookings },
      { data: payments }, { count: pendingVerifications }, { count: openDisputes },
      { count: fraudAlerts }, { count: newUsersToday }, { count: newTasksToday },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).gte("last_active", lastWeek.toISOString()),
      supabase.from("tasks").select("*", { count: "exact", head: true }),
      supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "completed"),
      supabase.from("bookings").select("*", { count: "exact", head: true }),
      supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("payments").select("amount, platform_fee").eq("status", "completed"),
      supabase.from("verifications").select("*", { count: "exact", head: true }).eq("verification_status", "pending"),
      supabase.from("disputes").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("fraud_alerts").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
      supabase.from("tasks").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    ]);
    const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const platformFees = payments?.reduce((sum, p) => sum + (p.platform_fee || 0), 0) || 0;
    setStats({ totalUsers: totalUsers || 0, activeUsers: activeUsers || 0, totalTasks: totalTasks || 0,
      openTasks: openTasks || 0, completedTasks: completedTasks || 0, totalBookings: totalBookings || 0,
      pendingBookings: pendingBookings || 0, totalRevenue, platformFees, pendingVerifications: pendingVerifications || 0,
      openDisputes: openDisputes || 0, fraudAlerts: fraudAlerts || 0, newUsersToday: newUsersToday || 0,
      newTasksToday: newTasksToday || 0, userTrend: 0, taskTrend: 0 });
  };

  const loadRecentActivities = async () => {
    const activities: RecentActivity[] = [];
    const [{ data: users }, { data: tasks }, { data: bookings }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("tasks").select("id, title, created_at, status").order("created_at", { ascending: false }).limit(5),
      supabase.from("bookings").select("id, status, updated_at").order("updated_at", { ascending: false }).limit(5),
    ]);
    users?.forEach(u => activities.push({ id: u.id, type: "user", title: "New user", description: u.full_name || "Anonymous", timestamp: u.created_at || "" }));
    tasks?.forEach(t => activities.push({ id: t.id, type: "task", title: "Task posted", description: t.title, timestamp: t.created_at || "", status: t.status || undefined }));
    bookings?.forEach(b => activities.push({ id: b.id, type: "booking", title: "Booking", description: `Status: ${b.status}`, timestamp: b.updated_at || "", status: b.status || undefined }));
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setRecentActivities(activities.slice(0, 10));
  };

  const loadPendingItems = async () => {
    const items: PendingItem[] = [];
    const [{ data: verifications }, { data: disputes }, { data: fraudAlerts }] = await Promise.all([
      supabase.from("verifications").select("id, created_at, legal_name").eq("verification_status", "pending").limit(5),
      supabase.from("disputes").select("id, dispute_reason, created_at").eq("status", "open").limit(5),
      supabase.from("fraud_alerts").select("id, alert_type, severity, created_at").eq("status", "pending").limit(5),
    ]);
    verifications?.forEach(v => items.push({ id: v.id, type: "verification", title: "Verification", subtitle: v.legal_name || "User", timestamp: v.created_at, severity: "medium" }));
    disputes?.forEach(d => items.push({ id: d.id, type: "dispute", title: "Dispute", subtitle: d.dispute_reason.replace(/_/g, " "), timestamp: d.created_at, severity: "high" }));
    fraudAlerts?.forEach(f => items.push({ id: f.id, type: "fraud", title: "Fraud Alert", subtitle: f.alert_type.replace(/_/g, " "), timestamp: f.created_at, severity: f.severity as any }));
    setPendingItems(items);
  };

  const loadRecentUsers = async () => {
    const { data } = await supabase.from("profiles").select("id, full_name, email, verification_level").order("created_at", { ascending: false }).limit(5);
    setRecentUsers(data || []);
  };

  const handleQuickAction = async (action: string, id: string) => {
    if (action === "approve_verification") {
      await supabase.from("verifications").update({ verification_status: "verified" }).eq("id", id);
      toast.success("Approved");
    } else if (action === "reject_verification") {
      await supabase.from("verifications").update({ verification_status: "rejected" }).eq("id", id);
      toast.success("Rejected");
    }
    loadDashboardData();
  };

  const StatCard = ({ title, value, icon: Icon, subtitle, color = "text-muted-foreground" }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );

  const getActivityIcon = (type: string) => {
    const icons: any = { user: <Users className="h-4 w-4 text-blue-500" />, task: <Briefcase className="h-4 w-4 text-green-500" />, booking: <Calendar className="h-4 w-4 text-purple-500" /> };
    return icons[type] || <Activity className="h-4 w-4" />;
  };

  if (loading) return <AdminLayout title="Dashboard" description="Loading..."><div className="flex items-center justify-center h-64"><RefreshCw className="h-8 w-8 animate-spin text-primary" /></div></AdminLayout>;

  return (
    <>
      <SEOHead title="Admin Dashboard - SaskTask" description="Platform administration" />
      <AdminLayout title="Admin Dashboard" description="Platform overview and quick actions">
        <div className="flex justify-end mb-4">
          <Button variant="outline" size="sm" onClick={loadDashboardData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />Refresh
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} subtitle={`${stats.newUsersToday} new today`} />
          <StatCard title="Total Tasks" value={stats.totalTasks} icon={Briefcase} subtitle={`${stats.openTasks} open`} />
          <StatCard title="Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} subtitle={`$${stats.platformFees.toLocaleString()} fees`} />
          <StatCard title="Pending" value={stats.pendingVerifications + stats.openDisputes + stats.fraudAlerts} icon={AlertTriangle} color="text-destructive" subtitle={`${stats.pendingVerifications} verifications`} />
        </div>
        {(stats.pendingVerifications > 0 || stats.openDisputes > 0 || stats.fraudAlerts > 0) && (
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {stats.pendingVerifications > 0 && <Card className="border-yellow-500/50 bg-yellow-500/5"><CardContent className="pt-6"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><Shield className="h-8 w-8 text-yellow-500" /><div><p className="font-semibold">{stats.pendingVerifications} Pending Verifications</p></div></div><Link to="/admin/verify-users"><Button size="sm">Review</Button></Link></div></CardContent></Card>}
            {stats.openDisputes > 0 && <Card className="border-red-500/50 bg-red-500/5"><CardContent className="pt-6"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><Flag className="h-8 w-8 text-red-500" /><div><p className="font-semibold">{stats.openDisputes} Open Disputes</p></div></div><Link to="/admin/disputes"><Button size="sm" variant="destructive">Resolve</Button></Link></div></CardContent></Card>}
            {stats.fraudAlerts > 0 && <Card className="border-orange-500/50 bg-orange-500/5"><CardContent className="pt-6"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><AlertTriangle className="h-8 w-8 text-orange-500" /><div><p className="font-semibold">{stats.fraudAlerts} Fraud Alerts</p></div></div><Link to="/admin/fraud"><Button size="sm" variant="outline">Investigate</Button></Link></div></CardContent></Card>}
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {pendingItems.length > 0 && (
              <Card><CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Pending Actions</CardTitle></CardHeader><CardContent><div className="space-y-3">
                {pendingItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div><p className="font-medium text-sm">{item.title}</p><p className="text-xs text-muted-foreground">{item.subtitle}</p></div>
                    <div className="flex items-center gap-2">
                      {item.type === "verification" && (<><Button size="sm" variant="outline" onClick={() => handleQuickAction("approve_verification", item.id)}><CheckCircle className="h-3 w-3" /></Button><Button size="sm" variant="outline" onClick={() => handleQuickAction("reject_verification", item.id)}><XCircle className="h-3 w-3" /></Button></>)}
                      {item.type === "dispute" && <Link to="/admin/disputes"><Button size="sm" variant="outline"><Eye className="h-3 w-3" /></Button></Link>}
                      {item.type === "fraud" && <Link to="/admin/fraud"><Button size="sm" variant="outline"><Eye className="h-3 w-3" /></Button></Link>}
                    </div>
                  </div>
                ))}
              </div></CardContent></Card>
            )}
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Recent Activity</CardTitle></CardHeader><CardContent><ScrollArea className="h-[250px]"><div className="space-y-3">
              {recentActivities.map((a, i) => (
                <div key={`${a.id}-${i}`} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                  {getActivityIcon(a.type)}
                  <div className="flex-1"><p className="text-sm font-medium">{a.title}</p><p className="text-xs text-muted-foreground">{a.description}</p></div>
                  <p className="text-xs text-muted-foreground">{format(new Date(a.timestamp), "MMM d")}</p>
                </div>
              ))}
            </div></ScrollArea></CardContent></Card>
          </div>
          <div className="space-y-6">
            <Card><CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader><CardContent className="space-y-2">
              <Link to="/admin/users"><Button variant="outline" className="w-full justify-between"><span className="flex items-center gap-2"><Users className="h-4 w-4" />Users</span><ArrowRight className="h-4 w-4" /></Button></Link>
              <Link to="/admin/tasks"><Button variant="outline" className="w-full justify-between"><span className="flex items-center gap-2"><Briefcase className="h-4 w-4" />Tasks</span><ArrowRight className="h-4 w-4" /></Button></Link>
              <Link to="/admin/payments"><Button variant="outline" className="w-full justify-between"><span className="flex items-center gap-2"><CreditCard className="h-4 w-4" />Payments</span><ArrowRight className="h-4 w-4" /></Button></Link>
              <Link to="/admin/verify-users"><Button variant="outline" className="w-full justify-between"><span className="flex items-center gap-2"><Shield className="h-4 w-4" />Verifications</span><Badge>{stats.pendingVerifications}</Badge></Button></Link>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Recent Users</CardTitle><Link to="/admin/users"><Button variant="ghost" size="sm">View All</Button></Link></CardHeader><CardContent><div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs">{u.full_name?.charAt(0) || "?"}</div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{u.full_name || "Anonymous"}</p><p className="text-xs text-muted-foreground truncate">{u.email}</p></div>
                  {u.verification_level === "verified" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                </div>
              ))}
            </div></CardContent></Card>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
