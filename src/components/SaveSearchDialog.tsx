import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bookmark, Bell, Tag, MapPin, DollarSign, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SearchFilters {
  query?: string;
  category?: string;
  location?: string;
  minBudget?: number;
  maxBudget?: number;
  priority?: string;
  distance?: number;
}

interface SaveSearchDialogProps {
  filters: SearchFilters;
  userId: string;
  onSaved?: () => void;
}

export function SaveSearchDialog({ filters, userId, onSaved }: SaveSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [notifyMatches, setNotifyMatches] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const hasFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof SearchFilters];
    return value !== undefined && value !== "" && value !== "all";
  });

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a name for this search");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("saved_searches")
        .insert([{
          user_id: userId,
          name: name.trim(),
          filters: filters as any,
          notify_new_matches: notifyMatches,
        }]);

      if (error) throw error;

      toast.success("Search saved! You'll be notified of new matches.");
      setOpen(false);
      setName("");
      onSaved?.();
    } catch (error) {
      console.error("Error saving search:", error);
      toast.error("Failed to save search");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={!hasFilters}>
          <Bookmark className="h-4 w-4" />
          Save Search
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            Save This Search
          </DialogTitle>
          <DialogDescription>
            Get notified when new tasks match your search criteria
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search Summary */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium">Current Filters:</p>
            <div className="flex flex-wrap gap-2">
              {filters.query && (
                <Badge variant="secondary" className="gap-1">
                  <Search className="h-3 w-3" />
                  "{filters.query}"
                </Badge>
              )}
              {filters.category && filters.category !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {filters.category}
                </Badge>
              )}
              {filters.location && (
                <Badge variant="secondary" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  {filters.location}
                </Badge>
              )}
              {(filters.minBudget || filters.maxBudget) && (
                <Badge variant="secondary" className="gap-1">
                  <DollarSign className="h-3 w-3" />
                  ${filters.minBudget || 0} - ${filters.maxBudget || "∞"}
                </Badge>
              )}
              {filters.priority && filters.priority !== "all" && (
                <Badge variant="secondary">
                  Priority: {filters.priority}
                </Badge>
              )}
              {filters.distance && filters.distance < 100 && (
                <Badge variant="secondary" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  Within {filters.distance}km
                </Badge>
              )}
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="search-name">Search Name</Label>
            <Input
              id="search-name"
              placeholder="e.g., Weekend Cleaning Jobs"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Notification Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Notify me of new matches</p>
                <p className="text-xs text-muted-foreground">
                  Get alerts when new tasks match this search
                </p>
              </div>
            </div>
            <Switch
              checked={notifyMatches}
              onCheckedChange={setNotifyMatches}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Search"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
