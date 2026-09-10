"use client";

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../dashboard/PageHeader';
import MetricCard from '../dashboard/MetricCard';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { ClipboardList, Shield, CalendarDays, Users, ChevronRight, CheckCircle2, History, Activity, AlertCircle, TrendingUp, ShieldCheck, Zap, ArrowUpRight } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <Activity className="h-12 w-12 animate-spin" style={{ color: D.indigo }} />
        <p className="text-[12px] font-black uppercase tracking-[0.4em] italic opacity-40" style={{ color: D.textMuted }}>SYNCHRONIZING DEPARTMENTAL OPS...</p>
      </div>
    );
  }

  const STATUS_COLOURS = {
    ready: { bg: `${D.emerald}10`, text: D.emerald, border: `${D.emerald}30`, glow: D.emerald },
    pending: { bg: `${D.amber}10`, text: D.amber, border: `${D.amber}30`, glow: D.amber },
    critical: { bg: `${D.rose}10`, text: D.rose, border: `${D.rose}30`, glow: D.rose },
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Strategic Command Header */}
      <div className="relative p-8 rounded-[2.5rem] border overflow-hidden shadow-2xl" 
           style={{ background: D.surf1, borderColor: D.border }}>
        <div className="absolute inset-0 opacity-10" style={{ background: D.gradMain }} />
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="h-20 w-20 rounded-2xl flex items-center justify-center shadow-inner group" 
               style={{ background: D.surf2, border: `1px solid ${D.border}` }}>
             <Shield className="h-10 w-10 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic" style={{ fontFamily: D.head, color: D.textPrimary }}>
              SPORTS <span style={{ color: D.indigo }}>MASTER</span>
            </h1>
            <p className="text-[12px] font-black uppercase tracking-[0.4em] mt-3 opacity-60 italic" style={{ color: D.textMuted }}>
                INSTITUTION: {person?.schoolId?.toUpperCase() || 'UNALLOCATED'} · OPERATIONAL CLEARANCE: LEVEL 5
            </p>
          </div>
          <div className="md:ml-auto flex gap-4 w-full md:w-auto">
             <Button variant="outline" className="flex-1 md:flex-none rounded-2xl font-black text-[10px] uppercase tracking-widest px-8 h-12 border transition-all hover:bg-black/5" style={{ background: D.surf2 }}>DEPARTMENT LOGS</Button>
             <Button className="flex-1 md:flex-none rounded-2xl font-black text-[10px] uppercase tracking-widest px-10 h-12 shadow-2xl border border-indigo-500/50" style={{ background: D.indigo, color: 'white' }}>CREATE FIXTURE</Button>
          </div>
        </div>
      </div>

       {/* Performance Matrix */}
       <div className="space-y-8">
        <SectionHeader title="DEPARTMENT OVERVIEW" sub="REAL-TIME INSTITUTIONAL CAPACITY & FIXTURE VELOCITY" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={Shield} label="TOTAL TEAMS" value={stats?.teamCount || 0} subtitle="ACTIVE DIVISION SQUADS" color={D.indigo} />
          <MetricCard icon={CalendarDays} label="UPCOMING FIXTURES" value={stats?.upcomingFixtures || 0} subtitle="NEXT 30-DAY OPERATIONAL CYCLE" color={D.emerald} />
          <MetricCard icon={Users} label="ACTIVE COACHES" value={stats?.coachCount || 0} subtitle="ALLOCATED STAFF UNITS" color={D.amber} />
          <MetricCard icon={CheckCircle2} label="OPS COMPLETED" value={stats?.completedFixtures || 0} subtitle="CURRENT SEASON BATCH" color={D.sky} />
        </div>
      </div>

      {/* Strategic Match Readiness Board */}
      <div
        className="overflow-hidden rounded-[2.5rem] border shadow-2xl flex flex-col"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        <div
          className="flex flex-row items-center justify-between p-8 border-b"
          style={{ borderColor: D.border, background: D.surf2 }}
        >
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight italic" style={{ fontFamily: D.head, color: D.textPrimary }}>READINESS STATUS BOARD</h3>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1" style={{ color: D.textMuted }}>OPERATIONAL HEALTH FOR UPCOMING FIXTURE CYCLES</p>
          </div>
          <Button variant="ghost" className="h-10 text-[10px] font-black uppercase tracking-[0.2em] px-6 rounded-xl border" style={{ color: D.indigo, background: D.surf1, borderColor: D.border }}>
            FULL BOARD MONITOR
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: `1px solid ${D.border}`, background: D.surf2 }}>
                {['MATCHUP', 'SQUAD', 'VENUE', 'TRANSPORT', 'OFFICIALS', 'OPS'].map((col) => (
                  <th
                    key={col}
                    className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]"
                    style={{ fontFamily: D.head, color: D.textMuted }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {readiness.slice(0, 5).map((fixture, i) => (
                <motion.tr
                  key={fixture.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group transition-colors hover:bg-black/5"
                  style={{ borderBottom: `1px solid ${D.border}` }}
                >
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-black uppercase italic tracking-tighter" style={{ color: D.textPrimary }}>{fixture.homeTeam} vs {fixture.awayTeam}</span>
                      <div className="flex items-center gap-2">
                        <CalendarDays size={10} className="text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: D.textMuted }}>{new Date(fixture.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </td>
                  {(['squad', 'venue', 'transport', 'officials'] as const).map((key) => {
                    const status = (fixture.readiness[key] === 'ready' ? 'ready' : fixture.readiness[key] === 'pending' ? 'pending' : 'critical') as keyof typeof STATUS_COLOURS;
                    const c = STATUS_COLOURS[status];
                    return (
                      <td key={key} className="px-8 py-6">
                        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border shadow-sm transition-all group-hover:shadow-[0_0_15px_-5px_rgba(255,255,255,0.1)]"
                             style={{ background: c.bg, borderColor: c.border }}>
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px]" style={{ background: c.text, boxShadow: `0 0 10px ${c.glow}` }} />
                            <span className="text-[9px] font-black uppercase tracking-[0.15em] italic" style={{ color: c.text }}>{fixture.readiness[key]?.toUpperCase()}</span>
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-8 py-6">
                    <button
                      className="h-10 w-10 rounded-xl flex items-center justify-center transition-all bg-black/5 border border-white/5 hover:border-indigo-500/50 group/btn"
                      style={{ color: D.textMuted }}
                    >
                      <ArrowUpRight className="h-4 w-4 group-hover/btn:text-indigo-500 transition-colors" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Content Grid Integration */}
      <div className="grid gap-10 md:grid-cols-5 lg:grid-cols-7">
        {/* Division League Integration (4/7) */}
        <div
          className="lg:col-span-4 overflow-hidden rounded-[2.5rem] border shadow-2xl flex flex-col"
          style={{ background: D.surf1, borderColor: D.border }}
        >
          <div
            className="flex flex-row items-center justify-between p-8 border-b"
            style={{ borderColor: D.border, background: D.surf2 }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl border border-white/5 opacity-40">
                  <TrendingUp size={20} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight italic" style={{ fontFamily: D.head, color: D.textPrimary }}>DIVISION STANDINGS</h3>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1" style={{ color: D.textMuted }}>ACTIVE COMPETITION RECAP</p>
              </div>
            </div>
            <Button variant="ghost" className="h-10 text-[10px] font-black uppercase tracking-[0.2em] px-6 rounded-xl border" style={{ color: D.indigo, background: D.surf1, borderColor: D.border }}>
              FULL TABLE
            </Button>
          </div>
          <div className="p-8">
            <LeagueTable standings={mockStandings} />
          </div>
        </div>

        {/* OS Event Topology Stream (3/7) */}
        <div
          className="lg:col-span-3 overflow-hidden rounded-[2.5rem] border shadow-2xl flex flex-col"
          style={{ background: D.surf1, borderColor: D.border }}
        >
          <div
            className="flex flex-row items-center justify-between p-8 border-b"
            style={{ borderColor: D.border, background: D.surf2 }}
          >
            <div className="flex items-center gap-4">
               <div className="p-3 rounded-xl border border-white/5 opacity-40 shadow-inner">
                  <History size={20} className="text-indigo-500" />
               </div>
               <div>
                  <h3 className="text-xl font-black uppercase tracking-tight italic" style={{ fontFamily: D.head, color: D.textPrimary }}>OS EVENT STREAM</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1" style={{ color: D.textMuted }}>REAL-TIME SYSTEM AUDIT LOG</p>
               </div>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-1 rounded-full border border-emerald-500/20" style={{ background: `${D.emerald}08` }}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">LIVE</span>
            </div>
          </div>
          <div className="p-8 space-y-6 flex-1 overflow-y-auto max-h-[500px]">
             <AnimatePresence>
                {auditLogs.length > 0 ? (
                auditLogs.map((log, i) => (
                    <motion.div
                    key={log.id || i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative pl-8 pb-6 last:pb-0 border-l border-white/5"
                    >
                    <div
                        className="absolute left-[-4.5px] top-1.5 w-2 h-2 rounded-full shadow-[0_0_10px]"
                        style={{ background: D.indigo, boxShadow: `0 0 10px ${D.indigo}` }}
                    />
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                        <span
                            className="text-[9px] font-black uppercase tracking-[0.25em] italic"
                            style={{ color: D.indigo }}
                        >
                            {log.actionType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[9px] font-bold opacity-30" style={{ color: D.textMuted }}>
                            {log.timestamp && format(new Date(log.timestamp.seconds * 1000), 'HH:mm:ss')}
                        </span>
                        </div>
                        <p className="text-[13px] font-bold tracking-tight leading-snug" style={{ color: D.textPrimary }}>{log.description.toUpperCase()}</p>
                        <div className="flex items-center gap-2 opacity-40">
                             <Zap size={10} className="text-amber-500" />
                             <span className="text-[9px] font-black uppercase tracking-widest">ACTOR: {log.actorName.toUpperCase()}</span>
                        </div>
                    </div>
                    </motion.div>
                ))
                ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-20" style={{ color: D.textMuted }}>
                    <Activity className="w-12 h-12 mb-4 animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">SYSTEM TOPOLOGY STABLE</p>
                </div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Fixture Centre Integration */}
      <div className="space-y-6">
        <SectionHeader title="MATCH MONITOR" sub="INSTITUTIONAL FIXTURE HUB & SCHEDULING INTERFACE" />
        <FixtureCentreCard role="Sports-Master" maxMatches={3} schoolId={person?.schoolId} />
      </div>
    </div>
  );
}
