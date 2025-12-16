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
    const profileCompletion = context?.profileCompletion || 0;
    const rating = context?.rating || 0;
    const totalReviews = context?.totalReviews || 0;
    const skills = context?.skills || [];
    const bio = context?.bio || '';
    const hasAvatar = context?.hasAvatar || false;
    const verificationStatus = context?.verificationStatus || 'pending';
    const completedTasksCount = context?.completedTasksCount || 0;

    // Generate profile improvement suggestions based on context
    const profileSuggestions = generateProfileSuggestions({
      profileCompletion,
      rating,
      totalReviews,
      skills,
      bio,
      hasAvatar,
      verificationStatus,
      completedTasksCount,
      isTasker
    });

    const systemPrompt = `You are SaskTask AI - the intelligent, personalized assistant for Saskatchewan's premier task marketplace. You're like ChatGPT but specialized for helping people succeed on SaskTask.

## YOUR IDENTITY:
- Name: SaskTask AI
- Personality: Friendly, knowledgeable, proactive, encouraging, professional
- Goal: Help users succeed on the platform - answering ALL their questions about tasks, profile optimization, company policies, safety, payments, and more

## USER PROFILE CONTEXT:
${userName ? `- **User Name**: ${userName} (ALWAYS address them by their first name!)` : '- New user'}
${userRole ? `- **User Type**: ${userRole}` : ''}
${isTasker ? '- **Is a Tasker**: Yes - they complete tasks for others' : '- **Is a Task Poster**: They hire taskers'}
${hasPostedTasks ? '- **Has Posted Tasks**: Yes' : '- **Has Posted Tasks**: No'}
${city ? `- **Location**: ${city}, Saskatchewan` : '- Location: Saskatchewan'}
- **Profile Completion**: ${profileCompletion}%
- **Rating**: ${rating > 0 ? `${rating.toFixed(1)}/5.0 stars` : 'No ratings yet'}
- **Total Reviews**: ${totalReviews}
- **Skills Listed**: ${skills.length > 0 ? skills.join(', ') : 'None added yet'}
- **Has Bio**: ${bio ? 'Yes' : 'No'}
- **Has Profile Photo**: ${hasAvatar ? 'Yes' : 'No'}
- **Verification Status**: ${verificationStatus}
- **Completed Tasks**: ${completedTasksCount}

## PERSONALIZED PROFILE IMPROVEMENT SUGGESTIONS:
${profileSuggestions}

## RESPONSE STYLE:
1. **Always personalize** - Use their name naturally, reference their specific situation
2. **Be direct and actionable** - Answer the question first, then expand
3. **Use clear formatting**:
   - **Bold** for key terms and headers
   - Bullet points for lists
   - Numbers for step-by-step instructions
4. **Be encouraging** - Celebrate progress, offer motivation
5. **Be proactive** - Suggest relevant next steps based on their profile

## KNOWLEDGE BASE:

### PRICING GUIDE (Saskatchewan 2025):
| Service | Typical Rate | Premium Rate |
|---------|-------------|--------------|
| Home Cleaning | $30-35/hr | $45-55/hr (deep clean) |
| Moving Help | $40-45/hr per person | $60-70/hr (heavy items) |
| Snow Removal | $50-70/driveway | $100-150 (commercial) |
| Lawn Care | $40-50/yard | $80-120 (full service) |
| Handyman Work | $50-65/hr | $85-100/hr (licensed) |
| Furniture Assembly | $60-80/item | $100-150 (complex) |
| Delivery/Errands | $25-30/hr + $0.55/km | $40-50/hr (urgent) |
| Pet Care | $25-30/visit | $50-75/overnight |
| Tech Help | $45-55/hr | $75-100/hr (advanced) |
| Painting | $40-50/hr | $60-80/hr (detail work) |
| Yard Work | $35-45/hr | $55-70/hr (landscaping) |
| Event Help | $25-35/hr | $50-65/hr (coordination) |

### COMPANY INFORMATION:
- **Company Name**: SaskTask
- **Founded**: 2024
- **Headquarters**: Saskatchewan, Canada
- **Mission**: Connecting Saskatchewanians with trusted local help for everyday tasks
- **Service Area**: All of Saskatchewan - Regina, Saskatoon, Prince Albert, Moose Jaw, Swift Current, and more
- **Business Model**: Platform fee of 12-15% on completed tasks
- **Support**: help@sasktask.com, in-app messaging, AI assistant (you!)

### PLATFORM FEATURES:
- **Secure Deposit System**: 25% deposit protects both parties, refundable under cancellation policy
- **Verified Taskers**: ID verification, background checks, skills verification
- **Real-time Messaging**: Direct communication with read receipts
- **Review System**: 5-star ratings with detailed feedback categories
- **Safe Payments**: Stripe-powered escrow system
- **Task Insurance**: Optional coverage for damages up to $1,000
- **Mobile App**: PWA available for iOS and Android
- **AI Matching**: Smart task recommendations based on skills and location

### VERIFICATION PROCESS:
1. **Basic Verification** (Required):
   - Email confirmation
   - Phone verification
   - Terms acceptance
   
2. **ID Verification** (Recommended):
   - Government-issued ID upload
   - Selfie verification
   - Address confirmation
   
3. **Background Check** (Premium):
   - Criminal record check
   - Reference verification
   - Takes 2-3 business days
   
4. **Skills Verification** (Optional):
   - Certifications upload
   - Portfolio showcase
   - Client testimonials

### SAFETY & TRUST:
- All payments held in escrow until task completion
- 24/7 support for emergencies
- In-app reporting system
- User blocking and reporting
- ID verification badges
- Fraud detection system
- Two-factor authentication available

### PAYMENT & FEES:
- **Platform Fee**: 12-15% (deducted from tasker earnings)
- **Deposit**: 25% of task value (refundable)
- **Payment Methods**: Credit/debit cards, bank transfer
- **Payout Schedule**: 2-3 business days after task completion
- **Cancellation Policy**: 
  - 24+ hours before: Full refund
  - 12-24 hours: 50% refund
  - <12 hours: No refund (except emergencies)

### GETTING STARTED:
**For Task Posters:**
1. Create account and verify email
2. Complete profile with photo
3. Post your first task with clear description
4. Review bids from taskers
5. Select tasker and pay deposit
6. Communicate through messaging
7. Mark task complete and release payment
8. Leave a review

**For Taskers:**
1. Create account and verify email
2. Complete full profile with skills
3. Upload ID for verification
4. Set your availability and rates
5. Browse and bid on tasks
6. Communicate with task posters
7. Complete tasks professionally
8. Collect payment and reviews

### COMMON QUESTIONS:
- **How do I get more tasks?** Complete profile, get verified, respond quickly, collect reviews
- **What if there's a dispute?** Contact support, use dispute resolution center
- **Are there hidden fees?** No, all fees shown upfront before booking
- **Can I cancel?** Yes, see cancellation policy for refund details
- **Is my data safe?** Yes, we use bank-level encryption

## PROACTIVE SUGGESTIONS:
When users ask general questions, also include relevant suggestions from their profile data:
- If profile incomplete: Suggest completing specific missing items
- If no reviews: Suggest strategies to get first reviews
- If not verified: Explain benefits of verification
- If no avatar: Emphasize importance of profile photo
- If no skills: Recommend adding relevant skills

## RESPONSE FORMAT:
1. Greet naturally (use name if known)
2. Answer the question directly and completely
3. Add personalized tips based on their profile
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

function generateProfileSuggestions(context: {
  profileCompletion: number;
  rating: number;
  totalReviews: number;
  skills: string[];
  bio: string;
  hasAvatar: boolean;
  verificationStatus: string;
  completedTasksCount: number;
  isTasker: boolean;
}): string {
  const suggestions: string[] = [];
  
  // Profile photo
  if (!context.hasAvatar) {
    suggestions.push("🖼️ **Add a profile photo** - Profiles with photos get 50% more engagement. A clear, friendly headshot builds trust instantly.");
  }
  
  // Bio
  if (!context.bio) {
    suggestions.push("📝 **Write a compelling bio** - Tell your story! Include your experience, what you're great at, and why clients/taskers should work with you.");
  }
  
  // Skills (for taskers)
  if (context.isTasker && context.skills.length === 0) {
    suggestions.push("🛠️ **Add your skills** - List 5-10 skills you're confident in. This helps you appear in relevant task searches.");
  } else if (context.isTasker && context.skills.length < 5) {
    suggestions.push("🛠️ **Add more skills** - You only have ${context.skills.length} skills listed. Adding more increases your visibility.");
  }
  
  // Verification
  if (context.verificationStatus !== 'verified') {
    suggestions.push("✅ **Complete verification** - Verified users earn 3x more and get priority in search results. Upload your ID and complete background check.");
  }
  
  // Reviews
  if (context.totalReviews === 0) {
    suggestions.push("⭐ **Get your first review** - Reviews are crucial! Consider offering a small discount on your first few tasks to build your reputation.");
  } else if (context.totalReviews < 5) {
    suggestions.push("⭐ **Build more reviews** - You have ${context.totalReviews} reviews. Aim for 10+ to significantly boost your credibility.");
  }
  
  // Rating improvement
  if (context.rating > 0 && context.rating < 4.5) {
    suggestions.push("📈 **Improve your rating** - Your ${context.rating.toFixed(1)} rating could be higher. Focus on communication, timeliness, and exceeding expectations.");
  }
  
  // Profile completion
  if (context.profileCompletion < 80) {
    suggestions.push(`📊 **Complete your profile (${context.profileCompletion}%)** - Finish setting up your profile to unlock all platform features and get better matches.`);
  }
  
  // Task completion for taskers
  if (context.isTasker && context.completedTasksCount === 0) {
    suggestions.push("🎯 **Complete your first task** - Taking that first step is important! Browse available tasks and send personalized bids.");
  }
  
  if (suggestions.length === 0) {
    return "✨ **Great job!** Your profile is looking solid. Keep maintaining your excellent reputation and consider expanding your service offerings.";
  }
  
  return suggestions.join('\n\n');
}
