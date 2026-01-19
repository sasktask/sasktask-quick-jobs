import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { disputeId, analysisType = 'initial' } = await req.json();

    if (!disputeId) {
      throw new Error('Dispute ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch dispute with related data
    const { data: dispute, error: disputeError } = await supabase
      .from('disputes')
      .select(`
        *,
        bookings:booking_id (
          *,
          tasks:task_id (*)
        )
      `)
      .eq('id', disputeId)
      .single();

    if (disputeError) throw disputeError;
    if (!dispute) throw new Error('Dispute not found');

    // Fetch evidence for the dispute
    const { data: evidence } = await supabase
      .from('dispute_evidence')
      .select('*')
      .eq('dispute_id', disputeId);

    // Fetch work evidence for the booking
    const { data: workEvidence } = await supabase
      .from('work_evidence')
      .select('*')
      .eq('booking_id', dispute.booking_id);

    // Fetch checkins for the booking
    const { data: checkins } = await supabase
      .from('task_checkins')
      .select('*')
      .eq('booking_id', dispute.booking_id)
      .order('created_at', { ascending: true });

    // Fetch checklist completions
    const { data: checklistCompletions } = await supabase
      .from('checklist_completions')
      .select(`
        *,
        checklist:checklist_id (title, requires_photo)
      `)
      .eq('booking_id', dispute.booking_id);

    // Fetch audit trail
    const { data: auditEvents } = await supabase
      .from('audit_trail_events')
      .select('*')
      .eq('booking_id', dispute.booking_id)
      .order('created_at', { ascending: true });

    // Fetch profiles for both parties
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, rating, total_reviews, completed_tasks, trust_score, reliability_score')
      .in('id', [dispute.raised_by, dispute.against_user]);

    const raisedByProfile = profiles?.find(p => p.id === dispute.raised_by);
    const againstProfile = profiles?.find(p => p.id === dispute.against_user);

    // Prepare analysis context
    const analysisContext = {
      dispute: {
        reason: dispute.dispute_reason,
        details: dispute.dispute_details,
        created_at: dispute.created_at
      },
      task: dispute.bookings?.tasks ? {
        title: dispute.bookings.tasks.title,
        description: dispute.bookings.tasks.description,
        pay_amount: dispute.bookings.tasks.pay_amount,
        scheduled_date: dispute.bookings.tasks.scheduled_date
      } : null,
      booking: dispute.bookings ? {
        status: dispute.bookings.status,
        created_at: dispute.bookings.created_at,
        deposit_paid: dispute.bookings.deposit_paid
      } : null,
      evidence_count: {
        dispute_evidence: evidence?.length || 0,
        work_evidence: workEvidence?.length || 0
      },
      checkins: {
        total: checkins?.length || 0,
        started: checkins?.some(c => c.checkin_type === 'start') || false,
        completed: checkins?.some(c => c.checkin_type === 'end') || false,
        locations_verified: checkins?.filter(c => c.latitude && c.longitude).length || 0
      },
      checklist: {
        total_items: checklistCompletions?.length || 0,
        approved: checklistCompletions?.filter(c => c.status === 'approved').length || 0,
        rejected: checklistCompletions?.filter(c => c.status === 'rejected').length || 0,
        pending: checklistCompletions?.filter(c => c.status === 'pending').length || 0
      },
      audit_events: auditEvents?.length || 0,
      party_profiles: {
        raiser: raisedByProfile ? {
          trust_score: raisedByProfile.trust_score,
          rating: raisedByProfile.rating,
          completed_tasks: raisedByProfile.completed_tasks
        } : null,
        against: againstProfile ? {
          trust_score: againstProfile.trust_score,
          rating: againstProfile.rating,
          completed_tasks: againstProfile.completed_tasks
        } : null
      }
    };

    // Perform AI analysis if API key is available
    let aiAnalysis = null;
    let recommendation = 'insufficient_evidence';
    let riskScore = 50;
    let confidenceScore = 30;
    let reasoning = '';
    let inconsistencies: string[] = [];
    let suggestedResolution = '';

    if (lovableApiKey) {
      const systemPrompt = `You are an expert dispute resolution analyst for a task marketplace called SaskTask. Analyze disputes between task givers and task doers to provide fair, evidence-based recommendations.

Your role is to:
1. Evaluate all available evidence objectively
2. Consider the reliability and history of both parties
3. Identify any inconsistencies or red flags
4. Recommend a fair resolution

Be thorough but concise. Focus on facts and evidence.`;

      const userPrompt = `Analyze this dispute and provide a recommendation:

DISPUTE DETAILS:
- Reason: ${analysisContext.dispute.reason}
- Description: ${analysisContext.dispute.details}
- Filed: ${analysisContext.dispute.created_at}

TASK INFO:
${analysisContext.task ? `- Title: ${analysisContext.task.title}
- Amount: $${analysisContext.task.pay_amount}
- Scheduled: ${analysisContext.task.scheduled_date}` : 'No task info available'}

EVIDENCE SUMMARY:
- Dispute evidence files: ${analysisContext.evidence_count.dispute_evidence}
- Work evidence files: ${analysisContext.evidence_count.work_evidence}

GPS CHECK-INS:
- Total check-ins: ${analysisContext.checkins.total}
- Task started: ${analysisContext.checkins.started ? 'Yes' : 'No'}
- Task completed: ${analysisContext.checkins.completed ? 'Yes' : 'No'}
- Locations verified: ${analysisContext.checkins.locations_verified}

CHECKLIST STATUS:
- Total items: ${analysisContext.checklist.total_items}
- Approved: ${analysisContext.checklist.approved}
- Rejected: ${analysisContext.checklist.rejected}
- Pending: ${analysisContext.checklist.pending}

PARTY TRUST SCORES:
- Dispute raiser: Trust ${analysisContext.party_profiles.raiser?.trust_score || 'N/A'}, Rating ${analysisContext.party_profiles.raiser?.rating || 'N/A'}
- Accused party: Trust ${analysisContext.party_profiles.against?.trust_score || 'N/A'}, Rating ${analysisContext.party_profiles.against?.rating || 'N/A'}

AUDIT TRAIL: ${analysisContext.audit_events} events recorded

Provide your analysis in the following JSON format:
{
  "risk_score": <0-100, where 100 is highest risk of fraud>,
  "confidence_score": <0-100, confidence in your analysis>,
  "recommendation": "<favor_giver|favor_doer|split|escalate|insufficient_evidence>",
  "reasoning": "<clear explanation of your analysis>",
  "inconsistencies": ["<list of any inconsistencies found>"],
  "suggested_resolution": "<specific action to resolve this dispute>"
}`;

      try {
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
          }),
        });

        if (response.ok) {
          const aiResult = await response.json();
          const content = aiResult.choices?.[0]?.message?.content;
          
          if (content) {
            // Extract JSON from response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                aiAnalysis = JSON.parse(jsonMatch[0]);
                riskScore = aiAnalysis.risk_score || 50;
                confidenceScore = aiAnalysis.confidence_score || 30;
                recommendation = aiAnalysis.recommendation || 'insufficient_evidence';
                reasoning = aiAnalysis.reasoning || '';
                inconsistencies = aiAnalysis.inconsistencies || [];
                suggestedResolution = aiAnalysis.suggested_resolution || '';
              } catch (parseError) {
                console.error('Failed to parse AI response:', parseError);
              }
            }
          }
        } else {
          console.error('AI API error:', response.status, await response.text());
        }
      } catch (aiError) {
        console.error('AI analysis error:', aiError);
      }
    } else {
      // Rule-based analysis fallback
      const hasEvidence = (evidence?.length || 0) > 0 || (workEvidence?.length || 0) > 0;
      const hasCheckins = (checkins?.length || 0) > 0;
      const checklistComplete = analysisContext.checklist.approved === analysisContext.checklist.total_items;

      if (!hasEvidence && !hasCheckins) {
        recommendation = 'insufficient_evidence';
        reasoning = 'Insufficient evidence provided by either party to make a determination.';
        confidenceScore = 20;
      } else if (hasCheckins && analysisContext.checkins.completed && checklistComplete) {
        recommendation = 'favor_doer';
        reasoning = 'Task doer has GPS-verified check-ins showing task completion and all checklist items are approved.';
        confidenceScore = 70;
        riskScore = 30;
      } else if (hasCheckins && !analysisContext.checkins.completed) {
        recommendation = 'favor_giver';
        reasoning = 'GPS check-ins show task was started but not completed by the doer.';
        confidenceScore = 60;
        riskScore = 60;
      } else {
        recommendation = 'escalate';
        reasoning = 'Mixed evidence requires human review for fair resolution.';
        confidenceScore = 40;
        riskScore = 50;
      }

      // Check for inconsistencies
      if (analysisContext.checkins.started && !hasEvidence) {
        inconsistencies.push('Task was started according to GPS but no work evidence was uploaded');
      }
      if (analysisContext.checklist.rejected > 0) {
        inconsistencies.push(`${analysisContext.checklist.rejected} checklist items were rejected by task giver`);
      }
    }

    // Save analysis to database
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('dispute_analysis')
      .insert({
        dispute_id: disputeId,
        analysis_type: analysisType,
        ai_model: lovableApiKey ? 'google/gemini-2.5-flash' : 'rule-based',
        risk_score: riskScore,
        confidence_score: confidenceScore,
        recommendation,
        reasoning,
        evidence_summary: analysisContext,
        inconsistencies,
        suggested_resolution: suggestedResolution
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save analysis:', saveError);
    }

    return new Response(JSON.stringify({
      success: true,
      analysis: {
        id: savedAnalysis?.id,
        risk_score: riskScore,
        confidence_score: confidenceScore,
        recommendation,
        reasoning,
        inconsistencies,
        suggested_resolution: suggestedResolution,
        evidence_summary: analysisContext
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Dispute analysis error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
