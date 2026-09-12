"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Calendar, Trophy, Activity, ArrowRight, Bell, Loader2 } from "lucide-react";
import { getAnalyticsDataAction, AnalyticsData } from "@/app/actions/analyticsActions";
import { fetchUpcomingMatches } from "@/lib/firestore";
import { Match } from "@/types/firestore";
import Link from "next/link";
import { TopPerformersList } from "@/components/analytics/TopPerformersList";
import { useDashboard } from "@/contexts/DashboardContext";
import { D } from "@/lib/design-system";
import { motion, AnimatePresence } from "framer-motion";

interface SmartDailyBriefingProps {
  userName?: string;
  role?: string;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function SmartDailyBriefing({ userName, role }: SmartDailyBriefingProps) {
  const { filters } = useDashboard();

  const analyticsQuery = useQuery({
    queryKey: ['analytics-data'],
    queryFn: () => getAnalyticsDataAction(),
  });
  const upcomingQuery = useQuery({
    queryKey: ['matches', 'upcoming-client', 5],
    queryFn: () => fetchUpcomingMatches(5),
  });

  const loading = analyticsQuery.isLoading || upcomingQuery.isLoading;
  const analytics: AnalyticsData | null =
    analyticsQuery.data?.success && analyticsQuery.data.data ? analyticsQuery.data.data : null;

  // Insights are derived, not fetched: a filter change recomputes them from
  // cached data instead of re-running the analytics action.
  const readinessAlerts = useMemo(() => {
    if (!analytics) return [] as string[];
    const matches: Match[] = upcomingQuery.data ?? [];
    const alerts: string[] = [];
    const pendingMatches = matches.filter(m => {
      const isHomeConfirmed = !!m.teamSelection?.home?.confirmedAt;
      const isAwayConfirmed = !!m.teamSelection?.away?.confirmedAt;
      return !isHomeConfirmed || !isAwayConfirmed;
    });
    if (pendingMatches.length > 0) {
      alerts.push(`warning:${pendingMatches.length} upcoming matches with pending team confirmations.`);
    }
    if (analytics.topRunScorers.length > 0) {
      const topScorer = analytics.topRunScorers[0];
      alerts.push(`insight:${topScorer.name} leads the run chart with ${topScorer.value} runs this season.`);
    }
    if (filters.schoolId !== 'all') {
      alerts.push(`insight:Currently showing insights tailored for your selected institution.`);
    }
    return alerts;
  }, [analytics, upcomingQuery.data, filters.schoolId]);

  if (loading) {
    return (
      <div
        className="rounded-2xl border p-8 flex flex-col items-center justify-center gap-3 transition-all"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
        <p className="text-xs font-semibold text-slate-400">Syncing Operational Matrix...</p>
      </div>
    );
  }

  const roleLabel = role
    ? role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-in fade-in duration-500">
      {/* ── Main Strategic Briefing Card ── */}
      <div
        className="lg:col-span-2 rounded-2xl border overflow-hidden relative group shadow-xl p-6 md:p-8"
        style={{
          background: D.surf1,
          borderColor: D.border,
        }}
      >
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-700" aria-hidden="true">
          <Sparkles className="h-32 w-32 text-indigo-400" />
        </div>

        <div className="relative z-10 space-y-6">
          {/* Header & Greeting */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Strategic Intelligence</span>
            </div>

            <h2
              className="text-lg md:text-xl font-bold text-white tracking-tight"
              style={{ fontFamily: D.head }}
            >
              {getGreeting()}, <span className="text-indigo-400">{userName || 'Coach'}</span>
            </h2>

            {roleLabel && (
              <p className="text-xs font-medium text-slate-400 flex items-center gap-2" style={{ fontFamily: D.sans }}>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Active Scope: <span className="text-slate-200 font-semibold">{roleLabel}</span> · 2026 Intelligence Cycle
              </p>
            )}
          </div>

          {/* Strategic Alerts Feed */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {readinessAlerts.length > 0 ? (
                readinessAlerts.map((alert, idx) => {
                  const isWarning = alert.startsWith('warning:');
                  const text = alert.replace(/^(warning|insight):/, '');
                  const accentColor = isWarning ? D.amber : D.indigo;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group flex items-center gap-3.5 p-3.5 rounded-xl border transition-all hover:border-indigo-500/30"
                      style={{
                        background: D.surf2,
                        borderColor: D.border,
                      }}
                    >
                      <div
                        className="shrink-0 rounded-lg p-2 border"
                        style={{ 
                          background: `${accentColor}15`, 
                          borderColor: `${accentColor}30`,
                          color: accentColor 
                        }}
                      >
                        {isWarning ? <Bell className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                      </div>
                      <p className="text-xs font-semibold text-slate-200 leading-normal flex-1" style={{ fontFamily: D.sans }}>
                        {text}
                      </p>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-slate-400"
                      />
                    </motion.div>
                  );
                })
              ) : (
                <div
                  className="p-4 rounded-xl border flex items-center gap-3"
                  style={{ background: D.surf2, borderColor: D.border }}
                >
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-xs font-semibold text-slate-300" style={{ fontFamily: D.sans }}>
                    Operational Stability Confirmed. No immediate interventions required.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/analytics">
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-md hover:opacity-90 active:scale-95"
                style={{ background: D.indigo, fontFamily: D.sans }}
              >
                <Activity className="h-4 w-4" />
                Performance Audit
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link href="/matches/add">
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-slate-200 border transition-all hover:bg-white/5 active:scale-95"
                style={{
                  fontFamily: D.sans,
                  borderColor: D.border,
                  background: D.surf2,
                }}
              >
                <Calendar className="h-4 w-4 text-amber-400" />
                Initialize Match
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Right: Performers Matrix ── */}
      <div className="space-y-4">
        {analytics && analytics.topRunScorers.length > 0 && (
          <TopPerformersList
            title="SQUAD RUN MATRIX"
            performers={analytics.topRunScorers.slice(0, 3)}
            icon={<Trophy className="h-4 w-4 text-amber-400" />}
          />
        )}
        {analytics && analytics.topWicketTakers.length > 0 && (
          <TopPerformersList
            title="SQUAD STRIKE MATRIX"
            performers={analytics.topWicketTakers.slice(0, 3)}
            icon={<Activity className="h-4 w-4 text-emerald-400" />}
          />
        )}
      </div>
    </div>
  );
}
