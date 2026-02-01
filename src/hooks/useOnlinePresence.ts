import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface PresenceState {
  [key: string]: {
    user_id: string;
    online_at: string;
  }[];
}

// Heartbeat interval in milliseconds (30 seconds)
const HEARTBEAT_INTERVAL = 30 * 1000;

export const useOnlinePresence = (userId: string | undefined) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  // Update last_seen timestamp in the database
  const updateLastSeen = useCallback(async (isOnline: boolean) => {
    if (!userId) return;
    
    try {
      await supabase
        .from("profiles")
        .update({ 
          is_online: isOnline, 
          last_seen: new Date().toISOString() 
        })
        .eq("id", userId);
    } catch (error) {
      console.error("Failed to update last_seen:", error);
    }
  }, [userId]);

  // Start heartbeat interval
  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }
    
    // Initial update
    updateLastSeen(true);
    
    // Set up periodic heartbeat
    heartbeatRef.current = setInterval(() => {
      if (isActiveRef.current) {
        updateLastSeen(true);
      }
    }, HEARTBEAT_INTERVAL);
  }, [updateLastSeen]);

  // Stop heartbeat and mark offline
  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    updateLastSeen(false);
  }, [updateLastSeen]);

  useEffect(() => {
    if (!userId) return;

    const presenceChannel = supabase.channel("online-users", {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState() as PresenceState;
        const users = new Set<string>();
        Object.values(state).forEach((presences) => {
          presences.forEach((p) => users.add(p.user_id));
        });
        setOnlineUsers(users);
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        setOnlineUsers((prev) => {
          const updated = new Set(prev);
          newPresences.forEach((p: any) => updated.add(p.user_id));
          return updated;
        });
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        setOnlineUsers((prev) => {
          const updated = new Set(prev);
          leftPresences.forEach((p: any) => updated.delete(p.user_id));
          return updated;
        });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
          
          // Start heartbeat when subscribed
          startHeartbeat();
        }
      });

    setChannel(presenceChannel);

    // Handle page visibility changes
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "hidden") {
        isActiveRef.current = false;
        // Don't stop heartbeat immediately, just mark as inactive
        // This allows for quick tab switches without losing online status
      } else {
        isActiveRef.current = true;
        await presenceChannel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
        });
        updateLastSeen(true);
      }
    };

    // Handle before unload - mark offline when closing browser/tab
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable offline marking on page close
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`;
      const data = JSON.stringify({ 
        is_online: false, 
        last_seen: new Date().toISOString() 
      });
      
      navigator.sendBeacon(url, new Blob([data], { type: 'application/json' }));
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup on unmount
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      
      // Stop heartbeat and mark offline
      stopHeartbeat();
      supabase.removeChannel(presenceChannel);
    };
  }, [userId, startHeartbeat, stopHeartbeat, updateLastSeen]);

  const isUserOnline = useCallback(
    (checkUserId: string) => onlineUsers.has(checkUserId),
    [onlineUsers]
  );

  return { onlineUsers, isUserOnline };
};
