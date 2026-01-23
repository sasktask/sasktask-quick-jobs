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
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { paymentIntentId, bookingId } = await req.json();
    
    if (!paymentIntentId || !bookingId) {
      throw new Error("Missing required parameters");
    }

    // First, verify the authenticated user is the payer of this payment
    const { data: payment, error: fetchError } = await supabaseClient
      .from("payments")
      .select("payer_id, booking_id")
      .eq("payment_intent_id", paymentIntentId)
      .single();

    if (fetchError || !payment) {
      throw new Error("Payment not found");
    }

    if (payment.payer_id !== user.id) {
      throw new Error("Unauthorized: You are not the payer of this payment");
    }

    // Verify booking ID matches
    if (payment.booking_id !== bookingId) {
      throw new Error("Booking ID mismatch");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve payment intent to verify status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      throw new Error("Payment has not been completed yet");
    }

    // Update payment record - now safe because we verified ownership
    const { error: paymentError } = await supabaseClient
      .from("payments")
      .update({
        status: "completed",
        paid_at: new Date().toISOString(),
        transaction_id: paymentIntent.id,
      })
      .eq("payment_intent_id", paymentIntentId)
      .eq("payer_id", user.id); // Additional safety constraint

    if (paymentError) throw paymentError;

    // Update booking status
    const { error: bookingError } = await supabaseClient
      .from("bookings")
      .update({
        status: "in_progress",
        payment_agreed: true,
      })
      .eq("id", bookingId);

    if (bookingError) throw bookingError;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment confirmed and task started",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Payment confirmation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
