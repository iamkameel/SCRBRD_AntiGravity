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
  Plus,
  Filter,
  TrendingUp,
  ShieldCheck,
  Sparkles
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
      <div className="flex items-center justify-center py-20">
        <Activity className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* OS Intelligence Banner — Strategic Unit */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-6 md:p-8 rounded-2xl border overflow-hidden shadow-xl"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        <div className="absolute inset-0 opacity-[0.05]" style={{ background: D.gradMain }} />
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center border shrink-0"
            style={{ background: D.surf2, borderColor: D.border }}
          >
            <Activity className="h-7 w-7 text-indigo-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              <Sparkles className="h-3 w-3" />
              <span>Intelligence Broadcast</span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight" style={{ fontFamily: D.head }}>
              {intelligence?.watchlistFlags?.length > 0
                ? `${intelligence.watchlistFlags.length} Critical Player Flags Detected`
                : 'All Squad Parameters Stable'}
            </h3>
            <p className="text-xs text-slate-400 font-medium" style={{ fontFamily: D.sans }}>
              Squad at <span className="text-white font-bold">{intelligence?.avgReadiness || 0}%</span> aggregate capacity · {intelligence?.availableCount || 0} operational athletes
            </p>
          </div>
          <div className="md:ml-auto flex gap-3 w-full md:w-auto">
             <Button variant="outline" className="flex-1 md:flex-none rounded-xl font-bold text-xs px-4 h-10 border text-white hover:bg-white/5" style={{ background: D.surf2, borderColor: D.border }}>
               Resync Data
             </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Command Column (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Performance Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              icon={Users}
              label="SQUAD CAPACITY"
              value={activePlayers}
              subtitle={`${intelligence?.availableCount || 0} available · ${intelligence?.injuredCount || 0} injured`}
              color={D.indigo}
            />
            <MetricCard
              icon={TrendingUp}
              label="AVG READINESS"
              value={`${intelligence?.avgReadiness || 0}%`}
              subtitle={intelligence?.avgReadiness > 80 ? 'High operational' : 'Monitor fatigue'}
              color={D.emerald}
            />
            <MetricCard 
                icon={Trophy} 
                label="WIN VELOCITY" 
                value="68%" 
                subtitle="Last 5 match cycle" 
                color={D.amber}
            />
          </div>

          {/* Strategic Fixture Centre */}
          <div className="space-y-4">
            <SectionHeader 
                title="Match Operations" 
                sub="Live fixture monitoring & scheduling unit." 
            />
            <FixtureCentreCard role={ROLES.COACH} />
          </div>

          {/* Tactical Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
             <QuickAction icon={Plus} label="New Match" color={D.indigo} />
             <QuickAction icon={Users} label="Select Team" color={D.amber} />
             <QuickAction icon={Activity} label="Readiness" color={D.emerald} />
             <QuickAction icon={Filter} label="Reports" color={D.sky} />
          </div>
        </div>

        {/* Intelligence Sidebar (1/3) */}
        <div className="space-y-8">
          {/* Squad Readiness Visualizer */}
          <div
            className="rounded-2xl border shadow-xl p-6 overflow-hidden space-y-6"
            style={{ background: D.surf1, borderColor: D.border }}
          >
            <div>
              <h4 className="text-base font-bold text-white tracking-tight" style={{ fontFamily: D.head }}>
                Readiness Heatmap
              </h4>
              <p className="text-xs text-slate-400">Real-time fatigue distribution.</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-6 gap-2">
                {intelligence?.playerReadiness?.map((p: any) => (
                  <div
                    key={p.playerId}
                    className="aspect-square rounded-lg shadow-sm border border-white/10 transition-transform hover:scale-110 cursor-help"
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
                      className="aspect-square rounded-lg bg-white/5 border border-white/5"
                    />
                  ))}
              </div>
              
              <div
                className="flex items-center justify-between p-3 rounded-xl border border-white/10 text-xs font-medium text-slate-300"
                style={{ background: D.surf2 }}
              >
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>Crit</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Monitor</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Optimal</span>
                </div>
              </div>

              <div
                className="w-full text-center py-3 rounded-xl text-xs font-bold border text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                style={{ fontFamily: D.head }}
              >
                {intelligence?.avgReadiness || 0}% Aggregate Severity
              </div>
            </div>
          </div>

          {/* Strategic Watchlist Flags */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight" style={{ fontFamily: D.head }}>
              Watchlist Alerts
            </h3>
            <div className="space-y-3">
                <AnimatePresence>
                    {intelligence?.watchlistFlags?.map((flag: any, i: number) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center justify-between p-4 rounded-xl border shadow-md transition-all hover:border-indigo-500/30"
                        style={{
                            background: D.surf2,
                            borderColor: D.border
                        }}
                    >
                        <div className="flex items-center gap-3">
                        <div
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{
                            background:
                                flag.severity === 'amber'
                                ? D.amber
                                : flag.severity === 'red'
                                ? D.rose
                                : D.emerald,
                            }}
                        />
                        <span className="text-xs font-bold text-white" style={{ fontFamily: D.head }}>
                            {flag.name}
                        </span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">
                          {flag.rsn}
                        </span>
                    </motion.div>
                    ))}
                    {(!intelligence || intelligence.watchlistFlags.length === 0) && (
                    <div
                        className="p-8 rounded-2xl text-center border border-dashed flex flex-col items-center gap-3 text-slate-400"
                        style={{ background: D.surf2, borderColor: D.border }}
                    >
                        <ShieldCheck className="w-6 h-6 text-slate-500" />
                        <p className="text-xs font-semibold">No active threats detected.</p>
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
      className="flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all duration-300 group hover:border-white/20 shadow-sm"
      style={{ background: `${color}10`, borderColor: `${color}20`, color: color }}
    >
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105"
        style={{ background: D.surf1, borderColor: `${color}30` }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-xs font-bold tracking-tight text-white" style={{ fontFamily: D.head }}>
        {label}
      </span>
    </button>
  );
}
