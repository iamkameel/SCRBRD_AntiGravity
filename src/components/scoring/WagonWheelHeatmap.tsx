"use client";

import { useMemo } from 'react';
import { calculateShotZone, getRunColor } from '@/lib/scoring/wagonWheelUtils';
import { ShotEventData } from './WagonWheelGrid';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, PieChart, ShieldAlert } from 'lucide-react';

interface WagonWheelHeatmapProps {
  shots: ShotEventData[];
  title?: string;
  playerName?: string;
}

export function WagonWheelHeatmap({
  shots = [],
  title = "Innings Shot Heatmap",
  playerName = "Batter Performance"
}: WagonWheelHeatmapProps) {
  // Aggregate stats per sector
  const zoneStats = useMemo(() => {
    const map: Record<string, { count: number; runs: number; boundaries: number }> = {};

    shots.forEach(shot => {
      const zoneKey = shot.zoneInfo.zoneName;
      if (!map[zoneKey]) {
        map[zoneKey] = { count: 0, runs: 0, boundaries: 0 };
      }
      map[zoneKey].count += 1;
      map[zoneKey].runs += shot.runs || 0;
      if (shot.zoneInfo.isBoundary) {
        map[zoneKey].boundaries += 1;
      }
    });

    return Object.entries(map).sort((a, b) => b[1].runs - a[1].runs);
  }, [shots]);

  const totalRuns = useMemo(() => shots.reduce((acc, s) => acc + (s.runs || 0), 0), [shots]);
  const boundaryPercentage = useMemo(() => {
    if (shots.length === 0) return 0;
    const boundaryShots = shots.filter(s => s.zoneInfo.isBoundary).length;
    return Math.round((boundaryShots / shots.length) * 100);
  }, [shots]);

  return (
    <Card className="p-6 bg-slate-900/80 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl text-slate-100 space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-white">{title}</h3>
          <p className="text-xs font-medium text-slate-400">{playerName} • {shots.length} shots recorded</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono text-xs">
            {totalRuns} Runs
          </Badge>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 font-mono text-xs">
            {boundaryPercentage}% Boundaries
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Heatmap Field Canvas */}
        <div className="relative flex justify-center">
          <svg width="320" height="320" viewBox="0 0 400 400" className="rounded-2xl bg-slate-950/90 border border-white/10 shadow-inner">
            <circle cx="200" cy="200" r="185" fill="rgba(16, 185, 129, 0.03)" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="2" />
            <circle cx="200" cy="200" r="95" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="4 4" />
            <rect x="193" y="170" width="14" height="60" fill="rgba(255, 255, 255, 0.1)" rx="2" />

            {/* Density Overlay Vectors */}
            {shots.map((shot, idx) => (
              <g key={idx}>
                <line
                  x1="200"
                  y1="200"
                  x2={shot.x}
                  y2={shot.y}
                  stroke={getRunColor(shot.runs || 0, shot.isWicket)}
                  strokeWidth={shot.zoneInfo.isBoundary ? "2.5" : "1.5"}
                  opacity={shot.zoneInfo.isBoundary ? "0.85" : "0.5"}
                />
                <circle
                  cx={shot.x}
                  cy={shot.y}
                  r={shot.zoneInfo.isBoundary ? "5" : "3.5"}
                  fill={getRunColor(shot.runs || 0, shot.isWicket)}
                />
              </g>
            ))}
          </svg>
        </div>

        {/* Top Scoring Sectors Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Dominant Scoring Zones</span>
          </div>

          {zoneStats.length === 0 ? (
            <div className="text-sm text-slate-500 italic py-6 text-center">
              No shot vector telemetry available for this innings.
            </div>
          ) : (
            <div className="space-y-2.5">
              {zoneStats.slice(0, 4).map(([zoneName, stat], idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-200">{zoneName}</div>
                    <div className="text-[11px] text-slate-400">{stat.count} shots ({stat.boundaries} boundaries)</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-emerald-400 text-sm">{stat.runs} runs</div>
                    <div className="text-[10px] text-slate-500">
                      {totalRuns > 0 ? `${Math.round((stat.runs / totalRuns) * 100)}% of total` : '0%'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
