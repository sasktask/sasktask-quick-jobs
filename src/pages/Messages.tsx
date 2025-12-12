import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, User, Loader2 } from "lucide-react";

interface Conversation {
  booking_id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  task_title: string;
}

const Messages = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = conversations.filter(
        (conv) =>
          conv.other_user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.task_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.last_message.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to view messages");
        navigate("/auth");
        return;
      }

      setUser(session.user);
      await loadConversations(session.user.id);
    } catch (error) {
      console.error("Error checking user:", error);
      toast.error("Failed to load messages");
    }
  };

  const loadConversations = async (userId: string) => {
    try {
      setLoading(true);

      // Valid statuses for chat (accepted, in_progress, completed, pending - not cancelled/rejected)
      const validStatuses: ("accepted" | "in_progress" | "completed" | "pending")[] = ['accepted', 'in_progress', 'completed', 'pending'];

      // Get bookings where user is task_doer
      const { data: doerBookings, error: doerError } = await supabase
        .from("bookings")
        .select(`
          id,
          task_id,
          task_doer_id,
          status,
          created_at,
          tasks (
            id,
            title,
            task_giver_id
          )
        `)
        .eq("task_doer_id", userId)
        .in("status", validStatuses);

      if (doerError) throw doerError;

      // Get bookings where user is task_giver (via tasks table)
      const { data: giverBookings, error: giverError } = await supabase
        .from("bookings")
        .select(`
          id,
          task_id,
          task_doer_id,
          status,
          created_at,
          tasks!inner (
            id,
            title,
            task_giver_id
          )
        `)
        .eq("tasks.task_giver_id", userId)
        .in("status", validStatuses);

      if (giverError) throw giverError;

      // Combine and deduplicate bookings
      const allBookings = [...(doerBookings || []), ...(giverBookings || [])];
      const uniqueBookings = allBookings.filter(
        (booking, index, self) =>
          index === self.findIndex((b) => b.id === booking.id)
      );

      // For each booking, get last message and unread count
      const conversationsData = await Promise.all(
        uniqueBookings.map(async (booking: any) => {
          // Determine the other user ID based on current user's role
          const isTaskDoer = booking.task_doer_id === userId;
          const otherId = isTaskDoer
            ? booking.tasks?.task_giver_id
            : booking.task_doer_id;

          // Skip if no valid other user ID
          if (!otherId) {
            console.log("Skipping booking - no valid other user ID:", booking.id);
            return null;
          }

          // Get last message
          const { data: lastMessage } = await supabase
            .from("messages")
            .select("message, created_at")
            .eq("booking_id", booking.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("booking_id", booking.id)
            .eq("receiver_id", userId)
            .is("read_at", null);

          // Get other user profile using public_profiles view (accessible to all)
          const { data: otherUser, error: profileError } = await supabase
            .from("public_profiles")
            .select("id, full_name, avatar_url")
            .eq("id", otherId)
            .single();

          if (profileError) {
            console.log("Error fetching profile for user:", otherId, profileError);
          }

          return {
            booking_id: booking.id,
            other_user_id: otherId,
            other_user_name: otherUser?.full_name || "User",
            other_user_avatar: otherUser?.avatar_url || null,
            last_message: lastMessage?.message || "No messages yet",
            last_message_time: lastMessage?.created_at || booking.created_at,
            unread_count: unreadCount || 0,
            task_title: booking.tasks?.title || "Task",
          };
        })
      );

      // Filter out null entries
      const validConversations = conversationsData.filter((conv): conv is Conversation => conv !== null);

      // Sort by last message time
      validConversations.sort(
        (a, b) =>
          new Date(b.last_message_time).getTime() -
          new Date(a.last_message_time).getTime()
      );

      setConversations(validConversations);
      setFilteredConversations(validConversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Messages - Your Conversations"
        description="View and manage your conversations on SaskTask"
        url="/messages"
      />
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Messages</h1>
              <p className="text-muted-foreground">
                Your conversations with task givers and doers
              </p>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Conversations List */}
            {filteredConversations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "No conversations match your search"
                      : "Start by accepting a booking to begin chatting"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map((conversation) => (
                  <Card
                    key={conversation.booking_id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/chat/${conversation.booking_id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={conversation.other_user_avatar || undefined} />
                          <AvatarFallback>
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-semibold truncate">
                              {conversation.other_user_name}
                            </h4>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {conversation.last_message_time 
                                ? format(new Date(conversation.last_message_time), "MMM d, HH:mm")
                                : ""}
                            </span>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-1 truncate">
                            {conversation.task_title}
                          </p>
                          
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm truncate flex-1">
                              {conversation.last_message}
                            </p>
                            {conversation.unread_count > 0 && (
                              <Badge variant="default" className="shrink-0">
                                {conversation.unread_count}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Messages;
