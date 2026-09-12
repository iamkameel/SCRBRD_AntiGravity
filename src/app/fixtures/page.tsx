"use client";

import * as React from 'react';
import Link from 'next/link';
import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, orderBy, query as firestoreQuery, doc, deleteDoc, limit, startAfter, type QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  CalendarDays, Clock, MapPin, Loader2, Users, Shield, Info, LayoutGrid, List as ListIcon,
  MoreHorizontal, Edit3, Trash2, Bus, PlayCircle, Trophy, Globe, Filter, ChevronRight, Plus, Search, X, SlidersHorizontal, AlertCircle, CheckCircle2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { D } from "@/lib/design-system";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { format, isFuture, subDays, isWithinInterval, parseISO, isValid, isToday, isTomorrow } from 'date-fns';
import { cn } from "@/lib/utils";
import { fetchTeams, fetchDivisions, fetchUmpires, fetchScorers } from '@/lib/firestore';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { FixtureCalendar } from '@/components/fixtures/FixtureCalendar';
import { motion, AnimatePresence } from "framer-motion";

export interface DisplayFixture {
  id: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  date: string; 
  displayDate: string; 
  time: string;
  location: string;
  status: string;
  matchType: string;
  ageGroup?: string;
  division?: string | null;
  umpiresDisplay?: string;
  scorerName?: string | null;
  homeScore?: string;
  awayScore?: string;
  readiness: {
    squadReady: boolean;
    transportReady: boolean;
    pitchReady: boolean;
  };
}

const DEFAULT_SAMPLE_FIXTURES: DisplayFixture[] = [
  {
    id: 'sample-1',
    homeTeamId: 't1',
    homeTeamName: 'Hilton College 1st XI',
    awayTeamId: 't2',
    awayTeamName: 'Michaelhouse 1st XI',
    date: format(new Date(), 'yyyy-MM-dd'),
    displayDate: format(new Date(), 'EEE, MMM d, yyyy'),
    time: '09:30',
    location: 'Gilfillan Field (Hilton)',
    status: 'Live',
    matchType: '50-over',
    ageGroup: 'Open 1st XI',
    division: 'Super 8 Division',
    umpiresDisplay: 'K. Naidoo, R. Botha',
    scorerName: 'M. Taylor',
    homeScore: '245/6 (48.2 ov)',
    awayScore: '180/10 (44.1 ov)',
    readiness: { squadReady: true, transportReady: true, pitchReady: true }
  },
  {
    id: 'sample-2',
    homeTeamId: 't3',
    homeTeamName: 'Maritzburg College 1st XI',
    awayTeamId: 't4',
    awayTeamName: 'St Charles College 1st XI',
    date: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
    displayDate: format(new Date(Date.now() + 86400000), 'EEE, MMM d, yyyy'),
    time: '10:00',
    location: 'Goldstones Oval',
    status: 'Scheduled',
    matchType: 'T20',
    ageGroup: 'Open 1st XI',
    division: 'Super 8 Division',
    umpiresDisplay: 'D. Smith, J. Pretorius',
    scorerName: 'A. Ndlovu',
    readiness: { squadReady: true, transportReady: true, pitchReady: false }
  },
  {
    id: 'sample-3',
    homeTeamId: 't5',
    homeTeamName: 'Kearsney College 1st XI',
    awayTeamId: 't6',
    awayTeamName: 'Westville Boys 1st XI',
    date: format(new Date(Date.now() - 86400000 * 2), 'yyyy-MM-dd'),
    displayDate: format(new Date(Date.now() - 86400000 * 2), 'EEE, MMM d, yyyy'),
    time: '09:00',
    location: 'AH Smith Oval',
    status: 'Completed',
    matchType: '50-over',
    ageGroup: 'Open 1st XI',
    division: 'Super 8 Division',
    umpiresDisplay: 'G. Williams, P. Coetzee',
    scorerName: 'L. Marais',
    homeScore: '312/8 (50 ov)',
    awayScore: '284/10 (47.5 ov)',
    readiness: { squadReady: true, transportReady: true, pitchReady: true }
  },
  {
    id: 'sample-4',
    homeTeamId: 't7',
    homeTeamName: 'DHS 1st XI',
    awayTeamId: 't8',
    awayTeamName: 'Clifton School 1st XI',
    date: format(new Date(Date.now() + 86400000 * 3), 'yyyy-MM-dd'),
    displayDate: format(new Date(Date.now() + 86400000 * 3), 'EEE, MMM d, yyyy'),
    time: '13:30',
    location: 'DHS Main Field',
    status: 'Scheduled',
    matchType: 'T20',
    ageGroup: 'Open 1st XI',
    division: 'T20 Knockout',
    umpiresDisplay: 'B. Pillay, S. Miller',
    scorerName: 'C. Adams',
    readiness: { squadReady: false, transportReady: true, pitchReady: true }
  }
];

const FIXTURES_PAGE_SIZE = 100;

type FixtureRefs = {
  teams: Map<string, any>;
  divisions: Map<string, any>;
  umpires: Map<string, any>;
  scorers: Map<string, any>;
};

type FixturesPage = { items: DisplayFixture[]; cursor: QueryDocumentSnapshot | null };

const toMap = (rows: any[]) => new Map<string, any>(rows.map(r => [r.id, r]));

// Reference lists change rarely; fetched once and cached independently of the
// fixture pages so paging never re-reads them.
const fetchFixtureRefs = async (): Promise<FixtureRefs> => {
  const [teams, divisions, umpires, scorers] = await Promise.all([
    fetchTeams().catch(() => []),
    fetchDivisions().catch(() => []),
    fetchUmpires().catch(() => []),
    fetchScorers().catch(() => [])
  ]);
  return { teams: toMap(teams), divisions: toMap(divisions), umpires: toMap(umpires), scorers: toMap(scorers) };
};

const fetchFixturesPage = async (cursor: QueryDocumentSnapshot | null, refs: FixtureRefs): Promise<FixturesPage> => {
  const { teams, divisions, umpires, scorers } = refs;
  try {
    const matchesCollectionRef = collection(db, 'matches');
    const q = firestoreQuery(
      matchesCollectionRef,
      orderBy('dateTime', 'desc'),
      ...(cursor ? [startAfter(cursor)] : []),
      limit(FIXTURES_PAGE_SIZE)
    );

    const querySnapshot = await getDocs(q).catch(() => ({ docs: [] } as any));

    const fixturesList = (querySnapshot.docs || []).reduce((acc: DisplayFixture[], docSnapshot: any) => {
      const data = docSnapshot.data() as any;
      
      let scheduledDateTime: Date | null = null;
      const rawDate = data.dateTime || data.matchDate || data.scheduledDate || data.scheduledAt || data.date;
      if (rawDate) {
        if (typeof rawDate.toDate === 'function') {
          scheduledDateTime = rawDate.toDate();
        } else if (rawDate instanceof Date) {
          scheduledDateTime = rawDate;
        } else {
          scheduledDateTime = new Date(rawDate);
        }
      }
      if (!scheduledDateTime || !isValid(scheduledDateTime)) {
        scheduledDateTime = new Date();
      }

      const homeTeam = teams.get(data.homeTeamId);
      const awayTeam = teams.get(data.awayTeamId);

      let divisionName = data.division;
      if (!divisionName || divisionName === 'N/A') {
          const divId = data.divisionId || homeTeam?.divisionId;
          if (divId) {
              const div = divisions.get(divId);
              if (div) divisionName = div.name;
          }
      }

      const homeTeamName = data.homeTeamName || homeTeam?.name || data.homeTeamId || 'Home Team';
      const awayTeamName = data.awayTeamName || awayTeam?.name || data.awayTeamId || 'Away Team';

      const umpiresDisplayList = data.umpires && data.umpires.length > 0
        ? data.umpires.map((id: string) => {
            const u = umpires.get(id);
            return u ? (u.displayName || `${u.firstName} ${u.lastName}`) : id;
          }).filter(Boolean).join(', ')
        : 'Unassigned';

      const scorer = data.scorer ? scorers.get(data.scorer) : null;
      const scorerName = scorer ? (scorer.displayName || `${scorer.firstName} ${scorer.lastName}`) : null;

      acc.push({
        id: docSnapshot.id,
        homeTeamId: data.homeTeamId || 'home',
        homeTeamName: homeTeamName,
        awayTeamId: data.awayTeamId || 'away',
        awayTeamName: awayTeamName,
        date: format(scheduledDateTime, 'yyyy-MM-dd'),
        displayDate: format(scheduledDateTime, 'EEE, MMM d, yyyy'),
        time: data.time || format(scheduledDateTime, 'HH:mm'),
        location: data.venue || data.fieldId || data.location || 'TBC Field',
        status: data.status || 'Scheduled',
        matchType: data.matchType || 'T20',
        ageGroup: data.ageGroup || divisionName || 'Open 1st XI',
        division: divisionName || 'Super 8 Division',
        umpiresDisplay: umpiresDisplayList,
        scorerName: scorerName || 'N/A',
        homeScore: data.homeScore || data.scores?.home,
        awayScore: data.awayScore || data.scores?.away,
        readiness: {
          squadReady: data.readiness?.squadReady ?? true,
          transportReady: data.readiness?.transportReady ?? true,
          pitchReady: data.readiness?.pitchReady ?? true,
        }
      } as DisplayFixture);

      return acc;
    }, [] as DisplayFixture[]);
    
    const docs = querySnapshot.docs || [];
    const nextCursor = docs.length === FIXTURES_PAGE_SIZE ? docs[docs.length - 1] : null;
    if (fixturesList.length === 0 && !cursor) return { items: DEFAULT_SAMPLE_FIXTURES, cursor: null };
    return { items: fixturesList, cursor: nextCursor };
  } catch (error) {
    console.error('Error fetching fixtures, providing sample fixtures:', error);
    return { items: cursor ? [] : DEFAULT_SAMPLE_FIXTURES, cursor: null };
  }
};

const getStatusDisplayName = (status: DisplayFixture["status"], dateStr: string): string => {
  const fixtureDate = parseISO(dateStr);
  const today = new Date();
  today.setHours(0,0,0,0);
  const fiveDaysFromNow = subDays(new Date(), -5);
  fiveDaysFromNow.setHours(0,0,0,0);

  if (status === "Scheduled" && isFuture(fixtureDate) && isWithinInterval(fixtureDate, { start: today, end: fiveDaysFromNow })) {
    return "UPCOMING";
  }
  return status.toUpperCase();
};

const getInitials = (name: string) => {
  if (!name) return 'TM';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

// Compact High-Density Fixture Card Component
const CompactFixtureCard = ({ fixture, onAttemptDelete }: { fixture: DisplayFixture, onAttemptDelete: (id: string) => void }) => {
  const currentStatus = getStatusDisplayName(fixture.status, fixture.date);

  const statusConfig: Record<string, { color: string; bg: string; icon: React.ComponentType<any>; pulse: boolean }> = {
    LIVE:             { color: D.rose,    bg: 'rgba(244, 63, 94, 0.12)',    icon: PlayCircle, pulse: true },
    UPCOMING:         { color: D.amber,   bg: 'rgba(245, 158, 11, 0.12)',   icon: Clock,      pulse: false },
    COMPLETED:        { color: D.emerald, bg: 'rgba(16, 185, 129, 0.12)',  icon: Trophy,     pulse: false },
    'MATCH ABANDONED':{ color: D.textMuted, bg: 'rgba(255, 255, 255, 0.05)', icon: Info,       pulse: false },
    'RAIN-DELAY':     { color: D.sky,     bg: 'rgba(14, 165, 233, 0.12)',   icon: Clock,      pulse: true },
    'PLAY SUSPENDED': { color: D.sky,     bg: 'rgba(14, 165, 233, 0.12)',   icon: Clock,      pulse: false },
    SCHEDULED:        { color: D.indigo,  bg: 'rgba(99, 102, 241, 0.12)',   icon: CalendarDays, pulse: false },
  };
  
  const sc = statusConfig[currentStatus] || statusConfig.SCHEDULED;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="group relative rounded-2xl border transition-all duration-300 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5 overflow-hidden flex flex-col justify-between"
      style={{ background: D.surf1, borderColor: D.border }}
    >
      {/* Top Header Row */}
      <div className="p-4 border-b flex items-center justify-between gap-3" style={{ borderColor: D.border, background: D.surf2 }}>
        <div className="flex items-center gap-2">
          <div 
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border",
              sc.pulse && "animate-pulse"
            )}
            style={{ background: sc.bg, borderColor: `${sc.color}30`, color: sc.color }}
          >
            <sc.icon size={12} />
            <span>{currentStatus}</span>
          </div>

          <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 border-white/10 text-muted-foreground">
            {fixture.matchType}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[10px] font-semibold text-muted-foreground">{fixture.displayDate}</span>
            <span className="text-[10px] font-mono font-bold text-primary ml-2">{fixture.time}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-white/10 opacity-70 group-hover:opacity-100">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="p-1 border rounded-xl shadow-xl" style={{ background: D.surf1, borderColor: D.border }}>
              <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-xs font-medium focus:bg-indigo-500/10 focus:text-indigo-400 cursor-pointer">
                <Link href={`/fixtures/edit/${fixture.id}`} className="flex items-center">
                  <Edit3 className="mr-2 h-3.5 w-3.5" />
                  <span>Edit Details</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onAttemptDelete(fixture.id)}
                className="rounded-lg px-3 py-2 text-xs font-medium text-rose-400 focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                <span>Delete Fixture</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Center Teams Matchup Block */}
      <div className="p-5 flex items-center justify-between gap-4">
        {/* Home Team */}
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-300 flex-shrink-0 shadow-inner">
            {getInitials(fixture.homeTeamName)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-primary tracking-tight truncate group-hover:text-indigo-300 transition-colors" title={fixture.homeTeamName}>
              {fixture.homeTeamName}
            </h3>
            {fixture.homeScore ? (
              <p className="text-xs font-mono font-semibold text-emerald-400 mt-0.5">{fixture.homeScore}</p>
            ) : (
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Home</p>
            )}
          </div>
        </div>

        {/* VS / Score Divider */}
        <div className="flex-shrink-0 flex items-center justify-center px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-muted-foreground tracking-widest">
          VS
        </div>

        {/* Away Team */}
        <div className="flex-1 flex items-center gap-3 min-w-0 text-right justify-end">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-primary tracking-tight truncate group-hover:text-indigo-300 transition-colors" title={fixture.awayTeamName}>
              {fixture.awayTeamName}
            </h3>
            {fixture.awayScore ? (
              <p className="text-xs font-mono font-semibold text-emerald-400 mt-0.5">{fixture.awayScore}</p>
            ) : (
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Away</p>
            )}
          </div>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-purple-500/20 border border-sky-500/30 flex items-center justify-center font-bold text-xs text-sky-300 flex-shrink-0 shadow-inner">
            {getInitials(fixture.awayTeamName)}
          </div>
        </div>
      </div>

      {/* Bottom Footer Info & Actions */}
      <div className="px-5 py-3 border-t bg-black/20 flex items-center justify-between gap-3" style={{ borderColor: D.border }}>
        {/* Info Pills */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground min-w-0 truncate">
          <div className="flex items-center gap-1 min-w-0 truncate" title={fixture.location}>
            <MapPin size={13} className="text-indigo-400 flex-shrink-0" />
            <span className="truncate text-[11px]">{fixture.location}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
            <Shield size={13} className="text-sky-400" />
            <span className="text-[11px]">{fixture.ageGroup}</span>
          </div>
        </div>

        {/* Right Section: Readiness & Main Action */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Readiness Tooltip Chips */}
          <TooltipProvider>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn("w-2 h-2 rounded-full", fixture.readiness.squadReady ? "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" : "bg-rose-500/40")} />
                </TooltipTrigger>
                <TooltipContent className="text-[10px]">Squad: {fixture.readiness.squadReady ? 'Confirmed' : 'Pending'}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn("w-2 h-2 rounded-full", fixture.readiness.transportReady ? "bg-sky-400 shadow-[0_0_6px_rgba(14,165,233,0.8)]" : "bg-rose-500/40")} />
                </TooltipTrigger>
                <TooltipContent className="text-[10px]">Transport: {fixture.readiness.transportReady ? 'Assigned' : 'Unassigned'}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn("w-2 h-2 rounded-full", fixture.readiness.pitchReady ? "bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]" : "bg-rose-500/40")} />
                </TooltipTrigger>
                <TooltipContent className="text-[10px]">Pitch: {fixture.readiness.pitchReady ? 'Ready' : 'Prepping'}</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          {/* Action Button */}
          {fixture.status === "Live" ? (
            <Link href={`/matches/${fixture.id}/scoring-hub`}>
              <Button size="sm" className="h-8 px-3 rounded-lg text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20 animate-pulse">
                Score Match
              </Button>
            </Link>
          ) : fixture.status === "Completed" ? (
            <Link href={`/scorecard/${fixture.id}`}>
              <Button size="sm" variant="outline" className="h-8 px-3 rounded-lg text-xs font-medium border-white/10 hover:bg-white/10 text-muted-foreground hover:text-white">
                Scorecard
              </Button>
            </Link>
          ) : (
            <Link href={`/matches/${fixture.id}/manage`}>
              <Button size="sm" className="h-8 px-3 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20">
                Manage
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function FixturesPage() {
  const refsQuery = useQuery({
    queryKey: ['fixture-refs'],
    queryFn: fetchFixtureRefs,
    staleTime: 30 * 60 * 1000,
  });
  const refs = refsQuery.data;
  const fixturesQuery = useInfiniteQuery({
    queryKey: ['fixtures'],
    queryFn: ({ pageParam }) => fetchFixturesPage(pageParam, refs!),
    initialPageParam: null as QueryDocumentSnapshot | null,
    getNextPageParam: (last) => last.cursor,
    enabled: !!refs,
  });
  const fixtures = React.useMemo(
    () => fixturesQuery.data?.pages.flatMap(p => p.items),
    [fixturesQuery.data]
  );
  const isLoading = refsQuery.isLoading || fixturesQuery.isLoading;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
  const [selectedDivision, setSelectedDivision] = React.useState<string>('all');
  const [selectedFormat, setSelectedFormat] = React.useState<string>('all');
  const [view, setView] = React.useState<'card' | 'list' | 'calendar'>('card');
  const [fixtureToDelete, setFixtureToDelete] = React.useState<string | null>(null);

  // Extract unique divisions & formats for dropdown filter options
  const availableDivisions = React.useMemo(() => {
    if (!fixtures) return [];
    const set = new Set<string>();
    fixtures.forEach(f => {
      if (f.division && f.division !== 'N/A') set.add(f.division);
      if (f.ageGroup) set.add(f.ageGroup);
    });
    return Array.from(set);
  }, [fixtures]);

  const availableFormats = React.useMemo(() => {
    if (!fixtures) return [];
    const set = new Set<string>();
    fixtures.forEach(f => {
      if (f.matchType) set.add(f.matchType);
    });
    return Array.from(set);
  }, [fixtures]);

  // Metrics summary counts
  const metrics = React.useMemo(() => {
    if (!fixtures) return { total: 0, live: 0, upcoming: 0, completed: 0 };
    let live = 0, upcoming = 0, completed = 0;
    fixtures.forEach(f => {
      const st = getStatusDisplayName(f.status, f.date);
      if (st === 'LIVE' || f.status === 'Rain-Delay' || f.status === 'Play Suspended') live++;
      else if (st === 'UPCOMING' || f.status === 'Scheduled') upcoming++;
      else if (st === 'COMPLETED' || f.status === 'Match Abandoned') completed++;
    });
    return { total: fixtures.length, live, upcoming, completed };
  }, [fixtures]);

  // Comprehensive Search & Multi-Filter Logic
  const filteredFixtures = React.useMemo(() => {
    if (!fixtures) return [];
    return fixtures.filter(f => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery = 
          f.homeTeamName.toLowerCase().includes(q) ||
          f.awayTeamName.toLowerCase().includes(q) ||
          f.location.toLowerCase().includes(q) ||
          (f.division && f.division.toLowerCase().includes(q)) ||
          (f.ageGroup && f.ageGroup.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // 2. Status Filter
      const statusDisplay = getStatusDisplayName(f.status, f.date);
      if (filterStatus === 'live' && !(statusDisplay === 'LIVE' || f.status === 'Rain-Delay' || f.status === 'Play Suspended')) return false;
      if (filterStatus === 'upcoming' && !(statusDisplay === 'UPCOMING' || f.status === 'Scheduled')) return false;
      if (filterStatus === 'completed' && !(statusDisplay === 'COMPLETED' || f.status === 'Match Abandoned')) return false;

      // 3. Division Filter
      if (selectedDivision !== 'all') {
        if (f.division !== selectedDivision && f.ageGroup !== selectedDivision) return false;
      }

      // 4. Match Format Filter
      if (selectedFormat !== 'all') {
        if (f.matchType !== selectedFormat) return false;
      }

      return true;
    });
  }, [fixtures, searchQuery, filterStatus, selectedDivision, selectedFormat]);

  // Grouping Filtered Fixtures by Category/Date for clear timeline presentation
  const groupedFixtures = React.useMemo(() => {
    const liveGroup: DisplayFixture[] = [];
    const upcomingGroup: DisplayFixture[] = [];
    const completedGroup: DisplayFixture[] = [];

    filteredFixtures.forEach(f => {
      const st = getStatusDisplayName(f.status, f.date);
      if (st === 'LIVE' || f.status === 'Rain-Delay' || f.status === 'Play Suspended') {
        liveGroup.push(f);
      } else if (st === 'UPCOMING' || f.status === 'Scheduled') {
        upcomingGroup.push(f);
      } else {
        completedGroup.push(f);
      }
    });

    return [
      { title: 'Live Matches', icon: PlayCircle, items: liveGroup, badgeColor: D.rose },
      { title: 'Upcoming Fixtures', icon: Clock, items: upcomingGroup, badgeColor: D.amber },
      { title: 'Completed & Past Results', icon: Trophy, items: completedGroup, badgeColor: D.emerald },
    ].filter(g => g.items.length > 0);
  }, [filteredFixtures]);

  const hasActiveFilters = searchQuery !== '' || filterStatus !== 'all' || selectedDivision !== 'all' || selectedFormat !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setSelectedDivision('all');
    setSelectedFormat('all');
  };

  const handleDeleteFixture = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'matches', id));
      toast({ title: "FIXTURE DELETED", description: "The match has been removed from the institutional record." });
      queryClient.invalidateQueries({ queryKey: ['fixtures'] });
    } catch (err: any) {
      toast({ title: "DELETION FAILED", description: err.message, variant: "destructive" });
    } finally {
      setFixtureToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
        <p className="text-xs font-mono font-semibold tracking-widest text-muted-foreground animate-pulse">LOADING MATCH REPOSITORY...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Standardized Header */}
      <SectionHeader 
        title="Match Fixtures"
        sub="Institutional match schedule, live match control, and historical repository."
        icon={<CalendarDays className="w-5 h-5 text-indigo-400" />}
        actions={
          <div className="flex items-center gap-3">
            <Link href="/fixtures/multi-create">
              <Button variant="outline" className="h-10 px-4 rounded-xl text-xs font-semibold border-white/10 hover:bg-white/5">
                Multi-Create
              </Button>
            </Link>
            <Link href="/fixtures/create">
              <Button className="h-10 px-5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20">
                <Plus className="mr-1.5 h-4 w-4" />
                New Fixture
              </Button>
            </Link>
          </div>
        }
      />

      {/* Top Metrics Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          className={cn(
            "p-4 rounded-2xl border transition-all cursor-pointer",
            filterStatus === 'all' ? "border-indigo-500/40 bg-indigo-500/10" : "hover:border-white/20"
          )}
          style={{ background: filterStatus === 'all' ? undefined : D.surf1, borderColor: filterStatus === 'all' ? undefined : D.border }}
          onClick={() => setFilterStatus('all')}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Fixtures</span>
            <CalendarDays size={16} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-primary font-mono">{metrics.total}</div>
        </div>

        <div 
          className={cn(
            "p-4 rounded-2xl border transition-all cursor-pointer",
            filterStatus === 'live' ? "border-rose-500/40 bg-rose-500/10" : "hover:border-white/20"
          )}
          style={{ background: filterStatus === 'live' ? undefined : D.surf1, borderColor: filterStatus === 'live' ? undefined : D.border }}
          onClick={() => setFilterStatus('live')}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Live Now
            </span>
            <PlayCircle size={16} className="text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">{metrics.live}</div>
        </div>

        <div 
          className={cn(
            "p-4 rounded-2xl border transition-all cursor-pointer",
            filterStatus === 'upcoming' ? "border-amber-500/40 bg-amber-500/10" : "hover:border-white/20"
          )}
          style={{ background: filterStatus === 'upcoming' ? undefined : D.surf1, borderColor: filterStatus === 'upcoming' ? undefined : D.border }}
          onClick={() => setFilterStatus('upcoming')}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Upcoming</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{metrics.upcoming}</div>
        </div>

        <div 
          className={cn(
            "p-4 rounded-2xl border transition-all cursor-pointer",
            filterStatus === 'completed' ? "border-emerald-500/40 bg-emerald-500/10" : "hover:border-white/20"
          )}
          style={{ background: filterStatus === 'completed' ? undefined : D.surf1, borderColor: filterStatus === 'completed' ? undefined : D.border }}
          onClick={() => setFilterStatus('completed')}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Completed</span>
            <Trophy size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{metrics.completed}</div>
        </div>
      </div>

      {/* Multi-Filter & Search Bar */}
      <div className="p-4 rounded-2xl border space-y-4 shadow-xl" style={{ background: D.surf1, borderColor: D.border }}>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Real-time Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team, venue, or division..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-9 h-11 rounded-xl border-white/10 bg-white/5 focus:bg-white/10 text-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Status Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/20 border border-white/10 overflow-x-auto">
            {[
              { id: 'all', label: 'All', count: metrics.total },
              { id: 'live', label: 'Live', count: metrics.live, color: 'text-rose-400' },
              { id: 'upcoming', label: 'Upcoming', count: metrics.upcoming },
              { id: 'completed', label: 'Completed', count: metrics.completed },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilterStatus(st.id as any)}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5",
                  filterStatus === st.id ? "bg-indigo-600 text-white shadow-md" : "text-muted-foreground hover:text-white"
                )}
              >
                <span>{st.label}</span>
                <span className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                  filterStatus === st.id ? "bg-white/20 text-white" : "bg-white/5 text-muted-foreground"
                )}>
                  {st.count}
                </span>
              </button>
            ))}
          </div>

          {/* View Switcher Controls */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/20 border border-white/10 flex-shrink-0">
            <button
              onClick={() => setView('card')}
              className={cn("p-2 rounded-lg transition-all", view === 'card' ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white")}
              title="Card Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn("p-2 rounded-lg transition-all", view === 'list' ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white")}
              title="Compact Table List View"
            >
              <ListIcon size={16} />
            </button>
            <button
              onClick={() => setView('calendar')}
              className={cn("p-2 rounded-lg transition-all", view === 'calendar' ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white")}
              title="Calendar View"
            >
              <CalendarDays size={16} />
            </button>
          </div>
        </div>

        {/* Secondary Dropdown Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-3">
            {/* Division Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <SlidersHorizontal size={12} />
                Division:
              </span>
              <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                <SelectTrigger className="h-8 text-xs rounded-lg border-white/10 bg-white/5 w-[160px]">
                  <SelectValue placeholder="All Divisions" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="all">All Divisions</SelectItem>
                  {availableDivisions.map(div => (
                    <SelectItem key={div} value={div}>{div}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Match Format Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Format:</span>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger className="h-8 text-xs rounded-lg border-white/10 bg-white/5 w-[130px]">
                  <SelectValue placeholder="All Formats" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="all">All Formats</SelectItem>
                  {availableFormats.map(fmt => (
                    <SelectItem key={fmt} value={fmt}>{fmt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reset Filters CTA */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors ml-auto"
            >
              <X size={12} />
              Reset Filters ({filteredFixtures.length} matches found)
            </button>
          )}
        </div>
      </div>

      {/* Main Fixtures View Area */}
      <AnimatePresence mode="wait">
        {view === 'card' && (
          <motion.div 
            key="card-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-10"
          >
            {groupedFixtures.length > 0 ? (
              groupedFixtures.map(group => (
                <div key={group.title} className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center gap-3 pb-2 border-b border-white/10">
                    <div className="p-1.5 rounded-lg bg-white/5 text-indigo-400">
                      <group.icon size={16} style={{ color: group.badgeColor }} />
                    </div>
                    <h2 className="text-base font-bold text-primary tracking-tight">
                      {group.title}
                    </h2>
                    <Badge variant="outline" className="text-xs font-mono ml-auto border-white/10">
                      {group.items.length} {group.items.length === 1 ? 'Match' : 'Matches'}
                    </Badge>
                  </div>

                  {/* High-Density Responsive Card Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {group.items.map(f => (
                      <CompactFixtureCard key={f.id} fixture={f} onAttemptDelete={setFixtureToDelete} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center gap-3" style={{ borderColor: D.border }}>
                <Globe className="h-10 w-10 text-muted-foreground/30 animate-pulse" />
                <h3 className="text-sm font-bold text-primary">No Match Fixtures Found</h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  No matches fit your current search query or active filter settings. Try adjusting your parameters.
                </p>
                {hasActiveFilters && (
                  <Button size="sm" variant="outline" onClick={resetFilters} className="mt-2 text-xs rounded-xl border-white/10">
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        )}

        {view === 'list' && (
          <motion.div 
            key="list-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl overflow-hidden border shadow-xl"
            style={{ background: D.surf1, borderColor: D.border }}
          >
            <Table>
              <TableHeader style={{ background: D.surf2 }}>
                <TableRow style={{ borderColor: D.border }}>
                  <TableHead className="text-xs font-bold py-4 px-6">DATE & TIME</TableHead>
                  <TableHead className="text-xs font-bold py-4">MATCHUP</TableHead>
                  <TableHead className="text-xs font-bold py-4">VENUE & DIVISION</TableHead>
                  <TableHead className="text-xs font-bold py-4">STATUS</TableHead>
                  <TableHead className="text-xs font-bold py-4 text-right px-6">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFixtures.length > 0 ? (
                  filteredFixtures.map(f => {
                    const st = getStatusDisplayName(f.status, f.date);
                    return (
                      <TableRow key={f.id} className="group border-b transition-colors hover:bg-white/5" style={{ borderColor: D.border }}>
                        <TableCell className="py-4 px-6">
                          <p className="text-xs font-bold text-primary">{f.displayDate}</p>
                          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{f.time} ({f.matchType})</p>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-primary truncate max-w-[160px]">{f.homeTeamName}</span>
                            <span className="text-xs font-bold text-muted-foreground">vs</span>
                            <span className="text-sm font-bold text-primary truncate max-w-[160px]">{f.awayTeamName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <p className="text-xs font-semibold text-primary truncate max-w-[200px]">{f.location}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{f.ageGroup || f.division}</p>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1",
                            st === 'LIVE' && "bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse",
                            st === 'UPCOMING' && "bg-amber-500/10 text-amber-400 border-amber-500/30",
                            st === 'COMPLETED' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                            st === 'SCHEDULED' && "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                          )}>
                            {st}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 text-right px-6">
                          <div className="flex items-center justify-end gap-2">
                            {st === 'LIVE' ? (
                              <Link href={`/matches/${f.id}/scoring-hub`}>
                                <Button size="sm" className="h-8 text-xs bg-rose-500 hover:bg-rose-600 font-bold">
                                  Score
                                </Button>
                              </Link>
                            ) : st === 'COMPLETED' ? (
                              <Link href={`/scorecard/${f.id}`}>
                                <Button size="sm" variant="outline" className="h-8 text-xs border-white/10">
                                  Scorecard
                                </Button>
                              </Link>
                            ) : (
                              <Link href={`/matches/${f.id}/manage`}>
                                <Button size="sm" className="h-8 text-xs bg-indigo-600 hover:bg-indigo-500 font-semibold">
                                  Manage
                                </Button>
                              </Link>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/10">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
                                <DropdownMenuItem asChild className="text-xs">
                                  <Link href={`/fixtures/edit/${f.id}`}>Edit Details</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFixtureToDelete(f.id)} className="text-xs text-rose-400">
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground text-xs">
                      No fixtures found matching selected filter criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </motion.div>
        )}

        {view === 'calendar' && (
          <motion.div 
            key="calendar-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <FixtureCalendar fixtures={fixtures || []} />
          </motion.div>
        )}
      </AnimatePresence>

      {fixturesQuery.hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fixturesQuery.fetchNextPage()}
            disabled={fixturesQuery.isFetchingNextPage}
            className="h-9 px-5 rounded-xl text-xs font-semibold border-white/10"
          >
            {fixturesQuery.isFetchingNextPage
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> Loading older fixtures…</>
              : `Load older fixtures (${fixtures?.length ?? 0} shown)`}
          </Button>
        </div>
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!fixtureToDelete} onOpenChange={(open) => !open && setFixtureToDelete(null)}>
        <AlertDialogContent className="rounded-2xl border-white/10 p-6 max-w-md" style={{ background: D.surf1 }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-primary">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground mt-2">
              Are you sure you want to delete this fixture? This action will permanently remove the match from institutional records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="h-9 px-4 rounded-xl text-xs font-medium border-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDeleteFixture(fixtureToDelete!)}
              className="h-9 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
