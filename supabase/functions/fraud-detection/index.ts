import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, activityType } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log user activity
    await supabase.from('user_activity_logs').insert({
      user_id: userId,
      activity_type: activityType,
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      user_agent: req.headers.get('user-agent'),
      metadata: { timestamp: new Date().toISOString() }
    });

    // Get user's recent activity
    const { data: recentActivity } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    // Get user's cancellations and disputes
    const { data: cancellations } = await supabase
      .from('cancellations')
      .select('*')
      .eq('cancelled_by', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const { data: disputes } = await supabase
      .from('disputes')
      .select('*')
      .eq('raised_by', userId);

    // Use AI to analyze fraud patterns
    if (lovableApiKey) {
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: 'You are a fraud detection AI. Analyze user activity and identify suspicious patterns. Return a JSON object with: risk_level (low/medium/high), confidence (0-1), reasons (array), and recommended_action.'
            },
            {
              role: 'user',
              content: `Analyze this user activity:
- Recent activities: ${JSON.stringify(recentActivity?.slice(0, 10))}
- Cancellations (last 30 days): ${cancellations?.length || 0}
- Total disputes: ${disputes?.length || 0}
- Current action: ${activityType}`
            }
          ],
          tools: [{
            type: 'function',
            name: 'report_fraud_analysis',
            description: 'Report fraud detection analysis results',
            parameters: {
              type: 'object',
              properties: {
                risk_level: { type: 'string', enum: ['low', 'medium', 'high'] },
                confidence: { type: 'number' },
                reasons: { type: 'array', items: { type: 'string' } },
                recommended_action: { type: 'string' }
              },
              required: ['risk_level', 'confidence', 'reasons', 'recommended_action'],
              additionalProperties: false
            }
          }],
          tool_choice: { type: 'function', function: { name: 'report_fraud_analysis' } }
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw new Error(`AI request failed: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      
      if (toolCall) {
        const analysis = JSON.parse(toolCall.function.arguments);
        
        // Create fraud alert if risk is medium or high
        if (analysis.risk_level !== 'low') {
          await supabase.from('fraud_alerts').insert({
            user_id: userId,
            alert_type: 'ai_detected_suspicious_activity',
            severity: analysis.risk_level,
            description: analysis.reasons.join('. '),
            metadata: {
              confidence: analysis.confidence,
              recommended_action: analysis.recommended_action,
              activity_type: activityType
            }
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          analysis,
          alert_created: analysis.risk_level !== 'low'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Activity logged'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Fraud detection error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});