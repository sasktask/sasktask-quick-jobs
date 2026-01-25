import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  ArrowRight,
  Plus,
  Zap,
  CalendarDays,
  List,
  LayoutGrid,
  Filter
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
  isTomorrow,
  isPast,
  parseISO,
  getDay
} from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDayCell } from "./CalendarDayCell";
import { TaskPreviewCard } from "./TaskPreviewCard";
import { CalendarFilters } from "./CalendarFilters";

interface TaskCalendarProps {
  userId: string;
  userRole?: string | null;
  onDateSelect?: (date: Date) => void;
  className?: string;
}

export interface ScheduledTask {
  id: string;
  title: string;
  scheduled_date: string;
  location: string;
  status: string;
  pay_amount: number;
  category: string;
  priority?: string;
  description?: string;
  task_giver_id?: string;
  task_doer_id?: string;
}

type ViewMode = "month" | "week" | "list";

export function TaskCalendar({ userId, userRole, onDateSelect, className }: TaskCalendarProps) {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchScheduledTasks();
  }, [userId, userRole, currentMonth]);

  const fetchScheduledTasks = async () => {
    setLoading(true);
    try {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      
      // Fetch tasks from a broader range for better UX
      const rangeStart = subMonths(monthStart, 1);
      const rangeEnd = addMonths(monthEnd, 1);

      let query = supabase
        .from("tasks")
        .select("id, title, scheduled_date, location, status, pay_amount, category, priority, description, task_giver_id, task_doer_id")
        .not("scheduled_date", "is", null)
        .gte("scheduled_date", rangeStart.toISOString())
        .lte("scheduled_date", rangeEnd.toISOString())
        .order("scheduled_date", { ascending: true });

      if (userRole === "task_giver") {
        query = query.eq("task_giver_id", userId);
      } else if (userRole === "task_doer") {
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

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.scheduled_date) return false;
      const taskDate = parseISO(task.scheduled_date);
      const matchesDate = isSameDay(taskDate, date);
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      return matchesDate && matchesStatus;
    });
  };

  const filteredTasks = useMemo(() => {
    if (statusFilter === "all") return tasks;
    return tasks.filter(task => task.status === statusFilter);
  }, [tasks, statusFilter]);

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth(prev => direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    const days: Date[] = [];
    let day = calendarStart;
    
    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    
    return days;
  }, [currentMonth]);

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEEE, MMMM d");
  };

  const taskStats = useMemo(() => {
    const now = new Date();
    return {
      total: filteredTasks.length,
      upcoming: filteredTasks.filter(t => t.scheduled_date && parseISO(t.scheduled_date) >= now).length,
      thisMonth: filteredTasks.filter(t => t.scheduled_date && isSameMonth(parseISO(t.scheduled_date), currentMonth)).length,
      overdue: filteredTasks.filter(t => t.scheduled_date && isPast(parseISO(t.scheduled_date)) && t.status === "open").length
    };
  }, [filteredTasks, currentMonth]);

  if (loading) {
    return (
      <Card className={cn("border-border", className)}>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border overflow-hidden", className)}>
      {/* Header */}
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Task Calendar</CardTitle>
              <p className="text-sm text-muted-foreground">
                {taskStats.upcoming} upcoming • {taskStats.thisMonth} this month
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === "month" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2"
                onClick={() => setViewMode("month")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "week" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2"
                onClick={() => setViewMode("week")}
              >
                <Calendar className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <CalendarFilters 
              statusFilter={statusFilter} 
              onStatusChange={setStatusFilter} 
            />

            <Link to={userRole === "task_giver" ? "/post-task" : "/browse"}>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {userRole === "task_giver" ? "Post Task" : "Find Tasks"}
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigateMonth("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold min-w-[140px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigateMonth("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="ghost" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>

        {/* Calendar Grid or List View */}
        <AnimatePresence mode="wait">
          {viewMode === "list" ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              <ScrollArea className="h-[400px]">
                {filteredTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                    <Calendar className="h-12 w-12 mb-3 opacity-50" />
                    <p className="text-sm">No scheduled tasks</p>
                  </div>
                ) : (
                  <div className="space-y-2 pr-4">
                    {filteredTasks.map((task) => (
                      <TaskPreviewCard key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          ) : (
            <motion.div
              key="calendar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  const dayTasks = getTasksForDate(date);
                  const isSelected = selectedDate && isSameDay(date, selectedDate);
                  const isCurrentMonth = isSameMonth(date, currentMonth);
                  const isHovered = hoveredDate && isSameDay(date, hoveredDate);

                  return (
                    <CalendarDayCell
                      key={date.toISOString()}
                      date={date}
                      tasks={dayTasks}
                      isSelected={isSelected}
                      isCurrentMonth={isCurrentMonth}
                      isHovered={isHovered}
                      onClick={() => handleDateClick(date)}
                      onMouseEnter={() => setHoveredDate(date)}
                      onMouseLeave={() => setHoveredDate(null)}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Date Tasks Panel */}
        <AnimatePresence>
          {selectedDate && viewMode !== "list" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 border-t border-border pt-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">
                  {getDateLabel(selectedDate)}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? "s" : ""}
                </Badge>
              </div>

              {selectedDateTasks.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground bg-muted/30 rounded-lg">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No tasks scheduled</p>
                  <Link to={userRole === "task_giver" ? "/post-task" : "/browse"}>
                    <Button variant="link" size="sm" className="mt-2">
                      {userRole === "task_giver" ? "Schedule a task" : "Find tasks"}
                    </Button>
                  </Link>
                </div>
              ) : (
                <ScrollArea className="max-h-[200px]">
                  <div className="space-y-2 pr-2">
                    {selectedDateTasks.map((task) => (
                      <TaskPreviewCard key={task.id} task={task} compact />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
