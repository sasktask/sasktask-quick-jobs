import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
}

interface RecommendationsResponse {
  recommendations: TaskRecommendation[];
  insight?: string;
  userStats?: {
    completedTasks: number;
    topCategories: string[];
    avgRating: number | null;
  };
  error?: string;
  message?: string;
}

export function useTaskRecommendations(userId: string | undefined) {
  return useQuery<RecommendationsResponse>({
    queryKey: ['task-recommendations', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const { data, error } = await supabase.functions.invoke('ai-task-recommendations', {
        body: { userId }
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
