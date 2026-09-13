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
  Zap, Radio, LayoutGrid, List, TrendingUp, Filter,
  Shield, BarChart3, ChevronDown, ChevronUp, Sparkles, X, Sun
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
  overs?: { home?: string; away?: string };
  toss?: string;
  recentBalls?: string[];
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
      homeTeamName: data.homeTeamName || homeTeam?.name || data.homeTeamId || 'Home Team',
      awayTeamName: data.awayTeamName || awayTeam?.name || data.awayTeamId || 'Away Team',
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
      overs: { home: data.overs?.home || '0.0', away: data.overs?.away || '0.0' },
      toss: data.tossWinnerId ? `${data.tossWinnerId} elected to ${data.tossDecision || 'bat'}` : undefined,
      recentBalls: data.recentBalls || ['1', '4', '0', 'W', '6', '1'],
    });
    return acc;
  }, [] as MatchHubFixture[]);
};

const getCategory = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'live' || s === 'in_progress' || s === 'play suspended' || s === 'rain-delay') return 'LIVE';
  if (s === 'completed' || s === 'match abandoned') return 'COMPLETED';
  return 'UPCOMING';
};

/* ─── Featured Live Match Theatre Banner ─── */
function FeaturedLiveBanner({ match }: { match: MatchHubFixture }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative rounded-[2.5rem] border border-red-500/30 bg-gradient-to-br from-red-950/40 via-black/80 to-slate-950/80 overflow-hidden p-6 md:p-8 shadow-sm shadow-red-950/20 backdrop-blur-xl group transition-all duration-300">
      {/* Stadium ambient light effect */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-red-500/15 transition-all" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />

      <div className="relative space-y-6">
        {/* Top meta bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-semibold tracking-normal animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              Featured Match · Live Scorer Active
            </div>
            <span className="text-xs font-semibold tracking-normal text-muted-foreground">
              {match.matchType} · {match.division !== 'N/A' ? match.division : match.ageGroup}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <MapPin className="h-3 w-3 text-red-700 dark:text-red-300" />
            <span>{match.location}</span>
          </div>
        </div>

        {/* Live Score Clash */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Home Team */}
          <div className="md:col-span-5 flex items-center justify-between md:justify-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-800 dark:text-amber-300 font-black text-lg flex-shrink-0 shadow-lg shadow-amber-500/5">
              {match.homeTeamName.substring(0, 3).toUpperCase()}
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-normal text-amber-800 dark:text-amber-300">Home Squad</div>
              <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight" style={{ fontFamily: D.head }}>
                {match.homeTeamName}
              </h2>
              <div className="text-2xl md:text-3xl font-black text-foreground font-mono mt-1 tracking-tight">
                {match.score?.home || '0/0'} <span className="text-sm text-muted-foreground font-sans">({match.overs?.home || '0.0'} ov)</span>
              </div>
            </div>
          </div>

          {/* VS Divider */}
          <div className="md:col-span-2 flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-2xl bg-secondary/60 border border-border flex items-center justify-center text-xs font-black text-muted-foreground uppercase tracking-widest">
              VS
            </div>
          </div>

          {/* Away Team */}
          <div className="md:col-span-5 flex items-center justify-between md:justify-end gap-4 text-right">
            <div>
              <div className="text-[11px] font-semibold tracking-normal text-blue-700 dark:text-blue-300">Away Squad</div>
              <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight" style={{ fontFamily: D.head }}>
                {match.awayTeamName}
              </h2>
              <div className="text-2xl md:text-3xl font-black text-foreground font-mono mt-1 tracking-tight">
                {match.score?.away || '0/0'} <span className="text-sm text-muted-foreground font-sans">({match.overs?.away || '0.0'} ov)</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-700 dark:text-blue-300 font-black text-lg flex-shrink-0 shadow-lg shadow-blue-500/5">
              {match.awayTeamName.substring(0, 3).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Recent Balls Strip & CTAs */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-normal text-muted-foreground mr-1">Recent Over:</span>
            {match.recentBalls?.map((ball, i) => (
              <span
                key={i}
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black font-mono border",
                  ball === 'W' ? "bg-red-500 text-foreground border-red-400" :
                  ball === '6' ? "bg-amber-500 text-black border-amber-400" :
                  ball === '4' ? "bg-blue-500 text-foreground border-blue-400" :
                  "bg-secondary/60 text-muted-foreground border-border"
                )}
              >
                {ball}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex-1 sm:flex-none h-10 px-4 rounded-xl border border-border bg-secondary/60 text-muted-foreground hover:text-white hover:bg-secondary/60 text-xs font-semibold tracking-normal flex items-center justify-center gap-2 transition-all"
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {expanded ? 'Less Details' : 'Quick Stats'}
            </button>
            <Link href={`/matches/${match.id}/score`} className="flex-1 sm:flex-none">
              <Button className="w-full h-10 px-6 rounded-xl text-xs font-semibold tracking-normal bg-red-500 hover:bg-red-600 text-foreground shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 transition-all">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                Live Match Centre
              </Button>
            </Link>
          </div>
        </div>

        {/* Collapsible Quick Stats Drawer */}
        {expanded && (
          <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-4 rounded-2xl bg-secondary/60 border border-border">
              <div className="text-[11px] font-semibold tracking-normal text-muted-foreground mb-1">Toss Result</div>
              <div className="text-xs font-bold text-muted-foreground">{match.toss || 'Toss result pending'}</div>
            </div>
            <div className="p-4 rounded-2xl bg-secondary/60 border border-border">
              <div className="text-[11px] font-semibold tracking-normal text-muted-foreground mb-1">Venue Pitch Condition</div>
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <Sun className="h-3.5 w-3.5" /> Hard & Dry · High Bounce
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-secondary/60 border border-border">
              <div className="text-[11px] font-semibold tracking-normal text-muted-foreground mb-1">Match Ops Links</div>
              <div className="flex gap-2">
                <Link href={`/matches/${match.id}/pre-match`} className="text-[11px] font-semibold tracking-normal text-blue-700 dark:text-blue-300 hover:underline">Pre-Match</Link>
                <span className="text-muted-foreground">•</span>
                <Link href={`/matches/${match.id}/manage`} className="text-[11px] font-semibold tracking-normal text-purple-400 hover:underline">Roster</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Match Grid Card Component ─── */
function MatchGridCard({ match }: { match: MatchHubFixture }) {
  const cat = getCategory(match.status);
  const isLive = cat === 'LIVE';
  const isComp = cat === 'COMPLETED';
  const [quickPeek, setQuickPeek] = useState(false);

  const statusConfig = {
    LIVE: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.30)', label: 'LIVE' },
    COMPLETED: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', label: 'RESULT' },
    UPCOMING: { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.25)', label: 'UPCOMING' },
  }[cat];

  return (
    <div className={cn(
      "group relative rounded-[2rem] border overflow-hidden transition-all duration-300 flex flex-col justify-between",
      "bg-secondary/60 border-border",
      "hover:bg-secondary/60 hover:border-border hover:shadow-sm hover:shadow-black/50 hover:-translate-y-1",
      isLive && "border-red-500/30 bg-red-500/[0.02] hover:border-red-500/40"
    )}>
      {isLive && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />
      )}

      {/* Top Card Section */}
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg bg-secondary/60 border border-border text-muted-foreground">
              {match.matchType}
            </span>
            <span className="text-[11px] font-semibold tracking-normal text-muted-foreground truncate max-w-[120px]">
              {match.division !== 'N/A' ? match.division : match.ageGroup}
            </span>
          </div>

          <div
            className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold tracking-normal", isLive && "animate-pulse")}
            style={{ background: statusConfig.bg, color: D.textPrimary, borderColor: statusConfig.border }}
          >
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
            {statusConfig.label}
          </div>
        </div>

        {/* Teams & Scores */}
        <div className="space-y-4 pt-1">
          {/* Home Team */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 font-black text-xs flex items-center justify-center flex-shrink-0">
                {match.homeTeamName.substring(0, 3).toUpperCase()}
              </div>
              <span className="text-base font-black text-muted-foreground group-hover:text-white transition-colors truncate" style={{ fontFamily: D.head }}>
                {match.homeTeamName}
              </span>
            </div>
            {(isLive || isComp) && (
              <div className="text-right flex-shrink-0">
                <span className="text-base font-black text-foreground font-mono">{match.score?.home || '0/0'}</span>
                {match.overs?.home && <div className="text-[11px] text-muted-foreground font-medium">({match.overs.home} ov)</div>}
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center flex-shrink-0">
                {match.awayTeamName.substring(0, 3).toUpperCase()}
              </div>
              <span className="text-base font-black text-muted-foreground group-hover:text-white transition-colors truncate" style={{ fontFamily: D.head }}>
                {match.awayTeamName}
              </span>
            </div>
            {(isLive || isComp) && (
              <div className="text-right flex-shrink-0">
                <span className="text-base font-black text-foreground font-mono">{match.score?.away || '0/0'}</span>
                {match.overs?.away && <div className="text-[11px] text-muted-foreground font-medium">({match.overs.away} ov)</div>}
              </div>
            )}
          </div>
        </div>

        {/* Result banner if completed */}
        {match.result && (
          <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <Trophy className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300 flex-shrink-0" />
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 truncate">{match.result}</span>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-6 py-4 border-t border-border bg-secondary/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium truncate">
          <CalendarDays className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span>{match.displayDate}</span>
          <span>·</span>
          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="truncate max-w-[100px]">{match.location}</span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setQuickPeek(!quickPeek)}
            className="p-2 rounded-xl border border-border bg-secondary/60 text-muted-foreground hover:text-white hover:bg-secondary/60 transition-all"
            title="Quick Details"
          >
            <BarChart3 className="h-3.5 w-3.5" />
          </button>
          <Link href={`/matches/${match.id}`}>
            <Button size="sm" className="h-8 px-3 rounded-xl text-[11px] font-semibold tracking-normal bg-secondary/60 hover:bg-secondary/60 text-foreground border border-border transition-all flex items-center gap-1">
              Hub <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Peek Overlay */}
      {quickPeek && (
        <div className="p-4 border-t border-border bg-card backdrop-blur-md space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[11px] font-semibold tracking-normal text-muted-foreground">
            <span>Quick Match Dossier</span>
            <button onClick={() => setQuickPeek(false)} className="text-muted-foreground hover:text-white"><X className="h-3 w-3" /></button>
          </div>
          <div className="text-xs text-muted-foreground font-medium space-y-1">
            <div><span className="text-muted-foreground">Scheduled Time:</span> {match.time}</div>
            <div><span className="text-muted-foreground">Venue:</span> {match.location}</div>
            <div><span className="text-muted-foreground">Status:</span> {match.status}</div>
          </div>
          <div className="flex gap-2 pt-1">
            <Link href={`/matches/${match.id}/pre-match`} className="flex-1">
              <Button size="sm" variant="ghost" className="w-full h-7 text-[11px] font-semibold tracking-normal text-blue-700 dark:text-blue-300 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20">
                Pre-Match Setup
              </Button>
            </Link>
            <Link href={`/matches/${match.id}/score`} className="flex-1">
              <Button size="sm" className="w-full h-7 text-[11px] font-semibold tracking-normal bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30">
                Live Scorer
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Stat Chip Filter Button ─── */
function StatChip({ value, label, color, icon: Icon, active, onClick }: {
  value: number; label: string; color: string; icon: React.ElementType; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-5 py-3.5 rounded-2xl border transition-all duration-300 text-left flex-1 min-w-[140px]",
        active ? "border-border bg-secondary/60 shadow-sm" : "border-border bg-secondary/60 hover:bg-secondary/60 hover:border-border"
      )}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all"
        style={{ background: `${color}18`, borderColor: `${color}40` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div>
        <div className="text-2xl font-black tracking-tighter leading-none text-foreground" style={{ fontFamily: D.head }}>{value}</div>
        <div className="text-[11px] font-semibold tracking-normal mt-1" style={{ color: D.textSecondary }}>{label}</div>
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
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const featuredLiveMatch = useMemo(() => {
    if (!matches) return null;
    return matches.find(m => getCategory(m.status) === 'LIVE') || null;
  }, [matches]);

  const filtered = useMemo(() => {
    if (!matches) return [];
    return matches.filter(m => {
      const catMatch = filter === 'all' || getCategory(m.status).toLowerCase() === filter;
      const fmtMatch = formatFilter === 'all' || m.matchType.toLowerCase() === formatFilter.toLowerCase();
      const searchMatch = !search || [m.homeTeamName, m.awayTeamName, m.location, m.matchType, m.division].join(' ').toLowerCase().includes(search.toLowerCase());
      return catMatch && fmtMatch && searchMatch;
    });
  }, [matches, filter, formatFilter, search]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-[#22c55e]" />
        </div>
        <div className="absolute inset-0 rounded-full border border-[#22c55e]/20 animate-ping pointer-events-none" />
      </div>
      <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Initializing Match Centre Engine</p>
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <AlertTriangle className="h-10 w-10 text-rose-500" />
      <p className="text-sm font-bold text-muted-foreground">Failed to sync match records from database.</p>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 space-y-8" style={{ background: D.base }}>
      
      {/* ─── Page Hero Banner ─── */}
      <div className="relative rounded-[2.5rem] border border-border bg-secondary/60 overflow-hidden p-8 md:p-10 backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_100%_at_50%_-20%,rgba(34,197,94,0.08),transparent)] pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/60 border border-border">
                <Activity className="h-3.5 w-3.5 text-[#22c55e]" />
                <span className="text-[11px] font-semibold tracking-normal text-muted-foreground">School Cricket Operating System</span>
              </div>
              {stats.live > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-[11px] font-semibold tracking-normal text-red-700 dark:text-red-300">{stats.live} Fixture{stats.live > 1 ? 's' : ''} Live</span>
                </div>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-[-0.03em] text-foreground leading-none mb-3" style={{ fontFamily: D.head }}>
              Match <span className="text-[#22c55e]">Centre</span>
            </h1>
            <p className="text-sm text-muted-foreground font-medium max-w-xl leading-relaxed">
              Live ball-by-ball scoring, match operations, squad readiness, and complete historical competition archives.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/matches/add">
              <Button className="h-11 px-6 rounded-2xl text-xs font-semibold tracking-normal bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e] hover:bg-[#22c55e]/25 shadow-lg shadow-[#22c55e]/10 transition-all flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Schedule Match
              </Button>
            </Link>
            <Link href="/live-scoring">
              <Button className="h-11 px-6 rounded-2xl text-xs font-semibold tracking-normal bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-300 hover:bg-red-500/25 shadow-lg shadow-red-500/10 transition-all flex items-center gap-2">
                <Radio className="h-4 w-4 animate-pulse" />
                Live Scorer Console
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Featured Live Match Theatre ─── */}
      {featuredLiveMatch && <FeaturedLiveBanner match={featuredLiveMatch} />}

      {/* ─── Stats Filter Chips Bar ─── */}
      <div className="flex flex-wrap gap-4">
        <StatChip value={matches?.length || 0} label="All Fixtures" color="#60a5fa" icon={TrendingUp} active={filter === 'all'} onClick={() => setFilter('all')} />
        <StatChip value={stats.live} label="Live Now" color="#ef4444" icon={Activity} active={filter === 'live'} onClick={() => setFilter('live')} />
        <StatChip value={stats.upcoming} label="Upcoming" color="#38bdf8" icon={CalendarDays} active={filter === 'upcoming'} onClick={() => setFilter('upcoming')} />
        <StatChip value={stats.completed} label="Results Archive" color="#22c55e" icon={Trophy} active={filter === 'completed'} onClick={() => setFilter('completed')} />
      </div>

      {/* ─── Search, Format Filter & Layout Switcher ─── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-secondary/60">
        
        {/* Status Tabs */}
        <div role="group" aria-label="Filter matches by status" className="w-full md:w-auto">
          <div className="flex bg-secondary/60 border border-border rounded-xl p-1 h-auto gap-1 w-full md:w-auto justify-start">
            {[
              { value: 'all', label: 'All' },
              { value: 'live', label: 'Live' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'completed', label: 'Completed' },
            ].map(t => (
              <button
                key={t.value}
                type="button" aria-pressed={filter === t.value} onClick={() => setFilter(t.value as typeof filter)}
                className="rounded-lg px-4 py-2 text-xs font-semibold tracking-normal aria-pressed:bg-primary aria-pressed:text-primary-foreground text-muted-foreground hover:text-muted-foreground transition-all"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search + Format + Layout Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Format selector */}
          <div className="relative">
            <select
              aria-label="Match format"
              value={formatFilter}
              onChange={e => setFormatFilter(e.target.value)}
              className="h-10 px-3.5 pr-8 rounded-xl bg-secondary/60 border border-border text-foreground text-xs font-semibold tracking-normal appearance-none focus:outline-none focus:border-border"
            >
              <option value="all" className="bg-card text-foreground">All Formats</option>
              <option value="t20" className="bg-card text-foreground">T20 Match</option>
              <option value="50 over" className="bg-card text-foreground">50 Over</option>
              <option value="multi-day" className="bg-card text-foreground">Multi-Day</option>
              <option value="declaration" className="bg-card text-foreground">Declaration</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Search bar */}
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              aria-label="Search matches"
              placeholder="Search team, venue, format…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-8 h-10 rounded-xl bg-secondary/60 border-border text-foreground placeholder:text-muted-foreground text-xs focus-visible:border-border focus-visible:ring-0"
            />
            {search && (
              <button aria-label="Clear match search" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* View toggle (Grid / List) */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/60 border border-border">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'grid' ? "bg-secondary/60 text-foreground shadow-sm" : "text-muted-foreground hover:text-muted-foreground"
              )}
              title="Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'list' ? "bg-secondary/60 text-foreground shadow-sm" : "text-muted-foreground hover:text-muted-foreground"
              )}
              title="List View"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Match Count & Active Filter Indicator ─── */}
      <div className="flex items-center justify-between text-xs font-semibold tracking-normal text-muted-foreground">
        <span>
          Showing {filtered.length} {filtered.length === 1 ? 'Fixture' : 'Fixtures'}
          {filter !== 'all' ? ` · Status: ${filter}` : ''}
          {formatFilter !== 'all' ? ` · Format: ${formatFilter}` : ''}
        </span>
        {(filter !== 'all' || formatFilter !== 'all' || search) && (
          <button
            onClick={() => { setFilter('all'); setFormatFilter('all'); setSearch(''); }}
            className="text-red-700 dark:text-red-300 hover:text-red-400 transition-colors"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* ─── Fixtures Display (Grid vs List) ─── */}
      {filtered.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(match => <MatchGridCard key={match.id} match={match} />)}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(match => (
              <Link key={match.id} href={`/matches/${match.id}`} className="block group">
                <div className="p-5 rounded-2xl border border-border bg-secondary/60 hover:bg-secondary/60 hover:border-border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary/60 border border-border flex items-center justify-center font-black text-xs text-muted-foreground">
                      {match.homeTeamName.substring(0, 2)}
                    </div>
                    <div>
                      <div className="text-base font-black text-foreground group-hover:text-emerald-400 transition-colors" style={{ fontFamily: D.head }}>
                        {match.homeTeamName} vs {match.awayTeamName}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {match.displayDate} at {match.time} · {match.location}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-auto">
                    <span className="text-[11px] font-semibold tracking-normal px-2.5 py-1 rounded-lg bg-secondary/60 text-muted-foreground">
                      {match.matchType}
                    </span>
                    <span className="text-xs font-bold font-mono text-muted-foreground">
                      {match.score?.home || '0/0'} - {match.score?.away || '0/0'}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-white transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-24 rounded-[2.5rem] border border-dashed border-border bg-secondary/60">
          <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">No matching fixtures found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search keywords</p>
          <Button
            onClick={() => { setFilter('all'); setFormatFilter('all'); setSearch(''); }}
            size="sm"
            className="mt-5 text-[11px] font-semibold tracking-normal bg-secondary/60 border border-border text-muted-foreground hover:text-white"
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
