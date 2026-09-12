"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { D } from '@/lib/design-system';
import { 
  Filter, 
  Settings2, 
  Map as MapIcon, 
  Target,
  ChevronDown,
  Info
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface ScoringShot {
  angle: number; // 0-360
  distance: number; // 0-100 (percentage of radius)
  runs: number;
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
];

export function WagonWheelHeatmap({
  shots = MOCK_SHOTS,
  title = "WAGON WHEEL",
  subtitle = "Spatial Scoring Intelligence"
}: WagonWheelHeatmapProps) {
  const activeShots = shots && shots.length > 0 ? shots : MOCK_SHOTS;
  const [viewMode, setViewMode] = useState<'standard' | 'heatmap'>('standard');
  const size = 300;
  const radius = size / 2 - 10;
  const center = size / 2;

  // Zone labels
  const zones = [
    { label: 'Off Side', angle: 0 },
    { label: 'On Side', angle: 180 },
  ];

  const getCoordinates = (angle: number, distance: number) => {
    // Convert angle to radians and adjust for SVG coordinate system (0 is right)
    const rad = (angle - 90) * (Math.PI / 180);
    const d = (distance / 100) * radius;
    return {
      x: center + d * Math.cos(rad),
      y: center + d * Math.sin(rad)
    };
  };

  return (
    <Card className="bg-white dark:bg-black/60 border-zinc-200 dark:border-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase" style={{ fontFamily: D.syne }}>
            {title}
          </h2>
          <p className="text-[9px] font-black text-zinc-500 dark:text-white/40 uppercase tracking-[0.2em] mt-1">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setViewMode(viewMode === 'standard' ? 'heatmap' : 'standard')}
            className={`h-8 px-3 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
              viewMode === 'heatmap' ? 'bg-primary text-black' : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-white/40'
            }`}
          >
            {viewMode === 'heatmap' ? 'Heatmap On' : 'Standard'}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-white/40">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-8 flex flex-col items-center">
        <div className="relative group">
          <svg width={size} height={size} className="overflow-visible">
            {/* Outer Circle (Boundary) */}
            <circle 
              cx={center} cy={center} r={radius} 
              className="fill-none stroke-zinc-300 dark:stroke-white/10 stroke-[1px] group-hover:stroke-primary/40 transition-colors"
            />
            
            {/* Pitch area */}
            <rect 
              x={center - 8} y={center - 20} width={16} height={40} rx={2}
              className="fill-zinc-200 dark:fill-white/10 stroke-zinc-400 dark:stroke-white/20"
            />

            {/* Zone Dividers */}
            <line x1={center} y1={center - radius} x2={center} y2={center + radius} className="stroke-zinc-300 dark:stroke-white/5 stroke-[1px]" strokeDasharray="4 4" />
            <line x1={center - radius} y1={center} x2={center + radius} y2={center} className="stroke-zinc-300 dark:stroke-white/5 stroke-[1px]" strokeDasharray="4 4" />

            {/* Standard Lines */}
            <AnimatePresence>
              {viewMode === 'standard' && activeShots.map((shot, i) => {
                const { x, y } = getCoordinates(shot.angle, shot.distance);
                const color = shot.runs === 6 ? '#10b981' : shot.runs === 4 ? '#3b82f6' : '#94a3b8';
                return (
                  <motion.line
                    key={i}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    x1={center} y1={center} x2={x} y2={y}
                    className="stroke-[1.5px] transition-all"
                    style={{ stroke: color }}
                  />
                );
              })}
            </AnimatePresence>

            {/* Heatmap Gradients */}
            <AnimatePresence>
              {viewMode === 'heatmap' && activeShots.map((shot, i) => {
                const { x, y } = getCoordinates(shot.angle, shot.distance);
                return (
                  <motion.circle
                    key={`hit-${i}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.4 }}
                    cx={x} cy={y} r={shot.runs * 8}
                    className="fill-primary blur-xl"
                  />
                );
              })}
            </AnimatePresence>

            {/* Hit points */}
            {activeShots.map((shot, i) => {
              const { x, y } = getCoordinates(shot.angle, shot.distance);
              const color = shot.runs === 6 ? '#10b981' : shot.runs === 4 ? '#3b82f6' : '#0f172a';
              return (
                <motion.circle
                  key={`point-${i}`}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  cx={x} cy={y} r={3}
                  className="fill-zinc-900 dark:fill-white group-hover:r-[4px] transition-all cursor-pointer"
                  style={{ fill: color }}
                />
              );
            })}
          </svg>

          {/* Zone Labels overlay */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] font-black text-zinc-400 dark:text-white/20 uppercase tracking-widest">Straight</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-black text-zinc-400 dark:text-white/20 uppercase tracking-widest">Behind</span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] font-black text-zinc-400 dark:text-white/20 uppercase tracking-widest">Off Side</span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-[8px] font-black text-zinc-400 dark:text-white/20 uppercase tracking-widest">On Side</span>
          </div>
        </div>

        {/* Legend / Metrics */}
        <div className="mt-10 grid grid-cols-3 gap-6 w-full px-4">
          <div className="text-center">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Strongest</p>
            <p className="text-sm font-bold text-zinc-900 dark:text-white uppercase" style={{ fontFamily: D.syne }}>Cover Drive</p>
          </div>
          <div className="text-center border-x border-zinc-200 dark:border-white/5">
            <p className="text-[10px] font-black text-zinc-400 dark:text-white/20 uppercase tracking-widest mb-1">Efficiency</p>
            <p className="text-sm font-bold text-zinc-900 dark:text-white uppercase tabular-nums" style={{ fontFamily: D.syne }}>68% Zone Hits</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black text-zinc-400 dark:text-white/20 uppercase tracking-widest mb-1">Weakness</p>
            <p className="text-sm font-bold text-rose-500 uppercase" style={{ fontFamily: D.syne }}>Fine Leg</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
