import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TypingUser {
  userId: string;
  userName: string;
  timestamp: number;
}

export const useTypingIndicator = (
  bookingId: string,
  currentUserId: string,
  currentUserName: string
) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const TYPING_TIMEOUT = 3000; // 3 seconds
  const DEBOUNCE_MS = 500; // Debounce updates

  const broadcastTyping = useCallback(async (isTyping: boolean) => {
    const now = Date.now();
    if (now - lastUpdateRef.current < DEBOUNCE_MS && isTyping) {
      return;
    }
    lastUpdateRef.current = now;

    try {
      const channel = supabase.channel(`typing:${bookingId}`);
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId: currentUserId,
          userName: currentUserName,
          isTyping,
          timestamp: now
        }
      });
    } catch (error) {
      console.log("Failed to broadcast typing status:", error);
    }
  }, [bookingId, currentUserId, currentUserName]);

  const startTyping = useCallback(() => {
    broadcastTyping(true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after inactivity
    typingTimeoutRef.current = setTimeout(() => {
      broadcastTyping(false);
    }, TYPING_TIMEOUT);
  }, [broadcastTyping]);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    broadcastTyping(false);
  }, [broadcastTyping]);

  useEffect(() => {
    const channel = supabase.channel(`typing:${bookingId}`);

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId === currentUserId) return;

        if (payload.isTyping) {
          setTypingUsers(prev => {
            const exists = prev.some(u => u.userId === payload.userId);
            if (exists) {
              return prev.map(u => 
                u.userId === payload.userId 
                  ? { ...u, timestamp: payload.timestamp }
                  : u
              );
            }
            return [...prev, {
              userId: payload.userId,
              userName: payload.userName,
              timestamp: payload.timestamp
            }];
          });
        } else {
          setTypingUsers(prev => 
            prev.filter(u => u.userId !== payload.userId)
          );
        }
      })
      .subscribe();

    // Cleanup stale typing indicators
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => 
        prev.filter(u => now - u.timestamp < TYPING_TIMEOUT * 2)
      );
    }, 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(cleanupInterval);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [bookingId, currentUserId]);

  return {
    typingUsers,
    startTyping,
    stopTyping,
    isOtherUserTyping: typingUsers.length > 0
  };
};
