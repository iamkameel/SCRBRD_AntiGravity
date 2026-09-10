"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Swords, Calendar, TrendingUp, ShieldCheck, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SchoolRivalryProfile {
  schoolA: { id: string; name: string; shortName: string; wins: number; avgScore: number; crestUrl?: string };
  schoolB: { id: string; name: string; shortName: string; wins: number; avgScore: number; crestUrl?: string };
  draws: number;
  totalMatches: number;
  trophyName: string;
  currentHolder: string;
  lastEncounters: Array<{ date: string; venue: string; winner: string; margin: string; scoreA: string; scoreB: string }>;
}

const DEFAULT_RIVALRY: SchoolRivalryProfile = {
  schoolA: { id: 's1', name: 'St John\'s College', shortName: 'St John\'s', wins: 24, avgScore: 215 },
  schoolB: { id: 's2', name: 'King Edward VII School', shortName: 'KES', wins: 21, avgScore: 208 },
  draws: 5,
  totalMatches: 50,
  trophyName: 'The Founders Shield',
  currentHolder: 'St John\'s College',
  lastEncounters: [
    { date: '15 Feb 2026', venue: 'St John\'s Oval', winner: 'St John\'s College', margin: 'by 4 wickets', scoreA: '224/6', scoreB: '220/10' },
    { date: '10 Nov 2025', venue: 'KES Oval', winner: 'King Edward VII School', margin: 'by 18 runs', scoreA: '192/10', scoreB: '210/8' },
    { date: '04 Mar 2025', venue: 'St John\'s Oval', winner: 'St John\'s College', margin: 'by 32 runs', scoreA: '245/7', scoreB: '213/10' },
  ]
};

export function HeadToHeadAnalytics({ rivalry = DEFAULT_RIVALRY }: { rivalry?: SchoolRivalryProfile }) {
  const schoolAWinPct = Math.round((rivalry.schoolA.wins / rivalry.totalMatches) * 100);
  const schoolBWinPct = Math.round((rivalry.schoolB.wins / rivalry.totalMatches) * 100);
  const drawPct = 100 - schoolAWinPct - schoolBWinPct;

  return (
    <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-100 space-y-6">
      {/* Derby Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3 text-center md:text-left">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-white font-['Syne',sans-serif] tracking-tight">Institutional Derby Analytics</h3>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-mono text-[10px]">
                <Flame className="w-3 h-3 mr-1" />
                Historic Rivalry
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{rivalry.totalMatches} Matches Played • {rivalry.trophyName}</p>
          </div>
        </div>

        {/* Current Trophy Holder */}
        <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="text-xs">
            <span className="text-slate-400">Current Holder: </span>
            <span className="font-bold text-amber-400">{rivalry.currentHolder}</span>
          </div>
        </div>
      </div>

      {/* Head-to-Head Win Distribution Bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-400">{rivalry.schoolA.name}</span>
            <span className="text-slate-400">({rivalry.schoolA.wins} Wins - {schoolAWinPct}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">({rivalry.schoolB.wins} Wins - {schoolBWinPct}%)</span>
            <span className="font-bold text-blue-400">{rivalry.schoolB.name}</span>
          </div>
        </div>

        {/* Stacked Ratio Bar */}
        <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex border border-white/10">
          <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${schoolAWinPct}%` }} />
          <div className="bg-slate-700 h-full transition-all duration-500" style={{ width: `${drawPct}%` }} />
          <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${schoolBWinPct}%` }} />
        </div>
        <div className="text-center text-[10px] font-mono text-slate-400">{rivalry.draws} Draws ({drawPct}%)</div>
      </div>

      {/* Team Comparison Grid */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 text-center">
          <div className="text-xs text-slate-400 uppercase font-mono">Avg Score in Derby</div>
          <div className="text-xl font-bold font-mono text-emerald-400">{rivalry.schoolA.avgScore} Runs</div>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 text-center">
          <div className="text-xs text-slate-400 uppercase font-mono">Avg Score in Derby</div>
          <div className="text-xl font-bold font-mono text-blue-400">{rivalry.schoolB.avgScore} Runs</div>
        </div>
      </div>

      {/* Recent Encounters List */}
      <div className="space-y-3 pt-2">
        <div className="text-xs font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-amber-400" />
          Recent Derby Encounters
        </div>
        <div className="space-y-2">
          {rivalry.lastEncounters.map((enc, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white">{enc.winner} won {enc.margin}</div>
                <div className="text-slate-400 text-[11px]">{enc.date} • {enc.venue}</div>
              </div>
              <div className="font-mono text-right text-slate-300">
                <div>{enc.scoreA} vs {enc.scoreB}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
