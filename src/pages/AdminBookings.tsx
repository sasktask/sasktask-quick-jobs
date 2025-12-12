import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Calendar,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Ban,
  RefreshCw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminBookings = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["admin-bookings", search, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("bookings")
        .select(`
          *,
          task:task_id(title, pay_amount, category, location),
          task_doer:task_doer_id(full_name, email, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as "pending" | "accepted" | "rejected" | "completed" | "cancelled" | "in_progress");
      }

      const { data, error } = await query;
      if (error) throw error;

      if (search) {
        return (data || []).filter((booking: any) =>
          booking.task?.title?.toLowerCase().includes(search.toLowerCase()) ||
          booking.task_doer?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          booking.task_doer?.email?.toLowerCase().includes(search.toLowerCase())
        );
      }

      return data || [];
    },
  });

  const updateBookingStatus = async (bookingId: string, newStatus: "pending" | "accepted" | "rejected" | "completed" | "cancelled" | "in_progress") => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", bookingId);

      if (error) throw error;
      toast.success(`Booking ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    } catch (error) {
      toast.error("Failed to update booking");
    }
  };

  const handleCancel = async (bookingId: string) => {
    await updateBookingStatus(bookingId, "cancelled");
    setCancelBookingId(null);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      pending: { variant: "secondary", icon: Clock },
      accepted: { variant: "default", icon: CheckCircle },
      in_progress: { variant: "default", icon: Play },
      completed: { variant: "outline", icon: CheckCircle },
      cancelled: { variant: "destructive", icon: XCircle },
      rejected: { variant: "destructive", icon: Ban },
    };
    const { variant, icon: Icon } = config[status] || { variant: "secondary", icon: Clock };
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const pendingBookings = bookings?.filter((b: any) => b.status === "pending") || [];
  const activeBookings = bookings?.filter((b: any) => ["accepted", "in_progress"].includes(b.status)) || [];
  const completedBookings = bookings?.filter((b: any) => b.status === "completed") || [];
  const cancelledBookings = bookings?.filter((b: any) => ["cancelled", "rejected"].includes(b.status)) || [];

  return (
    <AdminLayout title="Bookings Management" description="Manage all platform bookings">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingBookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Play className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeBookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedBookings.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-bookings"] })}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Bookings Tabs */}
      <Tabs defaultValue="all" onValueChange={(v) => setStatusFilter(v === "all" ? "all" : v)}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All ({bookings?.length || 0})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
          <TabsTrigger value="accepted">Active ({activeBookings.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter === "all" ? "all" : statusFilter}>
          {isLoading ? (
            <p>Loading...</p>
          ) : bookings?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No bookings found
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings?.map((booking: any) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(booking.status)}
                          <span className="text-xs text-muted-foreground">
                            ID: {booking.id.slice(0, 8)}...
                          </span>
                        </div>

                        <h3 className="font-semibold mb-1">{booking.task?.title || "Unknown Task"}</h3>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                          <p>
                            <span className="font-medium">Task Doer:</span>{" "}
                            {booking.task_doer?.full_name || "Unknown"}
                          </p>
                          <p>
                            <span className="font-medium">Amount:</span> $
                            {booking.task?.pay_amount?.toFixed(2) || "0.00"}
                          </p>
                          <p>
                            <span className="font-medium">Category:</span>{" "}
                            {booking.task?.category || "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Location:</span>{" "}
                            {booking.task?.location || "N/A"}
                          </p>
                        </div>

                        {booking.message && (
                          <p className="text-sm bg-muted p-3 rounded-lg mb-3">
                            {booking.message}
                          </p>
                        )}

                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(booking.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        {booking.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, "accepted")}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateBookingStatus(booking.id, "rejected")}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {booking.status === "accepted" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, "in_progress")}
                            >
                              Start
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setCancelBookingId(booking.id)}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {booking.status === "in_progress" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, "completed")}
                            >
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setCancelBookingId(booking.id)}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Dialog */}
      <AlertDialog open={!!cancelBookingId} onOpenChange={() => setCancelBookingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the booking. Both parties will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelBookingId && handleCancel(cancelBookingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminBookings;
