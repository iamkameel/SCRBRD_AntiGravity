"use client";

import { useLiveScore } from "@/hooks/useLiveScore";
import { MatchRecapCard } from "./match-recap-card";
import { Person, Team } from "@/types/firestore";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface MatchSummaryProps {
  matchId: string;
  homeTeam: Team;
  awayTeam: Team;
  allPlayers: Person[];
}

export function MatchSummary({ matchId, homeTeam, awayTeam, allPlayers }: MatchSummaryProps) {
  const { liveScore, loading } = useLiveScore(matchId);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!liveScore || !liveScore.winnerId) {
    return (
      <Card className="p-12 text-center">
        <h3 className="text-xl font-semibold mb-2">Match Not Completed</h3>
        <p className="text-muted-foreground">
          The match summary will be available once the match is completed.
        </p>
      </Card>
    );
  }

  // Helper to find top performers across both innings
  const getAllBatsmen = () => {
    const innings1Batsmen = liveScore.innings1?.batsmen || [];
    const innings2Batsmen = liveScore.innings2?.batsmen || liveScore.batsmen || [];
    return [...innings1Batsmen, ...innings2Batsmen];
  };

  const getAllBowlers = () => {
    const innings1Bowlers = liveScore.innings1?.bowlers || [];
    const innings2Bowlers = liveScore.innings2?.bowlers || liveScore.bowlers || [];
    return [...innings1Bowlers, ...innings2Bowlers];
  };

  const batsmen = getAllBatsmen();
  const bowlers = getAllBowlers();

  // Find top batsman (most runs)
  const topBatsmanStats = batsmen.reduce((prev, current) => {
    return (prev.runs > current.runs) ? prev : current;
  }, batsmen[0] || { runs: 0, ballsFaced: 0, playerId: 'unknown' });

  // Find top bowler (most wickets, then best economy)
  const topBowlerStats = bowlers.reduce((prev, current) => {
    if (prev.wickets > current.wickets) return prev;
    if (current.wickets > prev.wickets) return current;
    return (prev.runsConceded < current.runsConceded) ? prev : current;
  }, bowlers[0] || { wickets: 0, runsConceded: 0, playerId: 'unknown' });

  const getPlayerName = (id: string) => {
    const player = allPlayers.find(p => p.id === id);
    return player ? `${player.firstName} ${player.lastName}` : 'Unknown Player';
  };

  const recap = {
    winner: liveScore.winnerId === homeTeam.id ? homeTeam.name : awayTeam.name,
    margin: liveScore.winMargin || 'N/A',
    topBatsman: {
      name: getPlayerName(topBatsmanStats.playerId),
      runs: topBatsmanStats.runs || 0,
      balls: topBatsmanStats.ballsFaced || 0,
    },
    topBowler: {
      name: getPlayerName(topBowlerStats.playerId),
      wickets: topBowlerStats.wickets || 0,
      runs: topBowlerStats.runsConceded || 0,
    },
    highlights: generateHighlights(liveScore),
    tournamentPoints: {
      team1: 2,
      team2: 0
    }
  };

  return (
    <MatchRecapCard 
      recap={recap}
      homeTeam={homeTeam.name}
      awayTeam={awayTeam.name}
    />
  );
}

// Generate highlights from match data
function generateHighlights(liveScore: any): string[] {
  const highlights: string[] = [];
  
  const processInnings = (innings: any, inningsNumber: number) => {
    if (!innings) return;
    
    const batsmen = innings.batsmen || [];
    const bowlers = innings.bowlers || [];
    const ballHistory = innings.ballHistory || [];
    
    // Wickets
    const wickets = ballHistory.filter((b: any) => b.isWicket);
    wickets.forEach((wicket: any, index: number) => {
      highlights.push(
        `Innings ${inningsNumber}: Wicket ${index + 1} - ${wicket.wicketType || 'Dismissal'}`
      );
    });
    
    // Boundaries (4s and 6s)
    const fours = ballHistory.filter((b: any) => b.runs === 4).length;
    const sixes = ballHistory.filter((b: any) => b.runs === 6).length;
    
    if (fours > 0) {
      highlights.push(`Innings ${inningsNumber}: ${fours} boundaries (4s)`);
    }
    if (sixes > 0) {
      highlights.push(`Innings ${inningsNumber}: ${sixes} sixes`);
    }
    
    // Milestones (50s, 100s, 150s)
    batsmen.forEach((batsman: any) => {
      if (batsman.runs >= 150) {
        highlights.push(`Innings ${inningsNumber}: 150+ score by Player ${batsman.playerId}`);
      } else if (batsman.runs >= 100) {
        highlights.push(`Innings ${inningsNumber}: Century (100) by Player ${batsman.playerId}`);
      } else if (batsman.runs >= 50) {
        highlights.push(`Innings ${inningsNumber}: Half-century (50) by Player ${batsman.playerId}`);
      }
    });
    
    // Hat-tricks
    const wicketBalls = ballHistory.filter((b: any) => b.isWicket);
    for (let i = 0; i < wicketBalls.length - 2; i++) {
      const threeWickets = wicketBalls.slice(i, i + 3);
      const sameBowler = threeWickets.every(
        (w: any) => w.bowlerId === threeWickets[0].bowlerId
      );
      if (sameBowler) {
        highlights.push(
          `Innings ${inningsNumber}: Hat-trick by Bowler ${threeWickets[0].bowlerId}!`
        );
        break; // Only report first hat-trick
      }
    }
    
    // Maiden overs
    // Check if any bowler bowled a maiden
    const bowlersWithMaidens = bowlers.filter((b: any) => (b.maidens || 0) > 0);
    if (bowlersWithMaidens.length > 0) {
      const totalMaidens = bowlersWithMaidens.reduce((sum: number, b: any) => sum + (b.maidens || 0), 0);
      if (totalMaidens > 0) {
        highlights.push(`Innings ${inningsNumber}: ${totalMaidens} maiden over(s)`);
      }
    }
    
    // Exceptional economy (under 4.0)
    const economicalBowlers = bowlers.filter((b: any) => 
      b.overs > 2 && b.economy < 4.0
    );
    economicalBowlers.forEach((bowler: any) => {
      highlights.push(
        `Innings ${inningsNumber}: Economical bowling (${bowler.economy.toFixed(2)}) by Bowler ${bowler.playerId}`
      );
    });
    
    // 5-wicket hauls
    const fiveWicketBowlers = bowlers.filter((b: any) => b.wickets >= 5);
    fiveWicketBowlers.forEach((bowler: any) => {
      highlights.push(
        `Innings ${inningsNumber}: 5-wicket haul by Bowler ${bowler.playerId} (${bowler.wickets} wickets)`
      );
    });
  };
  
  // Process both innings
  if (liveScore.innings1) {
    processInnings(liveScore.innings1, 1);
  }
  if (liveScore.innings2) {
    processInnings(liveScore.innings2, 2);
  }
  
  // If only current innings exists (match in progress)
  if (!liveScore.innings1 && !liveScore.innings2) {
    processInnings(liveScore, 1);
  }
  
  return highlights.length > 0 ? highlights : ['No highlights available'];
}
