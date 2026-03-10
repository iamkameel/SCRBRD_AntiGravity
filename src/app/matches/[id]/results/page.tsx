import { fetchDocument } from "@/lib/firestore";
import { Match, Team } from "@/types/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { 
  ArrowLeft, Trophy, Calendar, MapPin, Users, Clock,
  TrendingUp, Target, Award, AlertCircle 
} from "lucide-react";
import { format } from "date-fns";

export default async function MatchResultsPage(props: { 
  params: Promise<{ id: string }> 
}) {
  const params = await props.params;
  const matchId = params.id;

  // Fetch match data
  const match = await fetchDocument<Match>('matches', matchId);

  if (!match) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Match Not Found</AlertTitle>
          <AlertDescription>
            The match you&apos;re looking for doesn&apos;t exist.
          </AlertDescription>
        </Alert>
        <Link href="/matches">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Matches
          </Button>
        </Link>
      </div>
    );
  }

  // Fetch team names
  const [homeTeam, awayTeam] = await Promise.all([
    fetchDocument<Team>('teams', match.homeTeamId),
    fetchDocument<Team>('teams', match.awayTeamId)
  ]);

  const homeTeamName = homeTeam?.name || match.homeTeamId;
  const awayTeamName = awayTeam?.name || match.awayTeamId;

  // Determine if match is completed
  const isCompleted = match.status === 'completed' || match.state === 'COMPLETED';

  return (
    <div className="container mx-auto py-8 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link 
          href={`/matches/${matchId}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Match
        </Link>
        {isCompleted && (
          <Badge className="bg-emerald-500 hover:bg-emerald-600">
            <Trophy className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )}
      </div>

      {/* Match Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Match Summary</CardTitle>
            <Badge variant="outline">{match.matchType || 'Cricket Match'}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {match.dateTime && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(match.dateTime), 'PPP')}</span>
              </div>
            )}
            {match.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{match.venue}</span>
              </div>
            )}
            {match.matchType && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{match.overs || 20} Overs</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Teams & Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Home Team */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{homeTeamName}</span>
              <Badge variant="outline">Home</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {match.score?.home || match.homeScore || '—'}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {match.inningsData?.firstInnings?.runs 
                ? `${match.inningsData.firstInnings.runs}/${match.inningsData.firstInnings.wickets}`
                : 'Score not available'}
            </p>
          </CardContent>
        </Card>

        {/* Away Team */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{awayTeamName}</span>
              <Badge variant="outline">Away</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {match.score?.away || match.awayScore || '—'}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {match.inningsData?.secondInnings?.runs 
                ? `${match.inningsData.secondInnings.runs}/${match.inningsData.secondInnings.wickets}`
                : 'Score not available'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Match Result */}
      {match.result && (
        <Card className="border-emerald-500/50 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-emerald-500" />
              Match Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{match.result}</p>
          </CardContent>
        </Card>
      )}

      {/* Toss Information */}
      {match.tossWinner && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Toss</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <span className="font-medium">{match.tossWinner}</span> won the toss and chose to{' '}
              <span className="font-medium">{match.tossChoice || 'bat'}</span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Match Officials */}
      {(match.umpires?.length || match.referee || match.scorer) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Match Officials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {match.umpires && match.umpires.length > 0 && (
              <div className="flex gap-2">
                <span className="text-muted-foreground min-w-20">Umpires:</span>
                <span>{match.umpires.join(', ')}</span>
              </div>
            )}
            {match.referee && (
              <div className="flex gap-2">
                <span className="text-muted-foreground min-w-20">Referee:</span>
                <span>{match.referee}</span>
              </div>
            )}
            {match.scorer && (
              <div className="flex gap-2">
                <span className="text-muted-foreground min-w-20">Scorer:</span>
                <span>{match.scorer}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Conditions */}
      {(match.weather || match.pitchCondition) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Match Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {match.weather && (
              <div className="flex gap-2">
                <span className="text-muted-foreground min-w-20">Weather:</span>
                <span>{match.weather}</span>
              </div>
            )}
            {match.pitchCondition && (
              <div className="flex gap-2">
                <span className="text-muted-foreground min-w-20">Pitch:</span>
                <span>{match.pitchCondition}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {match.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Match Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{match.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button asChild>
          <Link href={`/matches/${matchId}`}>
            View Full Scorecard
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/matches">
            Back to All Matches
          </Link>
        </Button>
      </div>
    </div>
  );
}
