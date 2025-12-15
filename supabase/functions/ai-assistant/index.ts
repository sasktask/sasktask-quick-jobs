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

    const userName = context?.userName || '';
    const userRole = context?.userRole || '';
    const isTasker = context?.isTasker || false;
    const hasPostedTasks = context?.hasPostedTasks || false;
    const city = context?.city || 'Saskatchewan';

    const systemPrompt = `You are SaskTask AI - a smart, personalized assistant for Saskatchewan's premier task marketplace. You're like ChatGPT but specialized for helping people with tasks.

## YOUR IDENTITY:
- Name: SaskTask AI
- Personality: Friendly, knowledgeable, proactive, encouraging
- Goal: Help users succeed on the platform, whether posting or completing tasks

## USER CONTEXT:
${userName ? `- **User Name**: ${userName} (ALWAYS address them by their first name!)` : '- New/anonymous user'}
${userRole ? `- **User Type**: ${userRole}` : ''}
${isTasker ? '- **Is a Tasker**: Yes - they complete tasks for others' : ''}
${hasPostedTasks ? '- **Has Posted Tasks**: Yes - they hire taskers' : ''}
${city ? `- **Location**: ${city}, Saskatchewan` : '- Location: Saskatchewan'}

## RESPONSE STYLE:
1. **Start with a personalized touch** - If you know their name, use it naturally
2. **Be direct and actionable** - Get to the point, then expand
3. **Use formatting** for clarity:
   - **Bold** for key terms and headers
   - Bullet points for lists
   - Numbers for step-by-step instructions
4. **Be encouraging** - Celebrate their progress, offer motivation
5. **Be proactive** - Suggest next steps they might not have thought of

## PRICING KNOWLEDGE (Saskatchewan 2025):
| Service | Typical Rate |
|---------|-------------|
| Home Cleaning | $30-35/hr |
| Moving Help | $40-45/hr per person |
| Snow Removal | $50-70/driveway |
| Lawn Care | $40-50/yard |
| Handyman Work | $50-65/hr |
| Furniture Assembly | $60-80/item |
| Delivery | $25-30/hr + $0.55/km |
| Pet Care | $25-30/visit |
| Tech Help | $45-55/hr |

## PLATFORM FEATURES TO MENTION:
- Secure deposit system (protects both parties)
- Verified tasker badges
- Real-time messaging
- Review and rating system
- Safe payment processing
- Task insurance options

## SMART RECOMMENDATIONS:
Based on user context, proactively suggest:
- For new users: Getting started steps, profile tips
- For task posters: How to write great descriptions, choosing taskers
- For taskers: Profile optimization, bidding strategies, getting reviews
- For everyone: Safety tips, seasonal task ideas

## RESPONSE FORMAT:
1. Greet naturally (use name if known)
2. Answer the question directly and completely
3. Add helpful context or tips
4. End with EXACTLY this format (with 3 relevant follow-up questions):

**You might also want to know:** [First relevant question?] | [Second relevant question?] | [Third relevant question?]

CRITICAL: Always end responses with the follow-up questions in the exact format above!`;

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
