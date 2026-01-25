import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Filter, CheckCircle, Clock, Zap, XCircle } from "lucide-react";

interface CalendarFiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Tasks", icon: null },
  { value: "open", label: "Open", icon: Clock, color: "text-yellow-500" },
  { value: "in_progress", label: "In Progress", icon: Zap, color: "text-blue-500" },
  { value: "completed", label: "Completed", icon: CheckCircle, color: "text-green-500" },
  { value: "cancelled", label: "Cancelled", icon: XCircle, color: "text-destructive" }
];

export function CalendarFilters({ statusFilter, onStatusChange }: CalendarFiltersProps) {
  const activeOption = STATUS_OPTIONS.find(o => o.value === statusFilter);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-9">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">
            {activeOption?.label || "Filter"}
          </span>
          {statusFilter !== "all" && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] ml-1">
              1
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Task Status
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {STATUS_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={statusFilter === option.value}
              onCheckedChange={() => onStatusChange(option.value)}
              className="gap-2"
            >
              {Icon && <Icon className={`h-4 w-4 ${option.color}`} />}
              {option.label}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
