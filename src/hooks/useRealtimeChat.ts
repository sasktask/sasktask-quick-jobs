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

interface UseRealtimeChatProps {
  bookingId: string;
  currentUserId: string;
  otherUserId: string;
}

export const useRealtimeChat = ({ bookingId, currentUserId, otherUserId }: UseRealtimeChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial messages (don't mark as read immediately)
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

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
  const sendMessage = async (content: string) => {
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
    };

    // Optimistic update
    setMessages((prev) => [...prev, optimisticMessage]);
    setIsSending(true);

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          booking_id: bookingId,
          sender_id: currentUserId,
          receiver_id: otherUserId,
          message: content,
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id ? { ...data, status: "sent" } : msg
        )
      );

      // Stop typing indicator
      updateTypingStatus(false);

      return data;
    } catch (error: any) {
      console.error("Error sending message:", error);
      
      // Mark message as failed
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

    // Remove failed message
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

    // Resend
    await sendMessage(failedMessage.message);
  };

  // Update typing status
  const updateTypingStatus = async (typing: boolean) => {
    try {
      if (typing) {
        // Upsert typing indicator
        await supabase.from("typing_indicators").upsert({
          booking_id: bookingId,
          user_id: currentUserId,
          is_typing: true,
          last_typed_at: new Date().toISOString(),
        });
      } else {
        // Remove typing indicator
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

  // Handle user typing
  const handleTyping = () => {
    updateTypingStatus(true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus(false);
    }, 3000);
  };

  // Set up realtime subscriptions
  useEffect(() => {
    loadMessages();

    // Create channel for this booking
    const channel = supabase.channel(`chat:${bookingId}`);

    // Subscribe to new messages
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          console.log("New message received:", payload);
          const newMessage = payload.new as Message;
          
          // Only add if not from current user (avoid duplicates from optimistic update)
          if (newMessage.sender_id !== currentUserId) {
            setMessages((prev) => [...prev, { ...newMessage, status: "sent" }]);
            
            // Mark as read if chat is open
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
          console.log("Message updated:", payload);
          const updatedMessage = payload.new as Message;
          // If message was soft-deleted, remove it from the list
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
          console.log("Typing indicator updated:", payload);
          const indicator = payload.new as any;
          
          // Only show typing for other user
          if (indicator.user_id !== currentUserId) {
            setIsTyping(indicator.is_typing);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Cleanup
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
    isTyping,
    isLoading,
    isSending,
    sendMessage,
    retryMessage,
    handleTyping,
    markMessagesAsRead,
  };
};
