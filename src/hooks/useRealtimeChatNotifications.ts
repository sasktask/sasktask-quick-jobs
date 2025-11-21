import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Notification sound - simple beep using Web Audio API
const playNotificationSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = "sine";
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
};

export const useRealtimeChatNotifications = (userId: string) => {
  const { toast } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // Fetch initial unread count
    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", userId)
        .is("read_at", null);
      
      setUnreadCount(count || 0);
    };

    fetchUnreadCount();

    // Subscribe to new messages
    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`
        },
        async (payload) => {
          console.log("New message received:", payload);
          
          // Fetch sender info
          const { data: sender } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", payload.new.sender_id)
            .single();

          // Show toast notification
          toast({
            title: `💬 New message from ${sender?.full_name || "Someone"}`,
            description: payload.new.message.substring(0, 100) + (payload.new.message.length > 100 ? "..." : ""),
            duration: 5000,
          });

          // Play sound if enabled
          if (soundEnabled) {
            playNotificationSound();
          }

          // Update unread count
          setUnreadCount(prev => prev + 1);

          // Show browser notification if permitted
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`New message from ${sender?.full_name || "Someone"}`, {
              body: payload.new.message.substring(0, 100),
              icon: sender?.avatar_url || "/pwa-icon-192.png",
              tag: "new-message",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, toast, soundEnabled]);

  // Function to mark messages as read
  const markAsRead = async (messageIds: string[]) => {
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .in("id", messageIds);
    
    setUnreadCount(prev => Math.max(0, prev - messageIds.length));
  };

  return {
    unreadCount,
    soundEnabled,
    setSoundEnabled,
    markAsRead
  };
};
