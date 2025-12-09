import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, subDays } from "date-fns";

export interface PopularService {
  category: string;
  count: number;
  change: number; // percentage change from previous week
  avgBudget: number;
  recentTasks: number;
}

export function usePopularServices() {
  return useQuery({
    queryKey: ["popular-services"],
    queryFn: async (): Promise<PopularService[]> => {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
      const lastWeekStart = subDays(weekStart, 7);
      const twoWeeksAgo = subDays(weekStart, 14);

      // Get this week's bookings with task info
      const { data: thisWeekBookings, error: thisWeekError } = await supabase
        .from("bookings")
        .select(`
          id,
          created_at,
          tasks!inner (
            category,
            pay_amount
          )
        `)
        .gte("created_at", weekStart.toISOString())
        .order("created_at", { ascending: false });

      if (thisWeekError) {
        console.error("Error fetching this week bookings:", thisWeekError);
      }

      // Get last week's bookings for comparison
      const { data: lastWeekBookings, error: lastWeekError } = await supabase
        .from("bookings")
        .select(`
          id,
          tasks!inner (
            category
          )
        `)
        .gte("created_at", lastWeekStart.toISOString())
        .lt("created_at", weekStart.toISOString());

      if (lastWeekError) {
        console.error("Error fetching last week bookings:", lastWeekError);
      }

      // Get recent open tasks for each category
      const { data: recentTasks, error: tasksError } = await supabase
        .from("tasks")
        .select("category, pay_amount")
        .eq("status", "open")
        .gte("created_at", subDays(now, 7).toISOString());

      if (tasksError) {
        console.error("Error fetching recent tasks:", tasksError);
      }

      // Aggregate this week's data by category
      const thisWeekByCategory: Record<string, { count: number; totalBudget: number }> = {};
      (thisWeekBookings || []).forEach((booking: any) => {
        const category = booking.tasks?.category;
        if (category) {
          if (!thisWeekByCategory[category]) {
            thisWeekByCategory[category] = { count: 0, totalBudget: 0 };
          }
          thisWeekByCategory[category].count++;
          thisWeekByCategory[category].totalBudget += booking.tasks?.pay_amount || 0;
        }
      });

      // Aggregate last week's data by category
      const lastWeekByCategory: Record<string, number> = {};
      (lastWeekBookings || []).forEach((booking: any) => {
        const category = booking.tasks?.category;
        if (category) {
          lastWeekByCategory[category] = (lastWeekByCategory[category] || 0) + 1;
        }
      });

      // Count recent open tasks by category
      const recentTasksByCategory: Record<string, number> = {};
      (recentTasks || []).forEach((task: any) => {
        if (task.category) {
          recentTasksByCategory[task.category] = (recentTasksByCategory[task.category] || 0) + 1;
        }
      });

      // Build popular services array
      const popularServices: PopularService[] = Object.entries(thisWeekByCategory)
        .map(([category, data]) => {
          const lastWeekCount = lastWeekByCategory[category] || 0;
          const change = lastWeekCount > 0 
            ? Math.round(((data.count - lastWeekCount) / lastWeekCount) * 100)
            : data.count > 0 ? 100 : 0;
          
          return {
            category,
            count: data.count,
            change,
            avgBudget: data.count > 0 ? Math.round(data.totalBudget / data.count) : 0,
            recentTasks: recentTasksByCategory[category] || 0,
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // If we don't have enough booking data, supplement with task data
      if (popularServices.length < 4) {
        const taskCategories = Object.entries(recentTasksByCategory)
          .filter(([cat]) => !popularServices.some(s => s.category === cat))
          .map(([category, count]) => ({
            category,
            count: 0,
            change: 0,
            avgBudget: 0,
            recentTasks: count,
          }))
          .sort((a, b) => b.recentTasks - a.recentTasks)
          .slice(0, 8 - popularServices.length);

        popularServices.push(...taskCategories);
      }

      return popularServices;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}