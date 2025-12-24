import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  message: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  readAt: string | null;
  status: string;
  replyToId: string | null;
  editedAt: string | null;
  deletedAt: string | null;
}

export const useEnhancedChat = (
  bookingId: string,
  currentUserId: string,
  otherUserId: string
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 50;

  const transformMessage = (data: any): Message => ({
    id: data.id,
    message: data.message,
    senderId: data.sender_id,
    receiverId: data.receiver_id,
    createdAt: data.created_at,
    readAt: data.read_at,
    status: data.status || "sent",
    replyToId: data.reply_to_id,
    editedAt: data.edited_at,
    deletedAt: data.deleted_at
  });

  const loadMessages = useCallback(async (beforeId?: string) => {
    try {
      let query = supabase
        .from("messages")
        .select("*")
        .eq("booking_id", bookingId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(pageSize);

      if (beforeId) {
        const { data: targetMsg } = await supabase
          .from("messages")
          .select("created_at")
          .eq("id", beforeId)
          .single();
          
        if (targetMsg) {
          query = query.lt("created_at", targetMsg.created_at);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      const transformed = (data || []).map(transformMessage).reverse();
      
      if (beforeId) {
        setMessages(prev => [...transformed, ...prev]);
      } else {
        setMessages(transformed);
      }

      setHasMore((data?.length || 0) === pageSize);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  const sendMessage = useCallback(async (
    content: string, 
    replyToId?: string
  ): Promise<boolean> => {
    if (!content.trim()) return false;

    setSending(true);
    const tempId = `temp-${Date.now()}`;

    // Optimistic update
    const optimisticMessage: Message = {
      id: tempId,
      message: content,
      senderId: currentUserId,
      receiverId: otherUserId,
      createdAt: new Date().toISOString(),
      readAt: null,
      status: "sending",
      replyToId: replyToId || null,
      editedAt: null,
      deletedAt: null
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          booking_id: bookingId,
          sender_id: currentUserId,
          receiver_id: otherUserId,
          message: content,
          reply_to_id: replyToId || null,
          status: "sent"
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic message with real one
      setMessages(prev => 
        prev.map(m => m.id === tempId ? transformMessage(data) : m)
      );

      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      // Mark as failed
      setMessages(prev => 
        prev.map(m => m.id === tempId ? { ...m, status: "failed" } : m)
      );
      return false;
    } finally {
      setSending(false);
    }
  }, [bookingId, currentUserId, otherUserId]);

  const editMessage = useCallback(async (messageId: string, newContent: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("messages")
        .update({ 
          message: newContent,
          edited_at: new Date().toISOString()
        })
        .eq("id", messageId)
        .eq("sender_id", currentUserId);

      if (error) throw error;

      setMessages(prev => 
        prev.map(m => m.id === messageId 
          ? { ...m, message: newContent, editedAt: new Date().toISOString() }
          : m
        )
      );

      return true;
    } catch (error) {
      console.error("Error editing message:", error);
      return false;
    }
  }, [currentUserId]);

  const deleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("messages")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", messageId)
        .eq("sender_id", currentUserId);

      if (error) throw error;

      setMessages(prev => prev.filter(m => m.id !== messageId));
      return true;
    } catch (error) {
      console.error("Error deleting message:", error);
      return false;
    }
  }, [currentUserId]);

  const markAsRead = useCallback(async () => {
    const unreadIds = messages
      .filter(m => m.receiverId === currentUserId && !m.readAt)
      .map(m => m.id);

    if (unreadIds.length === 0) return;

    try {
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .in("id", unreadIds);

      setMessages(prev => 
        prev.map(m => unreadIds.includes(m.id) 
          ? { ...m, readAt: new Date().toISOString() }
          : m
        )
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }, [messages, currentUserId]);

  // Real-time subscription
  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel(`messages-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`
        },
        (payload) => {
          const newMsg = transformMessage(payload.new);
          // Only add if not from us (we already have optimistic update)
          if (newMsg.senderId !== currentUserId) {
            setMessages(prev => [...prev, newMsg]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`
        },
        (payload) => {
          const updated = transformMessage(payload.new);
          setMessages(prev => 
            prev.map(m => m.id === updated.id ? updated : m)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, currentUserId, loadMessages]);

  return {
    messages,
    isLoading,
    isSending,
    hasMore,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    loadMore: () => {
      if (messages.length > 0) {
        loadMessages(messages[0].id);
      }
    }
  };
};
