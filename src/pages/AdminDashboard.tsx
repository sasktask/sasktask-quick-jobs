import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEOHead } from "@/components/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Briefcase,
  Shield,
  Search,
  Eye,
  CheckCircle,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Activity,
  Ban,
  FileWarning,
  MessageSquare,
} from "lucide-react";
import { format, subDays } from "date-fns";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Trend calculations
  const [trends, setTrends] = useState({
    users: 0,
    tasks: 0,
    revenue: 0,
    bookings: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const sevenDaysAgo = subDays(new Date(), 7);
      const fourteenDaysAgo = subDays(new Date(), 14);

      const [
        usersRes,
        tasksRes,
        bookingsRes,
        verificationsRes,
        paymentsRes,
        disputesRes,
        fraudRes,
      ] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("tasks").select("*, profiles!tasks_task_giver_id_fkey(full_name)").order("created_at", { ascending: false }).limit(100),
        supabase.from("bookings").select("*, tasks(title), profiles!bookings_task_doer_id_fkey(full_name)").order("created_at", { ascending: false }).limit(100),
        supabase.from("verifications").select("*, profiles(full_name, email)").eq("verification_status", "pending").order("created_at", { ascending: false }),
        supabase.from("payments").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("disputes").select("*").eq("status", "open").order("created_at", { ascending: false }),
        supabase.from("fraud_alerts").select("*, profiles(full_name)").eq("status", "pending").order("created_at", { ascending: false }).limit(10),
      ]);

      const allUsers = usersRes.data || [];
      const allTasks = tasksRes.data || [];
      const allBookings = bookingsRes.data || [];
      const allPayments = paymentsRes.data || [];

      setUsers(allUsers);
      setTasks(allTasks);
      setBookings(allBookings);
      setVerifications(verificationsRes.data || []);
      setPayments(allPayments);
      setDisputes(disputesRes.data || []);
      setFraudAlerts(fraudRes.data || []);

      // Calculate trends (last 7 days vs previous 7 days)
      const currentUsers = allUsers.filter(u => u.created_at && new Date(u.created_at) >= sevenDaysAgo).length;
      const previousUsers = allUsers.filter(u => u.created_at && new Date(u.created_at) >= fourteenDaysAgo && new Date(u.created_at) < sevenDaysAgo).length;
      
      const currentTasks = allTasks.filter(t => t.created_at && new Date(t.created_at) >= sevenDaysAgo).length;
      const previousTasks = allTasks.filter(t => t.created_at && new Date(t.created_at) >= fourteenDaysAgo && new Date(t.created_at) < sevenDaysAgo).length;

      const currentBookings = allBookings.filter(b => b.created_at && new Date(b.created_at) >= sevenDaysAgo).length;
      const previousBookings = allBookings.filter(b => b.created_at && new Date(b.created_at) >= fourteenDaysAgo && new Date(b.created_at) < sevenDaysAgo).length;

      const currentRevenue = allPayments.filter(p => p.status === "completed" && p.created_at && new Date(p.created_at) >= sevenDaysAgo).reduce((sum, p) => sum + p.platform_fee, 0);
      const previousRevenue = allPayments.filter(p => p.status === "completed" && p.created_at && new Date(p.created_at) >= fourteenDaysAgo && new Date(p.created_at) < sevenDaysAgo).reduce((sum, p) => sum + p.platform_fee, 0);

      const calcTrend = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      setTrends({
        users: calcTrend(currentUsers, previousUsers),
        tasks: calcTrend(currentTasks, previousTasks),
        revenue: calcTrend(currentRevenue, previousRevenue),
        bookings: calcTrend(currentBookings, previousBookings),
      });

      // Build recent activity feed
      const activity: any[] = [];
      allUsers.slice(0, 5).forEach(u => {
        activity.push({
          type: "user",
          message: `New user: ${u.full_name || u.email}`,
          time: u.created_at,
          icon: Users,
        });
      });
      allTasks.slice(0, 5).forEach(t => {
        activity.push({
          type: "task",
          message: `Task posted: ${t.title}`,
          time: t.created_at,
          icon: Briefcase,
        });
      });
      allBookings.slice(0, 5).forEach(b => {
        activity.push({
          type: "booking",
          message: `Booking ${b.status}: ${(b.tasks as any)?.title || "Unknown task"}`,
          time: b.created_at,
          icon: CheckCircle,
        });
      });
      
      activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setRecentActivity(activity.slice(0, 10));

    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleVerificationAction = async (verificationId: string, action: "verified" | "rejected") => {
    try {
      const { error } = await supabase
        .from("verifications")
        .update({
          verification_status: action,
          verified_at: action === "verified" ? new Date().toISOString() : null,
        })
        .eq("id", verificationId);

      if (error) throw error;

      toast.success(`Verification ${action}`);
      loadData();
    } catch (error: any) {
      console.error("Error updating verification:", error);
      toast.error("Failed to update verification");
    }
  };

  const handleDismissFraud = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("fraud_alerts")
        .update({ status: "dismissed", reviewed_at: new Date().toISOString() })
        .eq("id", alertId);

      if (error) throw error;
      toast.success("Alert dismissed");
      loadData();
    } catch (error) {
      toast.error("Failed to dismiss alert");
    }
  };

  const totalRevenue = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
  const platformFees = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.platform_fee, 0);
  const activeBookings = bookings.filter(b => b.status === "accepted" || b.status === "in_progress").length;

  const TrendIndicator = ({ value }: { value: number }) => {
    const isPositive = value > 0;
    const isNeutral = value === 0;
    return (
      <div className={`flex items-center gap-1 text-xs ${
        isNeutral ? "text-muted-foreground" : isPositive ? "text-green-600" : "text-red-600"
      }`}>
        {isPositive ? <ArrowUpRight className="h-3 w-3" /> : isNeutral ? null : <ArrowDownRight className="h-3 w-3" />}
        <span>{isPositive ? "+" : ""}{value.toFixed(1)}% vs last week</span>
      </div>
    );
  };

  return (
    <>
      <SEOHead title="Admin Dashboard - SaskTask" description="Manage platform" />

      <AdminLayout title="Admin Dashboard" description="Platform overview and quick actions">
        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <Button variant="outline" size="sm" onClick={loadData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Alerts Section */}
        {(verifications.length > 0 || disputes.length > 0 || fraudAlerts.length > 0) && (
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {verifications.length > 0 && (
              <Card className="border-yellow-500/50 bg-yellow-500/5">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{verifications.length} Pending Verifications</p>
                      <p className="text-sm text-muted-foreground">Require review</p>
                    </div>
                    <Button size="sm" onClick={() => navigate("/admin/verify-users")}>
                      Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {disputes.length > 0 && (
              <Card className="border-red-500/50 bg-red-500/5">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <FileWarning className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{disputes.length} Open Disputes</p>
                      <p className="text-sm text-muted-foreground">Need resolution</p>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => navigate("/admin/disputes")}>
                      Resolve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {fraudAlerts.length > 0 && (
              <Card className="border-orange-500/50 bg-orange-500/5">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{fraudAlerts.length} Fraud Alerts</p>
                      <p className="text-sm text-muted-foreground">Suspicious activity</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate("/admin/fraud")}>
                      Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-16" /> : (
                <>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <TrendIndicator value={trends.users} />
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
              <Briefcase className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-16" /> : (
                <>
                  <div className="text-2xl font-bold">{tasks.length}</div>
                  <TrendIndicator value={trends.tasks} />
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-16" /> : (
                <>
                  <div className="text-2xl font-bold">{activeBookings}</div>
                  <TrendIndicator value={trends.bookings} />
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              )}
              <p className="text-xs text-muted-foreground">All completed payments</p>
            </CardContent>
          </Card>

          <Card className="hover-lift bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Platform Fees</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <div className="text-2xl font-bold text-green-600">${platformFees.toFixed(2)}</div>
                  <TrendIndicator value={trends.revenue} />
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions and Activity Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate("/admin/users")}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate("/admin/tasks")}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Manage Tasks
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate("/admin/payments")}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Payment Controls
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate("/admin/analytics")}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate("/admin/verify-users")}
              >
                <Shield className="h-4 w-4 mr-2" />
                Verify Users
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest platform events</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/4 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No recent activity</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        activity.type === "user" ? "bg-primary/10 text-primary" :
                        activity.type === "task" ? "bg-blue-500/10 text-blue-500" :
                        "bg-green-500/10 text-green-500"
                      }`}>
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.time ? format(new Date(activity.time), "MMM d, h:mm a") : "Just now"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>


        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Recent Users</TabsTrigger>
            <TabsTrigger value="tasks">Recent Tasks</TabsTrigger>
            <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage platform users</CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Completed Tasks</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                      </TableRow>
                    ) : (
                      users
                        .filter(u =>
                          !searchQuery ||
                          u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .slice(0, 20)
                        .map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.full_name || "N/A"}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.completed_tasks || 0}</TableCell>
                            <TableCell>
                              {user.rating ? `⭐ ${user.rating.toFixed(1)}` : "N/A"}
                            </TableCell>
                            <TableCell>
                              {user.verified_by_admin ? (
                                <Badge variant="default">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Yes
                                </Badge>
                              ) : (
                                <Badge variant="outline">No</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/profile/${user.id}`)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
                <Button
                  variant="link"
                  className="mt-4"
                  onClick={() => navigate("/admin/users")}
                >
                  View all users →
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Tasks</CardTitle>
                <CardDescription>Monitor all posted tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Posted By</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                      </TableRow>
                    ) : (
                      tasks.slice(0, 20).map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.title}</TableCell>
                          <TableCell>{task.category}</TableCell>
                          <TableCell>{(task.profiles as any)?.full_name || "N/A"}</TableCell>
                          <TableCell>${task.pay_amount}</TableCell>
                          <TableCell>
                            <Badge variant={task.status === "open" ? "default" : "secondary"}>
                              {task.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/task/${task.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <Button
                  variant="link"
                  className="mt-4"
                  onClick={() => navigate("/admin/tasks")}
                >
                  View all tasks →
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>Monitor all bookings and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Task Doer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                      </TableRow>
                    ) : (
                      bookings.slice(0, 20).map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">
                            {(booking.tasks as any)?.title || "N/A"}
                          </TableCell>
                          <TableCell>
                            {(booking.profiles as any)?.full_name || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge>{booking.status}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(booking.created_at!).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/chat/${booking.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <Button
                  variant="link"
                  className="mt-4"
                  onClick={() => navigate("/admin/bookings")}
                >
                  View all bookings →
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AdminLayout>
    </>
  );
}