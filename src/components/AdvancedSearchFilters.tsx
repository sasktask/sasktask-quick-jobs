import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";

export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  verified?: boolean;
  sortBy?: 'price_low' | 'price_high' | 'rating' | 'recent';
}

interface AdvancedSearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const categories = [
  "Home Cleaning",
  "Handyman",
  "Moving Help",
  "Furniture Assembly",
  "Lawn Care",
  "Delivery",
  "Painting",
  "Plumbing",
  "Electrical",
  "Other"
];

export const AdvancedSearchFilters = ({ filters, onFiltersChange }: AdvancedSearchFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const emptyFilters: SearchFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const activeFilterCount = Object.keys(filters).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
          <SheetDescription>
            Refine your search to find the perfect task or tasker
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Category */}
          <div>
            <Label>Category</Label>
            <Select
              value={localFilters.category}
              onValueChange={(value) => setLocalFilters({ ...localFilters, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div>
            <Label>Price Range</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label className="text-xs">Min</Label>
                <Input
                  type="number"
                  placeholder="$0"
                  value={localFilters.minPrice || ''}
                  onChange={(e) => setLocalFilters({ 
                    ...localFilters, 
                    minPrice: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                />
              </div>
              <div>
                <Label className="text-xs">Max</Label>
                <Input
                  type="number"
                  placeholder="Any"
                  value={localFilters.maxPrice || ''}
                  onChange={(e) => setLocalFilters({ 
                    ...localFilters, 
                    maxPrice: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                />
              </div>
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <Label>Minimum Rating</Label>
            <div className="pt-4">
              <Slider
                value={[localFilters.minRating || 0]}
                onValueChange={([value]) => setLocalFilters({ ...localFilters, minRating: value })}
                max={5}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Any</span>
                <span>{localFilters.minRating || 0} stars+</span>
              </div>
            </div>
          </div>

          {/* Verified Only */}
          <div className="flex items-center justify-between">
            <Label>Verified Taskers Only</Label>
            <Button
              variant={localFilters.verified ? "default" : "outline"}
              size="sm"
              onClick={() => setLocalFilters({ 
                ...localFilters, 
                verified: !localFilters.verified 
              })}
            >
              {localFilters.verified ? 'Yes' : 'No'}
            </Button>
          </div>

          {/* Sort By */}
          <div>
            <Label>Sort By</Label>
            <Select
              value={localFilters.sortBy}
              onValueChange={(value: any) => setLocalFilters({ ...localFilters, sortBy: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Most recent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button onClick={handleReset} variant="outline" className="flex-1">
            Reset
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};