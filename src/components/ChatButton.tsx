import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ChatDrawer } from "./ChatDrawer";

export const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        setIsAuthenticated(true);
        fetchUnreadCount(session.user.id);
        subscribeToMessages(session.user.id);
      } else {
        setUserId(null);
        setIsAuthenticated(false);
        setUnreadCount(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUserId(session.user.id);
      setIsAuthenticated(true);
      fetchUnreadCount(session.user.id);
      subscribeToMessages(session.user.id);
    }
  };

  const fetchUnreadCount = async (userId: string) => {
    const { count } = await supabase
      .from("messages")
      .select("*", { count: 'exact', head: true })
      .eq("receiver_id", userId)
      .is("read_at", null);
    
    setUnreadCount(count || 0);
  };

  const subscribeToMessages = (userId: string) => {
    const channel = supabase
      .channel('new-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        () => {
          fetchUnreadCount(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Only show for authenticated users
  if (!isAuthenticated || !userId) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        variant="default"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-40 bg-primary hover:bg-primary/90"
      >
        <div className="relative">
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs border-2 border-background"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </div>
      </Button>

      <ChatDrawer 
        isOpen={isOpen} 
        onClose={() => {
          setIsOpen(false);
          if (userId) fetchUnreadCount(userId);
        }}
        userId={userId}
      />
    </>
  );
};
