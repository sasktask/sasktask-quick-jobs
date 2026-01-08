import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Hash, User, MapPin, Star, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
  id: string;
  full_name: string;
  avatar_url: string | null;
  city: string | null;
  rating: number | null;
  total_reviews: number | null;
  user_id_number: string | null;
}

export const UserIdSearch = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Enter a User ID",
        description: "Please enter a user ID to search (e.g., TG-1000)",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Search by user_id_number (case-insensitive)
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, city, rating, total_reviews, user_id_number")
        .ilike("user_id_number", `%${searchQuery.trim()}%`)
        .limit(10);

      if (error) throw error;

      setResults(data || []);
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSelectUser = (userId: string) => {
    setOpen(false);
    setSearchQuery("");
    setResults([]);
    setHasSearched(false);
    navigate(`/profile/${userId}`);
  };

  const getRoleBadge = (userIdNumber: string | null) => {
    if (!userIdNumber) return null;
    if (userIdNumber.startsWith("TB-")) {
      return <Badge variant="secondary" className="text-xs">Both Roles</Badge>;
    } else if (userIdNumber.startsWith("TG-")) {
      return <Badge variant="outline" className="text-xs">Task Giver</Badge>;
    } else if (userIdNumber.startsWith("TD-")) {
      return <Badge className="text-xs bg-primary/10 text-primary border-primary/20">Task Doer</Badge>;
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" title="Search by User ID">
          <Hash className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            Search by User ID
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Enter User ID (e.g., TG-1000)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                className="font-mono pr-10"
              />
              <Hash className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            User IDs: <span className="font-mono">TG-XXXX</span> (Task Giver), <span className="font-mono">TD-XXXX</span> (Task Doer), <span className="font-mono">TB-XXXX</span> (Both)
          </p>

          {/* Results */}
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {isSearching && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}

            {!isSearching && hasSearched && results.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No users found with that ID</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try searching with a different ID
                  </p>
                </CardContent>
              </Card>
            )}

            {!isSearching && results.map((user) => (
              <Card 
                key={user.id} 
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleSelectUser(user.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold truncate">{user.full_name || "Unknown User"}</p>
                        {getRoleBadge(user.user_id_number)}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {user.user_id_number && (
                          <span className="font-mono text-primary font-medium">
                            #{user.user_id_number}
                          </span>
                        )}
                        {user.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {user.city}
                          </span>
                        )}
                        {user.rating !== null && user.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {user.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
