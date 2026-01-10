import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Search, User, Loader2, Archive, Ban, Undo2, PhoneOff, ExternalLink } from "lucide-react";
import { ChatInterface } from "@/components/chat/ChatInterface";

interface Conversation {
  booking_id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar: string | null;
  task_giver_id?: string | null;
  task_doer_id?: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  task_title: string;
}

const Messages = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
  const [mutedIds, setMutedIds] = useState<Set<string>>(new Set());
  const reloadTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  // Debounced reload helper
  const scheduleReload = (fn: () => void, delay = 300) => {
    if (reloadTimer.current) clearTimeout(reloadTimer.current);
    reloadTimer.current = setTimeout(fn, delay);
  };

  useEffect(() => {
    const blocked = localStorage.getItem("messages_blocked_users");
    const archived = localStorage.getItem("messages_archived_bookings");
    const muted = localStorage.getItem("messages_muted_users");
    if (blocked) setBlockedIds(new Set(JSON.parse(blocked)));
    if (archived) setArchivedIds(new Set(JSON.parse(archived)));
    if (muted) setMutedIds(new Set(JSON.parse(muted)));
  }, []);

  const persistSets = (key: string, value: Set<string>) => {
    localStorage.setItem(key, JSON.stringify(Array.from(value)));
  };

  const toggleBlock = (userId: string) => {
    setBlockedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      persistSets("messages_blocked_users", next);
      return next;
    });
  };

  const toggleArchive = (bookingId: string) => {
    setArchivedIds((prev) => {
      const next = new Set(prev);
      if (next.has(bookingId)) next.delete(bookingId);
      else next.add(bookingId);
      persistSets("messages_archived_bookings", next);
      return next;
    });
  };

  const toggleMute = (userId: string) => {
    setMutedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      persistSets("messages_muted_users", next);
      return next;
    });
  };

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Please sign in to view messages");
        navigate("/auth");
        return;
      }

      setUser(session.user);
    } catch (error) {
      console.error("Error checking user:", error);
      toast.error("Failed to load messages");
    }
  };

  const fetchConversations = async (userId: string): Promise<Conversation[]> => {
    // Valid statuses for chat (accepted, in_progress, completed, pending - not cancelled/rejected)
    const validStatuses: ("accepted" | "in_progress" | "completed" | "pending")[] = ['accepted', 'in_progress', 'completed', 'pending'];

    const { data: doerBookings, error: doerError } = await supabase
      .from("bookings")
      .select(
        `
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
      `
      )
      .eq("task_doer_id", userId)
      .in("status", validStatuses);

    if (doerError) throw doerError;

    const { data: giverBookings, error: giverError } = await supabase
      .from("bookings")
      .select(
        `
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
      `
      )
      .eq("tasks.task_giver_id", userId)
      .in("status", validStatuses);

    if (giverError) throw giverError;

    const allBookings = [...(doerBookings || []), ...(giverBookings || [])];
    const uniqueBookings = allBookings.filter(
      (booking, index, self) =>
        index === self.findIndex((b) => b.id === booking.id)
    );

    const conversationsData = await Promise.all(
      uniqueBookings.map(async (booking: any) => {
        const isTaskDoer = booking.task_doer_id === userId;
        const otherId = isTaskDoer
          ? booking.tasks?.task_giver_id
          : booking.task_doer_id;

        if (!otherId) {
          console.log("Skipping booking - no valid other user ID:", booking.id);
          return null;
        }

        const { data: lastMessage } = await supabase
          .from("messages")
          .select("message, created_at")
          .eq("booking_id", booking.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        const { count: unreadCount } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("booking_id", booking.id)
          .eq("receiver_id", userId)
          .is("read_at", null);

        const { data: otherUser, error: profileError } = await supabase
          .from("public_profiles")
          .select("id, full_name, avatar_url")
          .eq("id", otherId)
          .maybeSingle();

        if (profileError) {
          console.log("Error fetching profile for user:", otherId, profileError);
        }

        if (!lastMessage && !otherUser) {
          return null;
        }

        return {
          booking_id: booking.id,
          other_user_id: otherId,
          other_user_name: otherUser?.full_name || "User",
          other_user_avatar: otherUser?.avatar_url || null,
          task_giver_id: booking.tasks?.task_giver_id,
          task_doer_id: booking.task_doer_id,
          last_message: lastMessage?.message || "No messages yet",
          last_message_time: lastMessage?.created_at || booking.created_at,
          unread_count: unreadCount || 0,
          task_title: booking.tasks?.title || "Task",
        } as Conversation;
      })
    );

    const validConversations = conversationsData.filter((conv) => !!conv) as Conversation[];

    validConversations.sort(
      (a, b) =>
        new Date(b.last_message_time).getTime() -
        new Date(a.last_message_time).getTime()
    );

    return validConversations;
  };

  const {
    data: conversations = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["conversations", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];
      return fetchConversations(user.id);
    },
  });

  // Set up real-time subscription for new messages with debounce
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages-list-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => scheduleReload(refetch)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        () => scheduleReload(refetch)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    return conversations.filter(
      (conv) =>
        conv.other_user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.task_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.last_message.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const visibleConversations = useMemo(
    () =>
      filteredConversations.filter(
        (c) => !blockedIds.has(c.other_user_id) && !archivedIds.has(c.booking_id)
      ),
    [filteredConversations, blockedIds, archivedIds]
  );

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
  };

  const selectedOtherRole =
    selectedConversation && selectedConversation.task_giver_id && selectedConversation.task_doer_id
      ? selectedConversation.other_user_id === selectedConversation.task_doer_id
        ? "Task Doer"
        : "Task Giver"
      : "Task Doer";

  return (
    <DashboardLayout>
      <SEOHead
        title="Messages - Your Conversations"
        description="View and manage your conversations on SaskTask"
        url="/messages"
      />

      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[320px,1fr,320px]">
          {/* Sidebar */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Messages</h1>
              <p className="text-muted-foreground text-sm">
                Select a conversation to view and reply
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
            {visibleConversations.length === 0 ? (
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
                {visibleConversations.map((conversation) => (
                  <Card
                    key={conversation.booking_id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleSelectConversation(conversation)}
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

          {/* Chat panel */}
          <div className="min-h-[500px]">
            {selectedConversation ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedConversation.other_user_avatar || undefined} />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-semibold">{selectedConversation.other_user_name}</h2>
                      <p className="text-sm text-muted-foreground">@{selectedConversation.other_user_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleArchive(selectedConversation.booking_id)}
                    >
                      <Archive className="h-4 w-4 mr-1" />
                      {archivedIds.has(selectedConversation.booking_id) ? "Unarchive" : "Archive"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleMute(selectedConversation.other_user_id)}
                    >
                      {mutedIds.has(selectedConversation.other_user_id) ? "Unmute" : "Mute"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-400"
                      onClick={() => toggleBlock(selectedConversation.other_user_id)}
                    >
                      {blockedIds.has(selectedConversation.other_user_id) ? (
                        <>
                          <Undo2 className="h-4 w-4 mr-1" /> Unblock
                        </>
                      ) : (
                        <>
                          <Ban className="h-4 w-4 mr-1" /> Block
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <ChatInterface
                  bookingId={selectedConversation.booking_id}
                  currentUserId={user?.id}
                  otherUserId={selectedConversation.other_user_id}
                  otherUserName={selectedConversation.other_user_name}
                  otherUserAvatar={selectedConversation.other_user_avatar || undefined}
                  otherUserRole={selectedOtherRole as any}
                />
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                  <p>Select a conversation to start chatting.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Details panel */}
          <div className="space-y-4">
            {selectedConversation ? (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedConversation.other_user_avatar || undefined} />
                      <AvatarFallback>
                        <User className="h-7 w-7" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{selectedConversation.other_user_name}</h3>
                      <p className="text-sm text-muted-foreground">@{selectedConversation.other_user_id}</p>
                      <p className="text-sm text-green-600">Active now</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <PhoneOff className="h-4 w-4" />
                    Calling is disabled
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">
                      {selectedConversation.task_title || "View task"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-between"
                      onClick={() => toggleArchive(selectedConversation.booking_id)}
                    >
                      Archive chat
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-between"
                      onClick={() => toggleMute(selectedConversation.other_user_id)}
                    >
                      {mutedIds.has(selectedConversation.other_user_id) ? "Unmute" : "Mute"} notifications
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-between text-red-500 hover:text-red-400"
                      onClick={() => toggleBlock(selectedConversation.other_user_id)}
                    >
                      {blockedIds.has(selectedConversation.other_user_id) ? "Unblock user" : "Block user"}
                    </Button>
                  </div>

                  <Button variant="destructive" className="w-full">
                    Report chat
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Select a conversation to view details.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
