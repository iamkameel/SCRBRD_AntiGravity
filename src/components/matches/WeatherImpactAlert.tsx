"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CloudRain, Sun, Zap, AlertTriangle, RefreshCw, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeatherImpactAlertProps {
  initialOversLost?: number;
  initialFirstInningsScore?: number;
  onTargetCalculated?: (newTarget: number) => void;
}

export function WeatherImpactAlert({
  initialOversLost = 0,
  initialFirstInningsScore = 185,
  onTargetCalculated
}: WeatherImpactAlertProps) {
  const [isRainActive, setIsRainActive] = useState(false);
  const [oversLost, setOversLost] = useState(initialOversLost);
  const [firstInningsScore, setFirstInningsScore] = useState(initialFirstInningsScore);
  const [dlsTarget, setDlsTarget] = useState<number | null>(null);

  const calculateDls = () => {
    // Standard simplified DLS approximation formula for 20-over T20 matches
    // Target = (First Innings Score * (20 - Overs Lost) / 20) + 1
    const totalOvers = 20;
    const revisedOvers = Math.max(5, totalOvers - oversLost);
    const parRatio = revisedOvers / totalOvers;
    const calculatedTarget = Math.floor(firstInningsScore * parRatio) + 1;
    setDlsTarget(calculatedTarget);
    if (onTargetCalculated) onTargetCalculated(calculatedTarget);
  };

  return (
    <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-100 space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Weather & DLS Impact Calculator</h3>
            <p className="text-xs text-slate-400">Rain Delay Alert & Duckworth-Lewis-Stern Target Engine</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsRainActive(!isRainActive)}
          className={cn(
            "font-mono text-xs transition-all",
            isRainActive 
              ? "bg-amber-500/20 text-amber-400 border-amber-500/40" 
              : "bg-slate-950 text-slate-400 border-white/10"
          )}
        >
          {isRainActive ? 'Rain Delay Active' : 'Weather Clear'}
        </Button>
      </div>

      {isRainActive && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-xs text-amber-200">
            <span className="font-bold">Play Suspended Due to Rain.</span> Covers deployed. DLS recalculation required prior to resumption.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* First Innings Score Input */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase text-slate-400">1st Innings Total</label>
          <Input
            type="number"
            value={firstInningsScore}
            onChange={(e) => setFirstInningsScore(Number(e.target.value))}
            className="bg-slate-950 border-white/10 text-white font-mono font-bold"
          />
        </div>

        {/* Overs Lost Input */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase text-slate-400">Overs Lost</label>
          <Input
            type="number"
            value={oversLost}
            onChange={(e) => setOversLost(Number(e.target.value))}
            className="bg-slate-950 border-white/10 text-white font-mono font-bold"
          />
        </div>

        {/* Recalculate Button */}
        <div className="flex items-end">
          <Button
            onClick={calculateDls}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider h-10"
          >
            <Zap className="w-4 h-4 mr-1.5" />
            Recalculate DLS Target
          </Button>
        </div>
      </div>

      {/* DLS Result Display */}
      {dlsTarget !== null && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono uppercase font-bold text-emerald-400">Revised DLS Target</div>
            <div className="text-2xl font-black text-white font-mono mt-0.5">
              {dlsTarget} Runs <span className="text-xs text-slate-400 font-normal">in {20 - oversLost} Overs</span>
            </div>
          </div>
          <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-mono text-xs">
            Par Rate: {((dlsTarget) / Math.max(1, 20 - oversLost)).toFixed(2)} RPO
          </Badge>
        </div>
      )}
    </Card>
  );
}
