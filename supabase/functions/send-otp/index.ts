import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendOTPRequest {
  email: string;
  userId: string;
}

const generateOTP = (): string => {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, userId }: SendOTPRequest = await req.json();

    if (!email || !userId) {
      return new Response(JSON.stringify({ error: "Email and userId are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check rate limiting - max 5 OTP requests per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentRequests } = await supabase
      .from("otp_codes")
      .select("*", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", oneHourAgo);

    if (recentRequests && recentRequests >= 5) {
      console.log(`Rate limit exceeded for ${email}`);
      return new Response(JSON.stringify({ error: "Too many OTP requests. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Invalidate any existing unused OTP codes for this user
    await supabase
      .from("otp_codes")
      .update({ expires_at: new Date().toISOString() })
      .eq("email", email)
      .is("verified_at", null);

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes expiry

    // Get client IP from headers
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown";

    // Store OTP in database
    const { error: insertError } = await supabase.from("otp_codes").insert({
      user_id: userId,
      email: email,
      code: otpCode,
      expires_at: expiresAt,
      ip_address: ipAddress,
    });

    if (insertError) {
      console.error("Failed to store OTP:", insertError);
      return new Response(JSON.stringify({ error: "Failed to generate OTP" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send OTP via email
    const emailResponse = await resend.emails.send({
      from: "SaskTask <onboarding@tanjeen.com>",
      to: [email],
      subject: "Your SaskTask Login Verification Code",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #00B4D8, #0077B6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #0077B6; text-align: center; letter-spacing: 8px; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; }
            .warning { color: #e74c3c; font-size: 14px; margin-top: 20px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Login Verification</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Your one-time verification code for SaskTask login is:</p>
              <div class="otp-code">${otpCode}</div>
              <p><strong>This code will expire in 5 minutes.</strong></p>
              <p class="warning">⚠️ Never share this code with anyone. SaskTask will never ask for this code via phone or message.</p>
              <p>If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} SaskTask. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // Check if email sending failed
    if (emailResponse.error) {
      console.error("Failed to send OTP email:", emailResponse.error);
      return new Response(JSON.stringify({ error: "Failed to send verification email. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("OTP email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, message: "OTP sent successfully" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to send OTP" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
