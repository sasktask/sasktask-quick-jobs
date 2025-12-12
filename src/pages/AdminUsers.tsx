import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  MoreVertical,
  Eye,
  Ban,
  CheckCircle,
  Mail,
  Shield,
  Star,
  AlertTriangle,
  UserX,
  UserCheck,
  Trash2,
  Users,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  completed_tasks: number | null;
  rating: number | null;
  verified_by_admin: boolean | null;
  trust_score: number | null;
  is_online: boolean | null;
  availability_status: string | null;
  cancellation_rate: number | null;
  reliability_score: number | null;
}

interface UserRole {
  id: string;
  user_id: string;
  role: "task_giver" | "task_doer" | "admin";
}

interface FraudAlert {
  id: string;
  user_id: string;
  alert_type: string;
  severity: string;
  status: string;
  description: string;
  created_at: string;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionDialog, setActionDialog] = useState<{
    type: "verify" | "ban" | "message" | "delete" | "warn" | null;
    user: User | null;
  }>({ type: null, user: null });
  const [messageContent, setMessageContent] = useState("");
  const [messageTitle, setMessageTitle] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    online: 0,
    newThisMonth: 0,
    taskGivers: 0,
    taskDoers: 0,
    flaggedUsers: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, rolesRes, alertsRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
        supabase.from("fraud_alerts").select("*").eq("status", "pending"),
      ]);

      if (usersRes.error) throw usersRes.error;

      setUsers(usersRes.data || []);
      setUserRoles(rolesRes.data || []);
      setFraudAlerts(alertsRes.data || []);

      // Calculate stats
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const roles = rolesRes.data || [];
      const alerts = alertsRes.data || [];

      const flaggedUserIds = new Set(alerts.map(a => a.user_id));

      setStats({
        total: usersRes.data?.length || 0,
        verified: usersRes.data?.filter(u => u.verified_by_admin).length || 0,
        online: usersRes.data?.filter(u => u.is_online).length || 0,
        newThisMonth: usersRes.data?.filter(u =>
          u.created_at && new Date(u.created_at) >= startOfMonth
        ).length || 0,
        taskGivers: roles.filter(r => r.role === "task_giver").length,
        taskDoers: roles.filter(r => r.role === "task_doer").length,
        flaggedUsers: flaggedUserIds.size,
      });
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const getUserRole = (userId: string) => {
    return userRoles.find(r => r.user_id === userId)?.role || "unknown";
  };

  const isUserFlagged = (userId: string) => {
    return fraudAlerts.some(a => a.user_id === userId);
  };

  const handleVerifyUser = async () => {
    if (!actionDialog.user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          verified_by_admin: true,
          verified_at: new Date().toISOString(),
        })
        .eq("id", actionDialog.user.id);

      if (error) throw error;

      // Send notification
      await supabase.from("notifications").insert({
        user_id: actionDialog.user.id,
        title: "Account Verified!",
        message: "Congratulations! Your account has been verified by our team. You now have access to all platform features.",
        type: "account",
      });

      toast.success("User verified successfully");
      loadData();
      setActionDialog({ type: null, user: null });
    } catch (error: any) {
      console.error("Error verifying user:", error);
      toast.error("Failed to verify user");
    }
  };

  const handleUnverifyUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          verified_by_admin: false,
          verified_at: null,
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("User verification removed");
      loadData();
    } catch (error: any) {
      console.error("Error removing verification:", error);
      toast.error("Failed to update user");
    }
  };

  const handleSendNotification = async () => {
    if (!actionDialog.user || !messageContent.trim()) return;

    try {
      const { error } = await supabase.from("notifications").insert({
        user_id: actionDialog.user.id,
        title: messageTitle || "Message from Admin",
        message: messageContent,
        type: "admin",
      });

      if (error) throw error;

      toast.success("Notification sent successfully");
      setMessageContent("");
      setMessageTitle("");
      setActionDialog({ type: null, user: null });
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification");
    }
  };

  const handleSendWarning = async () => {
    if (!actionDialog.user || !messageContent.trim()) return;

    try {
      // Create fraud alert for warning
      await supabase.from("fraud_alerts").insert({
        user_id: actionDialog.user.id,
        alert_type: "admin_warning",
        severity: "medium",
        description: messageContent,
        status: "pending",
      });

      // Send notification
      await supabase.from("notifications").insert({
        user_id: actionDialog.user.id,
        title: "⚠️ Account Warning",
        message: messageContent,
        type: "warning",
      });

      toast.success("Warning sent and logged");
      setMessageContent("");
      loadData();
      setActionDialog({ type: null, user: null });
    } catch (error: any) {
      console.error("Error sending warning:", error);
      toast.error("Failed to send warning");
    }
  };

  const handleBanUser = async () => {
    if (!actionDialog.user) return;

    try {
      // Update profile to mark as banned
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          availability_status: "banned",
          verified_by_admin: false,
        })
        .eq("id", actionDialog.user.id);

      if (profileError) throw profileError;

      // Create fraud alert
      await supabase.from("fraud_alerts").insert({
        user_id: actionDialog.user.id,
        alert_type: "account_banned",
        severity: "critical",
        description: messageContent || "Account banned by admin",
        status: "resolved",
      });

      // Send notification
      await supabase.from("notifications").insert({
        user_id: actionDialog.user.id,
        title: "Account Suspended",
        message: messageContent || "Your account has been suspended. Please contact support for more information.",
        type: "account",
      });

      toast.success("User banned successfully");
      setMessageContent("");
      loadData();
      setActionDialog({ type: null, user: null });
    } catch (error: any) {
      console.error("Error banning user:", error);
      toast.error("Failed to ban user");
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          availability_status: "available",
        })
        .eq("id", userId);

      if (error) throw error;

      // Notify user
      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Account Restored",
        message: "Your account has been restored. You can now access all platform features.",
        type: "account",
      });

      toast.success("User unbanned successfully");
      loadData();
    } catch (error: any) {
      console.error("Error unbanning user:", error);
      toast.error("Failed to unban user");
    }
  };

  const handleDeleteUser = async () => {
    if (!actionDialog.user) return;

    try {
      // Delete user data (cascade should handle related records)
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", actionDialog.user.id);

      if (error) throw error;

      toast.success("User deleted successfully");
      loadData();
      setActionDialog({ type: null, user: null });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user. User may have active bookings or tasks.");
    }
  };

  const exportUsers = () => {
    const csv = [
      ["ID", "Name", "Email", "Role", "Verified", "Rating", "Tasks", "Joined"].join(","),
      ...filteredUsers.map((u) =>
        [
          u.id,
          u.full_name || "",
          u.email,
          getUserRole(u.id),
          u.verified_by_admin ? "Yes" : "No",
          u.rating || "N/A",
          u.completed_tasks || 0,
          u.created_at ? format(new Date(u.created_at), "yyyy-MM-dd") : "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const userRole = getUserRole(u.id);
    const matchesRole = roleFilter === "all" || userRole === roleFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && u.verified_by_admin) ||
      (statusFilter === "unverified" && !u.verified_by_admin) ||
      (statusFilter === "online" && u.is_online) ||
      (statusFilter === "banned" && u.availability_status === "banned") ||
      (statusFilter === "flagged" && isUserFlagged(u.id));

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <>
      <SEOHead title="User Management - Admin" description="Manage platform users" />
      <AdminLayout title="User Management" description="Complete control over all platform users">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-7 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Task Givers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.taskGivers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Task Doers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.taskDoers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Verified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Online
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{stats.online}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Flagged
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.flaggedUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                New (Month)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.newThisMonth}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="task_giver">Task Givers</SelectItem>
                  <SelectItem value="task_doer">Task Doers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportUsers}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Trust</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className={user.availability_status === "banned" ? "bg-red-50 dark:bg-red-950/20" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={user.avatar_url || "/placeholder.svg"}
                              alt=""
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            {user.is_online && (
                              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                            )}
                          </div>
                          <div>
                            <span className="font-medium block">{user.full_name || "No name"}</span>
                            {isUserFlagged(user.id) && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Flagged
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getUserRole(user.id) === "task_doer" ? "default" : "secondary"}>
                          {getUserRole(user.id) === "task_giver" ? "Giver" : getUserRole(user.id) === "task_doer" ? "Doer" : getUserRole(user.id)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.availability_status === "banned" ? (
                            <Badge variant="destructive">
                              <Ban className="h-3 w-3 mr-1" />
                              Banned
                            </Badge>
                          ) : (
                            <>
                              {user.verified_by_admin && (
                                <Badge variant="default" className="bg-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                              {user.is_online && (
                                <Badge variant="outline" className="border-green-500 text-green-600">
                                  Online
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{user.completed_tasks || 0}</TableCell>
                      <TableCell>
                        {user.rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            {user.rating.toFixed(1)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.trust_score ? (
                          <Badge variant={user.trust_score >= 70 ? "default" : user.trust_score >= 40 ? "secondary" : "destructive"}>
                            {user.trust_score}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {user.created_at
                          ? format(new Date(user.created_at), "MMM d, yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActionDialog({ type: "message", user })}>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.verified_by_admin ? (
                              <DropdownMenuItem onClick={() => handleUnverifyUser(user.id)} className="text-orange-600">
                                <ShieldAlert className="h-4 w-4 mr-2" />
                                Remove Verification
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => setActionDialog({ type: "verify", user })} className="text-green-600">
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                Verify User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => setActionDialog({ type: "warn", user })} className="text-yellow-600">
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Send Warning
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.availability_status === "banned" ? (
                              <DropdownMenuItem onClick={() => handleUnbanUser(user.id)} className="text-green-600">
                                <UserCheck className="h-4 w-4 mr-2" />
                                Unban User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => setActionDialog({ type: "ban", user })} className="text-red-600">
                                <Ban className="h-4 w-4 mr-2" />
                                Ban User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => setActionDialog({ type: "delete", user })} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Verify User Dialog */}
        <Dialog open={actionDialog.type === "verify"} onOpenChange={() => setActionDialog({ type: null, user: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <ShieldCheck className="h-5 w-5" />
                Verify User
              </DialogTitle>
              <DialogDescription>
                Verify {actionDialog.user?.full_name || "this user"}? They will receive a verified badge and notification.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog({ type: null, user: null })}>Cancel</Button>
              <Button onClick={handleVerifyUser} className="bg-green-600 hover:bg-green-700">
                <Shield className="h-4 w-4 mr-2" />
                Verify User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Send Message Dialog */}
        <Dialog open={actionDialog.type === "message"} onOpenChange={() => { setActionDialog({ type: null, user: null }); setMessageContent(""); setMessageTitle(""); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Notification</DialogTitle>
              <DialogDescription>Send a notification to {actionDialog.user?.full_name || "this user"}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Title (optional)" value={messageTitle} onChange={(e) => setMessageTitle(e.target.value)} />
              <Textarea placeholder="Enter your message..." value={messageContent} onChange={(e) => setMessageContent(e.target.value)} rows={4} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setActionDialog({ type: null, user: null }); setMessageContent(""); setMessageTitle(""); }}>Cancel</Button>
              <Button onClick={handleSendNotification} disabled={!messageContent.trim()}>
                <Mail className="h-4 w-4 mr-2" />
                Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Send Warning Dialog */}
        <Dialog open={actionDialog.type === "warn"} onOpenChange={() => { setActionDialog({ type: null, user: null }); setMessageContent(""); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                Send Warning
              </DialogTitle>
              <DialogDescription>Send an official warning to {actionDialog.user?.full_name}. This will be logged.</DialogDescription>
            </DialogHeader>
            <Textarea placeholder="Warning message..." value={messageContent} onChange={(e) => setMessageContent(e.target.value)} rows={4} />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setActionDialog({ type: null, user: null }); setMessageContent(""); }}>Cancel</Button>
              <Button onClick={handleSendWarning} disabled={!messageContent.trim()} className="bg-yellow-600 hover:bg-yellow-700">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Send Warning
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ban User Dialog */}
        <Dialog open={actionDialog.type === "ban"} onOpenChange={() => { setActionDialog({ type: null, user: null }); setMessageContent(""); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Ban className="h-5 w-5" />
                Ban User
              </DialogTitle>
              <DialogDescription>
                Ban {actionDialog.user?.full_name}? They will lose access to the platform.
              </DialogDescription>
            </DialogHeader>
            <Textarea placeholder="Reason for ban (will be sent to user)..." value={messageContent} onChange={(e) => setMessageContent(e.target.value)} rows={3} />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setActionDialog({ type: null, user: null }); setMessageContent(""); }}>Cancel</Button>
              <Button variant="destructive" onClick={handleBanUser}>
                <Ban className="h-4 w-4 mr-2" />
                Ban User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <Dialog open={actionDialog.type === "delete"} onOpenChange={() => setActionDialog({ type: null, user: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Delete User
              </DialogTitle>
              <DialogDescription>
                Permanently delete {actionDialog.user?.full_name}? This action cannot be undone and will remove all their data.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog({ type: null, user: null })}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Permanently
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
}
