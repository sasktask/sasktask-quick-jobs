import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pin, X, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PinnedMessagesProps {
  bookingId: string;
  currentUserId: string;
  onMessageClick?: (messageId: string) => void;
}

interface PinnedMessage {
  id: string;
  message_id: string;
  pinned_by: string;
  pinned_at: string;
  message: {
    id: string;
    message: string;
    created_at: string;
    sender_id: string;
    sender_name?: string;
  };
}

export const PinnedMessages = ({ bookingId, currentUserId, onMessageClick }: PinnedMessagesProps) => {
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    loadPinnedMessages();
    subscribeToPins();
  }, [bookingId]);

  const loadPinnedMessages = async () => {
    const { data, error } = await supabase
      .from("pinned_messages")
      .select(`
        *,
        message:messages (
          id,
          message,
          created_at,
          sender_id
        )
      `)
      .eq("booking_id", bookingId)
      .order("pinned_at", { ascending: false });

    if (!error && data) {
      // Fetch sender names separately because messages.sender_id lacks a direct FK to profiles
      const senderIds = Array.from(
        new Set(
          (data as any[])
            .map((pin) => pin.message?.sender_id)
            .filter(Boolean)
        )
      );

      let profilesMap: Record<string, string> = {};
      if (senderIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", senderIds);

        profilesMap =
          profilesData?.reduce<Record<string, string>>((acc, profile) => {
            acc[profile.id] = profile.full_name || "User";
            return acc;
          }, {}) || {};
      }

      const enriched = (data as any[]).map((pin) => ({
        ...pin,
        message: {
          ...pin.message,
          sender_name: profilesMap[pin.message?.sender_id] || "User",
        },
      }));

      setPinnedMessages(enriched as PinnedMessage[]);
    }
  };

  const subscribeToPins = () => {
    const channel = supabase
      .channel(`pins-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pinned_messages",
          filter: `booking_id=eq.${bookingId}`,
        },
        () => {
          loadPinnedMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const unpinMessage = async (pinId: string) => {
    try {
      const { error } = await supabase
        .from("pinned_messages")
        .delete()
        .eq("id", pinId);

      if (error) throw error;
      toast.success("Message unpinned");
    } catch (error) {
      console.error("Error unpinning message:", error);
      toast.error("Failed to unpin message");
    }
  };

  if (pinnedMessages.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-border bg-primary/5">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <Pin className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {pinnedMessages.length} Pinned Message{pinnedMessages.length !== 1 ? "s" : ""}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 w-6 p-0"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <ScrollArea className="max-h-40">
          <div className="px-4 pb-2 space-y-2">
            {pinnedMessages.map((pin) => (
              <div
                key={pin.id}
                className="group flex items-start gap-2 p-2 rounded-lg bg-background hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onMessageClick?.(pin.message_id)}
              >
                <Pin className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {pin.message.sender_name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {pin.message.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Pinned {format(new Date(pin.pinned_at), "MMM d, h:mm a")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    unpinMessage(pin.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};