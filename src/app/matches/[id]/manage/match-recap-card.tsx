"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Award, Target, Flame, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchRecap {
  winner: string;
  margin: string;
  manOfTheMatch?: {
    name: string;
    performance: string;
  };
  topBatsman: {
    name: string;
    runs: number;
    balls: number;
  };
  topBowler: {
    name: string;
    wickets: number;
    runs: number;
  };
  highlights: string[];
  tournamentPoints?: {
    team1: number;
    team2: number;
  };
}

interface MatchRecapCardProps {
  recap: MatchRecap;
  homeTeam: string;
  awayTeam: string;
  className?: string;
}

export function MatchRecapCard({
  recap,
  homeTeam,
  awayTeam,
  className
}: MatchRecapCardProps) {
  const isHomeWinner = recap.winner === homeTeam;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Match Result */}
      <Card className="p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Trophy className="h-8 w-8 text-yellow-600" />
          <h2 className="text-2xl font-bold">Match Result</h2>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {recap.winner} Won
          </div>
          <div className="text-lg text-muted-foreground">
            by {recap.margin}
          </div>
        </div>
      </Card>

      {/* Man of the Match */}
      {recap.manOfTheMatch && (
        <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30">
          <div className="flex items-center gap-3 mb-3">
            <Star className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-bold">Player of the Match</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold">{recap.manOfTheMatch.name}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {recap.manOfTheMatch.performance}
              </div>
            </div>
            <Award className="h-12 w-12 text-purple-600 opacity-50" />
          </div>
        </Card>
      )}

      {/* Key Performances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Batsman */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-5 w-5 text-orange-600" />
            <h3 className="font-bold">Top Batsman</h3>
          </div>
          <div>
            <div className="text-xl font-bold">{recap.topBatsman.name}</div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-orange-600">
                {recap.topBatsman.runs}
              </span>
              <span className="text-sm text-muted-foreground">
                ({recap.topBatsman.balls} balls)
              </span>
            </div>
          </div>
        </Card>

        {/* Top Bowler */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold">Top Bowler</h3>
          </div>
          <div>
            <div className="text-xl font-bold">{recap.topBowler.name}</div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-blue-600">
                {recap.topBowler.wickets}
              </span>
              <span className="text-sm text-muted-foreground">
                /{recap.topBowler.runs}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Match Highlights */}
      {recap.highlights && recap.highlights.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-bold">Match Highlights</h3>
          </div>
          <ul className="space-y-2">
            {recap.highlights.map((highlight, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span className="text-sm">{highlight}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Tournament Points */}
      {recap.tournamentPoints && (
        <Card className="p-6">
          <h3 className="font-bold mb-3">Tournament Points</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className={cn(
              "text-center p-3 rounded-lg",
              isHomeWinner ? "bg-green-600/10 border-2 border-green-600/30" : "bg-muted"
            )}>
              <div className="text-sm text-muted-foreground mb-1">{homeTeam}</div>
              <div className="text-2xl font-bold">{recap.tournamentPoints?.team1}</div>
            </div>
            <div className={cn(
              "text-center p-3 rounded-lg",
              !isHomeWinner ? "bg-green-600/10 border-2 border-green-600/30" : "bg-muted"
            )}>
              <div className="text-sm text-muted-foreground mb-1">{awayTeam}</div>
              <div className="text-2xl font-bold">{recap.tournamentPoints?.team2}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
