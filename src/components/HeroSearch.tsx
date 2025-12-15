import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Sparkles, TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "category" | "task";
  id?: string;
  name?: string;
  title?: string;
  path?: string;
  location?: string;
  pay_amount?: number;
}

const popularSearches = [
  "Snow Removal",
  "Cleaning", 
  "Moving Help",
  "Assembly",
  "Delivery",
  "Handyman"
];

const categories = [
  { name: "Snow Removal", icon: "❄️", path: "/browse?category=Snow Removal" },
  { name: "Cleaning", icon: "🧹", path: "/browse?category=Cleaning" },
  { name: "Moving", icon: "📦", path: "/browse?category=Moving" },
  { name: "Delivery", icon: "🚚", path: "/browse?category=Delivery" },
  { name: "Handyman", icon: "🔧", path: "/browse?category=Handyman" },
  { name: "Gardening", icon: "🌱", path: "/browse?category=Gardening" },
  { name: "Pet Care", icon: "🐾", path: "/browse?category=Pet Care" },
  { name: "Painting", icon: "🎨", path: "/browse?category=Painting" },
];

export const HeroSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search functionality with debounce
  useEffect(() => {
    const searchTasks = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }
      setIsSearching(true);
      setShowResults(true);
      try {
        const { data: tasks, error } = await supabase
          .from("tasks")
          .select("id, title, location, pay_amount")
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`)
          .eq("status", "open")
          .limit(5);

        if (error) throw error;

        const categoryMatches = categories.filter(cat =>
          cat.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const results: SearchResult[] = [
          ...categoryMatches.map(cat => ({
            type: "category" as const,
            name: cat.name,
            path: cat.path,
          })),
          ...(tasks || []).map(task => ({
            type: "task" as const,
            id: task.id,
            title: task.title,
            location: task.location,
            pay_amount: task.pay_amount,
          })),
        ];
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchTasks, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "category" && result.path) {
      navigate(result.path);
    } else if (result.id) {
      navigate(`/task/${result.id}`);
    }
    setShowResults(false);
    setSearchQuery("");
  };

  const handlePopularSearchClick = (term: string) => {
    setSearchQuery(term);
    navigate(`/browse?category=${encodeURIComponent(term)}`);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto lg:mx-0">
      {/* Main Search Bar */}
      <div 
        className={cn(
          "relative flex flex-col sm:flex-row items-stretch sm:items-center bg-background/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border-2 transition-all duration-300 shadow-lg",
          isFocused 
            ? "border-primary shadow-xl shadow-primary/20" 
            : "border-border hover:border-primary/50"
        )}
      >
        <div className="flex items-center gap-2 pl-4 sm:pl-5 pt-3 sm:pt-0 text-muted-foreground">
          <Search className="h-5 w-5" />
        </div>
        <Input
          type="text"
          placeholder="What do you need done?"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 border-0 bg-transparent text-base sm:text-lg h-12 sm:h-14 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
        />
        <Button 
          onClick={handleSearch} 
          variant="hero" 
          size="lg" 
          className="m-2 sm:m-1.5 rounded-xl h-11 sm:h-auto"
        >
          <Search className="h-5 w-5 sm:mr-2" />
          <span className="sm:inline">Search</span>
        </Button>
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          {isSearching ? (
            <div className="p-6 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground mt-2">Searching...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              {searchResults.map((result, i) => (
                <button
                  key={i}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-5 py-4 flex items-center gap-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                >
                  {result.type === "category" ? (
                    <>
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{result.name}</p>
                        <p className="text-sm text-muted-foreground">Category</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-secondary" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-medium">{result.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{result.location}</span>
                          {result.pay_amount && (
                            <span className="text-primary font-medium">${result.pay_amount}</span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </button>
              ))}
            </div>
          ) : searchQuery.length >= 2 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
              <Button 
                variant="link" 
                onClick={() => navigate(`/browse?search=${encodeURIComponent(searchQuery)}`)}
                className="mt-2"
              >
                Search all tasks
              </Button>
            </div>
          ) : null}
        </div>
      )}

      {/* Popular Searches */}
      <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 justify-center lg:justify-start">
        <span className="text-xs sm:text-sm text-muted-foreground">Popular:</span>
        {popularSearches.slice(0, 4).map((term) => (
          <button
            key={term}
            onClick={() => handlePopularSearchClick(term)}
            className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-muted/50 hover:bg-primary/10 hover:text-primary rounded-full transition-colors border border-transparent hover:border-primary/30 touch-manipulation"
          >
            {term}
          </button>
        ))}
        <span className="hidden sm:inline-flex gap-2">
          {popularSearches.slice(4).map((term) => (
            <button
              key={term}
              onClick={() => handlePopularSearchClick(term)}
              className="px-3 py-1.5 text-sm bg-muted/50 hover:bg-primary/10 hover:text-primary rounded-full transition-colors border border-transparent hover:border-primary/30"
            >
              {term}
            </button>
          ))}
        </span>
      </div>
    </div>
  );
};
