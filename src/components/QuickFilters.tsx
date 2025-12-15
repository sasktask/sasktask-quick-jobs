import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Zap, 
  MapPin, 
  DollarSign, 
  Clock, 
  Sparkles,
  Flame,
  Home,
  Truck,
  Wrench,
  Paintbrush,
  Scissors
} from "lucide-react";

interface QuickFilter {
  id: string;
  label: string;
  icon: React.ReactNode;
  type: "category" | "budget" | "time" | "special";
  value: any;
}

const quickFilters: QuickFilter[] = [
  { id: "urgent", label: "Urgent", icon: <Flame className="h-3 w-3" />, type: "special", value: { priority: "urgent" } },
  { id: "nearby", label: "Nearby", icon: <MapPin className="h-3 w-3" />, type: "special", value: { distance: 10 } },
  { id: "quick", label: "Quick Tasks", icon: <Zap className="h-3 w-3" />, type: "time", value: { time: "quick" } },
  { id: "high-pay", label: "$100+", icon: <DollarSign className="h-3 w-3" />, type: "budget", value: { minBudget: 100 } },
  { id: "today", label: "Today", icon: <Clock className="h-3 w-3" />, type: "special", value: { today: true } },
  { id: "cleaning", label: "Cleaning", icon: <Home className="h-3 w-3" />, type: "category", value: { category: "Home Cleaning" } },
  { id: "moving", label: "Moving", icon: <Truck className="h-3 w-3" />, type: "category", value: { category: "Moving Help" } },
  { id: "handyman", label: "Handyman", icon: <Wrench className="h-3 w-3" />, type: "category", value: { category: "Handyman" } },
];

interface QuickFiltersProps {
  activeFilters: string[];
  onToggle: (filterId: string, filterValue: any) => void;
  hasLocation?: boolean;
}

export function QuickFilters({ activeFilters, onToggle, hasLocation }: QuickFiltersProps) {
  const availableFilters = quickFilters.filter(f => {
    // Hide "Nearby" if user doesn't have location
    if (f.id === "nearby" && !hasLocation) return false;
    return true;
  });

  return (
    <div className="flex flex-wrap gap-2">
      {availableFilters.map((filter) => {
        const isActive = activeFilters.includes(filter.id);
        return (
          <Badge
            key={filter.id}
            variant={isActive ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all duration-200 py-1.5 px-3 gap-1.5",
              isActive 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "hover:bg-muted hover:border-primary/50"
            )}
            onClick={() => onToggle(filter.id, filter.value)}
          >
            {filter.icon}
            {filter.label}
          </Badge>
        );
      })}
    </div>
  );
}
