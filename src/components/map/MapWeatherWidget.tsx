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
} from 'lucide-react';
import { motion } from 'framer-motion';

interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
  condition: 'clear' | 'clouds' | 'rain' | 'snow' | 'storm' | 'wind';
}

interface MapWeatherWidgetProps {
  latitude?: number;
  longitude?: number;
  className?: string;
}

// Mock weather data for Saskatchewan
const mockWeatherData: WeatherData = {
  temp: -5,
  feels_like: -10,
  humidity: 65,
  wind_speed: 15,
  description: 'Partly Cloudy',
  icon: 'clouds',
  condition: 'clouds',
};

const getWeatherIcon = (condition: string) => {
  switch (condition) {
    case 'clear':
      return <Sun className="h-6 w-6 text-yellow-500" />;
    case 'clouds':
      return <CloudSun className="h-6 w-6 text-gray-400" />;
    case 'rain':
      return <CloudRain className="h-6 w-6 text-blue-400" />;
    case 'snow':
      return <CloudSnow className="h-6 w-6 text-blue-200" />;
    case 'storm':
      return <AlertTriangle className="h-6 w-6 text-yellow-400" />;
    case 'wind':
      return <Wind className="h-6 w-6 text-gray-400" />;
    default:
      return <Cloud className="h-6 w-6 text-gray-400" />;
  }
};

const getWeatherAdvice = (weather: WeatherData): { text: string; severity: 'good' | 'warning' | 'bad' } => {
  if (weather.temp < -20) {
    return { text: 'Extreme cold - outdoor tasks risky', severity: 'bad' };
  }
  if (weather.temp < -10) {
    return { text: 'Very cold - dress warmly for outdoor tasks', severity: 'warning' };
  }
  if (weather.condition === 'rain' || weather.condition === 'snow') {
    return { text: 'Precipitation expected - plan accordingly', severity: 'warning' };
  }
  if (weather.wind_speed > 30) {
    return { text: 'High winds - some tasks may be affected', severity: 'warning' };
  }
  return { text: 'Good conditions for outdoor tasks', severity: 'good' };
};

export function MapWeatherWidget({ latitude, longitude, className }: MapWeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData>(mockWeatherData);
  const [isExpanded, setIsExpanded] = useState(false);

  // In a real app, this would fetch actual weather data
  useEffect(() => {
    // Simulate weather fetch
    const temps = [-15, -10, -5, 0, 5, 10];
    const conditions: WeatherData['condition'][] = ['clear', 'clouds', 'rain', 'snow'];
    
    setWeather({
      ...mockWeatherData,
      temp: temps[Math.floor(Math.random() * temps.length)],
      condition: conditions[Math.floor(Math.random() * conditions.length)],
    });
  }, [latitude, longitude]);

  const advice = getWeatherAdvice(weather);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={className}
    >
      <Card 
        className="bg-background/90 backdrop-blur-sm shadow-lg p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {getWeatherIcon(weather.condition)}
          <div>
            <p className="text-xl font-bold">{weather.temp}°C</p>
            <p className="text-xs text-muted-foreground">{weather.description}</p>
          </div>
        </div>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t"
          >
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-red-400" />
                <span>Feels like: {weather.feels_like}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-400" />
                <span>Humidity: {weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-gray-400" />
                <span>Wind: {weather.wind_speed} km/h</span>
              </div>
            </div>

            <Badge 
              variant={
                advice.severity === 'good' ? 'default' : 
                advice.severity === 'warning' ? 'secondary' : 'destructive'
              }
              className="mt-3 w-full justify-center text-xs"
            >
              {advice.text}
            </Badge>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}
