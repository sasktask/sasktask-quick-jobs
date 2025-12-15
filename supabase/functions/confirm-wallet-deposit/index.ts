import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MINIMUM_BALANCE = 50;

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CONFIRM-WALLET-DEPOSIT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user");

    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError) {
      logStep("Auth error", { error: authError.message });
      throw new Error(`Authentication failed: ${authError.message}`);
    }

    const user = userData.user;
    if (!user) {
      throw new Error("User not authenticated");
    }
    logStep("User authenticated", { userId: user.id });

    const body = await req.json();
    const amount = body.amount;
    logStep("Request body", { amount });

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    // Get current wallet balance or create profile if it doesn't exist
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("wallet_balance, email")
      .eq("id", user.id)
      .maybeSingle();

    let currentBalance = 0;
    
    if (profileError) {
      logStep("Profile fetch error", { error: profileError.message });
      throw new Error(`Failed to fetch profile: ${profileError.message}`);
    }

    if (profile) {
      currentBalance = profile.wallet_balance || 0;
      logStep("Found existing profile", { currentBalance });
    } else {
      // Profile doesn't exist, we'll create it
      logStep("No profile found, will create one");
    }

    const newBalance = currentBalance + amount;
    logStep("Balance calculation", { currentBalance, amount, newBalance });

    // Upsert profile with wallet balance (creates if doesn't exist, updates if exists)
    const { error: upsertError } = await supabaseClient
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email || '',
        wallet_balance: newBalance,
        minimum_balance_met: newBalance >= MINIMUM_BALANCE,
        updated_at: new Date().toISOString(),
      }, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });

    if (upsertError) {
      logStep("Upsert error", { error: upsertError.message });
      throw new Error(`Failed to update balance: ${upsertError.message}`);
    }
    logStep("Balance updated successfully");

    // Record transaction
    const { error: txnError } = await supabaseClient.from("wallet_transactions").insert({
      user_id: user.id,
      amount: amount,
      transaction_type: "deposit",
      description: `Wallet deposit of $${amount.toFixed(2)}`,
      balance_after: newBalance,
    });

    if (txnError) {
      logStep("Transaction record error", { error: txnError.message });
      // Don't throw - balance was already updated
    } else {
      logStep("Transaction recorded");
    }

    return new Response(
      JSON.stringify({
        success: true,
        newBalance,
        minimumBalanceMet: newBalance >= MINIMUM_BALANCE,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
