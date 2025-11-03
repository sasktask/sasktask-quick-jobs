import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send, Phone, Shield, Star } from "lucide-react";

interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  status?: string;
  sender_name?: string;
}

interface MessagingPanelProps {
  bookingId: string;
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
}

interface OtherUserProfile {
  phone?: string;
  rating?: number;
  trust_score?: number;
  verification_level?: string;
}

export const MessagingPanel = ({ bookingId, currentUserId, otherUserId, otherUserName }: MessagingPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [otherUserProfile, setOtherUserProfile] = useState<OtherUserProfile | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    fetchOtherUserProfile();
    subscribeToMessages();
  }, [bookingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchOtherUserProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("phone, rating, trust_score, verification_level")
      .eq("id", otherUserId)
      .single();
    
    if (data) setOtherUserProfile(data);
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    setMessages(data || []);
    
    // Mark messages as read
    await supabase
      .from("messages")
      .update({ status: "read", read_at: new Date().toISOString() })
      .eq("booking_id", bookingId)
      .eq("receiver_id", currentUserId)
      .is("read_at", null);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages:${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    setLoading(true);

    try {
      const { error } = await supabase.from("messages").insert({
        booking_id: bookingId,
        sender_id: currentUserId,
        receiver_id: otherUserId,
        message: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{otherUserName}</h3>
            {otherUserProfile && (
              <div className="flex gap-2 mt-1">
                {otherUserProfile.rating && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    {otherUserProfile.rating.toFixed(1)}
                  </span>
                )}
                {otherUserProfile.verification_level === "verified" && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Shield className="h-3 w-3 text-primary" />
                    Verified
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Container - WhatsApp style */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/10">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-muted-foreground text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const showTimestamp = index === 0 || 
              new Date(msg.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000;
            
            return (
              <div key={msg.id}>
                {showTimestamp && (
                  <div className="flex justify-center my-3">
                    <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {new Date(msg.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                <div
                  className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
                      msg.sender_id === currentUserId
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-card border border-border rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className={`text-xs ${msg.sender_id === currentUserId ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                      {msg.sender_id === currentUserId && (
                        <span className="text-xs text-primary-foreground/70">
                          {msg.status === "read" ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Modern style */}
      <form onSubmit={sendMessage} className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={loading}
            maxLength={1000}
            className="flex-1 rounded-full bg-muted/50 border-0 focus-visible:ring-1"
          />
          <Button 
            type="submit" 
            disabled={loading || !newMessage.trim()}
            size="icon"
            className="rounded-full h-10 w-10 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};