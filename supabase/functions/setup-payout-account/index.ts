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

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if payout account already exists
    const { data: existingAccount } = await supabaseClient
      .from("payout_accounts")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (existingAccount && existingAccount.account_status === "active") {
      return new Response(
        JSON.stringify({ 
          message: "Payout account already active",
          accountId: existingAccount.stripe_account_id 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Create Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: "express",
      country: "CA",
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${req.headers.get("origin")}/dashboard`,
      return_url: `${req.headers.get("origin")}/dashboard?payout_setup=success`,
      type: "account_onboarding",
    });

    // Save to database
    if (existingAccount) {
      await supabaseClient
        .from("payout_accounts")
        .update({ 
          stripe_account_id: account.id,
          account_status: "pending" 
        })
        .eq("user_id", user.id);
    } else {
      await supabaseClient
        .from("payout_accounts")
        .insert({
          user_id: user.id,
          stripe_account_id: account.id,
          account_status: "pending",
        });
    }

    return new Response(
      JSON.stringify({ 
        url: accountLink.url,
        accountId: account.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Payout account error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
