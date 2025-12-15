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

    const systemPrompt = `You are SaskTask AI - a smart, helpful assistant for a Saskatchewan task marketplace. You're like ChatGPT but specialized for task-related questions.

## YOUR PERSONALITY:
- Friendly, helpful, and knowledgeable
- Direct but warm
- You give practical, actionable advice

## RESPONSE FORMAT (ALWAYS follow this structure):

**Answer the question directly first.** Be clear and helpful.

Then provide relevant details in a well-organized way using:
- **Bold headers** for sections when helpful
- Bullet points for lists
- Specific numbers and examples

End EVERY response with exactly this format:
**You might also want to know:** [What should I include in my task description?] | [How do I choose the right tasker?] | [What's the typical timeline for this?]

Replace the example questions with 3 relevant follow-up questions based on the conversation.

## PRICING KNOWLEDGE (Saskatchewan 2025):
- Home Cleaning: $30-35/hr
- Moving Help: $40-45/hr per person  
- Snow Removal: $50-70/driveway
- Lawn Care: $40-50/yard
- Handyman Work: $50-65/hr
- Furniture Assembly: $60-80/item
- Delivery: $25-30/hr + $0.55/km
- Pet Care: $25-30/visit
- Tech Help: $45-55/hr

## PLATFORM KNOWLEDGE:
- SaskTask connects task givers (people who need help) with task doers (people who do tasks)
- Deposit system protects both parties
- Reviews and ratings help build trust
- Messaging system for communication
- Safe payment processing

## USER CONTEXT:
${context?.userRole ? `User is a: ${context.userRole}` : ''}
${context?.userName ? `Name: ${context.userName}` : ''}

## IMPORTANT RULES:
1. ALWAYS be helpful - answer any reasonable question
2. If the question relates to tasks, add SaskTask context
3. Keep responses focused but complete
4. ALWAYS end with the follow-up questions format
5. Be encouraging and supportive`;

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
