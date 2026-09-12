"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { D } from '@/lib/design-system';
import { TrendingUp, Activity, Target } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

interface WormData {
  over: number;
  runs: number;
  isWicket?: boolean;
}

const INNINGS_1: WormData[] = [
  { over: 0, runs: 0 }, { over: 1, runs: 6 }, { over: 2, runs: 12, isWicket: true },
  { over: 3, runs: 18 }, { over: 4, runs: 22 }, { over: 5, runs: 35 },
  { over: 6, runs: 42, isWicket: true }, { over: 7, runs: 45 }, { over: 8, runs: 58 },
  { over: 9, runs: 66 }, { over: 10, runs: 82 }
];

const INNINGS_2: WormData[] = [
  { over: 0, runs: 0 }, { over: 1, runs: 4 }, { over: 2, runs: 8 },
  { over: 3, runs: 28 }, { over: 4, runs: 32, isWicket: true }, { over: 5, runs: 38 },
  { over: 6, runs: 48 }, { over: 7, runs: 52 }, { over: 8, runs: 65, isWicket: true },
  { over: 9, runs: 78 }
];

export function PerformanceWorm() {
  const width = 600;
  const height = 300;
  const padding = 40;
  
  const maxRuns = Math.max(
    ...INNINGS_1.map(d => d.runs),
    ...INNINGS_2.map(d => d.runs)
  ) + 20;

  const maxOvers = 20;

  const getX = (over: number) => padding + (over / maxOvers) * (width - padding * 2);
  const getY = (runs: number) => height - padding - (runs / maxRuns) * (height - padding * 2);

  const generateLine = (data: WormData[]) => {
    return data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.over)} ${getY(d.runs)}`).join(' ');
  };

  return (
    <Card className="bg-white dark:bg-black/60 border-zinc-200 dark:border-white/10 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase" style={{ fontFamily: D.syne }}>
              PERFORMANCE <span className="text-primary italic">WORM</span>
            </h2>
            <p className="text-[10px] font-black text-zinc-500 dark:text-white/40 uppercase tracking-[0.2em]">Relative Scoring Velocity</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-zinc-400 dark:bg-white/40" />
            <span className="text-[10px] font-black text-zinc-500 dark:text-white/40 uppercase">Innings 1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-[10px] font-black text-zinc-500 dark:text-white/40 uppercase">Innings 2</span>
          </div>
        </div>
      </div>

      <CardContent className="p-10">
        <div className="relative overflow-visible">
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((step) => (
              <line 
                key={step}
                x1={padding} y1={getY(maxRuns * step)} x2={width - padding} y2={getY(maxRuns * step)}
                className="stroke-zinc-200 dark:stroke-white/5 stroke-[1px]"
              />
            ))}

            {/* Inning 1 Line (Faded) */}
            <motion.path 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              d={generateLine(INNINGS_1)}
              className="fill-none stroke-zinc-400 dark:stroke-white stroke-[2px]"
              strokeDasharray="4 4"
            />

            {/* Inning 2 Line (Active) */}
            <motion.path 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              d={generateLine(INNINGS_2)}
              className="fill-none stroke-primary stroke-[4px] drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]"
            />

            {/* Wicket Markers */}
            {[...INNINGS_1, ...INNINGS_2].filter(d => d.isWicket).map((d, i) => (
              <motion.g key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.1 }}>
                <circle cx={getX(d.over)} cy={getY(d.runs)} r={5} className="fill-rose-500 shadow-lg" />
                <circle cx={getX(d.over)} cy={getY(d.runs)} r={8} className="stroke-rose-500 fill-none opacity-40 animate-ping" />
              </motion.g>
            ))}

            {/* Labels */}
            <text x={padding} y={height - 10} className="fill-zinc-400 dark:fill-white/20 text-[10px] font-black uppercase tracking-widest">Start</text>
            <text x={width - padding} y={height - 10} textAnchor="end" className="fill-zinc-400 dark:fill-white/20 text-[10px] font-black uppercase tracking-widest">Target</text>
          </svg>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-8">
          <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10">
            <p className="text-[10px] font-black text-zinc-500 dark:text-white/40 uppercase tracking-widest mb-2">Current RPO</p>
            <p className="text-3xl font-black text-zinc-900 dark:text-white italic tabular-nums" style={{ fontFamily: D.head }}>8.67</p>
          </div>
          <div className="p-6 rounded-3xl bg-primary/10 border border-primary/20">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Required RPO</p>
            <p className="text-3xl font-black text-primary italic tabular-nums" style={{ fontFamily: D.head }}>6.45</p>
          </div>
          <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10">
            <p className="text-[10px] font-black text-zinc-500 dark:text-white/40 uppercase tracking-widest mb-2">Win Prob (%)</p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 italic tabular-nums" style={{ fontFamily: D.head }}>72.4%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
