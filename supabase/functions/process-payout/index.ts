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
    const { paymentId } = await req.json();
    
    if (!paymentId) {
      throw new Error("Payment ID is required");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get payment details
    const { data: payment } = await supabaseClient
      .from("payments")
      .select("*, payout_accounts!payments_payee_id_fkey(stripe_account_id, account_status)")
      .eq("id", paymentId)
      .single();

    if (!payment) throw new Error("Payment not found");
    if (payment.escrow_status !== "held") throw new Error("Payment not in escrow");

    const payoutAccount = payment.payout_accounts;
    if (!payoutAccount || payoutAccount.account_status !== "active") {
      throw new Error("Payee does not have an active payout account");
    }

    // Create transfer to connected account
    const transfer = await stripe.transfers.create({
      amount: Math.round(payment.payout_amount * 100), // Convert to cents
      currency: "cad",
      destination: payoutAccount.stripe_account_id,
      description: `Payout for booking ${payment.booking_id}`,
      metadata: {
        payment_id: paymentId,
        booking_id: payment.booking_id,
      },
    });

    // Update payment status
    await supabaseClient
      .from("payments")
      .update({
        escrow_status: "released",
        released_at: new Date().toISOString(),
        payout_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    return new Response(
      JSON.stringify({
        success: true,
        transferId: transfer.id,
        amount: payment.payout_amount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Payout error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
