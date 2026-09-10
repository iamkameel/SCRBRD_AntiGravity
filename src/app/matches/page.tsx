"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, orderBy, query as firestoreQuery } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertTriangle, CalendarDays, MapPin, Clock, ChevronRight, Activity, Trophy, Play } from "lucide-react";
import { format, parseISO, isFuture, subDays, isWithinInterval, isValid } from 'date-fns';
import { fetchTeams, fetchDivisions } from '@/lib/firestore';
import { D } from '@/lib/design-system';

// Reuse DisplayFixture concept
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
  score?: {
    home?: string;
    away?: string;
  }
}

const fetchHubMatches = async (): Promise<MatchHubFixture[]> => {
  const matchesCollectionRef = collection(db, 'matches');
  const q = firestoreQuery(matchesCollectionRef, orderBy('dateTime', 'desc'));
  
  const [querySnapshot, teams, divisions] = await Promise.all([
    getDocs(q),
    fetchTeams(),
    fetchDivisions()
  ]);
  
  const matchesList = querySnapshot.docs.reduce((acc, docSnapshot) => {
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
          const div = divisions.find(d => d.id === divId);
          if (div) divisionName = div.name;
      }

      acc.push({
        id: docSnapshot.id,
        homeTeamName: data.homeTeamName || homeTeam?.name || data.homeTeamId,
        awayTeamName: data.awayTeamName || awayTeam?.name || data.awayTeamId,
        date: format(scheduledDateTime, 'yyyy-MM-dd'),
        displayDate: format(scheduledDateTime, 'MMM d, yyyy'),
        time: data.time || format(scheduledDateTime, 'HH:mm'),
        location: data.venue || data.fieldId || 'TBC',
        status: data.status || 'Scheduled',
        matchType: data.matchType || 'T20',
        ageGroup: data.ageGroup || divisionName || 'Open',
        division: divisionName || 'N/A',
        result: data.result,
        score: {
          home: data.score?.home,
          away: data.score?.away,
        }
      });
    }
    return acc;
  }, [] as MatchHubFixture[]);
  
  return matchesList;
};

const getStatusCategory = (status: string, dateStr: string) => {
  const fixtureDate = parseISO(dateStr);
  const today = new Date();
  today.setHours(0,0,0,0);
  
  if (status === 'Live' || status === 'Play Suspended' || status === 'Rain-Delay') return 'LIVE';
  if (status === 'Completed' || status === 'Match Abandoned') return 'COMPLETED';
  return 'UPCOMING';
};

export default function MatchCenterHub() {
  const { data: matches, isLoading, isError, error } = useQuery<MatchHubFixture[], Error>({
    queryKey: ['hub_matches'],
    queryFn: fetchHubMatches,
  });

  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');

  const stats = useMemo(() => {
    if (!matches) return { live: 0, upcoming: 0, completed: 0 };
    return matches.reduce((acc, m) => {
      const cat = getStatusCategory(m.status, m.date);
      if (cat === 'LIVE') acc.live++;
      else if (cat === 'UPCOMING') acc.upcoming++;
      else if (cat === 'COMPLETED') acc.completed++;
      return acc;
    }, { live: 0, upcoming: 0, completed: 0 });
  }, [matches]);

  const filteredMatches = useMemo(() => {
    if (!matches) return [];
    if (filter === 'all') return matches;
    return matches.filter(m => getStatusCategory(m.status, m.date).toLowerCase() === filter);
  }, [matches, filter]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#060910]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#060910]">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
          <p className="text-white font-bold">Failed to load matches.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12" style={{ background: D.bg, color: D.textPrimary }}>
      <div className="max-w-6xl mx-auto px-4 pt-10 space-y-8">
        {/* Hub Header */}
        <div className="flex flex-col gap-2">
          <h1 style={{ fontFamily: D.head, fontWeight: 800, fontSize: 'clamp(24px, 4vw, 36px)', textTransform: 'uppercase', letterSpacing: '-0.02em', color: D.textPrimary }}>
            Match Center
          </h1>
          <p style={{ fontFamily: D.body, color: D.textSecondary, fontSize: 14 }}>
            Live scores, upcoming fixtures, and comprehensive results history.
          </p>
        </div>

        {/* Quick Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.xl, padding: 20 }} className="flex items-center justify-between">
            <div>
              <div style={{ fontFamily: D.head, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: D.rose, letterSpacing: '0.1em' }}>In Progress</div>
              <div style={{ fontFamily: D.mono, fontSize: 32, fontWeight: 700, marginTop: 4 }}>{stats.live}</div>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center animate-pulse" style={{ background: `${D.rose}15` }}>
              <Activity className="w-6 h-6" style={{ color: D.rose }} />
            </div>
          </div>
          <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.xl, padding: 20 }} className="flex items-center justify-between">
            <div>
              <div style={{ fontFamily: D.head, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: D.sky, letterSpacing: '0.1em' }}>Upcoming Fixtures</div>
              <div style={{ fontFamily: D.mono, fontSize: 32, fontWeight: 700, marginTop: 4 }}>{stats.upcoming}</div>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${D.sky}15` }}>
              <CalendarDays className="w-6 h-6" style={{ color: D.sky }} />
            </div>
          </div>
          <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.xl, padding: 20 }} className="flex items-center justify-between">
            <div>
              <div style={{ fontFamily: D.head, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: D.emerald, letterSpacing: '0.1em' }}>Completed Matches</div>
              <div style={{ fontFamily: D.mono, fontSize: 32, fontWeight: 700, marginTop: 4 }}>{stats.completed}</div>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${D.emerald}15` }}>
              <Trophy className="w-6 h-6" style={{ color: D.emerald }} />
            </div>
          </div>
        </div>

        {/* Main List */}
        <div className="space-y-6">
          <Tabs value={filter} onValueChange={(v: any) => setFilter(v)} className="w-full">
            <TabsList style={{ background: D.surf1, border: `1px solid ${D.border}`, padding: 4, borderRadius: D.lg, height: 'auto' }}>
              <TabsTrigger value="all" className="rounded-md text-xs font-bold uppercase tracking-wider px-6 py-2.5 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">All</TabsTrigger>
              <TabsTrigger value="live" className="rounded-md text-xs font-bold uppercase tracking-wider px-6 py-2.5 data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Live
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="rounded-md text-xs font-bold uppercase tracking-wider px-6 py-2.5 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-400">Upcoming</TabsTrigger>
              <TabsTrigger value="completed" className="rounded-md text-xs font-bold uppercase tracking-wider px-6 py-2.5 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-4">
            {filteredMatches.map(match => {
              const cat = getStatusCategory(match.status, match.date);
              const isLive = cat === 'LIVE';
              const isComp = cat === 'COMPLETED';
              
              const badgeColor = isLive ? D.rose : isComp ? D.emerald : D.sky;
              const badgeBg = isLive ? `${D.rose}15` : isComp ? `${D.emerald}15` : `${D.sky}15`;

              return (
                <Link key={match.id} href={`/matches/${match.id}`}>
                  <Card style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.xl }} className="hover:border-indigo-500/30 transition-all hover:bg-[#151d2e]/60 group">
                    <CardContent className="p-0 flex flex-col md:flex-row">
                      {/* Left: Date & Status */}
                      <div className="p-6 border-b md:border-b-0 md:border-r border-white/5 md:w-[200px] flex flex-col justify-center shrink-0">
                        <div style={{ fontFamily: D.head, fontSize: 13, fontWeight: 700, color: D.textPrimary }}>
                          {match.displayDate}
                        </div>
                        <div style={{ fontFamily: D.mono, fontSize: 12, color: D.textMuted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock className="w-3 h-3" /> {match.time}
                        </div>
                        <div className="mt-4 inline-block">
                          <span style={{ background: badgeBg, color: badgeColor, border: `1px solid ${badgeColor}33`, padding: '4px 10px', borderRadius: 4, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }} className={isLive ? 'animate-pulse' : ''}>
                            {isLive ? 'LIVE' : isComp ? 'RESULT' : 'UPCOMING'}
                          </span>
                        </div>
                      </div>

                      {/* Center: Teams & Scores */}
                      <div className="p-6 flex-1 flex flex-col justify-center">
                        <div className="flex flex-col gap-4">
                          <div className="flex justify-between items-center group/team">
                            <span style={{ fontFamily: D.head, fontSize: 16, fontWeight: 700, color: D.textPrimary }}>{match.homeTeamName}</span>
                            {(isLive || isComp) && match.score?.home && (
                              <span style={{ fontFamily: D.mono, fontSize: 16, fontWeight: 700 }}>{match.score.home}</span>
                            )}
                          </div>
                          <div className="flex justify-between items-center group/team">
                            <span style={{ fontFamily: D.head, fontSize: 16, fontWeight: 700, color: D.textPrimary }}>{match.awayTeamName}</span>
                            {(isLive || isComp) && match.score?.away && (
                              <span style={{ fontFamily: D.mono, fontSize: 16, fontWeight: 700 }}>{match.score.away}</span>
                            )}
                          </div>
                        </div>

                        {match.result && (
                          <div style={{ marginTop: 16, fontSize: 12, fontFamily: D.body, color: D.indigo, fontWeight: 500 }}>
                            {match.result}
                          </div>
                        )}
                      </div>

                      {/* Right: Meta & Action */}
                      <div className="p-6 border-t md:border-t-0 md:border-l border-white/5 md:w-[220px] flex flex-row md:flex-col justify-between items-center md:items-end shrink-0 bg-black/10">
                        <div className="flex flex-col gap-2 w-full">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: D.textMuted, fontSize: 11, fontFamily: D.body }}>
                            <MapPin className="w-3 h-3" /> <span className="truncate">{match.location}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: D.textMuted, fontSize: 11, fontFamily: D.body }}>
                            <Trophy className="w-3 h-3" /> {match.matchType} • {match.ageGroup}
                          </div>
                        </div>

                        <div className="mt-4 md:mt-auto">
                          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-white/5 group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-colors">
                            <ChevronRight className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
            
            {filteredMatches.length === 0 && (
              <div className="text-center py-20 bg-[#0f1621] rounded-2xl border border-white/5">
                <p style={{ color: D.textMuted, fontFamily: D.body }}>No matches found for this filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
