import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendDeleteOTPRequest {
  userId: string;
  email: string;
}

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, email }: SendDeleteOTPRequest = await req.json();

    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: "User ID and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user exists and email matches
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("Profile lookup error:", profileError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (profile.email.toLowerCase() !== email.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: "Email does not match account" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting: Check for recent deletion OTP requests (max 3 per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentRequests } = await supabase
      .from("account_deletion_verifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", oneHourAgo);

    if (recentRequests && recentRequests >= 3) {
      return new Response(
        JSON.stringify({ error: "Too many deletion requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Invalidate any existing unused codes
    await supabase
      .from("account_deletion_verifications")
      .update({ expires_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("used_at", null);

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    // Get client IP
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || 
                      req.headers.get("x-real-ip") || "unknown";

    // Store verification record
    const { data: verification, error: insertError } = await supabase
      .from("account_deletion_verifications")
      .insert({
        user_id: userId,
        email: email,
        code: otpCode,
        expires_at: expiresAt,
        ip_address: ipAddress,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Failed to store verification:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate verification code" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send OTP via email
    const userName = profile.full_name || "SaskTask User";
    const emailResponse = await resend.emails.send({
      from: "SaskTask <security@sasktask.com>",
      to: [email],
      subject: "⚠️ Account Deletion Verification - SaskTask",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #dc2626; text-align: center; letter-spacing: 8px; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; border: 2px dashed #dc2626; }
            .warning { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Account Deletion Request</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>We received a request to permanently delete your SaskTask account. If you made this request, use the verification code below to confirm:</p>
              <div class="otp-code">${otpCode}</div>
              <p><strong>This code will expire in 15 minutes.</strong></p>
              
              <div class="warning">
                <strong>⚠️ Warning:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This action is <strong>permanent</strong> and cannot be undone</li>
                  <li>All your profile data, tasks, and history will be deleted</li>
                  <li>You will lose access to any pending payments or earnings</li>
                  <li>Your reviews and ratings will be removed</li>
                </ul>
              </div>
              
              <p><strong>If you did NOT request this deletion:</strong></p>
              <ul>
                <li>Do NOT enter this code</li>
                <li>Change your password immediately</li>
                <li>Contact our support team at support@sasktask.com</li>
              </ul>
              
              <p>This code was requested from IP: ${ipAddress}</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} SaskTask. All rights reserved.</p>
              <p>This is an automated security email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (emailResponse.error) {
      console.error("Failed to send email:", emailResponse.error);
      return new Response(
        JSON.stringify({ error: "Failed to send verification email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Account deletion OTP sent to:", email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        verificationId: verification.id,
        message: "Verification code sent to your email" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-delete-account-otp:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send verification code" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
