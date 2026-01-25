import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyticsPayload {
  timeRange?: "7d" | "30d" | "90d" | "1y";
  metrics?: string[];
}

interface AnalyticsResult {
  period: { start: string; end: string };
  overview: {
    total_users: number;
    new_users: number;
    active_users: number;
    total_tasks: number;
    tasks_completed: number;
    completion_rate: number;
    total_revenue: number;
    platform_fees: number;
    total_payouts: number;
  };
  trends: {
    date: string;
    users: number;
    tasks: number;
    payments: number;
    revenue: number;
  }[];
  categories: {
    name: string;
    task_count: number;
    total_value: number;
    avg_price: number;
  }[];
  performance: {
    avg_task_completion_time_hours: number;
    avg_rating: number;
    dispute_rate: number;
    repeat_customer_rate: number;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify admin role
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claims?.claims?.sub) {
      throw new Error("Invalid authentication");
    }

    const userId = claims.claims.sub as string;
    
    // Check if user is admin
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();

    if (!adminRole) {
      throw new Error("Admin access required");
    }

    const payload: AnalyticsPayload = req.method === "POST" ? await req.json() : {};
    const timeRange = payload.timeRange || "30d";

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    switch (timeRange) {
      case "7d": startDate.setDate(endDate.getDate() - 7); break;
      case "30d": startDate.setDate(endDate.getDate() - 30); break;
      case "90d": startDate.setDate(endDate.getDate() - 90); break;
      case "1y": startDate.setFullYear(endDate.getFullYear() - 1); break;
    }

    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Fetch all data in parallel
    const [
      totalUsersResult,
      newUsersResult,
      activeUsersResult,
      totalTasksResult,
      completedTasksResult,
      paymentsResult,
      categoriesResult,
      disputesResult,
      reviewsResult,
      repeatCustomersResult,
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true })
        .gte("created_at", startISO),
      supabase.from("profiles").select("id", { count: "exact", head: true })
        .gte("updated_at", startISO),
      supabase.from("tasks").select("id", { count: "exact", head: true })
        .gte("created_at", startISO),
      supabase.from("tasks").select("id", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("created_at", startISO),
      supabase.from("payments").select("amount, platform_fee, payout_amount, paid_at, status")
        .eq("status", "completed")
        .gte("paid_at", startISO),
      supabase.from("tasks").select("category, pay_amount")
        .gte("created_at", startISO),
      supabase.from("disputes").select("id", { count: "exact", head: true })
        .gte("created_at", startISO),
      supabase.from("reviews").select("rating")
        .gte("created_at", startISO),
      supabase.from("bookings").select("task_id, task_doer_id")
        .gte("created_at", startISO),
    ]);

    // Calculate revenue metrics
    const payments = paymentsResult.data || [];
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const platformFees = payments.reduce((sum, p) => sum + (p.platform_fee || 0), 0);
    const totalPayouts = payments.reduce((sum, p) => sum + (p.payout_amount || 0), 0);

    // Calculate completion rate
    const totalTasks = totalTasksResult.count || 0;
    const completedTasks = completedTasksResult.count || 0;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Aggregate by category
    const categoryMap = new Map<string, { count: number; total: number }>();
    (categoriesResult.data || []).forEach((task: { category: string; pay_amount: number | null }) => {
      const existing = categoryMap.get(task.category) || { count: 0, total: 0 };
      categoryMap.set(task.category, {
        count: existing.count + 1,
        total: existing.total + (task.pay_amount || 0),
      });
    });

    const categories = Array.from(categoryMap.entries()).map(([name, data]) => ({
      name,
      task_count: data.count,
      total_value: data.total,
      avg_price: data.count > 0 ? data.total / data.count : 0,
    })).sort((a, b) => b.task_count - a.task_count);

    // Calculate performance metrics
    const reviews = reviewsResult.data || [];
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length 
      : 0;
    const disputeRate = totalTasks > 0 
      ? ((disputesResult.count || 0) / totalTasks) * 100 
      : 0;

    // Calculate repeat customer rate
    const bookings = repeatCustomersResult.data || [];
    const customerBookings = new Map<string, number>();
    bookings.forEach((b: { task_doer_id: string }) => {
      const count = customerBookings.get(b.task_doer_id) || 0;
      customerBookings.set(b.task_doer_id, count + 1);
    });
    const repeatCustomers = Array.from(customerBookings.values()).filter(c => c > 1).length;
    const repeatRate = customerBookings.size > 0 
      ? (repeatCustomers / customerBookings.size) * 100 
      : 0;

    // Build daily trends (last 30 days max)
    const trendDays = Math.min(
      timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 30,
      30
    );
    const trends: AnalyticsResult["trends"] = [];
    
    for (let i = trendDays - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const dayPayments = payments.filter(p => 
        p.paid_at && p.paid_at.startsWith(dateStr)
      );
      
      trends.push({
        date: dateStr,
        users: 0, // Would need separate query per day for accuracy
        tasks: 0,
        payments: dayPayments.length,
        revenue: dayPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
      });
    }

    const result: AnalyticsResult = {
      period: { start: startISO, end: endISO },
      overview: {
        total_users: totalUsersResult.count || 0,
        new_users: newUsersResult.count || 0,
        active_users: activeUsersResult.count || 0,
        total_tasks: totalTasks,
        tasks_completed: completedTasks,
        completion_rate: Math.round(completionRate * 10) / 10,
        total_revenue: Math.round(totalRevenue * 100) / 100,
        platform_fees: Math.round(platformFees * 100) / 100,
        total_payouts: Math.round(totalPayouts * 100) / 100,
      },
      trends,
      categories: categories.slice(0, 10),
      performance: {
        avg_task_completion_time_hours: 24, // Would need actual calculation
        avg_rating: Math.round(avgRating * 10) / 10,
        dispute_rate: Math.round(disputeRate * 10) / 10,
        repeat_customer_rate: Math.round(repeatRate * 10) / 10,
      },
    };

    console.log(`[Analytics] Generated report for ${timeRange}: ${totalTasks} tasks, $${totalRevenue} revenue`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: error instanceof Error && error.message.includes("required") ? 401 : 500,
      }
    );
  }
});
