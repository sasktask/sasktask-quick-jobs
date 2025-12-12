import { Button } from "@/components/ui/button";
import { Check, X, DollarSign, Calendar, ThumbsUp, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface QuickActionsProps {
  bookingId: string;
  bookingStatus: string;
  isTaskGiver: boolean;
  taskId: string;
  onAction?: () => void;
}

export const QuickActions = ({
  bookingId,
  bookingStatus,
  isTaskGiver,
  taskId,
  onAction,
}: QuickActionsProps) => {
  const handleAcceptBooking = async () => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "accepted", agreed_at: new Date().toISOString() })
        .eq("id", bookingId);

      if (error) throw error;
      toast.success("Booking accepted!");
      onAction?.();
    } catch (error) {
      console.error("Error accepting booking:", error);
      toast.error("Failed to accept booking");
    }
  };

  const handleRejectBooking = async () => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "rejected" })
        .eq("id", bookingId);

      if (error) throw error;
      toast.success("Booking declined");
      onAction?.();
    } catch (error) {
      console.error("Error rejecting booking:", error);
      toast.error("Failed to decline booking");
    }
  };

  const handleStartTask = async () => {
    try {
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({ status: "in_progress" })
        .eq("id", bookingId);

      if (bookingError) throw bookingError;

      const { error: taskError } = await supabase
        .from("tasks")
        .update({ status: "in_progress" })
        .eq("id", taskId);

      if (taskError) throw taskError;

      toast.success("Task started!");
      onAction?.();
    } catch (error) {
      console.error("Error starting task:", error);
      toast.error("Failed to start task");
    }
  };

  const handleCompleteTask = async () => {
    try {
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({ status: "completed" })
        .eq("id", bookingId);

      if (bookingError) throw bookingError;

      const { error: taskError } = await supabase
        .from("tasks")
        .update({ status: "completed" })
        .eq("id", taskId);

      if (taskError) throw taskError;

      toast.success("Task marked as complete!");
      onAction?.();
    } catch (error) {
      console.error("Error completing task:", error);
      toast.error("Failed to complete task");
    }
  };

  // Task Giver actions
  if (isTaskGiver) {
    if (bookingStatus === "pending") {
      return (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
          <span className="text-sm text-muted-foreground flex-1">Respond to this booking request:</span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRejectBooking}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Decline
          </Button>
          <Button size="sm" onClick={handleAcceptBooking}>
            <Check className="h-4 w-4 mr-1" />
            Accept
          </Button>
        </div>
      );
    }

    if (bookingStatus === "in_progress") {
      return (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
          <span className="text-sm text-muted-foreground flex-1">Task in progress</span>
          <Button size="sm" variant="outline" onClick={handleCompleteTask}>
            <ThumbsUp className="h-4 w-4 mr-1" />
            Mark Complete
          </Button>
        </div>
      );
    }
  }

  // Task Doer actions
  if (!isTaskGiver) {
    if (bookingStatus === "accepted") {
      return (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
          <span className="text-sm text-muted-foreground flex-1">Ready to begin?</span>
          <Button size="sm" onClick={handleStartTask}>
            <Check className="h-4 w-4 mr-1" />
            Start Task
          </Button>
        </div>
      );
    }

    if (bookingStatus === "in_progress") {
      return (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
          <span className="text-sm text-green-600 flex-1">Task is in progress</span>
        </div>
      );
    }
  }

  // Completed status for both
  if (bookingStatus === "completed") {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
        <Check className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-600 flex-1">Task completed</span>
        <Button size="sm" variant="outline" onClick={() => window.location.href = `/bookings`}>
          <Star className="h-4 w-4 mr-1" />
          Leave Review
        </Button>
      </div>
    );
  }

  return null;
};