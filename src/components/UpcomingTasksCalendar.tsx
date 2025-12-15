import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin,
  ArrowRight
} from "lucide-react";
import { format, startOfWeek, addDays, isSameDay, isToday, isTomorrow } from "date-fns";
import { cn } from "@/lib/utils";

interface UpcomingTasksCalendarProps {
  userId: string;
  userRole?: string | null;
}

interface ScheduledTask {
  id: string;
  title: string;
  scheduled_date: string;
  location: string;
  status: string;
  pay_amount: number;
}

export function UpcomingTasksCalendar({ userId, userRole }: UpcomingTasksCalendarProps) {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchScheduledTasks();
  }, [userId, userRole]);

  const fetchScheduledTasks = async () => {
    try {
      let query = supabase
        .from("tasks")
        .select("id, title, scheduled_date, location, status, pay_amount")
        .not("scheduled_date", "is", null)
        .gte("scheduled_date", new Date().toISOString())
        .order("scheduled_date", { ascending: true })
        .limit(20);

      if (userRole === "task_giver") {
        query = query.eq("task_giver_id", userId);
      } else {
        query = query.eq("task_doer_id", userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching scheduled tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => 
      task.scheduled_date && isSameDay(new Date(task.scheduled_date), date)
    );
  };

  const tasksForSelectedDate = getTasksForDate(selectedDate);

  const navigateWeek = (direction: "prev" | "next") => {
    setWeekStart(prev => addDays(prev, direction === "next" ? 7 : -7));
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEE, MMM d");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <Skeleton key={i} className="h-16 flex-1 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Tasks
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => navigateWeek("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[100px] text-center">
              {format(weekStart, "MMM yyyy")}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => navigateWeek("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Week view */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((date) => {
            const dayTasks = getTasksForDate(date);
            const isSelected = isSameDay(date, selectedDate);
            const hasTask = dayTasks.length > 0;
            
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg transition-all",
                  isSelected 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted",
                  isToday(date) && !isSelected && "ring-2 ring-primary/50"
                )}
              >
                <span className="text-xs font-medium opacity-70">
                  {format(date, "EEE")}
                </span>
                <span className="text-lg font-bold">{format(date, "d")}</span>
                {hasTask && (
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full mt-1",
                    isSelected ? "bg-primary-foreground" : "bg-primary"
                  )} />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected date tasks */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {getDateLabel(selectedDate)}
          </p>
          
          {tasksForSelectedDate.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tasks scheduled</p>
              <Link to={userRole === "task_giver" ? "/post-task" : "/browse"}>
                <Button variant="link" size="sm" className="mt-2">
                  {userRole === "task_giver" ? "Schedule a task" : "Find tasks"}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {tasksForSelectedDate.map((task) => (
                <Link 
                  key={task.id} 
                  to={`/task/${task.id}`}
                  className="block"
                >
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{task.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{task.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        ${task.pay_amount}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
