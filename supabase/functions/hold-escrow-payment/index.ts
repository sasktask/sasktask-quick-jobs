import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[HOLD-ESCROW-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !userData.user) {
      logStep("Auth error", { error: authError?.message });
      throw new Error("Authentication failed");
    }

    const user = userData.user;
    logStep("User authenticated", { userId: user.id });

    // Parse request body
    const body = await req.json();
    const { 
      taskId, 
      bookingId, 
      amount, 
      taskDoerId, 
      description 
    } = body;

    logStep("Request body", { taskId, bookingId, amount, taskDoerId });

    if (!taskId || !bookingId || !amount || !taskDoerId) {
      throw new Error("Missing required fields: taskId, bookingId, amount, taskDoerId");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Get current wallet balance
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("wallet_balance, full_name")
      .eq("id", user.id)
      .single();

    if (profileError) {
      logStep("Profile fetch error", { error: profileError.message });
      throw new Error("Failed to fetch wallet balance");
    }

    const currentBalance = profile?.wallet_balance || 0;
    logStep("Current balance", { currentBalance, requiredAmount: amount });

    // Check if user has sufficient balance
    if (currentBalance < amount) {
      throw new Error(`Insufficient balance. You have $${currentBalance.toFixed(2)} but need $${amount.toFixed(2)}`);
    }

    // Calculate new balance after hold
    const newBalance = currentBalance - amount;
    const platformFee = amount * 0.15;
    const taskerPayout = amount - platformFee;

    logStep("Calculating hold", { 
      currentBalance, 
      holdAmount: amount, 
      newBalance,
      platformFee,
      taskerPayout 
    });

    // Start transaction - Update wallet balance
    const { error: balanceUpdateError } = await supabaseClient
      .from("profiles")
      .update({
        wallet_balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (balanceUpdateError) {
      logStep("Balance update error", { error: balanceUpdateError.message });
      throw new Error("Failed to hold payment from wallet");
    }

    logStep("Wallet balance updated", { newBalance });

    // Record the wallet transaction
    const { error: txnError } = await supabaseClient
      .from("wallet_transactions")
      .insert({
        user_id: user.id,
        amount: -amount, // Negative for deduction
        transaction_type: "escrow_hold",
        description: description || `Escrow hold for task booking`,
        related_booking_id: bookingId,
        related_task_id: taskId,
        balance_after: newBalance,
      });

    if (txnError) {
      logStep("Transaction record error", { error: txnError.message });
      // Try to rollback the balance update
      await supabaseClient
        .from("profiles")
        .update({ wallet_balance: currentBalance })
        .eq("id", user.id);
      throw new Error("Failed to record transaction");
    }

    logStep("Transaction recorded");

    // Create payment record in escrow status
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .insert({
        booking_id: bookingId,
        task_id: taskId,
        payer_id: user.id,
        payee_id: taskDoerId,
        amount: amount,
        platform_fee: platformFee,
        payout_amount: taskerPayout,
        status: "held",
        escrow_status: "held",
        payment_method: "wallet",
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      logStep("Payment record error", { error: paymentError.message });
      // Rollback: restore balance and delete transaction
      await supabaseClient
        .from("profiles")
        .update({ wallet_balance: currentBalance })
        .eq("id", user.id);
      throw new Error("Failed to create payment record");
    }

    logStep("Payment record created", { paymentId: payment.id });

    // Update booking with deposit info
    const { error: bookingUpdateError } = await supabaseClient
      .from("bookings")
      .update({
        deposit_paid: true,
        payment_agreed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (bookingUpdateError) {
      logStep("Booking update warning", { error: bookingUpdateError.message });
      // Non-critical, continue
    }

    // Log audit event
    await supabaseClient
      .from("audit_trail_events")
      .insert({
        user_id: user.id,
        booking_id: bookingId,
        task_id: taskId,
        event_type: "escrow_payment_held",
        event_category: "payment",
        event_data: {
          amount,
          platform_fee: platformFee,
          tasker_payout: taskerPayout,
          payment_method: "wallet",
          previous_balance: currentBalance,
          new_balance: newBalance,
        },
      });

    logStep("Audit event logged");

    // Send notification to task doer
    await supabaseClient
      .from("notifications")
      .insert({
        user_id: taskDoerId,
        title: "Payment Secured! 💰",
        message: `$${amount.toFixed(2)} has been secured in escrow for your task. You'll receive $${taskerPayout.toFixed(2)} upon completion.`,
        type: "payment",
        link: "/bookings",
      });

    logStep("Notification sent to tasker");

    return new Response(
      JSON.stringify({
        success: true,
        paymentId: payment.id,
        holdAmount: amount,
        newBalance,
        platformFee,
        taskerPayout,
        message: "Payment held in escrow successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
