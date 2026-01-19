import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Clock, Users, Zap } from "lucide-react";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { Skeleton } from "@/components/ui/skeleton";

export const UrgencyBanner = () => {
  const stats = usePlatformStats();

  if (stats.isLoading) {
    return (
      <div className="flex items-center justify-center gap-6 py-3 px-4 bg-card/80 backdrop-blur-sm border-b border-border shadow-sm">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-36" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-card/80 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="flex items-center justify-center gap-4 md:gap-8 py-3 px-4">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
        
        <Link 
          to="/browse"
          className="relative flex items-center gap-2 text-sm hover:text-primary transition-colors group"
        >
          <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
            <Zap className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="font-medium text-foreground">
            <span className="text-primary font-bold">{stats.totalTasksPostedToday}</span> tasks posted today
          </span>
        </Link>

        <div className="hidden sm:block h-4 w-px bg-border/60" />

        <Link 
          to="/find-taskers"
          className="relative hidden sm:flex items-center gap-2 text-sm hover:text-primary transition-colors group"
        >
          <div className="h-7 w-7 rounded-full bg-secondary/15 flex items-center justify-center group-hover:bg-secondary/25 transition-colors">
            <Users className="h-3.5 w-3.5 text-secondary" />
          </div>
          <span className="font-medium text-foreground">
            <span className="text-secondary font-bold">{stats.totalActiveTaskers}</span> taskers available
          </span>
        </Link>

        <div className="hidden md:block h-4 w-px bg-border/60" />

        <div className="relative hidden md:flex items-center gap-2 text-sm">
          <div className="h-7 w-7 rounded-full bg-success/15 flex items-center justify-center">
            <TrendingUp className="h-3.5 w-3.5 text-success" />
          </div>
          <span className="font-medium text-foreground">
            <span className="text-success font-bold">{stats.averageRating}</span> avg rating
          </span>
        </div>
      </div>
    </div>
  );
};
