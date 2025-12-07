import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BidNotificationRequest {
  taskId: string;
  taskTitle: string;
  bidAmount: number;
  bidderName: string;
  bidMessage?: string;
  taskGiverEmail: string;
  taskGiverName: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("notify-new-bid function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      taskId, 
      taskTitle, 
      bidAmount, 
      bidderName, 
      bidMessage,
      taskGiverEmail, 
      taskGiverName 
    }: BidNotificationRequest = await req.json();

    console.log("Processing bid notification:", { taskId, taskTitle, bidAmount, bidderName });

    // Create in-app notification
    const { error: notifError } = await supabase.rpc("create_notification", {
      p_user_id: (await supabase.from("profiles").select("id").eq("email", taskGiverEmail).single()).data?.id,
      p_title: "New Bid Received",
      p_message: `${bidderName} submitted a bid of $${bidAmount} for "${taskTitle}"`,
      p_type: "bid",
      p_link: `/task/${taskId}`
    });

    if (notifError) {
      console.error("Error creating notification:", notifError);
    }

    // Send email notification using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SaskTask <onboarding@resend.dev>",
        to: [taskGiverEmail],
        subject: `New Bid on Your Task: ${taskTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🔔 New Bid Received!</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${taskGiverName || 'there'},
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Great news! <strong>${bidderName}</strong> has submitted a bid on your task.
              </p>
              
              <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin: 0 0 10px 0;">📋 Task: ${taskTitle}</h3>
                <p style="color: #059669; font-size: 24px; font-weight: bold; margin: 10px 0;">
                  💰 Bid Amount: $${bidAmount.toFixed(2)}
                </p>
                ${bidMessage ? `
                  <p style="color: #6b7280; font-size: 14px; margin: 10px 0; padding: 10px; background: white; border-radius: 4px; border-left: 3px solid #667eea;">
                    "${bidMessage}"
                  </p>
                ` : ''}
              </div>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Review this bid and all others on your task to find the perfect tasker!
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                You received this email because someone bid on your task on SaskTask.
              </p>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-new-bid function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
