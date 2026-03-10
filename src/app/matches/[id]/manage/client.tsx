'use client';

import { useState, useEffect } from 'react';
import { useLiveScore } from '@/hooks/useLiveScore';
import { LiveScoreboard } from '@/components/match/LiveScoreboard';
import { ScoringDialog } from './scoring-dialog';
import { PlayerSelectionDialog } from './player-selection-dialog';
import { UndoDialog } from './undo-dialog';
import { WagonWheel } from '@/components/charts/WagonWheel';
import { PitchMap } from '@/components/charts/PitchMap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { endInningsAction } from '@/app/actions/matchActions';
import { useToast } from '@/hooks/use-toast';
import { Users, RotateCcw, Flag, ChevronLeft, Settings } from 'lucide-react';
import { EditMatchDialog } from './edit-match-dialog';
import { EndInningsDialog } from './end-innings-dialog';
import { EndMatchDialog } from './end-match-dialog';
import { TossDialog } from './toss-dialog';
import { endMatchAction } from '@/app/actions/matchActions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Match, Team, Person } from '@/types/firestore';
import { MatchInfoCard } from '@/components/match/MatchInfoCard';
import { MatchSummary } from './match-summary';

import { PlayCircle } from 'lucide-react';
import { BallByBallCommentary } from '@/components/match/BallByBallCommentary';
import { generateCommentaryFromHistory } from '@/lib/commentaryUtils';

interface MatchManagementClientProps {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  homePlayers: Person[];
  awayPlayers: Person[];
}

export function MatchManagementClient({ 
  match, 
  homeTeam, 
  awayTeam, 
  homePlayers, 
  awayPlayers 
}: MatchManagementClientProps) {
  const { liveScore, loading, error, connected } = useLiveScore(match.id!);
  const { toast } = useToast();
  const router = useRouter();
  
  const [scoringOpen, setScoringOpen] = useState(false);
  const [playersOpen, setPlayersOpen] = useState(false);
  const [undoOpen, setUndoOpen] = useState(false);
  const [editMatchOpen, setEditMatchOpen] = useState(false);
  const [endInningsOpen, setEndInningsOpen] = useState(false);
  const [endMatchOpen, setEndMatchOpen] = useState(false);
  const [tossOpen, setTossOpen] = useState(false);
  const [shotCoords, setShotCoords] = useState<{ angle: number; distance: number } | undefined>(undefined);
  const [endingInnings, setEndingInnings] = useState(false);

  // Effect: Auto-open player selection if striker is missing (Wicket Fall)
  useEffect(() => {
    if (liveScore && !liveScore.currentPlayers?.strikerId && !loading && !endingInnings) {
      // Small delay to allow toast to appear first
      const timer = setTimeout(() => {
        setPlayersOpen(true);
        toast({
          title: "Wicket!",
          description: "Please select the new batsman.",
          variant: "default"
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [liveScore, liveScore?.currentPlayers?.strikerId, loading, endingInnings, toast]);

  // Effect: Auto-open player selection if bowler is missing (End of Over)
  useEffect(() => {
    if (liveScore && !liveScore.currentPlayers?.bowlerId && !loading && !endingInnings) {
      // Only trigger if match has started (balls > 0) or explicitly needed
      if ((liveScore.currentInnings?.balls || 0) > 0) {
        const timer = setTimeout(() => {
          setPlayersOpen(true);
          toast({
            title: "Over Complete",
            description: "Please select the next bowler.",
            variant: "default"
          });
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [liveScore, liveScore?.currentPlayers?.bowlerId, loading, endingInnings, toast]);

  // Effect: Prompt to end innings if wickets or overs limit reached
  useEffect(() => {
    if (!liveScore || loading || endingInnings) return;

    const { wickets, overs } = liveScore.currentInnings;
    const maxOvers = match.overs || 20; // Default to 20 if not specified for now, or handle based on match type
    
    const isAllOut = wickets >= 10;
    const isOversComplete = match.overs ? overs >= match.overs : false;

    if (isAllOut || isOversComplete) {
       // Avoid spamming toast if already shown? 
       // For now, simple check. In real app, might want a state 'inningsPromptShown'
       // But useEffect dependencies will re-trigger on score update.
       // Let's rely on the user acting on it or the toast deduping.
       // Actually, to avoid spam, let's only show if we haven't ended it yet.
       // The 'End Innings' button is the action.
       
       const title = isAllOut ? "All Out!" : "Overs Complete";
       const description = "Please click 'End Innings' to conclude this innings.";
       
       // We can use a ref or state to prevent repeated toasts for the same state?
       // For this MVP, a toast is fine.
       
       // Only show if we are not already in a 'completed' state for this innings
       // But liveScore doesn't have an 'inningsStatus' field other than the implicit one.
       
       // Let's just show it.
       const timer = setTimeout(() => {
         toast({
           title,
           description,
           variant: "destructive" // Use destructive to grab attention
         });
       }, 500);
       return () => clearTimeout(timer);
    }
  }, [liveScore, match.overs, loading, endingInnings, toast]);

  // Handle wagon wheel click
  const handleShotSelect = (data: { angle: number; distance: number }) => {
    setShotCoords(data);
    setScoringOpen(true);
  };

  const handleEndInningsClick = () => {
    if (liveScore?.inningsNumber === 2) {
      setEndMatchOpen(true);
    } else {
      setEndInningsOpen(true);
    }
  };

  const handleConfirmEndInnings = async () => {
    setEndingInnings(true);
    try {
      const result = await endInningsAction(match.id!);
      if (result.success) {
        toast({
          title: 'Innings Ended',
          description: result.isMatchComplete 
            ? `Match Complete! Winner: ${result.winnerId}` 
            : `Innings break. Target: ${result.target}`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to end innings',
        variant: 'destructive'
      });
    } finally {
      setEndingInnings(false);
    }
  };

  const handleConfirmEndMatch = async (result: { winnerId?: string; margin?: string; resultText: string }) => {
    setEndingInnings(true);
    try {
      const actionResult = await endMatchAction(match.id!, result);
      if (actionResult.success) {
        toast({
          title: 'Match Completed',
          description: 'The match has been successfully concluded.',
        });
      } else {
        throw new Error(actionResult.error);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to end match',
        variant: 'destructive'
      });
    } finally {
      setEndingInnings(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading match data...</div>;
  }

  if (error && match.status !== 'scheduled') {
    return <div className="p-8 text-center text-destructive">Error: {error}</div>;
  }

  // Derived state
  const currentBattingTeamId = liveScore?.currentInnings?.battingTeamId;
  const currentBowlingTeamId = currentBattingTeamId === homeTeam.id ? awayTeam.id : homeTeam.id;
  
  const striker = liveScore?.batsmen?.find(
    b => b.playerId === liveScore.currentPlayers?.strikerId
  );
  const bowler = liveScore?.bowlers?.find(
    b => b.playerId === liveScore.currentPlayers?.bowlerId
  );

  // Prepare player lists with names
  const allPlayers = [...homePlayers, ...awayPlayers];
  const getPlayerName = (id: string) => {
    const p = allPlayers.find(p => p.id === id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown Player';
  };

  // Enrich striker/bowler objects with names for dialogs
  // ScoringDialog expects { id: string; name: string }
  const enrichedStriker = striker ? { 
    id: striker.playerId, 
    name: getPlayerName(striker.playerId),
    ...striker 
  } : null;
  
  const enrichedBowler = bowler ? { 
    id: bowler.playerId, 
    name: getPlayerName(bowler.playerId),
    ...bowler 
  } : null;

  // Calculate unavailable players
  const unavailableBatsmenIds = liveScore?.batsmen
    ?.filter(b => b.isOut)
    .map(b => b.playerId) || [];
  
  // Also exclude currently batting players if they are not the ones being replaced?
  // Actually, the dialog allows setting both.
  // If we are just opening the dialog, we might want to keep current players selectable (to edit).
  // But usually we want to pick *new* players.
  // Let's just exclude those who are OUT.
  
  const lastBall = liveScore?.ballHistory?.[liveScore.ballHistory.length - 1];
  const isOverComplete = liveScore?.currentInnings?.balls && liveScore.currentInnings.balls % 6 === 0;

  const unavailableBowlerIds = isOverComplete && lastBall?.bowlerId ? [lastBall.bowlerId] : [];

  // Generate Commentary
  const commentary = generateCommentaryFromHistory(liveScore?.ballHistory || [], allPlayers);

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-7xl relative" data-testid="match-management-container">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 bg-[url('/images/pattern.svg')] opacity-[0.03] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/matches/${match.id}`}>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-emerald-500/10 hover:text-emerald-600">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex justify-center items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent drop-shadow-sm">
                Live Scoring
              </h1>
              <span className="relative flex items-center justify-center h-6 px-3 rounded-full bg-red-500 text-[10px] font-bold text-white tracking-widest shadow-sm">
                <span className="absolute inset-0 rounded-full bg-red-400 opacity-75 animate-ping"></span>
                <span className="relative z-10 animate-pulse">LIVE</span>
              </span>
            </div>
            <p className="text-muted-foreground font-medium mt-1">
              {homeTeam.name} <span className="text-emerald-500 mx-1">vs</span> {awayTeam.name}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={() => setEditMatchOpen(true)}
            className="gap-2 flex-1 md:flex-none shadow-sm hover:border-blue-500/50 hover:bg-blue-500/5"
            data-testid="edit-match-button"
          >
            <Settings className="h-4 w-4 text-blue-600" />
            Edit Match
          </Button>
          
          {!match.tossWinnerId && (
            <Button 
              variant="default"
              onClick={() => setTossOpen(true)}
              className="gap-2 flex-1 md:flex-none bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              <PlayCircle className="h-4 w-4" />
              Start Match / Toss
            </Button>
          )}

          <Button 
            variant="outline" 
            onClick={() => setPlayersOpen(true)}
            className="gap-2 flex-1 md:flex-none shadow-sm hover:border-emerald-500/50 hover:bg-emerald-500/5"
            data-testid="players-button"
          >
            <Users className="h-4 w-4 text-emerald-600" />
            Players
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setUndoOpen(true)}
            disabled={!liveScore?.ballHistory?.length}
            className="gap-2 flex-1 md:flex-none shadow-sm hover:border-orange-500/50 hover:bg-orange-500/5"
            data-testid="undo-button"
          >
            <RotateCcw className="h-4 w-4 text-orange-600" />
            Undo
          </Button>
          <Button 
            variant="destructive"
            onClick={handleEndInningsClick}
            disabled={endingInnings || !match.tossWinnerId}
            className="gap-2 flex-1 md:flex-none shadow-md hover:shadow-lg transition-all"
            data-testid="end-innings-button"
          >
            <Flag className="h-4 w-4" />
            End Innings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Scoreboard & Controls */}
        <div className="lg:col-span-5 space-y-6">
          {(match.status === 'completed' || liveScore?.status === 'completed') && (
            <MatchSummary 
              matchId={match.id!} 
              homeTeam={homeTeam} 
              awayTeam={awayTeam} 
              allPlayers={allPlayers}
            />
          )}

          {(match.status !== 'scheduled' || liveScore) && (
            <LiveScoreboard 
              matchId={match.id!} 
              allPlayers={allPlayers}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              matchData={match}
            />
          )}
          
          <MatchInfoCard 
            competition={match.leagueId || "League"}
            date={match.matchDate ? new Date(typeof match.matchDate === 'string' ? match.matchDate : match.matchDate.toDate()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}
            time={match.matchDate ? new Date(typeof match.matchDate === 'string' ? match.matchDate : match.matchDate.toDate()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'TBA'}
            venue={match.venue || match.fieldId || 'TBA'}
            weather={match.weather}
            currentInnings={liveScore ? `${liveScore.inningsNumber === 1 ? '1st' : '2nd'} Innings` : undefined}
            umpires={match.umpires}
            referee={match.referee}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button 
                className="h-24 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  setShotCoords(undefined);
                  setScoringOpen(true);
                }}
                disabled={!liveScore?.currentPlayers?.strikerId || !liveScore?.currentPlayers?.bowlerId}
                data-testid="record-ball-button"
              >
                Record Ball
              </Button>
              <Button 
                variant="secondary" 
                className="h-24 text-lg font-semibold"
                onClick={() => setPlayersOpen(true)}
                disabled={!liveScore?.currentPlayers?.strikerId || !liveScore?.currentPlayers?.bowlerId}
                data-testid="swap-ends-button"
              >
                Swap Ends
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Wagon Wheel & Analysis */}
        <div className="lg:col-span-7">
          <Card className="h-full glass-card border-none shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/30">
              <CardTitle className="text-xl font-bold tracking-tight uppercase">Analysis Hub</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="wagon" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 p-1 rounded-xl">
                  <TabsTrigger value="wagon" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Wagon Wheel</TabsTrigger>
                  <TabsTrigger value="pitch" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Pitch Map</TabsTrigger>
                  <TabsTrigger value="commentary" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Log</TabsTrigger>
                </TabsList>
                
                <TabsContent value="wagon" className="flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="w-full max-w-[450px] aspect-square relative glass-card p-4 rounded-full border-emerald-500/20">
                    <WagonWheel
                      shots={liveScore?.ballHistory?.map(b => ({
                        angle: b.coordinates?.angle || 0,
                        distance: b.coordinates?.distance || 50,
                        runs: b.runs,
                        isWicket: b.isWicket
                      })) || []}
                      onShotSelect={handleShotSelect}
                    />
                  </div>
                  <div className="mt-8 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-center">
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      🎯 Interactive Field: Tap to record shot placement
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="pitch" className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="glass-card p-6 rounded-2xl border-emerald-500/20">
                    <PitchMap
                      deliveries={liveScore?.ballHistory
                        ?.filter(b => b.length && b.line)
                        .map(b => ({
                          length: b.length as 'Full' | 'Good' | 'Short' | 'Yorker',
                          line: b.line as 'Off Stump' | 'Middle Stump' | 'Leg Stump' | 'Wide Outside Off' | 'Wide Down Leg',
                          runs: b.runs || 0,
                          isWicket: b.isWicket || false
                        })) || []
                      }
                    />
                  </div>
                </TabsContent>

                <TabsContent value="commentary" className="animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="glass-card rounded-2xl overflow-hidden border-emerald-500/10">
                    <BallByBallCommentary commentary={commentary} maxHeight="600px" />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <EditMatchDialog
        open={editMatchOpen}
        onOpenChange={setEditMatchOpen}
        match={match}
      />

      <EndInningsDialog
        open={endInningsOpen}
        onOpenChange={setEndInningsOpen}
        onConfirm={handleConfirmEndInnings}
        runs={liveScore?.currentInnings?.runs || 0}
        wickets={liveScore?.currentInnings?.wickets || 0}
        overs={liveScore?.currentInnings?.overs || 0}
      />

      <EndMatchDialog
        open={endMatchOpen}
        onOpenChange={setEndMatchOpen}
        onConfirm={handleConfirmEndMatch}
        homeTeamId={homeTeam.id!}
        awayTeamId={awayTeam.id!}
        homeTeamName={homeTeam.name}
        awayTeamName={awayTeam.name}
      />

      <ScoringDialog
        open={scoringOpen}
        onOpenChange={setScoringOpen}
        matchId={match.id!}
        striker={enrichedStriker}
        bowler={enrichedBowler}
        shotCoordinates={shotCoords}
      />

      <PlayerSelectionDialog
        open={playersOpen}
        onOpenChange={setPlayersOpen}
        matchId={match.id!}
        team1Players={homePlayers}
        team2Players={awayPlayers}
        battingTeamId={currentBattingTeamId || homeTeam.id!}
        bowlingTeamId={currentBowlingTeamId || awayTeam.id!}
        currentStrikerId={liveScore?.currentPlayers?.strikerId}
        currentNonStrikerId={liveScore?.currentPlayers?.nonStrikerId}
        currentBowlerId={liveScore?.currentPlayers?.bowlerId}
        unavailableBatsmenIds={unavailableBatsmenIds}
        unavailableBowlerIds={unavailableBowlerIds}
      />

      <UndoDialog
        open={undoOpen}
        onOpenChange={setUndoOpen}
        matchId={match.id!}
        lastBall={liveScore?.ballHistory?.[liveScore.ballHistory.length - 1]}
      />

      <TossDialog
        open={tossOpen}
        onOpenChange={setTossOpen}
        matchId={match.id!}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        onTossRecorded={() => {
          router.refresh();
          setPlayersOpen(true);
        }}
      />
    </div>
  );
}
