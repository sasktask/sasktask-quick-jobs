import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REFUND-DEPOSIT] ${step}${detailsStr}`);
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

    const { taskId } = await req.json();
    if (!taskId) throw new Error("Task ID is required");

    // Get the task
    const { data: task, error: taskError } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (taskError || !task) throw new Error("Task not found");
    if (task.task_giver_id !== user.id) throw new Error("You can only refund your own tasks");
    if (!task.deposit_paid || !task.deposit_payment_intent_id) {
      throw new Error("No deposit to refund");
    }

    // Check if task is scheduled more than 24 hours away
    if (task.scheduled_date) {
      const scheduledDate = new Date(task.scheduled_date);
      const now = new Date();
      const hoursUntilTask = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilTask < 24) {
        throw new Error("Cancellations within 24 hours are not eligible for deposit refund");
      }
    }

    logStep("Processing refund", { taskId, paymentIntentId: task.deposit_payment_intent_id });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
    });

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: task.deposit_payment_intent_id,
      reason: 'requested_by_customer',
    });

    logStep("Refund created", { refundId: refund.id, status: refund.status });

    // Update task
    await supabaseClient
      .from('tasks')
      .update({
        deposit_paid: false,
        status: 'cancelled',
      })
      .eq('id', taskId);

    // Create notification for user
    await supabaseClient.rpc('create_notification', {
      p_user_id: user.id,
      p_title: 'Deposit Refunded',
      p_message: `Your deposit of $${task.deposit_amount} for "${task.title}" has been refunded.`,
      p_type: 'payment',
      p_link: `/task/${taskId}`
    });

    return new Response(JSON.stringify({ 
      success: true,
      refundId: refund.id,
      message: "Deposit refunded successfully"
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
