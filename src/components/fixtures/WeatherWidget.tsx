"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, CloudRain, Sun, Wind, Thermometer } from "lucide-react";

interface WeatherWidgetProps {
  date: string;
  location?: string;
}

// Mock weather data - in a real implementation, this would call a weather API
function getMockWeather(date: string, location?: string) {
  const weatherOptions = [
    { condition: "Sunny", temp: 28, icon: Sun, precipitation: 0 },
    { condition: "Partly Cloudy", temp: 24, icon: Cloud, precipitation: 10 },
    { condition: "Cloudy", temp: 21, icon: Cloud, precipitation: 30 },
    { condition: "Light Rain", temp: 18, icon: CloudRain, precipitation: 60 },
  ];
  
  // Deterministic based on date string hash and location
  const seed = date + (location || "");
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return weatherOptions[hash % weatherOptions.length];
}

export function WeatherWidget({ date, location = "Match Location" }: WeatherWidgetProps) {
  if (!date) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4 text-center text-muted-foreground text-sm">
          Select a date to see weather forecast
        </CardContent>
      </Card>
    );
  }

  const weather = getMockWeather(date, location);
  const WeatherIcon = weather.icon;
  
  const isGoodForCricket = weather.precipitation < 40 && weather.temp > 15;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Weather Forecast {location && location !== "Match Location" && `• ${location}`}
            </p>
            <p className="text-sm font-medium mt-1">
              {new Date(date).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'short' })}
            </p>
          </div>
          <WeatherIcon className="h-10 w-10 text-blue-500" />
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <Thermometer className="h-4 w-4 mx-auto text-muted-foreground" />
            <p className="text-lg font-bold">{weather.temp}°C</p>
          </div>
          <div>
            <CloudRain className="h-4 w-4 mx-auto text-muted-foreground" />
            <p className="text-lg font-bold">{weather.precipitation}%</p>
          </div>
          <div>
            <Wind className="h-4 w-4 mx-auto text-muted-foreground" />
            <p className="text-lg font-bold">12 km/h</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
          <Badge 
            variant={isGoodForCricket ? "default" : "destructive"}
            className={isGoodForCricket ? "bg-green-500" : ""}
          >
            {isGoodForCricket ? "✓ Good for Cricket" : "⚠ Check Conditions"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
