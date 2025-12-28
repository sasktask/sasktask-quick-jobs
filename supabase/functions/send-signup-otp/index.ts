import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendSignupOTPRequest {
  email: string;
}

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email }: SendSignupOTPRequest = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if email is already registered
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const emailExists = existingUsers?.users?.some((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (emailExists) {
      return new Response(JSON.stringify({ error: "This email is already registered. Please sign in instead." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check rate limiting - max 5 OTP requests per hour per email
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentRequests } = await supabase
      .from("signup_verifications")
      .select("*", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", oneHourAgo);

    if (recentRequests && recentRequests >= 5) {
      console.log(`Rate limit exceeded for ${email}`);
      return new Response(JSON.stringify({ error: "Too many verification requests. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Invalidate any existing unused verification codes for this email
    await supabase
      .from("signup_verifications")
      .update({ expires_at: new Date().toISOString() })
      .eq("email", email)
      .is("verified_at", null);

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes expiry

    // Get client IP from headers
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown";

    // Store verification in database
    const { data: verification, error: insertError } = await supabase
      .from("signup_verifications")
      .insert({
        email: email,
        code: otpCode,
        expires_at: expiresAt,
        ip_address: ipAddress,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to store verification:", insertError);
      return new Response(JSON.stringify({ error: "Failed to generate verification code" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send OTP via email
    const emailResponse = await resend.emails.send({
      from: "SaskTask <onboarding@sasktask.com>",
      to: [email],
      subject: "Verify Your Email - SaskTask Signup",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #00B4D8, #0077B6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-code { font-size: 36px; font-weight: bold; color: #0077B6; text-align: center; letter-spacing: 10px; padding: 25px; background: white; border-radius: 8px; margin: 20px 0; border: 2px dashed #00B4D8; }
            .warning { color: #e74c3c; font-size: 14px; margin-top: 20px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            .highlight { background: #e8f7fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to SaskTask!</h1>
              <p>You're almost there</p>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Thank you for signing up for SaskTask! To complete your registration, please enter the verification code below:</p>
              <div class="otp-code">${otpCode}</div>
              <div class="highlight">
                <p><strong>⏱️ This code expires in 5 minutes.</strong></p>
              </div>
              <p class="warning">⚠️ <strong>Security Notice:</strong> Never share this code with anyone. SaskTask will never ask for this code via phone, text, or any other message.</p>
              <p>If you didn't request this verification, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} SaskTask. All rights reserved.</p>
              <p>Your global task marketplace</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (emailResponse.error) {
      console.error("Failed to send verification email:", emailResponse.error);
      return new Response(JSON.stringify({ error: "Failed to send verification email. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Signup verification email sent successfully to:", email);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Verification code sent successfully",
        verificationId: verification.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Error in send-signup-otp function:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to send verification code" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
