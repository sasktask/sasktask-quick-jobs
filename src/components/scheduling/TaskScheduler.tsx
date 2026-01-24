import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CalendarIcon, 
  Clock, 
  Users, 
  Star, 
  MapPin, 
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { format, addDays, isSameDay, isToday, isTomorrow, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskSchedulerProps {
  selectedDate: Date | undefined;
  selectedTime: string;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  category?: string;
  location?: { lat: number; lng: number } | null;
  className?: string;
}

interface AvailableDoer {
  id: string;
  full_name: string;
  avatar_url: string | null;
  rating: number;
  total_reviews: number;
  city: string | null;
  start_time: string;
  end_time: string;
}

const TIME_SLOTS = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7; // Start at 7 AM
  const minute = i % 2 === 0 ? "00" : "30";
  const time24 = `${hour.toString().padStart(2, "0")}:${minute}`;
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const timeDisplay = `${hour12}:${minute} ${period}`;
  return { value: time24, label: timeDisplay };
});

export function TaskScheduler({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  category,
  location,
  className,
}: TaskSchedulerProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [availableDoers, setAvailableDoers] = useState<AvailableDoer[]>([]);
  const [loadingDoers, setLoadingDoers] = useState(false);
  const [datesWithDoers, setDatesWithDoers] = useState<Date[]>([]);

  // Fetch available doers when date/time changes
  useEffect(() => {
    if (selectedDate && selectedTime) {
      fetchAvailableDoers();
    } else {
      setAvailableDoers([]);
    }
  }, [selectedDate, selectedTime, category]);

  // Fetch dates that have available doers
  useEffect(() => {
    fetchDatesWithAvailability();
  }, [category]);

  const fetchDatesWithAvailability = async () => {
    try {
      // Get all availability slots
      const { data, error } = await supabase
        .from("availability_slots")
        .select("day_of_week")
        .eq("is_available", true);

      if (error) throw error;

      if (data) {
        // Create dates for the next 30 days that match available days
        const availableDays = [...new Set(data.map(d => d.day_of_week))];
        const dates: Date[] = [];
        const today = startOfDay(new Date());

        for (let i = 0; i < 30; i++) {
          const date = addDays(today, i);
          if (availableDays.includes(date.getDay())) {
            dates.push(date);
          }
        }
        setDatesWithDoers(dates);
      }
    } catch (error) {
      console.error("Error fetching available dates:", error);
    }
  };

  const fetchAvailableDoers = async () => {
    if (!selectedDate || !selectedTime) return;

    try {
      setLoadingDoers(true);
      const dayOfWeek = selectedDate.getDay();

      // Find doers available on this day/time
      const { data: slots, error: slotsError } = await supabase
        .from("availability_slots")
        .select(`
          user_id,
          start_time,
          end_time
        `)
        .eq("day_of_week", dayOfWeek)
        .eq("is_available", true)
        .lte("start_time", selectedTime)
        .gte("end_time", selectedTime);

      if (slotsError) throw slotsError;

      if (slots && slots.length > 0) {
        const userIds = slots.map(s => s.user_id);

        // Fetch doer profiles
        let query = supabase
          .from("profiles")
          .select("id, full_name, avatar_url, rating, total_reviews, city")
          .in("id", userIds)
          .order("rating", { ascending: false })
          .limit(10);

        const { data: profiles, error: profilesError } = await query;

        if (profilesError) throw profilesError;

        if (profiles) {
          const doers: AvailableDoer[] = profiles.map(p => {
            const slot = slots.find(s => s.user_id === p.id);
            return {
              id: p.id,
              full_name: p.full_name || "Anonymous",
              avatar_url: p.avatar_url,
              rating: p.rating || 0,
              total_reviews: p.total_reviews || 0,
              city: p.city,
              start_time: slot?.start_time || "",
              end_time: slot?.end_time || "",
            };
          });
          setAvailableDoers(doers);
        }
      } else {
        setAvailableDoers([]);
      }
    } catch (error) {
      console.error("Error fetching available doers:", error);
      setAvailableDoers([]);
    } finally {
      setLoadingDoers(false);
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEE, MMM d");
  };

  const quickDates = [
    { date: new Date(), label: "Today" },
    { date: addDays(new Date(), 1), label: "Tomorrow" },
    { date: addDays(new Date(), 2), label: format(addDays(new Date(), 2), "EEE") },
    { date: addDays(new Date(), 3), label: format(addDays(new Date(), 3), "EEE") },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Date Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">When do you need this done?</label>
        
        {/* Quick date buttons */}
        <div className="flex flex-wrap gap-2">
          {quickDates.map((qd) => {
            const hasDoers = datesWithDoers.some(d => isSameDay(d, qd.date));
            const isSelected = selectedDate && isSameDay(selectedDate, qd.date);
            
            return (
              <Button
                key={qd.label}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onDateChange(qd.date)}
                className={cn(
                  "relative",
                  hasDoers && !isSelected && "border-green-500/50"
                )}
              >
                {qd.label}
                {hasDoers && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </Button>
            );
          })}
          
          {/* Calendar picker */}
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant={selectedDate && !quickDates.some(qd => isSameDay(qd.date, selectedDate)) ? "default" : "outline"}
                size="sm"
              >
                <CalendarIcon className="h-4 w-4 mr-1" />
                {selectedDate && !quickDates.some(qd => isSameDay(qd.date, selectedDate))
                  ? format(selectedDate, "MMM d")
                  : "Pick date"
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  onDateChange(date);
                  setCalendarOpen(false);
                }}
                disabled={(date) => date < startOfDay(new Date())}
                modifiers={{
                  hasDoers: datesWithDoers,
                }}
                modifiersStyles={{
                  hasDoers: {
                    fontWeight: "bold",
                    textDecoration: "underline",
                    textDecorationColor: "rgb(34 197 94)",
                  },
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {selectedDate && (
          <p className="text-xs text-muted-foreground">
            Selected: {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </p>
        )}
      </div>

      {/* Time Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">What time works best?</label>
        <Select value={selectedTime} onValueChange={onTimeChange}>
          <SelectTrigger className="w-full">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Select a time" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]">
              {TIME_SLOTS.map((slot) => (
                <SelectItem key={slot.value} value={slot.value}>
                  {slot.label}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>

      {/* Available Doers Preview */}
      {selectedDate && selectedTime && (
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Available Task Doers
            </CardTitle>
            <CardDescription className="text-xs">
              {getDateLabel(selectedDate)} at {TIME_SLOTS.find(t => t.value === selectedTime)?.label}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingDoers ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : availableDoers.length > 0 ? (
              <div className="space-y-2">
                {availableDoers.slice(0, 5).map((doer) => (
                  <div
                    key={doer.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={doer.avatar_url || undefined} />
                      <AvatarFallback>
                        {doer.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doer.full_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {doer.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {doer.rating.toFixed(1)}
                          </span>
                        )}
                        {doer.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {doer.city}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {doer.start_time} - {doer.end_time}
                    </Badge>
                  </div>
                ))}
                {availableDoers.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    +{availableDoers.length - 5} more available
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No Task Doers available at this time
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try a different date or time
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
