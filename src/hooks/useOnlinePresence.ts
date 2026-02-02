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
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isActiveRef = useRef(true);

  // Update last_seen timestamp in the database
  const updateLastSeen = useCallback(async (isOnline: boolean) => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          is_online: isOnline, 
          last_seen: new Date().toISOString() 
        })
        .eq("id", userId);
      
      if (error) {
        console.error("Failed to update last_seen:", error);
      } else {
        console.log(`[Presence] Updated: is_online=${isOnline}, time=${new Date().toISOString()}`);
      }
    } catch (error) {
      console.error("Failed to update last_seen:", error);
    }
  }, [userId]);

  // Start heartbeat interval
  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }
    
    console.log("[Presence] Starting heartbeat");
    
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
    console.log("[Presence] Stopping heartbeat");
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    updateLastSeen(false);
  }, [updateLastSeen]);

  // Mark user offline using synchronous approach for beforeunload
  const markOfflineSync = useCallback(async () => {
    if (!userId) return;
    
    try {
      // Get current session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`;
      const data = JSON.stringify({ 
        is_online: false, 
        last_seen: new Date().toISOString() 
      });
      
      // Use sendBeacon with proper headers via Blob
      const headers = {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        'Authorization': `Bearer ${session.access_token}`,
        'Prefer': 'return=minimal'
      };
      
      // sendBeacon doesn't support custom headers, so use fetch with keepalive instead
      fetch(url, {
        method: 'PATCH',
        headers,
        body: data,
        keepalive: true // This ensures the request completes even if the page is closing
      }).catch(() => {
        // Silently fail - page is closing anyway
      });
    } catch (error) {
      // Silently fail - page is closing anyway
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    console.log("[Presence] Setting up presence for user:", userId);

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
        // Update last_seen but keep online true - will go offline after 5 min of inactivity
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
      markOfflineSync();
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
  }, [userId, startHeartbeat, stopHeartbeat, updateLastSeen, markOfflineSync]);

  const isUserOnline = useCallback(
    (checkUserId: string) => onlineUsers.has(checkUserId),
    [onlineUsers]
  );

  return { onlineUsers, isUserOnline };
};
