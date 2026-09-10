"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tv, Play, Copy, ExternalLink, Layers, Check, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { liveMatchSync, LiveMatchState } from '@/services/liveMatchSync';

export interface OverlayState {
  type: 'lower-third' | 'full-scorecard' | 'partnership' | 'bowler-card' | 'target-bar';
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
}

const DEFAULT_OVERLAY: OverlayState = {
  type: 'lower-third',
  battingTeam: 'St John\'s 1st XI',
  bowlingTeam: 'KES 1st XI',
  runs: 184,
  wickets: 4,
  overs: '34.2',
  striker: { name: 'Aidan Smith', runs: 78, balls: 64, fours: 9, sixes: 2 },
  nonStriker: { name: 'Luke Davies', runs: 34, balls: 42 },
  bowler: { name: 'B. Hendricks', overs: '6.2', maidens: 1, runs: 28, wickets: 2 },
  target: 245,
  requiredRuns: 61,
  remainingBalls: 94
};

export function BroadcastOverlayEngine() {
  const [overlay, setOverlay] = useState<OverlayState>(DEFAULT_OVERLAY);
  const [chromaKeyMode, setChromaKeyMode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = liveMatchSync.subscribe((liveState: LiveMatchState) => {
      setOverlay(prev => ({
        ...prev,
        battingTeam: liveState.battingTeamName,
        bowlingTeam: liveState.bowlingTeamName,
        runs: liveState.totalRuns,
        wickets: liveState.wickets,
        overs: `${liveState.oversCompleted}.${liveState.ballsInOver}`,
        striker: {
          name: liveState.striker.name,
          runs: liveState.striker.runs,
          balls: liveState.striker.ballsFacing,
          fours: liveState.striker.fours,
          sixes: liveState.striker.sixes,
        },
        nonStriker: {
          name: liveState.nonStriker.name,
          runs: liveState.nonStriker.runs,
          balls: liveState.nonStriker.ballsFacing,
        },
        bowler: {
          name: liveState.currentBowler.name,
          overs: `${liveState.currentBowler.overs}`,
          maidens: liveState.currentBowler.maidens,
          runs: liveState.currentBowler.runsConceded,
          wickets: liveState.currentBowler.wicketsTaken,
        },
        target: liveState.targetRuns,
        requiredRuns: liveState.targetRuns ? liveState.targetRuns - liveState.totalRuns : undefined,
      }));
    });
    return () => unsubscribe();
  }, []);

  const handleCopyObsUrl = () => {
    navigator.clipboard.writeText('https://scrbrd.app/overlay/obs?matchId=fix-1st-xi-kes&chroma=true');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white font-['Syne',sans-serif] tracking-tight">Broadcast & Stream Overlay Engine</h2>
              <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-mono text-[10px]">
                OBS / vMix Ready
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Real-time graphic overlays for live school match streaming & video production.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setChromaKeyMode(!chromaKeyMode)}
            className={cn(
              "text-xs font-mono transition-all",
              chromaKeyMode ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" : "bg-slate-950 text-slate-400 border-white/10"
            )}
          >
            Chroma Key (Green Screen): {chromaKeyMode ? 'ON' : 'OFF'}
          </Button>

          <Button
            size="sm"
            onClick={handleCopyObsUrl}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copied ? 'URL Copied!' : 'Copy OBS Browser Source URL'}
          </Button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-wrap gap-2">
        {(['lower-third', 'full-scorecard', 'partnership', 'bowler-card', 'target-bar'] as const).map(mode => (
          <Button
            key={mode}
            size="sm"
            variant="outline"
            onClick={() => setOverlay(prev => ({ ...prev, type: mode }))}
            className={cn(
              "text-xs font-mono uppercase tracking-wider transition-all",
              overlay.type === mode 
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold" 
                : "bg-slate-950 text-slate-400 border-white/10"
            )}
          >
            {mode.replace('-', ' ')}
          </Button>
        ))}
      </div>

      {/* Broadcast Preview Screen Container */}
      <div className="space-y-2">
        <div className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
          <span>Live Broadcast Viewport Preview</span>
          <span className="text-[10px] text-indigo-400">1920 x 1080 (16:9 HD)</span>
        </div>

        <div className={cn(
          "w-full h-80 rounded-2xl relative overflow-hidden border border-white/10 flex flex-col justify-end p-6 transition-all",
          chromaKeyMode ? "bg-[#00FF00]" : "bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40"
        )}>
          {/* Simulated Match Backdrop (if chroma off) */}
          {!chromaKeyMode && (
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
          )}

          {/* LOWER THIRD OVERLAY GRAPHIC */}
          {overlay.type === 'lower-third' && (
            <div className="w-full bg-slate-950/95 border border-white/15 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row items-stretch backdrop-blur-2xl animate-fade-in">
              {/* Left Score Block */}
              <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 p-4 flex items-center gap-4 text-white min-w-[240px]">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-indigo-200">{overlay.battingTeam}</div>
                  <div className="text-2xl font-black font-mono tracking-tight">{overlay.runs}/{overlay.wickets} <span className="text-xs font-normal text-indigo-200">({overlay.overs} ov)</span></div>
                </div>
              </div>

              {/* Right Batter & Bowler Details */}
              <div className="flex-1 p-3 px-6 flex items-center justify-between gap-6 text-xs font-mono text-slate-200 bg-slate-900/90">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">* {overlay.striker.name}</span>
                    <span className="text-white font-bold">{overlay.striker.runs}</span>
                    <span className="text-slate-500">({overlay.striker.balls}b)</span>
                    <span className="text-[10px] text-slate-400 font-normal">4s: {overlay.striker.fours} | 6s: {overlay.striker.sixes}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span>{overlay.nonStriker.name}</span>
                    <span className="text-slate-300">{overlay.nonStriker.runs}</span>
                    <span>({overlay.nonStriker.balls}b)</span>
                  </div>
                </div>

                <div className="border-l border-white/10 pl-6 text-right space-y-0.5">
                  <div className="text-slate-400 text-[10px]">BOWLING</div>
                  <div className="font-bold text-white">{overlay.bowler.name}</div>
                  <div className="text-slate-400">{overlay.bowler.wickets}-{overlay.bowler.runs} <span className="text-slate-500">({overlay.bowler.overs} ov)</span></div>
                </div>
              </div>
            </div>
          )}

          {/* FULL SCORECARD OVERLAY GRAPHIC */}
          {overlay.type === 'full-scorecard' && (
            <div className="max-w-xl mx-auto w-full bg-slate-950/95 border border-white/15 rounded-2xl shadow-2xl p-6 backdrop-blur-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div>
                  <h4 className="text-base font-black font-['Syne',sans-serif] text-white">{overlay.battingTeam} vs {overlay.bowlingTeam}</h4>
                  <p className="text-xs font-mono text-slate-400">1st XI T20 / 50-Over School Derby</p>
                </div>
                <div className="text-right font-mono">
                  <div className="text-2xl font-black text-amber-400">{overlay.runs}/{overlay.wickets}</div>
                  <div className="text-xs text-slate-400">Overs: {overlay.overs}</div>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between p-2 rounded-lg bg-white/5 text-slate-200">
                  <span>{overlay.striker.name}*</span>
                  <span className="font-bold text-emerald-400">{overlay.striker.runs} ({overlay.striker.balls}b)</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-white/5 text-slate-200">
                  <span>{overlay.nonStriker.name}</span>
                  <span className="font-bold text-slate-300">{overlay.nonStriker.runs} ({overlay.nonStriker.balls}b)</span>
                </div>
              </div>
            </div>
          )}

          {/* TARGET CHASE BAR OVERLAY */}
          {overlay.type === 'target-bar' && (
            <div className="w-full bg-slate-950/95 border border-white/15 rounded-xl p-4 flex items-center justify-between text-xs font-mono backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <Badge className="bg-amber-500 text-slate-950 font-mono text-xs font-bold">CHASE IN PROGRESS</Badge>
                <span className="text-white font-bold">{overlay.battingTeam} need <span className="text-amber-400">{overlay.requiredRuns} runs</span> from <span className="text-cyan-400">{overlay.remainingBalls} balls</span></span>
              </div>
              <div className="text-slate-400">Target: <span className="text-white font-bold">{overlay.target}</span> • RRR: <span className="text-emerald-400 font-bold">2.23 rpo</span></div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
