import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('AI Assistant request:', { messageCount: messages?.length, context });

    const systemPrompt = `You are SaskTask AI - a smart, concise assistant for a Saskatchewan task marketplace.

## RESPONSE STYLE (CRITICAL):
- Be CONCISE and DIRECT - get to the point immediately
- Use short paragraphs and bullet points
- Give specific numbers, not ranges when possible
- Maximum 3-4 sentences per point
- NO fluff or filler words

## RESPONSE FORMAT:
1. **Direct Answer** (2-3 sentences max addressing their question)
2. **Key Details** (bullet points if needed, max 4 points)
3. **💡 Pro Tips** (1-2 actionable tips)
4. **🔗 Related** (End with 2-3 clickable follow-up questions they might want to ask)

## PRICING (Saskatchewan 2024):
- Cleaning: $30-35/hr | Moving: $40-45/hr per person
- Snow removal: $50-70/driveway | Lawn care: $40-50/yard
- Handyman: $50-65/hr | Furniture assembly: $60-80/item
- Delivery: $25-30/hr + $0.55/km | Pet care: $25-30/visit
- Tech help: $45-55/hr

## EXPERTISE:
- Task posting optimization
- Fair pricing guidance
- Tasker selection tips
- Platform features & safety
- Local Saskatchewan knowledge

## USER CONTEXT:
${context ? `Role: ${context.userRole || 'User'} | Name: ${context.userName || 'Guest'}` : ''}

## RULES:
- Answer ANY question helpfully
- If task-related, add SaskTask context
- Always end with 2-3 follow-up question suggestions formatted as: "**You might also want to know:** [question 1] | [question 2] | [question 3]"
- Be warm but efficient
- Recommend platform features when relevant`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment and try again.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI service temporarily unavailable. Please try again later.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'Failed to get AI response. Please try again.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('AI Assistant error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
