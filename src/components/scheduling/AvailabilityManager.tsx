import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  Calendar, 
  Save, 
  Loader2, 
  Plus, 
  Trash2, 
  Copy,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AvailabilitySlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface AvailabilityManagerProps {
  userId: string;
  onSave?: () => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  const time24 = `${hour.toString().padStart(2, "0")}:${minute}`;
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const timeDisplay = `${hour12}:${minute} ${period}`;
  return { value: time24, label: timeDisplay };
});

const DEFAULT_SLOTS: AvailabilitySlot[] = DAYS_OF_WEEK.map(day => ({
  day_of_week: day.value,
  start_time: "09:00",
  end_time: "17:00",
  is_available: day.value >= 1 && day.value <= 5, // Mon-Fri default
}));

export function AvailabilityManager({ userId, onSave }: AvailabilityManagerProps) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailability();
  }, [userId]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("user_id", userId)
        .order("day_of_week", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        // Map existing slots to our format
        const existingSlots: AvailabilitySlot[] = DAYS_OF_WEEK.map(day => {
          const existing = data.find(s => s.day_of_week === day.value);
          return existing ? {
            id: existing.id,
            day_of_week: existing.day_of_week,
            start_time: existing.start_time,
            end_time: existing.end_time,
            is_available: existing.is_available,
          } : {
            day_of_week: day.value,
            start_time: "09:00",
            end_time: "17:00",
            is_available: false,
          };
        });
        setSlots(existingSlots);
      } else {
        // Use default slots for new users
        setSlots(DEFAULT_SLOTS);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      toast({
        title: "Error loading availability",
        description: "Failed to load your availability settings.",
        variant: "destructive",
      });
      setSlots(DEFAULT_SLOTS);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotChange = (dayOfWeek: number, field: keyof AvailabilitySlot, value: any) => {
    setSlots(prev => prev.map(slot => 
      slot.day_of_week === dayOfWeek ? { ...slot, [field]: value } : slot
    ));
    setHasChanges(true);
  };

  const toggleDay = (dayOfWeek: number) => {
    setSlots(prev => prev.map(slot => 
      slot.day_of_week === dayOfWeek 
        ? { ...slot, is_available: !slot.is_available } 
        : slot
    ));
    setHasChanges(true);
  };

  const copyToAllWeekdays = (sourceDayOfWeek: number) => {
    const sourceSlot = slots.find(s => s.day_of_week === sourceDayOfWeek);
    if (!sourceSlot) return;

    setSlots(prev => prev.map(slot => {
      // Apply to weekdays only (Mon-Fri)
      if (slot.day_of_week >= 1 && slot.day_of_week <= 5) {
        return {
          ...slot,
          start_time: sourceSlot.start_time,
          end_time: sourceSlot.end_time,
          is_available: true,
        };
      }
      return slot;
    }));
    setHasChanges(true);
    toast({
      title: "Copied to weekdays",
      description: "Schedule applied to Monday-Friday.",
    });
  };

  const setAllUnavailable = () => {
    setSlots(prev => prev.map(slot => ({ ...slot, is_available: false })));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate time slots
      for (const slot of slots) {
        if (slot.is_available && slot.start_time >= slot.end_time) {
          toast({
            title: "Invalid time range",
            description: `${DAYS_OF_WEEK[slot.day_of_week].label}: End time must be after start time.`,
            variant: "destructive",
          });
          return;
        }
      }

      // Delete existing slots and insert new ones
      const { error: deleteError } = await supabase
        .from("availability_slots")
        .delete()
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      // Only insert slots that are marked as available or have been configured
      const slotsToInsert = slots.map(slot => ({
        user_id: userId,
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_available: slot.is_available,
      }));

      const { error: insertError } = await supabase
        .from("availability_slots")
        .insert(slotsToInsert);

      if (insertError) throw insertError;

      setHasChanges(false);
      toast({
        title: "Availability saved",
        description: "Your weekly schedule has been updated.",
      });

      onSave?.();
    } catch (error: any) {
      console.error("Error saving availability:", error);
      toast({
        title: "Error saving",
        description: error.message || "Failed to save your availability.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getAvailableDaysCount = () => {
    return slots.filter(s => s.is_available).length;
  };

  const getTotalHours = () => {
    return slots.reduce((total, slot) => {
      if (!slot.is_available) return total;
      const start = parseInt(slot.start_time.split(":")[0]) + parseInt(slot.start_time.split(":")[1]) / 60;
      const end = parseInt(slot.end_time.split(":")[0]) + parseInt(slot.end_time.split(":")[1]) / 60;
      return total + (end - start);
    }, 0);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Weekly Availability
            </CardTitle>
            <CardDescription className="mt-1">
              Set your regular working hours. Task Givers will see when you're available.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {getAvailableDaysCount()} days
            </Badge>
            <Badge variant="secondary" className="text-sm">
              ~{getTotalHours().toFixed(0)} hrs/week
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 pb-4 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToAllWeekdays(1)}
            className="text-xs"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy Monday to Weekdays
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={setAllUnavailable}
            className="text-xs"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        </div>

        {/* Day slots */}
        <div className="space-y-3">
          {slots.map((slot) => {
            const dayInfo = DAYS_OF_WEEK[slot.day_of_week];
            return (
              <div
                key={slot.day_of_week}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg border transition-colors",
                  slot.is_available 
                    ? "bg-primary/5 border-primary/20" 
                    : "bg-muted/30 border-muted"
                )}
              >
                {/* Day toggle */}
                <div className="flex items-center gap-3 min-w-[140px]">
                  <Switch
                    checked={slot.is_available}
                    onCheckedChange={() => toggleDay(slot.day_of_week)}
                    id={`day-${slot.day_of_week}`}
                  />
                  <Label
                    htmlFor={`day-${slot.day_of_week}`}
                    className={cn(
                      "font-medium cursor-pointer",
                      !slot.is_available && "text-muted-foreground"
                    )}
                  >
                    {dayInfo.label}
                  </Label>
                </div>

                {/* Time selectors */}
                {slot.is_available ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Select
                      value={slot.start_time}
                      onValueChange={(value) => handleSlotChange(slot.day_of_week, "start_time", value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span className="text-muted-foreground">to</span>

                    <Select
                      value={slot.end_time}
                      onValueChange={(value) => handleSlotChange(slot.day_of_week, "end_time", value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.filter(t => t.value > slot.start_time).map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Copy button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 ml-auto"
                      onClick={() => copyToAllWeekdays(slot.day_of_week)}
                      title="Copy to all weekdays"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Unavailable</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {hasChanges ? (
              <span className="flex items-center gap-1 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                Unsaved changes
              </span>
            ) : (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                All changes saved
              </span>
            )}
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving || !hasChanges}
            className="min-w-[120px]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Schedule
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
