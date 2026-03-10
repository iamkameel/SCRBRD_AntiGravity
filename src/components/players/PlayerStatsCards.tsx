"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Player as Person } from "@/lib/store";

interface StatsCardProps {
  player: Person;
}

function TrendIndicator({ value }: { value?: number }) {
  if (!value) return <Minus className="h-4 w-4 text-muted-foreground" />;
  if (value > 0) return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

export function BattingStatsCard({ player }: StatsCardProps) {
  const stats = player.stats as any;
  const runs = stats?.totalRuns || 0;
  const matches = stats?.matchesPlayed || 0;
  const average = stats?.battingAverage || 0;
  const strikeRate = stats?.strikeRate || 0;
  const fifties = stats?.fifties || 0;
  const hundreds = stats?.hundreds || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Batting Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Total Runs</div>
            <div className="text-2xl font-bold">{runs}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Innings</div>
            <div className="text-2xl font-bold">{matches}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Average</div>
            <div className="text-2xl font-bold">{average.toFixed(2)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Strike Rate</div>
            <div className="text-2xl font-bold">{strikeRate.toFixed(2)}</div>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-border/50">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>50s</span>
              <span className="font-medium">{fifties}</span>
            </div>
            <Progress value={(fifties / (matches || 1)) * 100} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>100s</span>
              <span className="font-medium">{hundreds}</span>
            </div>
            <Progress value={(hundreds / (matches || 1)) * 100} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BowlingStatsCard({ player }: StatsCardProps) {
  const stats = player.stats as any;
  const wickets = stats?.wicketsTaken || 0;
  const matches = stats?.matchesPlayed || 0;
  const average = stats?.bowlingAverage || 0;
  const economy = stats?.economyRate || 0;
  const bestFigures = stats?.bestBowlingFigures || "-";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Bowling Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Wickets</div>
            <div className="text-2xl font-bold">{wickets}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Best Figures</div>
            <div className="text-2xl font-bold">{bestFigures}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Average</div>
            <div className="text-2xl font-bold">{average.toFixed(2)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Economy</div>
            <div className="text-2xl font-bold">{economy.toFixed(2)}</div>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-border/50">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Wickets per Match</span>
              <span className="font-medium">{(wickets / (matches || 1)).toFixed(1)}</span>
            </div>
            <Progress value={(wickets / (matches || 1)) * 20} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FieldingStatsCard({ player }: StatsCardProps) {
  const stats = player.stats as any;
  const catches = stats?.catchesTaken || 0;
  const runOuts = stats?.runOuts || 0;
  const stumpings = stats?.stumpings || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Fielding Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1 text-center">
            <div className="text-sm text-muted-foreground">Catches</div>
            <div className="text-2xl font-bold">{catches}</div>
          </div>
          <div className="space-y-1 text-center">
            <div className="text-sm text-muted-foreground">Run Outs</div>
            <div className="text-2xl font-bold">{runOuts}</div>
          </div>
          <div className="space-y-1 text-center">
            <div className="text-sm text-muted-foreground">Stumpings</div>
            <div className="text-2xl font-bold">{stumpings}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
