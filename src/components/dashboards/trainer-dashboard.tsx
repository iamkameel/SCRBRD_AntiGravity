"use client";

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../dashboard/PageHeader';
import { MetricCard } from '../dashboard/MetricCard';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { Dumbbell, Activity, Calendar, Users, Loader2, AlertCircle, ChevronRight, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { getTrainerPlayersAction } from "@/app/actions/trainerActions";
import { Person } from "@/types/firestore";
import { D } from "@/lib/design-system";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader } from "../ui/SectionHeader";

export default function TrainerDashboard() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      getTrainerPlayersAction(user.email)
        .then(setPlayers)
        .finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [user]);

  // Calculate stats
  const totalPlayers = players.length;
  const injuredPlayers = players.filter(p => p.status === 'injured');

  // Calculate average fitness (assuming 1-100 scale or similar)
  const fitnessScores = players
    .map(p => p.playerProfile?.physicalAttributes?.coreFitness || 0)
    .filter(s => s > 0);
  const avgFitness = fitnessScores.length > 0
    ? Math.round(fitnessScores.reduce((a, b) => a + b, 0) / fitnessScores.length)
    : 0;

  if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="h-10 w-10 animate-spin" style={{ color: D.indigo }} />
          <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: D.textMuted }}>Syncing Fitness Data Hub...</p>
        </div>
      );
  }

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="px-1">
        <PageHeader
          title="Trainer Terminal"
          description="Manage high-performance training protocols, individual workload, and strategic fitness readiness."
        />
      </div>

      {/* Fixture Centre */}
      <FixtureCentreCard
        role="Trainer"
        maxMatches={3}
      />

      {/* Strategic Performance Metrics */}
      <SectionHeader
        title="High-Performance Analytics"
        sub="Monitor absolute squad readiness and strategic fitness development."
        color={D.indigo}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:mt-[-1rem] mb-12">
        {[
          { icon: Dumbbell, label: "Active Sessions", value: "04", subtitle: "Scheduled Today", color: D.indigo },
          { icon: Activity, label: "Squad Fitness", value: `${avgFitness}%`, subtitle: "Global Team Average", color: D.emerald },
          { icon: AlertCircle, label: "Injury Count", value: injuredPlayers.length, subtitle: injuredPlayers.length > 0 ? "REQUIRES INTERVENTION" : "ALL SYSTEMS GREEN", color: injuredPlayers.length > 0 ? D.rose : D.textMuted },
          { icon: Users, label: "Total Roster", value: totalPlayers, subtitle: "Assigned Athletes", color: D.sky },
        ].map((stat, i) => (
          <MetricCard key={i} {...stat} />
        ))}
      </div>

      {/* High-Impact Alert Grid */}
      <AnimatePresence>
        {injuredPlayers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-3xl overflow-hidden shadow-sm border"
            style={{ background: D.surf1, border: `1px solid ${D.rose}40` }}
          >
            <div className="p-8 pb-10 flex flex-row items-center justify-between" style={{ borderBottom: `1px solid ${D.rose}20`, background: `${D.rose}05` }}>
              <div>
                <h3 className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter italic" style={{ fontFamily: D.head, color: D.rose }}>
                  <AlertCircle className="h-6 w-6 animate-pulse" />
                  CRITICAL INJURY BOARD
                </h3>
                <p className="text-xs font-black uppercase tracking-widest mt-1 opacity-50" style={{ color: D.textMuted }}>Athletes currently restricted from maximum performance outputs</p>
              </div>
              <Badge className="font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-full" style={{ background: `${D.rose}20`, color: D.rose, border: `1px solid ${D.rose}30` }}>
                {injuredPlayers.length} ACTIVE CASES
              </Badge>
            </div>
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {injuredPlayers.map(player => (
                  <div
                    key={player.id}
                    className="group relative flex items-center justify-between p-5 rounded-2xl border transition-all"
                    style={{ background: D.surf2, border: `1px solid ${D.border}` }}
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className="h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg italic uppercase"
                        style={{ background: `${D.rose}10`, border: `1px solid ${D.rose}30`, color: D.rose }}
                      >
                        {(player.displayName || player.firstName)[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase italic tracking-tight" style={{ fontFamily: D.head, color: D.textPrimary }}>{player.displayName || `${player.firstName} ${player.lastName}`}</p>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-60" style={{ color: D.textMuted }}>{player.teamIds?.join(' • ') || 'INDEPENDENT ATHLETE'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 pr-2">
                      <Badge className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border-0" style={{ background: `${D.rose}15`, color: D.rose }}>RESTRICTED</Badge>
                      <div
                        className="p-3 rounded-full transition-all group-hover:scale-110 group-hover:translate-x-1"
                        style={{ background: D.surf1, color: D.textMuted }}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan & Focus Grid */}
      <SectionHeader
        title="Tactical Focus & Protocols"
        sub="Scheduled training cycles and domain-specific development drills."
        color={D.amber}
      />
      <div className="grid gap-8 md:grid-cols-2 lg:mt-[-1rem]">
        {/* Today's Operational Plan */}
        <div
          className="rounded-3xl overflow-hidden shadow-sm border flex flex-col"
          style={{ background: D.surf1, border: `1px solid ${D.border}` }}
        >
          <div className="p-8 border-b flex flex-row items-center justify-between" style={{ borderColor: D.border, background: D.surf2 }}>
            <h3 className="text-sm font-black flex items-center gap-4 uppercase tracking-tight" style={{ fontFamily: D.head, color: D.textPrimary }}>
              <Clock className="h-5 w-5" style={{ color: D.indigo }} />
              OPERATIONAL DRILL LOG
            </h3>
            <Button variant="ghost" className="h-9 font-black text-[11px] uppercase tracking-widest px-6 rounded-2xl border" style={{ borderColor: D.border, color: D.indigo, background: D.surf1 }}>
              VIEW ARCHIVE
            </Button>
          </div>
          <div className="p-6 space-y-4">
            {[
              { time: "06:00", period: "AM", title: "Conditioning Loop", subt: "High-Intensity Interval Training", icon: Activity },
              { time: "16:00", period: "PM", title: "Resistance Matrix", subt: "Core Structural Stability", icon: Dumbbell }
            ].map((session, i) => (
              <div
                key={i}
                className="group flex items-center p-6 rounded-2xl border transition-all"
                style={{ background: D.surf2, border: `1px solid ${D.border}` }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${D.indigo}40`)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = D.border)}
              >
                <div className="mr-8 text-center min-w-[70px] pr-8" style={{ borderRight: `1px solid ${D.border}` }}>
                  <div className="text-xl font-black italic tracking-tighter" style={{ fontFamily: D.head, color: D.textPrimary }}>{session.time}</div>
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: D.textMuted }}>{session.period}</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-black uppercase italic tracking-tight group-hover:translate-x-1 transition-transform" style={{ fontFamily: D.head, color: D.textPrimary }}>{session.title}</div>
                  <div className="text-xs font-bold uppercase tracking-widest opacity-40" style={{ color: D.textMuted }}>{session.subt}</div>
                </div>
                <div
                  className="p-4 rounded-2xl transition-all shadow-inner"
                  style={{ background: D.surf1, color: D.indigo, border: `1px solid ${D.border}` }}
                >
                  <session.icon className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Development Focus */}
        <div
          className="rounded-3xl overflow-hidden shadow-sm border flex flex-col"
          style={{ background: D.surf1, border: `1px solid ${D.border}` }}
        >
          <div className="p-8 border-b flex flex-row items-center justify-between" style={{ borderColor: D.border, background: D.surf2 }}>
            <h3 className="text-sm font-black flex items-center gap-4 uppercase tracking-tight" style={{ fontFamily: D.head, color: D.textPrimary }}>
              <Target className="h-5 w-5" style={{ color: D.amber }} />
              STRATEGIC DOMAIN DRILLS
            </h3>
            <Badge className="font-black text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-full" style={{ background: `${D.amber}15`, color: D.amber, border: `1px solid ${D.amber}30` }}>
              CYCLE 12
            </Badge>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: "Bowler Unit", focus: "Proprioception and landing velocity management.", icon: Activity, color: D.sky },
              { label: "Batting Collective", focus: "Kinetic chain efficiency in vertical rotations.", icon: Target, color: D.amber },
              { label: "Full Roster", focus: "Post-competitive metabolic recovery protocols.", icon: Dumbbell, color: D.indigo }
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border transition-all hover:bg-black/5"
                style={{ background: D.surf2, border: `1px solid ${D.border}` }}
              >
                <div className="flex items-center gap-3 mb-3">
                    <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    <span className="font-black uppercase tracking-[0.2em] text-[11px]" style={{ color: item.color }}>{item.label}</span>
                </div>
                <p className="text-[11px] font-bold tracking-tight uppercase leading-relaxed opacity-80" style={{ color: D.textPrimary }}>{item.focus}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
