import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RealtimeNotificationsOptions {
  userId: string | null;
  onNewTask?: (task: any) => void;
  onNewMessage?: (message: any) => void;
  onBookingUpdate?: (booking: any) => void;
  onNewBid?: (bid: any) => void;
}

export function useRealtimeNotifications({
  userId,
  onNewTask,
  onNewMessage,
  onBookingUpdate,
  onNewBid
}: RealtimeNotificationsOptions) {
  const { toast } = useToast();

  const showNotification = useCallback((title: string, message: string, link?: string) => {
    toast({
      title,
      description: message,
    });

    // Also show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
  }, [toast]);

  useEffect(() => {
    if (!userId) return;

    const channels: ReturnType<typeof supabase.channel>[] = [];

    // Listen for new tasks in user's preferred categories
    const taskChannel = supabase
      .channel('new-tasks')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tasks',
        },
        (payload) => {
          const task = payload.new;
          showNotification('New Task Available', `${task.title} - $${task.pay_amount}`);
          onNewTask?.(task);
        }
      )
      .subscribe();
    channels.push(taskChannel);

    // Listen for new messages
    const messageChannel = supabase
      .channel('new-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          const message = payload.new;
          showNotification('New Message', message.message?.substring(0, 50) + '...');
          onNewMessage?.(message);
        }
      )
      .subscribe();
    channels.push(messageChannel);

    // Listen for booking updates
    const bookingChannel = supabase
      .channel('booking-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `task_doer_id=eq.${userId}`,
        },
        (payload) => {
          const booking = payload.new;
          const statusMessages: Record<string, string> = {
            accepted: 'Your booking has been accepted!',
            rejected: 'Your booking was declined.',
            completed: 'Task has been marked as completed!',
            in_progress: 'Task is now in progress.',
          };
          const message = statusMessages[booking.status as string] || `Booking status: ${booking.status}`;
          showNotification('Booking Update', message);
          onBookingUpdate?.(booking);
        }
      )
      .subscribe();
    channels.push(bookingChannel);

    // Listen for new bids on user's tasks
    const bidChannel = supabase
      .channel('new-bids')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'task_bids',
        },
        async (payload) => {
          const bid = payload.new;
          // Check if the task belongs to this user
          const { data: task } = await supabase
            .from('tasks')
            .select('task_giver_id, title')
            .eq('id', bid.task_id)
            .single();

          if (task?.task_giver_id === userId) {
            showNotification('New Bid Received', `New bid of $${bid.bid_amount} on "${task.title}"`);
            onNewBid?.(bid);
          }
        }
      )
      .subscribe();
    channels.push(bidChannel);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [userId, onNewTask, onNewMessage, onBookingUpdate, onNewBid, showNotification]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
}