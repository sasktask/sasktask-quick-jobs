import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OfflineNotificationRequest {
  messageId: string;
  receiverId: string;
  senderName: string;
  messagePreview: string;
  bookingId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { receiverId, senderName, messagePreview, bookingId }: OfflineNotificationRequest = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get receiver's email and last active time
    const { data: receiver, error: receiverError } = await supabase
      .from("profiles")
      .select("email, last_active")
      .eq("id", receiverId)
      .single();

    if (receiverError || !receiver) {
      console.error("Error fetching receiver:", receiverError);
      return new Response(
        JSON.stringify({ error: "Receiver not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has been offline for more than 2 minutes
    const lastActive = receiver.last_active ? new Date(receiver.last_active) : new Date(0);
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    if (lastActive > twoMinutesAgo) {
      console.log("User is online or recently active, skipping email notification");
      return new Response(
        JSON.stringify({ skipped: true, reason: "User is online" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email notification
    const chatUrl = `${req.headers.get("origin")}/chat/${bookingId}`;
    
    const emailResponse = await resend.emails.send({
      from: "SaskTask Messages <onboarding@resend.dev>",
      to: [receiver.email],
      subject: `New message from ${senderName} - SaskTask`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3eb5a4;">You have a new message on SaskTask</h2>
          <p><strong>${senderName}</strong> sent you a message:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #3eb5a4; margin: 20px 0;">
            <p style="margin: 0;">${messagePreview}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${chatUrl}" 
               style="background-color: #3eb5a4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              View Message
            </a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="color: #999; font-size: 12px;">
            SaskTask - Your Task Partner<br>
            To manage your notification preferences, visit your account settings.
          </p>
        </div>
      `,
    });

    console.log("Offline notification email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-offline-message function:", error);
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
