import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cancellation fee structure (like Uber)
const calculateCancellationFee = (
  timeUntilTask: number,
  taskAmount: number,
  cancelledBy: "task_giver" | "task_doer"
) => {
  const hoursUntilTask = timeUntilTask / (1000 * 60 * 60);
  
  if (cancelledBy === "task_giver") {
    // Task giver cancellation fees
    if (hoursUntilTask < 1) return taskAmount * 0.5; // 50% fee if < 1 hour
    if (hoursUntilTask < 24) return taskAmount * 0.25; // 25% fee if < 24 hours
    return 5; // $5 flat fee otherwise
  } else {
    // Task doer cancellation fees
    if (hoursUntilTask < 2) return taskAmount * 0.3; // 30% penalty if < 2 hours
    if (hoursUntilTask < 24) return taskAmount * 0.15; // 15% penalty if < 24 hours
    return 0; // No fee if > 24 hours
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { bookingId, reason } = await req.json();
    
    if (!bookingId) throw new Error("Booking ID is required");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get booking details
    const { data: booking } = await supabaseClient
      .from("bookings")
      .select(`
        *,
        tasks(
          id,
          pay_amount,
          scheduled_date,
          task_giver_id,
          task_giver:profiles!tasks_task_giver_id_fkey(stripe_customer_id)
        )
      `)
      .eq("id", bookingId)
      .single();

    if (!booking) throw new Error("Booking not found");
    if (booking.status === "cancelled" || booking.status === "completed") {
      throw new Error("Cannot cancel this booking");
    }

    const isTaskGiver = user.id === booking.tasks.task_giver_id;
    const isTaskDoer = user.id === booking.task_doer_id;
    
    if (!isTaskGiver && !isTaskDoer) {
      throw new Error("Not authorized to cancel this booking");
    }

    // Calculate time until task
    const scheduledDate = new Date(booking.tasks.scheduled_date);
    const now = new Date();
    const timeUntilTask = scheduledDate.getTime() - now.getTime();

    // Calculate cancellation fee
    const cancellationFee = calculateCancellationFee(
      timeUntilTask,
      booking.tasks.pay_amount,
      isTaskGiver ? "task_giver" : "task_doer"
    );

    let refundAmount = 0;
    let stripeRefundId = null;

    // Get payment if exists
    const { data: payment } = await supabaseClient
      .from("payments")
      .select("*")
      .eq("booking_id", bookingId)
      .maybeSingle();

    if (payment && payment.status === "completed") {
      if (isTaskGiver) {
        // Task giver cancels - refund minus cancellation fee
        refundAmount = payment.amount - cancellationFee;
        
        if (refundAmount > 0 && payment.transaction_id) {
          const refund = await stripe.refunds.create({
            payment_intent: payment.transaction_id,
            amount: Math.round(refundAmount * 100),
            reason: "requested_by_customer",
          });
          stripeRefundId = refund.id;
        }

        // Charge cancellation fee if needed
        if (cancellationFee > 0 && booking.tasks.task_giver.stripe_customer_id) {
          await stripe.paymentIntents.create({
            amount: Math.round(cancellationFee * 100),
            currency: "cad",
            customer: booking.tasks.task_giver.stripe_customer_id,
            description: `Cancellation fee for booking ${bookingId}`,
            confirm: true,
            automatic_payment_methods: { enabled: true, allow_redirects: "never" },
          });
        }
      } else {
        // Task doer cancels - full refund to task giver, penalty to task doer
        if (payment.transaction_id) {
          const refund = await stripe.refunds.create({
            payment_intent: payment.transaction_id,
            amount: Math.round(payment.amount * 100),
          });
          stripeRefundId = refund.id;
        }
      }
    }

    // Record cancellation
    await supabaseClient.from("cancellations").insert({
      booking_id: bookingId,
      task_id: booking.tasks.id,
      cancelled_by: user.id,
      cancellation_reason: reason,
      cancellation_fee: cancellationFee,
      stripe_refund_id: stripeRefundId,
    });

    // Update booking status
    await supabaseClient
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    // Update profile cancellation stats
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("cancellation_count, completed_tasks, reliability_score")
      .eq("id", user.id)
      .single();

    const newCancellationCount = (profile?.cancellation_count || 0) + 1;
    const totalTasks = (profile?.completed_tasks || 0) + newCancellationCount;
    const cancellationRate = (newCancellationCount / totalTasks) * 100;
    const newReliabilityScore = Math.max(0, 100 - (cancellationRate * 2)); // Reduce reliability by 2x cancellation rate

    await supabaseClient
      .from("profiles")
      .update({
        cancellation_count: newCancellationCount,
        cancellation_rate: cancellationRate,
        reliability_score: newReliabilityScore,
      })
      .eq("id", user.id);

    return new Response(
      JSON.stringify({
        success: true,
        cancellationFee,
        refundAmount,
        message: `Booking cancelled. ${
          cancellationFee > 0
            ? `Cancellation fee: $${cancellationFee.toFixed(2)}.`
            : ""
        } ${
          refundAmount > 0
            ? `Refund of $${refundAmount.toFixed(2)} will be processed.`
            : ""
        }`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Cancellation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
