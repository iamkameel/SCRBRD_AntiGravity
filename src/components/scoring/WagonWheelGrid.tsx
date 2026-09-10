"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { calculateShotZone, ShotZoneInfo, getRunColor } from '@/lib/scoring/wagonWheelUtils';
import { Badge } from '@/components/ui/badge';
import { Target, Compass } from 'lucide-react';

export interface ShotEventData {
  x: number;
  y: number;
  angle: number;
  distance: number;
  zoneInfo: ShotZoneInfo;
  runs?: number;
  isWicket?: boolean;
}

interface WagonWheelGridProps {
  onShotRecorded: (shot: ShotEventData) => void;
  shotsHistory?: ShotEventData[];
  selectedRuns?: number | null;
  disabled?: boolean;
  className?: string;
}

export function WagonWheelGrid({
  onShotRecorded,
  shotsHistory = [],
  selectedRuns = null,
  disabled = false,
  className
}: WagonWheelGridProps) {
  const [activeShot, setActiveShot] = useState<ShotEventData | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number; zone: ShotZoneInfo } | null>(null);

  const handleFieldClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (disabled) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const svgX = (x / rect.width) * 400;
    const svgY = (y / rect.height) * 400;

    const centerX = 200;
    const centerY = 200;

    const dx = svgX - centerX;
    const dy = svgY - centerY;
    const distancePixels = Math.sqrt(dx * dx + dy * dy);

    const maxDistance = 185; // Boundary radius
    const distancePercent = Math.min(100, Math.round((distancePixels / maxDistance) * 100));

    let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    const roundedAngle = Math.round(angle);

    const zoneInfo = calculateShotZone(roundedAngle, distancePercent);

    const shotData: ShotEventData = {
      x: svgX,
      y: svgY,
      angle: roundedAngle,
      distance: distancePercent,
      zoneInfo,
      runs: selectedRuns !== null ? selectedRuns : undefined
    };

    setActiveShot(shotData);
    onShotRecorded(shotData);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (disabled) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const svgX = (x / rect.width) * 400;
    const svgY = (y / rect.height) * 400;

    const dx = svgX - 200;
    const dy = svgY - 200;
    const distPx = Math.sqrt(dx * dx + dy * dy);
    const distPct = Math.min(100, Math.round((distPx / 185) * 100));

    let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
    if (angle < 0) angle += 360;

    const zone = calculateShotZone(Math.round(angle), distPct);
    setHoverPos({ x: svgX, y: svgY, zone });
  };

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      {/* Field Canvas Header */}
      <div className="w-full flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <span className="text-xs uppercase font-mono tracking-widest text-slate-300">
            Interactive Wagon Wheel
          </span>
        </div>
        {activeShot && (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono text-xs">
            {activeShot.zoneInfo.zoneName} ({activeShot.distance}%)
          </Badge>
        )}
      </div>

      <div className="relative group">
        <svg
          width="380"
          height="380"
          viewBox="0 0 400 400"
          className={cn(
            "rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/10 shadow-2xl backdrop-blur-xl transition-all duration-300",
            !disabled && "cursor-crosshair hover:border-emerald-500/40"
          )}
          onClick={handleFieldClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverPos(null)}
        >
          {/* Outer Boundary Circle */}
          <circle cx="200" cy="200" r="185" fill="rgba(16, 185, 129, 0.04)" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="2" />
          
          {/* Inner 30-Yard Ring */}
          <circle cx="200" cy="200" r="95" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" strokeDasharray="5 5" />
          
          {/* Pitch Area */}
          <rect x="193" y="170" width="14" height="60" fill="rgba(255, 255, 255, 0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" rx="2" />

          {/* Sector Lines (Faint Grid) */}
          <g opacity="0.12" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1">
            <line x1="200" y1="15" x2="200" y2="385" />
            <line x1="15" y1="200" x2="385" y2="200" />
            <line x1="69" y1="69" x2="331" y2="331" />
            <line x1="331" y1="69" x2="69" y2="331" />
          </g>

          {/* Historical Shots Vector Lines */}
          {shotsHistory.map((shot, idx) => (
            <g key={idx} opacity="0.6">
              <line
                x1="200"
                y1="200"
                x2={shot.x}
                y2={shot.y}
                stroke={getRunColor(shot.runs || 0, shot.isWicket)}
                strokeWidth="1.5"
              />
              <circle
                cx={shot.x}
                cy={shot.y}
                r="4"
                fill={getRunColor(shot.runs || 0, shot.isWicket)}
              />
            </g>
          ))}

          {/* Hover Aim Target */}
          {hoverPos && !disabled && (
            <g>
              <line x1="200" y1="200" x2={hoverPos.x} y2={hoverPos.y} stroke="rgba(16, 185, 129, 0.5)" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx={hoverPos.x} cy={hoverPos.y} r="6" fill="rgba(16, 185, 129, 0.4)" stroke="#10b981" strokeWidth="1.5" />
            </g>
          )}

          {/* Active Recorded Shot Vector */}
          {activeShot && (
            <g className="transition-all duration-300">
              <line x1="200" y1="200" x2={activeShot.x} y2={activeShot.y} stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
              <circle cx={activeShot.x} cy={activeShot.y} r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              <circle cx={activeShot.x} cy={activeShot.y} r="12" fill="none" stroke="#10b981" strokeWidth="1.5" className="animate-ping" />
            </g>
          )}

          {/* Field Directional Markers */}
          <g fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="sans-serif" fontWeight="600" textAnchor="middle">
            <text x="200" y="32">LONG-OFF</text>
            <text x="200" y="378">LONG-ON</text>
            <text x="32" y="204">COVER</text>
            <text x="368" y="204">MID-WICKET</text>
          </g>
        </svg>

        {/* Hover Zone Readout */}
        {hoverPos && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-white/10 text-[11px] font-mono text-slate-300 shadow-lg pointer-events-none backdrop-blur-md">
            {hoverPos.zone.zoneName} • {hoverPos.zone.ringName}
          </div>
        )}
      </div>

      {/* Shot Metrics Bar */}
      {activeShot && (
        <div className="w-full grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-medium">Zone</div>
            <div className="font-semibold text-slate-200 truncate">{activeShot.zoneInfo.zoneName}</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-medium">Sector Ring</div>
            <div className="font-semibold text-slate-200">{activeShot.zoneInfo.ringName}</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-medium">Vector Angle</div>
            <div className="font-mono font-bold text-emerald-400">{activeShot.angle}°</div>
          </div>
        </div>
      )}
    </div>
  );
}
