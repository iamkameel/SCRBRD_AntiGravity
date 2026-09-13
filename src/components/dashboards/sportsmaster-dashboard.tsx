"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import MetricCard from '../dashboard/MetricCard';
import { Shield, CalendarDays, Users, CheckCircle2, History, Activity, TrendingUp, ArrowUpRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { fetchPersonByEmail } from '@/app/actions/personActions';
import { getSchoolStatsAction, getFixtureReadinessAction } from '@/app/actions/fixtureActions';
import { getRecentAuditLogsAction } from '@/app/actions/auditActions';
import { LeagueTable, LeagueStanding } from '../competitions/LeagueTable';
import { AuditLogEntry } from '@/lib/services/auditService';
import { format } from 'date-fns';
import { Person } from '@/types/firestore';
import { D } from '@/lib/design-system';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function SportsmasterDashboard() {
  const { user } = useAuth();
  const [person, setPerson] = useState<Person | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [readiness, setReadiness] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const mockStandings: LeagueStanding[] = [
    { teamId: '1', teamName: 'First XI', played: 12, won: 9, lost: 2, tied: 1, noResult: 0, points: 28, netRunRate: 1.45, recentForm: ['W', 'W', 'W', 'L', 'W'] },
    { teamId: '2', teamName: 'Second XI', played: 12, won: 7, lost: 4, tied: 0, noResult: 1, points: 22, netRunRate: 0.82, recentForm: ['W', 'L', 'W', 'W', 'L'] },
    { teamId: '3', teamName: 'U15A', played: 12, won: 6, lost: 6, tied: 0, noResult: 0, points: 18, netRunRate: -0.12, recentForm: ['L', 'W', 'L', 'L', 'W'] },
    { teamId: '4', teamName: 'U14A', played: 12, won: 4, lost: 7, tied: 1, noResult: 0, points: 14, netRunRate: -0.65, recentForm: ['L', 'L', 'W', 'L', 'L'] },
  ];

  useEffect(() => {
    const loadData = async () => {
      if (!user?.email) return;
      try {
        const profile = await fetchPersonByEmail(user.email);
        setPerson(profile);
        if (profile?.schoolId) {
          const [schoolStats, schoolReadiness, logs] = await Promise.all([
            getSchoolStatsAction(profile.schoolId),
            getFixtureReadinessAction(profile.schoolId),
            getRecentAuditLogsAction(profile.schoolId, 5),
          ]);
          setStats(schoolStats);
          setReadiness(schoolReadiness);
          setAuditLogs(logs || []);
        }
      } catch (error) {
        console.error("Error loading sportsmaster dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Activity className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-semibold text-muted-foreground">Synchronizing Departmental Ops...</p>
      </div>
    );
  }

  const STATUS_COLOURS = {
    ready: { bg: `${D.emerald}15`, text: D.emerald, border: `${D.emerald}30` },
    pending: { bg: `${D.amber}15`, text: D.amber, border: `${D.amber}30` },
    critical: { bg: `${D.rose}15`, text: D.rose, border: `${D.rose}30` },
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Strategic Command Header */}
      <div
        className="relative p-6 md:p-8 rounded-2xl border overflow-hidden shadow-sm"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        <div className="absolute inset-0 opacity-[0.05]" style={{ background: D.gradMain }} />
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center border shadow-sm shrink-0"
            style={{ background: D.surf2, borderColor: D.border }}
          >
             <Shield className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight" style={{ fontFamily: D.head }}>
              Sportsmaster <span className="text-primary">Command</span>
            </h1>
            <p className="text-xs font-medium text-muted-foreground" style={{ fontFamily: D.sans }}>
              Institution: <span className="text-foreground font-semibold uppercase">{person?.schoolId || 'Unallocated'}</span> · Operational Clearance Level 5
            </p>
          </div>
          <div className="md:ml-auto flex gap-3 w-full md:w-auto">
             <Button variant="outline" className="flex-1 md:flex-none rounded-xl font-bold text-xs px-4 h-10 border hover:bg-white/5 text-foreground" style={{ background: D.surf2, borderColor: D.border }}>
               Department Logs
             </Button>
             <Button className="flex-1 md:flex-none rounded-xl font-bold text-xs px-5 h-10 shadow-lg text-foreground" style={{ background: D.indigo }}>
               Create Fixture
             </Button>
          </div>
        </div>
      </div>

      {/* Performance Matrix */}
      <div className="space-y-4">
        <SectionHeader title="Department Overview" sub="Real-time institutional capacity & fixture velocity." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={Shield} label="TOTAL TEAMS" value={stats?.teamCount || 0} subtitle="Active squad units" color={D.indigo} />
          <MetricCard icon={CalendarDays} label="UPCOMING FIXTURES" value={stats?.upcomingFixtures || 0} subtitle="Next 30-day window" color={D.emerald} />
          <MetricCard icon={Users} label="ACTIVE COACHES" value={stats?.coachCount || 0} subtitle="Allocated staff" color={D.amber} />
          <MetricCard icon={CheckCircle2} label="COMPLETED OPS" value={stats?.completedFixtures || 0} subtitle="Current season batch" color={D.sky} />
        </div>
      </div>

      {/* Strategic Match Readiness Board */}
      <div
        className="overflow-hidden rounded-2xl border shadow-sm flex flex-col"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        <div
          className="flex flex-row items-center justify-between p-5 border-b"
          style={{ borderColor: D.border, background: D.surf2 }}
        >
          <div>
            <h3 className="text-base font-bold text-foreground tracking-tight" style={{ fontFamily: D.head }}>Readiness Status Board</h3>
            <p className="text-xs text-muted-foreground">Operational health for upcoming fixture cycles.</p>
          </div>
          <Button variant="ghost" className="h-8 text-xs font-semibold px-4 rounded-xl border border-white/10 text-primary hover:bg-white/5" style={{ background: D.surf1 }}>
            Full Monitor
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-muted-foreground text-xs font-bold uppercase tracking-wider" style={{ borderColor: D.border, background: D.surf2 }}>
                <th className="px-6 py-3.5">Matchup</th>
                <th className="px-6 py-3.5">Squad</th>
                <th className="px-6 py-3.5">Venue</th>
                <th className="px-6 py-3.5">Transport</th>
                <th className="px-6 py-3.5">Officials</th>
                <th className="px-6 py-3.5">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {readiness.slice(0, 5).map((fixture, i) => (
                <motion.tr
                  key={fixture.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground" style={{ fontFamily: D.head }}>{fixture.homeTeam} vs {fixture.awayTeam}</span>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                        <CalendarDays className="h-3 w-3 text-primary" />
                        <span>{new Date(fixture.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </td>
                  {(['squad', 'venue', 'transport', 'officials'] as const).map((key) => {
                    const status = (fixture.readiness[key] === 'ready' ? 'ready' : fixture.readiness[key] === 'pending' ? 'pending' : 'critical') as keyof typeof STATUS_COLOURS;
                    const c = STATUS_COLOURS[status];
                    return (
                      <td key={key} className="px-6 py-4">
                        <div
                          className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wider"
                          style={{ background: c.bg, borderColor: c.border, color: c.text }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.text }} />
                          <span>{fixture.readiness[key]}</span>
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-6 py-4">
                    <button className="h-8 w-8 rounded-lg flex items-center justify-center border border-white/10 hover:bg-white/10 text-muted-foreground transition-colors">
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Content Grid Integration */}
      <div className="grid gap-8 md:grid-cols-5 lg:grid-cols-7">
        {/* Division League Integration (4/7) */}
        <div
          className="lg:col-span-4 overflow-hidden rounded-2xl border shadow-sm flex flex-col"
          style={{ background: D.surf1, borderColor: D.border }}
        >
          <div
            className="flex flex-row items-center justify-between p-5 border-b"
            style={{ borderColor: D.border, background: D.surf2 }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg border border-white/10 bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground tracking-tight" style={{ fontFamily: D.head }}>Division Standings</h3>
                <p className="text-xs text-muted-foreground">Active competition summary.</p>
              </div>
            </div>
            <Button variant="ghost" className="h-8 text-xs font-semibold px-4 rounded-xl border border-white/10 text-primary hover:bg-white/5" style={{ background: D.surf1 }}>
              Full Table
            </Button>
          </div>
          <div className="p-6">
            <LeagueTable standings={mockStandings} />
          </div>
        </div>

        {/* OS Event Topology Stream (3/7) */}
        <div
          className="lg:col-span-3 overflow-hidden rounded-2xl border shadow-sm flex flex-col"
          style={{ background: D.surf1, borderColor: D.border }}
        >
          <div
            className="flex flex-row items-center justify-between p-5 border-b"
            style={{ borderColor: D.border, background: D.surf2 }}
          >
            <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg border border-white/10 bg-indigo-500/10 text-primary">
                  <History className="h-4 w-4" />
               </div>
               <div>
                  <h3 className="text-base font-bold text-foreground tracking-tight" style={{ fontFamily: D.head }}>OS Event Stream</h3>
                  <p className="text-xs text-muted-foreground">Real-time audit log.</p>
               </div>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE</span>
            </div>
          </div>
          <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[450px]">
             <AnimatePresence>
                {auditLogs.length > 0 ? (
                auditLogs.map((log, i) => (
                    <motion.div
                      key={log.id || i}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="relative pl-6 pb-4 last:pb-0 border-l border-white/10"
                    >
                    <div
                      className="absolute left-[-4.5px] top-1.5 w-2 h-2 rounded-full bg-indigo-400"
                    />
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                          {log.actionType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-slate-500">
                          {log.timestamp && format(new Date(log.timestamp.seconds * 1000), 'HH:mm:ss')}
                        </span>
                        </div>
                        <p className="text-xs font-semibold text-foreground">{log.description}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                             <Zap className="h-3 w-3 text-amber-400" />
                             <span>Actor: {log.actorName}</span>
                        </div>
                    </div>
                    </motion.div>
                ))
                ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                    <Activity className="w-8 h-8 mb-2 opacity-40 animate-pulse" />
                    <p className="text-xs font-medium">System topology stable.</p>
                </div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Quick Operations & Match Dispatcher */}
      <div className="space-y-4">
        <SectionHeader title="Quick Operations & Match Dispatch" sub="Direct operational shortcuts for departmental management." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/fixtures/create">
            <div
              className="p-4 rounded-2xl border flex flex-col gap-2 transition-all hover:border-indigo-500/50 hover:bg-white/[0.03] group cursor-pointer"
              style={{ background: D.surf1, borderColor: D.border }}
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-primary">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground tracking-tight" style={{ fontFamily: D.head }}>Schedule Fixture</h4>
                <p className="text-xs text-muted-foreground">Create & allocate venues</p>
              </div>
            </div>
          </Link>

          <Link href="/prematch">
            <div
              className="p-4 rounded-2xl border flex flex-col gap-2 transition-all hover:border-emerald-500/50 hover:bg-white/[0.03] group cursor-pointer"
              style={{ background: D.surf1, borderColor: D.border }}
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <Shield className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground tracking-tight" style={{ fontFamily: D.head }}>Pre-Match Cockpit</h4>
                <p className="text-xs text-muted-foreground">Readiness & team lineups</p>
              </div>
            </div>
          </Link>

          <Link href="/scoring">
            <div
              className="p-4 rounded-2xl border flex flex-col gap-2 transition-all hover:border-amber-500/50 hover:bg-white/[0.03] group cursor-pointer"
              style={{ background: D.surf1, borderColor: D.border }}
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
                  <Activity className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground tracking-tight" style={{ fontFamily: D.head }}>Live Scorer Console</h4>
                <p className="text-xs text-muted-foreground">Ball-by-ball match engine</p>
              </div>
            </div>
          </Link>

          <Link href="/coach/development">
            <div
              className="p-4 rounded-2xl border flex flex-col gap-2 transition-all hover:border-sky-500/50 hover:bg-white/[0.03] group cursor-pointer"
              style={{ background: D.surf1, borderColor: D.border }}
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-400">
                  <Users className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground tracking-tight" style={{ fontFamily: D.head }}>Coach & Skill Engine</h4>
                <p className="text-xs text-muted-foreground">Drill matrix & development</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
