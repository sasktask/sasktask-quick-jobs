import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  RefreshCw, 
  Star, 
  MessageSquare,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickRebookProps {
  userId: string;
}

interface PreviousTasker {
  id: string;
  full_name: string;
  avatar_url: string | null;
  rating: number;
  completed_tasks: number;
  lastTaskTitle: string;
  lastTaskDate: string;
}

export function QuickRebook({ userId }: QuickRebookProps) {
  const [taskers, setTaskers] = useState<PreviousTasker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreviousTaskers();
  }, [userId]);

  const fetchPreviousTaskers = async () => {
    try {
      // Get completed bookings for this user's tasks
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          id,
          task_doer_id,
          created_at,
          task:tasks!inner(
            title,
            task_giver_id
          )
        `)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(50);

      if (bookingsError) throw bookingsError;

      // Filter to only tasks where this user was the giver
      const userBookings = bookings?.filter(
        b => b.task?.task_giver_id === userId
      ) || [];

      // Get unique taskers
      const taskerMap = new Map<string, { taskTitle: string; taskDate: string }>();
      userBookings.forEach(booking => {
        if (!taskerMap.has(booking.task_doer_id)) {
          taskerMap.set(booking.task_doer_id, {
            taskTitle: booking.task?.title || "Task",
            taskDate: booking.created_at
          });
        }
      });

      if (taskerMap.size === 0) {
        setTaskers([]);
        setLoading(false);
        return;
      }

      // Fetch tasker profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, rating, completed_tasks")
        .in("id", Array.from(taskerMap.keys()));

      if (profilesError) throw profilesError;

      const taskerList: PreviousTasker[] = (profiles || []).map(profile => ({
        id: profile.id,
        full_name: profile.full_name || "Tasker",
        avatar_url: profile.avatar_url,
        rating: profile.rating || 0,
        completed_tasks: profile.completed_tasks || 0,
        lastTaskTitle: taskerMap.get(profile.id)?.taskTitle || "Task",
        lastTaskDate: taskerMap.get(profile.id)?.taskDate || ""
      }));

      setTaskers(taskerList.slice(0, 5));
    } catch (error) {
      console.error("Error fetching previous taskers:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (taskers.length === 0) {
    return null;
  }

  return (
    <Card className="border-border bg-gradient-to-br from-background via-background to-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          Quick Rebook
          <Badge variant="secondary" className="ml-auto text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Recommended
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {taskers.map((tasker, index) => (
          <div
            key={tasker.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-all group",
              index === 0 && "ring-2 ring-primary/20 bg-primary/5"
            )}
          >
            <Avatar className="h-12 w-12 border-2 border-background shadow">
              <AvatarImage src={tasker.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10">
                {tasker.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm truncate">{tasker.full_name}</p>
                {index === 0 && (
                  <Badge variant="default" className="text-[10px] h-4 px-1.5">
                    Top Pick
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  {tasker.rating.toFixed(1)}
                </span>
                <span>{tasker.completed_tasks} tasks</span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                Last: {tasker.lastTaskTitle}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Link to={`/messages?user=${tasker.id}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </Link>
              <Link to={`/post-task?tasker=${tasker.id}`}>
                <Button size="sm" className="gap-1 group-hover:shadow-md transition-shadow">
                  Rebook
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
