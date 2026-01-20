// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import twilio from "npm:twilio";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendPhoneOTPRequest {
  phone: string;
  userId?: string | null;
  email?: string | null;
}

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const normalizeProxy = (value?: string | null) => {
  if (!value) return null;
  const raw = value.trim();
  const needsScheme = /^[^/]+:\d+$/.test(raw) && !/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw);
  const candidate = needsScheme ? `http://${raw}` : raw;
  try {
    return new URL(candidate).href;
  } catch (_err) {
    console.warn(`Ignoring invalid proxy value: ${value}`);
    return null;
  }
};

const sanitizeProxyEnv = () => {
  const candidates = [
    "TWILIO_HTTP_PROXY",
    "TWILIO_HTTPS_PROXY",
    "HTTP_PROXY",
    "HTTPS_PROXY",
    "http_proxy",
    "https_proxy",
  ];
  const normalized: Record<string, string> = {};
  for (const key of candidates) {
    const val = Deno.env.get(key);
    const norm = normalizeProxy(val);
    if (val && !norm) {
      Deno.env.delete(key);
    } else if (norm) {
      Deno.env.set(key, norm);
      normalized[key] = norm;
    }
  }
  return normalized;
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Sending SMS");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_FROM_NUMBER");
    const normalizedProxies = sanitizeProxyEnv();
    const httpProxy =
      normalizedProxies["TWILIO_HTTP_PROXY"] ||
      normalizedProxies["HTTP_PROXY"] ||
      normalizedProxies["http_proxy"] ||
      null;
    const httpsProxy =
      normalizedProxies["TWILIO_HTTPS_PROXY"] ||
      normalizedProxies["HTTPS_PROXY"] ||
      normalizedProxies["https_proxy"] ||
      httpProxy;

    const { phone, userId, email }: SendPhoneOTPRequest = await req.json();

    if (!phone || (!userId && !email)) {
      return new Response(
        JSON.stringify({ error: "Phone number and user identifier (userId or email) are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate phone format (should be +1XXXXXXXXXX)
    const phoneRegex = /^\+1\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number format. Please use a valid Canadian number." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Reject if phone is already verified/claimed by another user
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone", phone)
      .neq("id", userId || "00000000-0000-0000-0000-000000000000")
      .maybeSingle();

    if (existingProfile) {
      return new Response(
        JSON.stringify({ error: "This phone number is already in use by another account. Please use a different number." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Also block if another user has a verified record for this phone
    const { data: existingVerification } = await supabase
      .from("phone_verifications")
      .select("user_id, verified_at")
      .eq("phone", phone)
      .neq("user_id", userId || "00000000-0000-0000-0000-000000000000")
      .not("verified_at", "is", null)
      .maybeSingle();

    if (existingVerification) {
      return new Response(
        JSON.stringify({ error: "This phone number has already been verified by another account. Please use a different number." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting: Check for recent OTPs
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentOTPs, error: rateError } = await supabase
      .from("phone_verifications")
      .select("id")
      .eq("phone", phone)
      .gte("created_at", fiveMinutesAgo);

    if (rateError) {
      console.error("Rate limit check error:", rateError);
    }

    if (recentOTPs && recentOTPs.length >= 3) {
      return new Response(
        JSON.stringify({ error: "Too many attempts. Please wait 5 minutes before trying again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Invalidate previous unverified codes for this phone
    await supabase
      .from("phone_verifications")
      .update({ verified_at: new Date(0).toISOString() })
      .eq("phone", phone)
      .is("verified_at", null);

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // Get client IP
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Insert verification record
    const { data: verification, error: insertError } = await supabase
      .from("phone_verifications")
      .insert({
        phone,
        user_id: userId || null,
        code: otp,
        expires_at: expiresAt,
        ip_address: clientIP,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create verification" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send SMS via Twilio if credentials are present
    if (!accountSid || !authToken || !fromNumber) {
      console.error("Twilio not configured: missing SID/token/from number");
      return new Response(
        JSON.stringify({ error: "SMS sending not configured. Please contact support." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      const twilioClient = twilio(accountSid, authToken);

      try {
        await twilioClient.messages.create({
          body: `Your SaskTask verification code is: ${otp}`,
          from: fromNumber,
          to: phone,
        });
        console.log("SMS sent successfully to", phone);
      } catch (twilioError: any) {
        console.error("Twilio send failed:", twilioError?.message || twilioError);
        return new Response(
          JSON.stringify({ error: twilioError?.message || "Twilio send failed. Please use a different number or try again." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        verificationId: verification.id,
        message: "Verification code sent successfully"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    console.error("Error in send-phone-otp:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
