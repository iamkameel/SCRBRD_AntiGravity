"use client";

import { usePermissions } from "@/lib/auth/usePermissions";
import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Trophy, Activity, ArrowRight, Clock, ChevronRight, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import { Match } from "@/types/firestore";
import {
  getLiveMatchesAction,
  getRecentMatchesAction,
  getUpcomingMatchesAction
} from "@/app/actions/matchActions";
import {
  filterMatchesByRole,
  getMatchStatusColor,
  getMatchStatusText,
  formatMatchDateTime,
  getMatchScore,
  RoleContext
} from "@/lib/utils/fixtureUtils";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/contexts/DashboardContext";
import { D } from "@/lib/design-system";
import { motion, AnimatePresence } from "framer-motion";

interface FixtureCentreCardProps {
  role: string;
  teamId?: string;
  schoolId?: string;
  playerId?: string;
  assignedMatches?: string[];
  fieldId?: string;
  maxMatches?: number;
  className?: string;
}

export default function FixtureCentreCard({
  role,
  teamId,
  schoolId,
  playerId,
  assignedMatches,
  fieldId,
  maxMatches = 5,
  className
}: FixtureCentreCardProps) {
  const { canAccess } = usePermissions();
  const [activeTab, setActiveTab] = useState<string>("live");
  const autoSwitched = useRef(false);

  const { filters } = useDashboard();

  const mergedSchoolId = filters.schoolId !== 'all' ? filters.schoolId : schoolId;
  const mergedSeasonId = filters.seasonId !== 'all' ? filters.seasonId : undefined;

  const roleContext = useMemo<RoleContext>(() => ({
    teamId,
    schoolId: mergedSchoolId,
    playerId,
    assignedMatches,
    seasonId: mergedSeasonId
  }), [teamId, mergedSchoolId, playerId, assignedMatches, mergedSeasonId]);

  // Server data is fetched once per key and shared by any other component
  // using the same key; role/school scoping is applied client-side below.
  const liveQuery = useQuery({
    queryKey: ['matches', 'live'],
    queryFn: getLiveMatchesAction,
    refetchInterval: 30_000,
    staleTime: 0,
  });
  const recentQuery = useQuery({
    queryKey: ['matches', 'recent', maxMatches * 2],
    queryFn: () => getRecentMatchesAction(maxMatches * 2),
  });
  const upcomingQuery = useQuery({
    queryKey: ['matches', 'upcoming', maxMatches * 2],
    queryFn: () => getUpcomingMatchesAction(maxMatches * 2),
  });

  const loading = liveQuery.isLoading || recentQuery.isLoading || upcomingQuery.isLoading;

  const liveMatches = useMemo(
    () => filterMatchesByRole(liveQuery.data ?? [], role, roleContext),
    [liveQuery.data, role, roleContext]
  );
  const recentMatches = useMemo(
    () => filterMatchesByRole(recentQuery.data ?? [], role, roleContext).slice(0, maxMatches),
    [recentQuery.data, role, roleContext, maxMatches]
  );
  const upcomingMatches = useMemo(
    () => filterMatchesByRole(upcomingQuery.data ?? [], role, roleContext).slice(0, maxMatches),
    [upcomingQuery.data, role, roleContext, maxMatches]
  );

  // On first load, land the user on a tab that has content.
  useEffect(() => {
    if (loading || autoSwitched.current) return;
    autoSwitched.current = true;
    if (liveMatches.length === 0) {
      if (upcomingMatches.length > 0) setActiveTab('upcoming');
      else if (recentMatches.length > 0) setActiveTab('results');
    }
  }, [loading, liveMatches.length, upcomingMatches.length, recentMatches.length]);

  const renderMatchList = (matches: Match[], type: 'live' | 'results' | 'upcoming') => {
    if (loading) {
      return (
        <div className="space-y-4 py-8">
           {[1, 2, 3].map((i) => (
             <div
               key={`skeleton-${i}`}
               className="h-24 rounded-2xl animate-pulse"
               style={{ background: D.surf2, border: `1px solid ${D.border}` }}
             />
           ))}
        </div>
      );
    }

    const query = type === "live" ? liveQuery : type === "results" ? recentQuery : upcomingQuery;
    if (query.isError) return <div role="alert" className="py-10 text-center"><p className="text-sm text-muted-foreground">We couldn’t load these matches.</p><Button variant="outline" className="mt-3" onClick={() => query.refetch()}>Try again</Button></div>;

    if (matches.length === 0) {
      return (
        <div className="py-16 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center gap-4 mt-6" style={{ background: D.surf2, borderColor: D.border }}>
          <div className="h-12 w-12 rounded-xl flex items-center justify-center border shadow-inner" style={{ background: D.surf1, border: `1px solid ${D.border}` }}>
            <Activity className="h-6 w-6 opacity-30 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground" style={{ fontFamily: D.sans }}>
                {type === 'live' ? 'No live matches right now' : type === 'results' ? 'No results yet' : 'No upcoming fixtures'}
            </p>
            <p className="text-[11px] font-normal text-muted-foreground mt-1 opacity-70 px-8" style={{ fontFamily: D.sans }}>
                Try another season or school, or browse all fixtures.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-3 mt-6">
        <AnimatePresence mode="popLayout">
          {matches.map((match, idx) => (
            <motion.div
              key={`${match.id}-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ delay: idx * 0.04 }}
            >
              <Link href={`/matches/${match.id}`} className="block group">
                <div
                  className="flex items-center justify-between p-4 sm:p-5 rounded-xl border transition-all relative overflow-hidden group-hover:border-white/20 group-hover:bg-white/[0.02]"
                  style={{ background: D.surf2, border: `1px solid ${D.border}` }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity pointer-events-none" style={{ background: `linear-gradient(90deg, ${type === 'live' ? D.rose : D.indigo}, transparent)` }} />

                  {/* Strategic Scoring Hub */}
                  <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-8 items-center">
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate block group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors" style={{ fontFamily: D.sans }}>
                        {match.homeTeamName}
                      </span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mt-0.5" style={{ fontFamily: D.sans }}>Home</span>
                    </div>

                    <div className="flex flex-col items-center min-w-[110px]">
                      {type === 'upcoming' ? (
                        <div
                          className="px-4 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 border bg-slate-100 dark:bg-slate-900/60"
                          style={{ borderColor: D.border }}
                        >
                          VS
                        </div>
                      ) : (
                        <div
                          className="text-sm sm:text-base font-bold tracking-tight px-4 py-1.5 rounded-lg border flex items-center gap-2 transition-transform group-hover:scale-105"
                          style={{
                            background: type === 'live' ? `${D.rose}15` : D.surf1,
                            color: type === 'live' ? D.rose : D.textPrimary,
                            borderColor: type === 'live' ? `${D.rose}30` : D.border,
                            fontFamily: D.mono
                          }}
                        >
                          {getMatchScore(match)}
                        </div>
                      )}
                    </div>

                    <div className="text-left">
                      <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate block group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors" style={{ fontFamily: D.sans }}>
                        {match.awayTeamName}
                      </span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mt-0.5" style={{ fontFamily: D.sans }}>Away</span>
                    </div>
                  </div>

                  {/* Operational Status Panel */}
                  <div className="hidden lg:flex flex-col items-end ml-6 min-w-[160px] pl-6 border-l" style={{ borderColor: D.border }}>
                    <div className="flex items-center gap-2">
                      {type === 'live' && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: D.rose }}></span>
                          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: D.rose }}></span>
                        </span>
                      )}
                      <span className="text-xs font-bold" style={{ color: type === 'live' ? D.rose : D.textPrimary, fontFamily: D.sans }}>
                        {type === 'upcoming' ? formatMatchDateTime(match) : getMatchStatusText(match.status, match.state)}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1.5" style={{ fontFamily: D.sans }}>
                      <MapPin className="h-3 w-3 text-slate-500" />
                      {match.venue || 'TBA'}
                    </div>
                  </div>

                  <div className="ml-5 p-2 rounded-lg transition-all group-hover:translate-x-1" style={{ background: D.surf1, color: D.textMuted, border: `1px solid ${D.border}` }}>
                    <ChevronRight className="h-4 w-4 opacity-70 group-hover:opacity-100 group-hover:text-indigo-500 transition-all" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div
      className={cn("rounded-2xl border shadow-lg overflow-hidden transition-all duration-300", className)}
      style={{ background: D.surf1, borderColor: D.border }}
    >
      {/* Header */}
      <div className="p-6 md:p-8 pb-5 relative overflow-hidden border-b" style={{ borderColor: D.border, background: D.surf2 }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3" style={{ fontFamily: D.head }}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm"
                style={{ background: `${D.indigo}15`, border: `1px solid ${D.indigo}30`, color: "hsl(var(--primary))" }}
              >
                <Activity className="h-5 w-5" />
              </div>
              Match centre
            </h2>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1.5 flex items-center gap-2" style={{ fontFamily: D.sans }}>
              <Clock className="w-3.5 h-3.5 text-indigo-500" /> Live scores, upcoming fixtures and recent results
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            {canAccess("scoring") && (
              <Button
                variant="outline"
                className="flex-1 md:flex-none rounded-xl font-semibold text-xs px-5 h-10 border hover:bg-white/5"
                style={{ background: D.surf1, borderColor: D.border, color: D.textPrimary }}
                asChild
            >
              <Link href="/fixtures/create">Create fixture</Link>
            </Button>
            )}
            <Button
                className="flex-1 md:flex-none rounded-xl font-semibold text-xs px-6 h-10 shadow-lg"

                asChild
            >
              <Link href="/fixtures">All fixtures</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-6 md:p-8 pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="p-1 rounded-xl border flex w-full" style={{ background: D.surf2, borderColor: D.border }}>
            {[
              { value: "live", label: "Live", icon: Activity, badge: liveMatches.length },
              { value: "results", label: "Results", icon: Trophy },
              { value: "upcoming", label: "Upcoming", icon: Calendar },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex-1 font-semibold text-xs gap-2 rounded-lg h-9 transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                style={{ fontFamily: D.sans }}
              >
                <tab.icon className="h-3.5 w-3.5"  />
                {tab.label}
                {tab.badge ? (
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: D.rose, color: 'white' }}>
                    {tab.badge}
                  </span>
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="focus-visible:outline-none">
            <TabsContent value="live" className="mt-0 outline-none">
              {renderMatchList(liveMatches, 'live')}
            </TabsContent>

            <TabsContent value="results" className="mt-0 outline-none">
              {renderMatchList(recentMatches, 'results')}
            </TabsContent>

            <TabsContent value="upcoming" className="mt-0 outline-none">
              {renderMatchList(upcomingMatches, 'upcoming')}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
