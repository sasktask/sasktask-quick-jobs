import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    // Send confirmation email
    const confirmationUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/confirm-newsletter?token=${confirmationToken}`;

    const emailResponse = await resend.emails.send({
      from: "SaskTask Newsletter <onboarding@resend.dev>",
      to: [email],
      subject: "Confirm your SaskTask Newsletter Subscription",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3eb5a4;">Welcome to SaskTask Newsletter!</h1>
          <p>Thank you for subscribing to our newsletter. To complete your subscription, please confirm your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" 
               style="background-color: #3eb5a4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Confirm Subscription
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">If you didn't subscribe to this newsletter, you can safely ignore this email.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="color: #999; font-size: 12px;">
            SaskTask - Your Task Partner<br>
            This email was sent to ${email}
          </p>
        </div>
      `,
    });

    console.log("Confirmation email sent:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Please check your email to confirm your subscription!",
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
