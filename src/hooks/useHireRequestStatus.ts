import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuthContext";
import { useToast } from "./use-toast";

interface HireRequestStatus {
  id: string;
  tasker_decision: string;
  decline_reason: string | null;
  decided_at: string | null;
  hire_amount: number;
  task: {
    title: string;
  };
  task_doer: {
    full_name: string;
    avatar_url: string;
  };
}

export const useHireRequestStatus = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingRequests, setPendingRequests] = useState<HireRequestStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingRequests = async () => {
    if (!user) return;

    try {
      // Get bookings where current user is the task giver
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('task_giver_id', user.id);

      if (!tasks || tasks.length === 0) {
        setPendingRequests([]);
        setIsLoading(false);
        return;
      }

      const taskIds = tasks.map(t => t.id);

      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          id,
          tasker_decision,
          decline_reason,
          decided_at,
          hire_amount,
          task_doer_id,
          tasks!inner (
            id,
            title
          )
        `)
        .in('task_id', taskIds)
        .not('hire_amount', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich with task doer profiles
      const enrichedBookings = await Promise.all(
        (bookings || []).map(async (booking: any) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', booking.task_doer_id)
            .single();

          return {
            id: booking.id,
            tasker_decision: booking.tasker_decision,
            decline_reason: booking.decline_reason,
            decided_at: booking.decided_at,
            hire_amount: booking.hire_amount,
            task: {
              title: booking.tasks.title
            },
            task_doer: profile || { full_name: 'Unknown', avatar_url: '' }
          };
        })
      );

      setPendingRequests(enrichedBookings);
    } catch (error) {
      console.error("Error fetching hire request status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();

    // Subscribe to realtime updates for bookings where user's tasks are involved
    const channel = supabase
      .channel('hire-request-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings'
        },
        async (payload) => {
          const booking = payload.new as any;
          
          // Check if this booking is for one of user's tasks
          const { data: task } = await supabase
            .from('tasks')
            .select('task_giver_id, title')
            .eq('id', booking.task_id)
            .single();

          if (task?.task_giver_id === user?.id) {
            // Get task doer name
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', booking.task_doer_id)
              .single();

            const taskerName = profile?.full_name || 'A tasker';

            if (booking.tasker_decision === 'accepted') {
              toast({
                title: "🎉 Hire Request Accepted!",
                description: `${taskerName} accepted your request for "${task.title}". $${booking.hire_amount?.toFixed(2)} is secured!`,
              });
            } else if (booking.tasker_decision === 'declined') {
              toast({
                title: "❌ Hire Request Declined",
                description: `${taskerName} declined your request. Reason: ${booking.decline_reason || 'Not specified'}. Your payment has been refunded.`,
                variant: "destructive",
              });
            }

            fetchPendingRequests();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    pendingRequests,
    isLoading,
    refresh: fetchPendingRequests
  };
};
