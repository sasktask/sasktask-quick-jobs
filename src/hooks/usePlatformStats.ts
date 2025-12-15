import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PlatformStats {
  totalUsers: number;
  totalTasksCompleted: number;
  totalTasksPostedToday: number;
  totalActiveTaskers: number;
  averageRating: number;
  isLoading: boolean;
}

export const usePlatformStats = (): PlatformStats => {
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalTasksCompleted: 0,
    totalTasksPostedToday: 0,
    totalActiveTaskers: 0,
    averageRating: 0,
    isLoading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total users count
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Fetch completed tasks count
        const { count: completedTasksCount } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("status", "completed");

        // Fetch tasks posted today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: tasksToday } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today.toISOString());

        // Fetch active taskers (users with completed_tasks > 0)
        const { count: activeTaskers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gt("completed_tasks", 0);

        // Fetch average rating
        const { data: avgRatingData } = await supabase
          .from("profiles")
          .select("rating")
          .not("rating", "is", null)
          .gt("rating", 0);

        const avgRating = avgRatingData?.length 
          ? avgRatingData.reduce((acc, p) => acc + (p.rating || 0), 0) / avgRatingData.length 
          : 0;

        setStats({
          totalUsers: usersCount || 0,
          totalTasksCompleted: completedTasksCount || 0,
          totalTasksPostedToday: tasksToday || 0,
          totalActiveTaskers: activeTaskers || 0,
          averageRating: avgRating > 0 ? Math.round(avgRating * 10) / 10 : 0,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching platform stats:", error);
        // Set real values - 0 if no data
        setStats({
          totalUsers: 0,
          totalTasksCompleted: 0,
          totalTasksPostedToday: 0,
          totalActiveTaskers: 0,
          averageRating: 0,
          isLoading: false,
        });
      }
    };

    fetchStats();
  }, []);

  return stats;
};
