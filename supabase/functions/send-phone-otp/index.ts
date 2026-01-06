import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendPhoneOTPRequest {
  phone: string;
  userId: string;
}

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { phone, userId }: SendPhoneOTPRequest = await req.json();

    if (!phone || !userId) {
      return new Response(
        JSON.stringify({ error: "Phone number and user ID are required" }),
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
        user_id: userId,
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

    // In production, you would send SMS via Twilio or similar service
    // For now, we'll log the OTP (in production, remove this!)
    console.log(`Phone OTP for ${phone}: ${otp}`);

    // TODO: Integrate with SMS provider (Twilio, MessageBird, etc.)
    // For demo purposes, we simulate success
    // Example Twilio integration:
    // const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    // const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    // const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
    // 
    // const twilioClient = twilio(twilioAccountSid, twilioAuthToken);
    // await twilioClient.messages.create({
    //   body: `Your SaskTask verification code is: ${otp}`,
    //   from: twilioPhoneNumber,
    //   to: phone,
    // });

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
