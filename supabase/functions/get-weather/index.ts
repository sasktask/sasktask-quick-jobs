import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude } = await req.json();
    
    // Default to Saskatchewan center if no coordinates provided
    const lat = latitude || 52.1579;
    const lon = longitude || -106.6702;

    // Open-Meteo API - Free, no API key required
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=America/Regina&forecast_days=1`;

    const response = await fetch(weatherUrl);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Map WMO weather codes to conditions
    const getCondition = (code: number): string => {
      if (code === 0) return 'clear';
      if (code >= 1 && code <= 3) return 'clouds';
      if (code >= 45 && code <= 48) return 'fog';
      if (code >= 51 && code <= 67) return 'rain';
      if (code >= 71 && code <= 77) return 'snow';
      if (code >= 80 && code <= 82) return 'rain';
      if (code >= 85 && code <= 86) return 'snow';
      if (code >= 95 && code <= 99) return 'storm';
      return 'clouds';
    };

    const getDescription = (code: number): string => {
      const descriptions: Record<number, string> = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        56: 'Light freezing drizzle',
        57: 'Dense freezing drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        66: 'Light freezing rain',
        67: 'Heavy freezing rain',
        71: 'Slight snow fall',
        73: 'Moderate snow fall',
        75: 'Heavy snow fall',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail',
      };
      return descriptions[code] || 'Unknown';
    };

    const current = data.current;
    const daily = data.daily;

    const weatherData = {
      temp: Math.round(current.temperature_2m),
      feels_like: Math.round(current.apparent_temperature),
      humidity: current.relative_humidity_2m,
      wind_speed: Math.round(current.wind_speed_10m),
      wind_gusts: Math.round(current.wind_gusts_10m),
      condition: getCondition(current.weather_code),
      description: getDescription(current.weather_code),
      high: Math.round(daily.temperature_2m_max[0]),
      low: Math.round(daily.temperature_2m_min[0]),
      weather_code: current.weather_code,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(weatherData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Weather fetch error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
