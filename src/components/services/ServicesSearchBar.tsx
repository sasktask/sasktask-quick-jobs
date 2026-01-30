import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Search, MapPin, DollarSign, Filter, Star, Clock, X, Sparkles, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ServicesSearchBarProps {
  onSearch?: (filters: SearchFilters) => void;
  className?: string;
}

export interface SearchFilters {
  query: string;
  location: string;
  category: string;
  minBudget: number;
  maxBudget: number;
  minRating: number;
  sortBy: string;
}

const popularSearches = [
  "House cleaning",
  "Moving help",
  "IKEA assembly",
  "Snow removal",
  "Dog walking",
  "Handyman",
  "Painting",
  "Yard work"
];

const categories = [
  { value: "all", label: "All Categories" },
  { value: "cleaning", label: "Cleaning" },
  { value: "moving", label: "Moving" },
  { value: "handyman", label: "Handyman" },
  { value: "yard", label: "Yard & Garden" },
  { value: "assembly", label: "Furniture Assembly" },
  { value: "electrical", label: "Electrical" },
  { value: "painting", label: "Painting" },
  { value: "snow", label: "Snow Removal" },
  { value: "pet-care", label: "Pet Care" },
  { value: "errands", label: "Errands" },
  { value: "tech", label: "Tech Help" },
];

export function ServicesSearchBar({ onSearch, className }: ServicesSearchBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("recommended");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    const filters: SearchFilters = {
      query,
      location,
      category,
      minBudget: priceRange[0],
      maxBudget: priceRange[1],
      minRating,
      sortBy
    };
    
    onSearch?.(filters);
    
    // Navigate to browse with filters
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (location) params.set("location", location);
    if (category !== "all") params.set("category", category);
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < 500) params.set("maxPrice", priceRange[1].toString());
    if (minRating > 0) params.set("minRating", minRating.toString());
    if (sortBy !== "recommended") params.set("sort", sortBy);
    
    navigate(`/browse?${params.toString()}`);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setTimeout(() => handleSearch(), 100);
  };

  const clearFilters = () => {
    setQuery("");
    setLocation("");
    setCategory("all");
    setPriceRange([0, 500]);
    setMinRating(0);
    setSortBy("recommended");
  };

  const activeFiltersCount = [
    category !== "all",
    priceRange[0] > 0 || priceRange[1] < 500,
    minRating > 0,
    location !== ""
  ].filter(Boolean).length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main search bar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="What do you need help with?"
            className="pl-10 h-12 text-base"
          />
          
          {/* Suggestions dropdown */}
          <AnimatePresence>
            {showSuggestions && query === "" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg p-4"
              >
                <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span>Popular searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((suggestion) => (
                    <Badge
                      key={suggestion}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Location input */}
        <div className="relative w-full md:w-48">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Saskatoon, SK"
            className="pl-10 h-12"
          />
        </div>

        {/* Category select */}
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-44 h-12">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filters popover */}
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-12 relative">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Filters</h4>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear all
                </Button>
              </div>

              {/* Price range */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Price Range
                </Label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={0}
                  max={500}
                  step={10}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}+</span>
                </div>
              </div>

              {/* Minimum rating */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Minimum Rating
                </Label>
                <div className="flex gap-2">
                  {[0, 3, 4, 4.5].map((rating) => (
                    <Button
                      key={rating}
                      variant={minRating === rating ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMinRating(rating)}
                    >
                      {rating === 0 ? "Any" : `${rating}+`}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sort by */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Sort By
                </Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Recommended
                      </span>
                    </SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="distance">Nearest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full" onClick={() => { handleSearch(); setFiltersOpen(false); }}>
                Apply Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Search button */}
        <Button onClick={handleSearch} className="h-12 px-6">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Active filters display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {category !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {categories.find(c => c.value === category)?.label}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setCategory("all")} />
            </Badge>
          )}
          {(priceRange[0] > 0 || priceRange[1] < 500) && (
            <Badge variant="secondary" className="gap-1">
              ${priceRange[0]} - ${priceRange[1]}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setPriceRange([0, 500])} />
            </Badge>
          )}
          {minRating > 0 && (
            <Badge variant="secondary" className="gap-1">
              {minRating}+ stars
              <X className="w-3 h-3 cursor-pointer" onClick={() => setMinRating(0)} />
            </Badge>
          )}
          {location && (
            <Badge variant="secondary" className="gap-1">
              {location}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setLocation("")} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
