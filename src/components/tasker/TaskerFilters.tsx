import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, Search, MapPin, Star, DollarSign, Clock, 
  Filter, X, CheckCircle, Award
} from "lucide-react";
import { getCategoryTitles } from "@/lib/categories";

interface TaskerFiltersProps {
  onFiltersChange: (filters: TaskerFilterValues) => void;
  initialFilters?: Partial<TaskerFilterValues>;
}

export interface TaskerFilterValues {
  search: string;
  category: string;
  minRate: number;
  maxRate: number;
  minRating: number;
  sortBy: string;
  verifiedOnly: boolean;
  availableNow: boolean;
}

const defaultFilters: TaskerFilterValues = {
  search: "",
  category: "all",
  minRate: 0,
  maxRate: 200,
  minRating: 0,
  sortBy: "rating",
  verifiedOnly: false,
  availableNow: false,
};

export const TaskerFilters = ({ onFiltersChange, initialFilters }: TaskerFiltersProps) => {
  const [filters, setFilters] = useState<TaskerFilterValues>({
    ...defaultFilters,
    ...initialFilters,
  });
  const [isOpen, setIsOpen] = useState(true);

  const categories = getCategoryTitles();

  const updateFilter = <K extends keyof TaskerFilterValues>(
    key: K,
    value: TaskerFilterValues[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const activeFilterCount = [
    filters.category !== "all",
    filters.minRate > 0 || filters.maxRate < 200,
    filters.minRating > 0,
    filters.verifiedOnly,
    filters.availableNow,
  ].filter(Boolean).length;

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, skill, or keyword..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filters.verifiedOnly ? "default" : "outline"}
          size="sm"
          onClick={() => updateFilter("verifiedOnly", !filters.verifiedOnly)}
          className="gap-1"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          Verified Only
        </Button>
        <Button
          variant={filters.availableNow ? "default" : "outline"}
          size="sm"
          onClick={() => updateFilter("availableNow", !filters.availableNow)}
          className="gap-1"
        >
          <Clock className="h-3.5 w-3.5" />
          Available Now
        </Button>
        <Button
          variant={filters.minRating >= 4 ? "default" : "outline"}
          size="sm"
          onClick={() => updateFilter("minRating", filters.minRating >= 4 ? 0 : 4)}
          className="gap-1"
        >
          <Star className="h-3.5 w-3.5" />
          4+ Stars
        </Button>
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Advanced Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4 pt-4">
          {/* Category Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => updateFilter("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hourly Rate Range */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Hourly Rate</Label>
              <span className="text-sm text-muted-foreground">
                ${filters.minRate} - ${filters.maxRate === 200 ? "200+" : filters.maxRate}
              </span>
            </div>
            <div className="pt-2">
              <Slider
                value={[filters.minRate, filters.maxRate]}
                min={0}
                max={200}
                step={5}
                onValueChange={([min, max]) => {
                  updateFilter("minRate", min);
                  updateFilter("maxRate", max);
                }}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$0</span>
              <span>$200+</span>
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Minimum Rating</Label>
            <div className="flex gap-2">
              {[0, 3, 3.5, 4, 4.5].map((rating) => (
                <Button
                  key={rating}
                  variant={filters.minRating === rating ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter("minRating", rating)}
                  className="flex-1"
                >
                  {rating === 0 ? "Any" : (
                    <span className="flex items-center gap-1">
                      {rating}
                      <Star className="h-3 w-3 fill-current" />
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Sort By</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => updateFilter("sortBy", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
                <SelectItem value="tasks">Most Tasks Completed</SelectItem>
                <SelectItem value="rate_low">Hourly Rate: Low to High</SelectItem>
                <SelectItem value="rate_high">Hourly Rate: High to Low</SelectItem>
                <SelectItem value="newest">Newest Members</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset Button */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="w-full text-muted-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Reset All Filters
            </Button>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
