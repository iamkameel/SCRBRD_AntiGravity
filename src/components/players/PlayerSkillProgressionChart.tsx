"use client";

import React, { useState } from 'react';
import { D } from '@/lib/design-system';
import { DomainSkillProgression } from '@/lib/intelligence/playerHistoryEngine';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { TrendingUp, Layers, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PlayerSkillProgressionChartProps {
  skillProgression: DomainSkillProgression[];
}

interface DomainConfig {
  key: keyof DomainSkillProgression['domains'] | 'compositeIndex';
  label: string;
  color: string;
  isDomain: boolean;
}

const DOMAIN_CONFIGS: DomainConfig[] = [
  { key: 'compositeIndex', label: 'Composite Index', color: '#10b981', isDomain: false },
  { key: 'batting', label: 'Batting', color: '#3b82f6', isDomain: true },
  { key: 'bowling', label: 'Bowling', color: '#f59e0b', isDomain: true },
  { key: 'fielding', label: 'Fielding', color: '#8b5cf6', isDomain: true },
  { key: 'physical', label: 'Physical', color: '#ec4899', isDomain: true },
  { key: 'mental', label: 'Mental', color: '#14b8a6', isDomain: true },
  { key: 'tactical', label: 'Tactical', color: '#6366f1', isDomain: true },
];

export function PlayerSkillProgressionChart({ skillProgression }: PlayerSkillProgressionChartProps) {
  // Active toggles for curves
  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>({
    compositeIndex: true,
    batting: true,
    bowling: true,
    fielding: false,
    physical: false,
    mental: false,
    tactical: true,
  });

  const toggleKey = (key: string) => {
    setActiveKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Flatten data for Recharts
  const chartData = skillProgression.map((item) => ({
    season: item.season.includes('Season') ? item.season : `${item.season} Season`,
    compositeIndex: item.compositeIndex,
    batting: item.domains.batting,
    bowling: item.domains.bowling,
    fielding: item.domains.fielding,
    wicketkeeping: item.domains.wicketkeeping,
    physical: item.domains.physical,
    mental: item.domains.mental,
    tactical: item.domains.tactical,
  }));

  // Calculate overall composite growth
  const firstIndex = skillProgression[0]?.compositeIndex || 0;
  const lastIndex = skillProgression[skillProgression.length - 1]?.compositeIndex || 0;
  const delta = lastIndex - firstIndex;

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-[#22c55e]" />
            <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white" style={{ fontFamily: D.mono }}>
              Seasonal Progression Curves
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-white/40 mt-0.5">
            Compare domain trajectory across {skillProgression.length} seasons
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-[#22c55e] border-emerald-500/20 text-xs font-mono font-bold">
            {delta >= 0 ? `+${delta}` : delta} Composite Growth
          </Badge>
        </div>
      </div>

      {/* Domain Toggles */}
      <div className="flex flex-wrap items-center gap-1.5 px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-white/30 mr-1" style={{ fontFamily: D.mono }}>
          Toggle Domains:
        </span>
        {DOMAIN_CONFIGS.map((cfg) => {
          const isActive = activeKeys[cfg.key];
          return (
            <button
              key={cfg.key}
              onClick={() => toggleKey(cfg.key)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold font-mono transition-all flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-zinc-900 dark:border-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-white/40 border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: cfg.color }}
              />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Recharts Graphical Visualization */}
      <div className="h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="compositeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.15)" vertical={false} />
            <XAxis
              dataKey="season"
              fontSize={10}
              fontFamily={D.mono}
              tick={{ fill: 'currentColor', opacity: 0.6, fontWeight: 900 }}
              tickLine={false}
              axisLine={false}
              dy={5}
            />
            <YAxis
              domain={[0, 100]}
              fontSize={10}
              fontFamily={D.mono}
              tick={{ fill: 'currentColor', opacity: 0.6, fontWeight: 900 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(12,12,16,0.95)',
                borderColor: 'rgba(255,255,255,0.15)',
                borderRadius: '1rem',
                backdropFilter: 'blur(12px)',
                color: 'white',
                padding: '12px',
              }}
              labelStyle={{
                color: 'rgba(255,255,255,0.5)',
                fontFamily: D.mono,
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '6px',
              }}
            />

            {/* Composite Index Area */}
            {activeKeys.compositeIndex && (
              <Area
                type="monotone"
                dataKey="compositeIndex"
                name="Composite Index"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#compositeGrad)"
              />
            )}

            {/* Individual Domain Lines */}
            {DOMAIN_CONFIGS.filter((c) => c.isDomain && activeKeys[c.key]).map((cfg) => (
              <Line
                key={cfg.key}
                type="monotone"
                dataKey={cfg.key}
                name={cfg.label}
                stroke={cfg.color}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: '#0c0c10' }}
                activeDot={{ r: 6 }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
