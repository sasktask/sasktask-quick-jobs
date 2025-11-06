import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Search, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Conversation {
  booking_id: string;
  task_title: string;
  other_user: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface ForwardMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageId: string;
  messageContent: string;
  currentBookingId: string;
  onForwardComplete: () => void;
}

export const ForwardMessageDialog = ({
  open,
  onOpenChange,
  messageId,
  messageContent,
  currentBookingId,
  onForwardComplete,
}: ForwardMessageDialogProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [forwarding, setForwarding] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadConversations();
    }
  }, [open]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredConversations(
        conversations.filter(
          (conv) =>
            conv.task_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.other_user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all bookings where user is involved
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select(`
          id,
          task_id,
          task_doer_id,
          status,
          tasks (
            id,
            title,
            task_giver_id
          )
        `)
        .eq("status", "accepted")
        .neq("id", currentBookingId);

      if (error) throw error;

      const conversationList: Conversation[] = [];

      for (const booking of bookings || []) {
        const task = booking.tasks as any;
        if (!task) continue;

        // Determine the other user
        const otherUserId =
          user.id === booking.task_doer_id ? task.task_giver_id : booking.task_doer_id;

        // Fetch other user's profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", otherUserId)
          .single();

        if (profile) {
          conversationList.push({
            booking_id: booking.id,
            task_title: task.title,
            other_user: {
              id: profile.id,
              full_name: profile.full_name || "Unknown User",
              avatar_url: profile.avatar_url,
            },
          });
        }
      }

      setConversations(conversationList);
      setFilteredConversations(conversationList);
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const handleForward = async () => {
    if (!selectedBooking) return;

    try {
      setForwarding(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get the target conversation details
      const targetConv = conversations.find((c) => c.booking_id === selectedBooking);
      if (!targetConv) throw new Error("Conversation not found");

      // Get the original message with attachments
      const { data: originalMessage } = await supabase
        .from("messages")
        .select("*")
        .eq("id", messageId)
        .single();

      const { data: attachments } = await (supabase as any)
        .from("message_attachments")
        .select("*")
        .eq("message_id", messageId);

      // Create forwarded message
      const forwardedContent = `📨 Forwarded message:\n${messageContent}`;
      
      const { data: newMessage, error: messageError } = await supabase
        .from("messages")
        .insert({
          booking_id: selectedBooking,
          sender_id: user.id,
          receiver_id: targetConv.other_user.id,
          message: forwardedContent,
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // If the original message had attachments, copy them
      if (attachments && attachments.length > 0) {
        for (const attachment of attachments) {
          // Copy the file in storage
          const { data: fileData } = await supabase.storage
            .from("message-attachments")
            .download(attachment.storage_path);

          if (fileData) {
            const fileExt = attachment.file_name.split(".").pop();
            const newPath = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from("message-attachments")
              .upload(newPath, fileData);

            if (!uploadError) {
              // Create attachment record
              await (supabase as any).from("message_attachments").insert({
                message_id: newMessage.id,
                file_name: attachment.file_name,
                file_size: attachment.file_size,
                file_type: attachment.file_type,
                storage_path: newPath,
                attachment_type: attachment.attachment_type,
                duration: attachment.duration,
              });
            }
          }
        }
      }

      toast.success("Message forwarded successfully");
      onForwardComplete();
      onOpenChange(false);
      setSelectedBooking(null);
      setSearchQuery("");
    } catch (error) {
      console.error("Error forwarding message:", error);
      toast.error("Failed to forward message");
    } finally {
      setForwarding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Forward Message</DialogTitle>
          <DialogDescription>
            Select a conversation to forward this message to
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[300px] rounded-md border">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "No conversations match your search"
                    : "No other conversations available"}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.booking_id}
                    onClick={() => setSelectedBooking(conv.booking_id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors ${
                      selectedBooking === conv.booking_id ? "bg-accent" : ""
                    }`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conv.other_user.avatar_url} />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">
                        {conv.other_user.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {conv.task_title}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setSelectedBooking(null);
                setSearchQuery("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleForward}
              disabled={!selectedBooking || forwarding}
            >
              {forwarding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Forwarding...
                </>
              ) : (
                "Forward"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
