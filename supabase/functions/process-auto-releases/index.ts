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
    console.log("Processing pending auto-releases...");

    // Find payments ready for auto-release
    const { data: pendingPayments, error: fetchError } = await supabaseClient
      .from("payments")
      .select(`
        id,
        booking_id,
        task_id,
        payee_id,
        payer_id,
        amount,
        payout_amount,
        payment_intent_id,
        auto_release_at
      `)
      .eq("escrow_status", "held")
      .eq("auto_release_triggered", false)
      .not("auto_release_at", "is", null)
      .lte("auto_release_at", new Date().toISOString());

    if (fetchError) throw fetchError;

    if (!pendingPayments || pendingPayments.length === 0) {
      console.log("No pending auto-releases found");
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: "No pending releases" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    console.log(`Found ${pendingPayments.length} payments to auto-release`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const results = [];

    for (const payment of pendingPayments) {
      try {
        // Check for active disputes
        const { data: disputes } = await supabaseClient
          .from("disputes")
          .select("id, status")
          .eq("booking_id", payment.booking_id)
          .in("status", ["open", "investigating"]);

        if (disputes && disputes.length > 0) {
          console.log(`Skipping payment ${payment.id} - active dispute exists`);
          results.push({ id: payment.id, status: "skipped", reason: "active_dispute" });
          continue;
        }

        // Get payout account for tasker
        const { data: payoutAccount } = await supabaseClient
          .from("payout_accounts")
          .select("stripe_account_id, account_status")
          .eq("user_id", payment.payee_id)
          .eq("account_status", "active")
          .single();

        // Update payment to released
        const { error: updateError } = await supabaseClient
          .from("payments")
          .update({
            escrow_status: "released",
            released_at: new Date().toISOString(),
            release_type: "auto_72hr",
            auto_release_triggered: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment.id);

        if (updateError) throw updateError;

        // Update task to completed
        await supabaseClient
          .from("tasks")
          .update({ status: "completed" })
          .eq("id", payment.task_id);

        // If payout account exists, trigger Stripe transfer
        if (payoutAccount?.stripe_account_id) {
          try {
            const transfer = await stripe.transfers.create({
              amount: Math.round(payment.payout_amount * 100),
              currency: "cad",
              destination: payoutAccount.stripe_account_id,
              description: `Auto-release payout for booking ${payment.booking_id}`,
              metadata: {
                payment_id: payment.id,
                booking_id: payment.booking_id,
                release_type: "auto_72hr",
              },
            });

            await supabaseClient
              .from("payments")
              .update({ payout_at: new Date().toISOString() })
              .eq("id", payment.id);

            console.log(`Stripe transfer created: ${transfer.id}`);
          } catch (stripeError) {
            console.error(`Stripe transfer failed for payment ${payment.id}:`, stripeError);
          }
        }

        // Create notifications
        await supabaseClient.from("notifications").insert([
          {
            user_id: payment.payee_id,
            title: "Payment Auto-Released! 💰",
            message: `Your payment of $${payment.payout_amount.toFixed(2)} has been automatically released after 72 hours.`,
            type: "payment",
            link: "/payments",
          },
          {
            user_id: payment.payer_id,
            title: "Payment Released",
            message: `Payment of $${payment.amount.toFixed(2)} was automatically released to the tasker.`,
            type: "payment",
            link: "/bookings",
          },
        ]);

        results.push({ id: payment.id, status: "released" });
        console.log(`Successfully auto-released payment ${payment.id}`);
      } catch (paymentError) {
        console.error(`Error processing payment ${payment.id}:`, paymentError);
        results.push({ 
          id: payment.id, 
          status: "error", 
          error: paymentError instanceof Error ? paymentError.message : "Unknown error" 
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Auto-release processing error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unknown error occurred" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
