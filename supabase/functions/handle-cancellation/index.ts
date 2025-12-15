import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MINIMUM_BALANCE = 50;
const CANCELLATION_PENALTY_RATE = 0.25; // 25% of task price

// Calculate penalty based on booking status and timing
const calculateCancellationPenalty = (
  taskAmount: number,
  bookingStatus: string,
  hoursUntilTask: number
): { penaltyAmount: number; affectsTrustScore: boolean } => {
  // After acceptance, 25% penalty always applies unless 24h+ notice
  if (bookingStatus === "accepted" || bookingStatus === "in_progress") {
    if (hoursUntilTask >= 24) {
      // Full refund if 24h+ notice - no penalty
      return { penaltyAmount: 0, affectsTrustScore: false };
    }
    // 25% penalty for late cancellation
    return { 
      penaltyAmount: taskAmount * CANCELLATION_PENALTY_RATE, 
      affectsTrustScore: true 
    };
  }
  
  // Before acceptance - no penalty
  return { penaltyAmount: 0, affectsTrustScore: false };
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

    const { bookingId, taskId, reason, cancelledBy, cancellationFee } = await req.json();
    
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

    // Calculate penalty based on task amount and timing
    const taskAmount = booking.tasks.pay_amount;
    const scheduledDate = booking.tasks.scheduled_date ? new Date(booking.tasks.scheduled_date) : null;
    const hoursUntilTask = scheduledDate 
      ? (scheduledDate.getTime() - Date.now()) / (1000 * 60 * 60) 
      : 999;
    
    const { penaltyAmount, affectsTrustScore } = calculateCancellationPenalty(
      taskAmount,
      booking.status,
      hoursUntilTask
    );

    // Get user's wallet balance
    const { data: userProfile } = await supabaseClient
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user.id)
      .single();

    const walletBalance = userProfile?.wallet_balance || 0;

    // Check if user has enough balance to cover penalty
    if (penaltyAmount > 0 && walletBalance < penaltyAmount) {
      throw new Error(`Insufficient wallet balance. You need at least $${penaltyAmount.toFixed(2)} to cover the cancellation penalty. Current balance: $${walletBalance.toFixed(2)}`);
    }

    let refundAmount = 0;
    let stripeRefundId = null;

    // Get payment if exists
    const { data: payment } = await supabaseClient
      .from("payments")
      .select("*")
      .eq("booking_id", bookingId)
      .maybeSingle();

    // Deduct penalty from wallet if applicable
    if (penaltyAmount > 0) {
      const newBalance = walletBalance - penaltyAmount;
      
      // Update wallet balance
      await supabaseClient
        .from("profiles")
        .update({
          wallet_balance: newBalance,
          minimum_balance_met: newBalance >= MINIMUM_BALANCE,
        })
        .eq("id", user.id);

      // Record penalty transaction
      await supabaseClient.from("wallet_transactions").insert({
        user_id: user.id,
        amount: -penaltyAmount,
        transaction_type: "penalty",
        description: `Cancellation penalty (25% of $${taskAmount})`,
        related_booking_id: bookingId,
        related_task_id: taskId,
        balance_after: newBalance,
      });
    }

    if (payment && payment.status === "completed") {
      // Full refund to the payer since penalty is from wallet
      if (payment.payment_intent_id) {
        const refund = await stripe.refunds.create({
          payment_intent: payment.payment_intent_id,
          amount: Math.round(payment.amount * 100),
          reason: "requested_by_customer",
        });
        stripeRefundId = refund.id;
        refundAmount = payment.amount;
      }
    }

    // Record cancellation
    await supabaseClient.from("cancellations").insert({
      booking_id: bookingId,
      task_id: taskId,
      cancelled_by: user.id,
      cancellation_reason: reason,
      cancellation_fee: penaltyAmount,
      stripe_refund_id: stripeRefundId,
    });

    // Update booking status
    await supabaseClient
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    // Update profile cancellation stats and trust score if penalty applies
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("cancellation_count, completed_tasks, reliability_score, trust_score")
      .eq("id", user.id)
      .single();

    const newCancellationCount = (profile?.cancellation_count || 0) + 1;
    const totalTasks = (profile?.completed_tasks || 0) + newCancellationCount;
    const cancellationRate = (newCancellationCount / totalTasks) * 100;
    
    // More severe impact on trust and reliability for penalty cancellations
    let newReliabilityScore = profile?.reliability_score || 100;
    let newTrustScore = profile?.trust_score || 100;
    
    if (affectsTrustScore) {
      // Significant penalty impact - reduce by 10 points for each penalty cancellation
      newReliabilityScore = Math.max(0, newReliabilityScore - 10);
      newTrustScore = Math.max(0, newTrustScore - 5);
    } else {
      // Minor impact for free cancellations (24h+ notice)
      newReliabilityScore = Math.max(0, 100 - (cancellationRate * 1.5));
    }

    await supabaseClient
      .from("profiles")
      .update({
        cancellation_count: newCancellationCount,
        cancellation_rate: cancellationRate,
        reliability_score: newReliabilityScore,
        trust_score: newTrustScore,
      })
      .eq("id", user.id);

    return new Response(
      JSON.stringify({
        success: true,
        penaltyAmount,
        refundAmount,
        affectedTrustScore: affectsTrustScore,
        message: `Booking cancelled. ${
          penaltyAmount > 0
            ? `$${penaltyAmount.toFixed(2)} penalty deducted from your wallet.`
            : ""
        } ${
          affectsTrustScore
            ? "Your trust score has been impacted."
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
