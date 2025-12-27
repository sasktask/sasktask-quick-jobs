import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "draft_published" | "first_booking";
  taskId: string;
  taskTitle: string;
  recipientEmail: string;
  recipientName?: string;
  bookerName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, taskId, taskTitle, recipientEmail, recipientName, bookerName }: NotificationRequest =
      await req.json();

    console.log(`Sending ${type} notification for task ${taskId} to ${recipientEmail}`);

    let subject: string;
    let html: string;
    const name = recipientName || "there";

    if (type === "draft_published") {
      subject = "Your Task is Now Live! 🎉";
      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a; margin-bottom: 24px;">Your Task is Published!</h1>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            Great news! Your task "<strong>${taskTitle}</strong>" is now live and visible to taskers in your area.
          </p>
          <div style="background: #f7f7f7; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0; color: #666;">
              Taskers can now view and apply for your task. You'll receive notifications when someone expresses interest.
            </p>
          </div>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            Best regards,<br>The SaskTask Team
          </p>
        </div>
      `;
    } else if (type === "first_booking") {
      subject = "Someone Wants to Complete Your Task! 🙌";
      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a; margin-bottom: 24px;">New Booking Request!</h1>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            Exciting news! <strong>${bookerName || "A tasker"}</strong> has requested to complete your task "<strong>${taskTitle}</strong>".
          </p>
          <div style="background: #e8f5e9; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0; color: #2e7d32;">
              This is your first booking request for this task! Review their profile and message them to discuss the details.
            </p>
          </div>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            Log in to your account to review and accept or decline this request.
          </p>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            Best regards,<br>The SaskTask Team
          </p>
        </div>
      `;
    } else {
      throw new Error("Invalid notification type");
    }

    const emailResponse = await resend.emails.send({
      from: "SaskTask <onboarding@sending.tanjeen.com>",
      to: [recipientEmail],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-task-notification function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
