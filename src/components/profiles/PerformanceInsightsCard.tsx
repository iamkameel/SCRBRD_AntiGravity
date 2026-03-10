"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Lightbulb, Target, TrendingUp, AlertTriangle } from "lucide-react";

interface PlayerStats {
  battingAverage?: number;
  strikeRate?: number;
  bowlingAverage?: number;
  economyRate?: number;
  catchSuccess?: number;
  matchesPlayed: number;
  runsScored?: number;
  wicketsTaken?: number;
}

interface PerformanceInsightsCardProps {
  playerName: string;
  stats: PlayerStats;
  role: "batsman" | "bowler" | "allrounder" | "wicketkeeper";
}

interface Insight {
  type: "strength" | "improvement" | "tip";
  icon: React.ElementType;
  text: string;
}

function generateInsights(stats: PlayerStats, role: string): Insight[] {
  const insights: Insight[] = [];
  
  // Batting insights
  if (stats.battingAverage !== undefined) {
    if (stats.battingAverage >= 40) {
      insights.push({
        type: "strength",
        icon: Target,
        text: `Exceptional batting average of ${stats.battingAverage.toFixed(1)}. Top-tier performer.`,
      });
    } else if (stats.battingAverage >= 25) {
      insights.push({
        type: "strength",
        icon: TrendingUp,
        text: `Solid batting average of ${stats.battingAverage.toFixed(1)}. Consistent contributor.`,
      });
    } else if (stats.battingAverage < 15) {
      insights.push({
        type: "improvement",
        icon: AlertTriangle,
        text: `Batting average of ${stats.battingAverage.toFixed(1)} needs attention. Focus on shot selection.`,
      });
    }
  }
  
  if (stats.strikeRate !== undefined) {
    if (stats.strikeRate >= 150) {
      insights.push({
        type: "strength",
        icon: Target,
        text: `Explosive strike rate of ${stats.strikeRate.toFixed(0)}. Ideal for finishing overs.`,
      });
    } else if (stats.strikeRate < 100 && role !== "bowler") {
      insights.push({
        type: "tip",
        icon: Lightbulb,
        text: `Strike rate of ${stats.strikeRate.toFixed(0)} is conservative. Consider more aggressive shot-making in middle overs.`,
      });
    }
  }
  
  // Bowling insights
  if (stats.bowlingAverage !== undefined && (role === "bowler" || role === "allrounder")) {
    if (stats.bowlingAverage <= 20) {
      insights.push({
        type: "strength",
        icon: Target,
        text: `Outstanding bowling average of ${stats.bowlingAverage.toFixed(1)}. Elite wicket-taker.`,
      });
    } else if (stats.bowlingAverage <= 30) {
      insights.push({
        type: "strength",
        icon: TrendingUp,
        text: `Good bowling average of ${stats.bowlingAverage.toFixed(1)}. Reliable with the ball.`,
      });
    } else if (stats.bowlingAverage > 40) {
      insights.push({
        type: "improvement",
        icon: AlertTriangle,
        text: `Bowling average of ${stats.bowlingAverage.toFixed(1)} is high. Focus on line and length consistency.`,
      });
    }
  }
  
  if (stats.economyRate !== undefined && (role === "bowler" || role === "allrounder")) {
    if (stats.economyRate <= 6) {
      insights.push({
        type: "strength",
        icon: Target,
        text: `Excellent economy rate of ${stats.economyRate.toFixed(1)}. Great at restricting runs.`,
      });
    } else if (stats.economyRate > 9) {
      insights.push({
        type: "tip",
        icon: Lightbulb,
        text: `Economy of ${stats.economyRate.toFixed(1)} is high. Try varying pace and using slower balls.`,
      });
    }
  }
  
  // Experience insight
  if (stats.matchesPlayed >= 50) {
    insights.push({
      type: "strength",
      icon: Brain,
      text: `Highly experienced with ${stats.matchesPlayed} matches. A leader in the squad.`,
    });
  } else if (stats.matchesPlayed < 10) {
    insights.push({
      type: "tip",
      icon: Lightbulb,
      text: `With ${stats.matchesPlayed} matches, still developing. Prioritize match exposure.`,
    });
  }
  
  return insights.slice(0, 4); // Limit to 4 insights
}

export function PerformanceInsightsCard({ playerName, stats, role }: PerformanceInsightsCardProps) {
  const insights = generateInsights(stats, role);
  
  const getTypeStyles = (type: Insight["type"]) => {
    switch (type) {
      case "strength":
        return "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400";
      case "improvement":
        return "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400";
      case "tip":
        return "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-500" />
          AI Performance Insights
          <Badge variant="outline" className="ml-auto text-xs">
            Beta
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Not enough data for insights. Play more matches!
          </p>
        ) : (
          insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getTypeStyles(insight.type)}`}
              >
                <div className="flex items-start gap-2">
                  <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                  <p className="text-sm">{insight.text}</p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
