"use client";

import { useState, useEffect } from "react";
import { Match } from "@/types/firestore";
import { LiveScoreCard } from "@/components/scoring/LiveScoreCard";
import { WagonWheelChart } from "@/components/scoring/WagonWheelChart";
import { WinProbabilityBar } from "@/components/scoring/WinProbabilityBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface MatchCenterClientProps {
  match: Match;
}

// Demo data for showcasing the components
const DEMO_BATSMEN = [
  { id: "1", name: "J. Smith", runs: 45, balls: 32, fours: 6, sixes: 2, isStriker: true },
  { id: "2", name: "K. Williams", runs: 28, balls: 24, fours: 3, sixes: 1, isStriker: false },
];

const DEMO_BOWLER = {
  id: "3",
  name: "R. Johnson",
  overs: 4,
  maidens: 0,
  runs: 32,
  wickets: 1,
};

const DEMO_SHOTS = [
  { id: "1", runs: 4, x: 60, y: -40 },
  { id: "2", runs: 1, x: -30, y: 50 },
  { id: "3", runs: 6, x: 70, y: 20 },
  { id: "4", runs: 2, x: -50, y: -60 },
  { id: "5", runs: 0, x: 10, y: 30 },
  { id: "6", runs: 4, x: -70, y: -30 },
  { id: "7", runs: 1, x: 40, y: 60 },
  { id: "8", runs: 3, x: -20, y: -70 },
];

export function MatchCenterClient({ match }: MatchCenterClientProps) {
  const [isLive, setIsLive] = useState(match.status === "in_progress");
  const [runs, setRuns] = useState(78);
  const [wickets, setWickets] = useState(2);
  const [overs, setOvers] = useState(8.4);
  const [lastBalls, setLastBalls] = useState(["1", "4", "0", "2", "W", "1"]);
  const [shots, setShots] = useState(DEMO_SHOTS);
  const [winProbability, setWinProbability] = useState(55);

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const ballOutcomes = ["0", "1", "1", "2", "4", "6", "W"];
      const outcome = ballOutcomes[Math.floor(Math.random() * ballOutcomes.length)];
      
      if (outcome !== "W") {
        const runsScored = parseInt(outcome);
        setRuns(r => r + runsScored);
        
        // Update win probability slightly
        setWinProbability(p => Math.max(0, Math.min(100, p + (runsScored > 2 ? 2 : -1))));
        
        // Add shot to wagon wheel
        if (runsScored > 0) {
          const newShot = {
            id: `shot-${Date.now()}`,
            runs: runsScored,
            x: Math.floor(Math.random() * 160) - 80,
            y: Math.floor(Math.random() * 160) - 80,
          };
          setShots(s => [...s.slice(-15), newShot]);
        }
      } else {
        setWickets(w => Math.min(10, w + 1));
        setWinProbability(p => Math.max(0, p - 5));
      }
      
      setLastBalls(balls => [...balls.slice(-5), outcome]);
      setOvers(o => {
        const currentBalls = Math.round((o % 1) * 10);
        if (currentBalls >= 5) {
          return Math.floor(o) + 1;
        }
        return o + 0.1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const handlePlaceShot = (x: number, y: number, runs: number) => {
    const newShot = {
      id: `shot-${Date.now()}`,
      runs,
      x,
      y,
    };
    setShots(s => [...s, newShot]);
    setRuns(r => r + runs);
    setLastBalls(balls => [...balls.slice(-5), runs.toString()]);
  };

  // Determine status colors and live indicator
  const matchStatusColor = match.state === 'LIVE' ? 'bg-emerald-500' : match.state === 'COMPLETED' ? 'bg-gray-500' : 'bg-yellow-500';
  const isLiveNow = match.state === 'LIVE' || isLive;
  const livePulseClass = isLiveNow ? 'animate-pulse' : '';

  return (
    <div className="space-y-6">
      {/* Header Controls – sticky for easy access */}
      <div className="flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-sm p-2 z-10 border-b border-muted">
        <Link href="/matches">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Matches
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant={isLiveNow ? 'destructive' : 'default'}
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            {isLiveNow ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Resume
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRuns(0);
              setWickets(0);
              setOvers(0);
              setLastBalls([]);
              setShots([]);
              setWinProbability(50);
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Match Info Banner with gradient and status badge */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 relative">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="font-bold text-lg">{match.homeTeamName || 'Home Team'}</p>
              {match.homeScore && <p className="text-2xl font-bold">{match.homeScore}</p>}
            </div>
            <div className="text-center px-4">
              <Badge variant="secondary" className="mb-1">vs</Badge>
              <p className="text-xs text-muted-foreground">{match.matchType || 'T20'}</p>
            </div>
            <div className="text-center flex-1">
              <p className="font-bold text-lg">{match.awayTeamName || 'Away Team'}</p>
              {match.awayScore && <p className="text-2xl font-bold">{match.awayScore}</p>}
            </div>
            {/* Live status indicator */}
            <div className="absolute top-2 right-2 flex items-center space-x-1">
              <span className={`inline-block w-2 h-2 rounded-full ${matchStatusColor} ${livePulseClass}`}></span>
              <Badge variant="outline" className="capitalize">{match.state?.toLowerCase() || (isLiveNow ? 'live' : 'scheduled')}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Live, Analysis, Scoring */}
      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live">Live Score</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="scoring">Scoring</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {/* Live Score Tab */}
          <TabsContent value="live" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <LiveScoreCard
                teamName={match.homeTeamName || 'Batting Team'}
                runs={runs}
                wickets={wickets}
                overs={overs}
                targetRuns={150}
                batsmen={DEMO_BATSMEN}
                currentBowler={DEMO_BOWLER}
                runRate={runs / (overs || 1)}
                requiredRate={(150 - runs) / Math.max(1, 20 - overs)}
                lastBalls={lastBalls}
                isLive={isLiveNow}
              />
              <div className="space-y-6">
                <WinProbabilityBar
                  homeTeamName={match.homeTeamName || 'Home'}
                  awayTeamName={match.awayTeamName || 'Away'}
                  homeProbability={winProbability}
                />
                <WagonWheelChart shots={shots} size={280} />
              </div>
            </motion.div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <WagonWheelChart shots={shots} size={350} />
              <Card>
                <CardHeader>
                  <CardTitle>Shot Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[0, 1, 2, 3, 4, 6].map((runs) => {
                      const count = shots.filter((s) => s.runs === runs).length;
                      const percentage = shots.length > 0 ? (count / shots.length) * 100 : 0;
                      return (
                        <div key={runs} className="flex items-center gap-3">
                          <span className="w-8 text-sm font-medium">{runs === 0 ? 'Dot' : runs}</span>
                          <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-primary"
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                          </div>
                          <span className="w-12 text-sm text-right">{count} ({percentage.toFixed(0)}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Scoring Tab */}
          <TabsContent value="scoring" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Score Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click the wagon wheel to place shots, or use the quick buttons below.
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 1, 2, 3, 4, 5, 6, 'W', 'NB', 'WD', 'LB', 'B'].map((val) => (
                      <Button
                        key={val}
                        variant={typeof val === 'string' ? 'destructive' : 'outline'}
                        className="h-12 text-lg font-bold"
                        onClick={() => {
                          if (typeof val === 'number') {
                            setRuns((r) => r + val);
                            setLastBalls((b) => [...b.slice(-5), val.toString()]);
                          } else if (val === 'W') {
                            setWickets((w) => w + 1);
                            setLastBalls((b) => [...b.slice(-5), 'W']);
                          }
                        }}
                      >
                        {val}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <WagonWheelChart shots={shots} interactive onPlaceShot={handlePlaceShot} size={350} />
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
