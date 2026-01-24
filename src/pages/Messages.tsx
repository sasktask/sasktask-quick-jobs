import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Search, 
  User, 
  Loader2, 
  Archive, 
  Star, 
  Pin,
  Filter,
  Clock,
  CheckCheck,
  Image as ImageIcon,
  Mic,
  Paperclip,
  Bell,
  BellOff,
  Sparkles,
  ArrowUpDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { OnlineIndicator } from "@/components/OnlineIndicator";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";

interface Conversation {
  booking_id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  task_title: string;
  is_pinned: boolean;
  is_muted: boolean;
  last_message_type: 'text' | 'image' | 'voice' | 'file';
  is_read: boolean;
}

type SortOption = 'recent' | 'unread' | 'alphabetical';
type FilterOption = 'all' | 'unread' | 'pinned';

const Messages = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [pinnedConversations, setPinnedConversations] = useState<Set<string>>(new Set());

  const { isUserOnline } = useOnlinePresence(user?.id || "");

  useEffect(() => {
    checkUser();
  }, []);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages-list-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => loadConversations(user.id)
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        () => loadConversations(user.id)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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

      const validStatuses: ("accepted" | "in_progress" | "completed" | "pending")[] = 
        ['accepted', 'in_progress', 'completed', 'pending'];

      // Get bookings where user is task_doer
      const { data: doerBookings, error: doerError } = await supabase
        .from("bookings")
        .select(`
          id, task_id, task_doer_id, status, created_at,
          tasks ( id, title, task_giver_id )
        `)
        .eq("task_doer_id", userId)
        .in("status", validStatuses);

      if (doerError) throw doerError;

      // Get bookings where user is task_giver
      const { data: giverBookings, error: giverError } = await supabase
        .from("bookings")
        .select(`
          id, task_id, task_doer_id, status, created_at,
          tasks!inner ( id, title, task_giver_id )
        `)
        .eq("tasks.task_giver_id", userId)
        .in("status", validStatuses);

      if (giverError) throw giverError;

      const allBookings = [...(doerBookings || []), ...(giverBookings || [])];
      const uniqueBookings = allBookings.filter(
        (booking, index, self) => index === self.findIndex((b) => b.id === booking.id)
      );

      const conversationsData = await Promise.all(
        uniqueBookings.map(async (booking: any) => {
          const isTaskDoer = booking.task_doer_id === userId;
          const otherId = isTaskDoer
            ? booking.tasks?.task_giver_id
            : booking.task_doer_id;

          if (!otherId) return null;

          // Get last message with attachment info
          const { data: lastMessage } = await supabase
            .from("messages")
            .select("message, created_at, sender_id, read_at")
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

          // Get other user profile
          const { data: otherUser } = await supabase
            .from("public_profiles")
            .select("id, full_name, avatar_url")
            .eq("id", otherId)
            .maybeSingle();

          if (!lastMessage && !otherUser) return null;

          // Determine message type
          let messageType: 'text' | 'image' | 'voice' | 'file' = 'text';
          const msgContent = lastMessage?.message || '';
          if (msgContent.includes('📷')) messageType = 'image';
          else if (msgContent.includes('🎤')) messageType = 'voice';
          else if (msgContent.includes('📎')) messageType = 'file';

          return {
            booking_id: booking.id,
            other_user_id: otherId,
            other_user_name: otherUser?.full_name || "User",
            other_user_avatar: otherUser?.avatar_url || null,
            last_message: lastMessage?.message || "No messages yet",
            last_message_time: lastMessage?.created_at || booking.created_at,
            unread_count: unreadCount || 0,
            task_title: booking.tasks?.title || "Task",
            is_pinned: pinnedConversations.has(booking.id),
            is_muted: false,
            last_message_type: messageType,
            is_read: lastMessage?.sender_id === userId || !!lastMessage?.read_at,
          };
        })
      );

      const validConversations = conversationsData.filter(
        (conv): conv is Conversation => conv !== null
      );

      validConversations.sort(
        (a, b) =>
          new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
      );

      setConversations(validConversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const togglePin = (bookingId: string) => {
    setPinnedConversations(prev => {
      const next = new Set(prev);
      if (next.has(bookingId)) {
        next.delete(bookingId);
        toast.success("Conversation unpinned");
      } else {
        next.add(bookingId);
        toast.success("Conversation pinned");
      }
      return next;
    });
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, "HH:mm");
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMM d");
    }
  };

  const getMessagePreview = (conv: Conversation) => {
    switch (conv.last_message_type) {
      case 'image':
        return <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" /> Photo</span>;
      case 'voice':
        return <span className="flex items-center gap-1"><Mic className="h-3 w-3" /> Voice message</span>;
      case 'file':
        return <span className="flex items-center gap-1"><Paperclip className="h-3 w-3" /> File</span>;
      default:
        return conv.last_message;
    }
  };

  // Filtered and sorted conversations
  const displayedConversations = useMemo(() => {
    let result = [...conversations];

    // Apply filter
    if (filterBy === 'unread') {
      result = result.filter(c => c.unread_count > 0);
    } else if (filterBy === 'pinned') {
      result = result.filter(c => pinnedConversations.has(c.booking_id));
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        c =>
          c.other_user_name.toLowerCase().includes(query) ||
          c.task_title.toLowerCase().includes(query) ||
          c.last_message.toLowerCase().includes(query)
      );
    }

    // Apply sort
    switch (sortBy) {
      case 'unread':
        result.sort((a, b) => b.unread_count - a.unread_count);
        break;
      case 'alphabetical':
        result.sort((a, b) => a.other_user_name.localeCompare(b.other_user_name));
        break;
      default: // 'recent'
        result.sort((a, b) => 
          new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
        );
    }

    // Always show pinned at top
    const pinned = result.filter(c => pinnedConversations.has(c.booking_id));
    const unpinned = result.filter(c => !pinnedConversations.has(c.booking_id));
    return [...pinned, ...unpinned];
  }, [conversations, searchQuery, sortBy, filterBy, pinnedConversations]);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">Loading conversations...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <SEOHead
        title="Messages - Your Conversations"
        description="View and manage your conversations on SaskTask"
        url="/messages"
      />

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Messages
              </h1>
              {totalUnread > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <Badge variant="default" className="text-sm px-3 py-1">
                    {totalUnread} unread
                  </Badge>
                </motion.div>
              )}
            </div>
            <p className="text-muted-foreground">
              Your conversations with task givers and doers
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4 mb-6"
          >
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search conversations, tasks, or messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setSearchQuery("")}
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Filter Tabs & Sort */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <Tabs value={filterBy} onValueChange={(v) => setFilterBy(v as FilterOption)} className="w-auto">
                <TabsList className="bg-muted/50 backdrop-blur-sm">
                  <TabsTrigger value="all" className="gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    All
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Unread
                    {totalUnread > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 text-xs">
                        {totalUnread}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="pinned" className="gap-1.5">
                    <Pin className="h-3.5 w-3.5" />
                    Pinned
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Sort:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1"
                  onClick={() => {
                    const options: SortOption[] = ['recent', 'unread', 'alphabetical'];
                    const currentIndex = options.indexOf(sortBy);
                    setSortBy(options[(currentIndex + 1) % options.length]);
                  }}
                >
                  <ArrowUpDown className="h-3 w-3" />
                  {sortBy === 'recent' ? 'Recent' : sortBy === 'unread' ? 'Unread' : 'A-Z'}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Conversations List */}
          <AnimatePresence mode="popLayout">
            {displayedConversations.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="border-dashed">
                  <CardContent className="py-16 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery ? "No matches found" : filterBy === 'unread' ? "All caught up!" : "No conversations yet"}
                    </h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      {searchQuery
                        ? "Try adjusting your search terms"
                        : filterBy === 'unread' 
                          ? "You've read all your messages"
                          : "Start by accepting a booking to begin chatting"}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <ScrollArea className="h-[calc(100vh-380px)] pr-4">
                <div className="space-y-2">
                  {displayedConversations.map((conversation, index) => {
                    const isPinned = pinnedConversations.has(conversation.booking_id);
                    const isOnline = isUserOnline(conversation.other_user_id);

                    return (
                      <motion.div
                        key={conversation.booking_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.03 }}
                        layout
                      >
                        <Card
                          className={cn(
                            "group cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/30",
                            "bg-card/50 backdrop-blur-sm border-border/50",
                            conversation.unread_count > 0 && "border-l-4 border-l-primary bg-primary/5",
                            isPinned && "ring-1 ring-primary/20"
                          )}
                          onClick={() => navigate(`/chat/${conversation.booking_id}`)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              {/* Avatar with Online Status */}
                              <div className="relative shrink-0">
                                <Avatar className={cn(
                                  "h-14 w-14 ring-2 ring-background transition-transform group-hover:scale-105",
                                  isOnline && "ring-green-500/50"
                                )}>
                                  <AvatarImage src={conversation.other_user_avatar || undefined} />
                                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-lg font-semibold">
                                    {conversation.other_user_name[0]?.toUpperCase() || <User className="h-6 w-6" />}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1">
                                  <OnlineIndicator isOnline={isOnline} size="md" />
                                </div>
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <h4 className={cn(
                                      "font-semibold truncate",
                                      conversation.unread_count > 0 && "text-foreground"
                                    )}>
                                      {conversation.other_user_name}
                                    </h4>
                                    {isPinned && (
                                      <Pin className="h-3 w-3 text-primary shrink-0" />
                                    )}
                                    {isOnline && (
                                      <span className="text-[10px] text-green-600 font-medium shrink-0">
                                        Online
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className={cn(
                                      "text-xs",
                                      conversation.unread_count > 0 
                                        ? "text-primary font-medium" 
                                        : "text-muted-foreground"
                                    )}>
                                      {formatMessageTime(conversation.last_message_time)}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-sm text-muted-foreground mb-1.5 truncate flex items-center gap-1">
                                  <span className="opacity-60">•</span>
                                  {conversation.task_title}
                                </p>

                                <div className="flex items-center justify-between gap-2">
                                  <p className={cn(
                                    "text-sm truncate flex-1",
                                    conversation.unread_count > 0 
                                      ? "text-foreground font-medium" 
                                      : "text-muted-foreground"
                                  )}>
                                    {conversation.is_read && conversation.unread_count === 0 && (
                                      <CheckCheck className="inline h-3.5 w-3.5 mr-1 text-primary" />
                                    )}
                                    {getMessagePreview(conversation)}
                                  </p>
                                  
                                  <div className="flex items-center gap-2 shrink-0">
                                    {/* Action Buttons (visible on hover) */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          togglePin(conversation.booking_id);
                                        }}
                                      >
                                        <Pin className={cn("h-3.5 w-3.5", isPinned && "fill-current text-primary")} />
                                      </Button>
                                    </div>
                                    
                                    {/* Unread Badge */}
                                    {conversation.unread_count > 0 && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-primary text-primary-foreground text-xs font-bold"
                                      >
                                        {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                                      </motion.div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </AnimatePresence>

          {/* Stats Footer */}
          {conversations.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 pt-4 border-t flex items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" />
                {conversations.length} conversations
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Updated {formatDistanceToNow(new Date(), { addSuffix: true })}
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
