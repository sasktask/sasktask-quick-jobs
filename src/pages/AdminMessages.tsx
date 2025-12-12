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
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  Users,
  Send,
  Search,
  Bell,
} from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  message: string;
  created_at: string;
  sender: { full_name: string | null; email: string } | null;
  receiver: { full_name: string | null; email: string } | null;
  booking: { tasks: { title: string } | null } | null;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [broadcastDialog, setBroadcastDialog] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [stats, setStats] = useState({
    totalMessages: 0,
    activeConversations: 0,
    messagesThisWeek: 0,
  });

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          id,
          message,
          created_at,
          sender_id,
          receiver_id,
          booking_id
        `)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      setMessages((data || []).map(m => ({
        ...m,
        sender: null,
        receiver: null,
        booking: null,
      })) as any);

      // Calculate stats
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const uniqueBookings = new Set((data || []).map(m => m.booking_id)).size;
      const messagesThisWeek = (data || []).filter(m => new Date(m.created_at) >= weekAgo).length;

      setStats({
        totalMessages: data?.length || 0,
        activeConversations: uniqueBookings,
        messagesThisWeek,
      });
    } catch (error: any) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim() || !broadcastTitle.trim()) {
      toast.error("Please enter both title and message");
      return;
    }

    try {
      // Get all users
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id");

      if (usersError) throw usersError;

      // Create notifications for all users
      const notifications = (users || []).map(user => ({
        user_id: user.id,
        title: broadcastTitle,
        message: broadcastMessage,
        type: "admin_broadcast",
      }));

      const { error: notifyError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (notifyError) throw notifyError;

      toast.success(`Broadcast sent to ${users?.length || 0} users`);
      setBroadcastDialog(false);
      setBroadcastMessage("");
      setBroadcastTitle("");
    } catch (error: any) {
      console.error("Error broadcasting:", error);
      toast.error("Failed to send broadcast");
    }
  };

  const filteredMessages = messages.filter(
    (m) =>
      !searchQuery ||
      m.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sender?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.receiver?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <SEOHead title="Message Monitoring - Admin" description="Monitor platform messages" />
      <AdminLayout title="Message Monitoring" description="Monitor and manage platform communications">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Total Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMessages}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Active Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.activeConversations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Send className="h-4 w-4" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.messagesThisWeek}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setBroadcastDialog(true)}>
            <Bell className="h-4 w-4 mr-2" />
            Broadcast to All Users
          </Button>
        </div>

        {/* Messages Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading messages...
                    </TableCell>
                  </TableRow>
                ) : filteredMessages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No messages found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMessages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {format(new Date(message.created_at), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>{message.sender?.full_name || "Unknown"}</TableCell>
                      <TableCell>{message.receiver?.full_name || "Unknown"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="max-w-[150px] truncate">
                          {message.booking?.tasks?.title || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {message.message}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Broadcast Dialog */}
        <Dialog open={broadcastDialog} onOpenChange={setBroadcastDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Broadcast to All Users</DialogTitle>
              <DialogDescription>
                Send a notification to all registered users on the platform.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Notification title..."
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Enter your message..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBroadcastDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleBroadcast}>
                <Send className="h-4 w-4 mr-2" />
                Send Broadcast
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
}
