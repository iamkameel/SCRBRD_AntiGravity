'use client';

import React, { useState, useMemo } from 'react';
import { ShotEventData } from './WagonWheelGrid';
import { placementFromTap, CAPTURE_PROFILE, CLOSE_POSITIONS, ClosePositionDefinition } from '@/lib/scoring/placementEngine';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter, Layers, Target, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PolarSpatialHeatmapProps {
  shots: ShotEventData[];
  batHand?: 'R' | 'L';
  className?: string;
}

export function PolarSpatialHeatmap({
  shots,
  batHand = 'R',
  className,
}: PolarSpatialHeatmapProps) {
  const [filterRuns, setFilterRuns] = useState<'all' | 'dots' | 'singles' | 'boundaries' | 'wickets'>('all');
  const [showCloseCatching, setShowCloseCatching] = useState(true);
  const [selectedHand, setSelectedHand] = useState<'R' | 'L'>(batHand);

  // SVG dimensions
  const size = 440;
  const center = size / 2;
  const maxRadius = center - 24; // boundary circle radius

  // Filter shots safely handling optional runs & isWicket properties
  const filteredShots = useMemo(() => {
    return shots.filter(shot => {
      const runs = shot.runs ?? 0;
      const isWicket = shot.isWicket ?? false;
      if (filterRuns === 'dots') return runs === 0 && !isWicket;
      if (filterRuns === 'singles') return runs >= 1 && runs <= 3 && !isWicket;
      if (filterRuns === 'boundaries') return (runs === 4 || runs === 6) && !isWicket;
      if (filterRuns === 'wickets') return isWicket;
      return true;
    });
  }, [shots, filterRuns]);

  // Derived placement for each shot
  const processedShots = useMemo(() => {
    return filteredShots.map(shot => {
      const angle = shot.angle ?? (shot as any).shotAngle ?? 0;
      const distance = shot.distance ?? (shot as any).shotDistance ?? 50;

      const placement = placementFromTap({
        angle,
        radius: distance / 100,
        batHand: selectedHand,
        profile: CAPTURE_PROFILE.FULL,
      });

      // Convert polar (theta in deg, radius 0..1) to Cartesian SVG coordinates
      const rad = (placement.theta * Math.PI) / 180;
      const svgR = placement.radius * maxRadius;
      const x = center + svgR * Math.sin(rad);
      const y = center - svgR * Math.cos(rad);

      return {
        ...shot,
        placement,
        svgX: x,
        svgY: y,
      };
    });
  }, [filteredShots, selectedHand, maxRadius, center]);

  // Polar rings thresholds (normalized 0.0 - 1.0)
  const rings = [
    { label: 'Silly', r: maxRadius * 0.15, color: 'rgba(255,255,255,0.08)' },
    { label: 'Short', r: maxRadius * 0.35, color: 'rgba(255,255,255,0.06)' },
    { label: 'Ring', r: maxRadius * 0.65, color: 'rgba(255,255,255,0.04)' },
    { label: 'Deep', r: maxRadius, color: 'rgba(255,255,255,0.02)' },
  ];

  // Close catching positions SVG coordinates
  const closePositions = useMemo(() => {
    return CLOSE_POSITIONS.map((pos: ClosePositionDefinition) => {
      let angle = pos.angleDeg;
      if (selectedHand === 'L') {
        angle = -angle; // mirror off side for left-hander
      }
      const rad = (angle * Math.PI) / 180;
      const svgR = pos.radiusFrac * maxRadius;
      return {
        ...pos,
        svgX: center + svgR * Math.sin(rad),
        svgY: center - svgR * Math.cos(rad),
      };
    });
  }, [selectedHand, maxRadius, center]);

  return (
    <div className={cn('bg-slate-950/90 border border-white/10 rounded-xl p-5 space-y-4 backdrop-blur-xl shadow-2xl', className)}>
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            Polar Spatial Heatmap & Catching Ring
          </h3>
          <p className="text-xs text-white/50 font-mono mt-0.5">
            Exact batter-relative polar distribution ($\theta, r$) & depth bands
          </p>
        </div>

        {/* Handedness Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-900 border border-white/10 rounded-lg p-1 text-xs">
          <button
            onClick={() => setSelectedHand('R')}
            className={cn('px-2.5 py-1 rounded font-bold transition-colors', selectedHand === 'R' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-white/40 hover:text-white')}
          >
            RHB
          </button>
          <button
            onClick={() => setSelectedHand('L')}
            className={cn('px-2.5 py-1 rounded font-bold transition-colors', selectedHand === 'L' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-white/40 hover:text-white')}
          >
            LHB
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-lg border border-white/5 font-mono">
          {(['all', 'dots', 'singles', 'boundaries', 'wickets'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterRuns(f)}
              className={cn(
                'px-2.5 py-1 rounded capitalize font-medium transition-colors',
                filterRuns === f ? 'bg-primary text-primary-foreground font-bold' : 'text-white/60 hover:text-white'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowCloseCatching(!showCloseCatching)}
          className={cn('h-7 text-xs border-white/10 font-mono', showCloseCatching && 'border-emerald-500/40 text-emerald-400')}
        >
          <Eye className="w-3.5 h-3.5 mr-1.5" />
          {showCloseCatching ? 'Hide' : 'Show'} Slips & Ring
        </Button>
      </div>

      {/* SVG Field Canvas */}
      <div className="relative flex justify-center items-center py-2">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-xl">
          {/* Outer Boundary Ground */}
          <circle cx={center} cy={center} r={maxRadius} fill="#06180e" stroke="#1e3a29" strokeWidth="2" />

          {/* 30-Yard Inner Ring */}
          <circle cx={center} cy={center} r={maxRadius * 0.65} fill="none" stroke="#2a4a35" strokeDasharray="4 4" strokeWidth="1.5" />

          {/* Close Catching 15m Ring */}
          <circle cx={center} cy={center} r={maxRadius * 0.35} fill="none" stroke="#3b6b4c" strokeDasharray="2 2" strokeWidth="1" />

          {/* Depth Zone Labels */}
          {rings.map((ring, idx) => (
            <g key={idx}>
              <circle cx={center} cy={center} r={ring.r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <text
                x={center}
                y={center - ring.r + 12}
                fill="rgba(255,255,255,0.25)"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {ring.label}
              </text>
            </g>
          ))}

          {/* Pitch Rectangle */}
          <rect
            x={center - 8}
            y={center - 32}
            width="16"
            height="64"
            fill="#8a633a"
            opacity="0.4"
            rx="2"
          />

          {/* Stumps & Pop crease */}
          <line x1={center - 10} y1={center + 24} x2={center + 10} y2={center + 24} stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
          <line x1={center - 10} y1={center - 24} x2={center + 10} y2={center - 24} stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />

          {/* Off / Leg Side Guide Markers */}
          <text x={center - maxRadius + 14} y={center + 4} fill="rgba(255,255,255,0.2)" fontSize="10" fontFamily="monospace">
            {selectedHand === 'R' ? 'OFF' : 'LEG'}
          </text>
          <text x={center + maxRadius - 28} y={center + 4} fill="rgba(255,255,255,0.2)" fontSize="10" fontFamily="monospace">
            {selectedHand === 'R' ? 'LEG' : 'OFF'}
          </text>

          {/* Close Catching Ring Positions */}
          {showCloseCatching &&
            closePositions.map(pos => (
              <g key={pos.name} className="opacity-75 hover:opacity-100 transition-opacity">
                <circle cx={pos.svgX} cy={pos.svgY} r="4" fill="#10b981" opacity="0.4" />
                <circle cx={pos.svgX} cy={pos.svgY} r="2" fill="#34d399" />
                <text
                  x={pos.svgX}
                  y={pos.svgY - 6}
                  fill="#a7f3d0"
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {pos.name}
                </text>
              </g>
            ))}

          {/* Plotted Shot Nodes */}
          {processedShots.map((shot, idx) => {
            const isWicket = shot.isWicket;
            const isBoundary = shot.runs === 4 || shot.runs === 6;
            const isDot = shot.runs === 0 && !isWicket;

            const nodeColor = isWicket
              ? '#ef4444' // red
              : isBoundary
              ? '#f59e0b' // amber
              : isDot
              ? '#64748b' // slate
              : '#10b981'; // emerald

            return (
              <g key={idx} className="transition-transform hover:scale-125 cursor-pointer">
                {/* Shot line from crease to pitch position */}
                <line
                  x1={center}
                  y1={center + 24}
                  x2={shot.svgX}
                  y2={shot.svgY}
                  stroke={nodeColor}
                  strokeWidth={isBoundary ? 1.5 : 1}
                  opacity={isDot ? 0.3 : 0.6}
                />
                {/* Shot End Node */}
                <circle
                  cx={shot.svgX}
                  cy={shot.svgY}
                  r={isBoundary ? 5 : isWicket ? 6 : 3.5}
                  fill={nodeColor}
                  stroke="#000000"
                  strokeWidth="1"
                />
                {isWicket && (
                  <text
                    x={shot.svgX}
                    y={shot.svgY + 3}
                    fill="#ffffff"
                    fontSize="7"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    W
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend & Stats */}
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10 text-center text-xs font-mono">
        <div className="bg-slate-900/60 p-2 rounded border border-white/5">
          <div className="text-white/40 text-[10px]">TOTAL SHOTS</div>
          <div className="text-white font-bold text-sm mt-0.5">{shots.length}</div>
        </div>
        <div className="bg-slate-900/60 p-2 rounded border border-white/5">
          <div className="text-slate-400 text-[10px]">DOTS (0s)</div>
          <div className="text-slate-300 font-bold text-sm mt-0.5">
            {shots.filter(s => s.runs === 0 && !s.isWicket).length}
          </div>
        </div>
        <div className="bg-slate-900/60 p-2 rounded border border-white/5">
          <div className="text-amber-400 text-[10px]">BOUNDARIES</div>
          <div className="text-amber-300 font-bold text-sm mt-0.5">
            {shots.filter(s => (s.runs === 4 || s.runs === 6) && !s.isWicket).length}
          </div>
        </div>
        <div className="bg-slate-900/60 p-2 rounded border border-white/5">
          <div className="text-red-400 text-[10px]">WICKETS</div>
          <div className="text-red-300 font-bold text-sm mt-0.5">
            {shots.filter(s => s.isWicket).length}
          </div>
        </div>
      </div>
    </div>
  );
}
