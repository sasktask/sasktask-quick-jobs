import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

// Major holidays observed (varies by region)
const holidays = [
  { name: "New Year's Day", date: "January 1", region: "Global" },
  { name: "Family Day / Presidents Day", date: "Third Monday of February", region: "Canada/US" },
  { name: "Good Friday", date: "Varies (March/April)", region: "Global" },
  { name: "Easter Monday", date: "Varies (March/April)", region: "Many countries" },
  { name: "Victoria Day / Memorial Day", date: "Late May", region: "Canada/US" },
  { name: "Canada Day / Independence Day", date: "July 1-4", region: "Canada/US" },
  { name: "Civic Holiday", date: "First Monday of August", region: "Canada" },
  { name: "Labour Day", date: "First Monday of September", region: "North America" },
  { name: "Thanksgiving", date: "October (Canada) / November (US)", region: "North America" },
  { name: "Remembrance Day / Veterans Day", date: "November 11", region: "Canada/US/UK" },
  { name: "Christmas Day", date: "December 25", region: "Global" },
  { name: "Boxing Day", date: "December 26", region: "Canada/UK/Australia" },
  { name: "Diwali", date: "Varies (October/November)", region: "India & worldwide" },
  { name: "Eid al-Fitr", date: "Varies", region: "Muslim countries & worldwide" },
  { name: "Chinese New Year", date: "Varies (January/February)", region: "China & worldwide" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext, isAuthenticated } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-aware system prompt
    let systemPrompt = `You are a helpful, friendly AI assistant for SaskTask - a global task marketplace platform connecting people who need help with skilled taskers worldwide. 
Your role is to help users understand the platform and answer their questions.

## Key Information About SaskTask:

### Platform Coverage:
- SaskTask operates globally - available in Canada, United States, United Kingdom, Australia, India, and expanding to more countries
- Taskers and clients can connect from anywhere in the world
- Local services require taskers in the same area
- Remote/virtual services can be done from anywhere

### Major Holidays (Tasker availability may vary):
${holidays.map(h => `- ${h.name}: ${h.date} (${h.region})`).join("\n")}
Note: Holiday availability depends on individual taskers and their location. Premium rates may apply during holidays.

### Availability:
- SaskTask operates 24/7 online globally
- Task availability depends on individual taskers and their timezone
- Most taskers work during their local business hours
- Some taskers offer evening and weekend availability
- Urgent tasks can often find available taskers with premium pricing
- Remote/virtual tasks can be completed across timezones

### Services Available:
- Home Services: Cleaning, repairs, handyman, plumbing, electrical, painting
- Moving & Delivery: Furniture moving, package delivery, truck assistance
- Outdoor: Lawn care, snow removal, gardening, landscaping
- Personal: Errands, shopping, pet care, tutoring
- Tech: Computer help, smart home setup, phone repair, IT support
- Events: Party help, photography, catering assistance
- Business: Admin support, data entry, marketing help, virtual assistance
- Remote Services: Online tutoring, design, writing, programming, consulting
- And 100+ more service categories

### How It Works:
1. Post a Task: Describe what you need done
2. Get Offers: Receive bids from qualified taskers
3. Choose & Book: Select the best tasker for your needs
4. Pay Securely: Payment is held in escrow until task completion
5. Rate & Review: Share your experience

### Payment & Security:
- All payments processed through secure Stripe integration
- Multiple currencies supported
- 15% platform fee on completed tasks
- Escrow protection for both parties
- Refund policy for cancelled or incomplete tasks
- Identity verification available for taskers

### Privacy & Safety:
- All personal data is encrypted
- GDPR compliant for European users
- Contact info shared only after booking
- Background check options for taskers
- In-app messaging keeps conversations secure
- Report system for issues`;

    // Add user-specific context if authenticated
    if (isAuthenticated && userContext) {
      const { profile, recentTasks, recentBookings } = userContext;
      
      systemPrompt += `

## User's Account Information:
- Name: ${profile?.full_name || "Not set"}
- Email: ${userContext.email || "Not available"}
- Profile Completion: ${profile?.profile_completion || 0}%
- Member Since: ${profile?.joined_date ? new Date(profile.joined_date).toLocaleDateString() : "Recently joined"}
- Wallet Balance: $${profile?.wallet_balance?.toFixed(2) || "0.00"}
- Rating: ${profile?.rating ? `${profile.rating}/5 stars` : "No ratings yet"}
- Completed Tasks: ${profile?.completed_tasks || 0}
- Trust Score: ${profile?.trust_score || 0}/100
- Verification Level: ${profile?.verification_level || "Unverified"}
- Skills: ${profile?.skills?.join(", ") || "None listed"}
- Location: ${profile?.city || "Not set"}${profile?.country ? `, ${profile.country}` : ""}

## User's Recent Tasks:
${recentTasks?.length > 0 
  ? recentTasks.map((t: any) => `- ${t.title} (${t.status}) - $${t.pay_amount} - ${t.category}`).join("\n")
  : "No recent tasks"}

## User's Recent Bookings:
${recentBookings?.length > 0 
  ? recentBookings.map((b: any) => `- ${b.tasks?.title || "Task"} - Status: ${b.status}`).join("\n")
  : "No recent bookings"}

When the user asks about their account, tasks, or personal information, use this context to provide accurate, personalized responses.`;
    }

    systemPrompt += `

## Response Guidelines:
- Be friendly, helpful, and concise
- Use emojis sparingly to keep responses warm 😊
- For account-specific questions, reference their actual data
- If you don't have information, suggest they check their dashboard or contact support
- Always prioritize user privacy - don't reveal sensitive info unnecessarily
- Recommend relevant services based on their query
- If asked about becoming a tasker, explain the benefits and process`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Help chatbot error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
