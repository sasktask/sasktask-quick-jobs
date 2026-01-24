import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  Snowflake,
  CloudFog,
  CloudLightning,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  wind_gusts: number;
  description: string;
  condition: 'clear' | 'clouds' | 'rain' | 'snow' | 'storm' | 'wind' | 'fog';
  high: number;
  low: number;
  timestamp: string;
}

interface MapWeatherWidgetProps {
  latitude?: number;
  longitude?: number;
  className?: string;
}

const getWeatherIcon = (condition: string, size: 'sm' | 'lg' = 'sm') => {
  const sizeClass = size === 'lg' ? 'h-10 w-10' : 'h-5 w-5';
  
  switch (condition) {
    case 'clear':
      return <Sun className={`${sizeClass} text-amber-500`} />;
    case 'clouds':
      return <CloudSun className={`${sizeClass} text-slate-400`} />;
    case 'rain':
      return <CloudRain className={`${sizeClass} text-blue-500`} />;
    case 'snow':
      return <Snowflake className={`${sizeClass} text-cyan-400`} />;
    case 'storm':
      return <CloudLightning className={`${sizeClass} text-yellow-500`} />;
    case 'wind':
      return <Wind className={`${sizeClass} text-slate-500`} />;
    case 'fog':
      return <CloudFog className={`${sizeClass} text-slate-400`} />;
    default:
      return <Cloud className={`${sizeClass} text-slate-400`} />;
  }
};

const getWeatherAdvice = (weather: WeatherData): { text: string; severity: 'good' | 'warning' | 'bad' } => {
  if (weather.feels_like < -30) {
    return { text: 'Extreme cold warning - avoid outdoor tasks', severity: 'bad' };
  }
  if (weather.feels_like < -20) {
    return { text: 'Very cold - limit outdoor exposure', severity: 'warning' };
  }
  if (weather.feels_like < -10) {
    return { text: 'Cold conditions - dress warmly', severity: 'warning' };
  }
  if (weather.condition === 'storm') {
    return { text: 'Storm warning - reschedule outdoor tasks', severity: 'bad' };
  }
  if (weather.condition === 'snow' && weather.wind_speed > 40) {
    return { text: 'Blizzard conditions - stay indoors', severity: 'bad' };
  }
  if (weather.condition === 'snow') {
    return { text: 'Snow expected - drive carefully', severity: 'warning' };
  }
  if (weather.condition === 'rain') {
    return { text: 'Rain expected - bring an umbrella', severity: 'warning' };
  }
  if (weather.wind_gusts > 60) {
    return { text: 'High wind warning - secure loose items', severity: 'bad' };
  }
  if (weather.wind_speed > 40) {
    return { text: 'Windy conditions', severity: 'warning' };
  }
  if (weather.temp > 30) {
    return { text: 'Heat advisory - stay hydrated', severity: 'warning' };
  }
  if (weather.condition === 'fog') {
    return { text: 'Foggy - reduced visibility', severity: 'warning' };
  }
  return { text: 'Good conditions for outdoor tasks', severity: 'good' };
};

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('en-CA', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

export function MapWeatherWidget({ latitude, longitude, className }: MapWeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchWeather = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-weather', {
        body: { latitude, longitude }
      });

      if (fnError) throw fnError;
      
      setWeather(data);
      setLastUpdated(formatTime(data.timestamp));
    } catch (err) {
      console.error('Failed to fetch weather:', err);
      setError('Unable to load weather');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    
    // Refresh weather every 15 minutes
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [latitude, longitude]);

  if (isLoading && !weather) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={className}
      >
        <Card className="glass-card border-border/50 shadow-premium-md p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading weather...</span>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (error && !weather) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={className}
      >
        <Card className="glass-card border-border/50 shadow-premium-md p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-sm text-muted-foreground">{error}</span>
            <Button size="sm" variant="ghost" onClick={fetchWeather}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (!weather) return null;

  const advice = getWeatherAdvice(weather);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={className}
    >
      <Card 
        className="glass-card border-border/50 shadow-premium-md cursor-pointer overflow-hidden"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Compact View */}
        <div className="p-3 flex items-center gap-3">
          <div className="relative">
            {getWeatherIcon(weather.condition, 'lg')}
            {weather.condition === 'snow' && (
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >
                <Snowflake className="h-3 w-3 text-cyan-300/60" />
              </motion.div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">{weather.temp}°</span>
              <span className="text-sm text-muted-foreground">C</span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{weather.description}</p>
          </div>
          
          <div className="text-right text-xs text-muted-foreground">
            <div className="flex items-center gap-1 justify-end">
              <span className="text-red-400">↑</span> {weather.high}°
            </div>
            <div className="flex items-center gap-1 justify-end">
              <span className="text-blue-400">↓</span> {weather.low}°
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-border/50"
            >
              <div className="p-3 space-y-3">
                {/* Weather Stats Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
                    <Thermometer className="h-4 w-4 text-orange-400 mb-1" />
                    <span className="text-[10px] text-muted-foreground">Feels Like</span>
                    <span className="text-sm font-semibold text-foreground">{weather.feels_like}°C</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
                    <Droplets className="h-4 w-4 text-blue-400 mb-1" />
                    <span className="text-[10px] text-muted-foreground">Humidity</span>
                    <span className="text-sm font-semibold text-foreground">{weather.humidity}%</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
                    <Wind className="h-4 w-4 text-slate-400 mb-1" />
                    <span className="text-[10px] text-muted-foreground">Wind</span>
                    <span className="text-sm font-semibold text-foreground">{weather.wind_speed} km/h</span>
                  </div>
                </div>

                {/* Wind Gusts */}
                {weather.wind_gusts > weather.wind_speed + 10 && (
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Wind className="h-3 w-3" />
                    <span>Gusts up to {weather.wind_gusts} km/h</span>
                  </div>
                )}

                {/* Weather Advisory */}
                <Badge 
                  variant={
                    advice.severity === 'good' ? 'default' : 
                    advice.severity === 'warning' ? 'secondary' : 'destructive'
                  }
                  className="w-full justify-center text-xs py-1.5"
                >
                  {advice.severity !== 'good' && (
                    <AlertTriangle className="h-3 w-3 mr-1.5" />
                  )}
                  {advice.text}
                </Badge>

                {/* Location & Update Time */}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Saskatchewan, Canada</span>
                  <div className="flex items-center gap-1">
                    <span>Updated {lastUpdated}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-5 w-5 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchWeather();
                      }}
                    >
                      <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
