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
import { D } from "@/lib/design-system";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchPersonByEmail } from '@/app/actions/personActions';
import { Sparkles, ArrowRight } from 'lucide-react';

interface PlayersClientProps {
  players: any[];
}

export function PlayersClient({ players }: PlayersClientProps) {
  const { user } = useAuth();
  const [currentUserPerson, setCurrentUserPerson] = useState<any | null>(null);

  useEffect(() => {
    async function checkCurrentPlayer() {
      if (!user?.email) return;
      try {
        const p = await fetchPersonByEmail(user.email);
        if (p) setCurrentUserPerson(p);
      } catch (e) {
        console.error("Error auto-resolving logged in player", e);
      }
    }
    checkCurrentPlayer();
  }, [user]);

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
      {/* Auto-Resolved Player Passport Banner */}
      {currentUserPerson && (
        <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500 text-white shrink-0 shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-300" style={{ fontFamily: D.mono }}>
                Auto-Resolved Player Passport
              </div>
              <div className="text-sm font-bold text-white">
                Logged in as <strong className="text-indigo-400">{currentUserPerson.firstName} {currentUserPerson.lastName}</strong> ({currentUserPerson.schoolName || 'SCRBRD OS'})
              </div>
            </div>
          </div>
          <Link href={`/players/${currentUserPerson.id}`}>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shrink-0">
              View Your Digital Passport <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      )}

      {/* Search and View Mode Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: D.textMuted }} />
          <Input
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            style={{ background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary }}
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
          <div
            className="flex gap-1 p-1 self-start sm:self-auto"
            style={{ background: D.surf2, border: `1px solid ${D.border}`, borderRadius: D.lg }}
          >
            {([['grid', LayoutGrid], ['list', List], ['stats', BarChart3]] as const).map(([mode, Icon]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="h-8 px-3 rounded-md transition-all"
                style={{
                  background: viewMode === mode ? D.surf3 : 'transparent',
                  color: viewMode === mode ? D.textPrimary : D.textMuted,
                  border: viewMode === mode ? `1px solid ${D.border}` : '1px solid transparent',
                }}
                title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} View`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div style={{ fontFamily: D.body, fontSize: 12, color: D.textMuted, letterSpacing: '0.04em' }}>
        {filteredPlayers.length === 1
          ? `1 player found`
          : `${filteredPlayers.length} players found`}
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
        <div
          className="overflow-hidden"
          style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.xl, borderTop: `3px solid ${D.emerald}` }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: D.surf2, borderBottom: `1px solid ${D.border}` }}>
                <tr>
                  {['Player','Role','M','Runs','Wkts','Avg','SR','Status',''].map((h, i) => (
                    <th
                      key={i}
                      className={`p-4 ${i === 0 || i === 1 ? 'text-left' : i === 8 ? 'text-right' : 'text-center'}`}
                      style={{ fontFamily: D.head, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: D.textMuted }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((p) => (
                  <tr
                    key={p.id}
                    className="transition-colors"
                    style={{ borderBottom: `1px solid ${D.border}` }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = D.surf2)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="p-4">
                      <Link href={`/players/${p.id}`} className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 flex-shrink-0 rounded-full overflow-hidden" style={{ border: `1px solid ${D.border}` }}>
                          <Image
                            src={p.profileImageUrl || `https://ui-avatars.com/api/?name=${p.firstName}+${p.lastName}&background=10b981&color=fff`}
                            alt={`${p.firstName} ${p.lastName}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div
                          style={{ fontFamily: D.head, fontSize: 14, fontWeight: 600, color: D.textPrimary }}
                          className="group-hover:text-emerald-400 transition-colors"
                        >
                          {p.firstName} {p.lastName}
                        </div>
                      </Link>
                    </td>
                    <td className="p-4" style={{ fontFamily: D.body, fontSize: 13, color: D.textSecondary }}>{p.role}</td>
                    <td className="p-4 text-center" style={{ fontFamily: D.mono, fontSize: 14, fontWeight: 600, color: D.textPrimary }}>{p.stats?.matchesPlayed || 0}</td>
                    <td className="p-4 text-center" style={{ fontFamily: D.mono, fontSize: 14, fontWeight: 700, color: D.sky }}>{p.stats?.totalRuns || 0}</td>
                    <td className="p-4 text-center" style={{ fontFamily: D.mono, fontSize: 14, fontWeight: 700, color: D.rose }}>{p.stats?.wicketsTaken || 0}</td>
                    <td className="p-4 text-center" style={{ fontFamily: D.mono, fontSize: 13, color: D.textSecondary }}>{p.stats?.battingAverage?.toFixed(2) || '—'}</td>
                    <td className="p-4 text-center" style={{ fontFamily: D.mono, fontSize: 13, color: D.textSecondary }}>{p.stats?.strikeRate?.toFixed(2) || '—'}</td>
                    <td className="p-4 text-center">
                      {p.status && (
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
                          style={{
                            fontFamily: D.head,
                            background: p.status === 'active' ? `${D.emerald}18` : p.status === 'injured' ? `${D.rose}18` : `${D.amber}18`,
                            color: p.status === 'active' ? D.emerald : p.status === 'injured' ? D.rose : D.amber,
                            border: `1px solid ${p.status === 'active' ? D.emerald : p.status === 'injured' ? D.rose : D.amber}30`,
                          }}
                        >
                          {p.status}
                        </span>
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
        </div>
      )}

      {/* Empty State */}
      {filteredPlayers.length === 0 && (
        <div
          className="p-12 text-center"
          style={{ background: D.surf1, border: `2px dashed ${D.border}`, borderRadius: D.xl }}
        >
          <div
            className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full"
            style={{ background: D.surf2 }}
          >
            <User className="h-8 w-8" style={{ color: D.textMuted }} />
          </div>
          <h3 style={{ fontFamily: D.head, fontWeight: 700, fontSize: 16, color: D.textPrimary, marginBottom: 8 }}>No players found</h3>
          <p style={{ fontFamily: D.body, fontSize: 14, color: D.textSecondary, marginBottom: 24 }}>
            {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first player'}
          </p>
          {(!searchTerm && roleFilter === 'all' && statusFilter === 'all') && (
            <Link href="/players/add">
              <button
                className="press-btn inline-flex items-center gap-2 px-5 py-2.5 font-bold text-white"
                style={{ background: D.gradMain, fontFamily: D.head, fontSize: 12, borderRadius: D.pill }}
              >
                Add Player
              </button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
