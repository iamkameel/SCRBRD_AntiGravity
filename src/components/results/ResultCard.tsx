"use client";

import { D } from "@/lib/design-system";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Star, ArrowRight, Calendar, Shield } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface ResultCardProps {
  result: {
    id: string;
    fixtureId: string;
    teamAName: string;
    teamBName: string;
    teamAScore: string;
    teamBScore: string;
    winner?: string;
    margin?: string;
    playerOfTheMatch?: string;
  };
  index: number;
}

export function ResultCard({ result, index }: ResultCardProps) {
  const winnerIsA = result.winner === result.teamAName;
  const winnerIsB = result.winner === result.teamBName;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="group relative overflow-hidden rounded-[2.5rem] border transition-all hover:shadow-2xl"
      style={{ background: D.surf1, borderColor: D.border }}
    >
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: D.gradMain }} />
      
      <div className="p-8 space-y-8">
        {/* Match Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl" style={{ background: D.surf2 }}>
                <Calendar className="w-4 h-4 text-indigo-400" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest opacity-60" style={{ color: D.textMuted }}>
                COMPLETED
             </span>
          </div>
          <Badge className="bg-green-500/10 text-green-400 border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full">
            OFFICIAL RESULT
          </Badge>
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-3 items-center gap-6">
          <div className="text-center space-y-4">
            <div className="h-20 w-20 rounded-full mx-auto flex items-center justify-center p-3 relative"
                 style={{ background: D.surf2, border: `2px solid ${winnerIsA ? D.indigo : D.border}` }}>
              <Shield className={`w-10 h-10 ${winnerIsA ? 'text-indigo-400' : 'opacity-20'}`} />
              {winnerIsA && (
                <div className="absolute -top-2 -right-2 bg-indigo-500 rounded-full p-1.5 shadow-lg">
                  <Trophy className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black uppercase tracking-tighter truncate px-2" style={{ color: winnerIsA ? D.textPrimary : D.textMuted }}>
                {result.teamAName}
              </h4>
              <p className="text-3xl font-black italic tracking-tighter" style={{ color: winnerIsA ? D.indigo : D.textPrimary }}>
                {result.teamAScore}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10">
               <span className="text-[10px] font-black italic" style={{ color: D.textMuted }}>VS</span>
            </div>
            <div className="h-[2px] w-full max-w-[40px] opacity-20" style={{ background: D.gradMain }} />
          </div>

          <div className="text-center space-y-4">
            <div className="h-20 w-20 rounded-full mx-auto flex items-center justify-center p-3 relative"
                 style={{ background: D.surf2, border: `2px solid ${winnerIsB ? D.indigo : D.border}` }}>
              <Shield className={`w-10 h-10 ${winnerIsB ? 'text-indigo-400' : 'opacity-20'}`} />
              {winnerIsB && (
                <div className="absolute -top-2 -right-2 bg-indigo-500 rounded-full p-1.5 shadow-lg">
                  <Trophy className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black uppercase tracking-tighter truncate px-2" style={{ color: winnerIsB ? D.textPrimary : D.textMuted }}>
                {result.teamBName}
              </h4>
              <p className="text-3xl font-black italic tracking-tighter" style={{ color: winnerIsB ? D.indigo : D.textPrimary }}>
                {result.teamBScore}
              </p>
            </div>
          </div>
        </div>

        {/* Verdict Bar */}
        <div className="p-4 rounded-2xl text-center relative overflow-hidden group/verdict"
             style={{ background: winnerIsA || winnerIsB ? 'rgba(99, 102, 241, 0.05)' : D.surf2 }}>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] relative z-10" style={{ color: D.textPrimary }}>
             {result.winner} <span className="opacity-60" style={{ color: D.textMuted }}>WON BY</span> {result.margin}
          </p>
        </div>

        {/* POM & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-2">
           {result.playerOfTheMatch ? (
             <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-yellow-500/60">PLAYER OF MATCH</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide truncate max-w-[120px]" style={{ color: D.textPrimary }}>
                    {result.playerOfTheMatch}
                  </span>
                </div>
             </div>
           ) : <div />}

           <Link href={`/scorecard/${result.fixtureId}`} className="w-full sm:w-auto">
             <Button className="w-full sm:w-auto h-11 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest group/btn shadow-xl shadow-indigo-500/10 hover:scale-105 transition-all"
                     style={{ background: D.indigo, color: 'white' }}>
               FULL SCORECARD
               <ArrowRight className="ml-2 w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
             </Button>
           </Link>
        </div>
      </div>
    </motion.div>
  );
}
