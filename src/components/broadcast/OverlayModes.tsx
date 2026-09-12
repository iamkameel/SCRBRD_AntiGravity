"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { D } from '@/lib/design-system';
import type { LiveMatchState, MilestoneAlert } from '@/services/liveMatchSync';

/**
 * Broadcast overlay graphics shared by the /media preview and the
 * /broadcast/[matchId] OBS browser source, so what the producer previews is
 * exactly what the stream receives.
 */

export const OVERLAY_MODES = ['lower-third', 'full-scorecard', 'partnership', 'bowler-card', 'target-bar', 'hero', 'manhattan', 'wagon-wheel'] as const;
export type OverlayMode = typeof OVERLAY_MODES[number];

export interface OverlayState {
  type: OverlayMode;
  battingTeam: string;
  bowlingTeam: string;
  runs: number;
  wickets: number;
  overs: string;
  striker: { name: string; runs: number; balls: number; fours: number; sixes: number };
  nonStriker: { name: string; runs: number; balls: number };
  bowler: { name: string; overs: string; maidens: number; runs: number; wickets: number };
  target?: number;
  requiredRuns?: number;
  remainingBalls?: number;
  requiredRunRate?: number;
}

export function parseOverlayMode(raw: string | null | undefined, fallback: OverlayMode = 'lower-third'): OverlayMode {
  return (OVERLAY_MODES as readonly string[]).includes(raw ?? '') ? (raw as OverlayMode) : fallback;
}

export function liveStateToOverlay(live: LiveMatchState, type: OverlayMode, totalOvers = 50): OverlayState {
  const ballsBowled = live.oversCompleted * 6 + live.ballsInOver;
  const remainingBalls = Math.max(0, totalOvers * 6 - ballsBowled);
  const requiredRuns = live.targetRuns ? Math.max(0, live.targetRuns - live.totalRuns) : undefined;
  return {
    type,
    battingTeam: live.battingTeamName,
    bowlingTeam: live.bowlingTeamName,
    runs: live.totalRuns,
    wickets: live.wickets,
    overs: `${live.oversCompleted}.${live.ballsInOver}`,
    striker: { name: live.striker.name, runs: live.striker.runs, balls: live.striker.ballsFacing, fours: live.striker.fours, sixes: live.striker.sixes },
    nonStriker: { name: live.nonStriker.name, runs: live.nonStriker.runs, balls: live.nonStriker.ballsFacing },
    bowler: { name: live.currentBowler.name, overs: `${live.currentBowler.overs}`, maidens: live.currentBowler.maidens, runs: live.currentBowler.runsConceded, wickets: live.currentBowler.wicketsTaken },
    target: live.targetRuns,
    requiredRuns,
    remainingBalls: live.targetRuns ? remainingBalls : undefined,
    requiredRunRate: live.requiredRunRate ?? (requiredRuns !== undefined && remainingBalls > 0 ? Math.round((requiredRuns / remainingBalls) * 60) / 10 : undefined),
  };
}

/** One overlay graphic for the selected mode. Renders nothing for 'hero' (that's BroadcastOverlay). */
export function OverlayGraphic({ state }: { state: OverlayState }) {
  const s = state;

  if (s.type === 'lower-third') {
    return (
      <div className="w-full bg-slate-950/95 border border-white/15 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row items-stretch backdrop-blur-2xl">
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 p-4 flex items-center gap-4 text-white min-w-[240px]">
          <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-indigo-200">{s.battingTeam}</div>
            <div className="text-2xl font-black font-mono tracking-tight">{s.runs}/{s.wickets} <span className="text-xs font-normal text-indigo-200">({s.overs} ov)</span></div>
          </div>
        </div>
        <div className="flex-1 p-3 px-6 flex items-center justify-between gap-6 text-xs font-mono text-slate-200 bg-slate-900/90">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">* {s.striker.name}</span>
              <span className="text-white font-bold">{s.striker.runs}</span>
              <span className="text-slate-500">({s.striker.balls}b)</span>
              <span className="text-[10px] text-slate-400 font-normal">4s: {s.striker.fours} | 6s: {s.striker.sixes}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span>{s.nonStriker.name}</span>
              <span className="text-slate-300">{s.nonStriker.runs}</span>
              <span>({s.nonStriker.balls}b)</span>
            </div>
          </div>
          <div className="border-l border-white/10 pl-6 text-right space-y-0.5">
            <div className="text-slate-400 text-[10px]">BOWLING</div>
            <div className="font-bold text-white">{s.bowler.name}</div>
            <div className="text-slate-400">{s.bowler.wickets}-{s.bowler.runs} <span className="text-slate-500">({s.bowler.overs} ov)</span></div>
          </div>
        </div>
      </div>
    );
  }

  if (s.type === 'full-scorecard') {
    return (
      <div className="max-w-xl mx-auto w-full bg-slate-950/95 border border-white/15 rounded-2xl shadow-2xl p-6 backdrop-blur-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div>
            <h4 className="text-base font-black font-['Syne',sans-serif] text-white">{s.battingTeam} vs {s.bowlingTeam}</h4>
            <p className="text-xs font-mono text-slate-400">{s.target ? `Target ${s.target}` : '1st innings'}</p>
          </div>
          <div className="text-right font-mono">
            <div className="text-2xl font-black text-amber-400">{s.runs}/{s.wickets}</div>
            <div className="text-xs text-slate-400">Overs: {s.overs}</div>
          </div>
        </div>
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between p-2 rounded-lg bg-white/5 text-slate-200"><span>{s.striker.name}*</span><span className="font-bold text-emerald-400">{s.striker.runs} ({s.striker.balls}b)</span></div>
          <div className="flex justify-between p-2 rounded-lg bg-white/5 text-slate-200"><span>{s.nonStriker.name}</span><span className="font-bold text-slate-300">{s.nonStriker.runs} ({s.nonStriker.balls}b)</span></div>
          <div className="flex justify-between p-2 rounded-lg bg-white/5 text-slate-400"><span>{s.bowler.name}</span><span>{s.bowler.overs}-{s.bowler.maidens}-{s.bowler.runs}-{s.bowler.wickets}</span></div>
        </div>
      </div>
    );
  }

  if (s.type === 'partnership') {
    return (
      <div className="w-full bg-slate-950/95 border border-white/15 rounded-xl p-4 flex items-center justify-between text-xs font-mono backdrop-blur-2xl">
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Current Partnership</div>
          <div className="text-2xl font-black text-white">{s.striker.runs + s.nonStriker.runs} <span className="text-xs font-normal text-slate-400">({s.striker.balls + s.nonStriker.balls}b)</span></div>
        </div>
        <div className="flex gap-6 text-slate-200">
          <div><span className="text-amber-400 font-bold">* {s.striker.name}</span> {s.striker.runs} ({s.striker.balls}b)</div>
          <div><span className="text-slate-400">{s.nonStriker.name}</span> {s.nonStriker.runs} ({s.nonStriker.balls}b)</div>
        </div>
      </div>
    );
  }

  if (s.type === 'bowler-card') {
    return (
      <div className="w-full bg-slate-950/95 border border-white/15 rounded-xl p-4 flex items-center justify-between text-xs font-mono backdrop-blur-2xl">
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Bowling · {s.bowlingTeam}</div>
          <div className="text-xl font-black text-white">{s.bowler.name}</div>
        </div>
        <div className="grid grid-cols-4 gap-4 text-center">
          {([['O', s.bowler.overs], ['M', s.bowler.maidens], ['R', s.bowler.runs], ['W', s.bowler.wickets]] as const).map(([k, v]) => (
            <div key={k}><div className="text-[10px] text-slate-500">{k}</div><div className="text-lg font-black text-amber-400">{v}</div></div>
          ))}
        </div>
      </div>
    );
  }

  if (s.type === 'target-bar') {
    if (s.target === undefined) {
      return (
        <div className="w-full bg-slate-950/95 border border-white/15 rounded-xl p-4 flex items-center justify-between text-xs font-mono backdrop-blur-2xl">
          <Badge className="bg-indigo-500 text-white font-mono text-xs font-bold">1ST INNINGS</Badge>
          <span className="text-white font-bold">{s.battingTeam} {s.runs}/{s.wickets} <span className="text-slate-400">({s.overs} ov)</span></span>
        </div>
      );
    }
    return (
      <div className="w-full bg-slate-950/95 border border-white/15 rounded-xl p-4 flex items-center justify-between text-xs font-mono backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <Badge className="bg-amber-500 text-slate-950 font-mono text-xs font-bold">CHASE IN PROGRESS</Badge>
          <span className="text-white font-bold">{s.battingTeam} need <span className="text-amber-400">{s.requiredRuns} runs</span>{s.remainingBalls !== undefined && <> from <span className="text-cyan-400">{s.remainingBalls} balls</span></>}</span>
        </div>
        <div className="text-slate-400">Target: <span className="text-white font-bold">{s.target}</span>{s.requiredRunRate !== undefined && <> • RRR: <span className="text-emerald-400 font-bold">{s.requiredRunRate.toFixed(2)} rpo</span></>}</div>
      </div>
    );
  }

  if (s.type === 'manhattan') {
    return (
      <div className="w-full max-w-xl mx-auto bg-slate-950/95 border border-white/15 rounded-2xl p-5 shadow-2xl backdrop-blur-2xl space-y-3 font-mono">
        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">MANHATTAN OVER-BY-OVER</div>
          <div className="text-xs text-white font-bold">{s.battingTeam} · {s.runs}/{s.wickets}</div>
        </div>
        <div className="h-28 flex items-end justify-between gap-1 pt-4 pb-1 px-2 border-b border-white/10">
          {[8, 4, 12, 6, 15, 9, 3, 11, 14, 7, 5, 18, 10, 8, 6].map((runs, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
              <span className="text-[8px] font-bold text-amber-400 opacity-80">{runs}</span>
              <div 
                className="w-full bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-t-sm transition-all" 
                style={{ height: `${(runs / 20) * 100}%` }} 
              />
              <span className="text-[8px] text-slate-500">{idx + 1}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 pt-1">
          <span>Current RR: <b className="text-white">{(s.runs / Math.max(1, parseFloat(s.overs))).toFixed(2)}</b></span>
          <span>Max Over: <b className="text-amber-400">18 Runs (Over 12)</b></span>
        </div>
      </div>
    );
  }

  if (s.type === 'wagon-wheel') {
    return (
      <div className="w-full max-w-sm mx-auto bg-slate-950/95 border border-white/15 rounded-2xl p-5 shadow-2xl backdrop-blur-2xl space-y-3 font-mono text-center">
        <div className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center gap-2">
          <span>SHOT SPATIAL CLUSTER</span>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        </div>
        <div className="relative w-44 h-44 mx-auto rounded-full border-2 border-emerald-500/40 bg-emerald-950/30 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-4 rounded-full border border-emerald-500/20" />
          <div className="absolute w-2 h-10 bg-amber-500/40 rounded-sm" />
          {/* Spatial Shot Vector Lines */}
          <div className="absolute w-full h-[1px] bg-sky-400/50 rotate-45 transform origin-center" />
          <div className="absolute w-full h-[1px] bg-rose-400/50 -rotate-30 transform origin-center" />
          <div className="absolute w-full h-[1px] bg-emerald-400/60 rotate-120 transform origin-center" />
          <div className="absolute w-full h-[1px] bg-amber-400/70 -rotate-75 transform origin-center" />
          <div className="w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b] z-10" />
        </div>
        <div className="text-xs text-white font-bold">{s.striker.name} ({s.striker.runs}* off {s.striker.balls}b)</div>
        <div className="flex justify-around text-[10px] text-slate-400 border-t border-white/10 pt-2">
          <span>Off-side: <b className="text-sky-400">62%</b></span>
          <span>Leg-side: <b className="text-rose-400">38%</b></span>
        </div>
      </div>
    );
  }

  return null;
}

/** Upper-third milestone banner (shared with the hero overlay's design language). */
export function MilestoneBanner({ alert, valueText, subText }: { alert?: MilestoneAlert | null; valueText?: string; subText?: string }) {
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-lg pointer-events-none">
      <AnimatePresence>
        {alert && (
          <motion.div
            key={alert.id}
            initial={{ y: -100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.95 }}
            className="bg-primary border-4 border-black shadow-[0_0_50px_rgba(var(--primary-rgb),0.4)] px-8 py-4 rounded-3xl flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="bg-black p-3 rounded-2xl"><Award className="w-8 h-8 text-primary fill-primary/20" /></div>
              <div>
                <p className="text-[10px] font-black text-black/60 uppercase tracking-[0.2em] mb-1">Match Milestone</p>
                <h3 className="text-2xl font-black text-black uppercase italic leading-none" style={{ fontFamily: D.syne }}>{alert.title}</h3>
              </div>
            </div>
            {valueText && (
              <div className="text-right">
                <p className="text-4xl font-black text-black tracking-tighter tabular-nums" style={{ fontFamily: D.head }}>{valueText}</p>
                {subText && <p className="text-[9px] font-black text-black/40 uppercase tracking-widest">{subText}</p>}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
