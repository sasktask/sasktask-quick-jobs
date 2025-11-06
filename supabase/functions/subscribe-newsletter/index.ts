import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NewsletterRequest {
  email: string;
  honeypot?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, honeypot }: NewsletterRequest = await req.json();

    // Honeypot check
    if (honeypot) {
      console.log("Honeypot triggered, potential spam detected");
      return new Response(
        JSON.stringify({ error: "Invalid submission" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get client IP and user agent for tracking
    const clientIP = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Check if email already exists
    const { data: existing, error: checkError } = await supabase
      .from("newsletter_subscribers")
      .select("id, confirmed, unsubscribed_at")
      .eq("email", email)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing subscriber:", checkError);
      throw checkError;
    }

    // If already subscribed and confirmed
    if (existing && existing.confirmed && !existing.unsubscribed_at) {
      return new Response(
        JSON.stringify({ 
          message: "You're already subscribed to our newsletter!",
          alreadySubscribed: true 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomUUID();

    // Insert or update subscriber
    let subscriberId: string;

    if (existing) {
      // Resubscribe
      const { data: updated, error: updateError } = await supabase
        .from("newsletter_subscribers")
        .update({
          confirmation_token: confirmationToken,
          unsubscribed_at: null,
          subscribed_at: new Date().toISOString(),
          ip_address: clientIP,
          user_agent: userAgent,
        })
        .eq("email", email)
        .select("id")
        .single();

      if (updateError) {
        console.error("Error updating subscriber:", updateError);
        throw updateError;
      }

      subscriberId = updated.id;
    } else {
      // New subscriber
      const { data: inserted, error: insertError } = await supabase
        .from("newsletter_subscribers")
        .insert({
          email,
          confirmation_token: confirmationToken,
          ip_address: clientIP,
          user_agent: userAgent,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Error inserting subscriber:", insertError);
        throw insertError;
      }

      subscriberId = inserted.id;
    }

    // Log subscription (email confirmation would be sent via a proper email service in production)
    console.log("Newsletter subscription recorded:", { email, subscriberId });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Thank you for subscribing to our newsletter!",
        subscriberId 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in subscribe-newsletter function:", error);
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
