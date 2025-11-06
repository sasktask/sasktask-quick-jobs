import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, X, Calendar as CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface SearchFilters {
  query: string;
  sender: "all" | "me" | "them";
  dateFrom?: Date;
  dateTo?: Date;
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  currentUserId: string;
  otherUserName: string;
}

export const SearchBar = ({ onSearch, onClear, currentUserId, otherUserName }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [sender, setSender] = useState<"all" | "me" | "them">("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch({ query, sender, dateFrom, dateTo });
  };

  const handleClear = () => {
    setQuery("");
    setSender("all");
    setDateFrom(undefined);
    setDateTo(undefined);
    setShowFilters(false);
    onClear();
  };

  const hasActiveFilters = sender !== "all" || dateFrom || dateTo;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search messages..."
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(hasActiveFilters && "bg-primary/10")}
        >
          <Filter className="h-4 w-4" />
        </Button>
        <Button onClick={handleSearch} size="icon">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleClear}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
          <div className="flex gap-2">
            <span className="text-sm text-muted-foreground self-center">Sender:</span>
            <Button
              variant={sender === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSender("all")}
            >
              All
            </Button>
            <Button
              variant={sender === "me" ? "default" : "outline"}
              size="sm"
              onClick={() => setSender("me")}
            >
              Me
            </Button>
            <Button
              variant={sender === "them" ? "default" : "outline"}
              size="sm"
              onClick={() => setSender("them")}
            >
              {otherUserName}
            </Button>
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">From:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateFrom ? format(dateFrom, "MMM d, yyyy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <span className="text-sm text-muted-foreground">To:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateTo ? format(dateTo, "MMM d, yyyy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
    </div>
  );
};
