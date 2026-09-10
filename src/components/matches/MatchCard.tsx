'use client';

import { Match, Team } from '@/types/firestore';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Trophy, Users, Moon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface MatchCardProps {
  match: Match;
  homeTeam?: Team;
  awayTeam?: Team;
  showActions?: boolean;
  variant?: 'default' | 'compact';
}

export function MatchCard({ 
  match, 
  homeTeam, 
  awayTeam, 
  showActions = true,
  variant = 'default'
}: MatchCardProps) {
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      'live': { variant: 'default', label: '🔴 LIVE' },
      'in_progress': { variant: 'default', label: '🔴 LIVE' },
      'scheduled': { variant: 'secondary', label: 'Scheduled' },
      'completed': { variant: 'outline', label: 'Completed' },
      'cancelled': { variant: 'destructive', label: 'Cancelled' },
      'postponed': { variant: 'outline', label: 'Postponed' },
    };
    
    return statusMap[status] || { variant: 'secondary' as const, label: status };
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date.toDate();
    return new Intl.DateTimeFormat('en-ZA', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(dateObj);
  };

  const statusInfo = getStatusBadge(match.status);

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                {match.isDayNight && (
                  <Badge variant="outline" className="border-indigo-500 text-indigo-500 gap-1 px-1.5 h-5 text-[10px]">
                    <Moon className="w-3 h-3" />
                    D/N
                  </Badge>
                )}
                {match.matchType && (
                  <span className="text-xs text-muted-foreground">{match.matchType}</span>
                )}
              </div>
              <div className="space-y-1">
                <p className="font-medium">{homeTeam?.name || 'Home Team'}</p>
                <p className="font-medium">{awayTeam?.name || 'Away Team'}</p>
              </div>
            </div>
            {showActions && (
              <Link href={`/matches/${match.id}`}>
                <Button variant="outline" size="sm">View</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex gap-2 mb-2">
              <Badge variant={statusInfo.variant}>
                {statusInfo.label}
              </Badge>
              {match.isDayNight && (
                <Badge variant="outline" className="border-indigo-500 text-indigo-500 gap-1">
                  <Moon className="w-3 h-3" />
                  Day/Night
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(match.matchDate)}
              {match.matchTime && (
                <>
                  <Clock className="h-3 w-3 ml-2" />
                  {match.matchTime}
                </>
              )}
            </p>
          </div>
          {match.matchType && (
            <Badge variant="outline">{match.matchType}</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Teams */}
        <div className="space-y-3">
          <div className={cn(
            "flex items-center justify-between p-3 rounded-lg",
            match.tossWinner === homeTeam?.id && "bg-muted"
          )}>
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{homeTeam?.name || 'Home Team'}</span>
            </div>
            {match.score?.home && (
              <span className="text-lg font-bold">{match.score.home}</span>
            )}
          </div>
          
          <div className={cn(
            "flex items-center justify-between p-3 rounded-lg",
            match.tossWinner === awayTeam?.id && "bg-muted"
          )}>
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{awayTeam?.name || 'Away Team'}</span>
            </div>
            {match.score?.away && (
              <span className="text-lg font-bold">{match.score.away}</span>
            )}
          </div>
        </div>

        {/* Result */}
        {match.result && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <Trophy className="h-4 w-4 text-green-600" />
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              {match.result}
            </p>
          </div>
        )}

        {/* Venue */}
        {(match.venue || match.location) && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            {match.venue || match.location}
          </p>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2 border-t">
            <Link href={`/matches/${match.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
            {match.status === 'live' || match.status === 'in_progress' ? (
              <Link href={`/matches/${match.id}/manage`} className="flex-1">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Live Scoring
                </Button>
              </Link>
            ) : match.status === 'scheduled' ? (
              <Link href={`/matches/${match.id}/pre-match`} className="flex-1">
                <Button className="w-full">
                  Pre-Match
                </Button>
              </Link>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
