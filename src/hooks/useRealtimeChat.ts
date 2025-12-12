import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RealtimeChannel } from "@supabase/supabase-js";

interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  read_at: string | null;
  status: string;
  reply_to_id?: string | null;
  edited_at?: string | null;
  deleted_at?: string | null;
}

interface Attachment {
  id: string;
  message_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  attachment_type: string;
  duration?: number;
}

interface UseRealtimeChatProps {
  bookingId: string;
  currentUserId: string;
  otherUserId: string;
  pageSize?: number;
}

export const useRealtimeChat = ({ 
  bookingId, 
  currentUserId, 
  otherUserId,
  pageSize = 50 
}: UseRealtimeChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<Record<string, Attachment[]>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load messages with pagination
  const loadMessages = useCallback(async (loadMore = false) => {
    try {
      if (!loadMore) setIsLoading(true);
      
      const offset = loadMore ? (page + 1) * pageSize : 0;
      
      const { data, error, count } = await supabase
        .from("messages")
        .select("*", { count: "exact" })
        .eq("booking_id", bookingId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;

      const messagesData = (data || []).reverse();
      
      if (loadMore) {
        setMessages((prev) => [...messagesData, ...prev]);
        setPage((p) => p + 1);
      } else {
        setMessages(messagesData);
      }

      setHasMore((count || 0) > offset + pageSize);

      // Batch load attachments for all messages
      if (messagesData.length > 0) {
        const messageIds = messagesData.map((m) => m.id);
        await loadAttachmentsBatch(messageIds);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, page, pageSize]);

  // Batch load attachments for multiple messages
  const loadAttachmentsBatch = async (messageIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from("message_attachments")
        .select("*")
        .in("message_id", messageIds);

      if (error) throw error;

      const attachmentMap: Record<string, Attachment[]> = {};
      (data || []).forEach((att) => {
        if (!attachmentMap[att.message_id]) {
          attachmentMap[att.message_id] = [];
        }
        attachmentMap[att.message_id].push(att);
      });

      setAttachments((prev) => ({ ...prev, ...attachmentMap }));
    } catch (error) {
      console.error("Error loading attachments:", error);
    }
  };

  // Load more messages (pagination)
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMessages(true);
    }
  }, [hasMore, isLoading, loadMessages]);

  // Mark messages as read
  const markMessagesAsRead = async () => {
    try {
      const { error } = await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("booking_id", bookingId)
        .eq("receiver_id", currentUserId)
        .is("read_at", null);

      if (error) throw error;
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // Send message with optimistic update
  const sendMessage = async (content: string, replyToId?: string) => {
    if (!content.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      booking_id: bookingId,
      sender_id: currentUserId,
      receiver_id: otherUserId,
      message: content,
      created_at: new Date().toISOString(),
      read_at: null,
      status: "sending",
      reply_to_id: replyToId,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setIsSending(true);

    try {
      const insertData: any = {
        booking_id: bookingId,
        sender_id: currentUserId,
        receiver_id: otherUserId,
        message: content,
      };
      
      if (replyToId) {
        insertData.reply_to_id = replyToId;
      }

      const { data, error } = await supabase
        .from("messages")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id ? { ...data, status: "sent" } : msg
        )
      );

      // Trigger push notification for offline users
      try {
        await supabase.functions.invoke("notify-offline-message", {
          body: {
            messageId: data.id,
            receiverId: otherUserId,
            senderName: "You have a new message",
            messagePreview: content,
            bookingId: bookingId,
          },
        });
      } catch (pushError) {
        console.log("Push notification skipped:", pushError);
      }

      updateTypingStatus(false);
      return data;
    } catch (error: any) {
      console.error("Error sending message:", error);
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id ? { ...msg, status: "failed" } : msg
        )
      );

      toast.error("Failed to send message. Click to retry.");
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  // Retry failed message
  const retryMessage = async (messageId: string) => {
    const failedMessage = messages.find((msg) => msg.id === messageId);
    if (!failedMessage) return;

    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    await sendMessage(failedMessage.message, failedMessage.reply_to_id || undefined);
  };

  // Update typing status
  const updateTypingStatus = async (typing: boolean) => {
    try {
      if (typing) {
        await supabase.from("typing_indicators").upsert({
          booking_id: bookingId,
          user_id: currentUserId,
          is_typing: true,
          last_typed_at: new Date().toISOString(),
        });
      } else {
        await supabase
          .from("typing_indicators")
          .update({ is_typing: false })
          .eq("booking_id", bookingId)
          .eq("user_id", currentUserId);
      }
    } catch (error) {
      console.error("Error updating typing status:", error);
    }
  };

  // Handle user typing with debounce
  const handleTyping = useCallback(() => {
    updateTypingStatus(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus(false);
    }, 3000);
  }, [bookingId, currentUserId]);

  // Set up realtime subscriptions
  useEffect(() => {
    loadMessages();

    const channel = supabase.channel(`chat:${bookingId}`);

    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `booking_id=eq.${bookingId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          
          if (newMessage.sender_id !== currentUserId) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.id === newMessage.id)) return prev;
              return [...prev, { ...newMessage, status: "delivered" }];
            });
            
            // Load attachments for new message
            loadAttachmentsBatch([newMessage.id]);
            markMessagesAsRead();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          
          if (updatedMessage.deleted_at) {
            setMessages((prev) => prev.filter((msg) => msg.id !== updatedMessage.id));
          } else {
            setMessages((prev) =>
              prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "typing_indicators",
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          const indicator = payload.new as any;
          
          if (indicator.user_id !== currentUserId) {
            setIsTyping(indicator.is_typing);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      updateTypingStatus(false);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [bookingId, currentUserId, otherUserId]);

  return {
    messages,
    attachments,
    isTyping,
    isLoading,
    isSending,
    hasMore,
    sendMessage,
    retryMessage,
    handleTyping,
    markMessagesAsRead,
    loadMore,
  };
};
