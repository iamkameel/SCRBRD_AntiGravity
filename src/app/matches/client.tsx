'use client';

import { useState } from 'react';
import { Match, Team } from '@/types/firestore';
import { MatchCard } from './match-card';
import { MatchCalendar } from './match-calendar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid3x3, CalendarDays, Plus } from 'lucide-react';
import Link from 'next/link';

interface MatchesClientProps {
  matches: Match[];
  teams: Team[];
}

export function MatchesClient({ matches, teams }: MatchesClientProps) {
  const [view, setView] = useState<'grid' | 'calendar'>('grid');
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');

  // Helper to get team by ID
  const getTeam = (teamId: string) => teams.find(t => t.id === teamId);

  // Filter matches based on selected filter
  const getFilteredMatches = () => {
    const now = new Date();

    switch (filter) {
      case 'live':
        return matches.filter(m => m.status === 'live' || m.status === 'in_progress');
      case 'upcoming':
        return matches.filter(m => {
          if (!m.matchDate) return false;
          const matchDate = typeof m.matchDate === 'string' 
            ? new Date(m.matchDate)
            : (m.matchDate && typeof m.matchDate.toDate === 'function' ? m.matchDate.toDate() : new Date(m.matchDate as any));
          return matchDate > now && m.status === 'scheduled';
        });
      case 'completed':
        return matches.filter(m => m.status === 'completed');
      default:
        return matches;
    }
  };

  const filteredMatches = getFilteredMatches();

  // Categorize matches for grid view
  const liveMatches = matches.filter(m => m.status === 'live' || m.status === 'in_progress');
  const upcomingMatches = matches.filter(m => {
    const now = new Date();
    if (!m.matchDate) return false;
    const matchDate = typeof m.matchDate === 'string' 
      ? new Date(m.matchDate)
      : (m.matchDate && typeof m.matchDate.toDate === 'function' ? m.matchDate.toDate() : new Date(m.matchDate as any));
    return matchDate > now && m.status === 'scheduled';
  }).sort((a, b) => {
    const aDate = typeof a.matchDate === 'string' ? new Date(a.matchDate) : (a.matchDate && typeof a.matchDate.toDate === 'function' ? a.matchDate.toDate() : new Date(a.matchDate as any || 0));
    const bDate = typeof b.matchDate === 'string' ? new Date(b.matchDate) : (b.matchDate && typeof b.matchDate.toDate === 'function' ? b.matchDate.toDate() : new Date(b.matchDate as any || 0));
    return aDate.getTime() - bDate.getTime();
  });
  const completedMatches = matches.filter(m => m.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Matches</h1>
          <p className="text-muted-foreground">
            Manage and view all your cricket matches
          </p>
        </div>
        <Link href="/matches/add">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Match
          </Button>
        </Link>
      </div>

      {/* View Toggle & Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('grid')}
            className="gap-2"
          >
            <Grid3x3 className="h-4 w-4" />
            Grid
          </Button>
          <Button
            variant={view === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('calendar')}
            className="gap-2"
          >
            <CalendarDays className="h-4 w-4" />
            Calendar
          </Button>
        </div>

        {view === 'grid' && (
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-auto">
            <TabsList>
              <TabsTrigger value="all">
                All ({matches.length})
              </TabsTrigger>
              <TabsTrigger value="live">
                Live ({liveMatches.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingMatches.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedMatches.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {/* Content */}
      {view === 'calendar' ? (
        <MatchCalendar matches={matches} />
      ) : (
        <div className="space-y-6">
          {filter === 'all' ? (
            <>
              {/* Live Matches Section */}
              {liveMatches.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    Live Matches
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {liveMatches.map(match => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        homeTeam={getTeam(match.homeTeamId)}
                        awayTeam={getTeam(match.awayTeamId)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Matches Section */}
              {upcomingMatches.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Upcoming Matches</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcomingMatches.map(match => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        homeTeam={getTeam(match.homeTeamId)}
                        awayTeam={getTeam(match.awayTeamId)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Matches Section */}
              {completedMatches.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Completed Matches</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedMatches.slice(0, 6).map(match => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        homeTeam={getTeam(match.homeTeamId)}
                        awayTeam={getTeam(match.awayTeamId)}
                        variant="compact"
                      />
                    ))}
                  </div>
                  {completedMatches.length > 6 && (
                    <Button variant="outline" className="w-full">
                      View All Completed Matches ({completedMatches.length})
                    </Button>
                  )}
                </div>
              )}

              {/* Empty State */}
              {matches.length === 0 && (
                <Card className="p-12 text-center">
                  <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first match to get started
                  </p>
                  <Link href="/matches/add">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Match
                    </Button>
                  </Link>
                </Card>
              )}
            </>
          ) : (
            /* Filtered View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMatches.length > 0 ? (
                filteredMatches.map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    homeTeam={getTeam(match.homeTeamId)}
                    awayTeam={getTeam(match.awayTeamId)}
                  />
                ))
              ) : (
                <Card className="col-span-full p-12 text-center">
                  <p className="text-muted-foreground">
                    No {filter} matches found
                  </p>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
