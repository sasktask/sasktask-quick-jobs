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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
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
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    type: "verify" | "ban" | "message" | null;
    user: User | null;
  }>({ type: null, user: null });
  const [messageContent, setMessageContent] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    online: 0,
    newThisMonth: 0,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setUsers(data || []);
      
      // Calculate stats
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      setStats({
        total: data?.length || 0,
        verified: data?.filter(u => u.verified_by_admin).length || 0,
        online: data?.filter(u => u.is_online).length || 0,
        newThisMonth: data?.filter(u => 
          u.created_at && new Date(u.created_at) >= startOfMonth
        ).length || 0,
      });
    } catch (error: any) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
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

      toast.success("User verified successfully");
      loadUsers();
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
      loadUsers();
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
        title: "Message from Admin",
        message: messageContent,
        type: "admin",
      });

      if (error) throw error;

      toast.success("Notification sent successfully");
      setMessageContent("");
      setActionDialog({ type: null, user: null });
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      !searchQuery ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <SEOHead title="User Management - Admin" description="Manage platform users" />
      <AdminLayout title="User Management" description="View and manage all platform users">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Verified Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Online Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.online}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                New This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.newThisMonth}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
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
                  <TableHead>Status</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Trust Score</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
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
                          <span className="font-medium">{user.full_name || "No name"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
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
                          <Badge variant={user.trust_score >= 70 ? "default" : "secondary"}>
                            {user.trust_score}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
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
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setActionDialog({ type: "message", user })}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Send Notification
                            </DropdownMenuItem>
                            {user.verified_by_admin ? (
                              <DropdownMenuItem
                                onClick={() => handleUnverifyUser(user.id)}
                                className="text-orange-600"
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Remove Verification
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => setActionDialog({ type: "verify", user })}
                                className="text-green-600"
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Verify User
                              </DropdownMenuItem>
                            )}
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
        <Dialog
          open={actionDialog.type === "verify"}
          onOpenChange={() => setActionDialog({ type: null, user: null })}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify User</DialogTitle>
              <DialogDescription>
                Are you sure you want to verify {actionDialog.user?.full_name || "this user"}? 
                This will mark them as admin-verified.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog({ type: null, user: null })}>
                Cancel
              </Button>
              <Button onClick={handleVerifyUser}>
                <Shield className="h-4 w-4 mr-2" />
                Verify User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Send Notification Dialog */}
        <Dialog
          open={actionDialog.type === "message"}
          onOpenChange={() => {
            setActionDialog({ type: null, user: null });
            setMessageContent("");
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Notification</DialogTitle>
              <DialogDescription>
                Send a notification to {actionDialog.user?.full_name || "this user"}
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Enter your message..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={4}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setActionDialog({ type: null, user: null });
                  setMessageContent("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSendNotification} disabled={!messageContent.trim()}>
                <Mail className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
}
