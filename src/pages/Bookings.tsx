import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MessagingPanel } from "@/components/MessagingPanel";
import { PaymentPanel } from "@/components/PaymentPanel";
import { TaskCompletionFlow } from "@/components/TaskCompletionFlow";
import { CancellationDialog } from "@/components/CancellationDialog";
import { Briefcase, Clock, CheckCircle, XCircle, MessageSquare, DollarSign, Shield, Star, Phone, MapPin, Ban } from "lucide-react";

const Bookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showMessaging, setShowMessaging] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showCancellation, setShowCancellation] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUserAndFetchBookings();
  }, []);

  const checkUserAndFetchBookings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setCurrentUserId(session.user.id);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profileData);

      // Fetch user role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();
      
      setUserRole(roleData?.role || null);

      // Fetch bookings based on role with task doer profile (verification fetched separately)
      let query = supabase
        .from("bookings")
        .select(`
          *,
          task_doer:profiles!bookings_task_doer_id_fkey (
            id,
            full_name,
            avatar_url,
            rating,
            total_reviews
          ),
          tasks!inner (
            id,
            title,
            description,
            category,
            location,
            pay_amount,
            scheduled_date,
            task_giver_id,
            status,
            task_giver:profiles!tasks_task_giver_id_fkey (
              id,
              full_name,
              avatar_url,
              rating,
              total_reviews
            )
          )
        `)
        .not('task_doer', 'is', null)
        .not('tasks', 'is', null);

      if (roleData?.role === "task_giver") {
        // Task givers see bookings for their tasks
        query = query.eq("tasks.task_giver_id", session.user.id);
      } else {
        // Task doers see their own bookings
        query = query.eq("task_doer_id", session.user.id);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      
      // Filter out bookings with missing user data and fetch verification status
      const validBookings = (data || []).filter(booking => 
        booking.task_doer && 
        booking.tasks && 
        booking.tasks.task_giver &&
        booking.task_doer.full_name &&
        booking.tasks.task_giver.full_name
      );

      const bookingsWithVerification = await Promise.all(
        validBookings.map(async (booking) => {
          const { data: verification } = await supabase
            .from("verifications")
            .select("verification_status, id_verified, background_check_status")
            .eq("user_id", booking.task_doer_id)
            .maybeSingle();
          
          // Get unread message count for this booking
          const { count: unreadCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("booking_id", booking.id)
            .eq("receiver_id", session.user.id)
            .is("read_at", null);
          
          return {
            ...booking,
            task_doer_verification: verification,
            unread_count: unreadCount || 0,
          };
        })
      );
      
      setBookings(bookingsWithVerification);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: "pending" | "accepted" | "completed" | "rejected" | "cancelled") => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Booking ${status}`,
      });

      checkUserAndFetchBookings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: "default",
      accepted: "default",
      in_progress: "default",
      completed: "default",
      rejected: "destructive"
    };

    const colors: any = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      accepted: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      in_progress: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      rejected: "bg-red-500/10 text-red-500 border-red-500/20"
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status === "in_progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filterBookings = (status: string) => {
    return bookings.filter(b => b.status === status);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">
            {profile?.role === "task_giver" 
              ? "Manage bookings for your tasks" 
              : "Track your task applications"}
          </p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({filterBookings("pending").length})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({filterBookings("accepted").length})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({filterBookings("in_progress").length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({filterBookings("completed").length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({filterBookings("rejected").length})</TabsTrigger>
          </TabsList>

          {["all", "pending", "accepted", "in_progress", "completed", "rejected"].map(tab => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {(tab === "all" ? bookings : filterBookings(tab)).length === 0 ? (
                <Card className="border-border">
                  <CardContent className="p-12 text-center">
                    <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
                    <p className="text-muted-foreground">
                      {tab === "all" 
                        ? "You don't have any bookings yet" 
                        : `No ${tab} bookings`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                (tab === "all" ? bookings : filterBookings(tab)).map((booking) => {
                  const otherUser = userRole === "task_giver" ? booking.task_doer : booking.tasks?.task_giver;
                  const isVerified = booking.task_doer_verification?.verification_status === "verified";
                  
                  return (
                    <Card key={booking.id} className="border-border hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        {/* Uber-Style Header with Profile */}
                        <div className="flex items-start gap-4 mb-6 pb-4 border-b border-border">
                          <Avatar className="h-16 w-16 border-2 border-primary/20">
                            <AvatarImage 
                              src={otherUser?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.full_name}`} 
                              alt={otherUser?.full_name || "User"} 
                            />
                            <AvatarFallback>{otherUser?.full_name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 
                              className="text-xl font-bold hover:text-primary cursor-pointer transition-colors"
                              onClick={() => navigate(`/profile/${otherUser?.id}`)}
                            >
                              {otherUser?.full_name || "User"}
                            </h3>
                            {isVerified && (
                              <Badge className="bg-primary/10 text-primary border-primary/20">
                                <Shield className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                            
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                              {otherUser?.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-semibold">{otherUser.rating}</span>
                                  {otherUser.total_reviews && (
                                    <span>({otherUser.total_reviews} reviews)</span>
                                  )}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{booking.tasks?.location}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {getStatusBadge(booking.status)}
                            </div>
                          </div>

                          {/* Quick Actions */}
                          {(booking.status === "accepted" || booking.status === "in_progress") && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-10 px-3 relative"
                                onClick={() => navigate(`/chat/${booking.id}`)}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Chat
                                {booking.unread_count > 0 && (
                                  <Badge 
                                    variant="destructive" 
                                    className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                                  >
                                    {booking.unread_count}
                                  </Badge>
                                )}
                              </Button>
                              {userRole === "task_giver" && (
                                <Button
                                  size="sm"
                                  className="h-10 w-10 p-0"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowPayment(true);
                                  }}
                                >
                                  <DollarSign className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Task Details */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-lg mb-1">{booking.tasks?.title}</h4>
                            <p className="text-muted-foreground">{booking.tasks?.description}</p>
                          </div>

                          {booking.message && (
                            <div className="bg-muted/30 p-4 rounded-lg border border-border">
                              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Application Message:
                              </p>
                              <p className="text-sm text-muted-foreground">{booking.message}</p>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {booking.tasks?.category}
                            </Badge>
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
                              ${booking.tasks?.pay_amount}
                            </Badge>
                            {booking.tasks?.scheduled_date && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(booking.tasks.scheduled_date).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>

                          {/* Task Completion Flow - Escrow System */}
                          {(booking.status === "accepted" || booking.status === "in_progress" || booking.status === "completed") && (
                            <div className="pt-4 border-t border-border">
                              <TaskCompletionFlow
                                bookingId={booking.id}
                                taskId={booking.tasks?.id}
                                currentUserId={currentUserId}
                                taskDoerId={booking.task_doer_id}
                                taskGiverId={booking.tasks?.task_giver_id}
                                bookingStatus={booking.status}
                                taskStatus={booking.tasks?.status || "open"}
                                paymentAmount={booking.tasks?.pay_amount || 0}
                                onStatusUpdate={checkUserAndFetchBookings}
                              />
                              
                              {/* Chat Button - Always available for accepted/in_progress */}
                              {(booking.status === "accepted" || booking.status === "in_progress") && (
                                <div className="space-y-2 mt-3">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setShowMessaging(true);
                                    }}
                                    className="w-full"
                                    size="lg"
                                  >
                                    <MessageSquare className="mr-2 h-5 w-5" />
                                    Chat with {userRole === "task_giver" ? "Tasker" : "Task Giver"}
                                  </Button>
                                  
                                  {/* Cancel Button */}
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setShowCancellation(true);
                                    }}
                                    className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                    size="lg"
                                  >
                                    <Ban className="mr-2 h-5 w-5" />
                                    Cancel Booking
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Action Buttons for Pending */}
                          {userRole === "task_giver" && booking.status === "pending" && (
                            <div className="flex gap-2 pt-4 border-t border-border">
                              <Button
                                onClick={() => updateBookingStatus(booking.id, "accepted")}
                                className="flex-1"
                                size="lg"
                              >
                                <CheckCircle className="mr-2 h-5 w-5" />
                                Accept Request
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => updateBookingStatus(booking.id, "rejected")}
                                className="flex-1"
                                size="lg"
                              >
                                <XCircle className="mr-2 h-5 w-5" />
                                Decline
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Messaging Dialog */}
        <Dialog open={showMessaging} onOpenChange={setShowMessaging}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Messages</DialogTitle>
              <DialogDescription>
                Chat with {userRole === "task_giver" 
                  ? selectedBooking?.task_doer?.full_name 
                  : selectedBooking?.tasks?.task_giver?.full_name}
              </DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <MessagingPanel
                bookingId={selectedBooking.id}
                currentUserId={currentUserId}
                otherUserId={userRole === "task_giver" 
                  ? selectedBooking.task_doer_id 
                  : selectedBooking.tasks?.task_giver_id}
                otherUserName={userRole === "task_giver" 
                  ? selectedBooking.task_doer?.full_name 
                  : selectedBooking.tasks?.task_giver?.full_name}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={showPayment} onOpenChange={setShowPayment}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
              <DialogDescription>
                Secure payment via Stripe for {selectedBooking?.tasks?.title}
              </DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <PaymentPanel
                bookingId={selectedBooking.id}
                taskId={selectedBooking.task_id}
                payerId={currentUserId}
                payeeId={selectedBooking.task_doer_id}
                amount={selectedBooking.tasks?.pay_amount || 0}
                payeeName={selectedBooking.task_doer?.full_name || "Task Doer"}
                onPaymentComplete={() => {
                  setShowPayment(false);
                  checkUserAndFetchBookings();
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Cancellation Dialog */}
        {selectedBooking && (
          <CancellationDialog
            open={showCancellation}
            onOpenChange={setShowCancellation}
            bookingId={selectedBooking.id}
            taskAmount={selectedBooking.tasks?.pay_amount || 0}
            scheduledDate={selectedBooking.tasks?.scheduled_date || new Date().toISOString()}
            onSuccess={checkUserAndFetchBookings}
          />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Bookings;
