"use client";

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radio, Share2, Wifi } from 'lucide-react';
import { liveMatchSync, LiveMatchState, MilestoneAlert } from '@/services/liveMatchSync';

// Broadcast HUD System Components
import { MatchHUD, BallCircleItem } from '@/components/scoring/MatchHUD';
import { IntelligenceRibbon, InsightCard } from '@/components/scoring/IntelligenceRibbon';
import { EventInterruptOverlay, EventInterrupt } from '@/components/scoring/EventInterruptOverlay';
import { SpectatorScorecard, InningsScorecardData } from '@/components/scoring/SpectatorScorecard';

export function PublicLiveMatchCenter({ fixtureId = 'fix-1st-xi-kes' }: { fixtureId?: string }) {
  const [matchState, setMatchState] = useState<LiveMatchState>(liveMatchSync.getLiveState());
  const [activeAlert, setActiveAlert] = useState<MilestoneAlert | null>(null);
  const [activeInterrupt, setActiveInterrupt] = useState<EventInterrupt | null>(null);

  useEffect(() => {
    // Connect to Firestore real-time snapshot
    liveMatchSync.connectFirestore(fixtureId);

    const unsubscribe = liveMatchSync.subscribe((newState) => {
      setMatchState(newState);
      if (newState.activeMilestoneAlert) {
        setActiveAlert(newState.activeMilestoneAlert);
        
        // Convert milestone alert to Tier 3 Event Interrupt
        const alertType = newState.activeMilestoneAlert.type;
        const interruptType = alertType === 'WICKET' ? 'WICKET' : alertType === 'SIX' || alertType === 'FOUR' ? 'MILESTONE_50' : 'MILESTONE_50';
        
        setActiveInterrupt({
          type: interruptType,
          title: newState.activeMilestoneAlert.title,
          subtitle: newState.activeMilestoneAlert.description,
          statsText: newState.activeMilestoneAlert.timestamp,
        });

        // Auto-dismiss after 5 seconds
        const timer = setTimeout(() => {
          setActiveAlert(null);
          setActiveInterrupt(null);
        }, 5000);
        return () => clearTimeout(timer);
      }
    });

    return () => unsubscribe();
  }, [fixtureId]);

  const simulateScorerBall = (runs: number, isWicket: boolean = false) => {
    const ballNumber = matchState.ballsInOver + 1 > 6 ? 1 : matchState.ballsInOver + 1;
    const overNumber = matchState.ballsInOver + 1 > 6 ? matchState.oversCompleted + 1 : matchState.oversCompleted;

    let commentary = `Ball ${overNumber}.${ballNumber}: ${matchState.striker.name} scores ${runs} run(s) off ${matchState.currentBowler.name}.`;
    if (runs === 4) commentary = `CRUNCHED! ${matchState.striker.name} leans into a brilliant drive to the cover fence for FOUR!`;
    if (runs === 6) commentary = `MONSTROUS! ${matchState.striker.name} lofts it high and deep into the crowd for SIX!`;
    if (isWicket) commentary = `OUT! Wicket falls! ${matchState.striker.name} caught by fielder off ${matchState.currentBowler.name}!`;

    if (isWicket) {
      setActiveInterrupt({
        type: 'WICKET',
        title: `WICKET! ${matchState.striker.name.toUpperCase()} OUT!`,
        subtitle: commentary,
        statsText: `${matchState.striker.runs} runs (${matchState.striker.ballsFacing}b)`,
      });
    } else if (runs === 6) {
      setActiveInterrupt({
        type: 'MILESTONE_50',
        title: `MAXIMUM! 6 RUNS!`,
        subtitle: `${matchState.striker.name} hits a colossal 65m boundary!`,
        statsText: `6 RUNS`,
      });
    }

    liveMatchSync.addBallEvent(
      {
        id: `sim-${Date.now()}`,
        overNumber,
        ballNumber,
        strikerName: matchState.striker.name,
        bowlerName: matchState.currentBowler.name,
        runsOffBat: isWicket ? 0 : runs,
        extraRuns: 0,
        totalRuns: isWicket ? 0 : runs,
        isWicket,
        dismissedPlayerName: isWicket ? matchState.striker.name : undefined,
        commentary,
        timestamp: new Date().toLocaleTimeString(),
      },
      fixtureId
    );
  };

  // Convert match state recent balls into BallCircleItems for HUD
  const currentOverBallCircles: BallCircleItem[] = matchState.recentBalls.slice(0, 6).map((b) => ({
    id: b.id,
    label: b.isWicket ? 'W' : b.runsOffBat.toString(),
    type: b.isWicket
      ? 'wicket'
      : b.runsOffBat === 6
      ? 'six'
      : b.runsOffBat === 4
      ? 'four'
      : b.runsOffBat === 3
      ? 'three'
      : b.runsOffBat === 2
      ? 'two'
      : b.runsOffBat === 1
      ? 'single'
      : 'dot',
  }));

  // Build Spectator Scorecard Innings Data
  const inn1Scorecard: InningsScorecardData = {
    teamName: matchState.battingTeamName,
    totalRuns: matchState.totalRuns,
    totalWickets: matchState.wickets,
    totalOvers: `${matchState.oversCompleted}.${matchState.ballsInOver}`,
    extrasText: '12 (b 2, lb 4, wd 5, nb 1)',
    batting: [
      {
        id: 'bat-1',
        name: matchState.striker.name,
        isCaptain: true,
        dismissalText: 'not out',
        runs: matchState.striker.runs,
        balls: matchState.striker.ballsFacing,
        fours: 4,
        sixes: 2,
        strikeRate: matchState.striker.ballsFacing > 0 ? (matchState.striker.runs / matchState.striker.ballsFacing) * 100 : 0,
        wagonWheelData: {
          fineLeg: 15,
          squareLeg: 20,
          midWicket: 35,
          longOn: 12,
          longOff: 8,
          cover: 6,
          point: 2,
          thirdMan: 2,
        },
      },
      {
        id: 'bat-2',
        name: matchState.nonStriker.name,
        dismissalText: 'not out',
        runs: matchState.nonStriker.runs,
        balls: matchState.nonStriker.ballsFacing,
        fours: 2,
        sixes: 0,
        strikeRate: matchState.nonStriker.ballsFacing > 0 ? (matchState.nonStriker.runs / matchState.nonStriker.ballsFacing) * 100 : 0,
        wagonWheelData: {
          fineLeg: 10,
          squareLeg: 15,
          midWicket: 25,
          longOn: 20,
          longOff: 15,
          cover: 10,
          point: 3,
          thirdMan: 2,
        },
      },
      {
        id: 'bat-3',
        name: 'Aiden Markram',
        isKeeper: true,
        dismissalText: 'c Mkhize b Pillay',
        runs: 48,
        balls: 32,
        fours: 6,
        sixes: 1,
        strikeRate: 150.0,
        wagonWheelData: {
          fineLeg: 8,
          squareLeg: 12,
          midWicket: 28,
          longOn: 18,
          longOff: 14,
          cover: 12,
          point: 5,
          thirdMan: 3,
        },
      },
      {
        id: 'bat-4',
        name: 'Tristan Stubbs',
        dismissalText: 'b Mkhize',
        runs: 22,
        balls: 15,
        fours: 3,
        sixes: 0,
        strikeRate: 146.6,
      },
    ],
    bowling: [
      {
        id: 'bowl-1',
        name: matchState.currentBowler.name,
        overs: matchState.currentBowler.overs,
        maidens: 0,
        runsConceded: matchState.currentBowler.runsConceded,
        wickets: matchState.currentBowler.wicketsTaken,
        economy: matchState.currentBowler.overs > 0 ? matchState.currentBowler.runsConceded / matchState.currentBowler.overs : 0,
        dots: 14,
      },
      {
        id: 'bowl-2',
        name: 'Kagiso Rabada',
        overs: 4.0,
        maidens: 1,
        runsConceded: 24,
        wickets: 2,
        economy: 6.0,
        dots: 16,
      },
    ],
  };

  const inn2Scorecard: InningsScorecardData = {
    teamName: matchState.bowlingTeamName,
    totalRuns: 142,
    totalWickets: 6,
    totalOvers: '20.0',
    extrasText: '8 (b 1, lb 2, wd 4, nb 1)',
    batting: [
      {
        id: 'bat-201',
        name: 'Heinrich Klaasen',
        dismissalText: 'c Markram b Rabada',
        runs: 54,
        balls: 30,
        fours: 5,
        sixes: 3,
        strikeRate: 180.0,
      },
    ],
    bowling: [
      {
        id: 'bowl-201',
        name: 'Marco Jansen',
        overs: 4.0,
        maidens: 0,
        runsConceded: 32,
        wickets: 3,
        economy: 8.0,
        dots: 11,
      },
    ],
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Realtime Stream Sync Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 border border-white/10 rounded-2xl text-xs font-mono">
        <div className="flex items-center gap-3">
          <Badge className="bg-rose-500 text-white font-mono text-xs px-3 py-1 animate-pulse flex items-center gap-1.5 shadow-lg shadow-rose-500/20">
            <Radio className="w-3.5 h-3.5" /> LIVE BROADCAST
          </Badge>
          <Badge
            className={`font-mono text-[11px] px-2.5 py-0.5 flex items-center gap-1.5 ${
              matchState.connectionStatus === 'CONNECTED'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : matchState.connectionStatus === 'SYNCING'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            {matchState.connectionStatus === 'CONNECTED'
              ? `SYNCED (${matchState.latencyMs ?? 28}ms)`
              : matchState.connectionStatus}
          </Badge>
        </div>

        {/* Live Scorer Test Simulator */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase hidden md:inline">Test Scorer Push:</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => simulateScorerBall(1)}
            className="h-7 text-[11px] font-mono border-white/10 bg-white/5 hover:bg-white/10 text-slate-200"
          >
            +1 Single
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => simulateScorerBall(4)}
            className="h-7 text-[11px] font-mono border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold"
          >
            +4 Boundary
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => simulateScorerBall(6)}
            className="h-7 text-[11px] font-mono border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold"
          >
            +6 Maximum
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => simulateScorerBall(0, true)}
            className="h-7 text-[11px] font-mono border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold"
          >
            Wicket!
          </Button>
        </div>
      </div>

      {/* Tier 3 Event Interrupt Overlay */}
      <EventInterruptOverlay
        interrupt={activeInterrupt}
        onDismiss={() => setActiveInterrupt(null)}
      />

      {/* Broadcast-Inspired Match HUD Architecture (Tier 1) */}
      <MatchHUD
        homeTeamName="Durban High School"
        homeTeamCode="DHS"
        awayTeamName="Westville Boys' High"
        awayTeamCode="WBHS"
        homeColor="#3b82f6"
        awayColor="#10b981"
        battingTeamName={matchState.battingTeamName}
        bowlingTeamName={matchState.bowlingTeamName}
        currentInningsNumber={1}
        runs={matchState.totalRuns}
        wickets={matchState.wickets}
        overs={matchState.oversCompleted}
        balls={matchState.oversCompleted * 6 + matchState.ballsInOver}
        maxOvers={20}
        target={matchState.targetRuns ?? undefined}
        crr={matchState.currentRunRate.toFixed(2)}
        rrr={matchState.requiredRunRate ? matchState.requiredRunRate.toFixed(2) : undefined}
        striker={{
          name: matchState.striker.name,
          runs: matchState.striker.runs,
          balls: matchState.striker.ballsFacing,
          fours: 4,
          sixes: 2,
        }}
        nonStriker={{
          name: matchState.nonStriker.name,
          runs: matchState.nonStriker.runs,
          balls: matchState.nonStriker.ballsFacing,
          fours: 2,
          sixes: 0,
        }}
        bowler={{
          name: matchState.currentBowler.name,
          overs: matchState.currentBowler.overs,
          runsConceded: matchState.currentBowler.runsConceded,
          wickets: matchState.currentBowler.wicketsTaken,
          econ: matchState.currentBowler.overs > 0 ? (matchState.currentBowler.runsConceded / matchState.currentBowler.overs).toFixed(2) : '0.0',
        }}
        currentOverBalls={currentOverBallCircles}
        phase="POWERPLAY"
        matchMetadata={{
          competition: 'KZN Super League 1st XI',
          venue: "Bowden's Field",
          weather: 'Sunny, 24°C',
          date: new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }),
        }}
      />

      {/* Tier 2 Rotating Intelligence Ribbon */}
      <IntelligenceRibbon />

      {/* Spectator Scorecard & Interactive Batter Wagon Wheel */}
      <SpectatorScorecard
        firstInnings={inn1Scorecard}
        secondInnings={inn2Scorecard}
        playerOfTheMatch={{
          name: 'Aiden Markram',
          team: matchState.battingTeamName,
          headline: 'Dynamic 48 runs (32b) & 2 crucial catches',
          statsText: 'POTM 🏅',
        }}
      />
    </div>
  );
}
