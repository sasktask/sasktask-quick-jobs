import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MessagingPanel } from "@/components/MessagingPanel";
import { PaymentPanel } from "@/components/PaymentPanel";
import { Briefcase, Clock, CheckCircle, XCircle, MessageSquare, DollarSign } from "lucide-react";

const Bookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showMessaging, setShowMessaging] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
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

      // Fetch bookings based on role with task doer profile
      let query = supabase
        .from("bookings")
        .select(`
          *,
          task_doer:profiles!bookings_task_doer_id_fkey (
            id,
            full_name,
            avatar_url,
            rating
          ),
          tasks (
            id,
            title,
            description,
            category,
            location,
            pay_amount,
            scheduled_date,
            task_giver_id,
            task_giver:profiles!tasks_task_giver_id_fkey (
              id,
              full_name,
              avatar_url,
              rating
            )
          )
        `);

      if (roleData?.role === "task_giver") {
        // Task givers see bookings for their tasks
        query = query.eq("tasks.task_giver_id", session.user.id);
      } else {
        // Task doers see their own bookings
        query = query.eq("task_doer_id", session.user.id);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
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
      completed: "default",
      rejected: "destructive"
    };

    const colors: any = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      accepted: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      rejected: "bg-red-500/10 text-red-500 border-red-500/20"
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({filterBookings("pending").length})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({filterBookings("accepted").length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({filterBookings("completed").length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({filterBookings("rejected").length})</TabsTrigger>
          </TabsList>

          {["all", "pending", "accepted", "completed", "rejected"].map(tab => (
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
                (tab === "all" ? bookings : filterBookings(tab)).map((booking) => (
                  <Card key={booking.id} className="border-border hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold mb-1">{booking.tasks?.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {userRole === "task_giver" 
                                  ? `Applied by ${booking.task_doer?.full_name || "Task Doer"}` 
                                  : `Posted by ${booking.tasks?.task_giver?.full_name || "Task Giver"}`}
                              </p>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>

                          <p className="text-muted-foreground mb-3">{booking.tasks?.description}</p>

                          {booking.message && (
                            <div className="bg-muted/50 p-3 rounded-lg mb-3">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium mb-1">Application Message:</p>
                                  <p className="text-sm text-muted-foreground">{booking.message}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-3 text-sm">
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
                              {booking.tasks?.category}
                            </span>
                            <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full font-semibold">
                              ${booking.tasks?.pay_amount}
                            </span>
                            <span className="px-3 py-1 bg-muted text-foreground rounded-full">
                              {booking.tasks?.location}
                            </span>
                          </div>

                          {/* Action buttons for accepted bookings */}
                          {booking.status === "accepted" && (
                            <div className="flex gap-2 mt-4">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowMessaging(true);
                                }}
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Message
                              </Button>
                              
                              {userRole === "task_giver" && (
                                <Button
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowPayment(true);
                                  }}
                                >
                                  <DollarSign className="mr-2 h-4 w-4" />
                                  Pay Now
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        {userRole === "task_giver" && booking.status === "pending" && (
                          <div className="flex md:flex-col gap-2">
                            <Button
                              onClick={() => updateBookingStatus(booking.id, "accepted")}
                              className="flex-1 md:flex-none"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Accept
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => updateBookingStatus(booking.id, "rejected")}
                              className="flex-1 md:flex-none"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        )}

                        {userRole === "task_doer" && booking.status === "accepted" && (
                          <div className="flex md:flex-col gap-2">
                            <Button
                              onClick={() => updateBookingStatus(booking.id, "completed")}
                              className="flex-1 md:flex-none"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Complete
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
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
          <DialogContent className="max-w-md">
            {selectedBooking && (
              <PaymentPanel
                bookingId={selectedBooking.id}
                taskId={selectedBooking.task_id}
                payerId={currentUserId}
                payeeId={selectedBooking.task_doer_id}
                amount={selectedBooking.tasks?.pay_amount || 0}
                payeeName={selectedBooking.task_doer?.full_name || "Task Doer"}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
};

export default Bookings;
