import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Play,
  Flag,
  MessageSquare,
  Eye,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Booking = Tables<"bookings"> & {
  tasks: Tables<"tasks">;
  task_doer: Tables<"profiles">;
};

export default function BookingManagement() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [action, setAction] = useState<"accept" | "reject" | "start" | "complete" | "cancel" | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      navigate("/auth");
      return;
    }
    setUser(currentUser);
    loadBookings(currentUser.id);
  };

  const loadBookings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          tasks (
            *
          ),
          task_doer:profiles!bookings_task_doer_id_fkey (
            *
          )
        `)
        .or(`task_doer_id.eq.${userId},tasks.task_giver_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data as any || []);
    } catch (error: any) {
      console.error("Error loading bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedBooking || !action || !user) return;

    setActionLoading(true);
    try {
      const booking = bookings.find(b => b.id === selectedBooking);
      if (!booking) return;

      let newStatus: string;
      let notificationData: any = {};

      switch (action) {
        case "accept":
          newStatus = "accepted";
          notificationData = {
            user_id: booking.task_doer_id,
            type: "booking_accepted",
            title: "Booking Accepted",
            message: `Your application for "${booking.tasks.title}" has been accepted!`,
            link: `/bookings`,
          };
          break;
        case "reject":
          newStatus = "rejected";
          notificationData = {
            user_id: booking.task_doer_id,
            type: "booking_rejected",
            title: "Booking Not Accepted",
            message: `Your application for "${booking.tasks.title}" was not accepted this time.`,
            link: `/browse`,
          };
          break;
        case "start":
          newStatus = "in_progress";
          notificationData = {
            user_id: booking.tasks.task_giver_id,
            type: "task_started",
            title: "Task Started",
            message: `${booking.task_doer.full_name} has started working on "${booking.tasks.title}"`,
            link: `/bookings`,
          };
          break;
        case "complete":
          newStatus = "completed";
          notificationData = {
            user_id: booking.tasks.task_giver_id,
            type: "task_completed",
            title: "Task Completed",
            message: `${booking.task_doer.full_name} has marked "${booking.tasks.title}" as completed. Please review.`,
            link: `/bookings`,
          };
          break;
        case "cancel":
          newStatus = "cancelled";
          const otherUserId = user.id === booking.task_doer_id 
            ? booking.tasks.task_giver_id 
            : booking.task_doer_id;
          notificationData = {
            user_id: otherUserId,
            type: "booking_cancelled",
            title: "Booking Cancelled",
            message: `The booking for "${booking.tasks.title}" has been cancelled.`,
            link: `/bookings`,
          };
          break;
        default:
          return;
      }

      const { error: updateError } = await supabase
        .from("bookings")
        .update({ status: newStatus as any })
        .eq("id", selectedBooking);

      if (updateError) throw updateError;

      // Create notification
      await supabase.from("notifications").insert(notificationData);

      toast.success(`Booking ${action}ed successfully`);
      loadBookings(user.id);
      setSelectedBooking(null);
      setAction(null);
    } catch (error: any) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "outline", label: "Pending" },
      accepted: { variant: "default", label: "Accepted" },
      rejected: { variant: "destructive", label: "Rejected" },
      in_progress: { variant: "secondary", label: "In Progress" },
      completed: { variant: "default", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filterBookings = (status?: string) => {
    if (!status) return bookings;
    return bookings.filter(b => b.status === status);
  };

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const isTaskGiver = user?.id === booking.tasks.task_giver_id;
    const isTaskDoer = user?.id === booking.task_doer_id;

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{booking.tasks.title}</CardTitle>
              <CardDescription className="mt-1">
                {isTaskGiver ? `Applied by: ${booking.task_doer.full_name}` : `Task by: ${booking.tasks.task_giver_id}`}
              </CardDescription>
            </div>
            {getStatusBadge(booking.status || "pending")}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {booking.message && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm"><span className="font-medium">Message:</span> {booking.message}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/task/${booking.tasks.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Task
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/chat/${booking.id}`)}
              disabled={booking.status !== "accepted" && booking.status !== "in_progress"}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>

            {/* Task Giver Actions */}
            {isTaskGiver && booking.status === "pending" && (
              <>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedBooking(booking.id);
                    setAction("accept");
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setSelectedBooking(booking.id);
                    setAction("reject");
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}

            {isTaskGiver && booking.status === "in_progress" && (
              <Button
                size="sm"
                onClick={() => {
                  setSelectedBooking(booking.id);
                  setAction("complete");
                }}
              >
                <Flag className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
            )}

            {/* Task Doer Actions */}
            {isTaskDoer && booking.status === "accepted" && (
              <Button
                size="sm"
                onClick={() => {
                  setSelectedBooking(booking.id);
                  setAction("start");
                }}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Task
              </Button>
            )}

            {isTaskDoer && booking.status === "in_progress" && (
              <Button
                size="sm"
                onClick={() => {
                  setSelectedBooking(booking.id);
                  setAction("complete");
                }}
              >
                <Flag className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
            )}

            {/* Both can cancel */}
            {(booking.status === "pending" || booking.status === "accepted") && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedBooking(booking.id);
                  setAction("cancel");
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SEOHead title="My Bookings - SaskTask" description="Manage your bookings" />
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 pt-24 pb-20">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">My Bookings</h1>

            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({filterBookings("pending").length})</TabsTrigger>
                <TabsTrigger value="accepted">Accepted ({filterBookings("accepted").length})</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress ({filterBookings("in_progress").length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({filterBookings("completed").length})</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled ({filterBookings("cancelled").length})</TabsTrigger>
              </TabsList>

              {["all", "pending", "accepted", "in_progress", "completed", "cancelled"].map(status => (
                <TabsContent key={status} value={status} className="mt-6">
                  <div className="grid gap-6">
                    {(status === "all" ? bookings : filterBookings(status)).length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-12">
                          <p className="text-muted-foreground">No {status} bookings</p>
                        </CardContent>
                      </Card>
                    ) : (
                      (status === "all" ? bookings : filterBookings(status)).map(booking => (
                        <BookingCard key={booking.id} booking={booking} />
                      ))
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>

        <Footer />
      </div>

      <AlertDialog open={!!selectedBooking && !!action} onOpenChange={() => {
        setSelectedBooking(null);
        setAction(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {action} this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
