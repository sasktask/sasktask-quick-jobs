import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AutoReleaseStatus {
  paymentId: string | null;
  escrowStatus: string | null;
  autoReleaseAt: string | null;
  taskGiverConfirmed: boolean;
  taskDoerConfirmed: boolean;
  releaseType: string | null;
  hoursRemaining: number | null;
  isAutoReleaseScheduled: boolean;
}

export const useAutoReleaseStatus = (bookingId: string | null) => {
  const [status, setStatus] = useState<AutoReleaseStatus>({
    paymentId: null,
    escrowStatus: null,
    autoReleaseAt: null,
    taskGiverConfirmed: false,
    taskDoerConfirmed: false,
    releaseType: null,
    hoursRemaining: null,
    isAutoReleaseScheduled: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!bookingId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          id,
          escrow_status,
          auto_release_at,
          task_giver_confirmed,
          task_doer_confirmed,
          release_type
        `)
        .eq("booking_id", bookingId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const autoReleaseAt = data.auto_release_at as string | null;
        let hoursRemaining: number | null = null;

        if (autoReleaseAt) {
          const releaseDate = new Date(autoReleaseAt);
          const now = new Date();
          hoursRemaining = Math.max(0, Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60)));
        }

        setStatus({
          paymentId: data.id,
          escrowStatus: data.escrow_status,
          autoReleaseAt,
          taskGiverConfirmed: data.task_giver_confirmed ?? false,
          taskDoerConfirmed: data.task_doer_confirmed ?? false,
          releaseType: data.release_type as string | null,
          hoursRemaining,
          isAutoReleaseScheduled: !!autoReleaseAt && data.escrow_status === "held",
        });
      }
    } catch (error) {
      console.error("Error fetching auto-release status:", error);
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchStatus();

    if (!bookingId) return;

    // Subscribe to payment changes
    const channel = supabase
      .channel(`auto-release-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
          filter: `booking_id=eq.${bookingId}`,
        },
        () => {
          fetchStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, fetchStatus]);

  return {
    ...status,
    isLoading,
    refresh: fetchStatus,
  };
};
