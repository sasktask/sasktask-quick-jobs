import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  checks: {
    database: { status: string; latency_ms: number };
    stripe: { status: string; configured: boolean };
    email: { status: string; configured: boolean };
    ai: { status: string; configured: boolean };
    sms: { status: string; configured: boolean };
    maps: { status: string; configured: boolean };
  };
  metrics: {
    active_users_24h: number;
    tasks_created_24h: number;
    payments_processed_24h: number;
    avg_response_time_ms: number;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check database connectivity
    const dbStart = Date.now();
    const { error: dbError } = await supabase.from("profiles").select("id").limit(1);
    const dbLatency = Date.now() - dbStart;

    // Check external service configurations
    const stripeConfigured = !!Deno.env.get("STRIPE_SECRET_KEY");
    const emailConfigured = !!Deno.env.get("RESEND_API_KEY");
    const aiConfigured = !!Deno.env.get("LOVABLE_API_KEY");
    const smsConfigured = !!(Deno.env.get("TWILIO_ACCOUNT_SID") && Deno.env.get("TWILIO_AUTH_TOKEN"));
    const mapsConfigured = !!Deno.env.get("MAPBOX_PUBLIC_TOKEN");

    // Get platform metrics (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [activeUsersResult, tasksResult, paymentsResult] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true })
        .gte("updated_at", yesterday),
      supabase.from("tasks").select("id", { count: "exact", head: true })
        .gte("created_at", yesterday),
      supabase.from("payments").select("id", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("paid_at", yesterday),
    ]);

    const responseTime = Date.now() - startTime;

    // Determine overall health status
    let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";
    
    if (dbError) {
      overallStatus = "unhealthy";
    } else if (!stripeConfigured || !emailConfigured) {
      overallStatus = "degraded";
    } else if (dbLatency > 1000) {
      overallStatus = "degraded";
    }

    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: "2.0.0",
      checks: {
        database: {
          status: dbError ? "error" : "ok",
          latency_ms: dbLatency,
        },
        stripe: {
          status: stripeConfigured ? "ok" : "not_configured",
          configured: stripeConfigured,
        },
        email: {
          status: emailConfigured ? "ok" : "not_configured",
          configured: emailConfigured,
        },
        ai: {
          status: aiConfigured ? "ok" : "not_configured",
          configured: aiConfigured,
        },
        sms: {
          status: smsConfigured ? "ok" : "not_configured",
          configured: smsConfigured,
        },
        maps: {
          status: mapsConfigured ? "ok" : "not_configured",
          configured: mapsConfigured,
        },
      },
      metrics: {
        active_users_24h: activeUsersResult.count || 0,
        tasks_created_24h: tasksResult.count || 0,
        payments_processed_24h: paymentsResult.count || 0,
        avg_response_time_ms: responseTime,
      },
    };

    // Log health check for monitoring
    console.log(`[Health Check] Status: ${overallStatus}, DB Latency: ${dbLatency}ms, Response: ${responseTime}ms`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: overallStatus === "unhealthy" ? 503 : 200,
    });
  } catch (error) {
    console.error("Health check error:", error);
    
    return new Response(
      JSON.stringify({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 503,
      }
    );
  }
});
