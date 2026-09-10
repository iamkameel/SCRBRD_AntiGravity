"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Innings, Over, Ball } from "@/types/firestore";
import { BallEvent } from "@/types/schema_v4";
import { replayInningsEvents } from "@/services/scoring/replayEngine";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ScorecardProps {
  innings: Innings;
  teamName: string;
  opponentName: string;
  className?: string;
  ballEvents?: BallEvent[];
  playerNamesMap?: Record<string, string>;
}

interface BattingEntry {
  playerId: string;
  playerName: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  dismissal?: string;
}

interface BowlingEntry {
  bowlerId: string;
  bowlerName: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
}

export function Scorecard({
  innings,
  teamName,
  opponentName,
  className,
  ballEvents,
  playerNamesMap = {}
}: ScorecardProps) {
  // Use Replay Engine if ballEvents are provided or present in innings
  const events = ballEvents || (innings as any).events;
  const useReplay = events && Array.isArray(events) && events.length > 0;

  let battingStats: BattingEntry[] = [];
  let bowlingStats: BowlingEntry[] = [];
  let extras = { byes: 0, legByes: 0, wides: 0, noBalls: 0, total: 0 };
  let totalRuns = innings.runs || 0;
  let wickets = innings.wickets || 0;
  let oversDisplay = `${Math.floor(innings.overs || 0)}.${(((innings.overs || 0) % 1) * 6).toFixed(0)}`;

  if (useReplay) {
    const replay = replayInningsEvents(events);
    totalRuns = replay.runs;
    wickets = replay.wickets;
    oversDisplay = replay.oversDisplay;

    battingStats = replay.batsmen.map(b => ({
      playerId: b.playerId,
      playerName: playerNamesMap[b.playerId] || `Player ${b.playerId.slice(0, 6)}`,
      runs: b.runs,
      balls: b.ballsFaced,
      fours: b.fours,
      sixes: b.sixes,
      strikeRate: b.strikeRate,
      dismissal: b.dismissal ? b.dismissal.description : undefined
    }));

    bowlingStats = replay.bowlers.map(b => ({
      bowlerId: b.playerId,
      bowlerName: playerNamesMap[b.playerId] || `Bowler ${b.playerId.slice(0, 6)}`,
      overs: b.overs,
      maidens: b.maidens,
      runs: b.runsConceded,
      wickets: b.wickets,
      economy: b.economy
    }));

    extras = {
      byes: replay.extras.byes,
      legByes: replay.extras.legByes,
      wides: replay.extras.wides,
      noBalls: replay.extras.noBalls,
      total: replay.extras.total
    };
  } else {
    battingStats = calculateBattingStats(innings);
    bowlingStats = calculateBowlingStats(innings);
    extras = calculateExtras(innings);
  }

  // Design System (from scoring-dialog.tsx)
  const statColors = {
    runs: "text-green-600",
    wickets: "text-red-600",
    economy: "text-blue-600",
    strikeRate: "text-purple-600"
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{teamName}</h2>
            <p className="text-muted-foreground mt-1">vs {opponentName}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">
              {totalRuns}/{wickets}
            </div>
            <div className="text-muted-foreground font-mono">
              {oversDisplay} overs {useReplay && <Badge variant="outline" className="ml-2 text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Replay Verified</Badge>}
            </div>
          </div>
        </div>
      </Card>

      {/* Batting Card */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Batting</h3>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="pb-3 font-semibold">Batsman</th>
                <th className="pb-3 font-semibold text-right">R</th>
                <th className="pb-3 font-semibold text-right">B</th>
                <th className="pb-3 font-semibold text-right">4s</th>
                <th className="pb-3 font-semibold text-right">6s</th>
                <th className="pb-3 font-semibold text-right">SR</th>
              </tr>
            </thead>
            <tbody>
              {battingStats.map((entry, idx) => (
                <tr key={idx} className="border-b last:border-b-0">
                  <td className="py-3">
                    <div>
                      <div className="font-semibold">{entry.playerName}</div>
                      {entry.dismissal && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {entry.dismissal}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-right font-semibold">{entry.runs}</td>
                  <td className="py-3 text-right">{entry.balls}</td>
                  <td className="py-3 text-right">{entry.fours}</td>
                  <td className="py-3 text-right">{entry.sixes}</td>
                  <td className="py-3 text-right">
                    <Badge variant="secondary" className="text-xs">
                      {entry.strikeRate.toFixed(1)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {battingStats.map((entry, idx) => (
            <Card key={idx} className="p-4 bg-muted/30">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold">{entry.playerName}</div>
                  {entry.dismissal && (
                    <div className="text-xs text-muted-foreground">{entry.dismissal}</div>
                  )}
                </div>
                <div className="text-2xl font-bold">{entry.runs}</div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">Balls</div>
                  <div className="font-semibold">{entry.balls}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">4s</div>
                  <div className="font-semibold">{entry.fours}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">6s</div>
                  <div className="font-semibold">{entry.sixes}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">SR</div>
                  <div className="font-semibold">{entry.strikeRate.toFixed(1)}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Extras */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Extras</span>
            <span className="font-semibold">
              {extras.total} (b {extras.byes}, lb {extras.legByes}, w {extras.wides}, nb {extras.noBalls})
            </span>
          </div>
          <div className="flex justify-between text-sm mt-2 font-bold">
            <span>Total</span>
            <span>{totalRuns}/{wickets} ({oversDisplay} overs)</span>
          </div>
        </div>
      </Card>

      {/* Bowling Card */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Bowling</h3>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="pb-3 font-semibold">Bowler</th>
                <th className="pb-3 font-semibold text-right">O</th>
                <th className="pb-3 font-semibold text-right">M</th>
                <th className="pb-3 font-semibold text-right">R</th>
                <th className="pb-3 font-semibold text-right">W</th>
                <th className="pb-3 font-semibold text-right">Econ</th>
              </tr>
            </thead>
            <tbody>
              {bowlingStats.map((entry, idx) => (
                <tr key={idx} className="border-b last:border-b-0">
                  <td className="py-3 font-semibold">{entry.bowlerName}</td>
                  <td className="py-3 text-right">{entry.overs}</td>
                  <td className="py-3 text-right">{entry.maidens}</td>
                  <td className="py-3 text-right">{entry.runs}</td>
                  <td className="py-3 text-right font-semibold">{entry.wickets}</td>
                  <td className="py-3 text-right">
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs",
                        entry.economy < 6 ? "bg-green-600 text-white" : 
                        entry.economy > 9 ? "bg-red-600 text-white" : ""
                      )}
                    >
                      {entry.economy.toFixed(2)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {bowlingStats.map((entry, idx) => (
            <Card key={idx} className="p-4 bg-muted/30">
              <div className="flex items-start justify-between mb-2">
                <div className="font-semibold">{entry.bowlerName}</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-red-600">{entry.wickets}</span>
                  <span className="text-sm text-muted-foreground">/{entry.runs}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">Overs</div>
                  <div className="font-semibold">{entry.overs}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Maidens</div>
                  <div className="font-semibold">{entry.maidens}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Economy</div>
                  <div className={cn(
                    "font-semibold",
                    entry.economy < 6 ? "text-green-600" : 
                    entry.economy > 9 ? "text-red-600" : ""
                  )}>
                    {entry.economy.toFixed(2)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Helper functions
function calculateBattingStats(innings: Innings): BattingEntry[] {
  const batterMap = new Map<string, BattingEntry>();
  
  // Process all balls in all overs
  innings.overHistory?.forEach((over: Over) => {
    over.balls.forEach((ball: Ball) => {
      const batsmanId = ball.batsmanId;
      if (!batsmanId) return;
      
      // Initialize batter entry if not exists
      if (!batterMap.has(batsmanId)) {
        batterMap.set(batsmanId, {
          playerId: batsmanId,
          playerName: `Player ${batsmanId}`, // Note: Look up actual player name from player data
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          strikeRate: 0,
          dismissal: undefined
        });
      }
      
      const batter = batterMap.get(batsmanId)!;
      
      // Count legal deliveries (not wides or no-balls) 
      const isLegal = !ball.extras || (ball.extrasType !== 'wide' && ball.extrasType !== 'noball');
      if (isLegal) {
        batter.balls++;
      }
      
      // Add runs (only runs off bat, not extras)
      batter.runs += ball.runs || 0;
      
      // Count boundaries
      if (ball.runs === 4) batter.fours++;
      if (ball.runs === 6) batter.sixes++;
      
      // Calculate strike rate
      batter.strikeRate = batter.balls > 0 
        ? (batter.runs / batter.balls) * 100 
        : 0;
      
      // Handle dismissal
      if (ball.isWicket && ball.playerOutId === batsmanId) {
        let dismissalText = ball.wicketType || 'out';
        
        // Format dismissal details
        if (ball.bowlerId) {
          const bowlerId = ball.bowlerId;
          if (ball.wicketType === 'Caught' && ball.fielderId) {
            dismissalText = `c ${ball.fielderId} b ${bowlerId}`;
          } else if (['Bowled', 'LBW', 'Hit Wicket'].includes(ball.wicketType || '')) {
            dismissalText = `${ball.wicketType?.toLowerCase()} b ${bowlerId}`;
          } else if (ball.wicketType === 'Stumped' && ball.fielderId) {
            dismissalText = `st ${ball.fielderId} b ${bowlerId}`;
          } else if (ball.wicketType) {
            dismissalText = `${ball.wicketType}`;
          }
        }
        
        batter.dismissal = dismissalText;
      }
    });
  });
  
  return Array.from(batterMap.values());
}

function calculateBowlingStats(innings: Innings): BowlingEntry[] {
  const bowlerMap = new Map<string, BowlingEntry>();
  
  innings.overHistory?.forEach((over: Over) => {
    over.balls.forEach((ball: Ball) => {
      const bowlerId = ball.bowlerId;
      if (!bowlerId) return;
      
      // Initialize bowler entry if not exists
      if (!bowlerMap.has(bowlerId)) {
        bowlerMap.set(bowlerId, {
          bowlerId,
          bowlerName: `Bowler ${bowlerId}`, // Note: Look up actual bowler name
          overs: 0,
          maidens: 0,
          runs: 0,
          wickets: 0,
          economy: 0
        });
      }
      
      const bowler = bowlerMap.get(bowlerId)!;
      
      // Count runs conceded (including extras)
      const totalRuns = (ball.runs || 0) + (ball.extras || 0);
      bowler.runs += totalRuns;
      
      // Count wickets
      if (ball.isWicket) {
        bowler.wickets++;
      }
    });
  });
  
  // Calculate overs bowled and maidens after processing all balls
  innings.overHistory?.forEach((over: Over) => {
    const bowlerId = over.bowlerId;
    if (!bowlerId || !bowlerMap.has(bowlerId)) return;
    
    const bowler = bowlerMap.get(bowlerId)!;
    
    // Count legal balls in this over
    const legalBalls = over.balls.filter(b => 
      !b.extras || (b.extrasType !== 'wide' && b.extrasType !== 'noball')
    ).length;
    
    // Add to overs count (format: overs.balls)
    const fullOvers = Math.floor(legalBalls / 6);
    const remainingBalls = legalBalls % 6;
    bowler.overs += fullOvers + (remainingBalls / 10);
    
    // Check if maiden over (no runs conceded)
    const runsInOver = over.balls.reduce((sum, b) => 
      sum + (b.runs || 0) + (b.extras || 0), 0
    );
    if (runsInOver === 0 && legalBalls >= 6) {
      bowler.maidens++;
    }
  });
  
  // Calculate economy rates
  bowlerMap.forEach(bowler => {
    bowler.economy = bowler.overs > 0 
      ? bowler.runs / bowler.overs 
      : 0;
  });
  
  return Array.from(bowlerMap.values());
}

function calculateExtras(innings: Innings) {
  let byes = 0;
  let legByes = 0;
  let wides = 0;
  let noBalls = 0;
  
  innings.overHistory?.forEach((over: Over) => {
    over.balls.forEach((ball: Ball) => {
      if (ball.extras) {
        switch (ball.extrasType) {
          case 'bye':
            byes += ball.extras;
            break;
          case 'legbye':
            legByes += ball.extras;
            break;
          case 'wide':
            wides += ball.extras;
            break;
          case 'noball':
            noBalls += ball.extras;
            break;
        }
      }
    });
  });
  
  return {
    byes,
    legByes,
    wides,
    noBalls,
    total: byes + legByes + wides + noBalls
  };
}

