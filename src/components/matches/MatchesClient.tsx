"use client";

import { useState } from 'react';
import { useViewMode } from '@/hooks/useViewMode';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Trophy, LayoutGrid, List, Table, Calendar, Search, MapPin } from "lucide-react";
import { Match, Team } from "@/types/firestore";

interface MatchesClientProps {
  matches: Match[];
  teams: Team[];
}

export function MatchesClient({ matches, teams }: MatchesClientProps) {
  const { viewMode, setViewMode } = useViewMode({ 
    storageKey: 'matches-view-mode',
    defaultMode: 'list'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Get team name helper
  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || 'TBA';
  };

  // Filter and sort matches
  const filteredMatches = matches.filter(match => {
    const homeTeam = getTeamName(match.homeTeamId);
    const awayTeam = getTeamName(match.awayTeamId);
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = (
      homeTeam.toLowerCase().includes(searchLower) ||
      awayTeam.toLowerCase().includes(searchLower) ||
      match.venue?.toLowerCase().includes(searchLower) ||
      match.status?.toLowerCase().includes(searchLower)
    );

    const matchesStatus = selectedStatus === 'all' || match.status?.toLowerCase() === selectedStatus.toLowerCase();
    const matchesTeam = selectedTeam === 'all' || match.homeTeamId === selectedTeam || match.awayTeamId === selectedTeam;

    return matchesSearch && matchesStatus && matchesTeam;
  }).sort((a, b) => {
    const dateA = new Date(a.dateTime || 0).getTime();
    const dateB = new Date(b.dateTime || 0).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'live': return 'destructive';
      case 'completed': return 'secondary';
      case 'scheduled': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and View Mode Toolbar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search matches, teams, venues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 border border-border rounded-lg p-1 self-end sm:self-auto">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 px-3"
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-3"
              title="List View"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8 px-3"
              title="Table View"
            >
              <Table className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="h-8 px-3"
              title="Calendar View"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center bg-muted/10 p-4 rounded-lg border border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Status:</span>
            <select 
              className="h-9 w-[150px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Team:</span>
            <select 
              className="h-9 w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              <option value="all">All Teams</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Sort:</span>
            <select 
              className="h-9 w-[150px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {(selectedStatus !== 'all' || selectedTeam !== 'all' || searchTerm) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSelectedStatus('all');
                setSelectedTeam('all');
                setSearchTerm('');
              }}
              className="ml-auto text-muted-foreground hover:text-foreground"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Found {filteredMatches.length} {filteredMatches.length === 1 ? 'match' : 'matches'}
        {(selectedStatus !== 'all' || selectedTeam !== 'all') && ' matching filters'}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <Card key={match.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <Badge variant={getStatusColor(match.status || 'scheduled')}>
                    {match.status || 'Scheduled'}
                  </Badge>
                  {match.dateTime && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(match.dateTime).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-center">
                    <div className="font-bold text-lg">{getTeamName(match.homeTeamId)}</div>
                    <div className="text-2xl font-bold text-primary my-2">vs</div>
                    <div className="font-bold text-lg">{getTeamName(match.awayTeamId)}</div>
                  </div>
                </div>

                {match.venue && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{match.venue}</span>
                  </div>
                )}

                <Link href={`/matches/${match.id}`}>
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredMatches.map((match) => (
            <Card key={match.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={getStatusColor(match.status || 'scheduled')}>
                        {match.status || 'Scheduled'}
                      </Badge>
                      {match.dateTime && (
                        <span className="text-sm text-muted-foreground">
                          {new Date(match.dateTime).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="font-semibold">
                      {getTeamName(match.homeTeamId)} vs {getTeamName(match.awayTeamId)}
                    </div>
                    {match.venue && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{match.venue}</span>
                      </div>
                    )}
                  </div>
                  <Link href={`/matches/${match.id}`}>
                    <Button size="sm">View</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Match</th>
                    <th className="text-left p-4 font-medium">Venue</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMatches.map((match) => (
                    <tr key={match.id} className="border-b hover:bg-muted/30">
                      <td className="p-4 text-muted-foreground">
                        {match.dateTime ? new Date(match.dateTime).toLocaleDateString() : 'TBA'}
                      </td>
                      <td className="p-4 font-medium">
                        {getTeamName(match.homeTeamId)} vs {getTeamName(match.awayTeamId)}
                      </td>
                      <td className="p-4 text-muted-foreground">{match.venue || '-'}</td>
                      <td className="p-4">
                        <Badge variant={getStatusColor(match.status || 'scheduled')}>
                          {match.status || 'Scheduled'}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/matches/${match.id}`}>
                          <Button size="sm">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
              <p className="text-muted-foreground mb-4">
                Match schedule calendar
              </p>
              <p className="text-sm text-muted-foreground">
                Calendar view coming soon - will show match fixtures
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredMatches.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No matches found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedStatus !== 'all' || selectedTeam !== 'all'
                ? 'Try adjusting your filters or search terms' 
                : 'No matches scheduled'}
            </p>
            {(searchTerm || selectedStatus !== 'all' || selectedTeam !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('all');
                  setSelectedTeam('all');
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
