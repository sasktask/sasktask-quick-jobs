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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="mb-2">Messages with {otherUserName}</CardTitle>
            {otherUserProfile && (
              <div className="flex flex-wrap gap-2 text-sm">
                {otherUserProfile.phone && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {otherUserProfile.phone}
                  </Badge>
                )}
                {otherUserProfile.rating && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    {otherUserProfile.rating.toFixed(1)}
                  </Badge>
                )}
                {otherUserProfile.trust_score && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-primary" />
                    Trust: {otherUserProfile.trust_score}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Messages Container */}
        <div className="h-96 overflow-y-auto mb-4 space-y-4 p-4 bg-muted/20 rounded-lg">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg, index) => {
              const showTimestamp = index === 0 || 
                new Date(msg.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000; // 5 minutes
              
              return (
                <div key={msg.id}>
                  {showTimestamp && (
                    <div className="flex justify-center my-2">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
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
                      className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                        msg.sender_id === currentUserId
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-card border border-border rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs opacity-70">
                          {new Date(msg.created_at).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </span>
                        {msg.sender_id === currentUserId && msg.status === "read" && (
                          <span className="text-xs opacity-70">✓✓</span>
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

        {/* Message Input */}
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            maxLength={1000}
          />
          <Button type="submit" disabled={loading || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};