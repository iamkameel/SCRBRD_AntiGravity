"use client";

import { useState, useMemo } from "react";
import { Match, Team, Innings, Person, Rankings, LiveScoreProjection } from "@/types/firestore";
import { useLiveScore } from "@/hooks/useLiveScore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ManhattanChart } from "@/components/charts/ManhattanChart";
import { WormChart } from "@/components/charts/WormChart";
import { WagonWheel } from "@/components/charts/WagonWheel";
import { ScoreOverlay } from "@/components/match/ScoreOverlay";
import { PlayerCard } from "@/components/match/PlayerCard";
import { ScorecardTable } from "@/components/match/ScorecardTable";
import { ImpactTab } from "@/components/match/ImpactTab";
import { ImpactHighlights } from "@/components/match/ImpactHighlights";
import { MatchMVP } from "@/components/match/MatchMVP";
import { MatchMomentumChart } from "@/components/match/MatchMomentumChart";
import Link from "next/link";
import { ChevronLeft, Share2, RefreshCw, Play, Moon, Zap, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { PrintableMatchReport } from "@/components/match/PrintableMatchReport";
import { PerformanceWorm } from "@/components/analytics/PerformanceWorm";
import { BroadcastOverlay } from "@/components/broadcast/BroadcastOverlay";
import { D, GlobalStyles } from "@/lib/scoring/theme";

interface MatchDetailClientProps {
  match: Match;
  homeTeam?: Team;
  awayTeam?: Team;
  players?: Person[];
  playerImpact?: Rankings.PlayerMatchImpact[];
  matchImpactEvents?: Rankings.MatchImpactEvent[];
}

export function MatchDetailClient({ 
  match, 
  homeTeam, 
  awayTeam, 
  players = [],
  playerImpact = [],
  matchImpactEvents = []
}: MatchDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'scorecard' | 'analytics' | 'commentary' | 'impact' | 'squads' | 'broadcast'>('overview');

  // Connect to real-time scoring data
  const { liveScore, loading: liveLoading } = useLiveScore(match.id);

  // Merge match data with live score projection
  const currentMatch = liveScore ? { ...match, ...liveScore } : match;
  
  // Use projection-based innings data if available, otherwise fallback to match.inningsData
  const liveInningsData = useMemo(() => {
    if (!liveScore) return match.inningsData;
    
    // Map V3 projections to V2 format for UI components
    const mapV3toV2 = (proj?: any, isCurrent?: boolean): Innings | undefined => {
      if (!proj) return undefined;
      
      // Derive overHistory if ballHistory is available (V3 structure)
      const overHistory: any[] = [];
      const historySource = isCurrent ? liveScore.ballHistory : proj.ballHistory;
      
      if (historySource && historySource.length > 0) {
        const oversMap = new Map<number, any>();
        historySource.forEach((ball: any) => {
          const oNum = ball.overNumber !== undefined ? ball.overNumber : Math.floor(ball.ballIndex / 6);
          if (!oversMap.has(oNum)) {
            oversMap.set(oNum, { 
              overNumber: oNum + 1, 
              runsConceded: 0, 
              wicketsTaken: 0, 
              balls: [] 
            });
          }
          const o = oversMap.get(oNum);
          o.runsConceded += (ball.runs || 0) + (ball.extraRuns || 0);
          if (ball.isWicket) o.wicketsTaken += 1;
          o.balls.push(ball);
        });
        overHistory.push(...Array.from(oversMap.values()).sort((a, b) => a.overNumber - b.overNumber));
      }

      return {
        teamId: proj.battingTeamId || '',
        runs: proj.runs || 0,
        wickets: proj.wickets || 0,
        overs: proj.overs || 0,
        batsmen: proj.batsmen?.map((b: any) => ({
          playerId: b.playerId,
          runs: b.runs || 0,
          ballsFaced: b.ballsFaced || 0,
          fours: b.fours || 0,
          sixes: b.sixes || 0,
          strikeRate: b.strikeRate || 0,
          isOut: b.isOut || false,
          dismissal: b.dismissal?.description || ''
        })),
        bowlers: proj.bowlers?.map((b: any) => ({
          playerId: b.playerId,
          overs: b.overs || 0,
          maidens: b.maidens || 0,
          runsConceded: b.runsConceded || 0,
          wickets: b.wickets || 0,
          economy: b.economy || 0
        })),
        extras: proj.extras ? {
          wides: proj.extras.wides || 0,
          noballs: proj.extras.noBalls || 0,
          byes: proj.extras.byes || 0,
          legbyes: proj.extras.legByes || 0
        } : { wides: 0, noballs: 0, byes: 0, legbyes: 0 },
        overHistory
      } as Innings;
    };

    return {
      firstInnings: liveScore.innings1 ? mapV3toV2(liveScore.innings1) : mapV3toV2(liveScore.inningsNumber === 1 ? liveScore.currentInnings : undefined, true),
      secondInnings: liveScore.innings2 ? mapV3toV2(liveScore.innings2) : mapV3toV2(liveScore.inningsNumber === 2 ? liveScore.currentInnings : undefined, true)
    };
  }, [liveScore, match.inningsData]);

  const hasInningsData = liveInningsData && liveInningsData.firstInnings;
  const homeTeamName = homeTeam?.name || "Home Team";
  const awayTeamName = awayTeam?.name || "Away Team";

  // Helper to get player name
  const getPlayerName = (id: string) => {
    const p = players.find(p => p.id === id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown Player';
  };

  // Find Match MVP (highest totalImpact)
  const mvp = [...playerImpact].sort((a, b) => b.totalImpact - a.totalImpact)[0];
  const mvpPlayer = mvp ? players.find(p => p.id === mvp.personId) : undefined;

  // Mock Data for Visuals (replace with real data when available)
  const mockBattingTeam = {
    name: liveScore?.inningsNumber === 2 ? awayTeamName : homeTeamName,
    shortName: (liveScore?.inningsNumber === 2 ? awayTeam?.abbreviatedName : homeTeam?.abbreviatedName) || (liveScore?.inningsNumber === 2 ? awayTeamName : homeTeamName).substring(0, 3).toUpperCase(),
    score: `${liveScore?.currentInnings?.runs || 0}/${liveScore?.currentInnings?.wickets || 0}`,
    overs: (liveScore?.currentInnings?.overs?.toString() || "0.0"),
    color: liveScore?.inningsNumber === 2 ? "bg-fox-blue" : "bg-fox-gold",
  };

  const mockBowlingTeam = {
    name: liveScore?.inningsNumber === 2 ? homeTeamName : awayTeamName,
    shortName: (liveScore?.inningsNumber === 2 ? homeTeam?.abbreviatedName : awayTeam?.abbreviatedName) || (liveScore?.inningsNumber === 2 ? homeTeamName : awayTeamName).substring(0, 3).toUpperCase(),
    score: liveScore?.inningsNumber === 2 ? `${liveScore.innings1?.runs || 0}/${liveScore.innings1?.wickets || 0}` : "0/0",
    color: liveScore?.inningsNumber === 2 ? "bg-fox-gold" : "bg-fox-blue",
    overs: (liveScore?.inningsNumber === 2 ? liveScore.innings1?.overs?.toString() : "0.0") || "0.0",
  };

  const mockPlayerStats = {
    "Runs": 85,
    "Balls": 42,
    "4s": 8,
    "6s": 4,
    "SR": 202.38
  };

  const mockCommentary = [
    { over: "19.6", text: "OUT! Caught on the boundary! A magnificent innings comes to an end.", type: "wicket" },
    { over: "19.5", text: "SIX! Smashed over long on for a massive maximum!", type: "six" },
    { over: "19.4", text: "Four runs, drilled through the covers.", type: "four" },
    { over: "19.3", text: "No run, play and miss.", type: "dot" },
    { over: "19.2", text: "1 run, pushed to mid-off.", type: "run" },
    { over: "19.1", text: "2 runs, excellent running between the wickets.", type: "run" },
  ];

  // Partition players into teams
  const homeRoster = useMemo(() => {
    return players.filter(p => (homeTeam as any)?.playerIds?.includes(p.id)) || [];
  }, [players, homeTeam]);

  const awayRoster = useMemo(() => {
    return players.filter(p => (awayTeam as any)?.playerIds?.includes(p.id)) || [];
  }, [players, awayTeam]);

  // Use real players or fallback to mock if empty (for dev)
  const displayPlayers = useMemo(() => {
    if (players.length > 0) return players;
    return [
      { id: '1', firstName: 'Player', lastName: 'One' } as Person,
      { id: '2', firstName: 'Player', lastName: 'Two' } as Person,
      { id: '3', firstName: 'Player', lastName: 'Three' } as Person,
    ];
  }, [players]);

  // Construct match data for report
  const reportData = {
    id: match.id,
    homeTeam: homeTeamName,
    awayTeam: awayTeamName,
    venue: match.venue || 'TBA',
    date: match.dateTime ? new Date(match.dateTime).toLocaleDateString() : 'Date TBA',
    format: match.matchType || 'T20',
    result: match.result,
    totalRuns: (liveInningsData?.firstInnings?.runs || 0) + (liveInningsData?.secondInnings?.runs || 0),
    totalWickets: (liveInningsData?.firstInnings?.wickets || 0) + (liveInningsData?.secondInnings?.wickets || 0),
    batsmen: [
      ...(liveInningsData?.firstInnings?.batsmen || []).map(b => ({
        name: getPlayerName(b.playerId),
        runs: b.runs,
        balls: b.ballsFaced,
        fours: b.fours || 0,
        sixes: b.sixes || 0,
        strikeRate: b.strikeRate || 0
      })),
      ...(liveInningsData?.secondInnings?.batsmen || []).map(b => ({
        name: getPlayerName(b.playerId),
        runs: b.runs,
        balls: b.ballsFaced,
        fours: b.fours || 0,
        sixes: b.sixes || 0,
        strikeRate: b.strikeRate || 0
      }))
    ].sort((a, b) => b.runs - a.runs).slice(0, 10), // Top 10 batsmen
    bowlers: [
      ...(liveInningsData?.firstInnings?.bowlers || []).map(b => ({
        name: getPlayerName(b.playerId),
        overs: b.overs || 0,
        runs: b.runsConceded,
        wickets: b.wickets || 0,
        economy: b.economy || 0
      })),
      ...(liveInningsData?.secondInnings?.bowlers || []).map(b => ({
        name: getPlayerName(b.playerId),
        overs: b.overs || 0,
        runs: b.runsConceded,
        wickets: b.wickets || 0,
        economy: b.economy || 0
      }))
    ].sort((a, b) => b.wickets - a.wickets).slice(0, 10) // Top 10 bowlers
  };

  // Design Primitives
  const Lbl = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: D.textMuted }}>{children}</div>
  );

  return (
    <div style={{ background: D.base, minHeight: '100vh', paddingBottom: '80px', color: D.textPrimary }}>
      <GlobalStyles />
      {/* Top Navigation Bar */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/matches" style={{ display: 'flex', alignItems: 'center', color: D.textSecondary, textDecoration: 'none' }} className="hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span style={{ fontFamily: D.head, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '11px' }}>Back to Matches</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href={`/matches/${match.id}/pre-match`}>
              <Button variant="outline" size="sm" className="gap-2">
                <span className="hidden sm:inline">Pre-Match</span>
              </Button>
            </Link>
            <Link href={`/matches/${match.id}/score`}>
              <Button size="sm" className="gap-2">
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">Start Scoring</span>
              </Button>
            </Link>
            <PrintableMatchReport matchData={reportData} />
            <Button variant="ghost" size="icon" style={{ color: D.textMuted }}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" style={{ color: D.textMuted }}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Match Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              background: match.status === 'live' ? `${D.rose}22` : D.surf2,
              color: match.status === 'live' ? D.rose : D.textSecondary,
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              border: `1px solid ${match.status === 'live' ? `${D.rose}44` : D.border}`
            }}>
              {match.status}
            </div>
            {match.isDayNight && (
              <div style={{
                background: `${D.violet}15`,
                color: D.violet,
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                border: `1px solid ${D.violet}33`,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Moon className="w-3 h-3" />
                Day/Night
              </div>
            )}
            <div style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: D.textMuted }}>
              {match.venue} • {match.dateTime ? new Date(match.dateTime).toLocaleDateString() : 'Date TBA'}
            </div>
          </div>
          
          <h1 style={{ fontFamily: D.head, fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 800, textTransform: 'uppercase', lineHeight: 0.9, letterSpacing: '-0.02em', marginBottom: '16px' }}>
            <span style={{ color: '#EAB308' }}>{homeTeamName}</span>
            <span style={{ color: D.textMuted, fontSize: '0.5em', margin: '0 16px', verticalAlign: 'middle' }}>VS</span>
            <span style={{ color: '#3B82F6' }}>{awayTeamName}</span>
          </h1>

          {match.result && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: `${D.emerald}15`,
              color: D.emerald,
              padding: '6px 16px',
              borderRadius: '6px',
              fontFamily: D.head,
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              border: `1px solid ${D.emerald}33`
            }}>
              {match.result}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${D.border}`, marginBottom: '24px', overflowX: 'auto', gap: '8px' }}>
          {[
            { id: 'overview', label: 'Overview', icon: null },
            { id: 'scorecard', label: 'Scorecard', icon: null },
            { id: 'analytics', label: 'Analytics', icon: null },
            { id: 'impact', label: 'Impact', icon: <Zap className="w-3.5 h-3.5" /> },
            { id: 'broadcast', label: 'Broadcast', icon: <Play className="w-3.5 h-3.5" /> },
            { id: 'squads', label: 'Squads', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'commentary', label: 'Commentary', icon: null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '12px 20px',
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: activeTab === tab.id ? D.emerald : D.textMuted,
                borderBottom: `2px solid ${activeTab === tab.id ? D.emerald : 'transparent'}`,
                cursor: 'pointer',
                transition: 'all .25s cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: activeTab === tab.id ? 1 : 0.6,
              }}
              className="hover:opacity-100"
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (Main) */}
          <div className="lg:col-span-8 space-y-8">
            
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'fadeIn 0.4s ease' }}>
                {/* Impact Highlights Carousel */}
                <div style={{ background: D.surf1, borderRadius: D.xl, border: `1px solid ${D.border}`, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 20px', borderBottom: `1px solid ${D.border}`, background: `${D.surf2}44` }}>
                    <Lbl>Impact Highlights</Lbl>
                  </div>
                  <ImpactHighlights events={matchImpactEvents} />
                </div>

                {/* Match MVP Section */}
                {mvp ? (
                  <MatchMVP mvp={mvp} player={mvpPlayer} />
                ) : (
                  <div style={{ background: `linear-gradient(145deg, ${D.surf1}, ${D.surf2})`, borderRadius: D.xl, padding: '24px', border: `1px solid ${D.border}`, position: 'relative', overflow: 'hidden' }}>
                     <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '300px', height: '300px', background: `${D.amber}05`, filter: 'blur(60px)', borderRadius: '50%' }} />
                     <Lbl>Projected Match MVP</Lbl>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '16px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: D.surf3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Users className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                          <div style={{ fontFamily: D.head, fontSize: '24px', fontWeight: 800, textTransform: 'uppercase', color: D.textPrimary }}>Star Player</div>
                          <div style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: D.amber }}>Potential MVP</div>
                        </div>
                     </div>
                  </div>
                )}

                {/* Match Momentum Chart */}
                <div style={{ background: D.surf1, borderRadius: D.xl, border: `1px solid ${D.border}`, padding: '24px' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <Lbl>Match Momentum</Lbl>
                  </div>
                  <MatchMomentumChart 
                    matchImpactEvents={matchImpactEvents}
                    homeTeamName={homeTeamName}
                    awayTeamName={awayTeamName}
                  />
                </div>

                {/* Match Summary Charts */}
                {hasInningsData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div style={{ background: D.surf1, borderRadius: D.xl, border: `1px solid ${D.border}`, padding: '24px' }}>
                      <div style={{ marginBottom: '16px' }}>
                        <Lbl>Run Rate Comparison (Manhattan)</Lbl>
                      </div>
                      <ManhattanChart innings={liveInningsData!.firstInnings as any} />
                    </div>
                    <div style={{ background: D.surf1, borderRadius: D.xl, border: `1px solid ${D.border}`, padding: '24px' }}>
                      <div style={{ marginBottom: '16px' }}>
                        <Lbl>Innings Progression (Worm)</Lbl>
                      </div>
                      <WormChart 
                        innings1={liveInningsData!.firstInnings as any}
                        innings2={liveInningsData!.secondInnings as any}
                        team1Name={homeTeamName}
                        team2Name={awayTeamName}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '48px', textAlign: 'center', borderRadius: D.xl, border: `2px dashed ${D.border}`, background: 'transparent' }}>
                    <p style={{ color: D.textMuted, fontFamily: D.body }}>Match data waiting to initialize...</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'scorecard' && (
              <>
                {hasInningsData ? (
                  <div className="space-y-8">
                    {/* First Innings */}
                    {liveInningsData!.firstInnings && (
                      <ScorecardTable
                        innings={liveInningsData!.firstInnings}
                        teamName={
                          liveInningsData!.firstInnings.teamId === homeTeam?.id
                            ? homeTeamName
                            : awayTeamName
                        }
                        allPlayers={displayPlayers}
                        playerImpact={playerImpact}
                      />
                    )}
                    
                    {/* Second Innings */}
                    {liveInningsData!.secondInnings && (
                      <ScorecardTable
                        innings={liveInningsData!.secondInnings}
                        teamName={
                          liveInningsData!.secondInnings.teamId === homeTeam?.id
                            ? homeTeamName
                            : awayTeamName
                        }
                        allPlayers={displayPlayers}
                        playerImpact={playerImpact}
                      />
                    )}
                  </div>
                ) : (
                  <Card className="p-8 text-center border-dashed border-border bg-transparent">
                    <p className="text-muted-foreground">No scorecard data available yet</p>
                  </Card>
                )}
              </>
            )}

            {activeTab === 'analytics' && hasInningsData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'fadeIn 0.4s ease' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  <div style={{ background: D.surf1, borderRadius: D.xl, border: `1px solid ${D.border}`, padding: '24px' }}>
                    <div style={{ marginBottom: '20px' }}>
                       <Lbl>Wagon Wheel ({homeTeamName})</Lbl>
                    </div>
                    <WagonWheel innings={liveInningsData!.firstInnings as any} />
                  </div>
                  {liveInningsData!.secondInnings && (
                    <div style={{ background: D.surf1, borderRadius: D.xl, border: `1px solid ${D.border}`, padding: '24px' }}>
                      <div style={{ marginBottom: '20px' }}>
                        <Lbl>Wagon Wheel ({awayTeamName})</Lbl>
                      </div>
                      <WagonWheel innings={liveInningsData!.secondInnings as any} />
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    <div style={{ background: D.surf1, borderRadius: D.xl, border: `1px solid ${D.border}`, padding: '24px' }}>
                      <div style={{ marginBottom: '20px' }}>
                        <Lbl>Run Rate (Manhattan)</Lbl>
                      </div>
                      <ManhattanChart innings={liveInningsData!.firstInnings as any} />
                    </div>
                    <div style={{ background: D.surf1, borderRadius: D.xl, border: `1px solid ${D.border}`, padding: '24px' }}>
                      <div style={{ marginBottom: '20px' }}>
                        <Lbl>Innings Progression (Worm)</Lbl>
                      </div>
                      <WormChart 
                        innings1={liveInningsData!.firstInnings as any}
                        innings2={liveInningsData!.secondInnings as any}
                        team1Name={homeTeamName}
                        team2Name={awayTeamName}
                      />
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'impact' && (
              <div style={{ background: D.surf1, borderRadius: D.xl, border: `1px solid ${D.border}`, overflow: 'hidden', animation: 'fadeIn 0.4s ease' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${D.border}`, background: `${D.surf2}44` }}>
                  <Lbl>Player Impact Breakdown</Lbl>
                </div>
                <ImpactTab 
                  playerImpact={playerImpact} 
                  players={displayPlayers} 
                />
              </div>
            )}

            {activeTab === 'squads' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'fadeIn 0.4s ease' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Home Team Squad */}
                  <div style={{ background: D.surf1, borderRadius: D.xl, border: `1px solid ${D.border}`, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${D.border}`, background: `linear-gradient(90deg, #EAB30822, transparent)` }}>
                      <Lbl>{homeTeamName} Squad</Lbl>
                    </div>
                    <div style={{ padding: '8px' }}>
                      {homeRoster.length > 0 ? (
                        homeRoster.map((player) => (
                          <div key={player.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', borderRadius: D.lg }} className="hover:bg-white/5 transition-colors">
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: D.surf3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: D.textSecondary }}>
                              {player.firstName[0]}{player.lastName[0]}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 700, color: D.textPrimary }}>{player.firstName} {player.lastName}</div>
                              <div style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: D.textMuted }}>
                                {player.battingStyle || 'Player'}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: D.textMuted, fontSize: '13px' }}>No players assigned to return to {homeTeamName}</div>
                      )}
                    </div>
                  </div>

                  {/* Away Team Squad */}
                  <div style={{ background: D.surf1, borderRadius: D.xl, border: `1px solid ${D.border}`, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${D.border}`, background: `linear-gradient(90deg, #3B82F622, transparent)` }}>
                      <Lbl>{awayTeamName} Squad</Lbl>
                    </div>
                    <div style={{ padding: '8px' }}>
                      {awayRoster.length > 0 ? (
                        awayRoster.map((player) => (
                          <div key={player.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', borderRadius: D.lg }} className="hover:bg-white/5 transition-colors">
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: D.surf3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: D.textSecondary }}>
                              {player.firstName[0]}{player.lastName[0]}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 700, color: D.textPrimary }}>{player.firstName} {player.lastName}</div>
                              <div style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: D.textMuted }}>
                                {player.battingStyle || 'Player'}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: D.textMuted, fontSize: '13px' }}>No players assigned to return to {awayTeamName}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'commentary' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', animation: 'fadeIn 0.4s ease' }}>
                {(liveScore?.ballHistory || []).slice().reverse().map((ball, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    padding: '16px', 
                    borderRadius: D.lg, 
                    background: D.surf1, 
                    border: `1px solid ${D.border}`,
                    alignItems: 'flex-start',
                    transition: 'border-color 0.2s ease'
                  }}>
                    <div style={{ 
                      width: '48px', 
                      textAlign: 'right', 
                      fontFamily: D.mono, 
                      fontSize: '13px', 
                      fontWeight: 700, 
                      color: D.textMuted,
                      paddingTop: '2px'
                    }}>
                      {ball.overNumber}.{ball.ballInOver}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ 
                        fontSize: '14px', 
                        lineHeight: '1.6',
                        fontFamily: D.body,
                        margin: 0,
                        color: ball.isWicket ? D.rose :
                               ball.runs === 6 ? D.amber :
                               ball.runs === 4 ? D.sky :
                               D.textPrimary,
                        fontWeight: (ball.isWicket || ball.runs >= 4) ? 700 : 400
                      }}>
                        {ball.commentary || `${getPlayerName(ball.bowlerId)} to ${getPlayerName(ball.strikerId)}, ${ball.runs} runs.`}
                      </p>
                    </div>
                    <div style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>
                      {ball.isWicket && <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: D.rose, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900 }}>W</div>}
                      {ball.runs === 6 && <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: D.amber, color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900 }}>6</div>}
                      {ball.runs === 4 && <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: D.sky, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900 }}>4</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'broadcast' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PerformanceWorm />
                <div className="relative h-[400px] bg-black/40 rounded-[2.5rem] border border-white/5 overflow-hidden flex items-center justify-center group">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-primary fill-primary" />
                    </div>
                    <p className="text-xl font-black text-white uppercase italic tracking-tighter" style={{ fontFamily: D.syne }}>
                      PREVIEW <span className="text-primary">BROADCAST</span> OVERLAY
                    </p>
                    <p className="text-sm text-white/40 mt-2 font-medium">Click to toggle TV-style match theatre</p>
                  </div>
                  {/* The BroadcastOverlay is fixed, so it will appear over the whole screen when this tab is active or a state is toggled */}
                  {/* For preview purposes in the tab, we show a simulated one or just let the fixed one render */}
                  <BroadcastOverlay 
                    score={(currentMatch as any).currentInnings?.runs?.toString() || "142"}
                    wickets={(currentMatch as any).currentInnings?.wickets || 3}
                    overs={(currentMatch as any).currentInnings?.overs?.toString() || "15.4"}
                    batterName="Liam Peterson"
                    batterRuns={48}
                    batterBalls={32}
                    bowlerName="K. Rabada"
                    bowlerFigures="3.4-0-22-2"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div style={{ background: D.surf1, borderRadius: D.xl, border: `1px solid ${D.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${D.border}`, background: `${D.surf2}44` }}>
                <Lbl>Match Info</Lbl>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: `1px solid ${D.border}44` }}>
                  <span style={{ fontSize: '12px', color: D.textMuted, fontFamily: D.head, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Toss</span>
                  <span style={{ fontSize: '13px', color: D.textPrimary, fontFamily: D.body, fontWeight: 600 }}>{match.tossWinnerId ? `${match.tossWinnerId} elected to ${match.tossDecision}` : 'TBA'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: `1px solid ${D.border}44` }}>
                  <span style={{ fontSize: '12px', color: D.textMuted, fontFamily: D.head, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Umpires</span>
                  <span style={{ fontSize: '13px', color: D.textPrimary, fontFamily: D.body, fontWeight: 600 }}>{match.umpires?.join(", ") || "TBA"}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: D.textMuted, fontFamily: D.head, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Referee</span>
                  <span style={{ fontSize: '13px', color: D.textPrimary, fontFamily: D.body, fontWeight: 600 }}>{match.referee || "TBA"}</span>
                </div>
              </div>
            </div>

            <div style={{ background: D.surf1, borderRadius: D.xl, border: `1px solid ${D.border}`, overflow: 'hidden' }}>
               <div style={{ padding: '12px 16px', borderBottom: `1px solid ${D.border}`, background: `${D.surf2}44` }}>
                <Lbl>Key Stats</Lbl>
              </div>
              <div style={{ padding: '20px', gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '16px' }}>
                <div style={{ textAlign: 'center', padding: '16px', background: `${D.sky}11`, borderRadius: D.lg, border: `1px solid ${D.sky}22` }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: D.sky, fontFamily: D.head }}>
                    {liveScore?.currentInnings?.runRate?.toFixed(1) || '0.0'}
                  </div>
                  <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: D.textMuted, letterSpacing: '0.1em', marginTop: '4px' }}>Run Rate</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', background: `${D.amber}11`, borderRadius: D.lg, border: `1px solid ${D.amber}22` }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: D.amber, fontFamily: D.head }}>
                    {liveScore?.extras?.total || 0}
                  </div>
                  <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: D.textMuted, letterSpacing: '0.1em', marginTop: '4px' }}>Extras</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Score Overlay */}
      <ScoreOverlay 
        battingTeam={mockBattingTeam}
        bowlingTeam={mockBowlingTeam}
        matchStatus={typeof currentMatch.result === 'object' ? (currentMatch.result as any).resultText : (currentMatch.result || "Live")}
        recentBalls={(liveScore?.currentOver || []).map(b => b.isWicket ? "W" : b.runs.toString())}
      />
    </div>
  );
}
