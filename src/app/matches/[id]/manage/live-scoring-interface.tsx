"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoringDialog } from "./scoring-dialog";
import { NewBatsmanDialog } from "./new-batsman-dialog";
import { NewBowlerDialog } from "./new-bowler-dialog";
import { EndInningsDialog } from "./end-innings-dialog";
import { EndMatchDialog } from "./end-match-dialog";
import { RetireBatterDialog } from "./retire-batter-dialog";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Ball, Innings, Match } from "@/types/firestore";
import { Play, RotateCcw, TrendingUp, Flag, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { MatchAnalyticsDashboard } from "@/components/analytics/MatchAnalyticsDashboard";
import { 
  getTeamSquadAction, 
  selectNewBatsmanAction, 
  selectNewBowlerAction,
  endInningsAction,
  endMatchAction,
  getMatchDetailsAction,
  undoLastBallAction,
  startSecondInningsAction,
  retireBatterAction
} from "@/app/actions/matchActions";

interface LiveScoringInterfaceProps {
  matchId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
}

export function LiveScoringInterface({
  matchId,
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName
}: LiveScoringInterfaceProps) {
  const [scoringDialogOpen, setScoringDialogOpen] = useState(false);
  const [currentInnings, setCurrentInnings] = useState<Innings | null>(null);
  const [currentOver, setCurrentOver] = useState<Ball[]>([]);
  const [battingTeamId, setBattingTeamId] = useState<string>(homeTeamId);
  const [matchStatus, setMatchStatus] = useState<string>('live');
  const [target, setTarget] = useState<number | null>(null);
  const [inningsNumber, setInningsNumber] = useState<number>(1);
  
  // Match Data for Batting Order
  const [matchData, setMatchData] = useState<Match | null>(null);

  // Player Selection State
  const [homeSquad, setHomeSquad] = useState<any[]>([]);
  const [awaySquad, setAwaySquad] = useState<any[]>([]);
  const [showNewBatsmanDialog, setShowNewBatsmanDialog] = useState(false);
  const [showNewBowlerDialog, setShowNewBowlerDialog] = useState(false);
  
  // Conclusion Dialogs
  const [showEndInningsDialog, setShowEndInningsDialog] = useState(false);
  const [showEndMatchDialog, setShowEndMatchDialog] = useState(false);
  const [showRetireBatterDialog, setShowRetireBatterDialog] = useState(false);
  
  // Live Data State
  const [strikerId, setStrikerId] = useState<string | null>(null);
  const [nonStrikerId, setNonStrikerId] = useState<string | null>(null);
  const [bowlerId, setBowlerId] = useState<string | null>(null);
  const [batsmenStats, setBatsmenStats] = useState<any[]>([]);
  const { toast } = useToast();

  // Fetch Squads and Match Details
  useEffect(() => {
    const fetchData = async () => {
      const [home, away, match] = await Promise.all([
        getTeamSquadAction(homeTeamId),
        getTeamSquadAction(awayTeamId),
        getMatchDetailsAction(matchId)
      ]);
      setHomeSquad(home);
      setAwaySquad(away);
      setMatchData(match);
    };
    fetchData();
  }, [matchId, homeTeamId, awayTeamId]);

  // Real-time listener for LIVE SCORE
  useEffect(() => {
    const scoreRef = doc(db, 'matches', matchId, 'live', 'score');
    const unsubscribe = onSnapshot(scoreRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        
        setMatchStatus(data.status || 'live');
        setInningsNumber(data.inningsNumber || 1);
        setTarget(data.target || null);
        setBatsmenStats(data.batsmen || []);

        // Update Innings Data
        if (data.currentInnings) {
          setBattingTeamId(data.currentInnings.battingTeamId);
          setCurrentInnings({
            teamId: data.currentInnings.battingTeamId,
            runs: data.currentInnings.runs,
            wickets: data.currentInnings.wickets,
            overs: data.currentInnings.overs,
            overHistory: [], 
          } as any);
        }

        // Update Current Players
        if (data.currentPlayers) {
          setStrikerId(data.currentPlayers.strikerId);
          setNonStrikerId(data.currentPlayers.nonStrikerId);
          setBowlerId(data.currentPlayers.bowlerId);

          // Trigger Dialogs if players are missing AND match is live
          if (data.status === 'live') {
            if (!data.currentPlayers.strikerId) setShowNewBatsmanDialog(true);
            if (!data.currentPlayers.bowlerId) setShowNewBowlerDialog(true);
          }
        }

        // Update Ball History / Current Over
        if (data.ballHistory) {
          const history = data.ballHistory as Ball[];
          const last6 = history.slice(-6); 
          setCurrentOver(last6); 
        }
      }
    });

    return () => unsubscribe();
  }, [matchId]);

  const handleNewBatsman = async (playerId: string) => {
    await selectNewBatsmanAction(matchId, playerId);
    setShowNewBatsmanDialog(false);
  };

  const handleNewBowler = async (playerId: string) => {
    await selectNewBowlerAction(matchId, playerId);
    setShowNewBowlerDialog(false);
  };

  const handleEndInnings = async () => {
    await endInningsAction(matchId);
    // The listener will update status to 'innings_break'
  };

  const handleEndMatch = async (result: { winnerId?: string; margin?: string; resultText: string }) => {
    await endMatchAction(matchId, result);
  };

  const startSecondInnings = async () => {
    // Logic to resume play from break
    // For now, we assume the user just needs to select players to "start"
    // But we might need an explicit action to set status back to 'live'
    // Let's assume selecting the first bowler/batsman effectively starts it, 
    // OR we add a specific "Start 2nd Innings" action.
    // I'll add `startSecondInningsAction` to matchActions.ts in a follow-up if needed, 
    // but for now let's just assume the user can click "Resume" which updates the status.
    
    // Temporary: direct update (should be server action ideally)
    // await updateDoc(doc(db, 'matches', matchId, 'live', 'score'), { status: 'live' });
    // await updateDoc(doc(db, 'matches', matchId), { status: 'live' });
  };

  const battingTeamName = battingTeamId === homeTeamId ? homeTeamName : awayTeamName;
  const bowlingTeamName = battingTeamId === homeTeamId ? awayTeamName : homeTeamName;
  
  const battingSquad = battingTeamId === homeTeamId ? homeSquad : awaySquad;
  const bowlingSquad = battingTeamId === homeTeamId ? awaySquad : homeSquad;

  const strikerName = battingSquad.find(p => p.id === strikerId)?.firstName || 'Striker';
  const bowlerName = bowlingSquad.find(p => p.id === bowlerId)?.firstName || 'Bowler';

  // Derived State
  const isFirstInnings = inningsNumber === 1;
  const isInningsBreak = matchStatus === 'innings_break';
  const runsNeeded = target ? target - (currentInnings?.runs || 0) : 0;

  // Smart Player Selection Logic
  const getAvailableBatsmen = () => {
    // 1. Get all players in the squad
    let available = [...battingSquad];
    
    // 2. Filter out players who are currently batting or already out
    // Note: We need to check 'batsmenStats' from live score to see who has batted
    const battedPlayerIds = batsmenStats.map(b => b.playerId);
    // Exception: If a player retired hurt but can come back, we might need to handle that.
    // For now, assume anyone in 'batsmen' array has batted or is batting.
    // Actually, 'batsmen' array usually contains *all* who have batted.
    // We should filter out those who are OUT or currently at crease.
    // But for simplicity in this MVP, let's just filter out anyone who is in the batsmen list
    // UNLESS we want to allow a retired hurt player to return (advanced).
    // Let's stick to: if in batsmen list, they are not "new".
    
    available = available.filter(p => !battedPlayerIds.includes(p.id));

    // 3. Sort by Batting Order
    const isHomeBatting = battingTeamId === homeTeamId;
    const battingOrderData = matchData?.preMatch?.battingOrder;
    
    // Check if batting order exists and matches current batting team
    if (battingOrderData && 
        ((isHomeBatting && battingOrderData.team === 'home') || 
         (!isHomeBatting && battingOrderData.team === 'away'))) {
      
      const order = battingOrderData.order;
      
      if (order && order.length > 0) {
        available.sort((a, b) => {
          const indexA = order.indexOf(a.id);
          const indexB = order.indexOf(b.id);
          // If not in order, put at end
          const valA = indexA === -1 ? 999 : indexA;
          const valB = indexB === -1 ? 999 : indexB;
          return valA - valB;
        });
      }
    }

    return available.map(p => ({ id: p.id, name: `${p.firstName} ${p.lastName}` }));
  };

  const availableBatsmen = getAvailableBatsmen();
  const suggestedBatsmanId = availableBatsmen.length > 0 ? availableBatsmen[0].id : undefined;

  const handleUndo = async () => {
    if (!confirm('Are you sure you want to undo the last ball?')) return;
    
    try {
      const result = await undoLastBallAction(matchId, 'user_undo');
      if (result.success) {
        toast({
          title: "Undo Successful",
          description: `Last ball undone. ${result.undoneRuns} runs removed.`,
        });
      } else {
        toast({
          title: "Undo Failed",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to undo last ball",
        variant: "destructive"
      });
    }
  };

  const handleRetire = async (playerId: string, type: 'retired_hurt' | 'retired_out') => {
    try {
      const result = await retireBatterAction(matchId, playerId, type);
      if (result.success) {
        // Don't show toast, the NewBatsmanDialog will appear automatically
      } else {
        console.error('Retire failed:', result.error);
      }
    } catch (error) {
      console.error('Error retiring batter:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{homeTeamName} vs {awayTeamName}</h2>
            <p className="text-muted-foreground mt-1">
              {isInningsBreak ? "Innings Break" : `${battingTeamName} batting • ${bowlingTeamName} bowling`}
            </p>
            {target && (
              <p className="text-sm font-semibold text-primary mt-1">
                Target: {target} ({runsNeeded} runs needed)
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            {/* Retire Batter Button */}
            {!isInningsBreak && (strikerId || nonStrikerId) && (
              <Button variant="outline" size="sm" onClick={() => setShowRetireBatterDialog(true)}>
                Retire Batter
              </Button>
            )}
            
            {/* Control Buttons */}
            {isFirstInnings && !isInningsBreak && (
              <Button variant="destructive" onClick={() => setShowEndInningsDialog(true)}>
                <Flag className="h-4 w-4 mr-2" />
                End Innings
              </Button>
            )}
            
            {!isFirstInnings && !isInningsBreak && (
              <Button variant="default" className="bg-yellow-600 hover:bg-yellow-700" onClick={() => setShowEndMatchDialog(true)}>
                <Trophy className="h-4 w-4 mr-2" />
                End Match
              </Button>
            )}

            {isInningsBreak && (
               <div className="flex flex-col items-end gap-2">
                 <Badge variant="secondary" className="text-lg">Target: {target}</Badge>
                 <p className="text-xs text-muted-foreground">Select players to resume</p>
               </div>
            )}
          </div>
        </div>
      </Card>

      {/* Live Score Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-2 border-emerald-500/30">
          <div className="text-sm text-muted-foreground mb-2">Score</div>
          <div className="text-4xl font-bold tracking-tight">
            {currentInnings?.runs || 0}/{currentInnings?.wickets || 0}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-2 border-purple-500/30">
          <div className="text-sm text-muted-foreground mb-2">Overs</div>
          <div className="text-4xl font-bold tracking-tight">
            {currentInnings?.overs || 0}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 border-2 border-green-500/30">
          <div className="text-sm text-muted-foreground mb-2">Run Rate</div>
          <div className="text-4xl font-bold tracking-tight">
            {currentInnings?.overs && currentInnings.overs > 0 
              ? ((currentInnings.runs || 0) / currentInnings.overs).toFixed(2) 
              : '0.00'}
          </div>
        </Card>
      </div>

      {/* Current Over */}
      {!isInningsBreak && currentOver.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Balls
          </h3>
          <div className="flex gap-2 flex-wrap">
            {currentOver.map((ball, idx) => (
              <Badge
                key={idx}
                variant={ball.isWicket ? "destructive" : "secondary"}
                className={cn(
                  "h-10 w-10 flex items-center justify-center font-bold text-base",
                  ball.runs === 4 && "bg-blue-600 text-white",
                  ball.runs === 6 && "bg-purple-600 text-white"
                )}
              >
                {ball.isWicket ? "W" : ball.runs === 0 ? "•" : ball.runs}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Action Area */}
      {!isInningsBreak ? (
        <div className="grid grid-cols-4 gap-2">
          <Button
            onClick={() => setScoringDialogOpen(true)}
            size="lg"
            className="col-span-3 h-16 text-lg font-bold"
            disabled={!strikerId || !bowlerId}
          >
            <Play className="h-6 w-6 mr-2" />
            Record Ball
          </Button>
          <Button
            onClick={handleUndo}
            size="lg"
            variant="outline"
            className="h-16 flex flex-col items-center justify-center gap-1"
            disabled={!currentOver || currentOver.length === 0}
          >
            <RotateCcw className="h-5 w-5" />
            <span className="text-xs">Undo</span>
          </Button>
        </div>
      ) : (
        <Card className="p-8 text-center border-dashed">
          <h3 className="text-xl font-bold mb-2">Innings Break</h3>
          <p className="text-muted-foreground mb-6">
            First innings completed. Target set to {target}.
          </p>
          <Button 
            size="lg" 
            onClick={async () => {
              try {
                const result = await startSecondInningsAction(matchId);
                if (!result.success) {
                  toast({
                    title: "Error",
                    description: result.error || "Failed to start second innings",
                    variant: "destructive"
                  });
                }
              } catch (error) {
                console.error(error);
                toast({
                  title: "Error",
                  description: "Failed to start second innings",
                  variant: "destructive"
                });
              }
            }}
          >
            Start Second Innings
          </Button>
        </Card>
      )}

      {/* Analytics Dashboard */}
      {currentInnings && (
        <MatchAnalyticsDashboard 
          innings1={currentInnings}
          homeTeamName={homeTeamName}
          awayTeamName={awayTeamName}
          battingFirst={battingTeamId === homeTeamId ? 'home' : 'away'} // This logic needs refinement for 2nd innings
        />
      )}

      {/* Dialogs */}
      <ScoringDialog
        open={scoringDialogOpen}
        onOpenChange={setScoringDialogOpen}
        matchId={matchId}
        striker={strikerId ? { id: strikerId, name: strikerName } : null}
        bowler={bowlerId ? { id: bowlerId, name: bowlerName } : null}
        fieldingSquad={bowlingSquad.map(p => ({ id: p.id, name: `${p.firstName} ${p.lastName}` }))}
      />

      <NewBatsmanDialog
        open={showNewBatsmanDialog}
        onOpenChange={setShowNewBatsmanDialog}
        availablePlayers={availableBatsmen}
        suggestedPlayerId={suggestedBatsmanId}
        onSelect={handleNewBatsman}
      />

      <NewBowlerDialog
        open={showNewBowlerDialog}
        onOpenChange={setShowNewBowlerDialog}
        availablePlayers={bowlingSquad.map(p => ({ id: p.id, name: `${p.firstName} ${p.lastName}` }))}
        onSelect={handleNewBowler}
        previousBowlerId={bowlerId || undefined}
      />
      
      <EndInningsDialog 
        open={showEndInningsDialog}
        onOpenChange={setShowEndInningsDialog}
        onConfirm={handleEndInnings}
        runs={currentInnings?.runs || 0}
        wickets={currentInnings?.wickets || 0}
        overs={currentInnings?.overs || 0}
      />
      
      <EndMatchDialog 
        open={showEndMatchDialog}
        onOpenChange={setShowEndMatchDialog}
        onConfirm={async (result) => {
          const endResult = await endMatchAction(matchId, result);
          if (endResult.success) {
            setShowEndMatchDialog(false);
          }
        }}
        homeTeamId={homeTeamId}
        awayTeamId={awayTeamId}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
      />
      
      <RetireBatterDialog
        open={showRetireBatterDialog}
        onOpenChange={setShowRetireBatterDialog}
        striker={strikerId ? { id: strikerId, name: strikerName } : null}
        nonStriker={nonStrikerId ? { id: nonStrikerId, name: battingSquad.find(p => p.id === nonStrikerId)?.firstName || "Non-Striker" } : null}
        onRetire={handleRetire}
      />
    </div>
  );
}
