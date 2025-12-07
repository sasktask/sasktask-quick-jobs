import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { OWNER_USER_ID } from "@/lib/constants";
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
  AlertTriangle,
  Search,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";


export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user is the owner
      if (user.id !== OWNER_USER_ID) {
        toast.error("Access denied: Owner only");
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      await Promise.all([
        loadUsers(),
        loadTasks(),
        loadBookings(),
        loadVerifications(),
      ]);
    } catch (error: any) {
      console.error("Error checking admin:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && data) setUsers(data);
  };

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*, profiles!tasks_task_giver_id_fkey(full_name)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && data) setTasks(data);
  };

  const loadBookings = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, tasks(title), profiles!bookings_task_doer_id_fkey(full_name)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && data) setBookings(data);
  };

  const loadVerifications = async () => {
    const { data, error } = await supabase
      .from("verifications")
      .select("*, profiles(full_name, email)")
      .eq("verification_status", "pending")
      .order("created_at", { ascending: false });

    if (!error && data) setVerifications(data);
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
      loadVerifications();
    } catch (error: any) {
      console.error("Error updating verification:", error);
      toast.error("Failed to update verification");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <SEOHead title="Admin Dashboard - SaskTask" description="Manage platform" />

      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="container mx-auto px-4 pt-24 pb-20">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-4 mb-8">
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
                  <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{verifications.length}</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="users">
              <TabsList>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="verifications">Verifications</TabsTrigger>
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
                        {users
                          .filter(u =>
                            !searchQuery ||
                            u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                          )
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
                          ))}
                      </TableBody>
                    </Table>
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
                        {tasks.map((task) => (
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
                        ))}
                      </TableBody>
                    </Table>
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
                        {bookings.map((booking) => (
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
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Verifications Tab */}
              <TabsContent value="verifications" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Verifications</CardTitle>
                    <CardDescription>Review and approve user verifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {verifications.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        No pending verifications
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {verifications.map((verification) => (
                          <Card key={verification.id}>
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg">
                                    {(verification.profiles as any)?.full_name || "Unknown"}
                                  </CardTitle>
                                  <CardDescription>
                                    {(verification.profiles as any)?.email || "No email"}
                                  </CardDescription>
                                </div>
                                <Badge>Pending</Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">ID Type:</span>{" "}
                                  <span className="font-medium">{verification.id_type || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Age Verified:</span>{" "}
                                  {verification.age_verified ? "✓" : "✗"}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">BG Check Consent:</span>{" "}
                                  {verification.background_check_consent ? "✓" : "✗"}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Has Insurance:</span>{" "}
                                  {verification.has_insurance ? "✓" : "✗"}
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleVerificationAction(verification.id, "verified")}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleVerificationAction(verification.id, "rejected")}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(`/profile/${verification.user_id}`)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Profile
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
