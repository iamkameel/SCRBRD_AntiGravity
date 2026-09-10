"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, orderBy, query as firestoreQuery } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2, AlertTriangle, CalendarDays, MapPin, Clock,
  ChevronRight, Activity, Trophy, Play, Search, Plus,
  Zap, Radio, LayoutGrid, List, TrendingUp
} from "lucide-react";
import { format, isValid } from 'date-fns';
import { fetchTeams, fetchDivisions } from '@/lib/firestore';
import { D } from '@/lib/design-system';
import { cn } from '@/lib/utils';

export interface MatchHubFixture {
  id: string;
  homeTeamName: string;
  awayTeamName: string;
  date: string;
  displayDate: string;
  time: string;
  location: string;
  status: string;
  matchType: string;
  division: string;
  ageGroup: string;
  result?: string;
  score?: { home?: string; away?: string };
}

const fetchHubMatches = async (): Promise<MatchHubFixture[]> => {
  const q = firestoreQuery(collection(db, 'matches'), orderBy('dateTime', 'desc'));
  const [querySnapshot, teams, divisions] = await Promise.all([getDocs(q), fetchTeams(), fetchDivisions()]);

  return querySnapshot.docs.reduce((acc, doc) => {
    const data = doc.data() as any;
    let dt: Date | null = null;
    if (data.dateTime) dt = typeof data.dateTime.toDate === 'function' ? data.dateTime.toDate() : new Date(data.dateTime);
    else if (data.matchDate) dt = typeof data.matchDate.toDate === 'function' ? data.matchDate.toDate() : new Date(data.matchDate);
    if (!dt || !isValid(dt)) return acc;

    const homeTeam = teams.find(t => t.id === data.homeTeamId);
    const awayTeam = teams.find(t => t.id === data.awayTeamId);
    let divName = data.division;
    if (!divName || divName === 'N/A') {
      const div = divisions.find(d => d.id === (data.divisionId || homeTeam?.divisionId));
      if (div) divName = div.name;
    }

    acc.push({
      id: doc.id,
      homeTeamName: data.homeTeamName || homeTeam?.name || data.homeTeamId,
      awayTeamName: data.awayTeamName || awayTeam?.name || data.awayTeamId,
      date: format(dt, 'yyyy-MM-dd'),
      displayDate: format(dt, 'MMM d, yyyy'),
      time: data.time || format(dt, 'HH:mm'),
      location: data.venue || 'TBC',
      status: data.status || 'Scheduled',
      matchType: data.matchType || 'T20',
      ageGroup: data.ageGroup || divName || 'Open',
      division: divName || 'N/A',
      result: data.result,
      score: { home: data.score?.home, away: data.score?.away },
    });
    return acc;
  }, [] as MatchHubFixture[]);
};

const getCategory = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'live' || s === 'play suspended' || s === 'rain-delay') return 'LIVE';
  if (s === 'completed' || s === 'match abandoned') return 'COMPLETED';
  return 'UPCOMING';
};

/* ─── Match Row Card ─── */
function MatchRow({ match }: { match: MatchHubFixture }) {
  const cat = getCategory(match.status);
  const isLive = cat === 'LIVE';
  const isComp = cat === 'COMPLETED';

  const statusConfig = {
    LIVE: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', label: 'LIVE' },
    COMPLETED: { color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.20)', label: 'RESULT' },
    UPCOMING: { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.20)', label: 'UPCOMING' },
  }[cat];

  return (
    <Link href={`/matches/${match.id}`} className="block group">
      <div className={cn(
        "relative rounded-[1.5rem] border overflow-hidden transition-all duration-300",
        "bg-white/[0.025] border-white/[0.07]",
        "hover:bg-white/[0.05] hover:border-white/20 hover:shadow-2xl hover:shadow-black/40",
        isLive && "border-red-500/20 bg-red-500/[0.02] hover:border-red-500/30"
      )}>
        {/* live accent top bar */}
        {isLive && (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />
        )}

        <div className="flex flex-col md:flex-row">
          {/* Left: date + status */}
          <div className="flex-shrink-0 md:w-[180px] p-5 md:border-r border-b md:border-b-0 border-white/[0.06] flex md:flex-col justify-between md:justify-center gap-4 md:gap-3">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25 mb-1">Date</div>
              <div className="text-sm font-black text-white/80">{match.displayDate}</div>
              <div className="flex items-center gap-1.5 mt-1 text-white/30">
                <Clock className="h-2.5 w-2.5" />
                <span className="text-[10px] font-medium">{match.time}</span>
              </div>
            </div>
            <div
              className={cn("self-start md:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest", isLive && "animate-pulse")}
              style={{ background: statusConfig.bg, color: statusConfig.color, borderColor: statusConfig.border }}
            >
              {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
              {statusConfig.label}
            </div>
          </div>

          {/* Center: teams + scores */}
          <div className="flex-1 px-6 py-5 flex flex-col justify-center gap-3">
            <div className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20 mb-1">
              {match.matchType} · {match.ageGroup}
            </div>
            <div className="space-y-2.5">
              {[
                { name: match.homeTeamName, score: match.score?.home, abbr: match.homeTeamName.substring(0, 3).toUpperCase() },
                { name: match.awayTeamName, score: match.score?.away, abbr: match.awayTeamName.substring(0, 3).toUpperCase() },
              ].map((team, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[9px] font-black text-white/50 flex-shrink-0">
                      {team.abbr}
                    </div>
                    <span className="text-sm font-black text-white/80 group-hover:text-white transition-colors">{team.name}</span>
                  </div>
                  {(isLive || isComp) && team.score && (
                    <span className="text-base font-black text-white font-mono tracking-tighter">{team.score}</span>
                  )}
                  {!team.score && !isLive && !isComp && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">TBD</span>
                  )}
                </div>
              ))}
            </div>
            {match.result && (
              <div className="mt-2 pt-2 border-t border-white/[0.05]">
                <div className="flex items-center gap-1.5">
                  <Trophy className="h-3 w-3 text-[#22c55e]" />
                  <span className="text-[11px] font-bold text-[#22c55e]/80">{match.result}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: meta + CTA */}
          <div className="flex-shrink-0 md:w-[180px] px-5 py-5 md:border-l border-t md:border-t-0 border-white/[0.06] bg-white/[0.015] flex flex-row md:flex-col justify-between items-center md:items-start gap-3">
            <div className="space-y-2">
              {match.location && match.location !== 'TBC' && (
                <div className="flex items-start gap-1.5 text-white/30">
                  <MapPin className="h-2.5 w-2.5 mt-0.5 flex-shrink-0" />
                  <span className="text-[10px] font-medium leading-tight line-clamp-2">{match.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-white/25">
                <Zap className="h-2.5 w-2.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">{match.division !== 'N/A' ? match.division : match.ageGroup}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isLive && (
                <Link href={`/matches/${match.id}/score`} onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/30 transition-colors">
                    <Radio className="h-3 w-3" />
                    Score
                  </div>
                </Link>
              )}
              <div className="w-8 h-8 rounded-xl border border-white/[0.08] bg-white/[0.04] flex items-center justify-center group-hover:bg-white/[0.1] group-hover:border-white/20 transition-all">
                <ChevronRight className="h-4 w-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Stat Chip ─── */
function StatChip({ value, label, color, icon: Icon, active, onClick }: {
  value: number; label: string; color: string; icon: React.ElementType; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-5 py-3.5 rounded-2xl border transition-all duration-300 group text-left",
        active ? "border-white/25 bg-white/[0.06]" : "border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.04] hover:border-white/15"
      )}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all"
        style={{ background: `${color}14`, borderColor: `${color}30` }}
      >
        <Icon className="h-4.5 w-4.5" style={{ color }} />
      </div>
      <div>
        <div className="text-2xl font-black tracking-tighter leading-none text-white" style={{ fontFamily: 'var(--font-syne)' }}>{value}</div>
        <div className="text-[9px] font-black uppercase tracking-widest mt-0.5" style={{ color: `${color}99` }}>{label}</div>
      </div>
    </button>
  );
}

export default function MatchCenterHub() {
  const { data: matches, isLoading, isError } = useQuery<MatchHubFixture[], Error>({
    queryKey: ['hub_matches'],
    queryFn: fetchHubMatches,
  });

  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
  const [search, setSearch] = useState('');

  const stats = useMemo(() => {
    if (!matches) return { live: 0, upcoming: 0, completed: 0 };
    return matches.reduce((acc, m) => {
      const c = getCategory(m.status);
      if (c === 'LIVE') acc.live++;
      else if (c === 'UPCOMING') acc.upcoming++;
      else if (c === 'COMPLETED') acc.completed++;
      return acc;
    }, { live: 0, upcoming: 0, completed: 0 });
  }, [matches]);

  const filtered = useMemo(() => {
    if (!matches) return [];
    return matches.filter(m => {
      const catMatch = filter === 'all' || getCategory(m.status).toLowerCase() === filter;
      const searchMatch = !search || [m.homeTeamName, m.awayTeamName, m.location, m.matchType].join(' ').toLowerCase().includes(search.toLowerCase());
      return catMatch && searchMatch;
    });
  }, [matches, filter, search]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-[#22c55e]" />
        </div>
        <div className="absolute inset-0 rounded-full border border-[#22c55e]/20 animate-ping" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/25">Loading Match Center</p>
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <AlertTriangle className="h-10 w-10 text-rose-500" />
      <p className="text-sm font-bold text-white/50">Failed to load matches.</p>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 space-y-8">
      {/* ─── Page Header ─── */}
      <div className="relative rounded-[2rem] border border-white/[0.07] bg-white/[0.02] overflow-hidden p-8 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_100%_at_50%_-20%,rgba(34,197,94,0.06),transparent)]" />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
                <Activity className="h-3.5 w-3.5 text-[#22c55e]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Match Centre</span>
              </div>
              {stats.live > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-red-400">{stats.live} Live Now</span>
                </div>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-[-0.03em] text-white leading-none mb-3" style={{ fontFamily: 'var(--font-syne)' }}>
              Match <span className="text-[#22c55e]">Centre</span>
            </h1>
            <p className="text-sm text-white/40 font-medium max-w-lg">Live scores, upcoming fixtures, and a complete archive of completed match results — all in one place.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/matches/add">
              <Button className="h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] hover:bg-[#22c55e]/20 transition-all">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New Match
              </Button>
            </Link>
            <Link href="/live-scoring">
              <Button className="h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                <Radio className="h-3.5 w-3.5 mr-1.5" />
                Live Scorer
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Stats Chips / Filter ─── */}
      <div className="flex flex-wrap gap-3">
        <StatChip value={matches?.length || 0} label="Total Matches" color="#60a5fa" icon={TrendingUp} active={filter === 'all'} onClick={() => setFilter('all')} />
        <StatChip value={stats.live} label="Live Now" color="#ef4444" icon={Activity} active={filter === 'live'} onClick={() => setFilter('live')} />
        <StatChip value={stats.upcoming} label="Upcoming" color="#60a5fa" icon={CalendarDays} active={filter === 'upcoming'} onClick={() => setFilter('upcoming')} />
        <StatChip value={stats.completed} label="Completed" color="#22c55e" icon={Trophy} active={filter === 'completed'} onClick={() => setFilter('completed')} />
      </div>

      {/* ─── Search + Tabs ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Tabs value={filter} onValueChange={(v: any) => setFilter(v)}>
          <TabsList className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1 h-auto gap-0.5">
            {[
              { value: 'all', label: 'All Matches' },
              { value: 'live', label: '🔴 Live' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'completed', label: 'Completed' },
            ].map(t => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-white/40 hover:text-white/70 transition-all"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25" />
          <Input
            placeholder="Search teams, venues…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-10 w-56 rounded-xl bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 text-sm focus-visible:border-white/20 focus-visible:ring-0"
          />
        </div>
      </div>

      {/* ─── Results Summary ─── */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/25">
          {filtered.length} {filtered.length === 1 ? 'Match' : 'Matches'} {filter !== 'all' ? `· ${filter}` : ''}
        </span>
        {search && (
          <button onClick={() => setSearch('')} className="text-[9px] font-black uppercase tracking-widest text-red-400/60 hover:text-red-400 transition-colors">
            Clear Search
          </button>
        )}
      </div>

      {/* ─── Match List ─── */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(match => <MatchRow key={match.id} match={match} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 rounded-[2rem] border border-dashed border-white/[0.07]">
          <Trophy className="h-10 w-10 text-white/10 mb-4" />
          <p className="text-sm font-bold text-white/30 uppercase tracking-widest">No matches found</p>
          <p className="text-xs text-white/20 mt-1">{search ? 'Try a different search term' : 'No matches for this filter'}</p>
          {search && (
            <button onClick={() => setSearch('')} className="mt-4 text-[10px] font-black uppercase tracking-widest text-[#22c55e]/60 hover:text-[#22c55e] transition-colors">
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
}
