"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";
import { BracketMatch } from "@/app/actions/tournamentActions";

interface BracketMatchCardProps {
  match: BracketMatch;
}

export function BracketMatchCard({ match }: BracketMatchCardProps) {
  const isCompleted = match.status === 'completed';
  const isPending = match.status === 'pending';
  
  return (
    <Card className={`relative ${isCompleted ? 'bg-muted/30' : ''} ${isPending ? 'opacity-60' : ''}`}>
      <CardContent className="p-3 space-y-2">
        {/* Team 1 */}
        <div className={`flex items-center justify-between p-2 rounded ${
          match.winnerId === match.team1Id ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-muted/50'
        }`}>
          <div className="flex items-center gap-2 flex-1">
            {match.winnerId === match.team1Id && (
              <Trophy className="h-3 w-3 text-amber-500" />
            )}
            <span className={`text-sm font-medium truncate ${
              match.winnerId === match.team1Id ? 'font-bold' : ''
            }`}>
              {match.team1Name || 'TBD'}
            </span>
          </div>
          {match.team1Score && (
            <span className="text-sm font-bold ml-2">{match.team1Score}</span>
          )}
        </div>

        {/* VS or Arrow */}
        <div className="flex justify-center">
          {isPending ? (
            <span className="text-xs text-muted-foreground">vs</span>
          ) : (
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
          )}
        </div>

        {/* Team 2 */}
        <div className={`flex items-center justify-between p-2 rounded ${
          match.winnerId === match.team2Id ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-muted/50'
        }`}>
          <div className="flex items-center gap-2 flex-1">
            {match.winnerId === match.team2Id && (
              <Trophy className="h-3 w-3 text-amber-500" />
            )}
            <span className={`text-sm font-medium truncate ${
              match.winnerId === match.team2Id ? 'font-bold' : ''
            }`}>
              {match.team2Name || 'TBD'}
            </span>
          </div>
          {match.team2Score && (
            <span className="text-sm font-bold ml-2">{match.team2Score}</span>
          )}
        </div>

        {/* Status */}
        <div className="flex justify-center pt-1">
          <Badge variant={isCompleted ? 'default' : 'outline'} className="text-xs">
            {isCompleted ? 'Completed' : isPending ? 'Pending' : 'Scheduled'}
          </Badge>
        </div>

        {/* Match Link */}
        {match.matchId && (
          <Link 
            href={`/matches/${match.matchId}`}
            className="absolute inset-0 z-10"
            aria-label="View match details"
          />
        )}
      </CardContent>
    </Card>
  );
}
