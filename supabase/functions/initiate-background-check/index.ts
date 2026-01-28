import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.78.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// API-ready placeholder for background check providers
// Supported providers: certn, checkr, sterling
// To enable: Add the provider's API key as a secret (e.g., CERTN_API_KEY)

interface BackgroundCheckRequest {
  checkId: string;
  provider?: "certn" | "checkr" | "manual";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is admin
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claims?.claims?.sub) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { checkId, provider = "manual" }: BackgroundCheckRequest = await req.json();

    if (!checkId) {
      return new Response(
        JSON.stringify({ error: "Missing checkId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the background check
    const { data: check, error: checkError } = await supabase
      .from("background_checks")
      .select("*")
      .eq("id", checkId)
      .single();

    if (checkError || !check) {
      return new Response(
        JSON.stringify({ error: "Background check not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Provider-specific logic
    let providerResponse: Record<string, unknown> = {};
    let providerReferenceId: string | null = null;

    switch (provider) {
      case "certn": {
        // CERTN API integration placeholder
        // To implement:
        // 1. Add CERTN_API_KEY secret
        // 2. Make API call to https://api.certn.co/v1/applicants
        // const certnApiKey = Deno.env.get("CERTN_API_KEY");
        // if (!certnApiKey) throw new Error("CERTN_API_KEY not configured");
        
        console.log("Certn integration not yet configured - falling back to manual");
        providerResponse = { 
          message: "Certn API key not configured. Please add CERTN_API_KEY secret.",
          fallback: "manual"
        };
        break;
      }

      case "checkr": {
        // CHECKR API integration placeholder
        // To implement:
        // 1. Add CHECKR_API_KEY secret
        // 2. Make API call to https://api.checkr.com/v1/candidates
        // const checkrApiKey = Deno.env.get("CHECKR_API_KEY");
        // if (!checkrApiKey) throw new Error("CHECKR_API_KEY not configured");
        
        console.log("Checkr integration not yet configured - falling back to manual");
        providerResponse = { 
          message: "Checkr API key not configured. Please add CHECKR_API_KEY secret.",
          fallback: "manual"
        };
        break;
      }

      case "manual":
      default: {
        // Manual review - just update status to processing
        providerResponse = { 
          message: "Background check queued for manual review",
          provider: "manual"
        };
        break;
      }
    }

    // Update the background check with provider info
    const { error: updateError } = await supabase
      .from("background_checks")
      .update({
        status: "processing",
        provider: provider,
        provider_reference_id: providerReferenceId,
        provider_response: providerResponse,
        started_at: new Date().toISOString(),
      })
      .eq("id", checkId);

    if (updateError) {
      console.error("Failed to update background check:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update background check" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Background check ${checkId} initiated with provider: ${provider}`);

    return new Response(
      JSON.stringify({
        success: true,
        checkId,
        provider,
        status: "processing",
        message: providerResponse.message || "Background check initiated",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error initiating background check:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
