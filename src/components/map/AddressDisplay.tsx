import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Copy, 
  Check, 
  Navigation, 
  ExternalLink,
  Building2,
  Home,
  Compass,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface AddressDisplayProps {
  latitude: number;
  longitude: number;
  showCard?: boolean;
  onNavigate?: () => void;
  className?: string;
}

interface GeocodedAddress {
  full: string;
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  postcode?: string;
  placeName?: string;
  placeType?: string;
}

export function AddressDisplay({
  latitude,
  longitude,
  showCard = true,
  onNavigate,
  className = '',
}: AddressDisplayProps) {
  const [address, setAddress] = useState<GeocodedAddress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  // Fetch Mapbox token
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

  // Reverse geocode
  useEffect(() => {
    if (!mapboxToken || !latitude || !longitude) return;

    const reverseGeocode = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?` +
          `access_token=${mapboxToken}&types=address,place,locality,neighborhood,postcode`
        );

        if (response.ok) {
          const data = await response.json();
          const feature = data.features?.[0];
          
          if (feature) {
            const context = feature.context || [];
            const getContextValue = (type: string) => 
              context.find((c: any) => c.id?.startsWith(type))?.text;

            setAddress({
              full: feature.place_name,
              street: feature.text,
              city: getContextValue('place') || getContextValue('locality'),
              region: getContextValue('region'),
              country: getContextValue('country'),
              postcode: getContextValue('postcode'),
              placeName: feature.text,
              placeType: feature.place_type?.[0],
            });
          } else {
            setAddress({
              full: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            });
          }
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        setAddress({
          full: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        });
      } finally {
        setIsLoading(false);
      }
    };

    reverseGeocode();
  }, [latitude, longitude, mapboxToken]);

  const copyAddress = async () => {
    if (!address?.full) return;
    try {
      await navigator.clipboard.writeText(address.full);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const openInMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const getPlaceIcon = () => {
    switch (address?.placeType) {
      case 'address':
        return <Home className="h-4 w-4 text-green-500" />;
      case 'place':
      case 'locality':
        return <Building2 className="h-4 w-4 text-blue-500" />;
      default:
        return <MapPin className="h-4 w-4 text-red-500" />;
    }
  };

  if (!showCard) {
    return (
      <div className={`flex items-start gap-2 ${className}`}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <>
            {getPlaceIcon()}
            <span className="text-sm">{address?.full || 'Unknown location'}</span>
          </>
        )}
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={className}
      >
        <Card className="p-4 bg-background/95 backdrop-blur-sm border-border">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded animate-pulse w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  {getPlaceIcon()}
                </div>
                <div className="flex-1 min-w-0">
                  {address?.street && (
                    <p className="font-medium text-sm">{address.street}</p>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {address?.full || 'Unknown location'}
                  </p>
                  {address?.city && (
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {address.city}
                      </Badge>
                      {address.postcode && (
                        <Badge variant="outline" className="text-xs">
                          {address.postcode}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Coordinates */}
              <div className="flex items-center gap-2 mt-3 p-2 bg-muted/50 rounded-lg">
                <Compass className="h-4 w-4 text-muted-foreground" />
                <code className="text-xs text-muted-foreground flex-1">
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </code>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={copyAddress}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                {onNavigate && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 gap-1.5"
                    onClick={onNavigate}
                  >
                    <Navigation className="h-4 w-4" />
                    Directions
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-1.5"
                  onClick={openInMaps}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Maps
                </Button>
              </div>
            </>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
