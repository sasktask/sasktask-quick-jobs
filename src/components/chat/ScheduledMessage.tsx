import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CalendarDays, 
  Send, 
  X,
  Timer,
  Trash2
} from 'lucide-react';
import { format, addHours, addDays, setHours, setMinutes, isAfter, isBefore, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ScheduledMessageProps {
  message: string;
  onSchedule: (date: Date) => void;
  onCancel: () => void;
  className?: string;
}

interface QuickOption {
  label: string;
  getDate: () => Date;
  icon: React.ReactNode;
}

export const ScheduleMessagePopover = ({ 
  message, 
  onSchedule, 
  onCancel,
  className 
}: ScheduledMessageProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addHours(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [isOpen, setIsOpen] = useState(true);

  // Quick schedule options
  const quickOptions: QuickOption[] = [
    { 
      label: 'In 1 hour', 
      getDate: () => addHours(new Date(), 1),
      icon: <Timer className="h-3 w-3" />
    },
    { 
      label: 'In 3 hours', 
      getDate: () => addHours(new Date(), 3),
      icon: <Timer className="h-3 w-3" />
    },
    { 
      label: 'Tomorrow 9 AM', 
      getDate: () => setHours(setMinutes(addDays(startOfDay(new Date()), 1), 0), 9),
      icon: <CalendarDays className="h-3 w-3" />
    },
    { 
      label: 'Tomorrow 2 PM', 
      getDate: () => setHours(setMinutes(addDays(startOfDay(new Date()), 1), 0), 14),
      icon: <CalendarDays className="h-3 w-3" />
    },
  ];

  // Generate time options
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  const handleQuickSchedule = (option: QuickOption) => {
    const date = option.getDate();
    if (isAfter(date, new Date())) {
      onSchedule(date);
      setIsOpen(false);
      toast.success(`Message scheduled for ${format(date, 'PPp')}`);
    }
  };

  const handleCustomSchedule = () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledDate = setMinutes(setHours(selectedDate, hours), minutes);

    if (isBefore(scheduledDate, new Date())) {
      toast.error("Please select a future time");
      return;
    }

    onSchedule(scheduledDate);
    setIsOpen(false);
    toast.success(`Message scheduled for ${format(scheduledDate, 'PPp')}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className={cn(
            "bg-popover border rounded-xl shadow-xl p-4 w-80",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Schedule Message</h4>
                <p className="text-xs text-muted-foreground">Send later</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Message Preview */}
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Message:</p>
            <p className="text-sm line-clamp-2">{message || "No message"}</p>
          </div>

          {/* Quick Options */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Quick schedule:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickOptions.map((option) => (
                <Button
                  key={option.label}
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs gap-1.5 justify-start"
                  onClick={() => handleQuickSchedule(option)}
                >
                  {option.icon}
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Date/Time */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Or pick a custom time:</p>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => isBefore(date, startOfDay(new Date()))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              className="w-full gap-2" 
              onClick={handleCustomSchedule}
              disabled={!selectedDate}
            >
              <Send className="h-4 w-4" />
              Schedule Message
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Scheduled messages list
interface ScheduledMessageItem {
  id: string;
  message: string;
  scheduledFor: Date;
}

interface ScheduledMessagesListProps {
  messages: ScheduledMessageItem[];
  onCancel: (id: string) => void;
  onSendNow: (id: string) => void;
  className?: string;
}

export const ScheduledMessagesList = ({
  messages,
  onCancel,
  onSendNow,
  className,
}: ScheduledMessagesListProps) => {
  if (messages.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className={cn("border-t pt-3", className)}
    >
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          Scheduled ({messages.length})
        </span>
      </div>
      
      <div className="space-y-2">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs line-clamp-1">{msg.message}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {format(msg.scheduledFor, 'PPp')}
              </p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onSendNow(msg.id)}
              >
                <Send className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive"
                onClick={() => onCancel(msg.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ScheduleMessagePopover;
