import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Saskatchewan tax rates (fetched from DB or defaults)
interface TaxCalculation {
  grossAmount: number;
  gstRate: number;
  gstAmount: number;
  pstRate: number;
  pstAmount: number;
  totalTax: number;
  platformFee: number;
  payoutAmount: number;
  totalCharge: number;
}

function calculateSaskatchewanTax(
  taskAmount: number,
  gstRate: number = 5.0,
  pstRate: number = 6.0
): TaxCalculation {
  const platformFeeRate = 15; // 15% platform fee
  
  const gstAmount = Math.round(taskAmount * (gstRate / 100) * 100) / 100;
  const pstAmount = Math.round(taskAmount * (pstRate / 100) * 100) / 100;
  const totalTax = gstAmount + pstAmount;
  const platformFee = Math.round(taskAmount * (platformFeeRate / 100) * 100) / 100;
  const payoutAmount = Math.round((taskAmount - platformFee) * 100) / 100;
  const totalCharge = Math.round((taskAmount + totalTax) * 100) / 100;

  return {
    grossAmount: taskAmount,
    gstRate,
    gstAmount,
    pstRate,
    pstAmount,
    totalTax,
    platformFee,
    payoutAmount,
    totalCharge,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
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

    // Fetch tax rates from config
    let gstRate = 5.0;
    let pstRate = 6.0;
    
    try {
      const { data: taxConfigs } = await supabaseClient
        .from("tax_configurations")
        .select("tax_type, rate")
        .eq("is_active", true);

      if (taxConfigs && Array.isArray(taxConfigs)) {
        for (const config of taxConfigs) {
          const cfg = config as { tax_type: string; rate: number };
          if (cfg.tax_type === "GST") gstRate = cfg.rate;
          if (cfg.tax_type === "PST") pstRate = cfg.rate;
        }
      }
    } catch (taxError) {
      console.log("Using default tax rates:", taxError);
    }

    // Calculate taxes using Saskatchewan rates
    const taxCalc = calculateSaskatchewanTax(amount, gstRate, pstRate);

    console.log("Tax calculation:", JSON.stringify(taxCalc));

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

    // Create payment intent with tax-inclusive amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(taxCalc.totalCharge * 100), // Convert to cents
      currency: "cad",
      customer: customerId,
      capture_method: "automatic",
      metadata: {
        booking_id: bookingId,
        task_id: taskId,
        payer_id: user.id,
        payee_id: payeeId,
        task_amount: taxCalc.grossAmount.toString(),
        platform_fee: taxCalc.platformFee.toString(),
        gst_amount: taxCalc.gstAmount.toString(),
        pst_amount: taxCalc.pstAmount.toString(),
        total_tax: taxCalc.totalTax.toString(),
        payout_amount: taxCalc.payoutAmount.toString(),
        province: "SK",
      },
      description: `SaskTask Payment - Booking ${bookingId} (GST: $${taxCalc.gstAmount}, PST: $${taxCalc.pstAmount})`,
    });

    // Create payment record in database with escrow status
    await supabaseClient
      .from("payments")
      .insert({
        booking_id: bookingId,
        task_id: taskId,
        payer_id: user.id,
        payee_id: payeeId,
        amount: taxCalc.totalCharge,
        platform_fee: taxCalc.platformFee,
        tax_deducted: taxCalc.totalTax,
        payout_amount: taxCalc.payoutAmount,
        payment_intent_id: paymentIntent.id,
        escrow_status: "held",
        status: "pending",
      });

    // Record tax calculation for reporting
    await supabaseAdmin
      .from("tax_calculations")
      .insert({
        payment_id: null, // Will be updated after payment completes
        booking_id: bookingId,
        user_id: user.id,
        gross_amount: taxCalc.grossAmount,
        gst_amount: taxCalc.gstAmount,
        pst_amount: taxCalc.pstAmount,
        contractor_withholding: 0,
        total_tax: taxCalc.totalTax,
        net_amount: taxCalc.payoutAmount,
        tax_breakdown: {
          gst_rate: taxCalc.gstRate,
          pst_rate: taxCalc.pstRate,
          platform_fee_rate: 15,
          province: "SK",
        },
        province: "SK",
      });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        taxBreakdown: {
          taskAmount: taxCalc.grossAmount,
          gstAmount: taxCalc.gstAmount,
          pstAmount: taxCalc.pstAmount,
          totalTax: taxCalc.totalTax,
          platformFee: taxCalc.platformFee,
          payoutAmount: taxCalc.payoutAmount,
          totalCharge: taxCalc.totalCharge,
        },
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