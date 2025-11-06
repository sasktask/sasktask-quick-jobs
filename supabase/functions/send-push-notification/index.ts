import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subscription, title, body, data } = await req.json();
    
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    
    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured');
    }

    // Send web push notification
    const payload = JSON.stringify({
      title,
      body,
      data,
      icon: '/pwa-icon-192.png',
      badge: '/pwa-icon-192.png',
    });

    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `vapid t=${generateVAPIDToken(vapidPublicKey, vapidPrivateKey, subscription.endpoint)}, k=${vapidPublicKey}`,
      },
      body: payload,
    });

    if (!response.ok) {
      console.error('Push notification failed:', response.status, await response.text());
      
      // If subscription is no longer valid, remove it
      if (response.status === 410) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('subscription_data->endpoint', subscription.endpoint);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateVAPIDToken(publicKey: string, privateKey: string, endpoint: string): string {
  // Simplified VAPID token generation
  // In production, use a proper library like web-push
  const origin = new URL(endpoint).origin;
  return btoa(JSON.stringify({ sub: `mailto:noreply@${origin}`, aud: origin }));
}
