import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REQUEST-WITHDRAWAL] ${step}${detailsStr}`);
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
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { amount } = await req.json();
    if (!amount || amount <= 0) throw new Error("Invalid withdrawal amount");
    logStep("Withdrawal requested", { amount });

    // Check payout account
    const { data: payoutAccount } = await supabaseClient
      .from("payout_accounts")
      .select("*")
      .eq("user_id", user.id)
      .eq("account_status", "active")
      .single();

    if (!payoutAccount) {
      throw new Error("No active payout account found. Please set up your bank details first.");
    }
    logStep("Payout account verified", { accountId: payoutAccount.id });

    // Get payments in escrow for this user
    const { data: escrowPayments } = await supabaseClient
      .from("payments")
      .select("id, payout_amount")
      .eq("payee_id", user.id)
      .eq("escrow_status", "held");

    if (!escrowPayments || escrowPayments.length === 0) {
      throw new Error("No funds available for withdrawal");
    }

    const totalAvailable = escrowPayments.reduce((sum, p) => sum + (p.payout_amount || 0), 0);
    logStep("Available balance", { totalAvailable });

    if (amount > totalAvailable) {
      throw new Error(`Requested amount ($${amount}) exceeds available balance ($${totalAvailable.toFixed(2)})`);
    }

    // Process withdrawals - mark payments as released
    let remainingAmount = amount;
    const processedPayments: string[] = [];

    for (const payment of escrowPayments) {
      if (remainingAmount <= 0) break;

      if (payment.payout_amount <= remainingAmount) {
        // Release entire payment
        await supabaseClient
          .from("payments")
          .update({
            escrow_status: "released",
            released_at: new Date().toISOString(),
            payout_at: new Date().toISOString()
          })
          .eq("id", payment.id);

        remainingAmount -= payment.payout_amount;
        processedPayments.push(payment.id);
        logStep("Payment released", { paymentId: payment.id, amount: payment.payout_amount });
      }
    }

    // Create notification for the user
    await supabaseClient
      .from("notifications")
      .insert({
        user_id: user.id,
        title: "Withdrawal Requested",
        message: `Your withdrawal of $${amount.toFixed(2)} has been submitted for processing.`,
        type: "payout",
        link: "/payouts"
      });

    logStep("Withdrawal processed successfully", { 
      amount, 
      processedPayments: processedPayments.length 
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: `Withdrawal of $${amount.toFixed(2)} has been requested`,
      processedPayments: processedPayments.length,
      amount
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to process withdrawal request" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
