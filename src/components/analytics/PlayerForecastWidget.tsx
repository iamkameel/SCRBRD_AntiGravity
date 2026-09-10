"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { predictPlayerPerformanceAction, PlayerForecast } from "@/app/actions/analyticsActions";
import { D } from "@/lib/scoring/theme";

interface PlayerForecastWidgetProps {
  playerId: string;
}

export function PlayerForecastWidget({ playerId }: PlayerForecastWidgetProps) {
  const [forecast, setForecast] = useState<PlayerForecast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      try {
        const result = await predictPlayerPerformanceAction(playerId);
        setForecast(result);
      } catch (error) {
        console.error("Failed to get forecast", error);
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      fetchForecast();
    }
  }, [playerId]);

  if (loading) return (
    <div className="rounded-[2rem] border border-blue-500/20 bg-blue-500/5 backdrop-blur-xl overflow-hidden h-40 flex items-center justify-center sh-pulse">
      <div className="flex items-center gap-3 text-blue-400/50">
        <BrainCircuit className="h-5 w-5 animate-pulse" />
        <span className="text-[10px] uppercase font-black tracking-widest" style={{ fontFamily: D.mono }}>Processing Oracle...</span>
      </div>
    </div>
  );
  if (!forecast) return null;

  return (
    <div className="rounded-[2rem] border border-blue-500/20 bg-blue-500/5 backdrop-blur-xl overflow-hidden sh-slide-up relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative p-8 border-b border-blue-500/10 flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2" style={{ fontFamily: D.mono }}>
          <BrainCircuit className="h-4 w-4" />
          Neural Prognosis
        </h3>
      </div>
      <div className="relative p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1" style={{ fontFamily: D.mono }}>Predicted {forecast.metric}</p>
            <p className="text-4xl font-black text-white tracking-tighter" style={{ fontFamily: D.head }}>{forecast.predictedValue}</p>
          </div>
          <div className="text-right">
             <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 border ${
                forecast.trend === 'Up' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                forecast.trend === 'Down' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                'bg-blue-500/10 text-blue-400 border-blue-500/20'
             }`}>
               {forecast.trend === 'Up' && <TrendingUp className="h-3 w-3" />}
               {forecast.trend === 'Down' && <TrendingDown className="h-3 w-3" />}
               {forecast.trend === 'Stable' && <Minus className="h-3 w-3" />}
               {forecast.trend} Trend
             </div>
             <p className="text-[10px] font-black text-blue-400/50 mt-2 tracking-widest uppercase" style={{ fontFamily: D.mono }}>{forecast.confidence}% Confidence</p>
          </div>
        </div>
        
        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
          <p className="text-xs text-blue-200/70 italic leading-relaxed">
            &quot;{forecast.analysis}&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
