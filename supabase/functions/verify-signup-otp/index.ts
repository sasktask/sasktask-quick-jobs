import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifySignupOTPRequest {
  email: string;
  code: string;
  verificationId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, code, verificationId }: VerifySignupOTPRequest = await req.json();

    console.log("Verifying OTP for email:", email, "code:", code, "verificationId:", verificationId);

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email and code are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date().toISOString();
    console.log("Current time:", now);

    // Find the most recent unverified verification code for this email
    let query = supabase
      .from("signup_verifications")
      .select("*")
      .eq("email", email)
      .is("verified_at", null)
      .order("created_at", { ascending: false })
      .limit(1);

    if (verificationId) {
      query = supabase
        .from("signup_verifications")
        .select("*")
        .eq("id", verificationId)
        .is("verified_at", null);
    }

    const { data: verifications, error: fetchError } = await query;

    console.log("Found verifications:", JSON.stringify(verifications));

    const verification = verifications?.[0];

    if (fetchError || !verification) {
      console.log("No verification found for:", email, "fetchError:", fetchError);
      return new Response(
        JSON.stringify({ error: "No valid verification code found. Please request a new code." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if code has expired
    if (new Date(verification.expires_at) < new Date()) {
      console.log("Verification code expired. Expires at:", verification.expires_at, "Current time:", now);
      return new Response(
        JSON.stringify({ error: "Verification code has expired. Please request a new code." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check max attempts (5 attempts max)
    if (verification.attempts >= 5) {
      console.log("Max attempts exceeded for:", email);
      // Invalidate this verification
      await supabase
        .from("signup_verifications")
        .update({ expires_at: new Date().toISOString() })
        .eq("id", verification.id);

      return new Response(
        JSON.stringify({ error: "Too many failed attempts. Please request a new code." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the code
    if (verification.code !== code) {
      // Increment attempts
      await supabase
        .from("signup_verifications")
        .update({ attempts: verification.attempts + 1 })
        .eq("id", verification.id);

      const remainingAttempts = 5 - (verification.attempts + 1);
      console.log(`Invalid code for ${email}. Remaining attempts: ${remainingAttempts}`);

      return new Response(
        JSON.stringify({ 
          error: `Invalid code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.` 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark verification as verified
    const { error: updateError } = await supabase
      .from("signup_verifications")
      .update({ verified_at: new Date().toISOString() })
      .eq("id", verification.id);

    if (updateError) {
      console.error("Failed to mark verification as verified:", updateError);
    }

    console.log("Email verified successfully for:", email);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in verify-signup-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to verify code" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
