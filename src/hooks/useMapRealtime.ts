import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  description: string;
  location: string;
  pay_amount: number;
  category: string;
  latitude?: number;
  longitude?: number;
  estimated_duration?: number;
  priority?: string;
  status?: string;
}

interface RealtimeUpdate {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  task: Task;
  timestamp: Date;
}

export function useMapRealtime(initialTasks: Task[]) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [recentUpdates, setRecentUpdates] = useState<RealtimeUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Sync with initial tasks when they change
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Clear old updates after 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRecentUpdates((prev) => 
        prev.filter((update) => 
          Date.now() - update.timestamp.getTime() < 10000
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleNewTask = useCallback((payload: any) => {
    const newTask = payload.new as Task;
    
    if (newTask.status === 'open' && newTask.latitude && newTask.longitude) {
      setTasks((prev) => {
        // Avoid duplicates
        if (prev.some((t) => t.id === newTask.id)) return prev;
        return [newTask, ...prev];
      });

      setRecentUpdates((prev) => [
        { type: 'INSERT', task: newTask, timestamp: new Date() },
        ...prev.slice(0, 9),
      ]);

      toast({
        title: 'New task nearby!',
        description: `${newTask.title} - $${newTask.pay_amount}`,
        duration: 5000,
      });
    }
  }, [toast]);

  const handleUpdateTask = useCallback((payload: any) => {
    const updatedTask = payload.new as Task;
    const oldTask = payload.old as Task;

    setTasks((prev) => 
      prev.map((task) => 
        task.id === updatedTask.id ? updatedTask : task
      ).filter((task) => task.status === 'open')
    );

    // If task was just given coordinates, notify
    if (!oldTask.latitude && updatedTask.latitude) {
      setRecentUpdates((prev) => [
        { type: 'UPDATE', task: updatedTask, timestamp: new Date() },
        ...prev.slice(0, 9),
      ]);
    }

    // If task was assigned/completed, it will be filtered out
    if (oldTask.status === 'open' && updatedTask.status !== 'open') {
      toast({
        title: 'Task taken',
        description: `${updatedTask.title} is no longer available`,
        duration: 3000,
      });
    }
  }, [toast]);

  const handleDeleteTask = useCallback((payload: any) => {
    const deletedTask = payload.old as Task;
    
    setTasks((prev) => prev.filter((task) => task.id !== deletedTask.id));
    
    setRecentUpdates((prev) => [
      { type: 'DELETE', task: deletedTask, timestamp: new Date() },
      ...prev.slice(0, 9),
    ]);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('map-tasks-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tasks',
        },
        handleNewTask
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks',
        },
        handleUpdateTask
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'tasks',
        },
        handleDeleteTask
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleNewTask, handleUpdateTask, handleDeleteTask]);

  const getRecentlyAddedIds = useCallback(() => {
    return recentUpdates
      .filter((u) => u.type === 'INSERT' && Date.now() - u.timestamp.getTime() < 5000)
      .map((u) => u.task.id);
  }, [recentUpdates]);

  return {
    tasks,
    recentUpdates,
    isConnected,
    getRecentlyAddedIds,
  };
}
