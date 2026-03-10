"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getHeadToHeadStatsAction, HeadToHeadStats } from "@/app/actions/teamComparisonActions";
import { Button } from "@/components/ui/button";
import { Users, Trophy, TrendingUp, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Team {
  id: string;
  name: string;
}

interface TeamComparisonProps {
  teams: Team[];
}

export function TeamComparison({ teams }: TeamComparisonProps) {
  const [team1Id, setTeam1Id] = useState<string>("");
  const [team2Id, setTeam2Id] = useState<string>("");
  const [stats, setStats] = useState<HeadToHeadStats | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!team1Id || !team2Id || team1Id === team2Id) return;

    setLoading(true);
    const result = await getHeadToHeadStatsAction(team1Id, team2Id);
    if (result.success && result.stats) {
      setStats(result.stats);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Team Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Teams to Compare
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Team 1</label>
              <Select value={team1Id} onValueChange={setTeam1Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.filter(t => t.id !== team2Id).map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Team 2</label>
              <Select value={team2Id} onValueChange={setTeam2Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.filter(t => t.id !== team1Id).map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleCompare}
            disabled={!team1Id || !team2Id || team1Id === team2Id || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Compare Teams
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Head-to-Head Stats */}
      {stats && (
        <div className="space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Head-to-Head Record</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Team 1 */}
                <div className="text-center">
                  <h3 className="font-bold text-2xl mb-2">{stats.team1.name}</h3>
                  <div className="text-4xl font-bold text-primary mb-2">
                    {stats.team1.wins}
                  </div>
                  <p className="text-sm text-muted-foreground">Wins</p>
                </div>

                {/* VS & Total */}
                <div className="flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-muted-foreground mb-2">VS</div>
                  <p className="text-sm text-muted-foreground">
                    {stats.totalMatches} total match{stats.totalMatches !== 1 ? 'es' : ''}
                  </p>
                  {stats.team1.ties > 0 && (
                    <Badge variant="secondary" className="mt-2">
                      {stats.team1.ties} tie{stats.team1.ties !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>

                {/* Team 2 */}
                <div className="text-center">
                  <h3 className="font-bold text-2xl mb-2">{stats.team2.name}</h3>
                  <div className="text-4xl font-bold text-primary mb-2">
                    {stats.team2.wins}
                  </div>
                  <p className="text-sm text-muted-foreground">Wins</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Matches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Recent Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentMatches.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No matches found</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentMatches.map((match, index) => (
                    <Link
                      key={match.id}
                      href={`/matches/${match.id}`}
                      className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{match.result}</p>
                          <p className="text-sm text-muted-foreground">{match.date}</p>
                        </div>
                        <Badge variant={
                          match.winner === stats.team1.name ? 'default' :
                          match.winner === stats.team2.name ? 'secondary' :
                          'outline'
                        }>
                          {match.winner}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
