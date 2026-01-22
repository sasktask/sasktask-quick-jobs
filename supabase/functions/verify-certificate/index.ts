import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  certificateId: string;
  action: "verify" | "reject";
  rejectionReason?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth header to verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Verify user is authenticated
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin (you can customize this check)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // For now, we'll rely on the frontend AdminLayout check
    // You can add additional admin verification here if needed

    const { certificateId, action, rejectionReason }: VerifyRequest = await req.json();

    if (!certificateId || !action) {
      throw new Error("Missing required fields: certificateId, action");
    }

    if (action === "reject" && !rejectionReason) {
      throw new Error("Rejection reason is required when rejecting a certificate");
    }

    // Get certificate details
    const { data: certificate, error: certError } = await supabase
      .from("certificates")
      .select("*, profiles!certificates_user_id_fkey(email, full_name)")
      .eq("id", certificateId)
      .single();

    if (certError || !certificate) {
      throw new Error("Certificate not found");
    }

    // Update certificate status
    const updateData: any = {
      status: action === "verify" ? "verified" : "rejected",
      updated_at: new Date().toISOString(),
    };

    if (action === "verify") {
      updateData.verified_at = new Date().toISOString();
      updateData.verified_by = user.id;
    }

    const { error: updateError } = await supabase
      .from("certificates")
      .update(updateData)
      .eq("id", certificateId);

    if (updateError) {
      throw updateError;
    }

    // Create notification for the certificate owner
    const notificationTitle = action === "verify" 
      ? "Certificate Verified! ✅" 
      : "Certificate Rejected";
    
    const notificationMessage = action === "verify"
      ? `Your certificate "${certificate.name}" has been verified and is now visible on your profile.`
      : `Your certificate "${certificate.name}" was rejected. Reason: ${rejectionReason}`;

    await supabase.from("notifications").insert({
      user_id: certificate.user_id,
      title: notificationTitle,
      message: notificationMessage,
      type: action === "verify" ? "certificate_verified" : "certificate_rejected",
    });

    // Create audit trail entry
    await supabase.from("audit_trail_events").insert({
      user_id: user.id,
      event_type: action === "verify" ? "certificate_verified" : "certificate_rejected",
      entity_type: "certificate",
      entity_id: certificateId,
      details: {
        certificate_name: certificate.name,
        certificate_owner: certificate.user_id,
        action: action,
        rejection_reason: rejectionReason || null,
      },
      ip_address: req.headers.get("x-forwarded-for") || "unknown",
    });

    console.log(`Certificate ${certificateId} ${action}ed by admin ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Certificate ${action === "verify" ? "verified" : "rejected"} successfully`,
        certificateId,
        newStatus: action === "verify" ? "verified" : "rejected",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error verifying certificate:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to process certificate verification",
      }),
      {
        status: error.message === "Unauthorized" ? 401 : 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
