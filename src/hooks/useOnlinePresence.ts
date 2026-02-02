import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

// Cached session for synchronous beforeunload/pagehide - browser doesn't wait for async
let offlineCache: { userId: string; accessToken: string } | null = null;

const setOfflineCache = (userId: string, accessToken: string) => {
  offlineCache = { userId, accessToken };
  console.log("[Presence] Offline cache updated for user:", userId);
};

/** Fire offline update synchronously using cached session. No async - for beforeunload/pagehide. */
const fireOfflineUpdateSync = () => {
  const cached = offlineCache;
  if (!cached) {
    console.log("[Presence] No cached session for offline update");
    return;
  }
  console.log("[Presence] Firing synchronous offline update for user:", cached.userId);
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${cached.userId}`;
  const body = JSON.stringify({ is_online: false, last_seen: new Date().toISOString() });
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${cached.accessToken}`,
    Prefer: "return=minimal",
  };
  // Use fetch with keepalive - this is the most reliable way to send data on page close
  fetch(url, { method: "PATCH", headers, body, keepalive: true }).catch(() => {});
};

/** Mark user as offline in profiles. Call before sign out or when browser closes. */
export const markUserOffline = async (userId: string | undefined) => {
  if (!userId) return;
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ is_online: false, last_seen: new Date().toISOString() })
      .eq("id", userId);
    if (error) throw error;
  } catch (error) {
    console.error("Failed to mark user offline:", error);
  }
};

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

  // Update last_seen timestamp in the database; also refresh offline cache for beforeunload
  const updateLastSeen = useCallback(async (isOnline: boolean) => {
    if (!userId) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        setOfflineCache(userId, session.access_token);
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          is_online: isOnline,
          last_seen: new Date().toISOString(),
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

    // Initial update (also populates offline cache)
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
        console.log("[Presence] Channel status:", status);
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });

          // Populate offline cache immediately for beforeunload (user might close tab quickly)
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            setOfflineCache(userId, session.access_token);
          }

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

    // Mark offline when closing browser/tab - must be synchronous (no await)
    const handleUnload = () => {
      console.log("[Presence] beforeunload/pagehide triggered");
      fireOfflineUpdateSync();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload); // More reliable on mobile

    // Cleanup on unmount (e.g. sign out)
    return () => {
      console.log("[Presence] Cleanup - removing listeners and marking offline");
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);

      stopHeartbeat();
      supabase.removeChannel(presenceChannel);
      // Don't clear offlineCache here - it might still be needed for the sync update
    };
  }, [userId, startHeartbeat, stopHeartbeat, updateLastSeen]);

  const isUserOnline = useCallback(
    (checkUserId: string) => onlineUsers.has(checkUserId),
    [onlineUsers]
  );

  return { onlineUsers, isUserOnline };
};
