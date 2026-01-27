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

// Saskatchewan tax rates
const GST_RATE = 0.05; // 5% Federal GST
const PST_RATE = 0.06; // 6% Saskatchewan PST
const INSTANT_FEE = 0.50; // $0.50 instant transfer fee

interface WithdrawalBreakdown {
  grossAmount: number;
  instantFee: number;
  netAmount: number;
  estimatedGST: number;
  estimatedPST: number;
  estimatedTaxLiability: number;
}

function calculateWithdrawalBreakdown(amount: number, isInstant: boolean = false): WithdrawalBreakdown {
  const instantFee = isInstant ? INSTANT_FEE : 0;
  const netAmount = Math.round((amount - instantFee) * 100) / 100;
  
  // Tax is informational - user is responsible for paying
  const estimatedGST = Math.round(amount * GST_RATE * 100) / 100;
  const estimatedPST = Math.round(amount * PST_RATE * 100) / 100;
  const estimatedTaxLiability = estimatedGST + estimatedPST;

  return {
    grossAmount: amount,
    instantFee,
    netAmount,
    estimatedGST,
    estimatedPST,
    estimatedTaxLiability
  };
}

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

    const { amount, isInstant = false, taxBreakdown } = await req.json();
    if (!amount || amount <= 0) throw new Error("Invalid withdrawal amount");
    logStep("Withdrawal requested", { amount, isInstant });

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

    // Get payments in escrow for this user (these are already net of platform fee)
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

    // Calculate the withdrawal breakdown
    const breakdown = calculateWithdrawalBreakdown(amount, isInstant);
    logStep("Withdrawal breakdown calculated", breakdown);

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
            payout_at: new Date().toISOString(),
            release_type: isInstant ? "instant" : "manual"
          })
          .eq("id", payment.id);

        remainingAmount -= payment.payout_amount;
        processedPayments.push(payment.id);
        logStep("Payment released", { paymentId: payment.id, amount: payment.payout_amount });
      }
    }

    // Record the tax calculation for audit trail
    await supabaseClient
      .from("tax_calculations")
      .insert({
        user_id: user.id,
        gross_amount: breakdown.grossAmount,
        gst_amount: breakdown.estimatedGST,
        pst_amount: breakdown.estimatedPST,
        contractor_withholding: 0,
        total_tax: breakdown.estimatedTaxLiability,
        net_amount: breakdown.netAmount,
        tax_breakdown: {
          type: "withdrawal",
          is_instant: isInstant,
          instant_fee: breakdown.instantFee,
          gst_rate: GST_RATE * 100,
          pst_rate: PST_RATE * 100,
          note: "Tax amounts are informational. User responsible for tax payment."
        },
        province: "SK"
      });

    // Create notification for the user
    await supabaseClient
      .from("notifications")
      .insert({
        user_id: user.id,
        title: isInstant ? "⚡ Instant Payout Sent!" : "💰 Withdrawal Requested",
        message: isInstant 
          ? `$${breakdown.netAmount.toFixed(2)} is on its way to your bank ending in ${payoutAccount.bank_last4}. Arrives in minutes.`
          : `Your withdrawal of $${breakdown.netAmount.toFixed(2)} has been submitted. Funds will arrive in 2-3 business days.`,
        type: "payout",
        link: "/payouts"
      });

    logStep("Withdrawal processed successfully", { 
      amount: breakdown.grossAmount,
      netAmount: breakdown.netAmount,
      instantFee: breakdown.instantFee,
      estimatedTax: breakdown.estimatedTaxLiability,
      processedPayments: processedPayments.length,
      isInstant
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: isInstant 
        ? `Instant payout of $${breakdown.netAmount.toFixed(2)} is on its way!`
        : `Withdrawal of $${breakdown.netAmount.toFixed(2)} has been requested`,
      breakdown: {
        grossAmount: breakdown.grossAmount,
        instantFee: breakdown.instantFee,
        netAmount: breakdown.netAmount,
        estimatedTaxLiability: breakdown.estimatedTaxLiability
      },
      processedPayments: processedPayments.length,
      isInstant
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
