import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MINIMUM_BALANCE = 50;

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
    
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const { data: userData } = await anonClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { amount } = await req.json();
    if (!amount) throw new Error("Amount is required");

    // Get current wallet balance
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    const currentBalance = profile?.wallet_balance || 0;
    const newBalance = currentBalance + amount;

    // Update wallet balance
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({
        wallet_balance: newBalance,
        minimum_balance_met: newBalance >= MINIMUM_BALANCE,
      })
      .eq("id", user.id);

    if (updateError) throw updateError;

    // Record transaction
    await supabaseClient.from("wallet_transactions").insert({
      user_id: user.id,
      amount: amount,
      transaction_type: "deposit",
      description: `Wallet deposit of $${amount}`,
      balance_after: newBalance,
    });

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
    console.error("Confirm wallet deposit error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
