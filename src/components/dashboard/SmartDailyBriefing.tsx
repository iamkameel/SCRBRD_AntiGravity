"use client";

import { useEffect, useState } from "react";
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
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { filters } = useDashboard();
  const [readinessAlerts, setReadinessAlerts] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [analyticsResult, upcomingMatches] = await Promise.all([
          getAnalyticsDataAction(),
          fetchUpcomingMatches(5),
        ]);
        if (analyticsResult.success && analyticsResult.data) {
          setAnalytics(analyticsResult.data);
          generateInsight(analyticsResult.data, upcomingMatches, filters);
        }
      } catch (error) {
        console.error("Failed to load briefing data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [filters]);

  const generateInsight = (data: AnalyticsData, matches: Match[], filters: any) => {
    const alerts: string[] = [];
    const pendingMatches = matches.filter(m => {
      const isHomeConfirmed = !!m.teamSelection?.home?.confirmedAt;
      const isAwayConfirmed = !!m.teamSelection?.away?.confirmedAt;
      return !isHomeConfirmed || !isAwayConfirmed;
    });
    if (pendingMatches.length > 0) {
      alerts.push(`warning:${pendingMatches.length} upcoming matches with pending team confirmations.`);
    }
    if (data.topRunScorers.length > 0) {
      const topScorer = data.topRunScorers[0];
      alerts.push(`insight:${topScorer.name} is leading with ${topScorer.value} runs this season.`);
    }
    if (filters.schoolId !== 'all') {
      alerts.push(`insight:Currently showing insights tailored for your selected institution.`);
    }
    setReadinessAlerts(alerts);
  };

  if (loading) {
    return (
      <div
        className="rounded-3xl border p-12 flex flex-col items-center justify-center gap-4 transition-all"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: D.indigo }} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: D.textMuted }}>Syncing Operational Matrix...</p>
      </div>
    );
  }

  const roleLabel = role
    ? role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 os-page animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Main Strategic Briefing Card ── */}
      <div
        className="lg:col-span-2 rounded-3xl border border-white/5 overflow-hidden relative group shadow-2xl"
        style={{
          background: `linear-gradient(165deg, ${D.surf1}, ${D.surf2})`,
          border: `1px solid ${D.border}`,
        }}
      >
        {/* Animated Background Pulse */}
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-1000" aria-hidden="true">
          <Sparkles className="h-40 w-40 animate-pulse" style={{ color: D.indigo }} />
        </div>

        <div className="relative z-10 p-8 md:p-10">
          {/* Strategic Insight Badge */}
          <div className="flex items-center gap-3 mb-6">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] tracking-[0.2em] uppercase font-black shadow-sm"
              style={{
                fontFamily: D.head,
                background: `${D.indigo}15`,
                borderColor: `${D.indigo}30`,
                color: D.indigo,
              }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Strategic Intelligence
            </span>
            <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${D.indigo}30, transparent)` }} />
          </div>

          {/* Personalized Greeting */}
          <h2
            className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase mb-2 leading-none"
            style={{
              fontFamily: D.head,
              color: D.textPrimary,
            }}
          >
            {getGreeting()}, <span style={{ color: D.indigo }}>{userName || 'COACH'}</span>!
          </h2>

          {/* Role-Specific Contextual Subline */}
          {roleLabel && (
            <p
              className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2"
              style={{
                fontFamily: D.body,
                color: D.textMuted,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: D.indigo }} />
              Active Terminal: <span className="text-foreground" style={{ color: D.textPrimary }}>{roleLabel}</span> · Global Intelligence Cycle 2026
            </p>
          )}

          {/* Strategic Alerts Feed */}
          <div className="space-y-4 mb-10">
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
                      className="group flex items-center gap-5 p-5 rounded-2xl border transition-all hover:translate-x-1 duration-300"
                      style={{
                        background: `${accentColor}05`,
                        borderColor: `${accentColor}15`,
                      }}
                    >
                      <div
                        className="shrink-0 rounded-xl p-3 transition-transform group-hover:scale-110 shadow-sm border"
                        style={{ 
                          background: `${accentColor}10`, 
                          borderColor: `${accentColor}20`,
                          color: accentColor 
                        }}
                      >
                        {isWarning ? <Bell className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
                      </div>
                      <p className="text-sm font-bold tracking-tight leading-relaxed uppercase" style={{ fontFamily: D.body, color: D.textPrimary }}>
                        {text}
                      </p>
                      <ArrowRight
                        className="h-5 w-5 shrink-0 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                        style={{ color: accentColor }}
                      />
                    </motion.div>
                  );
                })
              ) : (
                <div
                  className="p-6 rounded-2xl border flex items-center gap-4"
                  style={{ background: `${D.emerald}05`, borderColor: `${D.emerald}20` }}
                >
                  <div className="h-3 w-3 rounded-full animate-pulse" style={{ background: D.emerald }} />
                  <p className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ fontFamily: D.body, color: D.textPrimary }}>
                    Operational Stability Confirmed. No immediate interventions required.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Strategic Operational Commands */}
          <div className="flex flex-wrap gap-4">
            <Link href="/analytics">
              <button
                className="group inline-flex items-center gap-3 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/20"
                style={{ background: D.gradMain, fontFamily: D.head }}
              >
                <Activity className="h-4 w-4" />
                Performance Audit
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            <Link href="/matches/add">
              <button
                className="inline-flex items-center gap-3 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border transition-all hover:bg-black/5 active:scale-[0.98]"
                style={{
                  fontFamily: D.head,
                  borderColor: D.border,
                  color: D.textPrimary,
                  background: D.surf2,
                }}
              >
                <Calendar className="h-4 w-4" style={{ color: D.amber }} />
                Initialize Match
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Right: Performers Matrix ── */}
      <div className="space-y-6">
        {analytics && analytics.topRunScorers.length > 0 && (
          <TopPerformersList
            title="SQUAD RUN MATRIX"
            performers={analytics.topRunScorers.slice(0, 3)}
            icon={<Trophy className="h-4 w-4" style={{ color: D.amber }} />}
          />
        )}
        {analytics && analytics.topWicketTakers.length > 0 && (
          <TopPerformersList
            title="SQUAD STRIKE MATRIX"
            performers={analytics.topWicketTakers.slice(0, 3)}
            icon={<Activity className="h-4 w-4" style={{ color: D.emerald }} />}
          />
        )}
      </div>
    </div>
  );
}
