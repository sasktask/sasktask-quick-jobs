import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRealtimeChatNotifications } from "@/hooks/useRealtimeChatNotifications";
import { VideoCallDialog } from "@/components/VideoCallDialog";
import { Video, Phone } from "lucide-react";

const ChatRoom = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [booking, setBooking] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [callType, setCallType] = useState<'video' | 'audio'>('video');
  
  // Enable realtime chat notifications
  const { unreadCount } = useRealtimeChatNotifications(user?.id || "");

  useEffect(() => {
    checkAccess();
  }, [bookingId]);

  const checkAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to access chat");
        navigate("/auth");
        return;
      }

      setUser(session.user);

      if (!bookingId) {
        toast.error("Invalid booking ID");
        navigate("/bookings");
        return;
      }

      // Load booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .select(`
          *,
          tasks (
            id,
            title,
            task_giver_id
          )
        `)
        .eq("id", bookingId)
        .single();

      if (bookingError || !bookingData) {
        toast.error("Booking not found");
        navigate("/bookings");
        return;
      }

      // Check if user is part of this booking
      const isTaskGiver = bookingData.tasks.task_giver_id === session.user.id;
      const isTaskDoer = bookingData.task_doer_id === session.user.id;

      if (!isTaskGiver && !isTaskDoer) {
        toast.error("You don't have access to this chat");
        navigate("/bookings");
        return;
      }

      setBooking(bookingData);

      // Get other user details
      const otherId = isTaskGiver ? bookingData.task_doer_id : bookingData.tasks.task_giver_id;
      const { data: otherUserData, error: profileError } = await supabase
        .from("public_profiles")
        .select("id, full_name, avatar_url")
        .eq("id", otherId)
        .maybeSingle();

      if (profileError) {
        console.log("Error fetching other user profile:", profileError);
      }

      // Set a fallback user if profile not found
      setOtherUser(otherUserData || { id: otherId, full_name: "User", avatar_url: null });
    } catch (error) {
      console.error("Error checking access:", error);
      toast.error("Failed to load chat");
      navigate("/bookings");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking || !otherUser || !user) {
    return null;
  }

  const isTaskGiver = booking.tasks.task_giver_id === user.id;

  return (
    <>
      <SEOHead
        title={`Chat - ${booking.tasks.title}`}
        description="Real-time chat for your booking"
        url={`/chat/${bookingId}`}
      />
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate("/bookings")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Button>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{booking.tasks.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Chat with your {isTaskGiver ? "task doer" : "task giver"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setCallType('audio');
                        setShowVideoCall(true);
                      }}
                      title="Start audio call"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setCallType('video');
                        setShowVideoCall(true);
                      }}
                      title="Start video call"
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ChatInterface
                  bookingId={bookingId!}
                  currentUserId={user.id}
                  otherUserId={otherUser.id}
                  otherUserName={otherUser.full_name || "User"}
                  otherUserAvatar={otherUser.avatar_url}
                  otherUserRole={isTaskGiver ? "Task Doer" : "Task Giver"}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>

      {showVideoCall && otherUser && (
        <VideoCallDialog
          isOpen={showVideoCall}
          onClose={() => setShowVideoCall(false)}
          bookingId={bookingId!}
          otherUserId={otherUser.id}
          otherUserName={otherUser.full_name || "User"}
          callType={callType}
        />
      )}
    </>
  );
};

export default ChatRoom;
