import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Shield, ChevronRight } from 'lucide-react';

export interface BallCircleItem {
  id?: string;
  label: string; // "0", "1", "2", "3", "4", "6", "W", "2Wd", "1Nb"
  type: 'dot' | 'single' | 'two' | 'three' | 'four' | 'six' | 'wicket' | 'extra';
}

export interface MatchHUDProps {
  homeTeamName: string;
  homeTeamCode?: string;
  awayTeamName: string;
  awayTeamCode?: string;
  homeColor?: string;
  awayColor?: string;
  battingTeamName: string;
  bowlingTeamName: string;
  currentInningsNumber: 1 | 2;
  runs: number;
  wickets: number;
  overs: number; // e.g. 15.4 -> 15 overs, 4 balls
  balls: number; // total balls in innings
  maxOvers?: number; // e.g. 20 or 50
  target?: number;
  crr: string | number;
  rrr?: string | number;
  striker: {
    name: string;
    runs: number;
    balls: number;
    fours?: number;
    sixes?: number;
  };
  nonStriker: {
    name: string;
    runs: number;
    balls: number;
    fours?: number;
    sixes?: number;
  };
  bowler: {
    name: string;
    overs: string | number;
    runsConceded: number;
    wickets: number;
    econ?: string | number;
  };
  currentOverBalls?: BallCircleItem[];
  phase?: 'POWERPLAY' | 'MIDDLE' | 'DEATH';
  freeHit?: boolean;
  densityMode?: 'compact' | 'standard' | 'expanded';
  matchMetadata?: {
    competition?: string;
    venue?: string;
    weather?: string;
    date?: string;
  };
}

// Map delivery type/label to high-impact broadcast color palette
export function getBallColorClass(ball: BallCircleItem) {
  const lbl = ball.label.toUpperCase();
  if (lbl === 'W' || ball.type === 'wicket') {
    return 'bg-gradient-to-br from-rose-600 to-red-700 text-white border-rose-400/50 shadow-[0_0_12px_rgba(225,29,72,0.4)] animate-pulse';
  }
  if (lbl === '6' || ball.type === 'six') {
    return 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-purple-300/60 shadow-[0_0_12px_rgba(99,102,241,0.4)] font-black scale-105';
  }
  if (lbl === '4' || ball.type === 'four') {
    return 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-cyan-300/60 shadow-[0_0_10px_rgba(6,182,212,0.4)] font-black';
  }
  if (lbl.includes('WD') || lbl.includes('NB') || ball.type === 'extra') {
    return 'bg-purple-950/80 text-purple-300 border-purple-500/40 font-bold';
  }
  if (lbl === '3') {
    return 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold';
  }
  if (lbl === '2') {
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold';
  }
  if (lbl === '1') {
    return 'bg-pink-500/20 text-pink-300 border-pink-500/40';
  }
  // Dot ball (0)
  return 'bg-white/5 text-muted-foreground border-white/10';
}

export function MatchHUD({
  homeTeamName,
  homeTeamCode = 'HOME',
  awayTeamName,
  awayTeamCode = 'AWAY',
  homeColor = '#3b82f6',
  awayColor = '#10b981',
  battingTeamName,
  bowlingTeamName,
  currentInningsNumber,
  runs,
  wickets,
  overs,
  balls,
  maxOvers = 20,
  target,
  crr,
  rrr,
  striker,
  nonStriker,
  bowler,
  currentOverBalls = [],
  phase = 'POWERPLAY',
  freeHit = false,
  densityMode = 'standard',
  matchMetadata,
}: MatchHUDProps) {

  const isChase = currentInningsNumber === 2 && target != null;
  const runsNeeded = isChase && target ? Math.max(0, target - runs) : 0;
  const totalMaxBalls = maxOvers * 6;
  const ballsRemaining = Math.max(0, totalMaxBalls - balls);
  const formattedOvers = `${Math.floor(balls / 6)}.${balls % 6}`;

  // Default mock delivery circles if none provided
  const overBallsToRender: BallCircleItem[] = currentOverBalls.length > 0
    ? currentOverBalls
    : [
        { label: '0', type: 'dot' },
        { label: '1', type: 'single' },
        { label: '4', type: 'four' },
        { label: '2Wd', type: 'extra' },
        { label: 'W', type: 'wicket' },
        { label: '6', type: 'six' },
      ];

  if (densityMode === 'compact') {
    return (
      <div className="w-full bg-slate-950/90 backdrop-blur-xl border-b border-white/10 px-4 py-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Teams & Innings */}
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] font-black uppercase tracking-wider px-2 py-0.5">
            {currentInningsNumber === 2 ? '2ND INN' : '1ST INN'}
          </Badge>
          <span className="font-extrabold tracking-tight text-white">{battingTeamName}</span>
        </div>

        {/* Score & Overs */}
        <div className="flex items-baseline gap-2">
          <span className="font-black text-2xl tracking-tighter text-white drop-shadow">
            {runs}<span className="text-muted-foreground/70 text-lg">/{wickets}</span>
          </span>
          <span className="font-mono text-muted-foreground text-xs">({formattedOvers} ov)</span>
        </div>

        {/* Active Batter & Bowler summary */}
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-emerald-400 font-bold">
            <span className="text-[10px] text-emerald-400 animate-pulse">▶</span>
            <span>{striker.name.toUpperCase()}</span>
            <span className="font-mono text-white">{striker.runs}*</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
            <span>{bowler.name}</span>
            <span className="font-mono font-semibold text-white">{bowler.wickets}/{bowler.runsConceded}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative overflow-hidden bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-white">
      {/* Background glow effects */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/10 blur-[90px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-24 right-10 w-72 h-36 bg-blue-500/10 blur-[80px] pointer-events-none rounded-full" />

      {/* Top Header Row: Match Context & Badges */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3 pb-3 border-b border-white/10">
        {/* Team Matchup Pill */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs">
          <div className="flex items-center gap-1.5 font-black tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: homeColor }} />
            <span>{homeTeamCode}</span>
          </div>
          <span className="text-muted-foreground/60 text-[10px] uppercase font-bold">vs</span>
          <div className="flex items-center gap-1.5 font-black tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: awayColor }} />
            <span>{awayTeamCode}</span>
          </div>
        </div>

        {/* Phase / Free Hit Badges */}
        <div className="flex items-center gap-2">
          {phase && (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5">
              <Activity className="w-3 h-3 mr-1 text-emerald-400" />
              {phase} PHASE
            </Badge>
          )}

          {freeHit && (
            <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/40 font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5 animate-pulse">
              <Zap className="w-3 h-3 mr-1 text-purple-300" />
              FREE HIT
            </Badge>
          )}

          <Badge className="bg-white/10 text-muted-foreground border-white/10 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
            {currentInningsNumber === 2 ? '2ND INNINGS' : '1ST INNINGS'}
          </Badge>
        </div>
      </div>

      {/* Main Broadcast Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        
        {/* Left Column: Primary Score Anchor (Cols 1-5) */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground mb-1">
            {battingTeamName}
          </div>

          {/* Core Score Display with 2.5x Size Hierarchy */}
          <div className="flex items-baseline gap-3">
            <div className="font-black text-5xl sm:text-6xl tracking-tighter text-white drop-shadow-[0_4px_20px_rgba(255,255,255,0.15)]">
              {runs}<span className="text-muted-foreground/70 text-3xl sm:text-4xl tracking-tight">/{wickets}</span>
            </div>

            <div className="flex flex-col">
              <div className="font-mono text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
                {formattedOvers} <span className="text-xs font-sans text-muted-foreground/80 uppercase font-semibold">ov</span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Max {maxOvers} Ov
              </div>
            </div>
          </div>

          {/* Run Rates & Target Info */}
          <div className="mt-2.5 flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
            <div className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
              <span className="text-muted-foreground text-[10px]">CRR </span>
              <span className="font-mono text-white text-sm font-extrabold">{crr}</span>
            </div>

            {isChase && rrr != null && (
              <div className="bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                <span className="text-amber-400/80 text-[10px]">RRR </span>
                <span className="font-mono text-amber-400 text-sm font-extrabold">{rrr}</span>
              </div>
            )}
          </div>

          {/* Chase Target Bar */}
          {isChase && target && (
            <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Target {target}</span>
              <span className="font-bold text-amber-200">
                Need <span className="font-mono font-black text-white text-sm">{runsNeeded}</span> off <span className="font-mono font-black text-white text-sm">{ballsRemaining}</span> balls
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Contestants (Batters + Bowler + Delivery Circles) (Cols 6-12) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          
          {/* Active Batters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Striker (Highlighted Green Pill & Active Indicator) */}
            <div className="relative overflow-hidden p-3 rounded-xl bg-gradient-to-br from-emerald-950/60 to-slate-900/90 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                  STRIKER
                </span>
                <span className="font-black tracking-tight text-white text-sm sm:text-base">
                  {striker.name.toUpperCase()}
                </span>
              </div>

              <div className="text-right">
                <div className="font-mono font-black text-lg text-emerald-300">
                  {striker.runs}<span className="text-xs text-emerald-400/70 font-normal">({striker.balls})</span>
                </div>
                {(striker.fours != null || striker.sixes != null) && (
                  <div className="text-[9px] font-mono text-muted-foreground">
                    {striker.fours ?? 0}x4 · {striker.sixes ?? 0}x6
                  </div>
                )}
              </div>
            </div>

            {/* Non-Striker */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-white/10 px-1.5 py-0.5 rounded">
                  NON-STRIKER
                </span>
                <span className="font-bold tracking-tight text-white/90 text-sm">
                  {nonStriker.name.toUpperCase()}
                </span>
              </div>

              <div className="text-right">
                <div className="font-mono font-extrabold text-base text-white/90">
                  {nonStriker.runs}<span className="text-xs text-muted-foreground font-normal">({nonStriker.balls})</span>
                </div>
                {(nonStriker.fours != null || nonStriker.sixes != null) && (
                  <div className="text-[9px] font-mono text-muted-foreground">
                    {nonStriker.fours ?? 0}x4 · {nonStriker.sixes ?? 0}x6
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Current Bowler & Delivery Timeline */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            
            {/* Bowler Details */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                ⚾
              </div>
              <div>
                <div className="text-xs font-black tracking-tight text-white uppercase">
                  {bowler.name}
                </div>
                <div className="font-mono text-xs font-bold text-muted-foreground">
                  <span className="text-white">{bowler.wickets}/{bowler.runsConceded}</span>
                  <span className="mx-1.5 text-white/20">|</span>
                  <span>{bowler.overs} ov</span>
                  {bowler.econ && (
                    <>
                      <span className="mx-1.5 text-white/20">|</span>
                      <span>Econ {bowler.econ}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Current Over Delivery Circles */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mr-1">THIS OVER</span>
              {overBallsToRender.map((b, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-7 h-7 rounded-full border flex items-center justify-center font-mono text-xs transition-all duration-300 shrink-0",
                    getBallColorClass(b)
                  )}
                >
                  {b.label}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Persistent Match Metadata Footer */}
      {matchMetadata && (
        <div className="mt-4 pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground font-semibold">
          <div className="flex items-center gap-2">
            {matchMetadata.competition && (
              <span className="text-white/80 font-bold">{matchMetadata.competition}</span>
            )}
            {matchMetadata.venue && (
              <>
                <span>•</span>
                <span>{matchMetadata.venue}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {matchMetadata.weather && <span>🌤 {matchMetadata.weather}</span>}
            {matchMetadata.date && (
              <>
                <span>•</span>
                <span>{matchMetadata.date}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
