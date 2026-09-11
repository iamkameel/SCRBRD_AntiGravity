"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { D } from '@/lib/design-system';
import { 
  Users, 
  ArrowLeftRight, 
  Trophy, 
  Zap, 
  Brain, 
  Shield, 
  Target,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PlayerStats {
  name: string;
  role: string;
  avatar: string;
  domains: {
    batting: number;
    bowling: number;
    physical: number;
    tactical: number;
    mental: number;
  };
  metrics: {
    avg: number;
    sr: number;
    eco: number;
  };
}

const PLAYER_A: PlayerStats = {
  name: 'L. Peterson',
  role: 'Opener',
  avatar: 'LP',
  domains: { batting: 85, bowling: 20, physical: 75, tactical: 90, mental: 80 },
  metrics: { avg: 42.5, sr: 135.2, eco: 0 }
};

const PLAYER_B: PlayerStats = {
  name: 'R. Sharma',
  role: 'All-Rounder',
  avatar: 'RS',
  domains: { batting: 70, bowling: 82, physical: 88, tactical: 75, mental: 85 },
  metrics: { avg: 31.8, sr: 128.4, eco: 4.85 }
};

interface PlayerComparisonToolProps {
  playerA?: PlayerStats;
  playerB?: PlayerStats;
}

export function PlayerComparisonTool({ playerA, playerB }: PlayerComparisonToolProps) {
  const A = playerA || PLAYER_A;
  const B = playerB || PLAYER_B;

  const categories = ['Batting', 'Bowling', 'Physical', 'Tactical', 'Mental'];
  const size = 320;
  const center = size / 2;
  const radius = center - 40;

  const getPoint = (score: number, index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = (score / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const generatePath = (player: PlayerStats) => {
    const points = [
      player.domains.batting,
      player.domains.bowling,
      player.domains.physical,
      player.domains.tactical,
      player.domains.mental
    ].map((score, i) => getPoint(score, i, 5));
    
    return `M ${points[0].x} ${points[0].y} ` + 
           points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') + 
           ' Z';
  };

  return (
    <Card className="bg-black/60 border-white/10 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase" style={{ fontFamily: D.syne }}>
              BATTLE <span className="text-primary italic">CARD</span>
            </h2>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Cross-Player Domain Comparison</p>
          </div>
        </div>
        <Badge className="bg-white/5 text-white/40 border-white/10 px-4 py-2 font-black text-xs tracking-widest uppercase">
          Pro Comparison v1.0
        </Badge>
      </div>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x divide-white/5">
          {/* Radar Chart Section */}
          <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative">
              <svg width={size} height={size} className="overflow-visible">
                {/* Background Grid */}
                {[0.2, 0.4, 0.6, 0.8, 1].map((step) => (
                  <circle 
                    key={step} cx={center} cy={center} r={radius * step}
                    className="fill-none stroke-white/5 stroke-[1px]"
                  />
                ))}
                {/* Axis Lines */}
                {categories.map((_, i) => {
                  const p = getPoint(100, i, 5);
                  return (
                    <line 
                      key={i} x1={center} y1={center} x2={p.x} y2={p.y}
                      className="stroke-white/5 stroke-[1px]"
                    />
                  );
                })}

                {/* Player B Path (Lower Layer) */}
                <motion.path 
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.4, scale: 1 }}
                  d={generatePath(B)}
                  className="fill-emerald-500/20 stroke-emerald-500 stroke-[2px]"
                />
                {/* Player A Path (Upper Layer) */}
                <motion.path 
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.5, scale: 1 }}
                  d={generatePath(A)}
                  className="fill-primary/20 stroke-primary stroke-[3px]"
                />

                {/* Labels */}
                {categories.map((cat, i) => {
                  const p = getPoint(115, i, 5);
                  return (
                    <text 
                      key={i} x={p.x} y={p.y} 
                      className="text-[10px] font-black fill-white/40 text-center uppercase tracking-widest"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                    >
                      {cat}
                    </text>
                  );
                })}
              </svg>
            </div>

            {/* Legend */}
            <div className="flex gap-8 mt-10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-[10px] font-black text-white/60 uppercase">{A.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black text-white/60 uppercase">{B.name}</span>
              </div>
            </div>
          </div>

          {/* Metrics List Section */}
          <div className="p-8 space-y-8 bg-white/[0.01]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 rounded-2xl border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-black">{A.avatar}</AvatarFallback>
                </Avatar>
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/20">VS</div>
                <Avatar className="w-12 h-12 rounded-2xl border-2 border-emerald-500/20">
                  <AvatarFallback className="bg-emerald-500/10 text-emerald-500 font-black">{B.avatar}</AvatarFallback>
                </Avatar>
              </div>
              <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase font-black text-[9px] px-3 tracking-tighter">H2H ANALYSIS</Badge>
            </div>

            <div className="space-y-6">
              {[
                { label: 'Batting Avg', unit: 'runs', a: A.metrics.avg, b: B.metrics.avg },
                { label: 'Strike Rate', unit: '%', a: A.metrics.sr, b: B.metrics.sr },
                { label: 'Economy', unit: 'rpo', a: A.metrics.eco || '-', b: B.metrics.eco },
              ].map((row, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-white/30 tracking-widest">
                    <span className={Number(row.a) > Number(row.b) ? 'text-primary' : ''}>{row.a} {row.unit}</span>
                    <span className="text-white/20">{row.label}</span>
                    <span className={Number(row.b) > Number(row.a) ? 'text-emerald-400' : ''}>{row.b} {row.unit}</span>
                  </div>
                  <div className="h-1.5 w-full flex gap-1 rounded-full overflow-hidden">
                    <div className="flex-1 bg-white/5 rounded-l-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${(Number(row.a) / (Number(row.a) + Number(row.b))) * 100}%` }}
                        className="h-full bg-primary float-right"
                      />
                    </div>
                    <div className="flex-1 bg-white/5 rounded-r-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${(Number(row.b) / (Number(row.a) + Number(row.b))) * 100}%` }}
                        className="h-full bg-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/5">
              <h3 className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">Coach Insight</h3>
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex gap-3">
                <Zap className="w-4 h-4 text-primary shrink-0" />
                <p className="text-[11px] font-bold text-white/60 leading-relaxed uppercase tracking-tight">
                  {A.name} offers superior tactical awareness for early phases, while {B.name} provides unmatched physical durability in middle overs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
