'use client';

import * as React from 'react';
import { useLiveScore } from '@/hooks/useLiveScore';
import { Loader2, PlayCircle, Trophy, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { D } from '@/lib/design-system';
import { motion } from "framer-motion";

interface LiveMatchSummaryProps {
  matchId: string;
  homeTeamName: string;
  awayTeamName: string;
  className?: string;
}

export function LiveMatchSummary({ matchId, homeTeamName, awayTeamName, className }: LiveMatchSummaryProps) {
  const { liveScore, loading, error } = useLiveScore(matchId);

  if (loading) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-6 rounded-2xl border border-dashed", className)} 
           style={{ borderColor: D.border }}>
        <Loader2 className="h-5 w-5 animate-spin mb-2" style={{ color: D.indigo }} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">SYNCING LIVE TELEMETRY</span>
      </div>
    );
  }

  if (error || !liveScore) {
    return null;
  }

  const { currentInnings } = liveScore;
  const isHomeBatting = currentInnings.battingTeamName === homeTeamName || !currentInnings.battingTeamName;

  const runs = currentInnings.runs || 0;
  const wickets = currentInnings.wickets || 0;
  const overs = currentInnings.overs || 0;
  const balls = currentInnings.balls || 0;
  const displayOvers = `${overs}.${balls}`;

  const battingTeamDisplay = currentInnings.battingTeamName || (isHomeBatting ? homeTeamName : awayTeamName);
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("p-6 rounded-[2rem] border shadow-xl relative overflow-hidden", className)} 
      style={{ background: D.surf2, borderColor: D.rose + '20' }}
    >
      <div className="absolute top-0 right-0 p-4">
         <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse shadow-rose-500/50" 
                  style={{ background: D.rose, boxShadow: `0 0 10px ${D.rose}` }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: D.rose }}>LIVE SCORING</span>
         </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
         <div className="flex flex-col">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1" style={{ color: D.textMuted }}>CURRENTLY BATTING</p>
            <h4 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter" 
                style={{ fontFamily: D.head, color: D.textPrimary }}>
              {battingTeamDisplay}
            </h4>
         </div>

         <div className="flex items-center gap-6 md:gap-8">
            <div className="flex flex-col items-end">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1" style={{ color: D.textMuted }}>SCORE</p>
               <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-black italic tracking-tighter tabular-nums" style={{ color: D.textPrimary }}>{runs}</span>
                  <span className="text-xl font-black opacity-20 italic">/</span>
                  <span className="text-2xl md:text-3xl font-black italic tracking-tighter tabular-nums opacity-60" style={{ color: D.textMuted }}>{wickets}</span>
               </div>
            </div>
            
            <div className="flex flex-col items-end border-l pl-6 md:pl-8" style={{ borderColor: D.border }}>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1" style={{ color: D.textMuted }}>OVERS</p>
               <span className="text-2xl md:text-3xl font-black italic tracking-tighter tabular-nums opacity-60" style={{ color: D.textMuted }}>({displayOvers})</span>
            </div>
         </div>
      </div>
      
      {liveScore.status === 'innings_break' && (
        <div className="mt-6 flex items-center justify-center p-3 rounded-xl border border-dashed" 
             style={{ borderColor: D.border, background: D.surf1 }}>
          <Clock size={14} className="mr-3 opacity-40" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">INNINGS BREAK · NEXT SESSION IMMINENT</span>
        </div>
      )}
    </motion.div>
  );
}
