import { cn } from "@/lib/utils";

interface OnlineStatusBadgeProps {
  isOnline: boolean;
  lastSeen?: string | null;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export const OnlineStatusBadge = ({
  isOnline,
  lastSeen,
  size = "md",
  showText = false,
  className
}: OnlineStatusBadgeProps) => {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4"
  };

  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="relative">
        <span
          className={cn(
            "block rounded-full",
            sizeClasses[size],
            isOnline ? "bg-green-500" : "bg-muted-foreground/50"
          )}
        />
        {isOnline && (
          <span
            className={cn(
              "absolute inset-0 rounded-full animate-ping bg-green-500/50",
              sizeClasses[size]
            )}
          />
        )}
      </div>
      {showText && (
        <span className="text-xs text-muted-foreground">
          {isOnline ? "Online" : lastSeen ? formatLastSeen(lastSeen) : "Offline"}
        </span>
      )}
    </div>
  );
};
