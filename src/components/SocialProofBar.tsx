import { Shield, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialProofBarProps {
  className?: string;
  variant?: "default" | "compact";
}

export function SocialProofBar({ className, variant = "default" }: SocialProofBarProps) {
  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap justify-center gap-6 py-4", className)}>
        <div className="flex items-center gap-2 animate-fade-in">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">Trusted by Saskatchewan</span>
        </div>
        <div className="flex items-center gap-2 animate-fade-in">
          <TrendingUp className="h-4 w-4 text-success" />
          <span className="text-sm text-success font-medium">Growing Fast</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-gradient-to-r from-muted/50 via-background to-muted/50 border-y border-border py-4",
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-5 w-5 text-primary" />
            <span>Trusted by Saskatchewan</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-5 w-5 text-success" />
            <span className="text-success font-medium">Growing Fast</span>
          </div>
        </div>
      </div>
    </div>
  );
}
