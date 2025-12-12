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
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, tasksRes, bookingsRes, verificationsRes, paymentsRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("tasks").select("*, profiles!tasks_task_giver_id_fkey(full_name)").order("created_at", { ascending: false }).limit(50),
        supabase.from("bookings").select("*, tasks(title), profiles!bookings_task_doer_id_fkey(full_name)").order("created_at", { ascending: false }).limit(50),
        supabase.from("verifications").select("*, profiles(full_name, email)").eq("verification_status", "pending").order("created_at", { ascending: false }),
        supabase.from("payments").select("*").order("created_at", { ascending: false }).limit(50),
      ]);

      if (!usersRes.error) setUsers(usersRes.data || []);
      if (!tasksRes.error) setTasks(tasksRes.data || []);
      if (!bookingsRes.error) setBookings(bookingsRes.data || []);
      if (!verificationsRes.error) setVerifications(verificationsRes.data || []);
      if (!paymentsRes.error) setPayments(paymentsRes.data || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
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

  const totalRevenue = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
  const platformFees = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.platform_fee, 0);

  return (
    <>
      <SEOHead title="Admin Dashboard - SaskTask" description="Manage platform" />

      <AdminLayout title="Admin Dashboard" description="Platform overview and quick actions">
        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-5 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookings.filter(b => b.status === "accepted" || b.status === "in_progress").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${platformFees.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Verifications Alert */}
        {verifications.length > 0 && (
          <Card className="mb-6 border-yellow-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-yellow-500" />
                {verifications.length} Pending Verifications
              </CardTitle>
              <CardDescription>Review and approve user verifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {verifications.slice(0, 3).map((verification) => (
                  <div key={verification.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{(verification.profiles as any)?.full_name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">{(verification.profiles as any)?.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleVerificationAction(verification.id, "verified")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerificationAction(verification.id, "rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {verifications.length > 3 && (
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => navigate("/admin/verify-users")}
                >
                  View all {verifications.length} pending verifications →
                </Button>
              )}
            </CardContent>
          </Card>
        )}

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