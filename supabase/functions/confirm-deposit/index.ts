import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CONFIRM-DEPOSIT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { taskId, sessionId } = await req.json();
    if (!taskId) throw new Error("Task ID is required");
    logStep("Confirming deposit", { taskId, sessionId });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
    });

    // If sessionId provided, verify the payment
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      logStep("Session retrieved", { status: session.payment_status, metadata: session.metadata });

      if (session.payment_status === 'paid' && session.metadata?.taskId === taskId) {
        // Update task as deposit paid
        const { error: updateError } = await supabaseClient
          .from('tasks')
          .update({
            deposit_paid: true,
            deposit_paid_at: new Date().toISOString(),
            deposit_payment_intent_id: session.payment_intent as string,
          })
          .eq('id', taskId)
          .eq('task_giver_id', user.id);

        if (updateError) {
          logStep("Update error", { error: updateError.message });
          throw new Error("Failed to update task deposit status");
        }

        logStep("Deposit confirmed successfully");
        return new Response(JSON.stringify({ 
          success: true, 
          message: "Deposit confirmed successfully" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    // Check current task status
    const { data: task, error: taskError } = await supabaseClient
      .from('tasks')
      .select('deposit_paid, deposit_amount, requires_deposit')
      .eq('id', taskId)
      .single();

    if (taskError) throw new Error("Task not found");

    return new Response(JSON.stringify({ 
      success: task?.deposit_paid || false,
      depositPaid: task?.deposit_paid || false,
      depositAmount: task?.deposit_amount || 0,
      requiresDeposit: task?.requires_deposit || false,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
