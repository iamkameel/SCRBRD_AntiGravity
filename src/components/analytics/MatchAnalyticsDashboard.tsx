"use client";

import React, { useMemo } from 'react';
import { AnalyticsWormChart as WormChart, AnalyticsManhattanChart as ManhattanChart } from "@/components/charts/lazy";
import { Innings } from "@/types/firestore";
import { calculatePhaseBreakdown, calculateDLSTelemetry, BallPerformance } from "@/lib/analytics/analyticsMath";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Activity, ShieldAlert, Zap, TrendingUp } from "lucide-react";

interface MatchAnalyticsDashboardProps {
  innings1?: Innings | null;
  innings2?: Innings | null;
  homeTeamName: string;
  awayTeamName: string;
  battingFirst: 'home' | 'away';
  targetRuns?: number;
}

export function MatchAnalyticsDashboard({
  innings1,
  innings2,
  homeTeamName,
  awayTeamName,
  battingFirst,
  targetRuns = 160,
}: MatchAnalyticsDashboardProps) {
  if (!innings1) return null;

  // Process over history into linear ball performance events
  const extractBalls = (innings: Innings): BallPerformance[] => {
    const balls: BallPerformance[] = [];
    (innings.overHistory || []).forEach((over) => {
      over.balls.forEach((b, ballIdx) => {
        balls.push({
          overNumber: over.overNumber,
          ballNumber: ballIdx + 1,
          runs: b.runs || 0,
          extras: b.extras || 0,
          isWicket: b.isWicket,
        });
      });
    });
    return balls;
  };

  const processInningsData = (innings: Innings) => {
    let cumulativeRuns = 0;
    return (innings.overHistory || []).map((over) => {
      const runsInOver = over.balls.reduce((sum, b) => sum + b.runs + (b.extras || 0), 0);
      const wicketsInOver = over.balls.filter((b) => b.isWicket).length;
      cumulativeRuns += runsInOver;

      return {
        over: over.overNumber,
        runs: runsInOver,
        wickets: wicketsInOver,
        cumulativeRuns,
      };
    });
  };

  const innings1Balls = extractBalls(innings1);
  const innings1Phases = calculatePhaseBreakdown(innings1Balls);

  const innings2Balls = innings2 ? extractBalls(innings2) : [];
  const innings2Phases = innings2 ? calculatePhaseBreakdown(innings2Balls) : null;

  const innings1Data = processInningsData(innings1);
  const innings2Data = innings2 ? processInningsData(innings2) : undefined;

  const team1Name = battingFirst === 'home' ? homeTeamName : awayTeamName;
  const team2Name = battingFirst === 'home' ? awayTeamName : homeTeamName;

  // Compute DLS Telemetry if chasing in second innings
  const dlsTelemetry = useMemo(() => {
    if (!innings2) return null;
    const currentRuns = innings2.totalRuns || 0;
    const oversBowled = (innings2.overHistory || []).length;
    const oversRemaining = Math.max(0, 20 - oversBowled);
    const wicketsLost = innings2.wickets || 0;
    return calculateDLSTelemetry(targetRuns, currentRuns, oversRemaining, wicketsLost);
  }, [innings2, targetRuns]);

  return (
    <div className="space-y-6 mt-8">
      {/* DLS Telemetry Header Card if chasing */}
      {dlsTelemetry && (
        <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl backdrop-blur-xl text-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-white">DLS Target Telemetry</h4>
              <p className="text-xs text-slate-400">Target: {targetRuns} runs • Par Score: {dlsTelemetry.parScore} runs</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Req. Run Rate</div>
              <div className="text-lg font-black font-mono text-emerald-400">{dlsTelemetry.requiredRunRate} rpo</div>
            </div>
            <Badge
              variant="outline"
              className={`px-3 py-1 text-xs font-bold uppercase ${
                dlsTelemetry.status === 'ahead'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : dlsTelemetry.status === 'behind'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}
            >
              {dlsTelemetry.status === 'ahead' ? 'Ahead of Par' : dlsTelemetry.status === 'behind' ? 'Behind Par' : 'Level with Par'}
            </Badge>
          </div>
        </Card>
      )}

      {/* Worm & Manhattan Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <WormChart
            innings1Data={innings1Data.map((d) => ({ over: d.over, runs: d.cumulativeRuns }))}
            innings2Data={innings2Data?.map((d) => ({ over: d.over, runs: d.cumulativeRuns }))}
            team1Name={team1Name}
            team2Name={innings2 ? team2Name : undefined}
          />
        </div>

        <ManhattanChart data={innings1Data} teamName={team1Name} />
        {innings2Data && <ManhattanChart data={innings2Data} teamName={team2Name} />}
      </div>

      {/* 3-Phase Scoring Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Innings 1 Phase Breakdown */}
        <Card className="p-6 bg-slate-900/80 border border-white/10 rounded-2xl text-slate-100 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">{team1Name} Phase Performance</h4>
            <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-slate-300">
              1st Innings
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {innings1Phases.map((phase, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">{phase.phase}</div>
                <div className="text-xs text-slate-500">{phase.oversRange}</div>
                <div className="text-base font-black text-emerald-400 font-mono">
                  {phase.runs}/{phase.wickets}
                </div>
                <div className="text-[10px] text-slate-400">{phase.runRate} RPO</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Innings 2 Phase Breakdown if available */}
        {innings2Phases && (
          <Card className="p-6 bg-slate-900/80 border border-white/10 rounded-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">{team2Name} Phase Performance</h4>
              <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-slate-300">
                2nd Innings
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {innings2Phases.map((phase, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{phase.phase}</div>
                  <div className="text-xs text-slate-500">{phase.oversRange}</div>
                  <div className="text-base font-black text-sky-400 font-mono">
                    {phase.runs}/{phase.wickets}
                  </div>
                  <div className="text-[10px] text-slate-400">{phase.runRate} RPO</div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
