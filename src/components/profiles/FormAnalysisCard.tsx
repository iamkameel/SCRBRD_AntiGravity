"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Flame, Snowflake, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchPerformance {
  matchId: string;
  opponent: string;
  date: string;
  runs?: number;
  wickets?: number;
  catches?: number;
  result: "win" | "loss" | "draw";
}

interface FormAnalysisCardProps {
  playerName: string;
  recentMatches: MatchPerformance[];
  role: "batsman" | "bowler" | "allrounder";
}

function calculateFormScore(matches: MatchPerformance[], role: string): number {
  if (matches.length === 0) return 50;
  
  let score = 50;
  matches.forEach((match, index) => {
    const weight = (matches.length - index) / matches.length; // More recent = higher weight
    
    if (role === "batsman" || role === "allrounder") {
      if (match.runs !== undefined) {
        if (match.runs >= 50) score += 15 * weight;
        else if (match.runs >= 30) score += 8 * weight;
        else if (match.runs >= 15) score += 3 * weight;
        else if (match.runs < 10) score -= 5 * weight;
      }
    }
    
    if (role === "bowler" || role === "allrounder") {
      if (match.wickets !== undefined) {
        if (match.wickets >= 3) score += 15 * weight;
        else if (match.wickets >= 2) score += 8 * weight;
        else if (match.wickets >= 1) score += 3 * weight;
        else score -= 3 * weight;
      }
    }
    
    if (match.result === "win") score += 2 * weight;
    else if (match.result === "loss") score -= 1 * weight;
  });
  
  return Math.min(100, Math.max(0, score));
}

function getFormLabel(score: number): { label: string; color: string; icon: React.ElementType } {
  if (score >= 80) return { label: "Hot", color: "text-red-500", icon: Flame };
  if (score >= 60) return { label: "Good", color: "text-green-500", icon: TrendingUp };
  if (score >= 40) return { label: "Average", color: "text-yellow-500", icon: Minus };
  if (score >= 20) return { label: "Poor", color: "text-orange-500", icon: TrendingDown };
  return { label: "Cold", color: "text-blue-500", icon: Snowflake };
}

export function FormAnalysisCard({ playerName, recentMatches, role }: FormAnalysisCardProps) {
  const formScore = calculateFormScore(recentMatches, role);
  const { label, color, icon: FormIcon } = getFormLabel(formScore);
  
  // Calculate trends
  const avgRuns = recentMatches.length > 0 
    ? recentMatches.filter(m => m.runs !== undefined).reduce((sum, m) => sum + (m.runs || 0), 0) / recentMatches.length 
    : 0;
  const avgWickets = recentMatches.length > 0 
    ? recentMatches.filter(m => m.wickets !== undefined).reduce((sum, m) => sum + (m.wickets || 0), 0) / recentMatches.length 
    : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Form Analysis
          </span>
          <Badge variant="outline" className={cn("font-bold", color)}>
            <FormIcon className="h-3 w-3 mr-1" />
            {label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Form Score Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Form Score</span>
            <span className="font-bold">{Math.round(formScore)}/100</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500",
                formScore >= 80 ? "bg-red-500" :
                formScore >= 60 ? "bg-green-500" :
                formScore >= 40 ? "bg-yellow-500" :
                formScore >= 20 ? "bg-orange-500" :
                "bg-blue-500"
              )}
              style={{ width: `${formScore}%` }}
            />
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4 text-center">
          {(role === "batsman" || role === "allrounder") && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{avgRuns.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Avg Runs (L5)</p>
            </div>
          )}
          {(role === "bowler" || role === "allrounder") && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{avgWickets.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Avg Wickets (L5)</p>
            </div>
          )}
        </div>

        {/* Recent Matches */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Last 5 Matches</p>
          <div className="flex gap-1">
            {recentMatches.slice(0, 5).map((match, i) => (
              <div
                key={match.matchId || i}
                className={cn(
                  "flex-1 h-2 rounded-full",
                  match.result === "win" ? "bg-green-500" :
                  match.result === "loss" ? "bg-red-500" :
                  "bg-gray-400"
                )}
                title={`vs ${match.opponent}: ${match.result.toUpperCase()}`}
              />
            ))}
            {Array.from({ length: Math.max(0, 5 - recentMatches.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="flex-1 h-2 rounded-full bg-muted" />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>W: {recentMatches.filter(m => m.result === "win").length}</span>
            <span>L: {recentMatches.filter(m => m.result === "loss").length}</span>
            <span>D: {recentMatches.filter(m => m.result === "draw").length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
