import React from 'react';
import { buildSignals } from '@/lib/scoring/intelUtils';
import { crrStr, rrrStr, fmtOv } from './utils';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Activity } from "lucide-react";

export function LiveHeroCard({
  match,
  liveScore,
  overs,
  target,
  isChase,
  freeHit
}: {
  match: any;
  liveScore: any;
  overs: number;
  target?: number;
  isChase: boolean;
  freeHit: boolean;
}) {
  const ci = liveScore?.currentInnings;
  const sig = buildSignals(liveScore, overs, target, isChase);
  const phaseColClass = sig?.phase === 'POWERPLAY' 
    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
    : sig?.phase === 'MIDDLE' 
      ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
      : "bg-orange-500/10 text-orange-500 border-orange-500/20";

  return (
    <Card className="relative overflow-hidden bg-black/60 backdrop-blur-2xl border-border/50 shadow-2xl py-6 animate-in fade-in zoom-in-95 duration-500">
      {/* Immersive glow background */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.15)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
      
      <CardContent className="flex flex-col items-center justify-center p-0 relative z-10 px-6 text-center">
        {/* Badges Row */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          <Badge variant="outline" className="font-black text-[9px] uppercase tracking-[0.2em] border-white/10 text-muted-foreground bg-white/5">
            {liveScore?.inningsNumber === 2 ? '2nd' : '1st'} Innings · {ci?.battingTeamId === match.homeTeamId ? match.homeTeamName : match.awayTeamName}
          </Badge>
          
          {sig?.phase && (
            <Badge variant="outline" className={`font-black text-[9px] uppercase tracking-widest ${phaseColClass}`}>
              <Activity className="w-3 h-3 mr-1" />
              {sig.phase} Phase
            </Badge>
          )}

          {freeHit && (
             <Badge variant="outline" className="bg-violet-500/20 text-violet-400 border-violet-500/30 font-black text-[9px] uppercase tracking-widest animate-pulse">
                <Zap className="w-3 h-3 mr-1 fill-current" />
                Free Hit
             </Badge>
          )}
        </div>

        {/* Live Score Block */}
        <div className="font-black text-6xl md:text-7xl tracking-tighter leading-none text-foreground drop-shadow-lg mb-4">
          {ci?.runs ?? 0}<span className="text-muted-foreground/60 text-4xl md:text-5xl tracking-tight">/{ci?.wickets ?? 0}</span>
        </div>

        {/* Run Rates Block */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <span>{fmtOv(ci?.balls ?? 0)} overs</span>
          <span className="hidden sm:inline">•</span>
          <span className="text-foreground">CRR <span className="font-mono ml-1">{crrStr(ci?.runs ?? 0, ci?.balls ?? 0)}</span></span>
          
          {isChase && ci?.target && (
            <>
              <span className="hidden sm:inline">•</span>
              <span className="text-amber-500">RRR <span className="font-mono ml-1">{rrrStr(ci.target, ci.runs ?? 0, ci.balls ?? 0, overs * 6)}</span></span>
            </>
          )}
        </div>

        {/* Target Module */}
        {isChase && ci?.target && (
          <div className="mt-6 flex flex-col items-center animate-in slide-in-from-bottom-2">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/80">Target</span>
              <span className="text-xl font-mono font-black text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">{ci.target}</span>
              <div className="w-px h-6 bg-amber-500/20 mx-1" />
              <span className="text-xs font-bold text-amber-500/70 tracking-wide">
                Need {(ci.target - (ci.runs ?? 0))} off {Math.max(0, overs * 6 - (ci.balls ?? 0))}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
