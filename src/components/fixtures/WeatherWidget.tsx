"use client";

import { Cloud, CloudRain, Sun, Wind, Thermometer } from "lucide-react";
import { D } from '@/lib/design-system';

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
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 text-center text-white/40 text-xs font-medium italic">
        Select a date to see atmospheric intel
      </div>
    );
  }

  const weather = getMockWeather(date, location);
  const WeatherIcon = weather.icon;
  
  const isGoodForCricket = weather.precipitation < 40 && weather.temp > 15;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden sh-fade-in">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1" style={{ fontFamily: D.mono }}>
              Atmospheric Intel {location && location !== "Match Location" && `• ${location}`}
            </p>
            <p className="text-sm font-bold text-white/90" style={{ fontFamily: D.head }}>
              {new Date(date).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'short' })}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <WeatherIcon className="h-6 w-6 text-primary" />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/5 rounded-xl p-2 border border-white/5 text-center">
            <Thermometer className="h-3 w-3 mx-auto text-white/40 mb-1" />
            <p className="text-sm font-black text-white">{weather.temp}°C</p>
          </div>
          <div className="bg-white/5 rounded-xl p-2 border border-white/5 text-center">
            <CloudRain className="h-3 w-3 mx-auto text-white/40 mb-1" />
            <p className="text-sm font-black text-white">{weather.precipitation}%</p>
          </div>
          <div className="bg-white/5 rounded-xl p-2 border border-white/5 text-center">
            <Wind className="h-3 w-3 mx-auto text-white/40 mb-1" />
            <p className="text-sm font-black text-white">12<span className="text-[10px] opacity-50 ml-0.5">km/h</span></p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-[10px] font-bold uppercase tracking-wider text-green-400">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          {isGoodForCricket ? "Prime conditions for cricket" : "Check grounds status"}
        </div>
      </div>
    </div>
  );
}
