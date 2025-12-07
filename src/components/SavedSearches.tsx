import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Bell, BellOff, Trash2, Plus, MapPin, DollarSign, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SavedSearch {
  id: string;
  name: string;
  filters: {
    query?: string;
    category?: string;
    location?: string;
    minBudget?: number;
    maxBudget?: number;
  };
  notify_new_matches: boolean;
  created_at: string;
}

interface SavedSearchesProps {
  userId: string;
}

export function SavedSearches({ userId }: SavedSearchesProps) {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSearchName, setNewSearchName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedSearches();
  }, [userId]);

  const fetchSavedSearches = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSearches((data || []).map(d => ({
        ...d,
        filters: (d.filters as SavedSearch['filters']) || {}
      })));
    } catch (error) {
      console.error('Error fetching saved searches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNotifications = async (searchId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .update({ notify_new_matches: !currentValue })
        .eq('id', searchId);

      if (error) throw error;
      
      setSearches(prev => 
        prev.map(s => s.id === searchId ? { ...s, notify_new_matches: !currentValue } : s)
      );
      
      toast.success(currentValue ? 'Notifications disabled' : 'Notifications enabled');
    } catch (error) {
      console.error('Error updating search:', error);
      toast.error('Failed to update notifications');
    }
  };

  const deleteSearch = async (searchId: string) => {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId);

      if (error) throw error;
      
      setSearches(prev => prev.filter(s => s.id !== searchId));
      toast.success('Search deleted');
    } catch (error) {
      console.error('Error deleting search:', error);
      toast.error('Failed to delete search');
    }
  };

  const saveCurrentSearch = async () => {
    if (!newSearchName.trim()) {
      toast.error('Please enter a name for this search');
      return;
    }

    try {
      const { error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: userId,
          name: newSearchName,
          filters: {},
          notify_new_matches: true
        });

      if (error) throw error;
      
      toast.success('Search saved!');
      setNewSearchName('');
      setIsDialogOpen(false);
      fetchSavedSearches();
    } catch (error) {
      console.error('Error saving search:', error);
      toast.error('Failed to save search');
    }
  };

  const runSearch = (search: SavedSearch) => {
    const params = new URLSearchParams();
    if (search.filters.query) params.set('q', search.filters.query);
    if (search.filters.category) params.set('category', search.filters.category);
    if (search.filters.location) params.set('location', search.filters.location);
    
    navigate(`/browse?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            Saved Searches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5 text-primary" />
            Saved Searches
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Save Search
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Current Search</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Name your search..."
                  value={newSearchName}
                  onChange={(e) => setNewSearchName(e.target.value)}
                />
                <Button onClick={saveCurrentSearch} className="w-full">
                  Save Search
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {searches.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No saved searches yet. Save a search to get notified of new matching tasks!
          </p>
        ) : (
          <div className="space-y-3">
            {searches.map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => runSearch(search)}
                >
                  <p className="font-medium text-sm">{search.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {search.filters.query && (
                      <Badge variant="secondary" className="text-xs">
                        <Search className="h-3 w-3 mr-1" />
                        {search.filters.query}
                      </Badge>
                    )}
                    {search.filters.category && (
                      <Badge variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {search.filters.category}
                      </Badge>
                    )}
                    {search.filters.location && (
                      <Badge variant="secondary" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {search.filters.location}
                      </Badge>
                    )}
                    {(search.filters.minBudget || search.filters.maxBudget) && (
                      <Badge variant="secondary" className="text-xs">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {search.filters.minBudget || 0} - {search.filters.maxBudget || '∞'}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {search.notify_new_matches ? (
                      <Bell className="h-4 w-4 text-primary" />
                    ) : (
                      <BellOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Switch
                      checked={search.notify_new_matches}
                      onCheckedChange={() => toggleNotifications(search.id, search.notify_new_matches)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteSearch(search.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}