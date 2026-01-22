import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateInstantRequestPayload {
  title: string;
  description?: string;
  category: string;
  latitude: number;
  longitude: number;
  address?: string;
  max_budget?: number;
  urgency_level?: 'asap' | 'within_hour' | 'within_2_hours';
  radius_km?: number;
  duration_minutes?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify the user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Invalid authentication");
    }

    // Parse request body
    const payload: CreateInstantRequestPayload = await req.json();

    // Validate required fields
    if (!payload.title || !payload.category || !payload.latitude || !payload.longitude) {
      throw new Error("Missing required fields: title, category, latitude, longitude");
    }

    const radiusKm = payload.radius_km || 10;
    const urgencyLevel = payload.urgency_level || 'asap';
    const durationMinutes = payload.duration_minutes || 15;

    // Calculate expiration time based on urgency
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + durationMinutes);

    // Create the instant request
    const { data: request, error: requestError } = await supabase
      .from('instant_task_requests')
      .insert({
        giver_id: user.id,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address,
        max_budget: payload.max_budget,
        urgency_level: urgencyLevel,
        radius_km: radiusKm,
        expires_at: expiresAt.toISOString(),
        status: 'searching'
      })
      .select()
      .single();

    if (requestError) {
      console.error("Error creating request:", requestError);
      throw new Error("Failed to create instant request");
    }

    // Find nearby available doers using the SQL function
    const { data: nearbyDoers, error: doersError } = await supabase
      .rpc('find_nearby_doers', {
        p_latitude: payload.latitude,
        p_longitude: payload.longitude,
        p_radius_km: radiusKm,
        p_category: payload.category,
        p_exclude_user_id: user.id
      });

    if (doersError) {
      console.error("Error finding doers:", doersError);
    }

    console.log(`Found ${nearbyDoers?.length || 0} nearby doers for request ${request.id}`);

    // Create notification records for each nearby doer
    const notifiedDoers: string[] = [];
    
    if (nearbyDoers && nearbyDoers.length > 0) {
      const notifications = nearbyDoers.map((doer: any) => ({
        request_id: request.id,
        doer_id: doer.user_id,
        status: 'pending',
        notified_at: new Date().toISOString(),
        eta_minutes: Math.ceil(doer.distance_km / 0.5), // Rough ETA
        distance_km: doer.distance_km
      }));

      const { error: notifyError } = await supabase
        .from('instant_request_responses')
        .insert(notifications);

      if (notifyError) {
        console.error("Error creating notifications:", notifyError);
      } else {
        notifiedDoers.push(...nearbyDoers.map((d: any) => d.user_id));
      }
    }

    // If no doers found, update request status
    if (nearbyDoers?.length === 0) {
      console.log("No doers available, updating request status");
      
      await supabase
        .from('instant_task_requests')
        .update({ 
          status: 'searching',
          notification_count: 0
        })
        .eq('id', request.id);
    } else {
      // Update notification count
      await supabase
        .from('instant_task_requests')
        .update({ 
          notification_count: notifiedDoers.length
        })
        .eq('id', request.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        request: {
          id: request.id,
          status: request.status,
          expires_at: request.expires_at,
          notified_doers_count: notifiedDoers.length
        },
        message: notifiedDoers.length > 0 
          ? `Request created. ${notifiedDoers.length} doers notified.`
          : 'Request created. Searching for available doers...'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in create-instant-request:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An error occurred"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
