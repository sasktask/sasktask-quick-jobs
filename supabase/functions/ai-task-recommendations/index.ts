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
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch user profile including reputation_score
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*, reputation_score, trust_score')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    // Get user's badge count for reputation calculation
    const { count: badgeCount } = await supabase
      .from('badges')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Fetch user's completed bookings with task details
    const { data: completedBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        task_id,
        status,
        tasks:task_id (
          id,
          title,
          category,
          pay_amount,
          estimated_duration,
          location
        )
      `)
      .eq('task_doer_id', userId)
      .eq('status', 'completed')
      .limit(20);

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
    }

    // Fetch reviews the user has received
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating, quality_rating, communication_rating, timeliness_rating')
      .eq('reviewee_id', userId)
      .limit(20);

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
    }

    // Fetch available open tasks
    const { data: openTasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        category,
        pay_amount,
        location,
        scheduled_date,
        estimated_duration,
        priority,
        latitude,
        longitude,
        created_at,
        task_giver_id,
        profiles:task_giver_id (
          full_name,
          rating
        )
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(50);

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tasks' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!openTasks || openTasks.length === 0) {
      return new Response(
        JSON.stringify({ recommendations: [], message: 'No open tasks available' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyze user's task history - extract tasks from bookings
    const bookingsArray = completedBookings || [];
    const taskHistory: Array<{category: string; pay_amount: number; estimated_duration: number | null}> = [];
    
    for (const booking of bookingsArray as any[]) {
      const task = booking.tasks;
      if (task && !Array.isArray(task)) {
        taskHistory.push({
          category: task.category,
          pay_amount: task.pay_amount,
          estimated_duration: task.estimated_duration
        });
      }
    }
    
    const categoryHistory = taskHistory.map(t => t.category);
    const avgPay = taskHistory.length > 0 
      ? taskHistory.reduce((sum, t) => sum + (t.pay_amount || 0), 0) / taskHistory.length 
      : 0;
    const avgDuration = taskHistory.length > 0
      ? taskHistory.reduce((sum, t) => sum + (t.estimated_duration || 2), 0) / taskHistory.length
      : 2;

    // Calculate category frequency
    const categoryFrequency: Record<string, number> = {};
    categoryHistory.forEach(cat => {
      categoryFrequency[cat] = (categoryFrequency[cat] || 0) + 1;
    });

    // User preferences from profile
    const userSkills: string[] = profile?.skills || [];
    const preferredCategories: string[] = profile?.preferred_categories || [];
    const userLocation = { lat: profile?.latitude, lng: profile?.longitude };

    // Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // Score each task
    const scoredTasks = openTasks.map((task: any) => {
      let score = 0;
      const reasons: string[] = [];

      // Category match (30 points max)
      const categoryCount = categoryFrequency[task.category] || 0;
      if (categoryCount > 0) {
        const categoryScore = Math.min(30, categoryCount * 10);
        score += categoryScore;
        reasons.push(`You've completed ${categoryCount} ${task.category} task(s)`);
      } else if (preferredCategories.includes(task.category)) {
        score += 20;
        reasons.push(`Matches your preferred category: ${task.category}`);
      }

      // Pay alignment (20 points max)
      if (avgPay > 0) {
        const payDiff = Math.abs(task.pay_amount - avgPay) / avgPay;
        if (payDiff < 0.2) {
          score += 20;
          reasons.push('Pay matches your usual range');
        } else if (payDiff < 0.5) {
          score += 10;
        }
      }

      // Duration fit (15 points max)
      const taskDuration = task.estimated_duration || 2;
      if (avgDuration > 0) {
        const durationDiff = Math.abs(taskDuration - avgDuration) / avgDuration;
        if (durationDiff < 0.3) {
          score += 15;
          reasons.push('Duration fits your schedule');
        } else if (durationDiff < 0.6) {
          score += 8;
        }
      }

      // Location proximity (15 points max)
      if (userLocation.lat && userLocation.lng && task.latitude && task.longitude) {
        const distance = calculateDistance(userLocation.lat, userLocation.lng, task.latitude, task.longitude);
        if (distance < 10) {
          score += 15;
          reasons.push(`Only ${distance.toFixed(1)}km away`);
        } else if (distance < 25) {
          score += 10;
          reasons.push(`${distance.toFixed(1)}km from you`);
        } else if (distance < 50) {
          score += 5;
        }
      }

      // Skill match (10 points max)
      const taskKeywords = `${task.title} ${task.description}`.toLowerCase();
      const matchingSkills = userSkills.filter((skill: string) => 
        taskKeywords.includes(skill.toLowerCase())
      );
      if (matchingSkills.length > 0) {
        score += Math.min(10, matchingSkills.length * 5);
        reasons.push(`Matches your skills: ${matchingSkills.join(', ')}`);
      }

      // Priority bonus (5 points)
      if (task.priority === 'high' || task.priority === 'urgent') {
        score += 5;
        reasons.push('High priority task');
      }

      // Task giver rating (5 points max)
      const posterRating = task.profiles?.rating || 0;
      if (posterRating >= 4.5) {
        score += 5;
        reasons.push('Highly rated task poster');
      } else if (posterRating >= 4.0) {
        score += 3;
      }

      // Reputation bonus - Higher reputation users get more recommendations visibility
      const userReputation = profile?.reputation_score || 0;
      const userTrustScore = profile?.trust_score || 50;
      const userBadges = badgeCount || 0;
      
      // Users with high reputation get bonus points for task matching (up to 15 points)
      if (userReputation >= 80) {
        score += 15;
        reasons.push('Top performer match');
      } else if (userReputation >= 60) {
        score += 10;
        reasons.push('Recommended for verified professionals');
      } else if (userTrustScore >= 70 || userBadges >= 3) {
        score += 5;
        reasons.push('Trusted performer match');
      }

      return {
        ...task,
        matchScore: Math.min(100, score),
        reasons: reasons.length > 0 ? reasons : ['New task in your area'],
        userReputation: userReputation
      };
    });

    // Sort by score and get top 10
    const recommendations = scoredTasks
      .sort((a: any, b: any) => b.matchScore - a.matchScore)
      .slice(0, 10);

    // Calculate average rating from reviews
    const reviewsArray = reviews || [];
    const avgRating = reviewsArray.length > 0 
      ? reviewsArray.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsArray.length 
      : null;

    // If we have Lovable AI key and user has history, enhance with AI insights
    if (lovableApiKey && taskHistory.length >= 3 && recommendations.length > 0) {
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
                content: 'You are a task matching assistant. Given user history and recommendations, provide a brief personalized insight (1-2 sentences) about why these tasks are good matches. Be encouraging and specific.'
              },
              {
                role: 'user',
                content: `User completed ${taskHistory.length} tasks, mainly in: ${Object.keys(categoryFrequency).join(', ')}. 
                Average rating received: ${avgRating?.toFixed(1) || 'N/A'}.
                Top recommended task: "${recommendations[0]?.title}" in ${recommendations[0]?.category}.
                Provide a brief personalized insight.`
              }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const insight = aiData.choices?.[0]?.message?.content;
          if (insight) {
            return new Response(
              JSON.stringify({ 
                recommendations, 
                insight,
                userStats: {
                  completedTasks: taskHistory.length,
                  topCategories: Object.keys(categoryFrequency).slice(0, 3),
                  avgRating
                }
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      } catch (aiError) {
        console.error('AI enhancement error:', aiError);
      }
    }

    return new Response(
      JSON.stringify({ 
        recommendations,
        userStats: {
          completedTasks: taskHistory.length,
          topCategories: Object.keys(categoryFrequency).slice(0, 3),
          avgRating
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-task-recommendations:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
