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

  const startTime = Date.now();
  console.log("[send-signup-otp] Starting request processing");

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("[send-signup-otp] RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendApiKey);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { email }: SendSignupOTPRequest = body;

    console.log("[send-signup-otp] Processing request for email:", email?.substring(0, 3) + "***");

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("[send-signup-otp] Invalid email format");
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if email is already registered
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error("[send-signup-otp] Error checking existing users:", listError);
    } else {
      const emailExists = existingUsers?.users?.some((u) => u.email?.toLowerCase() === email.toLowerCase());

      if (emailExists) {
        console.log("[send-signup-otp] Email already registered");
        return new Response(JSON.stringify({ error: "This email is already registered. Please sign in instead." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Check rate limiting - max 5 OTP requests per hour per email
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentRequests, error: countError } = await supabase
      .from("signup_verifications")
      .select("*", { count: "exact", head: true })
      .eq("email", email.toLowerCase())
      .gte("created_at", oneHourAgo);

    if (countError) {
      console.error("[send-signup-otp] Error checking rate limit:", countError);
    }

    if (recentRequests && recentRequests >= 5) {
      console.log(`[send-signup-otp] Rate limit exceeded for email - ${recentRequests} requests in last hour`);
      return new Response(JSON.stringify({ error: "Too many verification requests. Please try again in an hour." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Invalidate any existing unused verification codes for this email
    const { error: invalidateError } = await supabase
      .from("signup_verifications")
      .update({ expires_at: new Date().toISOString() })
      .eq("email", email.toLowerCase())
      .is("verified_at", null);

    if (invalidateError) {
      console.error("[send-signup-otp] Error invalidating old codes:", invalidateError);
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes expiry

    // Get client IP from headers
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                      req.headers.get("x-real-ip") || 
                      req.headers.get("cf-connecting-ip") ||
                      "unknown";

    console.log("[send-signup-otp] Storing verification code, expires at:", expiresAt);

    // Store verification in database
    const { data: verification, error: insertError } = await supabase
      .from("signup_verifications")
      .insert({
        email: email.toLowerCase(),
        code: otpCode,
        expires_at: expiresAt,
        ip_address: ipAddress,
        attempts: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[send-signup-otp] Failed to store verification:", insertError);
      return new Response(JSON.stringify({ error: "Failed to generate verification code. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[send-signup-otp] Verification stored, sending email...");

    // Send OTP via email with enhanced template
    const emailResponse = await resend.emails.send({
      from: "SaskTask <onboarding@sasktask.com>",
      to: [email],
      subject: "Your SaskTask Verification Code",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f5f5f5; }
            .wrapper { background-color: #f5f5f5; padding: 40px 20px; }
            .container { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #00B4D8 0%, #0077B6 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
            .header p { margin: 0; opacity: 0.9; font-size: 16px; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 18px; color: #333; margin-bottom: 16px; }
            .message { color: #555; margin-bottom: 32px; font-size: 15px; }
            .otp-container { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px dashed #00B4D8; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
            .otp-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #666; margin-bottom: 12px; font-weight: 600; }
            .otp-code { font-size: 40px; font-weight: 700; color: #0077B6; letter-spacing: 12px; font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace; }
            .timer { display: inline-flex; align-items: center; gap: 6px; background: #fef3c7; color: #92400e; padding: 10px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; margin: 20px 0; }
            .timer-icon { font-size: 16px; }
            .security-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 0 8px 8px 0; margin: 24px 0; }
            .security-title { color: #991b1b; font-weight: 600; font-size: 14px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
            .security-text { color: #7f1d1d; font-size: 13px; margin: 0; }
            .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
            .footer { padding: 24px 30px; background: #f9fafb; text-align: center; }
            .footer-text { color: #9ca3af; font-size: 12px; margin: 4px 0; }
            .footer-brand { color: #6b7280; font-weight: 600; font-size: 14px; margin-bottom: 8px; }
            .help-text { color: #6b7280; font-size: 13px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <h1>🎉 Almost There!</h1>
                <p>Verify your email to get started</p>
              </div>
              <div class="content">
                <p class="greeting">Hello!</p>
                <p class="message">Thank you for signing up for SaskTask! Please use the verification code below to complete your registration:</p>
                
                <div class="otp-container">
                  <div class="otp-label">Your Verification Code</div>
                  <div class="otp-code">${otpCode}</div>
                </div>
                
                <div class="timer">
                  <span class="timer-icon">⏱️</span>
                  <span>This code expires in <strong>5 minutes</strong></span>
                </div>
                
                <div class="security-box">
                  <div class="security-title">
                    <span>🔒</span>
                    <span>Security Notice</span>
                  </div>
                  <p class="security-text">Never share this code with anyone. SaskTask will never ask for this code via phone, text, or social media.</p>
                </div>
                
                <p class="help-text">If you didn't request this verification, you can safely ignore this email. Someone may have entered your email by mistake.</p>
              </div>
              <div class="footer">
                <div class="footer-brand">SaskTask</div>
                <p class="footer-text">Your trusted task marketplace</p>
                <p class="footer-text">© ${new Date().getFullYear()} SaskTask. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (emailResponse.error) {
      console.error("[send-signup-otp] Failed to send verification email:", emailResponse.error);
      
      // Clean up the stored verification since email failed
      await supabase
        .from("signup_verifications")
        .delete()
        .eq("id", verification.id);
      
      return new Response(JSON.stringify({ error: "Failed to send verification email. Please check your email address and try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const duration = Date.now() - startTime;
    console.log(`[send-signup-otp] Email sent successfully in ${duration}ms, messageId:`, emailResponse.data?.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Verification code sent successfully",
        verificationId: verification.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[send-signup-otp] Error after ${duration}ms:`, error);
    
    return new Response(JSON.stringify({ error: error.message || "Failed to send verification code" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
