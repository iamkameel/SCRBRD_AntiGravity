"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Droplets, Sun, Gauge, Layers, 
  Wind, ShieldCheck, RefreshCw, Activity 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PitchConditionState {
  hardness: number; // 1-10 scale
  moisturePercent: number; // 0-100%
  grassCover: 'Bare' | 'Light' | 'Moderate' | 'Heavy';
  crackDensity: 'None' | 'Hairline' | 'Noticeable' | 'Severe';
  outfieldPace: 'Slow' | 'Medium' | 'Fast' | 'Rapid';
  expectedBehavior: string;
  lastUpdated: string;
}

const DEFAULT_PITCH_STATE: PitchConditionState = {
  hardness: 8,
  moisturePercent: 35,
  grassCover: 'Moderate',
  crackDensity: 'Hairline',
  outfieldPace: 'Fast',
  expectedBehavior: 'Good carry and bounce early. Spin expected to emerge from Day 2/Latter overs.',
  lastUpdated: 'Just now (Groundskeeper Sign-off)'
};

interface PitchConditionMatrixProps {
  initialState?: Partial<PitchConditionState>;
  onStateChange?: (state: PitchConditionState) => void;
  readOnly?: boolean;
}

export function PitchConditionMatrix({
  initialState,
  onStateChange,
  readOnly = false
}: PitchConditionMatrixProps) {
  const [pitchState, setPitchState] = useState<PitchConditionState>({
    ...DEFAULT_PITCH_STATE,
    ...initialState
  });

  const updateState = (updates: Partial<PitchConditionState>) => {
    if (readOnly) return;
    const newState = { ...pitchState, ...updates, lastUpdated: 'Just now' };
    setPitchState(newState);
    if (onStateChange) onStateChange(newState);
  };

  return (
    <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Pitch & Surface Condition Matrix</h3>
            <p className="text-xs text-slate-400">Groundskeeper Assessment & Outfield Telemetry</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono text-xs">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          {pitchState.lastUpdated}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Surface Hardness */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-emerald-400" />
              Hardness
            </span>
            <span className="font-mono text-lg font-bold text-emerald-400">{pitchState.hardness}/10</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/10">
            <div 
              className="bg-emerald-400 h-full transition-all duration-300" 
              style={{ width: `${pitchState.hardness * 10}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            {pitchState.hardness >= 8 ? 'Firm & True Bounce' : pitchState.hardness >= 5 ? 'Standard Hardness' : 'Soft Surface'}
          </div>
        </div>

        {/* Moisture Level */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-blue-400" />
              Moisture
            </span>
            <span className="font-mono text-lg font-bold text-blue-400">{pitchState.moisturePercent}%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/10">
            <div 
              className="bg-blue-400 h-full transition-all duration-300" 
              style={{ width: `${pitchState.moisturePercent}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            {pitchState.moisturePercent > 50 ? 'Damp / Seam Movement' : pitchState.moisturePercent > 25 ? 'Optimal Moisture' : 'Dry Surface'}
          </div>
        </div>

        {/* Grass Cover */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-amber-400" />
            Grass Cover
          </span>
          <div className="font-bold text-base text-slate-200">{pitchState.grassCover}</div>
          <div className="flex gap-1 pt-1">
            {(['Bare', 'Light', 'Moderate', 'Heavy'] as const).map(cover => (
              <button
                key={cover}
                disabled={readOnly}
                onClick={() => updateState({ grassCover: cover })}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-mono transition-all",
                  pitchState.grassCover === cover 
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                    : "bg-slate-950 text-slate-500 hover:text-slate-300"
                )}
              >
                {cover[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Outfield Pace */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-purple-400" />
            Outfield Pace
          </span>
          <div className="font-bold text-base text-purple-400">{pitchState.outfieldPace}</div>
          <div className="flex gap-1 pt-1">
            {(['Slow', 'Medium', 'Fast', 'Rapid'] as const).map(pace => (
              <button
                key={pace}
                disabled={readOnly}
                onClick={() => updateState({ outfieldPace: pace })}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-mono transition-all",
                  pitchState.outfieldPace === pace 
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" 
                    : "bg-slate-950 text-slate-500 hover:text-slate-300"
                )}
              >
                {pace}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expected Match Behavior Summary */}
      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
        <Activity className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-mono uppercase font-bold text-emerald-400">Match Behavior Forecast</div>
          <div className="text-xs text-slate-300 mt-0.5">{pitchState.expectedBehavior}</div>
        </div>
      </div>
    </Card>
  );
}
