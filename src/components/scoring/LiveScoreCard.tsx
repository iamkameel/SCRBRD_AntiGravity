"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface BatsmanStats {
  id: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isStriker: boolean;
}

interface BowlerStats {
  id: string;
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
}

interface LiveScoreCardProps {
  teamName: string;
  runs: number;
  wickets: number;
  overs: number;
  targetRuns?: number;
  batsmen: BatsmanStats[];
  currentBowler?: BowlerStats;
  runRate: number;
  requiredRate?: number;
  lastBalls?: string[]; // e.g., ["1", "4", "W", "0", "2", "6"]
  isLive?: boolean;
}

export function LiveScoreCard({
  teamName,
  runs,
  wickets,
  overs,
  targetRuns,
  batsmen,
  currentBowler,
  runRate,
  requiredRate,
  lastBalls = [],
  isLive = false,
}: LiveScoreCardProps) {
  const getBallColor = (ball: string) => {
    if (ball === "W") return "bg-red-500 text-white";
    if (ball === "6") return "bg-purple-500 text-white";
    if (ball === "4") return "bg-blue-500 text-white";
    if (ball === "0") return "bg-gray-300 text-gray-700";
    return "bg-green-500 text-white";
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            <span className="font-bold text-lg">{teamName}</span>
            {isLive && (
              <Badge variant="destructive" className="animate-pulse">
                LIVE
              </Badge>
            )}
          </div>
          {targetRuns && (
            <span className="text-sm opacity-90">
              Target: {targetRuns}
            </span>
          )}
        </div>
        
        {/* Score */}
        <div className="mt-4 flex items-baseline gap-2">
          <motion.span 
            key={`${runs}-${wickets}`}
            initial={{ scale: 1.2, color: "#ffffff" }}
            animate={{ scale: 1, color: "#ffffff" }}
            className="text-5xl font-bold"
          >
            {runs}/{wickets}
          </motion.span>
          <span className="text-xl opacity-80">({overs} ov)</span>
        </div>

        {/* Run Rates */}
        <div className="mt-2 flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>RR: {runRate.toFixed(2)}</span>
          </div>
          {requiredRate && (
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>RRR: {requiredRate.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Last 6 Balls */}
        {lastBalls.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Last balls:</span>
            <div className="flex gap-1">
              <AnimatePresence mode="popLayout">
                {lastBalls.slice(-6).map((ball, i) => (
                  <motion.div
                    key={`${i}-${ball}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                      getBallColor(ball)
                    )}
                  >
                    {ball}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Batsmen */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Batsmen
          </h4>
          <AnimatePresence>
            {batsmen.map((batsman) => (
              <motion.div
                key={batsman.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "flex justify-between items-center p-2 rounded",
                  batsman.isStriker && "bg-primary/10 border-l-4 border-primary"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn("font-medium", batsman.isStriker && "font-bold")}>
                    {batsman.name}
                    {batsman.isStriker && " *"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-bold">{batsman.runs}</span>
                  <span className="text-muted-foreground">({batsman.balls})</span>
                  <span className="text-blue-500">{batsman.fours}×4</span>
                  <span className="text-purple-500">{batsman.sixes}×6</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bowler */}
        {currentBowler && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Bowler
            </h4>
            <motion.div 
              key={currentBowler.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-between items-center p-2 bg-muted/50 rounded"
            >
              <span className="font-medium">{currentBowler.name}</span>
              <div className="flex items-center gap-4 text-sm">
                <span>{currentBowler.overs}-{currentBowler.maidens}-{currentBowler.runs}-{currentBowler.wickets}</span>
              </div>
            </motion.div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
