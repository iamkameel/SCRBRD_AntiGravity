"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { D } from '@/lib/design-system';

export interface RadarDimension {
  key: string;
  label: string;
  current: number; // 0-100 scale
  potential: number; // 0-100 scale
}

interface PotentialVsAbilityRadarProps {
  dimensions?: RadarDimension[];
  athleteName?: string;
  className?: string;
}

const DEFAULT_DIMENSIONS: RadarDimension[] = [
  { key: 'tech', label: 'Technical Mechanics', current: 78, potential: 94 },
  { key: 'ment', label: 'Mental Composure', current: 82, potential: 96 },
  { key: 'tact', label: 'Tactical Reading', current: 70, potential: 90 },
  { key: 'phys', label: 'Physical Engine', current: 85, potential: 95 },
  { key: 'stat', label: 'Match Output', current: 75, potential: 88 },
  { key: 'will', label: 'Competitive Will', current: 88, potential: 98 },
];

export function PotentialVsAbilityRadar({
  dimensions = DEFAULT_DIMENSIONS,
  athleteName = 'Prospect Evaluation',
  className = '',
}: PotentialVsAbilityRadarProps) {
  const size = 320;
  const center = size / 2;
  const radius = center - 50;
  const total = dimensions.length;

  // Helper to convert index and value (0-100) to SVG coordinates
  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate SVG polygon points strings
  const currentPoints = dimensions
    .map((d, i) => {
      const { x, y } = getCoordinates(i, d.current);
      return `${x},${y}`;
    })
    .join(' ');

  const potentialPoints = dimensions
    .map((d, i) => {
      const { x, y } = getCoordinates(i, d.potential);
      return `${x},${y}`;
    })
    .join(' ');

  // Radial grid levels (20%, 40%, 60%, 80%, 100%)
  const levels = [20, 40, 60, 80, 100];

  return (
    <div className={`p-6 rounded-[2rem] border overflow-hidden relative shadow-2xl ${className}`} style={{ background: D.surf1, borderColor: D.border }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 block" style={{ color: D.textMuted, fontFamily: D.mono }}>
            Scouting Intelligence Radar
          </span>
          <h4 className="text-lg font-black italic uppercase tracking-tight" style={{ fontFamily: D.head, color: D.textPrimary }}>
            Current Ability <span style={{ color: D.indigo }}>vs Projected Potential</span>
          </h4>
        </div>

        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest" style={{ fontFamily: D.mono }}>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
            <span style={{ color: D.textMuted }}>Current</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
            <span style={{ color: D.indigo }}>Potential</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center relative my-2">
        <svg width={size} height={size} className="overflow-visible">
          {/* Concentric Grid Rings */}
          {levels.map((lvl) => {
            const r = (lvl / 100) * radius;
            const points = dimensions
              .map((_, i) => {
                const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
                const x = center + r * Math.cos(angle);
                const y = center + r * Math.sin(angle);
                return `${x},${y}`;
              })
              .join(' ');
            return (
              <polygon
                key={lvl}
                points={points}
                fill="none"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth="1"
                strokeDasharray={lvl === 100 ? 'none' : '3 3'}
              />
            );
          })}

          {/* Radial Axis Lines */}
          {dimensions.map((d, i) => {
            const { x, y } = getCoordinates(i, 100);
            return (
              <line
                key={d.key}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1"
              />
            );
          })}

          {/* Potential Polygon (Background Fill) */}
          <motion.polygon
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            points={potentialPoints}
            fill="rgba(99, 102, 241, 0.2)"
            stroke={D.indigo}
            strokeWidth="2.5"
            strokeDasharray="4 2"
          />

          {/* Current Ability Polygon */}
          <motion.polygon
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            points={currentPoints}
            fill="rgba(56, 189, 248, 0.25)"
            stroke="#38bdf8"
            strokeWidth="2.5"
          />

          {/* Current Vertices */}
          {dimensions.map((d, i) => {
            const { x, y } = getCoordinates(i, d.current);
            return (
              <circle
                key={`cur-${d.key}`}
                cx={x}
                cy={y}
                r="4"
                fill="#38bdf8"
                stroke="#080808"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Potential Vertices */}
          {dimensions.map((d, i) => {
            const { x, y } = getCoordinates(i, d.potential);
            return (
              <circle
                key={`pot-${d.key}`}
                cx={x}
                cy={y}
                r="3.5"
                fill={D.indigo}
                stroke="#080808"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Axis Labels */}
          {dimensions.map((d, i) => {
            const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
            const labelRadius = radius + 28;
            const lx = center + labelRadius * Math.cos(angle);
            const ly = center + labelRadius * Math.sin(angle);

            return (
              <g key={`lbl-${d.key}`}>
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-[9px] font-black uppercase tracking-wider"
                  fill={D.textMuted}
                  style={{ fontFamily: D.mono }}
                >
                  {d.label}
                </text>
                <text
                  x={lx}
                  y={ly + 11}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-[9px] font-bold"
                  fill="#38bdf8"
                  style={{ fontFamily: D.mono }}
                >
                  {d.current}% <tspan fill={D.indigo}>/ {d.potential}%</tspan>
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="pt-4 border-t flex justify-between items-center text-[10px] font-bold" style={{ borderColor: D.border, color: D.textMuted }}>
        <span>Target Peak Age: <strong className="text-white font-mono">22-25 Yrs</strong></span>
        <span>Growth Gap Index: <strong className="text-indigo-400 font-mono">+{Math.round(dimensions.reduce((acc, curr) => acc + (curr.potential - curr.current), 0) / total)}% Delta</strong></span>
      </div>
    </div>
  );
}
