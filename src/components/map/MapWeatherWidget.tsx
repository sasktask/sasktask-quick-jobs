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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  condition: 'clear' | 'clouds' | 'rain' | 'snow' | 'storm' | 'wind' | 'fog';
  high: number;
  low: number;
}

interface MapWeatherWidgetProps {
  latitude?: number;
  longitude?: number;
  className?: string;
}

// Realistic Saskatchewan weather based on current date
const getSeasonalWeather = (): WeatherData => {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const hour = now.getHours();
  
  // Saskatchewan seasonal temperature ranges (in Celsius)
  const seasonalData: Record<number, { tempRange: [number, number]; conditions: WeatherData['condition'][] }> = {
    0: { tempRange: [-25, -15], conditions: ['snow', 'clouds', 'clear'] }, // January
    1: { tempRange: [-22, -12], conditions: ['snow', 'clouds', 'clear'] }, // February
    2: { tempRange: [-12, 0], conditions: ['snow', 'clouds', 'wind'] }, // March
    3: { tempRange: [-2, 8], conditions: ['rain', 'clouds', 'clear'] }, // April
    4: { tempRange: [5, 18], conditions: ['rain', 'clouds', 'clear'] }, // May
    5: { tempRange: [12, 24], conditions: ['clear', 'clouds', 'rain'] }, // June
    6: { tempRange: [15, 28], conditions: ['clear', 'clouds', 'storm'] }, // July
    7: { tempRange: [14, 26], conditions: ['clear', 'clouds', 'storm'] }, // August
    8: { tempRange: [6, 18], conditions: ['clouds', 'rain', 'clear'] }, // September
    9: { tempRange: [-2, 10], conditions: ['clouds', 'rain', 'snow'] }, // October
    10: { tempRange: [-12, -2], conditions: ['snow', 'clouds', 'wind'] }, // November
    11: { tempRange: [-22, -12], conditions: ['snow', 'clouds', 'clear'] }, // December
  };

  const seasonal = seasonalData[month];
  const [minTemp, maxTemp] = seasonal.tempRange;
  
  // Temperature varies by time of day
  const dayProgress = hour < 6 ? 0.2 : hour < 12 ? 0.7 : hour < 18 ? 1 : 0.5;
  const baseTemp = minTemp + (maxTemp - minTemp) * dayProgress;
  const temp = Math.round(baseTemp + (Math.random() * 4 - 2)); // Small variation
  
  const condition = seasonal.conditions[Math.floor(Math.random() * seasonal.conditions.length)];
  
  // Wind chill effect
  const windSpeed = Math.round(10 + Math.random() * 25);
  const feelsLike = temp < 10 
    ? Math.round(temp - (windSpeed * 0.3)) 
    : temp;

  const descriptions: Record<WeatherData['condition'], string> = {
    clear: hour >= 6 && hour < 20 ? 'Sunny' : 'Clear Night',
    clouds: 'Partly Cloudy',
    rain: 'Light Rain',
    snow: 'Snow Showers',
    storm: 'Thunderstorms',
    wind: 'Windy',
    fog: 'Foggy',
  };

  return {
    temp,
    feels_like: feelsLike,
    humidity: Math.round(40 + Math.random() * 40),
    wind_speed: windSpeed,
    description: descriptions[condition],
    condition,
    high: maxTemp + Math.round(Math.random() * 3),
    low: minTemp - Math.round(Math.random() * 3),
  };
};

const getWeatherIcon = (condition: string, size: 'sm' | 'lg' = 'sm') => {
  const sizeClass = size === 'lg' ? 'h-10 w-10' : 'h-5 w-5';
  
  switch (condition) {
    case 'clear':
      return <Sun className={`${sizeClass} text-warning`} />;
    case 'clouds':
      return <CloudSun className={`${sizeClass} text-muted-foreground`} />;
    case 'rain':
      return <CloudRain className={`${sizeClass} text-info`} />;
    case 'snow':
      return <Snowflake className={`${sizeClass} text-info`} />;
    case 'storm':
      return <AlertTriangle className={`${sizeClass} text-warning`} />;
    case 'wind':
      return <Wind className={`${sizeClass} text-muted-foreground`} />;
    case 'fog':
      return <CloudFog className={`${sizeClass} text-muted-foreground`} />;
    default:
      return <Cloud className={`${sizeClass} text-muted-foreground`} />;
  }
};

const getWeatherAdvice = (weather: WeatherData): { text: string; severity: 'good' | 'warning' | 'bad' } => {
  if (weather.temp < -25 || weather.feels_like < -30) {
    return { text: 'Extreme cold warning - avoid outdoor tasks', severity: 'bad' };
  }
  if (weather.temp < -15) {
    return { text: 'Very cold - limit outdoor exposure', severity: 'warning' };
  }
  if (weather.condition === 'storm') {
    return { text: 'Storm warning - reschedule outdoor tasks', severity: 'bad' };
  }
  if (weather.condition === 'snow' && weather.wind_speed > 30) {
    return { text: 'Blizzard conditions - stay indoors', severity: 'bad' };
  }
  if (weather.condition === 'rain' || weather.condition === 'snow') {
    return { text: 'Precipitation expected - dress accordingly', severity: 'warning' };
  }
  if (weather.wind_speed > 40) {
    return { text: 'High wind advisory', severity: 'warning' };
  }
  if (weather.temp > 30) {
    return { text: 'Heat advisory - stay hydrated', severity: 'warning' };
  }
  return { text: 'Good conditions for outdoor tasks', severity: 'good' };
};

export function MapWeatherWidget({ latitude, longitude, className }: MapWeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData>(() => getSeasonalWeather());
  const [isExpanded, setIsExpanded] = useState(false);

  // Update weather periodically (every 30 minutes in real app)
  useEffect(() => {
    setWeather(getSeasonalWeather());
    
    const interval = setInterval(() => {
      setWeather(getSeasonalWeather());
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [latitude, longitude]);

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
                <Snowflake className="h-3 w-3 text-info/60" />
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
            <div>H: {weather.high}°</div>
            <div>L: {weather.low}°</div>
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
                    <Thermometer className="h-4 w-4 text-destructive mb-1" />
                    <span className="text-xs text-muted-foreground">Feels Like</span>
                    <span className="text-sm font-semibold text-foreground">{weather.feels_like}°C</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
                    <Droplets className="h-4 w-4 text-info mb-1" />
                    <span className="text-xs text-muted-foreground">Humidity</span>
                    <span className="text-sm font-semibold text-foreground">{weather.humidity}%</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
                    <Wind className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Wind</span>
                    <span className="text-sm font-semibold text-foreground">{weather.wind_speed} km/h</span>
                  </div>
                </div>

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

                {/* Location */}
                <p className="text-[10px] text-center text-muted-foreground">
                  Saskatchewan, Canada • Updated just now
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
