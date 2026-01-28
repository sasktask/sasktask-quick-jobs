import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CalendarIcon, Clock, ArrowRight, ArrowLeft, AlertCircle, 
  Sun, Moon, Sunrise 
} from "lucide-react";
import { format, addDays, isToday, isTomorrow } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ScheduleData {
  date: Date | undefined;
  timeSlot: string;
  flexibility: string;
}

interface HireStepScheduleProps {
  data: ScheduleData;
  onChange: (data: ScheduleData) => void;
  onNext: () => void;
  onBack: () => void;
  isUrgent?: boolean;
}

const timeSlots = [
  { value: "morning", label: "Morning", time: "8:00 AM - 12:00 PM", icon: Sunrise },
  { value: "afternoon", label: "Afternoon", time: "12:00 PM - 5:00 PM", icon: Sun },
  { value: "evening", label: "Evening", time: "5:00 PM - 9:00 PM", icon: Moon },
];

const flexibilityOptions = [
  { value: "exact", label: "Exact time only" },
  { value: "flexible_1hr", label: "±1 hour flexible" },
  { value: "flexible_day", label: "Any time this day" },
  { value: "flexible_week", label: "Anytime this week" },
];

export const HireStepSchedule = ({ 
  data, 
  onChange, 
  onNext, 
  onBack,
  isUrgent 
}: HireStepScheduleProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const quickDates = [
    { label: "Today", date: new Date(), available: true },
    { label: "Tomorrow", date: addDays(new Date(), 1), available: true },
    { label: "This Weekend", date: getNextWeekend(), available: true },
  ];

  function getNextWeekend(): Date {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    return addDays(today, daysUntilSaturday);
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.date) {
      newErrors.date = "Please select a date";
    }
    
    if (!data.timeSlot) {
      newErrors.timeSlot = "Please select a time slot";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const getDateLabel = (date: Date | undefined) => {
    if (!date) return "Pick a date";
    if (isToday(date)) return `Today, ${format(date, "MMM d")}`;
    if (isTomorrow(date)) return `Tomorrow, ${format(date, "MMM d")}`;
    return format(date, "EEEE, MMM d");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold">When do you need this done?</h3>
        <p className="text-muted-foreground text-sm">
          Select your preferred date and time
        </p>
      </div>

      {/* Urgent Notice */}
      {isUrgent && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <p className="font-medium text-orange-600">Urgent Task</p>
            <p className="text-sm text-muted-foreground">
              We'll prioritize taskers who are available immediately
            </p>
          </div>
        </div>
      )}

      {/* Quick Date Selection */}
      <div className="space-y-2">
        <Label>Quick Select</Label>
        <div className="grid grid-cols-3 gap-2">
          {quickDates.map((qd) => (
            <Button
              key={qd.label}
              variant={data.date && format(data.date, "yyyy-MM-dd") === format(qd.date, "yyyy-MM-dd") ? "default" : "outline"}
              className="h-auto py-3 flex flex-col items-center gap-1"
              onClick={() => onChange({ ...data, date: qd.date })}
            >
              <span className="font-medium">{qd.label}</span>
              <span className="text-xs opacity-70">{format(qd.date, "MMM d")}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Calendar Picker */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" />
          Select Date *
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-12",
                !data.date && "text-muted-foreground",
                errors.date && "border-destructive"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {getDateLabel(data.date)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={data.date}
              onSelect={(date) => onChange({ ...data, date })}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-destructive text-xs flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.date}
          </p>
        )}
      </div>

      {/* Time Slot Selection */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Preferred Time *
        </Label>
        <div className="grid grid-cols-1 gap-2">
          {timeSlots.map((slot) => {
            const Icon = slot.icon;
            return (
              <div
                key={slot.value}
                className={cn(
                  "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4",
                  data.timeSlot === slot.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => onChange({ ...data, timeSlot: slot.value })}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  data.timeSlot === slot.value ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{slot.label}</p>
                  <p className="text-sm text-muted-foreground">{slot.time}</p>
                </div>
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 transition-all",
                  data.timeSlot === slot.value
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/30"
                )}>
                  {data.timeSlot === slot.value && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {errors.timeSlot && (
          <p className="text-destructive text-xs flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.timeSlot}
          </p>
        )}
      </div>

      {/* Flexibility */}
      <div className="space-y-2">
        <Label>Schedule Flexibility</Label>
        <Select
          value={data.flexibility}
          onValueChange={(value) => onChange({ ...data, flexibility: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="How flexible is your schedule?" />
          </SelectTrigger>
          <SelectContent>
            {flexibilityOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} className="flex-1 gap-2">
          Continue to Budget
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};
