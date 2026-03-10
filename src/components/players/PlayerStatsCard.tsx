"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerStats } from "@/app/actions/playerStatsActions";
import { Target, Activity, Shield } from "lucide-react";

interface PlayerStatsCardProps {
  stats: PlayerStats;
}

export function PlayerStatsCard({ stats }: PlayerStatsCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Batting Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-blue-500" />
            Batting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <StatItem label="Matches" value={stats.batting.matches} />
            <StatItem label="Innings" value={stats.batting.innings} />
            <StatItem label="Runs" value={stats.batting.runs} highlight />
            <StatItem label="Average" value={stats.batting.average.toFixed(2)} />
            <StatItem label="Strike Rate" value={stats.batting.strikeRate.toFixed(2)} />
            <StatItem label="High Score" value={stats.batting.highestScore} />
            <StatItem label="50s" value={stats.batting.fifties} />
            <StatItem label="100s" value={stats.batting.hundreds} />
            <StatItem label="4s" value={stats.batting.fours} />
            <StatItem label="6s" value={stats.batting.sixes} />
          </div>
        </CardContent>
      </Card>

      {/* Bowling Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-red-500" />
            Bowling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <StatItem label="Matches" value={stats.bowling.matches} />
            <StatItem label="Innings" value={stats.bowling.innings} />
            <StatItem label="Wickets" value={stats.bowling.wickets} highlight />
            <StatItem label="Average" value={stats.bowling.average.toFixed(2)} />
            <StatItem label="Economy" value={stats.bowling.economy.toFixed(2)} />
            <StatItem label="Best" value={stats.bowling.bestFigures} />
            <StatItem label="5W" value={stats.bowling.fiveWickets} />
            <StatItem label="Maidens" value={stats.bowling.maidens} />
          </div>
        </CardContent>
      </Card>

      {/* Fielding Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-green-500" />
            Fielding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <StatItem label="Catches" value={stats.fielding.catches} highlight />
            <StatItem label="Stumpings" value={stats.fielding.stumpings} />
            <StatItem label="Run Outs" value={stats.fielding.runOuts} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatItem({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`p-2 rounded ${highlight ? 'bg-primary/5' : 'bg-muted/50'}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-primary' : ''}`}>{value}</p>
    </div>
  );
}
