"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { motion } from "framer-motion";

interface WinProbabilityBarProps {
  homeTeamName: string;
  awayTeamName: string;
  homeProbability: number; // 0-100
  homeColor?: string;
  awayColor?: string;
}

export function WinProbabilityBar({
  homeTeamName,
  awayTeamName,
  homeProbability,
  homeColor = "#22c55e",
  awayColor = "#ef4444",
}: WinProbabilityBarProps) {
  const awayProbability = 100 - homeProbability;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Win Probability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Team Labels */}
        <div className="flex justify-between text-sm font-medium">
          <span>{homeTeamName}</span>
          <span>{awayTeamName}</span>
        </div>

        {/* Probability Bar */}
        <div className="relative h-8 rounded-full overflow-hidden bg-muted">
          <motion.div
            className="absolute inset-y-0 left-0 flex items-center justify-center"
            initial={{ width: 0 }}
            animate={{ width: `${homeProbability}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ backgroundColor: homeColor }}
          >
            {homeProbability > 20 && (
              <span className="text-white font-bold text-sm">
                {Math.round(homeProbability)}%
              </span>
            )}
          </motion.div>
          <motion.div
            className="absolute inset-y-0 right-0 flex items-center justify-center"
            initial={{ width: 0 }}
            animate={{ width: `${awayProbability}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ backgroundColor: awayColor }}
          >
            {awayProbability > 20 && (
              <span className="text-white font-bold text-sm">
                {Math.round(awayProbability)}%
              </span>
            )}
          </motion.div>
        </div>

        {/* Indicator */}
        <div className="flex justify-center">
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded",
            homeProbability > 60 ? "bg-green-100 text-green-700" :
            homeProbability < 40 ? "bg-red-100 text-red-700" :
            "bg-yellow-100 text-yellow-700"
          )}>
            {homeProbability > 60 ? `${homeTeamName} Favourites` :
             homeProbability < 40 ? `${awayTeamName} Favourites` :
             "Match in Balance"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
