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
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { amount, bookingId, taskId, payeeId } = await req.json();
    
    if (!amount || !bookingId || !taskId || !payeeId) {
      throw new Error("Missing required parameters");
    }

    // Calculate fees and taxes
    const taskAmount = amount;
    const platformFee = taskAmount * 0.15; // 15% platform fee
    const tax = taskAmount * 0.05; // 5% GST
    const totalAmount = taskAmount + platformFee + tax;
    const payoutAmount = taskAmount - platformFee; // What task doer receives

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get or create Stripe customer
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabaseClient
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // Create payment intent with manual capture for escrow
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: "cad",
      customer: customerId,
      capture_method: "automatic", // Capture immediately but hold in escrow in our DB
      metadata: {
        booking_id: bookingId,
        task_id: taskId,
        payer_id: user.id,
        payee_id: payeeId,
        task_amount: taskAmount.toString(),
        platform_fee: platformFee.toString(),
        tax: tax.toString(),
        payout_amount: payoutAmount.toString(),
      },
      description: `SaskTask Payment - Booking ${bookingId}`,
    });

    // Create payment record in database with escrow status
    await supabaseClient
      .from("payments")
      .insert({
        booking_id: bookingId,
        task_id: taskId,
        payer_id: user.id,
        payee_id: payeeId,
        amount: totalAmount,
        platform_fee: platformFee,
        tax_deducted: tax,
        payout_amount: payoutAmount,
        payment_intent_id: paymentIntent.id,
        escrow_status: "held",
        status: "pending",
      });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Payment intent error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
