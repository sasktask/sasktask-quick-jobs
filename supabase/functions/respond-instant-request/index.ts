import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RespondRequestPayload {
  request_id: string;
  action: 'accept' | 'decline';
  eta_minutes?: number;
  decline_reason?: string;
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
    const payload: RespondRequestPayload = await req.json();

    // Validate required fields
    if (!payload.request_id || !payload.action) {
      throw new Error("Missing required fields: request_id, action");
    }

    if (payload.action !== 'accept' && payload.action !== 'decline') {
      throw new Error("Invalid action. Must be 'accept' or 'decline'");
    }

    // Get the instant request
    const { data: request, error: requestError } = await supabase
      .from('instant_task_requests')
      .select('*')
      .eq('id', payload.request_id)
      .single();

    if (requestError || !request) {
      throw new Error("Request not found");
    }

    // Check if request is still available
    if (request.status !== 'searching') {
      throw new Error(`Request is no longer available (status: ${request.status})`);
    }

    // Check if request has expired
    if (new Date(request.expires_at) < new Date()) {
      // Update request to expired
      await supabase
        .from('instant_task_requests')
        .update({ status: 'expired' })
        .eq('id', payload.request_id);
      
      throw new Error("Request has expired");
    }

    // Get the response record for this doer
    const { data: responseRecord, error: respError } = await supabase
      .from('instant_request_responses')
      .select('*')
      .eq('request_id', payload.request_id)
      .eq('doer_id', user.id)
      .single();

    if (respError || !responseRecord) {
      throw new Error("You were not notified about this request");
    }

    if (responseRecord.status !== 'pending') {
      throw new Error("You have already responded to this request");
    }

    const now = new Date().toISOString();

    if (payload.action === 'decline') {
      // Update the response to declined
      const { error: updateError } = await supabase
        .from('instant_request_responses')
        .update({
          status: 'declined',
          responded_at: now
        })
        .eq('id', responseRecord.id);

      if (updateError) {
        throw new Error("Failed to update response");
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Request declined"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Handle accept action
    // Use a transaction-like approach to prevent race conditions
    
    // First, try to update the request (only if still searching)
    const etaMinutes = payload.eta_minutes || 15;
    const estimatedArrival = new Date();
    estimatedArrival.setMinutes(estimatedArrival.getMinutes() + etaMinutes);

    const { data: updatedRequest, error: updateRequestError } = await supabase
      .from('instant_task_requests')
      .update({
        status: 'accepted',
        matched_doer_id: user.id,
        accepted_at: now,
        estimated_arrival: estimatedArrival.toISOString()
      })
      .eq('id', payload.request_id)
      .eq('status', 'searching') // Only update if still searching
      .select()
      .single();

    if (updateRequestError) {
      // Check if someone else got it
      const { data: currentRequest } = await supabase
        .from('instant_task_requests')
        .select('status, matched_doer_id')
        .eq('id', payload.request_id)
        .single();

      if (currentRequest?.status === 'accepted' && currentRequest?.matched_doer_id !== user.id) {
        throw new Error("Another doer has already accepted this request");
      }
      
      throw new Error("Failed to accept request");
    }

    // Update the doer's response
    await supabase
      .from('instant_request_responses')
      .update({
        status: 'accepted',
        responded_at: now,
        eta_minutes: etaMinutes
      })
      .eq('id', responseRecord.id);

    // Mark all other responses as expired
    await supabase
      .from('instant_request_responses')
      .update({ status: 'expired' })
      .eq('request_id', payload.request_id)
      .neq('doer_id', user.id)
      .eq('status', 'pending');

    // Get giver info for the doer
    const { data: giver } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, phone')
      .eq('id', request.giver_id)
      .single();

    // Log ETA accuracy for ML
    await supabase
      .from('eta_accuracy_logs')
      .insert({
        request_id: payload.request_id,
        doer_id: user.id,
        estimated_arrival: estimatedArrival.toISOString(),
        distance_at_accept: responseRecord.distance_km
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Request accepted successfully",
        request: {
          id: updatedRequest.id,
          title: updatedRequest.title,
          category: updatedRequest.category,
          latitude: updatedRequest.latitude,
          longitude: updatedRequest.longitude,
          address: updatedRequest.address,
          max_budget: updatedRequest.max_budget
        },
        giver: giver,
        eta: {
          minutes: etaMinutes,
          arrival_time: estimatedArrival.toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in respond-instant-request:", error);
    
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
