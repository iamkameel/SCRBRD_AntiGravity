"use client";

import { AnalyticsWormChart as WormChart, AnalyticsManhattanChart as ManhattanChart } from "@/components/charts/lazy";
import { Innings } from "@/types/firestore";

interface MatchAnalyticsDashboardProps {
  innings1?: Innings | null;
  innings2?: Innings | null;
  homeTeamName: string;
  awayTeamName: string;
  battingFirst: 'home' | 'away';
}

export function MatchAnalyticsDashboard({
  innings1,
  innings2,
  homeTeamName,
  awayTeamName,
  battingFirst
}: MatchAnalyticsDashboardProps) {
  
  if (!innings1) return null;

  // Helper to process innings data for charts
  const processInningsData = (innings: Innings) => {
    let cumulativeRuns = 0;
    return (innings.overHistory || []).map(over => {
      const runsInOver = over.balls.reduce((sum, b) => sum + b.runs + (b.extras || 0), 0);
      const wicketsInOver = over.balls.filter(b => b.isWicket).length;
      cumulativeRuns += runsInOver;
      
      return {
        over: over.overNumber,
        runs: runsInOver,
        wickets: wicketsInOver,
        cumulativeRuns
      };
    });
  };

  const innings1Data = processInningsData(innings1);
  const innings2Data = innings2 ? processInningsData(innings2) : undefined;

  const team1Name = battingFirst === 'home' ? homeTeamName : awayTeamName;
  const team2Name = battingFirst === 'home' ? awayTeamName : homeTeamName;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Worm Chart - Always visible if we have data */}
      <div className="lg:col-span-2">
        <WormChart 
          innings1Data={innings1Data.map(d => ({ over: d.over, runs: d.cumulativeRuns }))}
          innings2Data={innings2Data?.map(d => ({ over: d.over, runs: d.cumulativeRuns }))}
          team1Name={team1Name}
          team2Name={innings2 ? team2Name : undefined}
        />
      </div>

      {/* Manhattan Charts */}
      <ManhattanChart 
        data={innings1Data} 
        teamName={team1Name} 
      />
      
      {innings2Data && (
        <ManhattanChart 
          data={innings2Data} 
          teamName={team2Name} 
        />
      )}
    </div>
  );
}
