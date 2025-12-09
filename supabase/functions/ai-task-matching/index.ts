import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const { taskId } = await req.json();
    
    // Fetch task details
    const { data: task, error: taskError } = await supabaseClient
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .single();

    if (taskError) throw taskError;

    // Fetch available task doers with their skills, ratings, and reputation - sorted by reputation
    const { data: taskers, error: taskersError } = await supabaseClient
      .from("profiles")
      .select(`
        id,
        full_name,
        skills,
        rating,
        total_reviews,
        completed_tasks,
        response_rate,
        on_time_rate,
        availability_status,
        preferred_categories,
        hourly_rate,
        trust_score,
        reputation_score
      `)
      .eq("availability_status", "available")
      .gte("rating", 3.5)
      .order("reputation_score", { ascending: false })
      .order("rating", { ascending: false })
      .limit(50);

    if (taskersError) throw taskersError;

    // Use Lovable AI to match taskers with the task
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are an AI task matching expert. Analyze the task requirements and match them with the best available taskers based on:
1. Reputation Score (HIGHEST PRIORITY) - Their overall reputation combining trust, badges, and history
2. Skills match - How well their skills align with task requirements
3. Experience - Number of completed tasks and expertise
4. Ratings - Overall rating and review count
5. Trust Score - Platform trust level
6. Availability - Current availability status
7. Pricing - If their hourly rate fits the task budget
8. Category preference - If they prefer this type of work
9. Reliability - On-time rate and response rate

IMPORTANT: Prioritize taskers with higher reputation_score and trust_score as they are proven reliable performers.
Return exactly 5 best matches ranked by fit score.`;

    const userPrompt = `Task Details:
- Title: ${task.title}
- Description: ${task.description}
- Category: ${task.category}
- Payment: $${task.pay_amount}
- Location: ${task.location}

Available Taskers:
${JSON.stringify(taskers, null, 2)}

Analyze and return the top 5 best matches with reasoning.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "rank_taskers",
            description: "Return ranked list of best matching taskers",
            parameters: {
              type: "object",
              properties: {
                matches: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      tasker_id: { type: "string" },
                      fit_score: { type: "number", minimum: 0, maximum: 100 },
                      reasoning: { type: "string" },
                      key_strengths: { 
                        type: "array",
                        items: { type: "string" }
                      }
                    },
                    required: ["tasker_id", "fit_score", "reasoning", "key_strengths"]
                  }
                }
              },
              required: ["matches"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "rank_taskers" } }
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI matching failed");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices[0].message.tool_calls?.[0];
    const matchResults = JSON.parse(toolCall.function.arguments);

    // Enrich matches with full tasker data
    const enrichedMatches = matchResults.matches.map((match: any) => {
      const taskerData = taskers.find(t => t.id === match.tasker_id);
      return {
        ...match,
        tasker: taskerData
      };
    });

    return new Response(JSON.stringify({ 
      success: true,
      matches: enrichedMatches
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("AI Task Matching Error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Task matching failed" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
