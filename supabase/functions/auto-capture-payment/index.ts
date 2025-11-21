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

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { paymentIntentId, bookingId } = await req.json();

    if (!paymentIntentId || !bookingId) {
      throw new Error("Payment Intent ID and Booking ID are required");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Capture the payment intent
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

    console.log("Payment captured:", paymentIntent.id);

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
  } catch (error: any) {
    console.error("Error in auto-capture-payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
