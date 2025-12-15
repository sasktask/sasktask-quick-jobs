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

    const systemPrompt = `You are SaskTask AI Assistant, a helpful and friendly AI that assists users on the SaskTask platform - a local task marketplace connecting people who need help with skilled taskers.

Your capabilities:
1. **Task Description Help**: Help users write clear, detailed task descriptions that attract quality taskers
2. **Pricing Suggestions**: Suggest fair pricing based on task type, complexity, and market rates in Saskatchewan
3. **Platform Guidance**: Answer questions about how SaskTask works, payments, bookings, reviews
4. **Tasker Matching Tips**: Advise on what to look for when choosing a tasker
5. **Safety Tips**: Provide safety guidelines for both task givers and doers

Context about current user:
${context ? JSON.stringify(context, null, 2) : 'No context provided'}

Guidelines:
- Be concise and helpful (2-3 sentences for simple questions)
- Use bullet points for lists
- If helping with task descriptions, provide a complete rewritten version
- For pricing, give a range based on Saskatchewan market rates
- Always be encouraging and positive
- If you don't know something specific, admit it and suggest they contact support

Saskatchewan-specific knowledge:
- Minimum wage context: Tasks should pay fairly above minimum wage for skilled work
- Common task categories: Snow removal, lawn care, moving help, cleaning, handyman, delivery, pet care, tech help
- Weather considerations: Winter tasks (snow removal) are in high demand Nov-Mar
- Cities: Saskatoon, Regina, Prince Albert, Moose Jaw, Swift Current are main service areas`;

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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
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
      
      return new Response(JSON.stringify({ error: 'Failed to get AI response' }), {
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
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
