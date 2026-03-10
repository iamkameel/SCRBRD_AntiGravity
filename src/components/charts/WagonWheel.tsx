"use client";

import { useState, MouseEvent, useRef } from 'react';
import { Innings, Over, Ball } from '@/types/firestore';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Shot {
  angle: number;
  distance: number;
  runs: number;
  shotType?: string;
  isWicket: boolean;
  batsmanId?: string;
}

interface WagonWheelProps {
  innings?: Innings;
  shots?: Shot[];
  onShotSelect?: (data: { angle: number; distance: number }) => void;
  disabled?: boolean;
}

export function WagonWheel({ innings, shots: propShots, onShotSelect, disabled }: WagonWheelProps) {
  const [filter, setFilter] = useState<string>('all'); // all, 4s, 6s, wickets, runs
  const svgRef = useRef<SVGSVGElement>(null);

  // Flatten all balls from all overs if innings is provided, otherwise use propShots
  const shots: Shot[] = propShots || (innings?.overHistory || []).flatMap((over: Over) => 
    over.balls
      .filter((ball: Ball) => (ball as any).coordinates) 
      .map((ball: Ball) => {
        const coords = (ball as any).coordinates;
        return {
          angle: coords.x, 
          distance: coords.y, 
          runs: ball.runs,
          shotType: (ball as any).shotType,
          isWicket: ball.isWicket
        };
      })
  ) || [];

  const filteredShots = shots.filter(shot => {
    if (filter === 'all') return true;
    if (filter === '4s') return shot.runs === 4;
    if (filter === '6s') return shot.runs === 6;
    if (filter === 'wickets') return shot.isWicket;
    if (filter === 'runs') return !shot.isWicket && shot.runs < 4;
    return true;
  });

  const getColor = (runs: number, isWicket: boolean) => {
    if (isWicket) return '#ef4444'; // Red
    if (runs === 6) return '#8b5cf6'; // Purple
    if (runs === 4) return '#3b82f6'; // Blue
    return '#10b981'; // Green (1s, 2s, 3s)
  };

  const getLineCoordinates = (angle: number, distance: number) => {
    const angleRad = (angle - 90) * (Math.PI / 180); 
    const radius = (distance / 100) * 150;
    
    const x = 150 + radius * Math.cos(angleRad);
    const y = 150 + radius * Math.sin(angleRad);
    
    return { x, y };
  };

  const handleClick = (e: MouseEvent<SVGSVGElement>) => {
    if (disabled || !onShotSelect || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to polar coordinates relative to center (150, 150)
    // SVG is 300x300, but might be scaled. We need to account for scaling.
    const scaleX = 300 / rect.width;
    const scaleY = 300 / rect.height;
    
    const svgX = x * scaleX;
    const svgY = y * scaleY;

    const centerX = 150;
    const centerY = 150;
    
    const dx = svgX - centerX;
    const dy = svgY - centerY;
    
    const radius = Math.sqrt(dx * dx + dy * dy);
    // Distance 0-100
    const distance = Math.min(100, (radius / 150) * 100);
    
    // Angle 0-360, 0 at top (12 o'clock)
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    onShotSelect({ angle, distance });
  };

  return (
    <div className={cn(
      "relative p-4 rounded-xl transition-all duration-300",
      "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800",
      "border border-slate-200 dark:border-slate-700",
      "shadow-inner hover:shadow-lg hover:border-emerald-500/30",
      disabled ? "opacity-50 pointer-events-none" : ""
    )} data-testid="wagon-wheel-container">
      {/* Decorative background glow */}
      <div className="absolute inset-0 bg-emerald-500/5 rounded-xl blur-xl pointer-events-none" />

      <div className="relative z-10">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => setFilter('all')} className="focus:outline-none transition-transform active:scale-95">
            <Badge variant={filter === 'all' ? 'default' : 'secondary'} className="hover:bg-primary/80">All</Badge>
          </button>
          <button onClick={() => setFilter('4s')} className="focus:outline-none transition-transform active:scale-95">
            <Badge variant={filter === '4s' ? 'default' : 'secondary'} className={filter === '4s' ? 'bg-blue-500 hover:bg-blue-600' : ''}>Fours</Badge>
          </button>
          <button onClick={() => setFilter('6s')} className="focus:outline-none transition-transform active:scale-95">
            <Badge variant={filter === '6s' ? 'default' : 'secondary'} className={filter === '6s' ? 'bg-purple-500 hover:bg-purple-600' : ''}>Sixes</Badge>
          </button>
          <button onClick={() => setFilter('wickets')} className="focus:outline-none transition-transform active:scale-95">
            <Badge variant={filter === 'wickets' ? 'default' : 'secondary'} className={filter === 'wickets' ? 'bg-red-500 hover:bg-red-600' : ''}>Wickets</Badge>
          </button>
          <button onClick={() => setFilter('singles')} className="focus:outline-none transition-transform active:scale-95">
            <Badge variant={filter === 'singles' ? 'default' : 'secondary'} className={filter === 'singles' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>Singles</Badge>
          </button>
        </div>

        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '300px', height: '300px' }}>
            <svg 
              ref={svgRef}
              width="300" 
              height="300" 
              viewBox="0 0 300 300"
              onClick={handleClick}
              style={{ cursor: onShotSelect && !disabled ? 'crosshair' : 'default' }}
              className="drop-shadow-xl"
              data-testid="wagon-wheel"
            >
              {/* Field Background - Darker Green for better contrast */}
              <circle cx="150" cy="150" r="148" fill="url(#fieldGradient)" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              
              <defs>
                <radialGradient id="fieldGradient" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.2" />
                </radialGradient>
              </defs>
              
              {/* Inner Circle (30 yards) */}
              <circle cx="150" cy="150" r="67.5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="4 4" />
              
              {/* Pitch */}
              <rect x="145" y="130" width="10" height="40" fill="rgba(255,255,255,0.3)" rx="2" />
              
              {/* Shots */}
              {filteredShots.map((shot, index) => {
                const { x, y } = getLineCoordinates(shot.angle, shot.distance);
                return (
                  <g key={index} className="hover:opacity-100 transition-opacity duration-200" data-testid="shot-marker">
                    <line 
                      x1="150" 
                      y1="150" 
                      x2={x} 
                      y2={y} 
                      stroke={getColor(shot.runs, shot.isWicket)} 
                      strokeWidth={shot.isWicket || shot.runs >= 4 ? 2.5 : 1.5}
                      opacity={0.8}
                      strokeLinecap="round"
                    />
                    {/* Dot at the end with glow */}
                    <circle cx={x} cy={y} r="3" fill={getColor(shot.runs, shot.isWicket)} className="filter drop-shadow-md" />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3b82f6', boxShadow: '0 0 4px #3b82f6' }} /> 4s
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#8b5cf6', boxShadow: '0 0 4px #8b5cf6' }} /> 6s
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 4px #ef4444' }} /> Wickets
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 4px #10b981' }} /> Runs
          </div>
        </div>
      </div>
    </div>
  );
}
