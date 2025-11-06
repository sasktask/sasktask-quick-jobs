import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message, honeypot }: ContactEmailRequest = await req.json();

    // Honeypot check - if filled, it's a bot
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

    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for") || "unknown";

    // Check rate limiting - max 3 submissions per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentSubmissions, error: checkError } = await supabase
      .from("contact_submissions")
      .select("id")
      .eq("email", email)
      .gte("submitted_at", oneHourAgo);

    if (checkError) {
      console.error("Error checking rate limit:", checkError);
    } else if (recentSubmissions && recentSubmissions.length >= 3) {
      console.log("Rate limit exceeded for email:", email);
      return new Response(
        JSON.stringify({ error: "Too many submissions. Please try again later." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check IP rate limiting - max 5 submissions per IP per hour
    const { data: recentIPSubmissions, error: ipCheckError } = await supabase
      .from("contact_submissions")
      .select("id")
      .eq("ip_address", clientIP)
      .gte("submitted_at", oneHourAgo);

    if (ipCheckError) {
      console.error("Error checking IP rate limit:", ipCheckError);
    } else if (recentIPSubmissions && recentIPSubmissions.length >= 5) {
      console.log("Rate limit exceeded for IP:", clientIP);
      return new Response(
        JSON.stringify({ error: "Too many submissions. Please try again later." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Record submission for rate limiting
    const { error: insertError } = await supabase
      .from("contact_submissions")
      .insert({
        email,
        ip_address: clientIP,
      });

    if (insertError) {
      console.error("Error recording submission:", insertError);
    }

    // Send email to admin
    const adminEmail = await resend.emails.send({
      from: "SaskTask Contact <onboarding@resend.dev>",
      to: ["admin@sasktask.com"], // Replace with actual admin email
      replyTo: email,
      subject: `New Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Reply directly to this email to respond to ${name}</small></p>
      `,
    });

    console.log("Admin email sent:", adminEmail);

    // Send auto-reply to user
    const userEmail = await resend.emails.send({
      from: "SaskTask <onboarding@resend.dev>",
      to: [email],
      subject: "We received your message - SaskTask",
      html: `
        <h1>Thank you for contacting SaskTask, ${name}!</h1>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <h3>Your message:</h3>
        <p><strong>Subject:</strong> ${subject}</p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p>Best regards,<br>The SaskTask Team</p>
      `,
    });

    console.log("User auto-reply sent:", userEmail);

    return new Response(
      JSON.stringify({ 
        success: true, 
        adminEmailId: adminEmail.data?.id,
        userEmailId: userEmail.data?.id 
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
    console.error("Error in send-contact-email function:", error);
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
