import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - No authorization header" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claims?.claims?.sub) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const userId = claims.claims.sub;
    const { paymentIntentId, bookingId } = await req.json();

    if (!paymentIntentId || !bookingId) {
      throw new Error("Payment Intent ID and Booking ID are required");
    }

    // Verify user is authorized to capture this payment (must be the payer or task giver)
    const { data: payment, error: paymentFetchError } = await supabaseClient
      .from("payments")
      .select("payer_id, task_id")
      .eq("payment_intent_id", paymentIntentId)
      .eq("booking_id", bookingId)
      .single();

    if (paymentFetchError || !payment) {
      throw new Error("Payment not found");
    }

    if (payment.payer_id !== userId) {
      // Check if user is the task giver
      const { data: task } = await supabaseClient
        .from("tasks")
        .select("task_giver_id")
        .eq("id", payment.task_id)
        .single();
      
      if (!task || task.task_giver_id !== userId) {
        return new Response(
          JSON.stringify({ error: "Unauthorized - Not the payer or task owner" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        );
      }
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Capture the payment intent
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    console.log("Payment captured:", paymentIntent.id, "by user:", userId);

    // Update payment record
    const { error: updateError } = await supabaseClient
      .from("payments")
      .update({
        status: "completed",
        escrow_status: "held",
        paid_at: new Date().toISOString(),
      })
      .eq("payment_intent_id", paymentIntentId);

    if (updateError) throw updateError;

    // Update booking to in_progress
    const { error: bookingError } = await supabaseClient
      .from("bookings")
      .update({
        status: "in_progress",
        payment_agreed: true,
      })
      .eq("id", bookingId);

    if (bookingError) throw bookingError;

    // Create audit log
    await supabaseClient.rpc("log_audit_event", {
      p_booking_id: bookingId,
      p_task_id: payment.task_id,
      p_user_id: userId,
      p_event_type: "payment_captured",
      p_event_category: "payment",
      p_event_data: { payment_intent_id: paymentIntentId, amount: paymentIntent.amount / 100 },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment captured and held in escrow",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Error in auto-capture-payment:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unknown error occurred" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
