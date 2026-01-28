import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Weather-appropriate task categories
const WEATHER_TASK_MAPPING: Record<string, { ideal: string[]; avoid: string[] }> = {
  clear: {
    ideal: ['Yard Work', 'Landscaping', 'Moving', 'Delivery', 'Outdoor Events', 'Photography', 'Pet Care'],
    avoid: []
  },
  clouds: {
    ideal: ['Yard Work', 'Landscaping', 'Moving', 'Delivery', 'Outdoor Events', 'Photography'],
    avoid: []
  },
  rain: {
    ideal: ['Cleaning', 'Handyman', 'Assembly', 'Painting', 'Organization', 'Tech Support', 'Tutoring'],
    avoid: ['Yard Work', 'Landscaping', 'Outdoor Events', 'Photography']
  },
  snow: {
    ideal: ['Snow Removal', 'Cleaning', 'Handyman', 'Assembly', 'Tech Support', 'Tutoring'],
    avoid: ['Yard Work', 'Landscaping', 'Moving', 'Outdoor Events', 'Photography']
  },
  thunderstorm: {
    ideal: ['Cleaning', 'Assembly', 'Organization', 'Tech Support', 'Tutoring', 'Cooking'],
    avoid: ['Yard Work', 'Landscaping', 'Moving', 'Outdoor Events', 'Delivery', 'Pet Care']
  },
  drizzle: {
    ideal: ['Cleaning', 'Handyman', 'Assembly', 'Moving', 'Tech Support'],
    avoid: ['Outdoor Events', 'Photography']
  },
  mist: {
    ideal: ['Cleaning', 'Handyman', 'Assembly', 'Moving', 'Delivery'],
    avoid: ['Photography', 'Outdoor Events']
  }
};

// Seasonal task recommendations
const SEASONAL_TASKS: Record<string, string[]> = {
  winter: ['Snow Removal', 'Holiday Decorations', 'Indoor Cleaning', 'Organizing', 'Tech Support'],
  spring: ['Spring Cleaning', 'Yard Work', 'Landscaping', 'Moving', 'Painting', 'Gardening'],
  summer: ['Yard Work', 'Landscaping', 'Moving', 'Outdoor Events', 'Pet Care', 'Photography'],
  fall: ['Yard Work', 'Leaf Removal', 'Gutter Cleaning', 'Winterization', 'Moving']
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userLatitude, userLongitude, maxDistance = 50 } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const openWeatherApiKey = Deno.env.get('OPENWEATHER_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch user profile and match preferences in parallel
    const [profileResult, matchPrefsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('*, reputation_score, trust_score')
        .eq('id', userId)
        .maybeSingle(),
      supabase
        .from('user_match_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
    ]);

    const profile = profileResult.data;
    const matchPreferences = matchPrefsResult.data;

    if (profileResult.error) {
      console.error('Error fetching profile:', profileResult.error);
    }

    // Determine user location (from request or profile)
    const userLat = userLatitude || profile?.latitude;
    const userLng = userLongitude || profile?.longitude;
    const userCity = profile?.city || 'Saskatoon';

    // Fetch weather data if we have location
    let weatherData: any = null;
    let weatherCondition = 'clear';
    let temperature = 20;
    
    if (openWeatherApiKey && (userLat || userCity)) {
      try {
        const weatherUrl = userLat 
          ? `https://api.openweathermap.org/data/2.5/weather?lat=${userLat}&lon=${userLng}&units=metric&appid=${openWeatherApiKey}`
          : `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(userCity)},CA&units=metric&appid=${openWeatherApiKey}`;
        
        const weatherResponse = await fetch(weatherUrl);
        if (weatherResponse.ok) {
          weatherData = await weatherResponse.json();
          weatherCondition = weatherData.weather?.[0]?.main?.toLowerCase() || 'clear';
          temperature = weatherData.main?.temp || 20;
          console.log('Weather data fetched:', weatherCondition, temperature);
        }
      } catch (weatherError) {
        console.error('Weather fetch error:', weatherError);
      }
    }

    // Determine current season
    const month = new Date().getMonth();
    let season: string;
    if (month >= 2 && month <= 4) season = 'spring';
    else if (month >= 5 && month <= 7) season = 'summer';
    else if (month >= 8 && month <= 10) season = 'fall';
    else season = 'winter';

    // Get weather-appropriate tasks
    const weatherMapping = WEATHER_TASK_MAPPING[weatherCondition] || WEATHER_TASK_MAPPING.clear;
    const seasonalTasks = SEASONAL_TASKS[season] || [];

    // Get user's badge count
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
      .limit(100);

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tasks' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!openTasks || openTasks.length === 0) {
      return new Response(
        JSON.stringify({ 
          recommendations: [], 
          nearbyTasks: [],
          weatherBased: [],
          message: 'No open tasks available' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyze user's task history
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

    // User preferences from profile AND match preferences table
    const userSkills: string[] = profile?.skills || [];
    const preferredCategories: string[] = [
      ...(profile?.preferred_categories || []),
      ...(matchPreferences?.preferred_categories || [])
    ].filter((v, i, a) => a.indexOf(v) === i); // Dedupe
    
    // Additional matching preferences
    const skillKeywords: string[] = matchPreferences?.skill_keywords || [];
    const preferredTaskTypes: string[] = matchPreferences?.preferred_task_types || [];
    const preferredPriceMin = matchPreferences?.preferred_price_min;
    const preferredPriceMax = matchPreferences?.preferred_price_max;
    const preferredDistanceKm = matchPreferences?.preferred_distance_km || maxDistance;

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
      const tags: string[] = [];

      // Calculate distance
      const distance = userLat && userLng && task.latitude && task.longitude
        ? calculateDistance(userLat, userLng, task.latitude, task.longitude)
        : Infinity;

      // Weather appropriateness (20 points max)
      if (weatherMapping.ideal.some(cat => task.category?.toLowerCase().includes(cat.toLowerCase()))) {
        score += 20;
        reasons.push(`Perfect for ${weatherCondition} weather`);
        tags.push('weather-ideal');
      } else if (weatherMapping.avoid.some(cat => task.category?.toLowerCase().includes(cat.toLowerCase()))) {
        score -= 15;
        reasons.push(`Consider indoor alternative for ${weatherCondition} weather`);
        tags.push('weather-avoid');
      }

      // Seasonal bonus (10 points max)
      if (seasonalTasks.some(cat => task.category?.toLowerCase().includes(cat.toLowerCase()))) {
        score += 10;
        reasons.push(`Popular during ${season}`);
        tags.push('seasonal');
      }

      // Category match based on EXPERTISE & HISTORY (40 points max) - HIGHEST PRIORITY
      const categoryCount = categoryFrequency[task.category] || 0;
      const isPreferredCategory = preferredCategories.includes(task.category);
      
      if (categoryCount > 0 && isPreferredCategory) {
        // Both completed before AND in preferred = highest score
        const categoryScore = Math.min(40, 25 + categoryCount * 5);
        score += categoryScore;
        reasons.push(`Expert in ${task.category} (${categoryCount} completed)`);
        tags.push('expertise');
      } else if (categoryCount > 0) {
        // Has experience in this category
        const categoryScore = Math.min(30, 15 + categoryCount * 5);
        score += categoryScore;
        reasons.push(`You've completed ${categoryCount} ${task.category} task(s)`);
        tags.push('experience');
      } else if (isPreferredCategory) {
        // In their preferred/chosen categories
        score += 25;
        reasons.push(`Matches your expertise: ${task.category}`);
        tags.push('preferred');
      }

      // Skill keywords match from preferences (15 points max)
      const allSkillKeywords = [...userSkills, ...skillKeywords];
      const taskText = `${task.title} ${task.description || ''}`.toLowerCase();
      const matchingKeywords = allSkillKeywords.filter((keyword: string) => 
        taskText.includes(keyword.toLowerCase())
      );
      if (matchingKeywords.length > 0) {
        const skillScore = Math.min(15, matchingKeywords.length * 5);
        score += skillScore;
        reasons.push(`Matches your skills: ${matchingKeywords.slice(0, 3).join(', ')}`);
        tags.push('skill-match');
      }

      // Price range preference (15 points max)
      const taskPay = task.pay_amount || 0;
      if (preferredPriceMin !== null && preferredPriceMax !== null) {
        if (taskPay >= preferredPriceMin && taskPay <= preferredPriceMax) {
          score += 15;
          reasons.push('Within your price preference');
          tags.push('price-fit');
        } else if (taskPay >= preferredPriceMin * 0.8 && taskPay <= preferredPriceMax * 1.2) {
          score += 8;
        }
      } else if (avgPay > 0) {
        // Fallback to historical average
        const payDiff = Math.abs(taskPay - avgPay) / avgPay;
        if (payDiff < 0.2) {
          score += 15;
          reasons.push('Pay matches your usual range');
        } else if (payDiff < 0.5) {
          score += 8;
        }
      }

      // Duration fit (10 points max)
      const taskDuration = task.estimated_duration || 2;
      if (avgDuration > 0) {
        const durationDiff = Math.abs(taskDuration - avgDuration) / avgDuration;
        if (durationDiff < 0.3) {
          score += 10;
          reasons.push('Duration fits your schedule');
        } else if (durationDiff < 0.6) {
          score += 5;
        }
      }

      // Location proximity (25 points max) - Uses preferred distance
      const effectiveMaxDistance = preferredDistanceKm || maxDistance;
      if (distance !== Infinity) {
        if (distance < 5) {
          score += 25;
          reasons.push(`Only ${distance.toFixed(1)}km away`);
          tags.push('nearby');
        } else if (distance < 10) {
          score += 20;
          reasons.push(`${distance.toFixed(1)}km from you`);
          tags.push('nearby');
        } else if (distance < effectiveMaxDistance * 0.5) {
          score += 12;
          reasons.push(`${distance.toFixed(1)}km away`);
        } else if (distance < effectiveMaxDistance) {
          score += 5;
        } else {
          score -= 15; // Stronger penalty for tasks outside preferred range
        }
      }

      // Priority bonus (5 points)
      if (task.priority === 'high' || task.priority === 'urgent') {
        score += 5;
        reasons.push('High priority task');
        tags.push('urgent');
      }

      // Task giver rating (5 points max)
      const posterRating = task.profiles?.rating || 0;
      if (posterRating >= 4.5) {
        score += 5;
        reasons.push('Highly rated task poster');
        tags.push('top-rated');
      } else if (posterRating >= 4.0) {
        score += 3;
      }

      // Reputation bonus
      const userReputation = profile?.reputation_score || 0;
      const userTrustScore = profile?.trust_score || 50;
      const userBadges = badgeCount || 0;
      
      if (userReputation >= 80) {
        score += 15;
        reasons.push('Top performer match');
        tags.push('premium');
      } else if (userReputation >= 60) {
        score += 10;
        reasons.push('Recommended for verified professionals');
      } else if (userTrustScore >= 70 || userBadges >= 3) {
        score += 5;
        reasons.push('Trusted performer match');
      }

      // Freshness bonus - newer tasks get slight boost
      const taskAge = Date.now() - new Date(task.created_at).getTime();
      const hoursOld = taskAge / (1000 * 60 * 60);
      if (hoursOld < 24) {
        score += 5;
        tags.push('new');
      }

      return {
        ...task,
        matchScore: Math.max(0, Math.min(100, score)),
        reasons: reasons.length > 0 ? reasons : ['New task in your area'],
        distance: distance !== Infinity ? distance : null,
        tags,
        userReputation
      };
    });

    // Sort by score and categorize
    const sortedTasks = scoredTasks.sort((a: any, b: any) => b.matchScore - a.matchScore);
    
    // Get top recommendations
    const recommendations = sortedTasks.slice(0, 10);
    
    // Get nearby tasks (within maxDistance)
    const nearbyTasks = sortedTasks
      .filter((t: any) => t.distance !== null && t.distance <= maxDistance)
      .sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0))
      .slice(0, 8);

    // Get weather-appropriate tasks
    const weatherBasedTasks = sortedTasks
      .filter((t: any) => t.tags.includes('weather-ideal'))
      .slice(0, 6);

    // Calculate average rating from reviews
    const reviewsArray = reviews || [];
    const avgRating = reviewsArray.length > 0 
      ? reviewsArray.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsArray.length 
      : null;

    // Generate AI insight if available
    let insight = null;
    if (lovableApiKey && (taskHistory.length >= 1 || recommendations.length > 0)) {
      try {
        const weatherInfo = weatherData 
          ? `Current weather: ${weatherCondition}, ${temperature}°C.`
          : '';
        
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
                content: 'You are a helpful task matching assistant. Provide a brief, friendly personalized insight (1-2 sentences max) about task recommendations. Be encouraging and mention weather/season if relevant. Keep it concise and actionable.'
              },
              {
                role: 'user',
                content: `${weatherInfo} Season: ${season}. User completed ${taskHistory.length} tasks in: ${Object.keys(categoryFrequency).join(', ') || 'various categories'}. 
                Rating: ${avgRating?.toFixed(1) || 'N/A'}. ${nearbyTasks.length} tasks nearby.
                Top task: "${recommendations[0]?.title}" (${recommendations[0]?.category}).
                Provide brief personalized insight.`
              }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          insight = aiData.choices?.[0]?.message?.content;
        }
      } catch (aiError) {
        console.error('AI enhancement error:', aiError);
      }
    }

    // Generate weather-based tip
    let weatherTip = null;
    if (weatherData) {
      if (temperature < 0) {
        weatherTip = `It's ${temperature}°C outside. Great day for indoor tasks like cleaning or organizing!`;
      } else if (temperature > 25) {
        weatherTip = `Warm day at ${temperature}°C! Perfect for outdoor tasks - stay hydrated!`;
      } else if (weatherCondition === 'rain' || weatherCondition === 'drizzle') {
        weatherTip = `Rainy weather today. Indoor tasks like handyman work or cleaning are ideal!`;
      } else if (weatherCondition === 'snow') {
        weatherTip = `Snowy conditions! Snow removal tasks are in high demand.`;
      }
    }

    return new Response(
      JSON.stringify({ 
        recommendations,
        nearbyTasks,
        weatherBased: weatherBasedTasks,
        insight,
        weather: weatherData ? {
          condition: weatherCondition,
          temperature,
          description: weatherData.weather?.[0]?.description,
          icon: weatherData.weather?.[0]?.icon,
          tip: weatherTip
        } : null,
        season,
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
