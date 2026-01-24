import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  DollarSign,
  CheckCircle,
  AlertCircle,
  User,
  Briefcase,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  getDay,
} from "date-fns";
import { cn } from "@/lib/utils";

interface BookingCalendarProps {
  userId: string;
  userRole?: string | null;
  className?: string;
}

interface CalendarBooking {
  id: string;
  status: string;
  scheduled_date: string;
  task: {
    id: string;
    title: string;
    location: string;
    pay_amount: number;
    category: string;
  };
  otherParty: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500",
  accepted: "bg-blue-500",
  in_progress: "bg-purple-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
  disputed: "bg-orange-500",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  disputed: "Disputed",
};

export function BookingCalendar({ userId, userRole, className }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [userId, userRole, currentMonth]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      // Build query based on user role
      let query = supabase
        .from("bookings")
        .select(`
          id,
          status,
          tasks!inner (
            id,
            title,
            location,
            pay_amount,
            category,
            scheduled_date,
            task_giver_id,
            task_giver:profiles!tasks_task_giver_id_fkey (
              id,
              full_name,
              avatar_url
            )
          ),
          task_doer:profiles!bookings_task_doer_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .not("tasks.scheduled_date", "is", null)
        .gte("tasks.scheduled_date", monthStart.toISOString())
        .lte("tasks.scheduled_date", monthEnd.toISOString());

      if (userRole === "task_giver") {
        query = query.eq("tasks.task_giver_id", userId);
      } else {
        query = query.eq("task_doer_id", userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const formattedBookings: CalendarBooking[] = data.map((booking: any) => ({
          id: booking.id,
          status: booking.status,
          scheduled_date: booking.tasks.scheduled_date,
          task: {
            id: booking.tasks.id,
            title: booking.tasks.title,
            location: booking.tasks.location,
            pay_amount: booking.tasks.pay_amount,
            category: booking.tasks.category,
          },
          otherParty: userRole === "task_giver" 
            ? booking.task_doer 
            : booking.tasks.task_giver,
        }));
        setBookings(formattedBookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth(prev => 
      direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1)
    );
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(
      booking => booking.scheduled_date && isSameDay(new Date(booking.scheduled_date), date)
    );
  };

  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Booking Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="text-xs"
            >
              Today
            </Button>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => navigateMonth("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[140px] text-center">
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => navigateMonth("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Calendar Grid */}
        <div className="border rounded-lg overflow-hidden">
          {/* Week day headers */}
          <div className="grid grid-cols-7 bg-muted">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dayBookings = getBookingsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const hasBookings = dayBookings.length > 0;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "min-h-[80px] p-1 border-t border-l text-left transition-colors relative",
                    "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset",
                    !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                    isSelected && "bg-primary/10 ring-2 ring-primary ring-inset",
                    isToday(day) && "bg-primary/5"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-6 h-6 text-sm rounded-full",
                      isToday(day) && "bg-primary text-primary-foreground font-bold"
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  {/* Booking indicators */}
                  {hasBookings && (
                    <div className="mt-1 space-y-0.5">
                      {dayBookings.slice(0, 2).map((booking) => (
                        <div
                          key={booking.id}
                          className={cn(
                            "text-xs px-1 py-0.5 rounded truncate text-white",
                            STATUS_COLORS[booking.status] || "bg-gray-500"
                          )}
                          title={booking.task.title}
                        >
                          {booking.task.title}
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayBookings.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected date details */}
        {selectedDate && (
          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
                {isToday(selectedDate) && (
                  <Badge variant="secondary" className="text-xs">Today</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateBookings.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No bookings on this day</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-3">
                    {selectedDateBookings.map((booking) => (
                      <Link
                        key={booking.id}
                        to={`/bookings`}
                        className="block"
                      >
                        <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={booking.otherParty?.avatar_url || undefined} />
                            <AvatarFallback>
                              {booking.otherParty?.full_name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">
                                {booking.task.title}
                              </p>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs text-white border-0",
                                  STATUS_COLORS[booking.status]
                                )}
                              >
                                {STATUS_LABELS[booking.status] || booking.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {booking.otherParty?.full_name || "Unknown"}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {booking.task.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                ${booking.task.pay_amount}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 pt-2 border-t">
          <span className="text-xs text-muted-foreground">Status:</span>
          {Object.entries(STATUS_LABELS).slice(0, 4).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1">
              <span className={cn("w-2 h-2 rounded-full", STATUS_COLORS[key])} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
