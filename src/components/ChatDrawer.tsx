import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

interface Conversation {
  bookingId: string;
  otherUser: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  taskTitle: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export const ChatDrawer = ({ isOpen, onClose, userId }: ChatDrawerProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [selectedOtherUserId, setSelectedOtherUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchConversations();
    }
  }, [isOpen, userId]);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      // Get user role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      const userRole = roleData?.role;
      setUserRole(userRole || null);

      // Fetch bookings with messages
      let query = supabase
        .from("bookings")
        .select(`
          id,
          task_doer_id,
          tasks!inner (
            id,
            title,
            task_giver_id,
            task_giver:profiles!tasks_task_giver_id_fkey (
              id,
              full_name,
              avatar_url
            )
          ),
          task_doer:profiles!bookings_task_doer_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .in("status", ["accepted", "in_progress"]);

      if (userRole === "task_giver") {
        query = query.eq("tasks.task_giver_id", userId);
      } else {
        query = query.eq("task_doer_id", userId);
      }

      const { data: bookings, error } = await query;

      if (error) throw error;

      // Get unread counts and last messages for each booking
      const conversationsWithMessages = await Promise.all(
        (bookings || []).map(async (booking) => {
          const otherUser = userRole === "task_giver"
            ? booking.task_doer
            : booking.tasks?.task_giver;

          // Get unread count
          const { count } = await supabase
            .from("messages")
            .select("*", { count: 'exact', head: true })
            .eq("booking_id", booking.id)
            .eq("receiver_id", userId)
            .is("read_at", null);

          // Get last message
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("message, created_at")
            .eq("booking_id", booking.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            bookingId: booking.id,
            otherUser: {
              id: otherUser?.id || "",
              full_name: otherUser?.full_name || "Unknown User",
              avatar_url: otherUser?.avatar_url
            },
            taskTitle: booking.tasks?.title || "Unknown Task",
            lastMessage: lastMsg?.message,
            lastMessageTime: lastMsg?.created_at,
            unreadCount: count || 0
          };
        })
      );

      // Sort by last message time
      conversationsWithMessages.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      });

      setConversations(conversationsWithMessages);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversationClick = (bookingId: string, otherUserId: string) => {
    setSelectedBooking(bookingId);
    setSelectedOtherUserId(otherUserId);
  };

  const handleBack = () => {
    setSelectedBooking(null);
    setSelectedOtherUserId(null);
    fetchConversations(); // Refresh to update unread counts
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4">
          {selectedBooking ? (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  console.log("ChatDrawer: back button clicked");
                  handleBack();
                }}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <SheetTitle>Chat</SheetTitle>
            </div>
          ) : (
            <SheetTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Messages
            </SheetTitle>
          )}
        </SheetHeader>

        <Separator />

        {selectedBooking && selectedOtherUserId ? (
          <div className="flex-1 overflow-hidden">
            <ChatInterface
              bookingId={selectedBooking}
              currentUserId={userId}
              otherUserId={selectedOtherUserId}
              otherUserName={conversations.find(c => c.bookingId === selectedBooking)?.otherUser.full_name || "User"}
              otherUserAvatar={conversations.find(c => c.bookingId === selectedBooking)?.otherUser.avatar_url}
              otherUserRole={userRole === "task_giver" ? "Task Doer" : "Task Giver"}
            />
          </div>
        ) : (
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="p-6 text-center text-muted-foreground">
                Loading conversations...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No conversations yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start by accepting a task booking
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {conversations.map((conv) => (
                  <button
                    key={conv.bookingId}
                    onClick={() => handleConversationClick(conv.bookingId, conv.otherUser.id)}
                    className="w-full p-4 hover:bg-accent/50 transition-colors text-left flex items-start gap-3"
                  >
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarImage
                        src={conv.otherUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.otherUser.full_name}`}
                        alt={conv.otherUser.full_name}
                      />
                      <AvatarFallback>{conv.otherUser.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold truncate">{conv.otherUser.full_name}</h4>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatTime(conv.lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-1">
                        {conv.taskTitle}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.lastMessage || "No messages yet"}
                        </p>
                        {conv.unreadCount > 0 && (
                          <Badge className="bg-primary text-primary-foreground shrink-0 h-5 w-5 p-0 flex items-center justify-center">
                            {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
};
