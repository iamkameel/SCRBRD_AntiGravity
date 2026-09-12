"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { D } from '@/lib/design-system';
import { 
  Trophy, 
  TrendingUp, 
  Award, 
  Calculator, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  HelpCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StandingsRow } from '@/lib/competitions/nrrEngine';

interface CompetitionStandingsTableProps {
  leagueTitle?: string;
  season?: string;
  standings: StandingsRow[];
  onOpenCalculator?: (targetTeamId: string) => void;
}

export function CompetitionStandingsTable({
  leagueTitle = "KZN Schools Super 8 Premier League",
  season = "2026 Season",
  standings,
  onOpenCalculator
}: CompetitionStandingsTableProps) {
  const [filter, setFilter] = useState<'all' | 'top4'>('all');

  const displayedRows = filter === 'top4' ? standings.slice(0, 4) : standings;

  return (
    <div className="space-y-4">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border" style={{ background: D.surf1, borderColor: D.border }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold uppercase tracking-tight text-white" style={{ fontFamily: D.head }}>
              {leagueTitle}
            </h3>
            <p className="text-xs font-bold text-muted-foreground flex items-center gap-2">
              <span>{season}</span>
              <span>•</span>
              <span className="text-emerald-400 font-mono">LIVE ENGINE CALCULATED</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-black/40 border border-white/10 flex items-center gap-1 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Full Table ({standings.length})
            </button>
            <button
              onClick={() => setFilter('top4')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filter === 'top4' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Playoff Zone (Top 4)
            </button>
          </div>
        </div>
      </div>

      {/* Main Points Table */}
      <div className="rounded-3xl border overflow-hidden shadow-2xl" style={{ background: D.surf2, borderColor: D.border }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b text-[10px] font-bold uppercase tracking-wider text-muted-foreground" style={{ background: D.surf1, borderColor: D.border }}>
                <th className="p-4 w-12 text-center">POS</th>
                <th className="p-4">SCHOOL / TEAM</th>
                <th className="p-4 text-center">P</th>
                <th className="p-4 text-center">W</th>
                <th className="p-4 text-center">L</th>
                <th className="p-4 text-center">T</th>
                <th className="p-4 text-center">NR</th>
                <th className="p-4 text-center">PTS</th>
                <th className="p-4 text-right">NRR</th>
                <th className="p-4 text-center hidden md:table-cell">LAST 5</th>
                <th className="p-4 text-center">SIMULATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {displayedRows.map((row) => {
                const isPlayoffZone = row.rank <= 4;
                const isLeader = row.rank === 1;

                return (
                  <tr 
                    key={row.teamId}
                    className={`hover:bg-white/5 transition-colors ${
                      isLeader ? 'bg-amber-500/5' : isPlayoffZone ? 'bg-indigo-500/5' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl text-xs font-bold font-mono ${
                        isLeader ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' :
                        isPlayoffZone ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                        'bg-white/5 text-slate-400'
                      }`}>
                        {row.rank}
                      </span>
                    </td>

                    {/* Team Name */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white" style={{ fontFamily: D.head }}>
                          {row.teamName}
                        </span>
                        {isLeader && (
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[9px] font-bold uppercase px-2 py-0.5">
                            Leader
                          </Badge>
                        )}
                        {row.rank === 4 && (
                          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[9px] font-bold uppercase px-2 py-0.5">
                            Playoff Cutoff
                          </Badge>
                        )}
                      </div>
                    </td>

                    {/* P / W / L / T / NR */}
                    <td className="p-4 text-center font-bold text-slate-300">{row.played}</td>
                    <td className="p-4 text-center font-bold text-emerald-400">{row.won}</td>
                    <td className="p-4 text-center font-bold text-rose-400">{row.lost}</td>
                    <td className="p-4 text-center font-bold text-amber-400">{row.tied}</td>
                    <td className="p-4 text-center font-bold text-slate-400">{row.noResult}</td>

                    {/* Points */}
                    <td className="p-4 text-center">
                      <span className="text-base font-bold text-white font-mono" style={{ fontFamily: D.head }}>
                        {row.points}
                      </span>
                    </td>

                    {/* NRR */}
                    <td className="p-4 text-right">
                      <span className={`font-mono font-bold text-xs ${
                        row.nrr > 0 ? 'text-emerald-400' : row.nrr < 0 ? 'text-rose-400' : 'text-slate-400'
                      }`}>
                        {row.nrr > 0 ? `+${row.nrr.toFixed(3)}` : row.nrr.toFixed(3)}
                      </span>
                    </td>

                    {/* Form Badges */}
                    <td className="p-4 text-center hidden md:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        {row.form.slice(-5).map((f, i) => (
                          <span
                            key={i}
                            className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-[9px] ${
                              f === 'W' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              f === 'L' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                              'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Scenario Trigger */}
                    <td className="p-4 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onOpenCalculator && onOpenCalculator(row.teamId)}
                        className="h-8 px-2.5 rounded-xl border border-white/10 hover:bg-sky-500/20 hover:border-sky-500/30 text-sky-400 text-[10px] font-bold gap-1"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        What-If
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Qualification Legend Footer */}
        <div className="p-4 border-t flex flex-wrap items-center justify-between text-[11px] font-bold text-muted-foreground gap-4" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Top 1: Automatic Finalist
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> Top 2-4: Semi-Final Qualification Zone
            </span>
          </div>

          <div className="font-mono text-[10px]">
            Points Rule: Win = 4pts | Tie/NR = 2pts | Loss = 0pts
          </div>
        </div>
      </div>
    </div>
  );
}
