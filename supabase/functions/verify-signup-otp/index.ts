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

const MAX_ATTEMPTS = 5;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log("[verify-signup-otp] Starting verification request");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { email, code, verificationId }: VerifySignupOTPRequest = body;

    console.log("[verify-signup-otp] Processing for email:", email?.substring(0, 3) + "***", "verificationId:", verificationId?.substring(0, 8));

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email and code are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      return new Response(
        JSON.stringify({ error: "Invalid code format. Please enter a 6-digit code." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date().toISOString();
    console.log("[verify-signup-otp] Current time:", now);

    // Build query based on whether we have a verificationId
    let query;
    if (verificationId) {
      console.log("[verify-signup-otp] Looking up by verificationId");
      query = supabase
        .from("signup_verifications")
        .select("*")
        .eq("id", verificationId)
        .is("verified_at", null)
        .single();
    } else {
      console.log("[verify-signup-otp] Looking up by email (most recent)");
      query = supabase
        .from("signup_verifications")
        .select("*")
        .eq("email", email.toLowerCase())
        .is("verified_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
    }

    const { data: verification, error: fetchError } = await query;

    if (fetchError || !verification) {
      console.log("[verify-signup-otp] No verification found:", fetchError?.message);
      return new Response(
        JSON.stringify({ error: "No verification code found. Please request a new code." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[verify-signup-otp] Found verification, created at:", verification.created_at, "expires at:", verification.expires_at);

    // Check if code has expired
    if (new Date(verification.expires_at) < new Date()) {
      console.log("[verify-signup-otp] Code expired");
      return new Response(
        JSON.stringify({ error: "Verification code has expired. Please request a new code." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check max attempts
    const currentAttempts = verification.attempts || 0;
    if (currentAttempts >= MAX_ATTEMPTS) {
      console.log("[verify-signup-otp] Max attempts exceeded:", currentAttempts);
      
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
      const newAttempts = currentAttempts + 1;
      await supabase
        .from("signup_verifications")
        .update({ attempts: newAttempts })
        .eq("id", verification.id);

      const remainingAttempts = MAX_ATTEMPTS - newAttempts;
      console.log(`[verify-signup-otp] Invalid code. Attempts: ${newAttempts}/${MAX_ATTEMPTS}`);

      if (remainingAttempts <= 0) {
        return new Response(
          JSON.stringify({ error: "Too many failed attempts. Please request a new code." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          error: `Invalid code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`,
          remainingAttempts 
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
      console.error("[verify-signup-otp] Failed to mark as verified:", updateError);
    }

    const duration = Date.now() - startTime;
    console.log(`[verify-signup-otp] Verification successful in ${duration}ms for email:`, email?.substring(0, 3) + "***");

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[verify-signup-otp] Error after ${duration}ms:`, error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Failed to verify code" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
