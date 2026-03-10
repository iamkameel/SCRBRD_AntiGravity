'use client';

import { useScoringHub } from '@/hooks/useScoringHub';
import { Match, Person } from '@/types/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Users, 
  RotateCcw, 
  Flag,
  ChevronLeft,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MatchScoringInterface } from '@/components/scoring/MatchScoringInterface';
import { useToast } from '@/hooks/use-toast';
import { ReviewConfirmStep } from './review-confirm-step';

interface ScoringHubClientProps {
  match: Match;
  homePlayers: Person[];
  awayPlayers: Person[];
}

export function ScoringHubClient({ match, homePlayers, awayPlayers }: ScoringHubClientProps) {
  const { 
    state, 
    context, 
    send,
    isScoring, 
    isBlocked, 
    isReviewing, 
    /* recordBall, */
    undoBall, 
    /* endInnings, */
    confirmEndInnings,
    loading 
  } = useScoringHub(match.id!);
  const { toast } = useToast();
  const router = useRouter();

  if (loading && !context.match) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Initializing Intelligent Scoring Hub...</p>
      </div>
    );
  }

  const currentInningsNum = context.liveScore?.inningsNumber || 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header / Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/matches/${match.id}`}>
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Scoring Hub</h1>
            <p className="text-sm text-muted-foreground">
              {match.homeTeamName} vs {match.awayTeamName} • {match.matchType}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={isScoring ? "destructive" : "secondary"} className="animate-pulse">
            {isScoring ? "LIVE" : state.value.toString().toUpperCase()}
          </Badge>
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Scoring Controls (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {isBlocked ? (
            <Card className="border-warning/50 bg-warning/5 dark:bg-warning/10 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <AlertCircle className="w-5 h-5" />
                  Setup Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  Match cannot proceed to live scoring until pre-match procedures are complete.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href={`/matches/${match.id}/pre-match`}>
                      <Users className="w-4 h-4 mr-2" />
                      Confirm Playing XI
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href={`/matches/${match.id}/pre-match?tab=toss`}>
                      <Flag className="w-4 h-4 mr-2" />
                      Conduct Toss
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : isReviewing && context.liveScore ? (
            <ReviewConfirmStep 
              match={match}
              liveScore={context.liveScore}
              inningsNumber={currentInningsNum}
              onConfirm={confirmEndInnings}
              onCancel={() => send({ type: 'START_SCORING' })}
            />
          ) : (
            <MatchScoringInterface 
              matchId={match.id!}
              homeTeamName={match.homeTeamName || 'Home'}
              awayTeamName={match.awayTeamName || 'Away'}
              currentInnings={currentInningsNum as 1 | 2}
              initialData={{ liveScore: context.liveScore }}
            />
          )}
        </div>

        {/* Right Col: Scoreboard & Live Stats */}
        <div className="space-y-6">
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card to-secondary/10 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Live Broadcast Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              {context.liveScore ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <h2 className="text-3xl font-black text-primary font-mono tabular-nums">
                      {context.liveScore.currentInnings.runs}/{context.liveScore.currentInnings.wickets}
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">
                      Overs {context.liveScore.currentInnings.overs} • CRR {context.liveScore.currentInnings.runRate?.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-secondary/30 border border-secondary/50">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Striker</p>
                      <p className="text-sm font-semibold truncate">
                        {context.liveScore.currentPlayers.strikerName || '---'}
                      </p>
                    </div>
                    <div className="p-2 rounded bg-secondary/30 border border-secondary/50">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Bowler</p>
                      <p className="text-sm font-semibold truncate">
                        {context.liveScore.currentPlayers.bowlerName || '---'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-24 flex items-center justify-center text-muted-foreground text-sm italic">
                  Awaiting first delivery...
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="actions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="actions">Live Log</TabsTrigger>
              <TabsTrigger value="fielding">Fielding</TabsTrigger>
            </TabsList>
            <TabsContent value="actions" className="space-y-3 mt-4">
              {context.actions.slice(-5).reverse().map((action) => (
                <div key={action.id} className="flex items-center justify-between p-3 rounded-lg bg-card border text-sm animate-in slide-in-from-right duration-300">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                      action.isWicket ? "bg-destructive text-destructive-foreground" : "bg-primary/20 text-primary"
                    )}>
                      {action.isWicket ? "W" : (action.runs || 0) + (action.extras || 0)}
                    </div>
                    <div>
                      <p className="font-semibold">{action.overNumber}.{action.ballInOver}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {action.isWicket ? "Out!" : `${(action.runs || 0) + (action.extras || 0)} runs`}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => undoBall('Correction')}>
                    <RotateCcw className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
