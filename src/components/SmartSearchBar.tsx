import { useState, useRef, useEffect } from "react";
import { Search, X, Sparkles, Clock, TrendingUp, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SmartSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  recentSearches?: string[];
  suggestions?: string[];
  className?: string;
}

const popularSearches = [
  "Home Cleaning",
  "Furniture Assembly",
  "Moving Help",
  "Lawn Care",
  "Handyman",
  "Delivery",
];

export function SmartSearchBar({
  value,
  onChange,
  onSearch,
  recentSearches = [],
  suggestions = [],
  className,
}: SmartSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    setShowDropdown(true);
  };

  const handleSelect = (term: string) => {
    onChange(term);
    onSearch(term);
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
    setShowDropdown(false);
  };

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  const showSuggestions = showDropdown && (recentSearches.length > 0 || suggestions.length > 0 || !value);

  return (
    <div className={cn("relative", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          placeholder="Search tasks by title, description, or location..."
          className={cn(
            "pl-12 pr-12 h-14 text-lg rounded-2xl border-2 transition-all duration-200",
            isFocused ? "border-primary shadow-lg shadow-primary/10" : "border-border"
          )}
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>

      {/* Search Dropdown */}
      {showSuggestions && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Suggestions
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors py-1.5 px-3"
                    onClick={() => handleSelect(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                <Clock className="h-4 w-4" />
                Recent Searches
              </div>
              <div className="space-y-1">
                {recentSearches.slice(0, 5).map((search, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(search)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          {!value && (
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                <TrendingUp className="h-4 w-4" />
                Popular Categories
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors py-1.5 px-3"
                    onClick={() => handleSelect(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
