import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MatchRequest {
  user_id: string;
  latitude?: number;
  longitude?: number;
  limit?: number;
  categories?: string[];
}

interface TaskMatch {
  task_id: string;
  title: string;
  category: string;
  pay_amount: number;
  location: string;
  distance_km: number | null;
  match_score: number;
  match_reasons: string[];
  urgency: string;
  created_at: string;
}

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claims?.claims?.sub) {
      throw new Error("Invalid authentication");
    }

    const userId = claims.claims.sub as string;
    const payload: MatchRequest = await req.json();

    // Fetch user preferences and profile
    const [preferencesResult, profileResult, completedTasksResult] = await Promise.all([
      supabase.from("user_match_preferences").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("bookings")
        .select("task_id, tasks(category)")
        .eq("task_doer_id", userId)
        .eq("status", "completed")
        .limit(50),
    ]);

    const preferences = preferencesResult.data;
    const profile = profileResult.data;
    
    // Build category history for personalization
    const categoryHistory = new Map<string, number>();
    const completedBookings = completedTasksResult.data || [];
    completedBookings.forEach((booking) => {
      // Handle both array and single object responses
      const tasksData = booking.tasks;
      let category: string | undefined;
      if (Array.isArray(tasksData) && tasksData[0]?.category) {
        category = tasksData[0].category;
      } else if (tasksData && typeof tasksData === 'object' && 'category' in tasksData) {
        category = (tasksData as { category: string }).category;
      }
      if (category) {
        const count = categoryHistory.get(category) || 0;
        categoryHistory.set(category, count + 1);
      }
    });
    
    // Store user location for use in matching
    const userLat = payload.latitude;
    const userLon = payload.longitude;

    // Fetch available tasks
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select(`
        id, title, description, category, pay_amount, location, 
        latitude, longitude, priority, created_at, deadline,
        task_giver_id, status
      `)
      .eq("status", "open")
      .neq("task_giver_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (tasksError) throw tasksError;

    // Score and rank tasks
    const scoredTasks: TaskMatch[] = (tasks || []).map((task) => {
      let score = 50; // Base score
      const reasons: string[] = [];

      // 1. Category match (up to 25 points)
      const preferredCategories = preferences?.preferred_categories || [];
      if (preferredCategories.includes(task.category)) {
        score += 20;
        reasons.push("Matches your preferred category");
      }
      if (categoryHistory.has(task.category)) {
        const historyBonus = Math.min(categoryHistory.get(task.category)! * 2, 5);
        score += historyBonus;
        reasons.push("You've done similar tasks before");
      }
      if (payload.categories?.includes(task.category)) {
        score += 5;
      }

      // 2. Distance scoring (up to 20 points)
      let distance: number | null = null;
      const userLat = payload.latitude;
      const userLon = payload.longitude;
      
      if (userLat && userLon && task.latitude && task.longitude) {
        distance = calculateDistance(userLat, userLon, task.latitude, task.longitude);
        const maxDistance = preferences?.preferred_distance_km || 25;
        
        if (distance <= 5) {
          score += 20;
          reasons.push("Very close to you");
        } else if (distance <= 10) {
          score += 15;
          reasons.push("Nearby location");
        } else if (distance <= maxDistance) {
          score += 10;
          reasons.push("Within your preferred distance");
        } else {
          score -= 10; // Penalty for far tasks
        }
      }

      // 3. Price scoring (up to 15 points)
      const minPrice = preferences?.preferred_price_min || 0;
      const maxPrice = preferences?.preferred_price_max || 1000;
      
      if (task.pay_amount >= minPrice && task.pay_amount <= maxPrice) {
        score += 10;
        reasons.push("Matches your price range");
      }
      if (task.pay_amount > 100) {
        score += 5;
        reasons.push("High-value task");
      }

      // 4. Urgency scoring (up to 10 points)
      if (task.priority === "urgent") {
        score += 10;
        reasons.push("Urgent - pays faster");
      } else if (task.priority === "high") {
        score += 5;
      }

      // 5. Recency scoring (up to 10 points)
      const hoursAgo = (Date.now() - new Date(task.created_at).getTime()) / (1000 * 60 * 60);
      if (hoursAgo < 1) {
        score += 10;
        reasons.push("Just posted");
      } else if (hoursAgo < 6) {
        score += 5;
        reasons.push("Posted recently");
      }

      // 6. Deadline proximity (up to 5 points)
      if (task.deadline) {
        const daysUntil = (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        if (daysUntil > 0 && daysUntil <= 2) {
          score += 5;
          reasons.push("Deadline soon");
        }
      }

      return {
        task_id: task.id,
        title: task.title,
        category: task.category,
        pay_amount: task.pay_amount || 0,
        location: task.location || "",
        distance_km: distance ? Math.round(distance * 10) / 10 : null,
        match_score: Math.min(100, Math.max(0, score)),
        match_reasons: reasons.slice(0, 3),
        urgency: task.priority || "medium",
        created_at: task.created_at,
      };
    });

    // Sort by score and limit results
    const limit = payload.limit || 20;
    const topMatches = scoredTasks
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, limit);

    // Log matching for analytics
    if (topMatches.length > 0) {
      try {
        await supabase.from("smart_match_logs").insert({
          user_id: userId,
          matched_task_ids: topMatches.slice(0, 5).map(t => t.task_id),
          scores: topMatches.slice(0, 5).map(t => t.match_score),
          user_location: userLat && userLon ? { lat: userLat, lng: userLon } : null,
          preferences_used: {
            categories: preferences?.preferred_categories,
            distance_km: preferences?.preferred_distance_km,
            price_range: [preferences?.preferred_price_min, preferences?.preferred_price_max],
          },
        });
      } catch (logErr) {
        console.error("Failed to log match:", logErr);
      }
    }

    console.log(`[Smart Match] Found ${topMatches.length} matches for user ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        matches: topMatches,
        total_available: tasks?.length || 0,
        user_preferences: {
          categories: preferences?.preferred_categories || [],
          max_distance_km: preferences?.preferred_distance_km || 25,
          price_range: {
            min: preferences?.preferred_price_min || 0,
            max: preferences?.preferred_price_max || 1000,
          },
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Smart matching error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: error instanceof Error && error.message.includes("required") ? 401 : 500,
      }
    );
  }
});
