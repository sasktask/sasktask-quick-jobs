import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown,
  Sparkles,
  Clock,
  DollarSign,
  MapPin,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategoryTitles } from '@/lib/categories';

interface MapCategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  minPay?: number;
  onMinPayChange?: (minPay: number | undefined) => void;
  maxDistance?: number;
  onMaxDistanceChange?: (distance: number | undefined) => void;
  showUrgentOnly?: boolean;
  onUrgentOnlyChange?: (urgent: boolean) => void;
  totalResults: number;
}

export function MapCategoryFilter({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  minPay,
  onMinPayChange,
  maxDistance,
  onMaxDistanceChange,
  showUrgentOnly,
  onUrgentOnlyChange,
  totalResults,
}: MapCategoryFilterProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const categories = getCategoryTitles();

  const activeFiltersCount = [
    selectedCategory !== 'all',
    searchQuery.length > 0,
    minPay !== undefined,
    maxDistance !== undefined,
    showUrgentOnly,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    onCategoryChange('all');
    onSearchChange('');
    onMinPayChange?.(undefined);
    onMaxDistanceChange?.(undefined);
    onUrgentOnlyChange?.(false);
  };

  const quickFilters = [
    { id: 'all', label: 'All Tasks', icon: <Sparkles className="h-3 w-3" /> },
    { id: 'urgent', label: 'Urgent', icon: <Zap className="h-3 w-3" />, onClick: () => onUrgentOnlyChange?.(!showUrgentOnly), active: showUrgentOnly },
  ];

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks on map..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 bg-background/80 backdrop-blur-sm"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => onSearchChange('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Quick Filters Row */}
      <div className="flex items-center gap-2">
        <ScrollArea className="flex-1">
          <div className="flex gap-2 pb-1">
            {quickFilters.map((filter) => (
              <Button
                key={filter.id}
                variant={filter.active || (filter.id === 'all' && selectedCategory === 'all' && !showUrgentOnly) ? 'default' : 'outline'}
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={filter.onClick || (() => onCategoryChange(filter.id === 'all' ? 'all' : filter.id))}
              >
                {filter.icon}
                {filter.label}
              </Button>
            ))}
            
            {/* Category pills */}
            {categories.slice(0, 5).map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                className="shrink-0"
                onClick={() => onCategoryChange(cat)}
              >
                {cat}
              </Button>
            ))}
            
            {/* More categories popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0 gap-1">
                  More
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                <div className="grid grid-cols-2 gap-1">
                  {categories.slice(5).map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? 'default' : 'ghost'}
                      size="sm"
                      className="justify-start text-xs"
                      onClick={() => onCategoryChange(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Advanced Filters Toggle */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Advanced Filters</h4>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear all
                  </Button>
                )}
              </div>

              {/* Min Pay Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  Minimum Pay
                </label>
                <div className="flex gap-2">
                  {[25, 50, 100, 200].map((amount) => (
                    <Button
                      key={amount}
                      variant={minPay === amount ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => onMinPayChange?.(minPay === amount ? undefined : amount)}
                    >
                      ${amount}+
                    </Button>
                  ))}
                </div>
              </div>

              {/* Max Distance Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  Max Distance
                </label>
                <div className="flex gap-2">
                  {[5, 10, 25, 50].map((dist) => (
                    <Button
                      key={dist}
                      variant={maxDistance === dist ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => onMaxDistanceChange?.(maxDistance === dist ? undefined : dist)}
                    >
                      {dist}km
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quick Time Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Task Duration
                </label>
                <div className="flex gap-2">
                  {['Quick', 'Short', 'Medium', 'Long'].map((duration) => (
                    <Button
                      key={duration}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      {duration}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filters summary */}
      <AnimatePresence>
        {activeFiltersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 flex-wrap"
          >
            <span className="text-xs text-muted-foreground">Active:</span>
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {selectedCategory}
                <X className="h-3 w-3 cursor-pointer" onClick={() => onCategoryChange('all')} />
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                "{searchQuery}"
                <X className="h-3 w-3 cursor-pointer" onClick={() => onSearchChange('')} />
              </Badge>
            )}
            {minPay && (
              <Badge variant="secondary" className="gap-1">
                ${minPay}+
                <X className="h-3 w-3 cursor-pointer" onClick={() => onMinPayChange?.(undefined)} />
              </Badge>
            )}
            {showUrgentOnly && (
              <Badge variant="secondary" className="gap-1">
                Urgent only
                <X className="h-3 w-3 cursor-pointer" onClick={() => onUrgentOnlyChange?.(false)} />
              </Badge>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {totalResults} result{totalResults !== 1 ? 's' : ''}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
