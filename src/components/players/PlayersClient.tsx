"use client";

import { useState } from 'react';
import { useViewMode } from '@/hooks/useViewMode';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import { User, LayoutGrid, List, BarChart3, Search, Edit, Filter, ArrowUpDown, Activity } from "lucide-react";
import { Player as Person } from "@/lib/store";
import { PlayerCard } from "./PlayerCard";

interface PlayersClientProps {
  players: any[];
}

export function PlayersClient({ players }: PlayersClientProps) {
  const { viewMode, setViewMode } = useViewMode({ 
    storageKey: 'players-view-mode',
    defaultMode: 'grid'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Filter and sort players
  const filteredPlayers = players
    .filter(player => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        player.firstName.toLowerCase().includes(searchLower) ||
        player.lastName.toLowerCase().includes(searchLower) ||
        player.role?.toLowerCase().includes(searchLower);
      
      const matchesRole = roleFilter === 'all' || player.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || (player.status || 'active') === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.firstName.localeCompare(b.firstName);
        case 'runs':
          return (b.stats?.totalRuns || 0) - (a.stats?.totalRuns || 0);
        case 'wickets':
          return (b.stats?.wicketsTaken || 0) - (a.stats?.wicketsTaken || 0);
        case 'matches':
          return (b.stats?.matchesPlayed || 0) - (a.stats?.matchesPlayed || 0);
        default:
          return 0;
      }
    });

  const roles = Array.from(new Set(players.map(p => p.role).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Search and View Mode Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {/* Filters */}
          <div className="flex gap-2 flex-1 sm:flex-none">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map(role => (
                  <SelectItem key={role} value={role!}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="injured">Injured</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="runs">Runs</SelectItem>
              <SelectItem value="wickets">Wickets</SelectItem>
              <SelectItem value="matches">Matches</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex gap-1 border border-border rounded-lg p-1 bg-muted/20 self-start sm:self-auto">
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
              variant={viewMode === 'stats' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('stats')}
              className="h-8 px-3"
              title="Stats View"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Found {filteredPlayers.length} {filteredPlayers.length === 1 ? 'player' : 'players'}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPlayers.map((player) => (
            <PlayerCard 
              key={player.id} 
              player={player} 
              viewMode="grid" 
            />
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredPlayers.map((player) => (
            <PlayerCard 
              key={player.id} 
              player={player} 
              viewMode="list" 
            />
          ))}
        </div>
      )}

      {/* Stats Table View */}
      {viewMode === 'stats' && (
        <Card className="overflow-hidden border-t-4 border-t-primary">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Player</th>
                    <th className="text-left p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Role</th>
                    <th className="text-center p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Matches</th>
                    <th className="text-center p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Runs</th>
                    <th className="text-center p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Wickets</th>
                    <th className="text-center p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Avg</th>
                    <th className="text-center p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">SR</th>
                    <th className="text-center p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Status</th>
                    <th className="text-right p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map((p) => (
                    <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <Link href={`/players/${p.id}`} className="flex items-center gap-3 hover:text-primary group">
                          <div className="relative w-10 h-10 flex-shrink-0 rounded-full overflow-hidden border border-border/50">
                            <Image 
                              src={p.profileImageUrl || `https://ui-avatars.com/api/?name=${p.firstName}+${p.lastName}&background=22c55e&color=fff`} 
                              alt={`${p.firstName} ${p.lastName}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-semibold group-hover:text-primary transition-colors">{p.firstName} {p.lastName}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="p-4 text-muted-foreground">{p.role}</td>
                      <td className="p-4 text-center font-semibold">{p.stats?.matchesPlayed || 0}</td>
                      <td className="p-4 text-center font-semibold">{p.stats?.totalRuns || 0}</td>
                      <td className="p-4 text-center font-semibold">{p.stats?.wicketsTaken || 0}</td>
                      <td className="p-4 text-center">{p.stats?.battingAverage?.toFixed(2) || '-'}</td>
                      <td className="p-4 text-center">{p.stats?.strikeRate?.toFixed(2) || '-'}</td>
                      <td className="p-4 text-center">
                        {p.status && (
                          <Badge variant={p.status === 'active' ? 'default' : 'secondary'}>
                            {p.status}
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/players/${p.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <User className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/players/${p.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredPlayers.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No players found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Get started by adding your first player'}
            </p>
            {(!searchTerm && roleFilter === 'all' && statusFilter === 'all') && (
              <Link href="/players/add">
                <Button>
                  Add Player
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
