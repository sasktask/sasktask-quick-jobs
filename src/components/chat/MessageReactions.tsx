import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MessageReactionsProps {
  messageId: string;
  currentUserId: string;
  isOwn: boolean;
}

const COMMON_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🎉", "🔥"];

interface Reaction {
  id: string;
  reaction: string;
  user_id: string;
  count?: number;
}

export const MessageReactions = ({ messageId, currentUserId, isOwn }: MessageReactionsProps) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    loadReactions();
    subscribeToReactions();
  }, [messageId]);

  const loadReactions = async () => {
    const { data, error } = await supabase
      .from("message_reactions")
      .select("*")
      .eq("message_id", messageId);

    if (!error && data) {
      // Group reactions by emoji and count
      const grouped = data.reduce((acc: Record<string, Reaction>, curr) => {
        if (!acc[curr.reaction]) {
          acc[curr.reaction] = {
            id: curr.id,
            reaction: curr.reaction,
            user_id: curr.user_id,
            count: 0,
          };
        }
        acc[curr.reaction].count = (acc[curr.reaction].count || 0) + 1;
        // Store if current user reacted
        if (curr.user_id === currentUserId) {
          acc[curr.reaction].id = curr.id;
          acc[curr.reaction].user_id = curr.user_id;
        }
        return acc;
      }, {});

      setReactions(Object.values(grouped));
    }
  };

  const subscribeToReactions = () => {
    const channel = supabase
      .channel(`reactions-${messageId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_reactions",
          filter: `message_id=eq.${messageId}`,
        },
        () => {
          loadReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const toggleReaction = async (emoji: string) => {
    try {
      const existingReaction = reactions.find(
        (r) => r.reaction === emoji && r.user_id === currentUserId
      );

      if (existingReaction) {
        // Remove reaction
        const { error } = await supabase
          .from("message_reactions")
          .delete()
          .eq("message_id", messageId)
          .eq("user_id", currentUserId)
          .eq("reaction", emoji);

        if (error) throw error;
      } else {
        // Add reaction
        const { error } = await supabase
          .from("message_reactions")
          .insert({
            message_id: messageId,
            user_id: currentUserId,
            reaction: emoji,
          });

        if (error) throw error;
      }
      setShowPicker(false);
    } catch (error) {
      console.error("Error toggling reaction:", error);
      toast.error("Failed to update reaction");
    }
  };

  const hasUserReacted = (emoji: string) => {
    return reactions.some((r) => r.reaction === emoji && r.user_id === currentUserId);
  };

  if (reactions.length === 0 && !showPicker) {
    return (
      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity",
              isOwn ? "mr-auto" : "ml-auto"
            )}
          >
            <Smile className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align={isOwn ? "start" : "end"}>
          <div className="flex gap-1">
            {COMMON_REACTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-lg hover:scale-125 transition-transform"
                onClick={() => toggleReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className={cn("flex items-center gap-1 mt-1", isOwn ? "justify-start" : "justify-end")}>
      {reactions.map((reaction) => (
        <Button
          key={reaction.reaction}
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 px-2 text-xs gap-1 rounded-full",
            hasUserReacted(reaction.reaction)
              ? "bg-primary/20 border border-primary/40"
              : "bg-muted/50 hover:bg-muted"
          )}
          onClick={() => toggleReaction(reaction.reaction)}
        >
          <span>{reaction.reaction}</span>
          {reaction.count && reaction.count > 1 && (
            <span className="text-[10px] font-medium">{reaction.count}</span>
          )}
        </Button>
      ))}
      
      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
            <Smile className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align={isOwn ? "start" : "end"}>
          <div className="flex gap-1">
            {COMMON_REACTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-lg hover:scale-125 transition-transform"
                onClick={() => toggleReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};