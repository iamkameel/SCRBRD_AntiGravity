import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { WagonWheelChart } from '@/components/scoring/WagonWheelChart';
import { Award, ChevronDown, ChevronUp, Eye, PieChart, Sparkles, UserCheck } from 'lucide-react';

export interface BatterScorecardRow {
  id: string;
  name: string;
  isCaptain?: boolean;
  isKeeper?: boolean;
  dismissalText: string; // e.g. "c Mkhize b Pillay" or "not out"
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  wagonWheelData?: {
    fineLeg: number;
    squareLeg: number;
    midWicket: number;
    longOn: number;
    longOff: number;
    cover: number;
    point: number;
    thirdMan: number;
  };
  shotsLog?: { zone: string; runs: number; ballNum: number }[];
}

export interface BowlerScorecardRow {
  id: string;
  name: string;
  overs: string | number;
  maidens: number;
  runsConceded: number;
  wickets: number;
  economy: number;
  dots: number;
}

export interface InningsScorecardData {
  teamName: string;
  totalRuns: number;
  totalWickets: number;
  totalOvers: string;
  extrasText: string;
  batting: BatterScorecardRow[];
  bowling: BowlerScorecardRow[];
}

export interface SpectatorScorecardProps {
  firstInnings: InningsScorecardData;
  secondInnings?: InningsScorecardData;
  playerOfTheMatch?: {
    name: string;
    team: string;
    headline: string;
    statsText: string;
  };
}

export function SpectatorScorecard({
  firstInnings,
  secondInnings,
  playerOfTheMatch,
}: SpectatorScorecardProps) {
  const [activeInningsTab, setActiveInningsTab] = useState<'inn1' | 'inn2'>('inn1');
  const [activeSubTab, setActiveSubTab] = useState<'scorecard' | 'commentary' | 'partnerships' | 'analytics'>('scorecard');
  const [selectedBatterWagonWheel, setSelectedBatterWagonWheel] = useState<BatterScorecardRow | null>(null);

  const currentInningsData = activeInningsTab === 'inn1' ? firstInnings : (secondInnings || firstInnings);

  return (
    <div className="w-full flex flex-col gap-4 text-white">
      {/* Optional Player of the Match Banner */}
      {playerOfTheMatch && (
        <Card className="overflow-hidden bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border-amber-500/30">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  PLAYER OF THE MATCH
                </div>
                <div className="text-base font-black text-white">
                  {playerOfTheMatch.name} <span className="text-xs text-amber-300/80 font-normal">({playerOfTheMatch.team})</span>
                </div>
                <div className="text-xs text-muted-foreground">{playerOfTheMatch.headline}</div>
              </div>
            </div>
            <Badge className="bg-amber-500 text-slate-950 font-mono font-black text-xs px-3 py-1">
              {playerOfTheMatch.statsText}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Innings Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveInningsTab('inn1')}
          className={cn(
            "px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2",
            activeInningsTab === 'inn1'
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
              : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
          )}
        >
          <span>{firstInnings.teamName}</span>
          <span className="font-mono text-xs opacity-90">({firstInnings.totalRuns}/{firstInnings.totalWickets})</span>
        </button>

        {secondInnings && (
          <button
            onClick={() => setActiveInningsTab('inn2')}
            className={cn(
              "px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2",
              activeInningsTab === 'inn2'
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
            )}
          >
            <span>{secondInnings.teamName}</span>
            <span className="font-mono text-xs opacity-90">({secondInnings.totalRuns}/{secondInnings.totalWickets})</span>
          </button>
        )}
      </div>

      {/* Sub-View Switcher (Scorecard, Commentary, Partnerships, Analytics) */}
      <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-950/80 p-1.5 rounded-xl border border-white/10">
        {[
          { id: 'scorecard', label: 'SCORECARD' },
          { id: 'commentary', label: 'COMMENTARY' },
          { id: 'partnerships', label: 'PARTNERSHIPS' },
          { id: 'analytics', label: 'ANALYTICS' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-black tracking-wider transition-all",
              activeSubTab === tab.id
                ? "bg-white/15 text-white shadow"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scorecard Tab Content */}
      {activeSubTab === 'scorecard' && (
        <div className="flex flex-col gap-6">
          {/* Batting Card */}
          <div className="bg-slate-950/90 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-black text-xs uppercase tracking-widest text-emerald-400">
                BATTING — {currentInningsData.teamName}
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold">
                Tap batter to view Wagon Wheel 🎯
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                    <th className="py-2.5 px-4">Batter</th>
                    <th className="py-2.5 px-3">Dismissal</th>
                    <th className="py-2.5 px-2 text-right">R</th>
                    <th className="py-2.5 px-2 text-right">B</th>
                    <th className="py-2.5 px-2 text-right">4s</th>
                    <th className="py-2.5 px-2 text-right">6s</th>
                    <th className="py-2.5 px-3 text-right">SR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {currentInningsData.batting.map((batter) => {
                    const isNotOut = batter.dismissalText.toLowerCase().includes('not out');
                    const isSelected = selectedBatterWagonWheel?.id === batter.id;

                    return (
                      <React.Fragment key={batter.id}>
                        <tr
                          onClick={() => setSelectedBatterWagonWheel(isSelected ? null : batter)}
                          className={cn(
                            "cursor-pointer hover:bg-emerald-500/10 transition-colors",
                            isSelected && "bg-emerald-500/15"
                          )}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-white">
                                {batter.name}
                                {batter.isCaptain && <span className="text-emerald-400 ml-1">(c)</span>}
                                {batter.isKeeper && <span className="text-blue-400 ml-1">(wk)</span>}
                              </span>
                              <PieChart className="w-3.5 h-3.5 text-emerald-400/60 hover:text-emerald-400" />
                            </div>
                          </td>
                          <td className="py-3 px-3 text-muted-foreground text-[11px] truncate max-w-[160px]">
                            <span className={cn(isNotOut && "text-emerald-400 font-bold")}>
                              {batter.dismissalText}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right font-mono font-black text-white text-sm">
                            {batter.runs}
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-muted-foreground">
                            {batter.balls}
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-cyan-400 font-bold">
                            {batter.fours}
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-purple-400 font-bold">
                            {batter.sixes}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-white/90">
                            {batter.strikeRate.toFixed(1)}
                          </td>
                        </tr>

                        {/* Interactive In-Row Wagon Wheel Breakdown (Matching Image 4) */}
                        {isSelected && (
                          <tr>
                            <td colSpan={7} className="p-4 bg-slate-900/90 border-y border-emerald-500/30 animate-in fade-in">
                              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex flex-col gap-1 max-w-xs">
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-emerald-500 text-slate-950 font-black text-[9px] uppercase">
                                      WAGON WHEEL ANALYTICS
                                    </Badge>
                                    <span className="font-extrabold text-sm text-white">{batter.name}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {batter.runs} runs off {batter.balls} balls ({batter.fours}x4, {batter.sixes}x6)
                                  </div>
                                  <div className="text-xs text-emerald-400 font-mono mt-1">
                                    SR: {batter.strikeRate.toFixed(1)}
                                  </div>

                                  {/* Scoring Zones Summary */}
                                  {batter.wagonWheelData && (
                                    <div className="mt-3 grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                                      <div className="bg-white/5 p-1.5 rounded">Cover: {batter.wagonWheelData.cover}%</div>
                                      <div className="bg-white/5 p-1.5 rounded">Mid-Wicket: {batter.wagonWheelData.midWicket}%</div>
                                      <div className="bg-white/5 p-1.5 rounded">Long-On: {batter.wagonWheelData.longOn}%</div>
                                      <div className="bg-white/5 p-1.5 rounded">Fine-Leg: {batter.wagonWheelData.fineLeg}%</div>
                                    </div>
                                  )}
                                </div>

                                {/* Wagon Wheel Chart Canvas */}
                                <div className="w-48 h-48 sm:w-56 sm:h-56 relative flex items-center justify-center">
                                  <WagonWheelChart
                                    shots={[
                                      { id: 's1', runs: 4, x: 45, y: -45 },
                                      { id: 's2', runs: 6, x: -60, y: -80 },
                                      { id: 's3', runs: 2, x: 70, y: 20 },
                                      { id: 's4', runs: 1, x: -30, y: 50 },
                                      { id: 's5', runs: 4, x: 80, y: -20 },
                                    ]}
                                    size={220}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bowling Card */}
          <div className="bg-slate-950/90 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-white/5 px-4 py-3 border-b border-white/10">
              <span className="font-black text-xs uppercase tracking-widest text-blue-400">
                BOWLING
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                    <th className="py-2.5 px-4">Bowler</th>
                    <th className="py-2.5 px-3 text-right">Overs</th>
                    <th className="py-2.5 px-2 text-right">M</th>
                    <th className="py-2.5 px-2 text-right">R</th>
                    <th className="py-2.5 px-3 text-right">W</th>
                    <th className="py-2.5 px-3 text-right">Econ</th>
                    <th className="py-2.5 px-3 text-right">Dots</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {currentInningsData.bowling.map((bowler) => (
                    <tr key={bowler.id} className="hover:bg-white/5">
                      <td className="py-3 px-4 font-bold text-white">
                        {bowler.name}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-white">
                        {bowler.overs}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-muted-foreground">
                        {bowler.maidens}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-white">
                        {bowler.runsConceded}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-rose-400 text-sm">
                        {bowler.wickets}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-white/90">
                        {bowler.economy.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                        {bowler.dots}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Placeholders for Sub-tabs */}
      {activeSubTab === 'commentary' && (
        <div className="p-6 bg-slate-950/80 border border-white/10 rounded-2xl text-center text-muted-foreground font-semibold">
          Live commentary stream feeds into this panel...
        </div>
      )}

      {activeSubTab === 'partnerships' && (
        <div className="p-6 bg-slate-950/80 border border-white/10 rounded-2xl text-center text-muted-foreground font-semibold">
          Partnership progression charts and run contribution breakdowns...
        </div>
      )}

      {activeSubTab === 'analytics' && (
        <div className="p-6 bg-slate-950/80 border border-white/10 rounded-2xl text-center text-muted-foreground font-semibold">
          Worm chart, run rate telemetry, and win probability dynamics...
        </div>
      )}
    </div>
  );
}
