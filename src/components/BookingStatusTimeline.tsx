import { CheckCircle2, Clock, Circle, XCircle, DollarSign, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineStep {
  status: string;
  label: string;
  timestamp?: string;
  icon: React.ReactNode;
}

interface BookingStatusTimelineProps {
  currentStatus: string;
  createdAt: string;
  acceptedAt?: string | null;
  paymentAt?: string | null;
  completedAt?: string | null;
  className?: string;
}

export const BookingStatusTimeline = ({
  currentStatus,
  createdAt,
  acceptedAt,
  paymentAt,
  completedAt,
  className
}: BookingStatusTimelineProps) => {
  const steps: TimelineStep[] = [
    {
      status: "pending",
      label: "Booking Created",
      timestamp: createdAt,
      icon: <Circle className="h-4 w-4" />
    },
    {
      status: "accepted",
      label: "Accepted",
      timestamp: acceptedAt || undefined,
      icon: <CheckCircle2 className="h-4 w-4" />
    },
    {
      status: "payment",
      label: "Payment Secured",
      timestamp: paymentAt || undefined,
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      status: "in_progress",
      label: "In Progress",
      icon: <Clock className="h-4 w-4" />
    },
    {
      status: "completed",
      label: "Completed",
      timestamp: completedAt || undefined,
      icon: <CheckCircle2 className="h-4 w-4" />
    }
  ];

  const statusOrder = ["pending", "accepted", "payment", "in_progress", "completed"];
  const currentIndex = statusOrder.indexOf(currentStatus);
  const isCancelled = currentStatus === "cancelled" || currentStatus === "rejected";

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (isCancelled) {
    return (
      <div className={cn("flex items-center gap-2 p-4 bg-destructive/10 rounded-lg border border-destructive/20", className)}>
        <XCircle className="h-5 w-5 text-destructive" />
        <span className="text-sm font-medium text-destructive">
          Booking {currentStatus === "cancelled" ? "Cancelled" : "Rejected"}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h4 className="text-sm font-medium text-muted-foreground">Booking Progress</h4>
      <div className="relative">
        {steps.map((step, index) => {
          const stepIndex = statusOrder.indexOf(step.status);
          const isCompleted = stepIndex <= currentIndex;
          const isCurrent = step.status === currentStatus;

          return (
            <div key={step.status} className="flex items-start gap-3 pb-4 last:pb-0">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute left-[11px] w-0.5 h-[calc(100%-32px)] mt-6",
                    stepIndex < currentIndex ? "bg-primary" : "bg-muted"
                  )}
                  style={{ top: `${index * 64}px` }}
                />
              )}
              
              {/* Icon */}
              <div
                className={cn(
                  "relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors",
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-muted text-muted-foreground",
                  isCurrent && "ring-2 ring-primary/30"
                )}
              >
                {step.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium",
                  isCompleted ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </p>
                {step.timestamp && (
                  <p className="text-xs text-muted-foreground">
                    {formatDate(step.timestamp)}
                  </p>
                )}
              </div>

              {/* Status indicator */}
              {isCurrent && (
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  Current
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
