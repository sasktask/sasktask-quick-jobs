import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedAvatarProps {
  src: string | null | undefined;
  alt?: string;
  isVerified?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  showBadge?: boolean;
  className?: string;
  fallbackClassName?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
};

const badgeSizeClasses = {
  sm: "h-3 w-3 -bottom-0.5 -right-0.5",
  md: "h-4 w-4 -bottom-0.5 -right-0.5",
  lg: "h-5 w-5 -bottom-1 -right-1",
  xl: "h-6 w-6 -bottom-1 -right-1",
};

const iconSizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

export const VerifiedAvatar = ({
  src,
  alt = "User",
  isVerified = false,
  size = "md",
  showBadge = true,
  className,
  fallbackClassName,
}: VerifiedAvatarProps) => {
  return (
    <div className="relative inline-block">
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarImage src={src || undefined} alt={alt} />
        <AvatarFallback className={fallbackClassName}>
          <User className={iconSizeClasses[size]} />
        </AvatarFallback>
      </Avatar>
      
      {/* Verified Badge */}
      {showBadge && isVerified && (
        <div 
          className={cn(
            "absolute bg-green-500 rounded-full p-0.5 border-2 border-background flex items-center justify-center",
            badgeSizeClasses[size]
          )}
        >
          <CheckCircle2 className="h-full w-full text-white" />
        </div>
      )}
    </div>
  );
};

// Badge-only component for use next to names
export const PhotoVerifiedBadge = ({ className }: { className?: string }) => {
  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "bg-green-500/10 text-green-600 border-green-500/20 text-xs gap-1",
        className
      )}
    >
      <CheckCircle2 className="h-3 w-3" />
      Verified
    </Badge>
  );
};
