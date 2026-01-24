import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Repeat, 
  Calendar as CalendarIcon, 
  Loader2, 
  Save,
  CheckCircle,
  AlertCircle,
  X
} from "lucide-react";
import { format, addDays, addWeeks, addMonths } from "date-fns";
import { cn } from "@/lib/utils";

interface RecurringTaskFormProps {
  taskId: string;
  taskTitle: string;
  initialRecurrence?: {
    frequency: string;
    start_date: string;
    end_date: string | null;
    is_active: boolean;
  } | null;
  onSave?: () => void;
  onCancel?: () => void;
}

type Frequency = "daily" | "weekly" | "biweekly" | "monthly";

const FREQUENCY_OPTIONS: { value: Frequency; label: string; description: string }[] = [
  { value: "daily", label: "Daily", description: "Every day" },
  { value: "weekly", label: "Weekly", description: "Same day each week" },
  { value: "biweekly", label: "Bi-weekly", description: "Every two weeks" },
  { value: "monthly", label: "Monthly", description: "Same date each month" },
];

export function RecurringTaskForm({
  taskId,
  taskTitle,
  initialRecurrence,
  onSave,
  onCancel,
}: RecurringTaskFormProps) {
  const [isRecurring, setIsRecurring] = useState(!!initialRecurrence?.is_active);
  const [frequency, setFrequency] = useState<Frequency>(
    (initialRecurrence?.frequency as Frequency) || "weekly"
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialRecurrence?.start_date ? new Date(initialRecurrence.start_date) : new Date()
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialRecurrence?.end_date ? new Date(initialRecurrence.end_date) : undefined
  );
  const [hasEndDate, setHasEndDate] = useState(!!initialRecurrence?.end_date);
  const [saving, setSaving] = useState(false);
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);
  const { toast } = useToast();

  const getNextOccurrence = (freq: Frequency, start: Date): Date => {
    switch (freq) {
      case "daily":
        return addDays(start, 1);
      case "weekly":
        return addWeeks(start, 1);
      case "biweekly":
        return addWeeks(start, 2);
      case "monthly":
        return addMonths(start, 1);
      default:
        return addWeeks(start, 1);
    }
  };

  const getPreviewDates = () => {
    if (!startDate) return [];
    const dates: Date[] = [startDate];
    let current = startDate;

    for (let i = 0; i < 4; i++) {
      current = getNextOccurrence(frequency, current);
      if (endDate && current > endDate) break;
      dates.push(current);
    }

    return dates;
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!isRecurring) {
        // Delete existing recurrence if turning off
        const { error } = await supabase
          .from("recurring_tasks")
          .delete()
          .eq("task_id", taskId);

        if (error) throw error;

        toast({
          title: "Recurrence removed",
          description: "This task is no longer recurring.",
        });
      } else {
        if (!startDate) {
          toast({
            title: "Start date required",
            description: "Please select a start date for the recurring task.",
            variant: "destructive",
          });
          return;
        }

        if (hasEndDate && endDate && endDate <= startDate) {
          toast({
            title: "Invalid end date",
            description: "End date must be after start date.",
            variant: "destructive",
          });
          return;
        }

        const nextOccurrence = getNextOccurrence(frequency, startDate);

        // Upsert recurrence
        const { error } = await supabase
          .from("recurring_tasks")
          .upsert({
            task_id: taskId,
            frequency,
            start_date: format(startDate, "yyyy-MM-dd"),
            end_date: hasEndDate && endDate ? format(endDate, "yyyy-MM-dd") : null,
            next_occurrence: format(nextOccurrence, "yyyy-MM-dd"),
            is_active: true,
          }, {
            onConflict: "task_id",
          });

        if (error) throw error;

        toast({
          title: "Recurrence saved",
          description: `Task will repeat ${frequency}.`,
        });
      }

      onSave?.();
    } catch (error: any) {
      console.error("Error saving recurrence:", error);
      toast({
        title: "Error saving",
        description: error.message || "Failed to save recurrence settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const previewDates = getPreviewDates();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-primary" />
              Recurring Task
            </CardTitle>
            <CardDescription className="mt-1">
              Schedule "{taskTitle}" to repeat automatically
            </CardDescription>
          </div>
          <Switch
            checked={isRecurring}
            onCheckedChange={setIsRecurring}
            id="recurring-toggle"
          />
        </div>
      </CardHeader>

      {isRecurring && (
        <CardContent className="space-y-6">
          {/* Frequency */}
          <div className="space-y-2">
            <Label>How often?</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FREQUENCY_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={frequency === option.value ? "default" : "outline"}
                  className={cn(
                    "flex flex-col h-auto py-3",
                    frequency === option.value && "ring-2 ring-primary"
                  )}
                  onClick={() => setFrequency(option.value)}
                >
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs opacity-70">{option.description}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label>Starting from</Label>
            <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Select start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    setStartCalendarOpen(false);
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>End date (optional)</Label>
              <Switch
                checked={hasEndDate}
                onCheckedChange={setHasEndDate}
                id="has-end-date"
              />
            </div>
            {hasEndDate && (
              <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setEndCalendarOpen(false);
                    }}
                    disabled={(date) => date <= (startDate || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
            {!hasEndDate && (
              <p className="text-xs text-muted-foreground">
                Task will repeat indefinitely until you stop it.
              </p>
            )}
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Upcoming occurrences</Label>
            <div className="flex flex-wrap gap-2">
              {previewDates.map((date, index) => (
                <Badge
                  key={index}
                  variant={index === 0 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {format(date, "MMM d, yyyy")}
                </Badge>
              ))}
              {previewDates.length >= 5 && !endDate && (
                <Badge variant="outline" className="text-xs">
                  ...and more
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Recurrence
                </>
              )}
            </Button>
          </div>
        </CardContent>
      )}

      {!isRecurring && initialRecurrence && (
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Recurrence is currently disabled. Enable to set up a schedule.</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
