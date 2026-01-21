import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteAccountRequest {
  userId: string;
  verificationId: string;
  code: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, verificationId, code }: DeleteAccountRequest = await req.json();

    if (!userId || !verificationId || !code) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: userId, verificationId, and code are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the OTP code from account_deletion_verifications table
    const { data: verification, error: verifyError } = await supabase
      .from("account_deletion_verifications")
      .select("*")
      .eq("id", verificationId)
      .eq("user_id", userId)
      .is("used_at", null)
      .maybeSingle();

    if (verifyError) {
      console.error("Verification lookup error:", verifyError);
      return new Response(
        JSON.stringify({ error: "Failed to verify deletion request" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!verification) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired verification request. Please request a new code." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if expired (15 minutes validity)
    if (new Date(verification.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Verification code has expired. Please request a new code." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check attempts
    if (verification.attempts >= 5) {
      return new Response(
        JSON.stringify({ error: "Too many failed attempts. Please request a new code." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the code
    if (verification.code !== code) {
      // Increment attempts
      await supabase
        .from("account_deletion_verifications")
        .update({ attempts: verification.attempts + 1 })
        .eq("id", verificationId);

      return new Response(
        JSON.stringify({ error: "Invalid verification code. Please try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark verification as used
    await supabase
      .from("account_deletion_verifications")
      .update({ used_at: new Date().toISOString() })
      .eq("id", verificationId);

    // Check for pending payments or active bookings
    const { data: activeBookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id, status")
      .or(`task_doer_id.eq.${userId},tasks.task_giver_id.eq.${userId}`)
      .in("status", ["pending", "accepted", "in_progress"]);

    if (bookingsError) {
      console.error("Bookings check error:", bookingsError);
    }

    if (activeBookings && activeBookings.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: "You have active bookings. Please complete or cancel all bookings before deleting your account.",
          activeBookings: activeBookings.length
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for pending payouts
    const { data: pendingPayouts, error: payoutsError } = await supabase
      .from("payments")
      .select("id, amount")
      .eq("task_doer_id", userId)
      .eq("status", "pending");

    if (payoutsError) {
      console.error("Payouts check error:", payoutsError);
    }

    if (pendingPayouts && pendingPayouts.length > 0) {
      const totalPending = pendingPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);
      return new Response(
        JSON.stringify({ 
          error: `You have $${totalPending.toFixed(2)} in pending payouts. Please wait for payouts to complete before deleting your account.`,
          pendingAmount: totalPending
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create an audit log entry before deletion
    await supabase.from("audit_trail_events").insert({
      user_id: userId,
      event_type: "account_deleted",
      event_category: "system",
      event_data: {
        deleted_at: new Date().toISOString(),
        verification_id: verificationId,
      },
    });

    // Soft delete user data (mark as deleted, anonymize PII)
    const anonymizedEmail = `deleted_${userId}@deleted.sasktask.com`;
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: "Deleted User",
        email: anonymizedEmail,
        phone: null,
        avatar_url: null,
        bio: null,
        address: null,
        city: null,
        country: null,
        latitude: null,
        longitude: null,
        skills: null,
        preferred_categories: null,
        is_online: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Profile anonymization error:", profileError);
      return new Response(
        JSON.stringify({ error: "Failed to process account deletion. Please contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete the user from Supabase Auth (this will cascade to related tables with ON DELETE CASCADE)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("Auth deletion error:", deleteError);
      // Even if auth deletion fails, we've anonymized the profile
      // User can contact support for full cleanup
      return new Response(
        JSON.stringify({ 
          success: true,
          warning: "Account data has been anonymized. Full auth deletion may require support assistance.",
          message: "Your account has been deleted successfully." 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Account deleted successfully for user: ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Your account has been permanently deleted. We're sorry to see you go." 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in delete-account:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
