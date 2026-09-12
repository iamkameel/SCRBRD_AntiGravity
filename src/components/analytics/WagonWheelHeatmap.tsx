"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { D } from '@/lib/design-system';
import { 
  Filter, 
  Target,
  Flame,
  BarChart2
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateSectorDistribution } from '@/lib/analytics/analyticsMath';

export interface ScoringShot {
  angle: number; // 0-360
  distance: number; // 0-100 (percentage of radius)
  runs: number;
  isWicket?: boolean;
}

interface WagonWheelHeatmapProps {
  shots?: ScoringShot[];
  title?: string;
  subtitle?: string;
}

const MOCK_SHOTS: ScoringShot[] = [
  { angle: 45, distance: 80, runs: 4 },
  { angle: 30, distance: 90, runs: 6 },
  { angle: 210, distance: 40, runs: 1 },
  { angle: 180, distance: 50, runs: 2 },
  { angle: 10, distance: 85, runs: 4 },
  { angle: 320, distance: 30, runs: 1 },
  { angle: 280, distance: 75, runs: 4 },
  { angle: 135, distance: 35, runs: 0, isWicket: true },
  { angle: 55, distance: 95, runs: 6 },
];

export function WagonWheelHeatmap({
  shots = MOCK_SHOTS,
  title = "WAGON WHEEL INTELLIGENCE",
  subtitle = "Spatial Shot Telemetry & Heatmap"
}: WagonWheelHeatmapProps) {
  const activeShots = shots && shots.length > 0 ? shots : MOCK_SHOTS;
  const [viewMode, setViewMode] = useState<'standard' | 'heatmap'>('standard');
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'boundaries' | '4s' | '6s' | 'dots'>('all');

  const filteredShots = useMemo(() => {
    return activeShots.filter((shot) => {
      if (outcomeFilter === 'boundaries') return shot.runs >= 4;
      if (outcomeFilter === '4s') return shot.runs === 4;
      if (outcomeFilter === '6s') return shot.runs === 6;
      if (outcomeFilter === 'dots') return shot.runs === 0;
      return true;
    });
  }, [activeShots, outcomeFilter]);

  const sectorDistribution = useMemo(() => {
    const balls = activeShots.map((s, idx) => ({
      overNumber: 1,
      ballNumber: idx + 1,
      runs: s.runs,
      angle: s.angle,
      distance: s.distance,
      isWicket: s.isWicket,
    }));
    return calculateSectorDistribution(balls);
  }, [activeShots]);

  const size = 320;
  const radius = size / 2 - 12;
  const center = size / 2;

  const getCoordinates = (angle: number, distance: number) => {
    const rad = (angle - 90) * (Math.PI / 180);
    const d = (distance / 100) * radius;
    return {
      x: center + d * Math.cos(rad),
      y: center + d * Math.sin(rad)
    };
  };

  return (
    <Card className="bg-zinc-950 border-white/10 text-white rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl">
      <div className="p-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tighter uppercase" style={{ fontFamily: D.syne }}>
            {title}
          </h2>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Outcome Filter Buttons */}
          {(['all', 'boundaries', '4s', '6s', 'dots'] as const).map((filter) => (
            <Button
              key={filter}
              variant="ghost"
              size="sm"
              onClick={() => setOutcomeFilter(filter)}
              className={`h-7 px-2.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                outcomeFilter === filter
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {filter}
            </Button>
          ))}

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setViewMode(viewMode === 'standard' ? 'heatmap' : 'standard')}
            className={`h-7 px-3 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
              viewMode === 'heatmap' ? 'bg-primary text-black font-bold' : 'bg-white/5 text-white/50'
            }`}
          >
            {viewMode === 'heatmap' ? 'Heatmap On' : 'Standard'}
          </Button>
        </div>
      </div>

      <CardContent className="p-8 flex flex-col items-center">
        <div className="relative group">
          <svg width={size} height={size} className="overflow-visible">
            {/* Outer Circle (Boundary) */}
            <circle 
              cx={center} cy={center} r={radius} 
              className="fill-none stroke-white/15 stroke-[1.5px] group-hover:stroke-primary/50 transition-colors"
            />
            
            {/* Inner Ring (30-yard circle) */}
            <circle 
              cx={center} cy={center} r={radius * 0.45} 
              className="fill-none stroke-white/10 stroke-[1px]" strokeDasharray="3 3"
            />

            {/* Pitch area */}
            <rect 
              x={center - 8} y={center - 22} width={16} height={44} rx={2}
              className="fill-amber-900/20 stroke-amber-500/30 stroke-[1px]"
            />

            {/* Sector Dividers */}
            <line x1={center} y1={center - radius} x2={center} y2={center + radius} className="stroke-white/5 stroke-[1px]" strokeDasharray="4 4" />
            <line x1={center - radius} y1={center} x2={center + radius} y2={center} className="stroke-white/5 stroke-[1px]" strokeDasharray="4 4" />

            {/* Standard Lines */}
            <AnimatePresence>
              {viewMode === 'standard' && filteredShots.map((shot, i) => {
                const { x, y } = getCoordinates(shot.angle, shot.distance);
                const color = shot.isWicket ? '#ef4444' : shot.runs === 6 ? '#10b981' : shot.runs === 4 ? '#3b82f6' : '#94a3b8';
                return (
                  <motion.line
                    key={i}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.7 }}
                    x1={center} y1={center} x2={x} y2={y}
                    className="stroke-[1.5px] transition-all"
                    style={{ stroke: color }}
                  />
                );
              })}
            </AnimatePresence>

            {/* Heatmap Gradients */}
            <AnimatePresence>
              {viewMode === 'heatmap' && filteredShots.map((shot, i) => {
                const { x, y } = getCoordinates(shot.angle, shot.distance);
                return (
                  <motion.circle
                    key={`hit-${i}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.4 }}
                    cx={x} cy={y} r={Math.max(6, shot.runs * 8)}
                    className="fill-emerald-400 blur-lg"
                  />
                );
              })}
            </AnimatePresence>

            {/* Hit points */}
            {filteredShots.map((shot, i) => {
              const { x, y } = getCoordinates(shot.angle, shot.distance);
              const color = shot.isWicket ? '#ef4444' : shot.runs === 6 ? '#10b981' : shot.runs === 4 ? '#3b82f6' : '#ffffff';
              return (
                <motion.circle
                  key={`point-${i}`}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  cx={x} cy={y} r={shot.isWicket ? 5 : 3.5}
                  className="group-hover:r-[5px] transition-all cursor-pointer"
                  style={{ fill: color }}
                />
              );
            })}
          </svg>

          {/* Zone Labels overlay */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] font-black text-white/30 uppercase tracking-widest">Straight</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-black text-white/30 uppercase tracking-widest">Behind</span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] font-black text-white/30 uppercase tracking-widest">Off Side</span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-[8px] font-black text-white/30 uppercase tracking-widest">On Side</span>
          </div>
        </div>

        {/* Sector Distribution List */}
        <div className="mt-8 w-full space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-white/40 uppercase tracking-wider">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <span>Dominant Sector Distribution</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {sectorDistribution.slice(0, 4).map((sec, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white">{sec.sector}</div>
                  <div className="text-[10px] text-white/40">{sec.shotsCount} shots ({sec.boundaryCount} boundaries)</div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-emerald-400">{sec.runsScored} runs</div>
                  <div className="text-[10px] text-white/30">{sec.percentageOfRuns}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
