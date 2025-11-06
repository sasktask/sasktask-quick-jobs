import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
      console.log("User is online or recently active, skipping notification");
      return new Response(
        JSON.stringify({ skipped: true, reason: "User is online" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's push subscription
    const { data: subscription, error: subError } = await supabase
      .from("push_subscriptions")
      .select("subscription_data")
      .eq("user_id", receiverId)
      .single();

    if (subError || !subscription) {
      console.log("No push subscription found for user");
      return new Response(
        JSON.stringify({ skipped: true, reason: "No push subscription" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Trigger web push notification
    const pushResponse = await supabase.functions.invoke("send-push-notification", {
      body: {
        subscription: subscription.subscription_data,
        title: "New Message",
        body: `${senderName}: ${messagePreview.substring(0, 100)}`,
        data: { bookingId }
      }
    });

    console.log("Push notification sent:", pushResponse);

    return new Response(
      JSON.stringify({ success: true }),
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
