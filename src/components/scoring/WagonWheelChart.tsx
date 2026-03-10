"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Shot {
  id: string;
  runs: number;
  x: number; // -100 to 100 (center is 0)
  y: number; // -100 to 100 (center is 0)
  batsmanId?: string;
}

interface WagonWheelChartProps {
  shots: Shot[];
  onPlaceShot?: (x: number, y: number, runs: number) => void;
  interactive?: boolean;
  size?: number;
}

const ZONES = [
  { name: "Fine Leg", angle: 45 },
  { name: "Square Leg", angle: 90 },
  { name: "Mid-Wicket", angle: 135 },
  { name: "Long On", angle: 180 },
  { name: "Long Off", angle: 225 },
  { name: "Cover", angle: 270 },
  { name: "Point", angle: 315 },
  { name: "Third Man", angle: 360 },
];

export function WagonWheelChart({
  shots,
  onPlaceShot,
  interactive = false,
  size = 300,
}: WagonWheelChartProps) {
  const [selectedRuns, setSelectedRuns] = useState(1);
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number } | null>(null);

  const center = size / 2;
  const radius = (size / 2) - 20;

  const getShotColor = (runs: number) => {
    switch (runs) {
      case 0: return "#9ca3af";
      case 1: return "#22c55e";
      case 2: return "#3b82f6";
      case 3: return "#8b5cf6";
      case 4: return "#f59e0b";
      case 6: return "#ef4444";
      default: return "#6b7280";
    }
  };

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive || !onPlaceShot) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left - center) / radius) * 100;
    const y = ((e.clientY - rect.top - center) / radius) * 100;

    onPlaceShot(Math.round(x), Math.round(y), selectedRuns);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setHoverPoint({ x, y });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Wagon Wheel</span>
          <Badge variant="secondary">{shots.length} shots</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {interactive && (
          <div className="flex gap-2 mb-4">
            {[0, 1, 2, 3, 4, 6].map((runs) => (
              <button
                key={runs}
                onClick={() => setSelectedRuns(runs)}
                className={cn(
                  "w-8 h-8 rounded-full text-sm font-bold transition-transform",
                  selectedRuns === runs && "ring-2 ring-offset-2 ring-primary scale-110"
                )}
                style={{ backgroundColor: getShotColor(runs), color: "white" }}
              >
                {runs}
              </button>
            ))}
          </div>
        )}

        <svg
          width={size}
          height={size}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverPoint(null)}
          className={cn(interactive && "cursor-crosshair")}
        >
          {/* Background circles */}
          <circle cx={center} cy={center} r={radius} fill="#f0fdf4" stroke="#22c55e" strokeWidth="1" />
          <circle cx={center} cy={center} r={radius * 0.66} fill="none" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="4" />
          <circle cx={center} cy={center} r={radius * 0.33} fill="none" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="4" />

          {/* Zone lines */}
          {ZONES.map((zone, i) => {
            const angleRad = (zone.angle * Math.PI) / 180;
            const x2 = center + radius * Math.cos(angleRad);
            const y2 = center + radius * Math.sin(angleRad);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke="#22c55e"
                strokeWidth="0.5"
                strokeDasharray="2"
              />
            );
          })}

          {/* Pitch rectangle */}
          <rect
            x={center - 8}
            y={center - 30}
            width={16}
            height={60}
            fill="#d4a67e"
            stroke="#a67c52"
            strokeWidth="1"
            rx="2"
          />

          {/* Shots */}
          {shots.map((shot) => {
            const x = center + (shot.x / 100) * radius;
            const y = center + (shot.y / 100) * radius;
            return (
              <g key={shot.id}>
                <line
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke={getShotColor(shot.runs)}
                  strokeWidth={shot.runs >= 4 ? 2 : 1}
                  opacity={0.7}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={shot.runs >= 4 ? 6 : 4}
                  fill={getShotColor(shot.runs)}
                />
              </g>
            );
          })}

          {/* Hover indicator */}
          {hoverPoint && interactive && (
            <circle
              cx={hoverPoint.x}
              cy={hoverPoint.y}
              r={6}
              fill={getShotColor(selectedRuns)}
              opacity={0.5}
            />
          )}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {[
            { runs: 0, label: "Dot" },
            { runs: 1, label: "Single" },
            { runs: 2, label: "Double" },
            { runs: 4, label: "Four" },
            { runs: 6, label: "Six" },
          ].map(({ runs, label }) => (
            <div key={runs} className="flex items-center gap-1 text-xs">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getShotColor(runs) }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
