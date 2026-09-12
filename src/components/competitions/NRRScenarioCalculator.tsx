"use client";

import React, { useState, useId } from 'react';
import { D } from '@/lib/design-system';
import { 
  Calculator, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  Equal,
  CheckCircle2, 
  HelpCircle,
  Trophy,
  Target
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StandingsRow, simulateNRRScenario } from '@/lib/competitions/nrrEngine';

interface NRRScenarioCalculatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  standings: StandingsRow[];
  defaultTeamId?: string;
}

export function NRRScenarioCalculator({
  open,
  onOpenChange,
  standings,
  defaultTeamId
}: NRRScenarioCalculatorProps) {
  const titleId = useId();

  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    defaultTeamId || (standings[0]?.teamId || '')
  );

  const [runsScored, setRunsScored] = useState<number>(240);
  const [oversFaced, setOversFaced] = useState<number>(50.0);
  const [isAllOut, setIsAllOut] = useState<boolean>(false);

  const [runsConceded, setRunsConceded] = useState<number>(180);
  const [oversBowled, setOversBowled] = useState<number>(45.0);
  const [isOpponentAllOut, setIsOpponentAllOut] = useState<boolean>(true);

  const [maxMatchOvers, setMaxMatchOvers] = useState<number>(50);
  const [outcome, setOutcome] = useState<'WIN' | 'LOSS' | 'TIE'>('WIN');

  const currentTeam = standings.find(s => s.teamId === selectedTeamId) || standings[0];

  const projection = currentTeam
    ? simulateNRRScenario(standings, currentTeam.teamId, {
        runsScored: Number(runsScored),
        oversFaced: Number(oversFaced),
        isAllOut,
        runsConceded: Number(runsConceded),
        oversBowled: Number(oversBowled),
        isOpponentAllOut,
        maxMatchOvers: Number(maxMatchOvers),
        winOutcome: outcome
      })
    : { projectedNRR: 0, projectedRank: 0, rankDiff: 0 };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-950 border-white/10 text-white rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle id={titleId} className="text-xl font-black italic tracking-tight uppercase flex items-center gap-2" style={{ fontFamily: D.head }}>
            <Calculator className="w-5 h-5 text-sky-400" />
            NRR "What-If" Scenario Simulator
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400 font-medium">
            Simulate hypothetical match scores to project Net Run Rate (NRR) changes and league table rank movements.
          </DialogDescription>
        </DialogHeader>

        {/* Target Team Selection */}
        <div className="space-y-6 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-bold text-slate-300">Select School / Team</Label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full mt-1.5 h-10 rounded-xl px-3 bg-white/5 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-sky-500"
              >
                {standings.map((t) => (
                  <option key={t.teamId} value={t.teamId} className="bg-slate-900 text-white">
                    Rank #{t.rank} — {t.teamName} ({t.points} pts, NRR {t.nrr > 0 ? `+${t.nrr.toFixed(3)}` : t.nrr.toFixed(3)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-300">Match Format (Max Overs)</Label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => setMaxMatchOvers(50)}
                  className={`h-10 rounded-xl text-xs font-black transition-all ${
                    maxMatchOvers === 50 ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30' : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  50 Overs (ODI)
                </button>
                <button
                  type="button"
                  onClick={() => setMaxMatchOvers(20)}
                  className={`h-10 rounded-xl text-xs font-black transition-all ${
                    maxMatchOvers === 20 ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30' : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  20 Overs (T20)
                </button>
              </div>
            </div>
          </div>

          {/* Scenario Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl border bg-white/[0.02] border-white/10">
            {/* Batting Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">Batting Performance</span>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAllOut}
                    onChange={(e) => setIsAllOut(e.target.checked)}
                    className="rounded bg-white/10 border-white/20 text-sky-500 focus:ring-0"
                  />
                  Dismissed All-Out
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Runs Scored</Label>
                  <Input
                    type="number"
                    value={runsScored}
                    onChange={(e) => setRunsScored(Number(e.target.value))}
                    className="bg-white/5 border-white/10 text-white font-mono font-bold text-sm h-10 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Overs Faced</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={oversFaced}
                    onChange={(e) => setOversFaced(Number(e.target.value))}
                    className="bg-white/5 border-white/10 text-white font-mono font-bold text-sm h-10 mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Bowling Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-rose-400 tracking-wider">Bowling Performance</span>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOpponentAllOut}
                    onChange={(e) => setIsOpponentAllOut(e.target.checked)}
                    className="rounded bg-white/10 border-white/20 text-sky-500 focus:ring-0"
                  />
                  Opposition All-Out
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Runs Conceded</Label>
                  <Input
                    type="number"
                    value={runsConceded}
                    onChange={(e) => setRunsConceded(Number(e.target.value))}
                    className="bg-white/5 border-white/10 text-white font-mono font-bold text-sm h-10 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Overs Bowled</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={oversBowled}
                    onChange={(e) => setOversBowled(Number(e.target.value))}
                    className="bg-white/5 border-white/10 text-white font-mono font-bold text-sm h-10 mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Outcome Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOutcome('WIN')}
              className={`flex-1 h-9 rounded-xl text-xs font-black transition-all ${
                outcome === 'WIN' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Simulate WIN (+4 pts)
            </button>
            <button
              type="button"
              onClick={() => setOutcome('LOSS')}
              className={`flex-1 h-9 rounded-xl text-xs font-black transition-all ${
                outcome === 'LOSS' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Simulate LOSS (+0 pts)
            </button>
            <button
              type="button"
              onClick={() => setOutcome('TIE')}
              className={`flex-1 h-9 rounded-xl text-xs font-black transition-all ${
                outcome === 'TIE' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Simulate TIE (+2 pts)
            </button>
          </div>

          {/* Live Projection Display Card */}
          <div className="p-5 rounded-2xl border bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-950 border-indigo-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Live Projection Results
              </span>

              {projection.rankDiff > 0 ? (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs font-bold gap-1 py-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Moves Up +{projection.rankDiff} Position{projection.rankDiff > 1 ? 's' : ''}!
                </Badge>
              ) : projection.rankDiff < 0 ? (
                <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-xs font-bold gap-1 py-1">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  Drops {projection.rankDiff} Position{Math.abs(projection.rankDiff) > 1 ? 's' : ''}
                </Badge>
              ) : (
                <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30 text-xs font-bold gap-1 py-1">
                  <Equal className="w-3.5 h-3.5" />
                  Rank Unchanged
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                <div className="text-[10px] uppercase font-bold text-slate-400">Current NRR</div>
                <div className="text-base font-mono font-bold text-slate-300">
                  {currentTeam?.nrr > 0 ? `+${currentTeam.nrr.toFixed(3)}` : currentTeam?.nrr.toFixed(3)}
                </div>
              </div>

              <div className="bg-black/40 p-3 rounded-xl border border-sky-500/20">
                <div className="text-[10px] uppercase font-bold text-sky-400">Projected NRR</div>
                <div className="text-base font-mono font-black text-sky-300">
                  {projection.projectedNRR > 0 ? `+${projection.projectedNRR.toFixed(3)}` : projection.projectedNRR.toFixed(3)}
                </div>
              </div>

              <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                <div className="text-[10px] uppercase font-bold text-slate-400">Current Rank</div>
                <div className="text-base font-mono font-bold text-slate-300">
                  #{currentTeam?.rank}
                </div>
              </div>

              <div className="bg-black/40 p-3 rounded-xl border border-amber-500/20">
                <div className="text-[10px] uppercase font-bold text-amber-400">Projected Rank</div>
                <div className="text-base font-mono font-black text-amber-300" style={{ fontFamily: D.head }}>
                  #{projection.projectedRank}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs px-5"
          >
            Close Calculator
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
