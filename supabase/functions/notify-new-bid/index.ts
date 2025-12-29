import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { taskId, bidId, bidderId, bidAmount, message } = await req.json();

    if (!taskId || !bidId || !bidderId) {
      throw new Error("Missing required fields: taskId, bidId, or bidderId");
    }

    // Fetch task details
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("title, task_giver_id")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      throw new Error("Task not found");
    }

    // Fetch task giver details
    const { data: taskGiver, error: giverError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", task.task_giver_id)
      .single();

    if (giverError || !taskGiver) {
      throw new Error("Task giver not found");
    }

    // Fetch bidder details
    const { data: bidder, error: bidderError } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, rating, total_reviews")
      .eq("id", bidderId)
      .single();

    if (bidderError) {
      console.error("Error fetching bidder:", bidderError);
    }

    const bidderName = bidder?.full_name || "A tasker";
    const bidderRating = bidder?.rating ? `${bidder.rating.toFixed(1)} ⭐` : "New tasker";

    // Create in-app notification
    const { error: notificationError } = await supabase.from("notifications").insert({
      user_id: task.task_giver_id,
      title: "New Bid Received",
      message: `${bidderName} placed a bid of $${bidAmount} on "${task.title}"`,
      type: "bid",
      link: `/task/${taskId}`,
    });

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
    }

    // Send email notification if Resend API key is configured
    if (resendApiKey && taskGiver.email) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 20px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎯 New Bid on Your Task!</h1>
          </div>
          <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 16px;">
              Hi ${taskGiver.full_name || "there"},
            </p>
            <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
              Great news! <strong>${bidderName}</strong> (${bidderRating}) has placed a bid on your task.
            </p>
            
            <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 12px 0; color: #111827;">Task: ${task.title}</h3>
              <p style="margin: 8px 0; color: #6b7280;"><strong>Bid Amount:</strong> <span style="color: #059669; font-size: 18px;">$${bidAmount}</span></p>
              ${message ? `<p style="margin: 8px 0; color: #6b7280;"><strong>Message:</strong> "${message}"</p>` : ""}
            </div>
            
            <p style="color: #9ca3af; font-size: 14px; margin-top: 24px;">
              — The SaskTask Team
            </p>
          </div>
        </div>
      `;

      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "SaskTask <onboarding@sending.tanjeen.com>",
            to: [taskGiver.email],
            subject: `💰 New Bid: $${bidAmount} on "${task.title}"`,
            html: emailHtml,
          }),
        });

        if (!emailResponse.ok) {
          const emailError = await emailResponse.text();
          console.error("Email send error:", emailError);
        } else {
          console.log("Email notification sent successfully");
        }
      } catch (emailErr) {
        console.error("Failed to send email:", emailErr);
      }
    }

    return new Response(JSON.stringify({ success: true, message: "Notification sent" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in notify-new-bid:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
