import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, ArrowRight, Zap, CheckCircle, AlertCircle } from "lucide-react";
import { format, parseISO, isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ScheduledTask } from "./TaskCalendar";

interface TaskPreviewCardProps {
  task: ScheduledTask;
  compact?: boolean;
}

export function TaskPreviewCard({ task, compact = false }: TaskPreviewCardProps) {
  const scheduledDate = task.scheduled_date ? parseISO(task.scheduled_date) : null;
  const isOverdue = scheduledDate && isPast(scheduledDate) && task.status === "open";
  const isDueToday = scheduledDate && isToday(scheduledDate);

  const getStatusIcon = () => {
    switch (task.status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Zap className="h-4 w-4 text-blue-500" />;
      default:
        return isOverdue ? <AlertCircle className="h-4 w-4 text-destructive" /> : null;
    }
  };

  const getStatusColor = () => {
    if (task.status === "completed") return "border-green-500/30 bg-green-500/5";
    if (task.status === "in_progress") return "border-blue-500/30 bg-blue-500/5";
    if (isOverdue) return "border-destructive/30 bg-destructive/5";
    if (isDueToday) return "border-primary/30 bg-primary/5";
    return "border-border";
  };

  const getPriorityBadge = () => {
    if (!task.priority || task.priority === "medium") return null;
    
    const variants: Record<string, string> = {
      urgent: "bg-destructive/10 text-destructive border-destructive/20",
      high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      low: "bg-muted text-muted-foreground"
    };

    return (
      <Badge 
        variant="outline" 
        className={cn("text-[10px] h-5", variants[task.priority])}
      >
        {task.priority}
      </Badge>
    );
  };

  if (compact) {
    return (
      <Link to={`/task/${task.id}`} className="block">
        <motion.div
          whileHover={{ x: 4 }}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm",
            getStatusColor()
          )}
        >
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {getStatusIcon() || <Clock className="h-5 w-5 text-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{task.title}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{task.location}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-medium">
              ${task.pay_amount}
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to={`/task/${task.id}`} className="block">
      <motion.div
        whileHover={{ y: -2 }}
        className={cn(
          "p-4 rounded-lg border transition-all hover:shadow-md",
          getStatusColor()
        )}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getStatusIcon()}
              <h4 className="font-medium text-sm truncate">{task.title}</h4>
            </div>
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {task.description}
              </p>
            )}
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-bold shrink-0">
            ${task.pay_amount}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate max-w-[120px]">{task.location}</span>
          </div>
          
          {scheduledDate && (
            <div className={cn(
              "flex items-center gap-1 text-xs",
              isOverdue ? "text-destructive" : isDueToday ? "text-primary" : "text-muted-foreground"
            )}>
              <Clock className="h-3 w-3" />
              <span>{format(scheduledDate, "h:mm a")}</span>
            </div>
          )}

          <Badge variant="secondary" className="text-[10px] h-5">
            {task.category}
          </Badge>

          {getPriorityBadge()}

          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] h-5 ml-auto",
              task.status === "completed" && "bg-green-500/10 text-green-500 border-green-500/20",
              task.status === "in_progress" && "bg-blue-500/10 text-blue-500 border-blue-500/20",
              task.status === "open" && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
            )}
          >
            {task.status === "in_progress" ? "In Progress" : task.status}
          </Badge>
        </div>
      </motion.div>
    </Link>
  );
}
