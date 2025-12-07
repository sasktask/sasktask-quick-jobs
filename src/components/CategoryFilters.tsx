import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TimeEstimate, 
  CategoryType, 
  SkillLevel,
  timeEstimateLabels,
  categoryTypeLabels,
  skillLevelLabels
} from "@/lib/categories";
import { Clock, MapPin, Award, X, Filter } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface CategoryFiltersProps {
  selectedTime: TimeEstimate | "all";
  selectedType: CategoryType | "all";
  selectedSkill: SkillLevel | "all";
  onTimeChange: (time: TimeEstimate | "all") => void;
  onTypeChange: (type: CategoryType | "all") => void;
  onSkillChange: (skill: SkillLevel | "all") => void;
  onClear: () => void;
}

export function CategoryFilters({
  selectedTime,
  selectedType,
  selectedSkill,
  onTimeChange,
  onTypeChange,
  onSkillChange,
  onClear
}: CategoryFiltersProps) {
  const [open, setOpen] = useState(false);
  
  const hasActiveFilters = selectedTime !== "all" || selectedType !== "all" || selectedSkill !== "all";
  const activeCount = [selectedTime, selectedType, selectedSkill].filter(f => f !== "all").length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Time Estimate Filter */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-primary" />
          <h4 className="font-semibold">Time Required</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedTime === "all" ? "default" : "outline"} 
            size="sm"
            onClick={() => onTimeChange("all")}
          >
            All
          </Button>
          {(Object.keys(timeEstimateLabels) as TimeEstimate[]).map((time) => (
            <Button 
              key={time}
              variant={selectedTime === time ? "default" : "outline"} 
              size="sm"
              onClick={() => onTimeChange(time)}
            >
              {timeEstimateLabels[time].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Category Type Filter */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-4 w-4 text-primary" />
          <h4 className="font-semibold">Location Type</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedType === "all" ? "default" : "outline"} 
            size="sm"
            onClick={() => onTypeChange("all")}
          >
            All
          </Button>
          {(Object.keys(categoryTypeLabels) as CategoryType[]).map((type) => (
            <Button 
              key={type}
              variant={selectedType === type ? "default" : "outline"} 
              size="sm"
              onClick={() => onTypeChange(type)}
            >
              {categoryTypeLabels[type]}
            </Button>
          ))}
        </div>
      </div>

      {/* Skill Level Filter */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Award className="h-4 w-4 text-primary" />
          <h4 className="font-semibold">Skill Level</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedSkill === "all" ? "default" : "outline"} 
            size="sm"
            onClick={() => onSkillChange("all")}
          >
            All
          </Button>
          {(Object.keys(skillLevelLabels) as SkillLevel[]).map((skill) => (
            <Button 
              key={skill}
              variant={selectedSkill === skill ? "default" : "outline"} 
              size="sm"
              onClick={() => onSkillChange(skill)}
            >
              {skillLevelLabels[skill]}
            </Button>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" className="w-full gap-2" onClick={onClear}>
          <X className="h-4 w-4" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile: Sheet */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                  {activeCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh]">
            <SheetHeader>
              <SheetTitle>Filter Categories</SheetTitle>
              <SheetDescription>
                Narrow down categories by time, location, and skill level
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Inline */}
      <div className="hidden lg:block bg-muted/50 rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Filter Categories</h3>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={onClear}>
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
        <FilterContent />
      </div>
    </>
  );
}
