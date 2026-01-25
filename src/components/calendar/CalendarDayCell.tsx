import { format, isToday, isPast, isFuture } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { ScheduledTask } from "./TaskCalendar";

interface CalendarDayCellProps {
  date: Date;
  tasks: ScheduledTask[];
  isSelected: boolean;
  isCurrentMonth: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function CalendarDayCell({
  date,
  tasks,
  isSelected,
  isCurrentMonth,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave
}: CalendarDayCellProps) {
  const today = isToday(date);
  const past = isPast(date) && !today;
  const hasTasks = tasks.length > 0;
  
  // Determine task status indicators
  const hasOpen = tasks.some(t => t.status === "open");
  const hasInProgress = tasks.some(t => t.status === "in_progress");
  const hasCompleted = tasks.some(t => t.status === "completed");
  const hasUrgent = tasks.some(t => t.priority === "urgent" || t.priority === "high");

  // Calculate total earnings for the day
  const totalEarnings = tasks.reduce((sum, t) => sum + (t.pay_amount || 0), 0);

  const getStatusColor = () => {
    if (hasUrgent) return "bg-destructive";
    if (hasInProgress) return "bg-blue-500";
    if (hasOpen) return "bg-primary";
    if (hasCompleted) return "bg-green-500";
    return "bg-muted-foreground";
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className={cn(
            "relative flex flex-col items-center justify-start p-1 sm:p-2 min-h-[60px] sm:min-h-[80px] rounded-lg transition-all",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            !isCurrentMonth && "opacity-40",
            isSelected && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background",
            today && !isSelected && "ring-2 ring-primary/50",
            isHovered && !isSelected && "bg-muted/80",
            past && !isSelected && "text-muted-foreground",
            !isSelected && !isHovered && "hover:bg-muted/50"
          )}
        >
          {/* Date Number */}
          <span className={cn(
            "text-sm font-medium mb-1",
            today && !isSelected && "text-primary font-bold",
            isSelected && "font-bold"
          )}>
            {format(date, "d")}
          </span>

          {/* Task Indicators */}
          {hasTasks && (
            <div className="flex flex-col items-center gap-1 w-full">
              {/* Task Count Dots */}
              <div className="flex gap-0.5 justify-center">
                {tasks.slice(0, 3).map((task, i) => (
                  <div
                    key={task.id}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isSelected ? "bg-primary-foreground" : getStatusColor()
                    )}
                  />
                ))}
                {tasks.length > 3 && (
                  <span className={cn(
                    "text-[10px] ml-0.5",
                    isSelected ? "text-primary-foreground" : "text-muted-foreground"
                  )}>
                    +{tasks.length - 3}
                  </span>
                )}
              </div>

              {/* Earnings indicator for larger screens */}
              {totalEarnings > 0 && (
                <span className={cn(
                  "hidden sm:block text-[10px] font-medium",
                  isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  ${totalEarnings}
                </span>
              )}
            </div>
          )}

          {/* Urgent indicator */}
          {hasUrgent && !isSelected && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
          )}
        </motion.button>
      </TooltipTrigger>

      {hasTasks && (
        <TooltipContent side="top" className="max-w-[250px] p-3">
          <div className="space-y-2">
            <p className="font-medium text-sm">
              {format(date, "EEEE, MMM d")}
            </p>
            <div className="space-y-1">
              {tasks.slice(0, 3).map(task => (
                <div key={task.id} className="flex items-center gap-2 text-xs">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    task.status === "completed" ? "bg-green-500" :
                    task.status === "in_progress" ? "bg-blue-500" :
                    task.priority === "urgent" ? "bg-destructive" : "bg-primary"
                  )} />
                  <span className="truncate flex-1">{task.title}</span>
                  <Badge variant="outline" className="text-[10px] h-4 px-1">
                    ${task.pay_amount}
                  </Badge>
                </div>
              ))}
              {tasks.length > 3 && (
                <p className="text-[10px] text-muted-foreground">
                  +{tasks.length - 3} more tasks
                </p>
              )}
            </div>
            <div className="pt-1 border-t border-border text-[10px] text-muted-foreground">
              Total: ${totalEarnings}
            </div>
          </div>
        </TooltipContent>
      )}
    </Tooltip>
  );
}
