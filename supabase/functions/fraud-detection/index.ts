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
    const { userId, activityType, metadata = {} } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Log user activity
    const { error: logError } = await supabase.from('user_activity_logs').insert({
      user_id: userId,
      activity_type: activityType,
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata: { 
        timestamp: new Date().toISOString(),
        ...metadata
      }
    });

    if (logError) {
      console.error('Error logging activity:', logError);
    }

    // Get user's recent activity for analysis
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

    // Get user's login history for pattern detection
    const { data: loginHistory } = await supabase
      .from('login_history')
      .select('*')
      .eq('user_id', userId)
      .order('login_at', { ascending: false })
      .limit(20);

    // Calculate basic risk indicators
    const cancellationCount = cancellations?.length || 0;
    const disputeCount = disputes?.length || 0;
    const failedLogins = loginHistory?.filter(l => !l.success).length || 0;
    const uniqueIPs = new Set(loginHistory?.map(l => l.ip_address).filter(Boolean)).size;

    // Quick risk assessment without AI
    let riskLevel = 'low';
    const reasons: string[] = [];
    let confidence = 0.5;

    // Check for rapid activity
    const recentActivityCount = recentActivity?.filter(a => 
      new Date(a.created_at) > new Date(Date.now() - 60 * 60 * 1000)
    ).length || 0;

    if (recentActivityCount > 50) {
      riskLevel = 'medium';
      reasons.push('High volume of activity in the last hour');
      confidence = 0.7;
    }

    if (cancellationCount > 3) {
      riskLevel = 'medium';
      reasons.push('Multiple recent cancellations');
      confidence = Math.max(confidence, 0.7);
    }

    if (disputeCount > 2) {
      riskLevel = 'high';
      reasons.push('Multiple disputes filed');
      confidence = 0.85;
    }

    if (failedLogins > 5) {
      riskLevel = 'medium';
      reasons.push('Multiple failed login attempts');
      confidence = Math.max(confidence, 0.75);
    }

    if (uniqueIPs > 5) {
      reasons.push('Login from multiple IP addresses');
    }

    // Use AI for more sophisticated analysis if available
    if (lovableApiKey && (riskLevel === 'medium' || activityType === 'high_value_transaction')) {
      try {
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
                content: 'You are a fraud detection AI for a task marketplace. Analyze user activity patterns and identify suspicious behavior. Be conservative - only flag genuinely suspicious patterns. Return a JSON object with: risk_level (low/medium/high), confidence (0-1), reasons (array of specific concerns), and recommended_action (what to do next).'
              },
              {
                role: 'user',
                content: `Analyze this user activity for potential fraud:
- Recent activities count (last hour): ${recentActivityCount}
- Recent activities (last 10): ${JSON.stringify(recentActivity?.slice(0, 10))}
- Cancellations (last 30 days): ${cancellationCount}
- Total disputes: ${disputeCount}
- Failed login attempts (last 20 logins): ${failedLogins}
- Unique IP addresses: ${uniqueIPs}
- Current action: ${activityType}
- Additional context: ${JSON.stringify(metadata)}`
              }
            ],
            tools: [{
              type: 'function',
              function: {
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
              }
            }],
            tool_choice: { type: 'function', function: { name: 'report_fraud_analysis' } }
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
          
          if (toolCall) {
            const analysis = JSON.parse(toolCall.function.arguments);
            riskLevel = analysis.risk_level;
            confidence = analysis.confidence;
            reasons.length = 0;
            reasons.push(...analysis.reasons);
            
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
                  activity_type: activityType,
                  ip_address: ipAddress,
                  user_agent: userAgent
                }
              });
            }
          }
        } else if (aiResponse.status === 429) {
          console.log('AI rate limited, using rule-based detection');
        }
      } catch (aiError) {
        console.error('AI analysis failed, using rule-based detection:', aiError);
      }
    }

    // Create alert for non-AI detected high risk
    if (riskLevel !== 'low' && !lovableApiKey) {
      await supabase.from('fraud_alerts').insert({
        user_id: userId,
        alert_type: 'rule_based_suspicious_activity',
        severity: riskLevel,
        description: reasons.join('. ') || 'Suspicious activity pattern detected',
        metadata: {
          confidence,
          activity_type: activityType,
          ip_address: ipAddress,
          cancellation_count: cancellationCount,
          dispute_count: disputeCount,
          failed_logins: failedLogins
        }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      analysis: {
        risk_level: riskLevel,
        confidence,
        reasons,
        recommended_action: riskLevel === 'high' ? 'Review account immediately' : 
                           riskLevel === 'medium' ? 'Monitor activity' : 'No action needed'
      },
      alert_created: riskLevel !== 'low'
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