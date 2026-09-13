"use client";

import React from "react";
import { CloudRain, Wind, Droplets, Sun, AlertTriangle } from "lucide-react";

export interface PitchWeatherTelemetry {
  venueName: string;
  temperatureC: number;
  condition: "Clear" | "Partly Cloudy" | "Overcast" | "Light Rain" | "Passing Showers";
  humidityPct: number;
  windSpeedKmh: number;
  windDirection: string;
  rainProbabilityPct: number;
  rainDelayRisk: "LOW" | "MODERATE" | "HIGH";
}

interface Props {
  weather?: PitchWeatherTelemetry;
}

export function GoogleWeatherWidget({ weather }: Props) {
  const data: PitchWeatherTelemetry = weather || {
    venueName: "St Stithians Main Oval",
    temperatureC: 22,
    condition: "Partly Cloudy",
    humidityPct: 58,
    windSpeedKmh: 14,
    windDirection: "SSE",
    rainProbabilityPct: 15,
    rainDelayRisk: "LOW",
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            {data.rainProbabilityPct > 40 ? (
              <CloudRain className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5 text-amber-400" />
            )}
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-foreground">
              Pitch Weather Telemetry
            </h4>
            <p className="text-xs text-muted-foreground">{data.venueName}</p>
          </div>
        </div>

        <div
          className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border ${
            data.rainDelayRisk === "HIGH"
              ? "bg-red-500/10 text-red-400 border-red-500/30"
              : data.rainDelayRisk === "MODERATE"
              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          }`}
        >
          {data.rainDelayRisk} RAIN RISK
        </div>
      </div>

      {/* Main Temperature & Weather Stats */}
      <div className="grid grid-cols-4 gap-3 pt-1">
        <div className="bg-secondary/40 border border-white/5 rounded-xl p-3 text-center">
          <span className="text-[10px] font-mono text-muted-foreground uppercase block">Temp</span>
          <span className="font-display font-bold text-lg text-foreground">{data.temperatureC}°C</span>
        </div>

        <div className="bg-secondary/40 border border-white/5 rounded-xl p-3 text-center">
          <span className="text-[10px] font-mono text-muted-foreground uppercase block">Wind</span>
          <span className="font-display font-bold text-sm text-foreground flex items-center justify-center gap-1 mt-1">
            <Wind className="h-3.5 w-3.5 text-sky-400" /> {data.windSpeedKmh} <span className="text-[10px] text-muted-foreground">{data.windDirection}</span>
          </span>
        </div>

        <div className="bg-secondary/40 border border-white/5 rounded-xl p-3 text-center">
          <span className="text-[10px] font-mono text-muted-foreground uppercase block">Humidity</span>
          <span className="font-display font-bold text-sm text-foreground flex items-center justify-center gap-1 mt-1">
            <Droplets className="h-3.5 w-3.5 text-blue-400" /> {data.humidityPct}%
          </span>
        </div>

        <div className="bg-secondary/40 border border-white/5 rounded-xl p-3 text-center">
          <span className="text-[10px] font-mono text-muted-foreground uppercase block">Rain Chance</span>
          <span className="font-display font-bold text-sm text-foreground flex items-center justify-center gap-1 mt-1">
            <CloudRain className="h-3.5 w-3.5 text-indigo-400" /> {data.rainProbabilityPct}%
          </span>
        </div>
      </div>

      {data.rainDelayRisk === "HIGH" && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>High chance of rain interruption! Keep DLS target calculator ready.</span>
        </div>
      )}
    </div>
  );
}
