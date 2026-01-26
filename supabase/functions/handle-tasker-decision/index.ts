import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DecisionPayload {
  booking_id: string;
  decision: 'accepted' | 'declined';
  decline_reason?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify the user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Invalid authentication");
    }

    const payload: DecisionPayload = await req.json();

    if (!payload.booking_id || !payload.decision) {
      throw new Error("Missing required fields: booking_id, decision");
    }

    if (payload.decision !== 'accepted' && payload.decision !== 'declined') {
      throw new Error("Invalid decision. Must be 'accepted' or 'declined'");
    }

    // Get the booking with task details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        tasks!inner (
          id,
          title,
          task_giver_id,
          pay_amount,
          status
        )
      `)
      .eq('id', payload.booking_id)
      .single();

    if (bookingError || !booking) {
      console.error("Booking error:", bookingError);
      throw new Error("Booking not found");
    }

    // Verify the user is the task doer for this booking
    if (booking.task_doer_id !== user.id) {
      throw new Error("You are not authorized to respond to this hire request");
    }

    // Check if already decided
    if (booking.tasker_decision !== 'pending') {
      throw new Error(`You have already ${booking.tasker_decision} this request`);
    }

    const now = new Date().toISOString();

    if (payload.decision === 'declined') {
      // Validate decline reason
      if (!payload.decline_reason?.trim()) {
        throw new Error("Please provide a reason for declining");
      }

      // Update booking to declined
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          tasker_decision: 'declined',
          decline_reason: payload.decline_reason,
          decided_at: now,
          status: 'cancelled'
        })
        .eq('id', payload.booking_id);

      if (updateError) {
        console.error("Update error:", updateError);
        throw new Error("Failed to update booking");
      }

      // Refund the escrow payment to task giver
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', payload.booking_id)
        .eq('escrow_status', 'held')
        .single();

      if (payment) {
        // Get task giver's current balance
        const { data: giverProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', booking.tasks.task_giver_id)
          .single();

        if (giverProfile) {
          // Get current balance from user_financial_data
          const { data: financialData } = await supabase
            .from('user_financial_data')
            .select('wallet_balance')
            .eq('user_id', booking.tasks.task_giver_id)
            .single();

          const currentBalance = financialData?.wallet_balance || 0;

          // Refund the amount to task giver's wallet
          await supabase
            .from('user_financial_data')
            .upsert({
              user_id: booking.tasks.task_giver_id,
              wallet_balance: currentBalance + payment.amount
            }, { onConflict: 'user_id' });

          // Record refund transaction
          await supabase
            .from('wallet_transactions')
            .insert({
              user_id: booking.tasks.task_giver_id,
              amount: payment.amount,
              type: 'refund',
              status: 'completed',
              description: `Refund: Task doer declined hire request for "${booking.tasks.title}"`,
              reference_id: payment.id
            });

          // Update payment status
          await supabase
            .from('payments')
            .update({
              escrow_status: 'refunded',
              status: 'refunded',
              updated_at: now
            })
            .eq('id', payment.id);
        }
      }

      // Update task status back to open
      await supabase
        .from('tasks')
        .update({ status: 'open' })
        .eq('id', booking.task_id);

      // Log audit event
      await supabase
        .from('audit_trail_events')
        .insert({
          user_id: user.id,
          task_id: booking.task_id,
          booking_id: payload.booking_id,
          event_type: 'hire_request_declined',
          event_category: 'booking',
          event_data: {
            decline_reason: payload.decline_reason,
            refund_amount: payment?.amount
          }
        });

      console.log("Hire request declined successfully:", payload.booking_id);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Hire request declined. The task giver has been notified and refunded.",
          refunded: true
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Handle accept decision
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        tasker_decision: 'accepted',
        decided_at: now,
        status: 'confirmed',
        agreed_at: now
      })
      .eq('id', payload.booking_id);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error("Failed to accept hire request");
    }

    // Update task status to in_progress
    await supabase
      .from('tasks')
      .update({ status: 'in_progress' })
      .eq('id', booking.task_id);

    // Log audit event
    await supabase
      .from('audit_trail_events')
      .insert({
        user_id: user.id,
        task_id: booking.task_id,
        booking_id: payload.booking_id,
        event_type: 'hire_request_accepted',
        event_category: 'booking',
        event_data: {
          hire_amount: booking.hire_amount
        }
      });

    // Get task giver info for response
    const { data: taskGiver } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, phone')
      .eq('id', booking.tasks.task_giver_id)
      .single();

    console.log("Hire request accepted successfully:", payload.booking_id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Hire request accepted! The task giver has been notified.",
        booking: {
          id: booking.id,
          task_id: booking.task_id,
          hire_amount: booking.hire_amount,
          task_title: booking.tasks.title
        },
        taskGiver: taskGiver
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in handle-tasker-decision:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An error occurred"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
