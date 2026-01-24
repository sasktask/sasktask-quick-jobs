import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Search,
  MapPin,
  History,
  Star,
  Navigation,
  Loader2,
  X,
  Building2,
  Home,
  Briefcase,
  TrendingUp,
  Crosshair,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface LocationResult {
  id: string;
  place_name: string;
  short_name: string;
  center: [number, number]; // [longitude, latitude]
  type: 'address' | 'place' | 'poi' | 'neighborhood' | 'locality';
  context?: string;
}

interface MapLocationSearchProps {
  onLocationSelect: (lat: number, lng: number, zoom?: number, placeName?: string) => void;
  userLocation?: { latitude: number; longitude: number } | null;
  className?: string;
}

// Popular Saskatchewan locations
const POPULAR_LOCATIONS = [
  { id: 'saskatoon', name: 'Saskatoon', short: 'Saskatoon', lat: 52.1579, lng: -106.6702, type: 'city' as const },
  { id: 'regina', name: 'Regina', short: 'Regina', lat: 50.4452, lng: -104.6189, type: 'city' as const },
  { id: 'prince-albert', name: 'Prince Albert', short: 'Prince Albert', lat: 53.2033, lng: -105.7531, type: 'city' as const },
  { id: 'moose-jaw', name: 'Moose Jaw', short: 'Moose Jaw', lat: 50.3934, lng: -105.5519, type: 'city' as const },
  { id: 'swift-current', name: 'Swift Current', short: 'Swift Current', lat: 50.2851, lng: -107.7972, type: 'city' as const },
  { id: 'yorkton', name: 'Yorkton', short: 'Yorkton', lat: 51.2139, lng: -102.4628, type: 'city' as const },
  { id: 'north-battleford', name: 'North Battleford', short: 'N. Battleford', lat: 52.7575, lng: -108.2861, type: 'city' as const },
  { id: 'lloydminster', name: 'Lloydminster', short: 'Lloydminster', lat: 53.2807, lng: -110.0350, type: 'city' as const },
];

const STORAGE_KEY = 'map_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export function MapLocationSearch({ onLocationSelect, userLocation, className }: MapLocationSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<LocationResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (!error && data?.token) {
          setMapboxToken(data.token);
        }
      } catch (err) {
        console.error('Failed to fetch Mapbox token:', err);
      }
    };
    fetchToken();
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((location: LocationResult) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.id !== location.id);
      const updated = [location, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore localStorage errors
      }
      return updated;
    });
  }, []);

  // Geocoding search
  const searchLocations = useCallback(async (searchQuery: string) => {
    if (!mapboxToken || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const proximity = userLocation 
        ? `${userLocation.longitude},${userLocation.latitude}`
        : '-106.67,52.13'; // Saskatchewan center

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
        `access_token=${mapboxToken}` +
        `&country=ca` +
        `&proximity=${proximity}` +
        `&bbox=-110.0,49.0,-101.0,60.0` + // Saskatchewan bounding box
        `&limit=8` +
        `&types=address,place,poi,locality,neighborhood,postcode`
      );

      if (response.ok) {
        const data = await response.json();
        const results: LocationResult[] = data.features?.map((f: any) => ({
          id: f.id,
          place_name: f.place_name,
          short_name: f.text || f.place_name.split(',')[0],
          center: f.center,
          type: f.place_type?.[0] || 'place',
          context: f.context?.map((c: any) => c.text).slice(0, 2).join(', '),
        })) || [];
        setSuggestions(results);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [mapboxToken, userLocation]);

  // Debounced search
  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length >= 2) {
      debounceRef.current = setTimeout(() => {
        searchLocations(value);
      }, 300);
    } else {
      setSuggestions([]);
    }
  }, [searchLocations]);

  // Handle location selection
  const handleSelect = useCallback((location: LocationResult | { lat: number; lng: number; name: string; id: string }) => {
    if ('center' in location) {
      // Full LocationResult
      onLocationSelect(location.center[1], location.center[0], 14, location.place_name);
      saveRecentSearch(location);
      setSelectedLocation(location.short_name);
    } else {
      // Simple location
      onLocationSelect(location.lat, location.lng, 12, location.name);
      setSelectedLocation(location.name);
    }
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  }, [onLocationSelect, saveRecentSearch]);

  // Go to user location
  const handleGoToUserLocation = useCallback(() => {
    if (userLocation) {
      onLocationSelect(userLocation.latitude, userLocation.longitude, 14, 'My Location');
      setSelectedLocation('My Location');
      setIsOpen(false);
    }
  }, [userLocation, onLocationSelect]);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'poi':
        return <Building2 className="h-4 w-4 text-purple-500" />;
      case 'address':
        return <Home className="h-4 w-4 text-green-500" />;
      case 'place':
      case 'locality':
        return <MapPin className="h-4 w-4 text-primary" />;
      default:
        return <MapPin className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className={`justify-start gap-2 bg-background/80 backdrop-blur-sm ${className}`}
        >
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate text-muted-foreground">
            {selectedLocation || 'Search location...'}
          </span>
          {selectedLocation && (
            <X
              className="h-4 w-4 ml-auto shrink-0 opacity-50 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLocation(null);
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="start">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search address, city, or place..."
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              className="pl-9 pr-9"
              autoFocus
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {query && !isLoading && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-[400px]">
          {/* Search Results */}
          <AnimatePresence mode="wait">
            {query.length >= 2 && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-2"
              >
                <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Search Results</span>
                </div>
                {suggestions.map((location) => (
                  <button
                    key={location.id}
                    className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-accent transition-colors text-left"
                    onClick={() => handleSelect(location)}
                  >
                    {getLocationIcon(location.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{location.short_name}</p>
                      {location.context && (
                        <p className="text-xs text-muted-foreground truncate">{location.context}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {location.type}
                    </Badge>
                  </button>
                ))}
              </motion.div>
            )}

            {query.length >= 2 && suggestions.length === 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 text-center"
              >
                <MapPin className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No locations found</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Try a different search term</p>
              </motion.div>
            )}

            {query.length < 2 && (
              <div className="p-2 space-y-4">
                {/* My Location */}
                {userLocation && (
                  <div>
                    <button
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                      onClick={handleGoToUserLocation}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Crosshair className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">My Location</p>
                        <p className="text-xs text-muted-foreground">Use current GPS location</p>
                      </div>
                      <Navigation className="h-4 w-4 text-primary" />
                    </button>
                  </div>
                )}

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                      <div className="flex items-center gap-2">
                        <History className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">Recent</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-muted-foreground"
                        onClick={clearRecentSearches}
                      >
                        Clear
                      </Button>
                    </div>
                    {recentSearches.map((location) => (
                      <button
                        key={location.id}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors text-left"
                        onClick={() => handleSelect(location)}
                      >
                        <History className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{location.short_name}</p>
                          {location.context && (
                            <p className="text-xs text-muted-foreground truncate">{location.context}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <Separator />

                {/* Popular Locations */}
                <div>
                  <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                    <Star className="h-3 w-3 text-amber-500" />
                    <span className="text-xs font-medium text-muted-foreground">Popular in Saskatchewan</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {POPULAR_LOCATIONS.map((location) => (
                      <button
                        key={location.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors text-left"
                        onClick={() => handleSelect({
                          lat: location.lat,
                          lng: location.lng,
                          name: location.name,
                          id: location.id,
                        })}
                      >
                        <MapPin className="h-3 w-3 text-primary shrink-0" />
                        <span className="text-sm truncate">{location.short}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {/* Footer */}
        <div className="p-2 border-t border-border bg-muted/30">
          <p className="text-[10px] text-center text-muted-foreground">
            Powered by Mapbox • Search within Saskatchewan
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}