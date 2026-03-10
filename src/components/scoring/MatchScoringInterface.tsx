"use client";

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WagonWheelScorer } from './WagonWheelScorer';
import { PlayerSelector } from './PlayerSelector';
import { 
  Undo, Save, Play, Pause, RotateCcw,
  ChevronRight, AlertCircle, Users, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { MatchTransitionDialog, TransitionType } from '@/components/matches/MatchTransitionDialog';
import { MATCH_STATES } from '@/lib/matchStates';
import { useRouter } from 'next/navigation';

interface Ball {
  runs: number;
  extras?: number;
  extrasType?: 'wide' | 'noball' | 'bye' | 'legbye';
  isWicket: boolean;
  wicketType?: string;
  shotAngle?: number;
  shotDistance?: number;
  shotType?: string;
  batsmanId?: string;
  bowlerId?: string;
  fielderId?: string; // For catches, run outs, stumpings
}

interface Over {
  balls: Ball[];
  overNumber: number;
}

interface Innings {
  overs: Over[];
  totalRuns: number;
  wickets: number;
  currentBatsmen: string[];
  currentBowler: string;
  currentInnings: 1 | 2;
}

const SHOT_TYPES = [
  'Drive', 'Cut', 'Pull', 'Hook', 'Sweep', 'Flick', 
  'Glance', 'Loft', 'Paddle', 'Reverse', 'Slog', 'Block'
];

const WICKET_TYPES = [
  'Bowled', 'Caught', 'LBW', 'Run Out', 'Stumped', 
  'Hit Wicket', 'Caught & Bowled', 'Retired'
];

interface MatchScoringInterfaceProps {
  matchId: string;
  initialData?: any; // To load existing match state
  homeTeamName: string;
  awayTeamName: string;
  currentInnings: 1 | 2;
}

export function MatchScoringInterface({ 
  matchId, 
  initialData,
  homeTeamName,
  awayTeamName,
  currentInnings
}: MatchScoringInterfaceProps) {
  const [currentBall, setCurrentBall] = useState<Partial<Ball>>({});
  
  const [currentOver, setCurrentOver] = useState<Ball[]>(
    initialData?.liveScore?.currentOver || []
  );
  
  const [innings, setInnings] = useState<Innings>(
    initialData?.liveScore?.innings || {
      overs: [],
      totalRuns: 0,
      wickets: 0,
      currentBatsmen: ['Batsman 1', 'Batsman 2'],
      currentBowler: 'Bowler',
      currentInnings
    }
  );
  
  const [showWagonWheel, setShowWagonWheel] = useState(false);
  const [selectedRuns, setSelectedRuns] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  const [partnershipRuns, setPartnershipRuns] = useState<number>(
    initialData?.liveScore?.partnership?.runs || 0
  );
  
  const [partnershipBalls, setPartnershipBalls] = useState<number>(
    initialData?.liveScore?.partnership?.balls || 0
  );
  
  const [targetScore, setTargetScore] = useState<number | null>(
    initialData?.liveScore?.target || null
  );
  
  // Transition State
  const [transitionDialogOpen, setTransitionDialogOpen] = useState(false);
  const [transitionType, setTransitionType] = useState<TransitionType>('innings_break');
  const router = useRouter();

  const ballsInOver = currentOver.filter(b => 
    !b.extras || (b.extrasType !== 'wide' && b.extrasType !== 'noball')
  ).length;

  // Calculate total balls bowled
  const totalBalls = innings.overs.reduce((acc, over) => 
    acc + over.balls.filter(b => !b.extras || (b.extrasType !== 'wide' && b.extrasType !== 'noball')).length, 0
  ) + ballsInOver;

  // Calculate overs in decimal format
  const totalOvers = Math.floor(totalBalls / 6) + (totalBalls % 6) / 10;

  // Current run rate (runs per over)
  const currentRunRate = totalOvers > 0 ? (innings.totalRuns / totalOvers).toFixed(2) : '0.00';

  // Required run rate (if chasing)
  const requiredRunRate = targetScore && totalOvers > 0 && totalOvers < 20
    ? (((targetScore - innings.totalRuns) / (20 - totalOvers))).toFixed(2)
    : null;

  const handleShotRecorded = (angle: number, distance: number) => {
    setCurrentBall(prev => ({
      ...prev,
      shotAngle: angle,
      shotDistance: distance
    }));
    setShowWagonWheel(false);
  };

  const handleRunsSelect = (runs: number) => {
    setSelectedRuns(runs);
    setCurrentBall(prev => ({
      ...prev,
      runs,
      isWicket: false
    }));
  };

  const handleWicket = () => {
    setCurrentBall(prev => ({
      ...prev,
      runs: 0,
      isWicket: true,
      wicketType: 'Bowled' // Default, can be changed
    }));
  };

  const handleExtras = (type: 'wide' | 'noball' | 'bye' | 'legbye', runs: number = 1) => {
    setCurrentBall(prev => ({
      ...prev,
      extrasType: type,
      extras: runs,
      runs: runs
    }));
  };

  const recordBall = () => {
    if (selectedRuns === null && !currentBall.isWicket && !currentBall.extras) {
      alert('Please select runs, wicket, or extras');
      return;
    }

    const ball: Ball = {
      runs: currentBall.runs || 0,
      extras: currentBall.extras,
      extrasType: currentBall.extrasType,
      isWicket: currentBall.isWicket || false,
      wicketType: currentBall.wicketType,
      shotAngle: currentBall.shotAngle,
      shotDistance: currentBall.shotDistance,
      shotType: currentBall.shotType,
      batsmanId: innings.currentBatsmen[0],
      bowlerId: innings.currentBowler,
      fielderId: currentBall.fielderId
    };

    const newOver = [...currentOver, ball];
    const newTotalRuns = innings.totalRuns + ball.runs;
    const newWickets = innings.wickets + (ball.isWicket ? 1 : 0);

    setCurrentOver(newOver);
    setInnings(prev => ({
      ...prev,
      totalRuns: newTotalRuns,
      wickets: newWickets
    }));

    // Check if over is complete (6 legal balls)
    const legalBalls = newOver.filter(b => 
      !b.extras || (b.extrasType !== 'wide' && b.extrasType !== 'noball')
    ).length;

    if (legalBalls === 6) {
      // Complete the over
      setInnings(prev => ({
        ...prev,
        overs: [...prev.overs, { balls: newOver, overNumber: prev.overs.length + 1 }]
      }));
      setCurrentOver([]);
    }

    // Update partnership tracking
    if (ball.isWicket) {
      // Reset partnership on wicket
      setPartnershipRuns(0);
      setPartnershipBalls(0);
    } else {
      // Update partnership
      setPartnershipRuns(prev => prev + ball.runs);
      const isLegalBall = !ball.extras || (ball.extrasType !== 'wide' && ball.extrasType !== 'noball');
      if (isLegalBall) {
        setPartnershipBalls(prev => prev + 1);
      }
    }

    // Reset for next ball
    setCurrentBall({});
    setSelectedRuns(null);

    // AUTO-TRANSITION CHECKS
    // 1. All Out (10 wickets)
    if (newWickets >= 10) {
      setTransitionType(innings.currentInnings === 2 ? 'complete_match' : 'innings_break');
      setTransitionDialogOpen(true);
    }
    // 2. Target Reached (Chasing)
    else if (targetScore && newTotalRuns >= targetScore) {
      setTransitionType('complete_match');
      setTransitionDialogOpen(true);
    }
  };

  const handleTransitionConfirm = async (data?: any) => {
    try {
      const matchRef = doc(db, 'matches', matchId);
      
      if (transitionType === 'innings_break') {
        await updateDoc(matchRef, {
          state: MATCH_STATES.INNINGS_BREAK,
          'liveScore.innings': innings,
          lastUpdated: new Date().toISOString()
        });
        toast.success('Innings ended. Match is now in break.');
        router.push(`/matches/${matchId}`);
      } else {
        // Complete Match
        await updateDoc(matchRef, {
          state: MATCH_STATES.COMPLETED,
          'liveScore.innings': innings,
          'completion.winner': data?.winner || 'tbd', // Logic needed to determine winner
          'completion.finalResult': data?.result,
          'completion.playerOfMatch': data?.playerOfMatch,
          'completion.completedAt': new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
        toast.success('Match completed successfully!');
        router.push(`/matches/${matchId}`);
      }
    } catch (error) {
      console.error('Error updating match state:', error);
      toast.error('Failed to update match state');
    }
    setTransitionDialogOpen(false);
  };

  const undoLastBall = () => {
    if (currentOver.length === 0) return;

    const lastBall = currentOver[currentOver.length - 1];
    const newOver = currentOver.slice(0, -1);

    setCurrentOver(newOver);
    setInnings(prev => ({
      ...prev,
      totalRuns: prev.totalRuns - lastBall.runs,
      wickets: prev.wickets - (lastBall.isWicket ? 1 : 0)
    }));
    setCurrentBall({});
    setSelectedRuns(null);
  };

  const handleSave = async () => {
    try {
      const matchRef = doc(db, 'matches', matchId);
      await updateDoc(matchRef, {
        'liveScore.innings': innings,
        'liveScore.currentOver': currentOver,
        'liveScore.partnership': {
          runs: partnershipRuns,
          balls: partnershipBalls
        },
        'liveScore.target': targetScore,
        lastUpdated: new Date().toISOString()
      });
      toast.success('Match score saved successfully');
    } catch (error) {
      console.error('Error saving match:', error);
      toast.error('Failed to save match score');
    }
  };

  const getBallSymbol = (ball: Ball) => {
    if (ball.isWicket) return 'W';
    if (ball.extrasType === 'wide') return `${ball.runs}wd`;
    if (ball.extrasType === 'noball') return `${ball.runs}nb`;
    if (ball.extrasType === 'bye') return `${ball.runs}b`;
    if (ball.extrasType === 'legbye') return `${ball.runs}lb`;
    if (ball.runs === 0) return '•';
    return ball.runs.toString();
  };

  return (
    <div className="space-y-6">
      {/* Score Display */}
      <Card className="p-8 border-primary/20 bg-gradient-to-br from-card to-secondary/10 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 drop-shadow-sm">
              {innings.totalRuns}/{innings.wickets}
            </h2>
            <p className="text-lg font-medium text-muted-foreground mt-2 uppercase tracking-widest">
              Overs: {innings.overs.length}.{ballsInOver}
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Match Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Score (for chasing)</label>
                    <Input 
                      type="number" 
                      placeholder="Enter target score"
                      value={targetScore || ''}
                      onChange={(e) => setTargetScore(e.target.value ? Number(e.target.value) : null)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Set this if the batting team is chasing a target.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            
            {/* Manual Transition Triggers */}
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                setTransitionType(innings.currentInnings === 2 ? 'complete_match' : 'innings_break');
                setTransitionDialogOpen(true);
              }}
            >
              {innings.currentInnings === 2 ? 'End Match' : 'End Innings'}
            </Button>
          </div>
        </div>

        <MatchTransitionDialog 
          isOpen={transitionDialogOpen}
          type={transitionType}
          matchData={{
            homeTeamName,
            awayTeamName,
            currentInnings,
            totalRuns: innings.totalRuns,
            wickets: innings.wickets,
            overs: `${innings.overs.length}.${ballsInOver}`,
            target: targetScore || undefined
          }}
          onConfirm={handleTransitionConfirm}
          onCancel={() => setTransitionDialogOpen(false)}
        />

        {/* Current Over */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">This over:</span>
          {currentOver.map((ball, idx) => (
            <Badge 
              key={idx}
              variant={ball.isWicket ? 'destructive' : 'secondary'}
              className="font-mono"
            >
              {getBallSymbol(ball)}
            </Badge>
          ))}
          {currentOver.length === 0 && (
            <span className="text-xs text-muted-foreground">No balls yet</span>
          )}
        </div>
      </Card>

      {/* Match Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-border/50 bg-secondary/5 backdrop-blur-sm hover:bg-secondary/10 transition-colors">
          <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">Current Run Rate</div>
          <div className="text-3xl font-black font-mono">{currentRunRate}</div>
          <div className="text-xs text-muted-foreground mt-1">runs per over</div>
        </Card>
        
        {requiredRunRate && (
          <Card className="p-6 border-primary/50 bg-primary/5 backdrop-blur-sm shadow-inner overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full blur-2xl -mr-8 -mt-8" />
            <div className="text-xs uppercase tracking-widest font-bold text-primary mb-2">Required Run Rate</div>
            <div className="text-3xl font-black text-primary font-mono">{requiredRunRate}</div>
            <div className="text-xs text-muted-foreground mt-1 font-medium">
              {targetScore && `Need ${targetScore - innings.totalRuns} runs to win`}
            </div>
          </Card>
        )}
        
        <Card className="p-6 border-border/50 bg-secondary/5 backdrop-blur-sm hover:bg-secondary/10 transition-colors">
          <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">Current Partnership</div>
          <div className="text-3xl font-black font-mono">{partnershipRuns}</div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            {partnershipBalls} balls
          </div>
        </Card>
      </div>

      {/* Player Selection */}
      <Card className="p-6 border-border/50 shadow-md bg-card/80 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-6 border-b pb-4">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold tracking-tight uppercase">Current Players</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PlayerSelector
            label="Striker"
            value={innings.currentBatsmen[0]}
            onChange={(value) => setInnings(prev => ({ 
              ...prev, 
              currentBatsmen: [value, prev.currentBatsmen[1]] 
            }))}
            placeholder="Select striker..."
          />
          <PlayerSelector
            label="Non-Striker"
            value={innings.currentBatsmen[1]}
            onChange={(value) => setInnings(prev => ({ 
              ...prev, 
              currentBatsmen: [prev.currentBatsmen[0], value] 
            }))}
            placeholder="Select non-striker..."
          />
          <PlayerSelector
            label="Bowler"
            value={innings.currentBowler}
            onChange={(value) => setInnings(prev => ({ ...prev, currentBowler: value }))}
            placeholder="Select bowler..."
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scoring Controls */}
        <div className="space-y-6">
          {/* Runs Selector */}
          <Card className="p-6 border-border/50 shadow-lg bg-card/60 backdrop-blur-xl">
            <h3 className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-4">Runs Scored</h3>
            <div className="grid grid-cols-4 gap-3">
              {[0, 1, 2, 3, 4, 6].map(runs => (
                <Button
                  key={runs}
                  variant={selectedRuns === runs ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => handleRunsSelect(runs)}
                  className={cn(
                    "text-3xl font-black h-16 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all",
                    runs === 4 && "bg-blue-500 text-primary-foreground border-blue-600 hover:bg-blue-600 shadow-blue-500/20",
                    runs === 6 && "bg-purple-500 text-primary-foreground border-purple-600 hover:bg-purple-600 shadow-purple-500/20"
                  )}
                >
                  {runs}
                </Button>
              ))}
              <Button
                variant={currentBall.isWicket ? 'destructive' : 'outline'}
                size="lg"
                onClick={handleWicket}
                className={cn(
                  "text-3xl font-black h-16 col-span-2 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all",
                  currentBall.isWicket ? "shadow-destructive/20" : "border-destructive/30 text-destructive hover:bg-destructive/10"
                )}
              >
                W
              </Button>
            </div>
          </Card>

          {/* Extras */}
          <Card className="p-6 border-border/50 shadow-lg bg-card/60 backdrop-blur-xl">
            <h3 className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-4">Extras</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="hover:bg-primary/10 hover:text-primary transition-colors h-12"
                onClick={() => handleExtras('wide', 1)}
              >
                Wide
              </Button>
              <Button
                variant="outline"
                className="hover:bg-primary/10 hover:text-primary transition-colors h-12"
                onClick={() => handleExtras('noball', 1)}
              >
                No Ball
              </Button>
              <Button
                variant="outline"
                className="hover:bg-primary/10 hover:text-primary transition-colors h-12"
                onClick={() => handleExtras('bye', 1)}
              >
                Bye
              </Button>
              <Button
                variant="outline"
                className="hover:bg-primary/10 hover:text-primary transition-colors h-12"
                onClick={() => handleExtras('legbye', 1)}
              >
                Leg Bye
              </Button>
            </div>
          </Card>

          {/* Shot Type */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold mb-4">Shot Type (Optional)</h3>
            <select
              className="w-full p-2 rounded-md border border-border bg-background text-foreground"
              value={currentBall.shotType || ''}
              onChange={(e) => setCurrentBall(prev => ({ ...prev, shotType: e.target.value }))}
            >
              <option value="">Select shot...</option>
              {SHOT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </Card>

          {/* Wicket Type - Only shown if wicket */}
          {currentBall.isWicket && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-4">Wicket Type</h3>
              <select
                className="w-full p-2 rounded-md border border-border bg-background text-foreground"
                value={currentBall.wicketType || ''}
                onChange={(e) => setCurrentBall(prev => ({ ...prev, wicketType: e.target.value }))}
              >
                <option value="">Select wicket type...</option>
                {WICKET_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </Card>
          )}

          {/* Fielder Selector - Only for catches, run outs, stumpings */}
          {currentBall.isWicket && currentBall.wicketType && 
           ['Caught', 'Run Out', 'Stumped', 'Caught & Bowled'].includes(currentBall.wicketType) && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-4">
                {currentBall.wicketType === 'Caught & Bowled' ? 'Bowler-Fielder' : 'Fielder'}
              </h3>
              <PlayerSelector
                label=""
                value={currentBall.fielderId || ''}
                onChange={(value) => setCurrentBall(prev => ({ ...prev, fielderId: value }))}
                placeholder={`Select ${currentBall.wicketType === 'Stumped' ? 'wicket-keeper' : 'fielder'}...`}
              />
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border/50">
            <Button
              onClick={recordBall}
              className="flex-1 h-16 text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all hover:scale-[1.02]"
              disabled={isPaused}
            >
              Record Ball
              <ChevronRight className="h-6 w-6 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={undoLastBall}
              disabled={currentOver.length === 0}
              className="h-16 w-16"
              title="Undo Last Ball"
            >
              <Undo className="h-5 w-5" />
            </Button>
          </div>

          {/* Wagon Wheel Toggle */}
          <Button
            variant="secondary"
            onClick={() => setShowWagonWheel(!showWagonWheel)}
            className="w-full"
          >
            {showWagonWheel ? 'Hide' : 'Show'} Wagon Wheel
          </Button>
        </div>

        {/* Wagon Wheel Scorer */}
        <div>
          {showWagonWheel ? (
            <WagonWheelScorer 
              onShotRecorded={handleShotRecorded}
              disabled={isPaused}
            />
          ) : (
            <Card className="p-12 text-center h-full flex flex-col items-center justify-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Wagon Wheel Hidden</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click &quot;Show Wagon Wheel&quot; to record shot placement
              </p>
              {currentBall.shotAngle !== undefined && (
                <Badge variant="secondary">
                  Last: {currentBall.shotAngle}° - {currentBall.shotDistance}%
                </Badge>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Match Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Match Progress</h3>
        <div className="space-y-2">
          {innings.overs.slice(-3).map((over, idx) => (
            <div key={idx} className="flex items-center gap-4 text-sm">
              <span className="font-mono text-muted-foreground w-16">
                Over {over.overNumber}:
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {over.balls.map((ball, ballIdx) => (
                  <Badge 
                    key={ballIdx}
                    variant={ball.isWicket ? 'destructive' : 'secondary'}
                    className="font-mono text-xs"
                  >
                    {getBallSymbol(ball)}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
