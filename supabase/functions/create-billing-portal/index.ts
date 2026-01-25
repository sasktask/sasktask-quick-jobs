import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Authentication failed");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Find or create Stripe customer
    const { data: financialData } = await supabaseClient
      .from("user_financial_data")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    let customerId = financialData?.stripe_customer_id;

    if (!customerId) {
      // Search for existing customer by email
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { user_id: user.id },
        });
        customerId = customer.id;
      }

      // Save customer ID
      await supabaseClient
        .from("user_financial_data")
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
    }

    // Get the return URL from request body
    const { return_url } = await req.json().catch(() => ({}));
    const returnUrl = return_url || `${req.headers.get("origin")}/account`;

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    console.log(`Billing portal session created for user ${user.id}`);

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Billing portal error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
