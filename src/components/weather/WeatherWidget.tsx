"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets, 
  AlertTriangle, ThermometerSun, Eye, Calendar 
} from "lucide-react";

export interface WeatherData {
  temperature: number; // Celsius
  condition: 'Clear' | 'Partly Cloudy' | 'Cloudy' | 'Rain' | 'Heavy Rain' | 'Thunderstorm' | 'Snow';
  humidity: number; // Percentage
  windSpeed: number; // km/h
  windDirection: string; // e.g., "NE", "SW"
  visibility: number; // km
  precipitation: number; // mm
  forecast?: {
    nextHours: Array<{
      time: string;
      condition: string;
      precipitation: number;
    }>;
  };
}

export interface WeatherImpact {
  matchPlayable: boolean;
  pitchCondition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  recommendations: string[];
  alerts: Array<{
    severity: 'info' | 'warning' | 'danger';
    message: string;
  }>;
}

import { useState, useEffect } from "react";
import { fetchLiveWeather } from "@/services/weatherService";

interface WeatherWidgetProps {
  location: string;
  weather?: WeatherData;
  coordinates?: { lat: number; lng: number };
  showImpact?: boolean;
}

export function WeatherWidget({ location, weather: initialWeather, coordinates, showImpact = false }: WeatherWidgetProps) {
  const [weatherData, setWeatherData] = useState<WeatherData>(initialWeather || {
    temperature: 22,
    condition: 'Clear',
    humidity: 60,
    windSpeed: 15,
    windDirection: 'SE',
    visibility: 10,
    precipitation: 0
  });

  useEffect(() => {
    if (initialWeather) {
      setWeatherData(initialWeather);
      return;
    }
    let isMounted = true;
    fetchLiveWeather(location, coordinates?.lat, coordinates?.lng).then(data => {
      if (isMounted) setWeatherData(data);
    });
    return () => { isMounted = false; };
  }, [location, coordinates?.lat, coordinates?.lng, initialWeather]);

  const weather = weatherData;
  
  const getWeatherIcon = () => {
    switch (weather.condition) {
      case 'Clear': return Sun;
      case 'Partly Cloudy': return Cloud;
      case 'Cloudy': return Cloud;
      case 'Rain': return CloudRain;
      case 'Heavy Rain': return CloudRain;
      case 'Thunderstorm': return CloudRain;
      case 'Snow': return CloudSnow;
      default: return Sun;
    }
  };

  const getWeatherColor = () => {
    switch (weather.condition) {
      case 'Clear': return 'from-blue-400 to-blue-600';
      case 'Partly Cloudy': return 'from-emerald-300 to-emerald-500';
      case 'Cloudy': return 'from-gray-400 to-gray-600';
      case 'Rain':
      case 'Heavy Rain': return 'from-slate-500 to-slate-700';
      case 'Thunderstorm': return 'from-purple-600 to-purple-800';
      case 'Snow': return 'from-cyan-300 to-cyan-500';
      default: return 'from-emerald-500 to-emerald-600';
    }
  };

  const calculateImpact = (): WeatherImpact => {
    const alerts: WeatherImpact['alerts'] = [];
    const recommendations: string[] = [];
    let matchPlayable = true;
    let pitchCondition: WeatherImpact['pitchCondition'] = 'Excellent';

    // Temperature impact
    if (weather.temperature > 35) {
      alerts.push({
        severity: 'warning',
        message: 'High temperature - ensure players stay hydrated'
      });
      recommendations.push('Schedule frequent drink breaks');
      recommendations.push('Consider shorter sessions');
    }

    if (weather.temperature < 10) {
      alerts.push({
        severity: 'warning',
        message: 'Low temperature - players may need warm-up time'
      });
      recommendations.push('Extended warm-up recommended');
    }

    // Precipitation impact
    if (weather.precipitation > 10) {
      matchPlayable = false;
      pitchCondition = 'Poor';
      alerts.push({
        severity: 'danger',
        message: 'Heavy rain - match postponement recommended'
      });
      recommendations.push('Covers should be on pitch');
      recommendations.push('Monitor drainage systems');
    } else if (weather.precipitation > 2) {
      pitchCondition = 'Fair';
      alerts.push({
        severity: 'warning',
        message: 'Rain expected - match may be delayed'
      });
      recommendations.push('Have covers ready');
      recommendations.push('Monitor weather updates');
    }

    // Wind impact
    if (weather.windSpeed > 40) {
      alerts.push({
        severity: 'warning',
        message: 'Strong winds - may affect play'
      });
      recommendations.push('Secure equipment and sight screens');
      recommendations.push('Consider wind direction for bowling');
    }

    // Humidity impact
    if (weather.humidity > 80) {
      if (pitchCondition === 'Excellent') pitchCondition = 'Good';
      alerts.push({
        severity: 'info',
        message: 'High humidity - ball may swing more'
      });
    }

    // Thunderstorm
    if (weather.condition === 'Thunderstorm') {
      matchPlayable = false;
      alerts.push({
        severity: 'danger',
        message: 'Thunderstorm - suspend play immediately for safety'
      });
      recommendations.push('Move players and spectators indoors');
      recommendations.push('Wait 30 minutes after last thunder');
    }

    // Visibility
    if (weather.visibility < 5) {
      alerts.push({
        severity: 'warning',
        message: 'Poor visibility - may affect play'
      });
      recommendations.push('Consider using white ball if available');
    }

    return { matchPlayable, pitchCondition, recommendations, alerts };
  };

  const impact = showImpact ? calculateImpact() : null;
  const WeatherIcon = getWeatherIcon();

  return (
    <div className="space-y-4">
      <Card className={`bg-gradient-to-br ${getWeatherColor()} text-white border-none overflow-hidden`}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-semibold text-white/90">Current Weather</h3>
              <p className="text-sm text-white/70">{location}</p>
            </div>
            <WeatherIcon className="h-10 w-10 text-white/90 animate-pulse" />
          </div>

          <div className="flex items-end gap-2 mb-6">
            <span className="text-6xl font-bold">{weather.temperature}°</span>
            <span className="text-2xl text-white/80 mb-2">{weather.condition}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-white/90">
              <Wind className="h-4 w-4" />
              <span>{weather.windSpeed} km/h {weather.windDirection}</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Droplets className="h-4 w-4" />
              <span>{weather.humidity}% humidity</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <CloudRain className="h-4 w-4" />
              <span>{weather.precipitation}mm rain</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Eye className="h-4 w-4" />
              <span>{weather.visibility}km visibility</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {showImpact && impact && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Weather Impact Assessment</CardTitle>
              <Badge variant={impact.matchPlayable ? 'secondary' : 'destructive'}>
                {impact.matchPlayable ? 'Playable' : 'Not Playable'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Alerts */}
            {impact.alerts.length > 0 && (
              <div className="space-y-2">
                {impact.alerts.map((alert, idx) => (
                  <Alert 
                    key={idx}
                    variant={alert.severity === 'danger' ? 'destructive' : 'default'}
                    className={
                      alert.severity === 'warning' ? 'border-amber-500/20 bg-amber-500/10' :
                      alert.severity === 'info' ? 'border-emerald-500/20 bg-emerald-500/10' : ''
                    }
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{alert.message}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Pitch Condition */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm font-medium">Expected Pitch Condition:</span>
              <Badge variant={
                impact.pitchCondition === 'Excellent' ? 'secondary' :
                impact.pitchCondition === 'Good' ? 'default' :
                impact.pitchCondition === 'Fair' ? 'outline' : 'destructive'
              }>
                {impact.pitchCondition}
              </Badge>
            </div>

            {/* Recommendations */}
            {impact.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Recommendations
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {impact.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-primary flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Forecast */}
            {weather.forecast && (
              <div className="pt-3 border-t">
                <h4 className="text-sm font-medium mb-3">Next Hours Forecast</h4>
                <div className="grid grid-cols-3 gap-2">
                  {weather.forecast.nextHours.slice(0, 3).map((hour, idx) => (
                    <div key={idx} className="text-center p-2 rounded bg-muted/50">
                      <div className="text-xs text-muted-foreground">{hour.time}</div>
                      <div className="text-xs font-medium mt-1">{hour.condition}</div>
                      {hour.precipitation > 0 && (
                        <div className="text-xs text-emerald-500 mt-1">{hour.precipitation}mm</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
