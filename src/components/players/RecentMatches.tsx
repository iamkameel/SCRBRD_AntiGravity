'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, TrendingDown, Trophy, MapPin } from "lucide-react";
import Link from "next/link";

interface RecentMatch {
  matchId: string;
  date: string;
  opponent: string;
  venue: string;
  result: 'won' | 'lost' | 'tied' | 'no-result';
  playerPerformance: {
    runs?: number;
    wickets?: number;
    catches?: number;
    ballsFaced?: number;
    overs?: number;
  };
}

interface RecentMatchesProps {
  playerId: string;
  matches?: RecentMatch[];
}

export function RecentMatches({ playerId, matches = [] }: RecentMatchesProps) {
  // Mock data for now - in production, this would fetch from the database
  const mockMatches: RecentMatch[] = matches.length > 0 ? matches : [
    {
      matchId: "m1",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      opponent: "Mumbai Indians",
      venue: "Wankhede Stadium",
      result: "won",
      playerPerformance: {
        runs: 78,
        ballsFaced: 52,
        catches: 1
      }
    },
    {
      matchId: "m2",
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      opponent: "Knight Riders",
      venue: "Eden Gardens",
      result: "lost",
      playerPerformance: {
        runs: 34,
        ballsFaced: 28,
        wickets: 2,
        overs: 4
      }
    },
    {
      matchId: "m3",
      date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      opponent: "Sunrisers",
      venue: "Rajiv Gandhi Stadium",
      result: "won",
      playerPerformance: {
        runs: 102,
        ballsFaced: 64,
        catches: 2
      }
    },
    {
      matchId: "m4",
      date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      opponent: "Capitals",
      venue: "Feroz Shah Kotla",
      result: "tied",
      playerPerformance: {
        runs: 45,
        ballsFaced: 38,
        wickets: 1,
        overs: 3
      }
    },
    {
      matchId: "m5",
      date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      opponent: "Super Kings",
      venue: "Chepauk",
      result: "lost",
      playerPerformance: {
        runs: 23,
        ballsFaced: 19,
      }
    }
  ];

  const getResultVariant = (result: string) => {
    switch (result) {
      case 'won':
        return 'default';
      case 'lost':
        return 'destructive';
      case 'tied':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getResultIcon = (result: string) => {
    return result === 'won' ? TrendingUp : TrendingDown;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Matches
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mockMatches.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent matches found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockMatches.map((match) => {
              const ResultIcon = getResultIcon(match.result);
              return (
                <Link
                  key={match.matchId}
                  href={`/matches/${match.matchId}`}
                  className="block"
                >
                  <div className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all group">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold group-hover:text-primary transition-colors">
                            vs {match.opponent}
                          </h4>
                          <Badge variant={getResultVariant(match.result)} className="text-xs">
                            <ResultIcon className="h-3 w-3 mr-1" />
                            {match.result.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(match.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {match.venue}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Performance Stats */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      {match.playerPerformance.runs !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Runs:</span>
                          <span className="font-bold text-primary">
                            {match.playerPerformance.runs}
                            {match.playerPerformance.ballsFaced && (
                              <span className="text-muted-foreground font-normal text-xs ml-1">
                                ({match.playerPerformance.ballsFaced})
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                      {match.playerPerformance.wickets !== undefined && match.playerPerformance.wickets > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Wickets:</span>
                          <span className="font-bold text-destructive">
                            {match.playerPerformance.wickets}
                            {match.playerPerformance.overs && (
                              <span className="text-muted-foreground font-normal text-xs ml-1">
                                ({match.playerPerformance.overs} ov)
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                      {match.playerPerformance.catches !== undefined && match.playerPerformance.catches > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Catches:</span>
                          <span className="font-bold">{match.playerPerformance.catches}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
