import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Shield,
  ShieldCheck,
  Mail,
  Ban,
  RefreshCw,
  UserCheck,
  Clock,
  AlertTriangle,
  Crown,
  UserMinus,
} from "lucide-react";
import { format } from "date-fns";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  verified_by_admin: boolean | null;
  is_online: boolean | null;
  availability_status: string | null;
  user_id_number: string | null;
  last_seen: string | null;
}

interface UserRole {
  user_id: string;
  role: "task_giver" | "task_doer" | "admin";
}

type ActionType = "verify" | "message" | "ban" | "grant_admin" | "revoke_admin" | null;

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionDialog, setActionDialog] = useState<{
    type: ActionType;
    user: User | null;
  }>({ type: null, user: null });
  const [messageContent, setMessageContent] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    unverified: 0,
    online: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  // Check if user was active within the last 5 minutes
  // IMPORTANT: Only rely on last_seen timestamp, not is_online flag which can become stale
  const isRecentlyActive = (lastSeen: string | null): boolean => {
    if (!lastSeen) return false;
    const lastSeenDate = new Date(lastSeen);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastSeenDate > fiveMinutesAgo;
  };

  // Determine if user is truly online (based on recent activity, not stale is_online flag)
  const isUserTrulyOnline = (user: User): boolean => {
    return isRecentlyActive(user.last_seen);
  };

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("id, email, full_name, avatar_url, created_at, verified_by_admin, is_online, availability_status, user_id_number, last_seen").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);

      if (usersRes.error) throw usersRes.error;

      const usersData = usersRes.data || [];
      setUsers(usersData);
      setUserRoles(rolesRes.data || []);

      // Count truly online users - ONLY based on last_seen within 5 minutes
      // The is_online flag can become stale if browser is closed without cleanup
      const onlineCount = usersData.filter(u => isRecentlyActive(u.last_seen)).length;

      setStats({
        total: usersData.length,
        verified: usersData.filter(u => u.verified_by_admin).length,
        unverified: usersData.filter(u => !u.verified_by_admin).length,
        online: onlineCount,
      });
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getUserRole = (userId: string) => {
    return userRoles.find(r => r.user_id === userId)?.role || "user";
  };

  const isUserAdmin = (userId: string) => {
    return userRoles.some(r => r.user_id === userId && r.role === "admin");
  };

  const handleGrantAdmin = async () => {
    if (!actionDialog.user) return;
    try {
      const { error } = await supabase.from("user_roles").insert({
        user_id: actionDialog.user.id,
        role: "admin",
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("User already has admin role");
        } else {
          throw error;
        }
        return;
      }

      await supabase.from("notifications").insert({
        user_id: actionDialog.user.id,
        title: "Admin Access Granted",
        message: "You have been granted admin access to the platform.",
        type: "account",
      });

      toast.success("Admin role granted successfully");
      loadData();
      setActionDialog({ type: null, user: null });
    } catch (error: any) {
      console.error("Error granting admin:", error);
      toast.error("Failed to grant admin role");
    }
  };

  const handleRevokeAdmin = async () => {
    if (!actionDialog.user) return;
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", actionDialog.user.id)
        .eq("role", "admin");

      if (error) throw error;

      await supabase.from("notifications").insert({
        user_id: actionDialog.user.id,
        title: "Admin Access Revoked",
        message: "Your admin access has been revoked.",
        type: "account",
      });

      toast.success("Admin role revoked successfully");
      loadData();
      setActionDialog({ type: null, user: null });
    } catch (error: any) {
      console.error("Error revoking admin:", error);
      toast.error("Failed to revoke admin role");
    }
  };

  const handleVerifyUser = async () => {
    if (!actionDialog.user) return;
    try {
      const { error } = await supabase.from("profiles").update({
        verified_by_admin: true,
        verified_at: new Date().toISOString(),
      }).eq("id", actionDialog.user.id);

      if (error) throw error;

      await supabase.from("notifications").insert({
        user_id: actionDialog.user.id,
        title: "Account Verified!",
        message: "Your account has been verified by our admin team.",
        type: "account",
      });

      toast.success("User verified successfully");
      loadData();
      setActionDialog({ type: null, user: null });
    } catch (error: any) {
      toast.error("Failed to verify user");
    }
  };

  const handleUnverify = async (userId: string) => {
    try {
      await supabase.from("profiles").update({
        verified_by_admin: false,
        verified_at: null,
      }).eq("id", userId);
      toast.success("Verification removed");
      loadData();
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const handleSendMessage = async () => {
    if (!actionDialog.user || !messageContent.trim()) return;
    try {
      await supabase.from("notifications").insert({
        user_id: actionDialog.user.id,
        title: "Message from Admin",
        message: messageContent,
        type: "admin",
      });
      toast.success("Message sent");
      setMessageContent("");
      setActionDialog({ type: null, user: null });
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleBanUser = async () => {
    if (!actionDialog.user) return;
    try {
      await supabase.from("profiles").update({
        availability_status: "banned",
        verified_by_admin: false,
      }).eq("id", actionDialog.user.id);

      await supabase.from("notifications").insert({
        user_id: actionDialog.user.id,
        title: "Account Suspended",
        message: messageContent || "Your account has been suspended.",
        type: "account",
      });

      toast.success("User banned");
      setMessageContent("");
      loadData();
      setActionDialog({ type: null, user: null });
    } catch (error) {
      toast.error("Failed to ban user");
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      await supabase.from("profiles").update({ availability_status: "available" }).eq("id", userId);
      toast.success("User unbanned");
      loadData();
    } catch (error) {
      toast.error("Failed to unban");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = !searchQuery ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.user_id_number?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && u.verified_by_admin) ||
      (statusFilter === "unverified" && !u.verified_by_admin) ||
      (statusFilter === "online" && isRecentlyActive(u.last_seen)) ||
      (statusFilter === "banned" && u.availability_status === "banned");

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <AdminLayout title="Admin Dashboard" description="Loading...">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <SEOHead title="Admin Dashboard - SaskTask" description="User management" />
      <AdminLayout title="User Management" description="View and control all platform users">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" /> Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="glass-card border-green-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Verified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.verified}</div>
            </CardContent>
          </Card>
          <Card className="glass-card border-yellow-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Unverified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.unverified}</div>
            </CardContent>
          </Card>
          <Card className="glass-card border-emerald-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-600 flex items-center gap-2">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" /> Online Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{stats.online}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass-card mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={loadData} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Users ({filteredUsers.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredUsers.map((user) => {
                  const role = getUserRole(user.id);
                  const isBanned = user.availability_status === "banned";
                  const hasAdminRole = isUserAdmin(user.id);

                  return (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md ${
                        isBanned ? 'bg-red-500/5 border-red-500/20' : 'bg-background/50 hover:bg-background/80'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="h-12 w-12 border-2 border-background">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {user.full_name?.charAt(0) || user.email?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          {isRecentlyActive(user.last_seen) && (
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-background" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{user.full_name || "No Name"}</p>
                            {user.verified_by_admin && (
                              <ShieldCheck className="h-4 w-4 text-green-500" />
                            )}
                            {hasAdminRole && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                            {isBanned && (
                              <Badge variant="destructive" className="text-xs">Banned</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {user.user_id_number && (
                              <Badge variant="outline" className="text-xs">{user.user_id_number}</Badge>
                            )}
                            <Badge variant="secondary" className="text-xs capitalize">{role.replace('_', ' ')}</Badge>
                            {hasAdminRole && (
                              <Badge className="text-xs bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/30">Admin</Badge>
                            )}
                            {user.created_at && (
                              <span className="text-xs text-muted-foreground">
                                Joined {format(new Date(user.created_at), "MMM d, yyyy")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {/* Admin Role Management */}
                        {hasAdminRole ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActionDialog({ type: "revoke_admin", user })}
                            className="gap-1 text-yellow-600 hover:text-yellow-700 border-yellow-500/30"
                          >
                            <UserMinus className="h-3 w-3" /> Revoke Admin
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActionDialog({ type: "grant_admin", user })}
                            className="gap-1 text-yellow-600 hover:text-yellow-700 border-yellow-500/30"
                          >
                            <Crown className="h-3 w-3" /> Grant Admin
                          </Button>
                        )}
                        
                        {!user.verified_by_admin && !isBanned && (
                          <Button
                            size="sm"
                            onClick={() => setActionDialog({ type: "verify", user })}
                            className="gap-1"
                          >
                            <CheckCircle className="h-3 w-3" /> Verify
                          </Button>
                        )}
                        {user.verified_by_admin && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnverify(user.id)}
                            className="gap-1"
                          >
                            <XCircle className="h-3 w-3" /> Unverify
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActionDialog({ type: "message", user })}
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                        {isBanned ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnban(user.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <UserCheck className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActionDialog({ type: "ban", user })}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Ban className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No users found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Verify Dialog */}
        <Dialog open={actionDialog.type === "verify"} onOpenChange={() => setActionDialog({ type: null, user: null })}>
          <DialogContent className="glass-dialog">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" /> Verify User
              </DialogTitle>
              <DialogDescription>
                Verify {actionDialog.user?.full_name || actionDialog.user?.email}?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                This will mark the user as verified and they'll receive a notification.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog({ type: null, user: null })}>
                Cancel
              </Button>
              <Button onClick={handleVerifyUser} className="gap-2">
                <CheckCircle className="h-4 w-4" /> Verify User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Message Dialog */}
        <Dialog open={actionDialog.type === "message"} onOpenChange={() => setActionDialog({ type: null, user: null })}>
          <DialogContent className="glass-dialog">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" /> Send Message
              </DialogTitle>
              <DialogDescription>
                Send a notification to {actionDialog.user?.full_name || actionDialog.user?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Type your message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog({ type: null, user: null })}>
                Cancel
              </Button>
              <Button onClick={handleSendMessage} disabled={!messageContent.trim()}>
                Send Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ban Dialog */}
        <Dialog open={actionDialog.type === "ban"} onOpenChange={() => setActionDialog({ type: null, user: null })}>
          <DialogContent className="glass-dialog">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" /> Ban User
              </DialogTitle>
              <DialogDescription>
                Ban {actionDialog.user?.full_name || actionDialog.user?.email}?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Reason for ban (optional)..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog({ type: null, user: null })}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleBanUser}>
                <Ban className="h-4 w-4 mr-2" /> Ban User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Grant Admin Dialog */}
        <Dialog open={actionDialog.type === "grant_admin"} onOpenChange={() => setActionDialog({ type: null, user: null })}>
          <DialogContent className="glass-dialog">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-yellow-600">
                <Crown className="h-5 w-5" /> Grant Admin Access
              </DialogTitle>
              <DialogDescription>
                Grant admin access to {actionDialog.user?.full_name || actionDialog.user?.email}?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                This user will have full access to the admin dashboard and can manage other users, including granting/revoking admin roles.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog({ type: null, user: null })}>
                Cancel
              </Button>
              <Button onClick={handleGrantAdmin} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                <Crown className="h-4 w-4 mr-2" /> Grant Admin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Revoke Admin Dialog */}
        <Dialog open={actionDialog.type === "revoke_admin"} onOpenChange={() => setActionDialog({ type: null, user: null })}>
          <DialogContent className="glass-dialog">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-yellow-600">
                <UserMinus className="h-5 w-5" /> Revoke Admin Access
              </DialogTitle>
              <DialogDescription>
                Revoke admin access from {actionDialog.user?.full_name || actionDialog.user?.email}?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                This user will lose access to the admin dashboard and will no longer be able to manage other users.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog({ type: null, user: null })}>
                Cancel
              </Button>
              <Button onClick={handleRevokeAdmin} variant="destructive">
                <UserMinus className="h-4 w-4 mr-2" /> Revoke Admin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
}
