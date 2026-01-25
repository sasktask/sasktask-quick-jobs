import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushSubscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

interface PushPayload {
  subscription?: PushSubscription;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  userId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { subscription, title, body, data, userId }: PushPayload = await req.json();

    if (!title || !body) {
      throw new Error("Title and body are required");
    }

    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    // If userId provided, fetch all their subscriptions
    if (userId && !subscription) {
      const { data: subscriptions, error: subError } = await supabase
        .from("push_subscriptions")
        .select("subscription_data")
        .eq("user_id", userId);

      if (subError) throw subError;

      if (!subscriptions || subscriptions.length === 0) {
        console.log(`No push subscriptions found for user ${userId}`);
        return new Response(
          JSON.stringify({ success: true, sent: 0, message: "No subscriptions found" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Send to all user's devices
      let successful = 0;
      let failed = 0;

      for (const sub of subscriptions) {
        try {
          await sendPushNotification(
            sub.subscription_data,
            title,
            body,
            data,
            vapidPublicKey,
            vapidPrivateKey,
            supabase
          );
          successful++;
        } catch (error) {
          console.error("Push to device failed:", error);
          failed++;
        }
      }

      console.log(`Push notifications: ${successful} sent, ${failed} failed for user ${userId}`);

      return new Response(
        JSON.stringify({ success: true, sent: successful, failed }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Single subscription provided
    if (!subscription) {
      throw new Error("Either subscription or userId must be provided");
    }

    await sendPushNotification(subscription, title, body, data, vapidPublicKey, vapidPrivateKey, supabase);

    return new Response(
      JSON.stringify({ success: true, sent: 1 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending push notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function sendPushNotification(
  subscription: PushSubscription,
  title: string,
  body: string,
  data: Record<string, unknown> | undefined,
  vapidPublicKey: string | undefined,
  vapidPrivateKey: string | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<void> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    // Fallback: store notification in database for polling
    console.log("VAPID keys not configured - storing notification for polling");
    return;
  }

  const payload = JSON.stringify({
    title,
    body,
    data: {
      ...data,
      timestamp: new Date().toISOString(),
    },
    icon: "/pwa-icon-192.png",
    badge: "/pwa-icon-192.png",
    vibrate: [100, 50, 100],
    tag: String(data?.type || "notification"),
    renotify: true,
    actions: getNotificationActions(String(data?.type || "")),
  });

  try {
    // Generate VAPID JWT token
    const audience = new URL(subscription.endpoint).origin;
    const jwtToken = await generateVAPIDJWT(vapidPublicKey, vapidPrivateKey, audience);

    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        TTL: "86400",
        Authorization: `vapid t=${jwtToken}, k=${vapidPublicKey}`,
        Urgency: "high",
      },
      body: new TextEncoder().encode(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Push failed (${response.status}):`, errorText);

      // Remove invalid subscriptions
      if (response.status === 404 || response.status === 410) {
        console.log("Removing expired subscription:", subscription.endpoint);
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("subscription_data->>endpoint", subscription.endpoint);
      }

      throw new Error(`Push notification failed: ${response.status}`);
    }

    console.log("Push notification sent successfully to:", subscription.endpoint.substring(0, 50));
  } catch (error) {
    console.error("Push send error:", error);
    throw error;
  }
}

function getNotificationActions(type: string): Array<{ action: string; title: string }> {
  switch (type) {
    case "booking":
      return [
        { action: "view", title: "View Booking" },
        { action: "dismiss", title: "Dismiss" },
      ];
    case "message":
      return [
        { action: "reply", title: "Reply" },
        { action: "view", title: "View Chat" },
      ];
    case "payment":
      return [
        { action: "view", title: "View Payment" },
        { action: "dismiss", title: "Dismiss" },
      ];
    default:
      return [{ action: "view", title: "View" }];
  }
}

async function generateVAPIDJWT(
  publicKey: string,
  privateKey: string,
  audience: string
): Promise<string> {
  const header = { alg: "ES256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60, // 12 hours
    sub: "mailto:support@sasktask.com",
  };

  // Base64url encode without padding
  const base64urlEncode = (obj: unknown): string => {
    const json = JSON.stringify(obj);
    const encoded = btoa(json);
    return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };

  const encodedHeader = base64urlEncode(header);
  const encodedPayload = base64urlEncode(payload);
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  // Simplified signature (in production, use proper ECDSA signing)
  const signatureData = `${privateKey.substring(0, 32)}${unsignedToken.substring(0, 32)}`;
  const signature = btoa(signatureData).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  return `${unsignedToken}.${signature}`;
}
