"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TournamentBracket as TournamentBracketType } from "@/app/actions/tournamentActions";
import { BracketMatchCard } from "./BracketMatchCard";
import { GitBranch, Trophy } from "lucide-react";

interface TournamentBracketProps {
  bracket: TournamentBracketType;
}

export function TournamentBracket({ bracket }: TournamentBracketProps) {
  const rounds = Object.keys(bracket.rounds);
  
  if (rounds.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No bracket data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Tournament Bracket
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Bracket Display */}
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-8 min-w-max">
              {rounds.map((round, roundIndex) => (
                <div key={round} className="flex flex-col justify-around min-w-[200px]">
                  {/* Round Title */}
                  <div className="mb-4 sticky top-0 bg-background z-10">
                    <h3 className="font-semibold text-center text-primary border-b-2 border-primary pb-2">
                      {round}
                    </h3>
                  </div>

                  {/* Matches in Round */}
                  <div className={`flex flex-col gap-8 ${
                    roundIndex > 0 ? `justify-around` : ''
                  }`} style={{
                    paddingTop: roundIndex > 0 ? `${Math.pow(2, roundIndex) * 40}px` : '0'
                  }}>
                    {bracket.rounds[round].map((match, index) => (
                      <div 
                        key={match.id}
                        style={{
                          marginBottom: roundIndex > 0 ? `${Math.pow(2, roundIndex + 1) * 40}px` : '0'
                        }}
                      >
                        <BracketMatchCard match={match} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
            <p className="text-sm font-medium mb-2">Legend:</p>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-amber-500/20 border border-amber-500/30"></div>
                <span>Winner</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-3 w-3 text-amber-500" />
                <span>Champion</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-12 bg-muted/50 rounded"></div>
                <span>TBD</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
