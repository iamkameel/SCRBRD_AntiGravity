"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Radio, Activity, Target, Flame, ChevronRight, Share2, Award, Clock } from 'lucide-react';
import { liveMatchSync, LiveMatchState } from '@/services/liveMatchSync';
import { WagonWheelGrid, ShotEventData } from '@/components/scoring/WagonWheelGrid';

const MOCK_WAGON_SHOTS: ShotEventData[] = [
  { x: 220, y: 120, angle: 45, distance: 75, zoneInfo: { zoneName: 'Cover', zoneCode: 'CO', ringName: 'Outfield', isBoundary: false }, runs: 4, isWicket: false },
  { x: 190, y: 80, angle: 10, distance: 95, zoneInfo: { zoneName: 'Long-Off', zoneCode: 'LO', ringName: 'Boundary 6', isBoundary: true }, runs: 6, isWicket: false },
  { x: 120, y: 100, angle: 330, distance: 80, zoneInfo: { zoneName: 'Long-On', zoneCode: 'LO', ringName: 'Outfield', isBoundary: false }, runs: 1, isWicket: false },
  { x: 80, y: 160, angle: 280, distance: 70, zoneInfo: { zoneName: 'Mid-Wicket', zoneCode: 'MW', ringName: 'Outfield', isBoundary: false }, runs: 4, isWicket: false },
  { x: 60, y: 220, angle: 240, distance: 60, zoneInfo: { zoneName: 'Square Leg', zoneCode: 'SL', ringName: 'Outfield', isBoundary: false }, runs: 2, isWicket: false },
  { x: 250, y: 170, angle: 80, distance: 85, zoneInfo: { zoneName: 'Point', zoneCode: 'PT', ringName: 'Boundary 4', isBoundary: true }, runs: 4, isWicket: false },
  { x: 150, y: 160, angle: 350, distance: 30, zoneInfo: { zoneName: 'Mid-Off', zoneCode: 'MO', ringName: 'Inner Ring', isBoundary: false }, runs: 0, isWicket: true },
];

export function PublicLiveMatchCenter({ fixtureId }: { fixtureId?: string }) {
  const [matchState, setMatchState] = useState<LiveMatchState>(liveMatchSync.getLiveState());
  const [activeTab, setActiveTab] = useState('commentary');

  useEffect(() => {
    const unsubscribe = liveMatchSync.subscribe(newState => {
      setMatchState(newState);
    });
    return () => unsubscribe();
  }, [fixtureId]);

  return (
    <div className="space-y-6">
      {/* Broadcast Match Header */}
      <Card className="p-6 bg-slate-900/95 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-2xl text-slate-100 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-rose-500 text-white font-mono text-xs px-3 py-1 animate-pulse flex items-center gap-1.5 shadow-lg shadow-rose-500/20">
                <Radio className="w-3.5 h-3.5" /> LIVE SCORING
              </Badge>
              <span className="text-xs text-slate-400 font-mono">1st XI Annual Derby • Mitchell Field</span>
            </div>

            <div className="flex items-center gap-3">
              <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/10 text-xs font-mono">
                <Share2 className="w-3.5 h-3.5 mr-1.5 text-cyan-400" /> Share Match
              </Button>
            </div>
          </div>

          {/* Main Scoreboard Display */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Batting Team Info */}
            <div className="lg:col-span-5 space-y-2">
              <div className="text-xs font-mono uppercase tracking-widest text-slate-400">Batting Innings</div>
              <h1 className="text-2xl md:text-3xl font-black text-white font-['Syne',sans-serif] tracking-tight">
                {matchState.battingTeamName}
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl md:text-4xl font-black text-amber-400 font-mono tracking-tight">
                  {matchState.totalRuns}/{matchState.wickets}
                </span>
                <span className="text-xl font-bold text-slate-300 font-mono">
                  ({matchState.oversCompleted}.{matchState.ballsInOver} Overs)
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <span>CRR: <strong className="text-white">{matchState.currentRunRate.toFixed(2)}</strong></span>
                {matchState.requiredRunRate && (
                  <span>RRR: <strong className="text-cyan-400">{matchState.requiredRunRate.toFixed(2)}</strong></span>
                )}
              </div>
            </div>

            {/* Current Batsmen & Bowler Widget */}
            <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              {/* Striker & Non-Striker */}
              <div className="space-y-2 border-b sm:border-b-0 sm:border-r border-white/10 pr-0 sm:pr-4 pb-3 sm:pb-0">
                <div className="text-slate-400 font-bold uppercase text-[10px]">At The Crease</div>
                <div className="flex justify-between items-center bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20 text-white font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    {matchState.striker.name} *
                  </span>
                  <span className="text-amber-400 font-black text-sm">{matchState.striker.runs} ({matchState.striker.ballsFacing})</span>
                </div>
                <div className="flex justify-between items-center p-2 text-slate-300">
                  <span>{matchState.nonStriker.name}</span>
                  <span className="font-bold">{matchState.nonStriker.runs} ({matchState.nonStriker.ballsFacing})</span>
                </div>
              </div>

              {/* Bowler */}
              <div className="space-y-2">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Current Bowler</div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-white">
                  <div className="font-bold text-sm text-cyan-300">{matchState.currentBowler.name}</div>
                  <div className="text-slate-400 text-[11px] mt-1">
                    {matchState.currentBowler.overs} overs • {matchState.currentBowler.runsConceded} runs • <strong className="text-amber-400">{matchState.currentBowler.wicketsTaken} wickets</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Target Chase Progress Bar */}
          {matchState.targetRuns && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span className="text-cyan-400 font-bold">{matchState.statusMessage}</span>
                <span>Target: {matchState.targetRuns}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-white/10 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (matchState.totalRuns / matchState.targetRuns) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Tabs Navigation for Match Analytics & Commentary */}
      <Tabs defaultValue="commentary" onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-900 border border-white/10 p-1 rounded-xl font-mono text-xs text-slate-400">
          <TabsTrigger value="commentary" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-950 font-bold">
            Live Commentary
          </TabsTrigger>
          <TabsTrigger value="scorecard" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-950 font-bold">
            Full Scorecard
          </TabsTrigger>
          <TabsTrigger value="worm" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-950 font-bold">
            Run Rate Worm Chart
          </TabsTrigger>
          <TabsTrigger value="wagon" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-950 font-bold">
            Wagon Wheel Heatmap
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Live Commentary */}
        <TabsContent value="commentary" className="space-y-4">
          <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl text-slate-100 space-y-4">
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Live Ball-by-Ball Feed
            </h3>
            <div className="space-y-3">
              {matchState.recentBalls.map((ball) => (
                <div key={ball.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-4 items-start font-mono text-xs">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center font-bold text-amber-400 shrink-0">
                    <span className="text-[10px] text-slate-400">Over</span>
                    <span>{ball.overNumber}.{ball.ballNumber}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{ball.strikerName}</span>
                      <span className="text-slate-400">vs {ball.bowlerName}</span>
                      {ball.runsOffBat === 4 && <Badge className="bg-cyan-500 text-slate-950 font-bold text-[10px]">4 RUNS</Badge>}
                      {ball.runsOffBat === 6 && <Badge className="bg-amber-400 text-slate-950 font-bold text-[10px]">6 RUNS</Badge>}
                      {ball.isWicket && <Badge className="bg-rose-500 text-white font-bold text-[10px]">WICKET</Badge>}
                    </div>
                    <p className="text-slate-300 leading-relaxed font-sans text-xs">{ball.commentary}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: Full Scorecard */}
        <TabsContent value="scorecard">
          <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl text-slate-100 space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="text-sm font-bold uppercase text-white font-['Syne',sans-serif]">St John&apos;s College 1st XI — Innings Scorecard</h3>
              <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">{matchState.totalRuns}/{matchState.wickets} ({matchState.oversCompleted} Overs)</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="grid grid-cols-12 text-slate-400 font-bold uppercase text-[10px] pb-2 border-b border-white/5">
                <span className="col-span-6">Batter</span>
                <span className="col-span-2 text-right">Runs</span>
                <span className="col-span-2 text-right">Balls</span>
                <span className="col-span-2 text-right">SR</span>
              </div>

              <div className="grid grid-cols-12 text-white items-center py-2 border-b border-white/5">
                <span className="col-span-6 font-bold text-cyan-300">Aidan Smith *</span>
                <span className="col-span-2 text-right font-black text-amber-400">78</span>
                <span className="col-span-2 text-right text-slate-400">64</span>
                <span className="col-span-2 text-right text-cyan-400">121.8</span>
              </div>
              <div className="grid grid-cols-12 text-white items-center py-2 border-b border-white/5">
                <span className="col-span-6 font-bold">Luke Davies</span>
                <span className="col-span-2 text-right font-black text-amber-400">34</span>
                <span className="col-span-2 text-right text-slate-400">42</span>
                <span className="col-span-2 text-right text-cyan-400">80.9</span>
              </div>
              <div className="grid grid-cols-12 text-slate-400 items-center py-2 border-b border-white/5">
                <span className="col-span-6">Michael Ross (c b Hendricks)</span>
                <span className="col-span-2 text-right font-bold text-white">42</span>
                <span className="col-span-2 text-right">38</span>
                <span className="col-span-2 text-right">110.5</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 3: Run Rate Worm Chart */}
        <TabsContent value="worm">
          <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl text-slate-100 space-y-4">
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Flame className="w-4 h-4" /> Match Run Rate & Progression Worm
            </h3>
            <div className="p-4 bg-slate-950 rounded-xl border border-white/5 space-y-3 font-mono text-xs">
              <div className="text-slate-400 text-[11px]">Cumulative Innings Run Comparison</div>
              <div className="flex items-end gap-3 h-40 pt-4 px-2 border-b border-white/10">
                {matchState.wormData.map((d) => (
                  <div key={d.over} className="flex-1 flex flex-col items-center gap-1 group">
                    <div 
                      className="w-full bg-gradient-to-t from-cyan-500 to-amber-400 rounded-t-sm transition-all group-hover:brightness-125"
                      style={{ height: `${(d.runs / 200) * 100}%` }}
                    />
                    <span className="text-[10px] text-slate-400">O{d.over}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Start: Over 1</span>
                <span>Current: Over {matchState.oversCompleted}</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 4: Wagon Wheel Heatmap */}
        <TabsContent value="wagon">
          <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl text-slate-100 space-y-4">
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Target className="w-4 h-4" /> Live Wagon Wheel Sector Analysis
            </h3>
            <div className="flex justify-center py-4">
              <WagonWheelGrid shotsHistory={MOCK_WAGON_SHOTS} onShotRecorded={() => {}} />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
