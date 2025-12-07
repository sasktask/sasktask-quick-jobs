import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowUp, Minus, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
  showIcon?: boolean;
}

const priorityConfig: Record<TaskPriority, { label: string; icon: React.ReactNode; className: string }> = {
  low: {
    label: "Low",
    icon: <ArrowDown className="h-3 w-3" />,
    className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
  },
  medium: {
    label: "Medium",
    icon: <Minus className="h-3 w-3" />,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"
  },
  high: {
    label: "High",
    icon: <ArrowUp className="h-3 w-3" />,
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800"
  },
  urgent: {
    label: "Urgent",
    icon: <AlertTriangle className="h-3 w-3" />,
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800 animate-pulse"
  }
};

export const TaskPriorityBadge = ({ priority, className, showIcon = true }: TaskPriorityBadgeProps) => {
  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "gap-1 font-medium border",
        config.className,
        className
      )}
    >
      {showIcon && config.icon}
      {config.label}
    </Badge>
  );
};
