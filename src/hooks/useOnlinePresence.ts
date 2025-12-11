import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface PresenceState {
  [key: string]: {
    user_id: string;
    online_at: string;
  }[];
}

export const useOnlinePresence = (userId: string | undefined) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

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

          // Update profile online status
          await supabase
            .from("profiles")
            .update({ is_online: true, last_seen: new Date().toISOString() })
            .eq("id", userId);
        }
      });

    setChannel(presenceChannel);

    // Handle page visibility changes
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "hidden") {
        await supabase
          .from("profiles")
          .update({ is_online: false, last_seen: new Date().toISOString() })
          .eq("id", userId);
      } else {
        await presenceChannel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
        });
        await supabase
          .from("profiles")
          .update({ is_online: true })
          .eq("id", userId);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      
      // Mark offline before leaving
      supabase
        .from("profiles")
        .update({ is_online: false, last_seen: new Date().toISOString() })
        .eq("id", userId)
        .then(() => {
          supabase.removeChannel(presenceChannel);
        });
    };
  }, [userId]);

  const isUserOnline = useCallback(
    (checkUserId: string) => onlineUsers.has(checkUserId),
    [onlineUsers]
  );

  return { onlineUsers, isUserOnline };
};
