'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchPersonByEmail } from '@/app/actions/personActions';
import { fetchMatchesForTeams } from '@/app/actions/matchActions';
import { PersonDocument as Person, Match } from '@/types/schema_v4';
import { ROLES } from '@/lib/auth/rbac';
import {
  Activity,
  Users,
  Trophy,
  Calendar,
  ArrowRight,
  ChevronRight,
  Plus,
  Filter,
  Zap,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import FixtureCentreCard from '@/components/dashboard/FixtureCentreCard';
import MetricCard from '@/components/dashboard/MetricCard';
import { D } from '@/lib/design-system';
import { getCoachIntelligenceAction } from '@/app/actions/skillActions';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function CoachDashboard() {
  const { user } = useAuth();
  const [person, setPerson] = useState<Person | null>(null);
  const [matches, setMatches] = useState<{ upcoming: Match[]; past: Match[]; total: number }>({
    upcoming: [],
    past: [],
    total: 0,
  });
  const [intelligence, setIntelligence] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.email) return;
      try {
        const profile = await fetchPersonByEmail(user.email);
        setPerson(profile as any);
        const teamIds = profile?.teamIds || [];
        const [matchData, intelData] = await Promise.all([
          teamIds.length > 0
            ? fetchMatchesForTeams(teamIds)
            : Promise.resolve({ success: true, upcoming: [], past: [], total: 0 }),
          teamIds.length > 0
            ? getCoachIntelligenceAction(teamIds)
            : Promise.resolve({ success: true, data: null }),
        ]);
        if (matchData.success) {
          setMatches({
            upcoming: (matchData.upcoming || []) as any,
            past: (matchData.past || []) as any,
            total: matchData.total || 0,
          });
        }
        if (intelData.success) {
          setIntelligence(intelData.data);
        }
      } catch (error) {
        console.error('Error loading coach dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const activePlayers = intelligence?.playerReadiness?.length || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Activity className="h-8 w-8 animate-spin" style={{ color: D.indigo }} />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {/* OS Intelligence Banner — Strategic Unit */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-8 rounded-[2rem] border overflow-hidden shadow-2xl group"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        <div className="absolute inset-0 opacity-10 group-hover:opacity-[0.15] transition-opacity" style={{ background: D.gradMain }} />
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-inner shrink-0"
            style={{ background: D.surf2, border: `1px solid ${D.border}` }}
          >
            <Activity className="h-8 w-8 animate-pulse" style={{ color: D.indigo }} />
          </div>
          <div>
            <h3
              className="text-[11px] font-black uppercase tracking-[0.4em] italic leading-none mb-3"
              style={{ fontFamily: D.head, color: D.indigo }}
            >
              Intelligence Broadcast
            </h3>
            <p className="text-xl font-black uppercase tracking-tight italic" style={{ fontFamily: D.head, color: D.textPrimary }}>
              {intelligence?.watchlistFlags?.length > 0
                ? `${intelligence.watchlistFlags.length} CRITICAL PLAYER FLAGS DETECTED`
                : 'ALL SQUAD PARAMETERS WITHIN STABLE LIMITS'}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2 opacity-50" style={{ color: D.textMuted }}>
                SQUAD AT {intelligence?.avgReadiness || 0}% AGGREGATE CAPACITY · {intelligence?.availableCount || 0} OPERATIONAL ATHLETES
            </p>
          </div>
          <div className="md:ml-auto flex gap-3 w-full md:w-auto">
             <Button variant="outline" className="flex-1 md:flex-none rounded-xl font-black text-[9px] uppercase tracking-widest px-6 h-11 border transition-all hover:translate-y-[-2px] active:scale-95" style={{ background: D.surf2 }}>RESYNC DATA</Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Command Column (2/3) */}
        <div className="lg:col-span-2 space-y-12">
          {/* Performance Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <MetricCard
              icon={Users}
              label="SQUAD CAPACITY"
              value={activePlayers}
              subtitle={`${intelligence?.availableCount || 0} AVAILABLE · ${intelligence?.injuredCount || 0} INJURED`}
              color={D.indigo}
            />
            <MetricCard
              icon={TrendingUp}
              label="AVG READINESS"
              value={`${intelligence?.avgReadiness || 0}%`}
              subtitle={intelligence?.avgReadiness > 80 ? 'HIGH OPERATIONAL' : 'MONITOR FATIGUE'}
              color={D.emerald}
            />
            <MetricCard 
                icon={Trophy} 
                label="WIN VELOCITY" 
                value="68%" 
                subtitle="LAST 5 MATCH CYCLE" 
                color={D.amber}
            />
          </div>

          {/* Strategic Fixture Centre */}
          <div className="space-y-6">
            <SectionHeader 
                title="MATCH OPERATIONS" 
                sub="LIVE FIXTURE MONITORING & SCHEDULING UNIT" 
            />
            <FixtureCentreCard role={ROLES.COACH} />
          </div>

          {/* Tactical Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
             <QuickAction icon={Plus} label="NEW MATCH" color={D.indigo} />
             <QuickAction icon={Users} label="SELECT TEAM" color={D.amber} />
             <QuickAction icon={Activity} label="READINESS" color={D.emerald} />
             <QuickAction icon={Filter} label="REPORTS" color={D.sky} />
          </div>
        </div>

        {/* Intelligence Sidebar (1/3) */}
        <div className="space-y-10">
          {/* Squad Readiness Visualizer */}
          <div
            className="rounded-[2.5rem] border shadow-2xl p-8 overflow-hidden"
            style={{ background: D.surf1, borderColor: D.border }}
          >
            <div className="mb-8">
              <h4
                className="text-[11px] font-black uppercase tracking-[0.3em] italic mb-1.5"
                style={{ fontFamily: D.head, color: D.textMuted }}
              >
                READINESS HEATMAP
              </h4>
              <p className="text-[10px] font-black uppercase opacity-40" style={{ color: D.textMuted }}>REAL-TIME FATIGUE DISTRIBUTION</p>
            </div>
            
            <div className="space-y-8">
              <div className="grid grid-cols-6 gap-2">
                {intelligence?.playerReadiness?.map((p: any) => (
                  <div
                    key={p.playerId}
                    className="aspect-square rounded-lg shadow-sm border border-white/5 transition-transform hover:scale-110 cursor-help"
                    style={{
                      background: p.isInjured
                        ? D.rose
                        : p.score < 70
                        ? D.amber
                        : D.emerald,
                    }}
                    title={`${p.name}: ${p.score}%`}
                  />
                ))}
                {(!intelligence || intelligence.playerReadiness.length === 0) &&
                  Array.from({ length: 18 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg transition-colors"
                      style={{ background: D.surf3 }}
                    />
                  ))}
              </div>
              
              <div
                className="flex items-center justify-between p-4 rounded-xl border-white/5 shadow-inner"
                style={{ background: D.surf2, color: D.textMuted }}
              >
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: D.rose }} />
                    <span className="text-[8px] font-black uppercase tracking-widest">CRIT</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: D.amber }} />
                    <span className="text-[8px] font-black uppercase tracking-widest">MONITOR</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: D.emerald }} />
                    <span className="text-[8px] font-black uppercase tracking-widest">OPTIMAL</span>
                </div>
              </div>

              <div
                className="w-full text-center py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-2xl shadow-emerald-500/10"
                style={{ background: `${D.emerald}08`, borderColor: `${D.emerald}20`, color: D.emerald, fontFamily: D.head }}
              >
                {intelligence?.avgReadiness || 0}% AGGREGATE SEVERITY
              </div>
            </div>
          </div>

          {/* Strategic Watchlist Flags */}
          <div className="space-y-6">
            <h3
              className="text-[11px] font-black uppercase tracking-[0.3em] italic ml-1"
              style={{ fontFamily: D.head, color: D.textMuted }}
            >
              WATCHLIST ALERTS
            </h3>
            <div className="space-y-3">
                <AnimatePresence>
                    {intelligence?.watchlistFlags?.map((flag: any, i: number) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-5 rounded-2xl border shadow-lg group transition-all hover:bg-black/5"
                        style={{
                            background: D.surf2,
                            borderColor: D.border
                        }}
                    >
                        <div className="flex items-center gap-4">
                        <div
                            className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                            style={{
                            background:
                                flag.severity === 'amber'
                                ? D.amber
                                : flag.severity === 'red'
                                ? D.rose
                                : D.emerald,
                            }}
                        />
                        <span
                            className="text-[10px] font-black uppercase tracking-tight italic"
                            style={{ fontFamily: D.head, color: D.textPrimary }}
                        >
                            {flag.name}
                        </span>
                        </div>
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: D.textMuted }}>
                        {flag.rsn}
                        </span>
                    </motion.div>
                    ))}
                    {(!intelligence || intelligence.watchlistFlags.length === 0) && (
                    <div
                        className="p-12 rounded-[2rem] text-center border border-dashed flex flex-col items-center gap-4"
                        style={{ background: D.surf2, borderColor: D.border }}
                    >
                        <ShieldCheck className="w-8 h-8 opacity-10" />
                        <p
                            className="text-[10px] font-black uppercase tracking-[0.25em]"
                            style={{ color: D.textMuted }}
                        >
                        NO ACTIVE THREATS
                        </p>
                    </div>
                    )}
                </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, color }: { icon: any, label: string, color: string }) {
  return (
    <button
      className="flex flex-col items-center gap-4 p-6 rounded-2xl border transition-all duration-300 group shadow-lg"
      style={{ background: `${color}08`, borderColor: `${color}20`, color: color }}
    >
      <div
        className="h-12 w-12 rounded-2xl flex items-center justify-center group-hover:scale-110 shadow-lg border transition-all"
        style={{ background: D.surf1, borderColor: `${color}30` }}
      >
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-[9px] font-black uppercase tracking-[0.2em] italic" style={{ fontFamily: D.head }}>
        {label}
      </span>
    </button>
  );
}
