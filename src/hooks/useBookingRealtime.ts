import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BookingUpdate {
  id: string;
  status: string;
  updated_at: string;
}

export const useBookingRealtime = (userId: string | null) => {
  const [bookingUpdates, setBookingUpdates] = useState<BookingUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const handleBookingChange = useCallback((payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    if (eventType === "UPDATE" && newRecord.status !== oldRecord?.status) {
      setBookingUpdates(prev => [...prev, {
        id: newRecord.id,
        status: newRecord.status,
        updated_at: newRecord.updated_at
      }]);

      // Show toast notification
      const statusMessages: Record<string, string> = {
        accepted: "Your booking has been accepted! 🎉",
        rejected: "A booking was declined",
        in_progress: "Task is now in progress",
        completed: "Task has been completed! ✅",
        cancelled: "Booking was cancelled",
      };

      const message = statusMessages[newRecord.status];
      if (message) {
        toast.info(message, {
          description: "Check your bookings for details",
          action: {
            label: "View",
            onClick: () => window.location.href = "/bookings"
          }
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('booking-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        handleBookingChange
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, handleBookingChange]);

  return { bookingUpdates, isConnected };
};
