"use client";

import { useState } from "react";
import { Match, Team, Innings, Person } from "@/types/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ManhattanChart } from "@/components/charts/ManhattanChart";
import { WormChart } from "@/components/charts/WormChart";
import { WagonWheel } from "@/components/charts/WagonWheel";
import { ScoreOverlay } from "@/components/match/ScoreOverlay";
import { PlayerCard } from "@/components/match/PlayerCard";
import { ScorecardTable } from "@/components/match/ScorecardTable";
import Link from "next/link";
import { ChevronLeft, Share2, RefreshCw, Play, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PrintableMatchReport } from "@/components/match/PrintableMatchReport";

interface MatchDetailClientProps {
  match: Match;
  homeTeam?: Team;
  awayTeam?: Team;
  players?: Person[];
}

export function MatchDetailClient({ match, homeTeam, awayTeam, players = [] }: MatchDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'scorecard' | 'analytics' | 'commentary'>('overview');

  const hasInningsData = match.inningsData && match.inningsData.firstInnings;
  const homeTeamName = homeTeam?.name || "Home Team";
  const awayTeamName = awayTeam?.name || "Away Team";

  // Helper to get player name
  const getPlayerName = (id: string) => {
    const p = players.find(p => p.id === id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown Player';
  };

  // Mock Data for Visuals (replace with real data when available)
  const mockBattingTeam = {
    name: homeTeamName,
    shortName: homeTeam?.abbreviatedName || homeTeamName.substring(0, 3).toUpperCase(),
    score: match.score?.home || "0/0",
    overs: "20.0",
    color: "bg-fox-gold",
  };

  const mockBowlingTeam = {
    name: awayTeamName,
    shortName: awayTeam?.abbreviatedName || awayTeamName.substring(0, 3).toUpperCase(),
    score: match.score?.away || "0/0",
    color: "bg-fox-blue",
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

  // Use real players or fallback to mock if empty (for dev)
  const displayPlayers = players.length > 0 ? players : [
    { id: '1', firstName: 'Player', lastName: 'One' } as Person,
    { id: '2', firstName: 'Player', lastName: 'Two' } as Person,
    { id: '3', firstName: 'Player', lastName: 'Three' } as Person,
  ];

  // Construct match data for report
  const reportData = {
    id: match.id,
    homeTeam: homeTeamName,
    awayTeam: awayTeamName,
    venue: match.venue || 'TBA',
    date: match.dateTime ? new Date(match.dateTime).toLocaleDateString() : 'Date TBA',
    format: match.matchType || 'T20',
    result: match.result,
    totalRuns: (match.inningsData?.firstInnings?.runs || 0) + (match.inningsData?.secondInnings?.runs || 0),
    totalWickets: (match.inningsData?.firstInnings?.wickets || 0) + (match.inningsData?.secondInnings?.wickets || 0),
    batsmen: [
      ...(match.inningsData?.firstInnings?.batsmen || []).map(b => ({
        name: getPlayerName(b.playerId),
        runs: b.runs,
        balls: b.ballsFaced,
        fours: b.fours || 0,
        sixes: b.sixes || 0,
        strikeRate: b.strikeRate || 0
      })),
      ...(match.inningsData?.secondInnings?.batsmen || []).map(b => ({
        name: getPlayerName(b.playerId),
        runs: b.runs,
        balls: b.ballsFaced,
        fours: b.fours || 0,
        sixes: b.sixes || 0,
        strikeRate: b.strikeRate || 0
      }))
    ].sort((a, b) => b.runs - a.runs).slice(0, 10), // Top 10 batsmen
    bowlers: [
      ...(match.inningsData?.firstInnings?.bowlers || []).map(b => ({
        name: getPlayerName(b.playerId),
        overs: b.overs || 0,
        runs: b.runsConceded,
        wickets: b.wickets || 0,
        economy: b.economy || 0
      })),
      ...(match.inningsData?.secondInnings?.bowlers || []).map(b => ({
        name: getPlayerName(b.playerId),
        overs: b.overs || 0,
        runs: b.runsConceded,
        wickets: b.wickets || 0,
        economy: b.economy || 0
      }))
    ].sort((a, b) => b.wickets - a.wickets).slice(0, 10) // Top 10 bowlers
  };

  return (
    <div className="min-h-screen bg-background pb-32 text-foreground font-sans">
      {/* Top Navigation Bar */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/matches" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="font-medium uppercase tracking-wide text-xs">Back to Matches</span>
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
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Match Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant={match.status === 'live' ? 'destructive' : 'secondary'} className="uppercase tracking-wider font-bold">
              {match.status}
            </Badge>
            {match.isDayNight && (
              <Badge variant="outline" className="uppercase tracking-wider font-bold border-indigo-500 text-indigo-500 gap-1">
                <Moon className="w-3 h-3" />
                Day/Night
              </Badge>
            )}
            <span className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
              {match.venue} • {match.dateTime ? new Date(match.dateTime).toLocaleDateString() : 'Date TBA'}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight leading-none mb-4">
            <span className="text-fox-gold">{homeTeamName}</span> <span className="text-muted-foreground text-2xl align-middle mx-2">vs</span> <span className="text-fox-blue">{awayTeamName}</span>
          </h1>
          {match.result && (
            <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded font-bold uppercase tracking-wide text-sm">
              {match.result}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-6 overflow-x-auto">
          {['overview', 'scorecard', 'analytics', 'commentary'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "px-6 py-3 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab 
                  ? "border-fox-blue text-fox-blue" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (Main) */}
          <div className="lg:col-span-8 space-y-8">
            
            {activeTab === 'overview' && (
              <>
                {/* Featured Player */}
                <PlayerCard 
                  name="Star Player" 
                  role="Batsman" 
                  stats={mockPlayerStats} 
                  teamColor="bg-fox-gold"
                />

                {/* Match Summary Charts */}
                {hasInningsData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-card border-border">
                      <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Run Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ManhattanChart innings={match.inningsData!.firstInnings as any} />
                      </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                      <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Worm</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <WormChart 
                          innings1={match.inningsData!.firstInnings as any}
                          innings2={match.inningsData!.secondInnings as any}
                          team1Name={homeTeamName}
                          team2Name={awayTeamName}
                        />
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="p-8 text-center border-dashed border-border bg-transparent">
                    <p className="text-muted-foreground">Match data waiting to initialize...</p>
                  </Card>
                )}
              </>
            )}

            {activeTab === 'scorecard' && (
              <>
                {hasInningsData ? (
                  <div className="space-y-8">
                    {/* First Innings */}
                    {match.inningsData!.firstInnings && (
                      <ScorecardTable
                        innings={match.inningsData!.firstInnings}
                        teamName={
                          match.inningsData!.firstInnings.teamId === homeTeam?.id
                            ? homeTeamName
                            : awayTeamName
                        }
                        allPlayers={displayPlayers}
                      />
                    )}
                    
                    {/* Second Innings */}
                    {match.inningsData!.secondInnings && (
                      <ScorecardTable
                        innings={match.inningsData!.secondInnings}
                        teamName={
                          match.inningsData!.secondInnings.teamId === homeTeam?.id
                            ? homeTeamName
                            : awayTeamName
                        }
                        allPlayers={displayPlayers}
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
              <div className="grid grid-cols-1 gap-6">
                 <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Wagon Wheel ({homeTeamName})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WagonWheel innings={match.inningsData!.firstInnings as any} />
                  </CardContent>
                </Card>
                {match.inningsData!.secondInnings && (
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Wagon Wheel ({awayTeamName})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <WagonWheel innings={match.inningsData!.secondInnings as any} />
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'commentary' && (
              <div className="space-y-4">
                {mockCommentary.map((comm, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded bg-card border border-border hover:border-primary/50 transition-colors">
                    <div className="w-12 text-right font-mono font-bold text-muted-foreground pt-1">
                      {comm.over}
                    </div>
                    <div className="flex-1">
                      <p className={cn(
                        "text-sm leading-relaxed",
                        comm.type === 'wicket' ? "text-red-500 font-bold" :
                        comm.type === 'six' ? "text-fox-gold font-bold" :
                        comm.type === 'four' ? "text-fox-blue font-bold" :
                        "text-foreground"
                      )}>
                        {comm.text}
                      </p>
                    </div>
                    <div className="w-8">
                      {comm.type === 'wicket' && <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">W</span>}
                      {comm.type === 'six' && <span className="w-6 h-6 rounded-full bg-fox-gold text-black flex items-center justify-center text-xs font-bold">6</span>}
                      {comm.type === 'four' && <span className="w-6 h-6 rounded-full bg-fox-blue text-white flex items-center justify-center text-xs font-bold">4</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-card border-border p-0 overflow-hidden">
              <div className="bg-secondary/50 p-3 border-b border-border">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Match Info</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-sm text-muted-foreground">Toss</span>
                  <span className="text-sm font-medium">{match.tossWinnerId ? `${match.tossWinnerId} elected to ${match.tossDecision}` : 'TBA'}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-sm text-muted-foreground">Umpires</span>
                  <span className="text-sm font-medium">{match.umpires?.join(", ") || "TBA"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Referee</span>
                  <span className="text-sm font-medium">{match.referee || "TBA"}</span>
                </div>
              </div>
            </Card>

            <Card className="bg-card border-border p-0 overflow-hidden">
               <div className="bg-secondary/50 p-3 border-b border-border">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Key Stats</h3>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <div className="text-center p-2 bg-background rounded">
                  <div className="text-2xl font-bold text-fox-blue">6.4</div>
                  <div className="text-[10px] uppercase text-muted-foreground">Run Rate</div>
                </div>
                <div className="text-center p-2 bg-background rounded">
                  <div className="text-2xl font-bold text-fox-gold">14</div>
                  <div className="text-[10px] uppercase text-muted-foreground">Extras</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky Score Overlay */}
      <ScoreOverlay 
        battingTeam={mockBattingTeam}
        bowlingTeam={mockBowlingTeam}
        matchStatus={match.result || "Live"}
        recentBalls={["1", "0", "4", "W", "1", "6"]}
      />
    </div>
  );
}
