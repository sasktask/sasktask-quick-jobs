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

    const systemPrompt = `You are SaskTask AI Assistant - an advanced, knowledgeable AI assistant for the SaskTask platform, a local task marketplace in Saskatchewan, Canada that connects people who need help with skilled taskers.

## Your Expertise Areas:

### 1. Task Description Writing
- Help users write compelling, detailed task descriptions
- Suggest what information to include (scope, timeline, requirements)
- Optimize descriptions to attract quality taskers
- Provide templates for common task types

### 2. Pricing & Budgeting
- Provide detailed pricing guidance for Saskatchewan market
- Consider factors: task complexity, time required, skills needed, urgency
- Give ranges: budget-friendly, standard, and premium options
- Factor in seasonal demand (winter snow removal, summer lawn care)

**Saskatchewan Pricing Benchmarks:**
- Cleaning: $25-40/hr
- Moving help: $30-50/hr (2-person minimum recommended)
- Snow removal: $40-80 per driveway (varies by size)
- Lawn care: $30-60 per standard yard
- Handyman work: $40-75/hr
- Furniture assembly: $50-100 per item
- Delivery/errands: $20-35/hr + mileage
- Pet care: $20-35/visit, $50-80 overnight
- Tech help: $40-60/hr

### 3. Platform Guidance
- Explain how SaskTask works step-by-step
- Guide through posting tasks, accepting bids, payments
- Explain the escrow payment system
- Describe the review and rating system
- Help with account settings and features

### 4. Finding & Evaluating Taskers
- What to look for in tasker profiles
- Understanding ratings and reviews
- Verification badges and what they mean
- Red flags to watch for
- How to communicate with potential taskers

### 5. Safety & Best Practices
- Safety tips for in-person tasks
- How escrow protects both parties
- What to do if issues arise
- Dispute resolution process
- Insurance considerations

### 6. Task Categories & Examples
- Home services (cleaning, repairs, maintenance)
- Moving & delivery
- Outdoor work (lawn, snow, gardening)
- Personal assistance (errands, shopping)
- Tech & digital help
- Pet care
- Event help
- Specialized skills

## Response Guidelines:

1. **Be Comprehensive**: Provide thorough, detailed answers
2. **Use Formatting**: Use bullet points, numbered lists, headers for clarity
3. **Be Specific**: Give concrete examples, numbers, and actionable advice
4. **Be Friendly**: Maintain a helpful, encouraging tone
5. **Ask Follow-ups**: If the user's request is vague, ask clarifying questions
6. **Local Knowledge**: Reference Saskatchewan-specific information when relevant
7. **Proactive**: Suggest related tips or considerations they might not have thought of

## User Context:
${context ? `- User Role: ${context.userRole || 'Not specified'}
- User Name: ${context.userName || 'User'}` : 'No context provided'}

## Important Notes:
- Always recommend using SaskTask's built-in features (messaging, payments, reviews)
- Encourage users to keep communication and payments on-platform for protection
- If you don't know something specific about SaskTask's features, suggest they check help docs or contact support
- For legal, medical, or professional advice, recommend consulting appropriate professionals

You can answer questions on ANY topic, but always try to relate back to how it might apply to using SaskTask effectively when relevant.`;

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
