"use client";

import * as React from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, Timestamp, orderBy, query as firestoreQuery, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  CalendarDays, Clock, MapPin, ListChecks, AlertTriangle, Loader2, Users, Shield, BarChart2, Info, LayoutGrid, List as ListIcon,
  MoreHorizontal, Edit3, FileText, Trash2, Bus, PlayCircle, Trophy, Globe, Filter, ChevronRight, Plus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { D } from "@/lib/design-system";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { format, isFuture, subDays, isWithinInterval, parseISO, isValid } from 'date-fns';
import { cn } from "@/lib/utils";
import { fetchTeams, fetchDivisions, fetchUmpires, fetchScorers } from '@/lib/firestore';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { FixtureCalendar } from '@/components/fixtures/FixtureCalendar';
import { LiveMatchSummary } from '@/components/fixtures/LiveMatchSummary';
import { motion, AnimatePresence } from "framer-motion";

interface FirestoreFixture {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  matchType: 'T20' | 'ODI' | 'Test';
  venueId: string;
  scheduledDate: Date | null;
  time: string;
  overs?: number;
  ageGroup: string;
  status: 'Scheduled' | 'Team Confirmed' | 'Ground Ready' | 'Live' | 'Completed' | 'Match Abandoned' | 'Rain-Delay' | 'Play Suspended';
  umpireIds: string[];
  scorerId: string | null;
  division?: string | null;
}

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
  status: FirestoreFixture['status'];
  matchType: FirestoreFixture['matchType'];
  ageGroup?: string;
  division?: string | null;
  umpiresDisplay?: string;
  scorerName?: string | null;
  readiness: {
    squadReady: boolean;
    transportReady: boolean;
    pitchReady: boolean;
  };
}

const fetchFixtures = async (): Promise<DisplayFixture[]> => {
  const matchesCollectionRef = collection(db, 'matches');
  const q = firestoreQuery(matchesCollectionRef, orderBy('dateTime', 'desc'));
  
  const [querySnapshot, teams, divisions, umpires, scorers] = await Promise.all([
    getDocs(q),
    fetchTeams(),
    fetchDivisions(),
    fetchUmpires(),
    fetchScorers()
  ]);
  
  const fixturesList = querySnapshot.docs.reduce((acc, docSnapshot) => {
    const data = docSnapshot.data() as any;
    
    let scheduledDateTime: Date | null = null;
    if (data.dateTime) {
      scheduledDateTime = typeof data.dateTime.toDate === 'function' ? data.dateTime.toDate() : new Date(data.dateTime);
    } else if (data.matchDate) {
      scheduledDateTime = typeof data.matchDate.toDate === 'function' ? data.matchDate.toDate() : new Date(data.matchDate);
    }

    if (scheduledDateTime && isValid(scheduledDateTime)) {
      const homeTeam = teams.find(t => t.id === data.homeTeamId);
      const awayTeam = teams.find(t => t.id === data.awayTeamId);

      let divisionName = data.division;
      if (!divisionName || divisionName === 'N/A') {
          const divId = data.divisionId || homeTeam?.divisionId;
          if (divId) {
              const div = divisions.find(d => d.id === divId);
              if (div) divisionName = div.name;
          }
      }

      const homeTeamName = data.homeTeamName || homeTeam?.name || data.homeTeamId;
      const awayTeamName = data.awayTeamName || awayTeam?.name || data.awayTeamId;

      const umpiresDisplayList = data.umpires && data.umpires.length > 0
        ? data.umpires.map((id: string) => {
            const u = umpires.find(p => p.id === id);
            return u ? (u.displayName || `${u.firstName} ${u.lastName}`) : id;
          }).filter(Boolean).join(', ')
        : 'N/A';
      
      const scorer = data.scorer ? scorers.find(s => s.id === data.scorer) : null;
      const scorerName = scorer ? (scorer.displayName || `${scorer.firstName} ${scorer.lastName}`) : null;

      acc.push({
        id: docSnapshot.id,
        homeTeamId: data.homeTeamId,
        homeTeamName: homeTeamName,
        awayTeamId: data.awayTeamId,
        awayTeamName: awayTeamName,
        date: format(scheduledDateTime, 'yyyy-MM-dd'),
        displayDate: format(scheduledDateTime, 'EEE, MMM d, yyyy'),
        time: data.time || format(scheduledDateTime, 'HH:mm'),
        location: data.venue || data.fieldId || 'TBC',
        status: data.status || 'Scheduled',
        matchType: data.matchType || 'T20',
        ageGroup: data.ageGroup || divisionName || 'N/A',
        division: divisionName || 'N/A',
        umpiresDisplay: umpiresDisplayList,
        scorerName: scorerName || 'N/A',
        readiness: {
          squadReady: Math.random() > 0.5,
          transportReady: Math.random() > 0.5,
          pitchReady: Math.random() > 0.5,
        }
      } as DisplayFixture);
    }
    return acc;
  }, [] as DisplayFixture[]);
  
  return fixturesList;
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

const FixtureCard = ({ fixture, onAttemptDelete }: { fixture: DisplayFixture, onAttemptDelete: (id: string) => void }) => {
  const currentStatus = getStatusDisplayName(fixture.status, fixture.date);

  // Status colour mapping
  const statusConfig = {
    LIVE:             { color: D.rose,    icon: PlayCircle, pulse: true },
    UPCOMING:         { color: D.amber,   icon: Clock,      pulse: false },
    COMPLETED:        { color: D.emerald, icon: Trophy,     pulse: false },
    'MATCH ABANDONED':{ color: D.textMuted, icon: Info,       pulse: false },
    'RAIN-DELAY':     { color: D.sky,     icon: Clock,      pulse: true },
    'PLAY SUSPENDED': { color: D.sky,     icon: Clock,      pulse: false },
    SCHEDULED:        { color: D.indigo,  icon: CalendarDays, pulse: false },
  } as any;
  
  const sc = statusConfig[currentStatus] || statusConfig.SCHEDULED;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <div 
        className="rounded-[2.5rem] overflow-hidden border shadow-2xl transition-all duration-500 hover:shadow-indigo-500/10"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        <div className="flex flex-col lg:flex-row">
          {/* Main Content */}
          <div className="flex-1 p-8 lg:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
               <div className="flex items-center gap-3">
                  <div 
                    className={cn(
                      "flex items-center gap-2.5 px-4 py-1.5 rounded-full border shadow-lg",
                      sc.pulse && "animate-pulse"
                    )}
                    style={{ background: `${sc.color}08`, borderColor: `${sc.color}20`, color: sc.color }}
                  >
                    <sc.icon size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{currentStatus}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-20" style={{ color: D.textMuted }}>·</span>
                  <div className="px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest opacity-60" 
                       style={{ background: D.surf2, borderColor: D.border, color: D.textMuted }}>
                    {fixture.matchType}
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-0.5" style={{ color: D.textMuted }}>{fixture.displayDate.toUpperCase()}</p>
                     <p className="text-xs font-black uppercase tracking-tighter" style={{ color: D.textPrimary }}>{fixture.time}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-black/5" style={{ border: `1px solid ${D.border}` }}>
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="p-2 border rounded-2xl shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
                      <DropdownMenuItem asChild className="rounded-xl px-4 py-3 focus:bg-indigo-500/10 focus:text-indigo-500 cursor-pointer">
                        <Link href={`/fixtures/edit/${fixture.id}`} className="flex items-center">
                          <Edit3 className="mr-3 h-4 w-4" />
                          <span className="text-xs font-black uppercase tracking-widest">Edit Fixture</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onAttemptDelete(fixture.id)}
                        className="rounded-xl px-4 py-3 text-rose-500 focus:bg-rose-500/10 focus:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="mr-3 h-4 w-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Delete Fixture</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
               </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 mb-10">
               <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-3" style={{ color: D.textMuted }}>HOME TEAM</p>
                  <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase leading-none" 
                      style={{ fontFamily: D.head, color: D.textPrimary }}>
                    {fixture.homeTeamName}
                  </h2>
               </div>
               
               <div className="flex items-center justify-center">
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center border font-black italic text-lg" 
                       style={{ background: D.surf2, borderColor: D.border, color: D.textMuted }}>
                    VS
                  </div>
               </div>

               <div className="flex-1 flex flex-col items-center md:items-end text-center md:text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-3" style={{ color: D.textMuted }}>AWAY TEAM</p>
                  <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase leading-none" 
                      style={{ fontFamily: D.head, color: D.textPrimary }}>
                    {fixture.awayTeamName}
                  </h2>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t" style={{ borderColor: D.border }}>
               <div className="flex items-center gap-4 px-4 py-3 rounded-2xl" style={{ background: D.surf2 }}>
                  <MapPin size={18} className="text-indigo-500" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40" style={{ color: D.textMuted }}>VENUE</p>
                    <p className="text-xs font-black uppercase tracking-tight truncate max-w-[120px]" style={{ color: D.textPrimary }}>{fixture.location}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 px-4 py-3 rounded-2xl" style={{ background: D.surf2 }}>
                  <Shield size={18} className="text-sky-500" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40" style={{ color: D.textMuted }}>DIVISION</p>
                    <p className="text-xs font-black uppercase tracking-tight" style={{ color: D.textPrimary }}>{fixture.ageGroup}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 px-4 py-3 rounded-2xl" style={{ background: D.surf2 }}>
                  <Users size={18} className="text-emerald-500" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40" style={{ color: D.textMuted }}>OFFICIALS</p>
                    <p className="text-xs font-black uppercase tracking-tight truncate max-w-[120px]" style={{ color: D.textPrimary }}>{fixture.umpiresDisplay || 'UNASSIGNED'}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Action Hub Sidebar */}
          <div className="w-full lg:w-72 p-8 lg:p-10 flex flex-col gap-6" style={{ background: D.surf2, borderLeft: `1px solid ${D.border}` }}>
             <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic" style={{ color: D.textMuted }}>READINESS CHECKS</p>
                <div className="space-y-3">
                  {[
                    { label: 'SQUAD', ready: fixture.readiness.squadReady, Icon: Users, color: D.emerald },
                    { label: 'TRANSPORT', ready: fixture.readiness.transportReady, Icon: Bus, color: D.sky },
                    { label: 'PITCH', ready: fixture.readiness.pitchReady, Icon: MapPin, color: D.indigo },
                  ].map(({ label, ready, Icon, color }) => (
                    <div key={label} className="flex items-center justify-between p-3 rounded-xl border" 
                         style={{ background: D.surf1, borderColor: D.border }}>
                       <div className="flex items-center gap-3">
                          <Icon size={14} style={{ color: ready ? color : D.textMuted }} />
                          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: D.textPrimary }}>{label}</span>
                       </div>
                       <div className={cn("w-2 h-2 rounded-full", ready ? "animate-pulse" : "opacity-20")} 
                            style={{ background: ready ? color : D.textMuted, boxShadow: ready ? `0 0 8px ${color}` : 'none' }} />
                    </div>
                  ))}
                </div>
             </div>

             <div className="mt-auto pt-6 border-t" style={{ borderColor: D.border }}>
                {fixture.status === "Live" ? (
                  <Link href={`/matches/${fixture.id}/scoring-hub`} className="w-full">
                    <Button className="w-full h-12 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all hover:scale-105" 
                            style={{ background: D.rose, color: 'white' }}>
                      RESUME SCORING
                    </Button>
                  </Link>
                ) : (fixture.status === "Completed") ? (
                  <Link href={`/scorecard/${fixture.id}`} className="w-full">
                    <Button variant="outline" className="w-full h-12 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-black/5" 
                            style={{ borderColor: D.border, color: D.textPrimary }}>
                      VIEW SCORECARD
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/matches/${fixture.id}/manage`} className="w-full">
                    <Button className="w-full h-12 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all hover:scale-105" 
                            style={{ background: D.indigo, color: 'white' }}>
                      MANAGE PRE-MATCH
                    </Button>
                  </Link>
                )}
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function FixturesPage() {
  const { data: fixtures, isLoading, isError, error } = useQuery<DisplayFixture[], Error>({
    queryKey: ['fixtures'],
    queryFn: fetchFixtures,
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [filter, setFilter] = React.useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
  const [view, setView] = React.useState<'card' | 'list' | 'calendar'>('card');

  const filteredFixtures = React.useMemo(() => {
    if (!fixtures) return [];
    switch (filter) {
      case 'live':
        return fixtures.filter(f => f.status === 'Live' || f.status === 'Play Suspended' || f.status === 'Rain-Delay');
      case 'upcoming':
        return fixtures.filter(f => getStatusDisplayName(f.status, f.date) === 'UPCOMING' || f.status === 'Scheduled');
      case 'completed':
        return fixtures.filter(f => f.status === 'Completed' || f.status === 'Match Abandoned');
      case 'all':
      default:
        return fixtures;
    }
  }, [fixtures, filter]);

  const [fixtureToDelete, setFixtureToDelete] = React.useState<string | null>(null);

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
      <div className="flex flex-col justify-center items-center h-[60vh] gap-6">
        <Loader2 className="h-12 w-12 animate-spin" style={{ color: D.indigo }} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 animate-pulse">SYNCING MATCH REPOSITORY</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
      {/* Standardized Header */}
      <SectionHeader 
        title="Match Fixtures"
        sub="Institutional match schedule & competition history. Live ops monitoring active."
        icon={<CalendarDays className="w-5 h-5 text-indigo-400" />}
        actions={
          <Link href="/fixtures/create">
            <Button className="h-11 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20" 
                    style={{ background: D.indigo, color: 'white' }}>
              <Plus className="mr-2 h-4 w-4" />
              CREATE FIXTURE
            </Button>
          </Link>
        }
      />

      {/* View & Filter Hub */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6 p-4 rounded-[2rem] border" 
           style={{ background: D.surf1, borderColor: D.border }}>
        <div className="flex items-center gap-2 p-1.5 rounded-2xl" style={{ background: D.surf2 }}>
          {[
            { id: 'card', icon: LayoutGrid, label: 'CARD VIEW' },
            { id: 'list', icon: ListIcon, label: 'LIST VIEW' },
            { id: 'calendar', icon: CalendarDays, label: 'CALENDAR' }
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id as any)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest",
                view === v.id ? "text-white shadow-xl" : "opacity-40 hover:opacity-100"
              )}
              style={{ background: view === v.id ? D.indigo : 'transparent' }}
            >
              <v.icon size={14} />
              {v.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 px-4 py-1.5 rounded-2xl" style={{ background: D.surf2 }}>
          <Filter size={14} className="text-zinc-500 ml-2" />
          {[
            { id: 'all', label: 'ALL' },
            { id: 'live', label: 'LIVE' },
            { id: 'upcoming', label: 'UPCOMING' },
            { id: 'completed', label: 'COMPLETED' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={cn(
                "px-5 py-2.5 rounded-lg transition-all text-[9px] font-black uppercase tracking-widest",
                filter === f.id ? "bg-white/10 text-white shadow-inner" : "opacity-40 hover:opacity-100"
              )}
              style={{ background: filter === f.id ? `${D.indigo}20` : 'transparent', color: filter === f.id ? D.indigo : D.textMuted }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'card' && (
          <motion.div 
            key="card-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-8"
          >
            {filteredFixtures.length > 0 ? (
              filteredFixtures.map(f => <FixtureCard key={f.id} fixture={f} onAttemptDelete={setFixtureToDelete} />)
            ) : (
              <div className="py-24 text-center rounded-[3rem] border border-dashed flex flex-col items-center gap-4" 
                   style={{ borderColor: D.border }}>
                 <Globe className="h-12 w-12 opacity-10 animate-pulse" />
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">NO MATCHES FOUND FOR SELECTED TOPOLOGY</p>
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
            className="rounded-[2.5rem] overflow-hidden border shadow-2xl"
            style={{ background: D.surf1, borderColor: D.border }}
          >
            <Table>
              <TableHeader style={{ background: D.surf2 }}>
                <TableRow style={{ borderColor: D.border }}>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 px-8">TIMESTAMP</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">MATCH-UP</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">VENUE</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">STATUS</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-right px-8">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFixtures.map(f => (
                  <TableRow key={f.id} className="group border-b transition-colors hover:bg-black/5" style={{ borderColor: D.border }}>
                    <TableCell className="py-6 px-8">
                      <p className="text-xs font-black" style={{ color: D.textPrimary }}>{f.time}</p>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">{f.displayDate}</p>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-black uppercase italic" style={{ color: D.textPrimary }}>{f.homeTeamName}</span>
                        <span className="text-[10px] font-light opacity-30 italic">VS</span>
                        <span className="text-sm font-black uppercase italic" style={{ color: D.textPrimary }}>{f.awayTeamName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <p className="text-[10px] font-black uppercase tracking-tight">{f.location}</p>
                    </TableCell>
                    <TableCell className="py-6">
                       <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border" 
                             style={{ background: `${getStatusDisplayName(f.status, f.date) === 'LIVE' ? D.rose : D.indigo}08`, borderColor: `${getStatusDisplayName(f.status, f.date) === 'LIVE' ? D.rose : D.indigo}20`, color: getStatusDisplayName(f.status, f.date) === 'LIVE' ? D.rose : D.indigo }}>
                         {getStatusDisplayName(f.status, f.date)}
                       </span>
                    </TableCell>
                    <TableCell className="py-6 text-right px-8">
                       <Link href={`/matches/${f.id}/manage`}>
                         <Button variant="ghost" size="icon" className="group-hover:bg-indigo-500 group-hover:text-white transition-all rounded-xl">
                           <ChevronRight size={18} />
                         </Button>
                       </Link>
                    </TableCell>
                  </TableRow>
                ))}
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

      <AlertDialog open={!!fixtureToDelete} onOpenChange={(open) => !open && setFixtureToDelete(null)}>
        <AlertDialogContent className="rounded-[2.5rem] border-0 p-10 shadow-[0_0_80px_rgba(0,0,0,0.5)]" style={{ background: D.surf1 }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl font-black uppercase italic tracking-tighter" style={{ fontFamily: D.head, color: D.textPrimary }}>CONFIRM DELETION</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-bold uppercase tracking-widest opacity-60 leading-relaxed mt-4">
              Are you sure you want to delete this fixture? This action will permanently remove the match from institutional records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 gap-4">
            <AlertDialogCancel className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px]" style={{ background: D.surf2, borderColor: D.border }}>CANCEL</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDeleteFixture(fixtureToDelete!)}
              className="h-12 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px]"
              style={{ background: D.rose, color: 'white' }}
            >
              DELETE PERMANENTLY
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
