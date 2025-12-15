import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface TaskRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  pay_amount: number;
  location: string;
  scheduled_date: string | null;
  estimated_duration: number | null;
  priority: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  task_giver_id: string;
  profiles: {
    full_name: string | null;
    rating: number | null;
  } | null;
  matchScore: number;
  reasons: string[];
  distance: number | null;
  tags: string[];
}

interface WeatherData {
  condition: string;
  temperature: number;
  description: string;
  icon: string;
  tip: string | null;
}

interface RecommendationsResponse {
  recommendations: TaskRecommendation[];
  nearbyTasks: TaskRecommendation[];
  weatherBased: TaskRecommendation[];
  insight?: string;
  weather?: WeatherData;
  season?: string;
  userStats?: {
    completedTasks: number;
    topCategories: string[];
    avgRating: number | null;
  };
  error?: string;
  message?: string;
}

export function useTaskRecommendations(userId: string | undefined) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error.message);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
      );
    }
  }, []);

  return useQuery<RecommendationsResponse>({
    queryKey: ['task-recommendations', userId, userLocation?.lat, userLocation?.lng],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const { data, error } = await supabase.functions.invoke('ai-task-recommendations', {
        body: { 
          userId,
          userLatitude: userLocation?.lat,
          userLongitude: userLocation?.lng,
          maxDistance: 50
        }
      });

      if (error) {
        console.error('Error fetching recommendations:', error);
        throw error;
      }

      return data as RecommendationsResponse;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
