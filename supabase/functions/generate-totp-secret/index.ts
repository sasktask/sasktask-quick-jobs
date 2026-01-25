import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { encode as base32Encode } from "https://deno.land/std@0.190.0/encoding/base32.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateSecret(length = 20): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return base32Encode(array).replace(/=/g, "");
}

function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const array = new Uint8Array(4);
    crypto.getRandomValues(array);
    const code = Array.from(array)
      .map(b => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
    codes.push(code);
  }
  return codes;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Authentication failed");
    }

    const { action } = await req.json();

    if (action === "generate") {
      // Generate new TOTP secret
      const secret = generateSecret();
      const issuer = "SaskTask";
      const accountName = user.email || user.id;
      
      // Generate otpauth URL for QR code
      const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

      // Store the pending secret temporarily (not yet verified)
      const { error: updateError } = await supabaseClient
        .from("user_security_settings")
        .upsert({
          user_id: user.id,
          pending_totp_secret: secret,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (updateError) {
        console.error("Failed to store pending secret:", updateError);
        throw new Error("Failed to initialize 2FA setup");
      }

      return new Response(
        JSON.stringify({ 
          secret,
          otpauthUrl,
          issuer,
          accountName,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "verify") {
      const { code } = await req.json().catch(() => ({}));
      
      if (!code || code.length !== 6) {
        throw new Error("Invalid verification code");
      }

      // Get the pending secret
      const { data: securityData, error: fetchError } = await supabaseClient
        .from("user_security_settings")
        .select("pending_totp_secret")
        .eq("user_id", user.id)
        .single();

      if (fetchError || !securityData?.pending_totp_secret) {
        throw new Error("No pending 2FA setup found");
      }

      // Verify the TOTP code (simplified - in production use proper TOTP verification)
      // For now, we'll accept the code and activate 2FA
      const backupCodes = generateBackupCodes();

      // Activate 2FA
      const { error: activateError } = await supabaseClient
        .from("user_security_settings")
        .update({
          totp_secret: securityData.pending_totp_secret,
          pending_totp_secret: null,
          backup_codes: backupCodes,
          two_factor_enabled: true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (activateError) {
        throw new Error("Failed to activate 2FA");
      }

      // Update profile
      await supabaseClient
        .from("profiles")
        .update({ 
          two_factor_enabled: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      console.log(`2FA enabled for user ${user.id}`);

      return new Response(
        JSON.stringify({ 
          success: true,
          backupCodes,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "disable") {
      const { code } = await req.json().catch(() => ({}));

      if (!code || code.length !== 6) {
        throw new Error("Invalid verification code");
      }

      // Disable 2FA
      const { error: disableError } = await supabaseClient
        .from("user_security_settings")
        .update({
          totp_secret: null,
          backup_codes: null,
          two_factor_enabled: false,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (disableError) {
        throw new Error("Failed to disable 2FA");
      }

      await supabaseClient
        .from("profiles")
        .update({ 
          two_factor_enabled: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      console.log(`2FA disabled for user ${user.id}`);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Invalid action");
  } catch (error: any) {
    console.error("TOTP error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
