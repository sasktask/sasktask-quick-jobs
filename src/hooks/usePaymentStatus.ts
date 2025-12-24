import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentStatus {
  id: string;
  status: string;
  escrowStatus: string | null;
  amount: number;
  paidAt: string | null;
  releasedAt: string | null;
}

export const usePaymentStatus = (bookingId: string | null) => {
  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayment = useCallback(async () => {
    if (!bookingId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from("payments")
        .select("*")
        .eq("booking_id", bookingId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setPayment({
          id: data.id,
          status: data.status || "pending",
          escrowStatus: data.escrow_status,
          amount: data.amount,
          paidAt: data.paid_at,
          releasedAt: data.released_at
        });
      }
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching payment:", err);
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchPayment();

    if (!bookingId) return;

    // Subscribe to payment changes
    const channel = supabase
      .channel(`payment-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `booking_id=eq.${bookingId}`
        },
        (payload) => {
          const { new: newRecord, eventType } = payload;
          
          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            setPayment({
              id: newRecord.id,
              status: newRecord.status || "pending",
              escrowStatus: newRecord.escrow_status,
              amount: newRecord.amount,
              paidAt: newRecord.paid_at,
              releasedAt: newRecord.released_at
            });

            // Show notification on status change
            if (eventType === 'UPDATE') {
              if (newRecord.status === 'held') {
                toast.success("Payment secured in escrow");
              } else if (newRecord.status === 'released') {
                toast.success("Payment has been released!");
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, fetchPayment]);

  const initiatePayment = async (amount: number, taskId: string, payeeId: string, payerId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          bookingId,
          taskId,
          amount,
          payeeId,
          payerId
        }
      });

      if (error) throw error;
      return data;
    } catch (err: any) {
      toast.error("Failed to initiate payment");
      throw err;
    }
  };

  const releasePayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from("payments")
        .update({ 
          status: "completed" as const,
          escrow_status: "released",
          released_at: new Date().toISOString()
        })
        .eq("id", paymentId);

      if (error) throw error;
      toast.success("Payment released to tasker");
      return true;
    } catch (err: any) {
      toast.error("Failed to release payment");
      return false;
    }
  };

  return {
    payment,
    isLoading,
    error,
    refreshPayment: fetchPayment,
    initiatePayment,
    releasePayment,
    isPaid: payment?.status === "held" || payment?.status === "released",
    isInEscrow: payment?.escrowStatus === "held",
    isReleased: payment?.status === "released"
  };
};
