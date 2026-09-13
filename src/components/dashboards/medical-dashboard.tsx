"use client";

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../dashboard/PageHeader';
import { MetricCard } from '../dashboard/MetricCard';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { HeartPulse, Activity, UserPlus, FileText, ChevronRight, Stethoscope, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { fetchPersonByEmail, fetchInjuredPlayers } from '@/app/actions/personActions';
import { Person } from '@/types/firestore';
import { D } from "@/lib/design-system";
import { motion, AnimatePresence } from "framer-motion";

export default function MedicalDashboard() {
  const { user } = useAuth();
  const [person, setPerson] = useState<Person | null>(null);
  const [injuredPlayers, setInjuredPlayers] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.email) return;

      try {
        const [profile, injured] = await Promise.all([
          fetchPersonByEmail(user.email),
          fetchInjuredPlayers()
        ]);

        setPerson(profile);
        setInjuredPlayers(injured || []);
      } catch (error) {
        console.error("Error loading medical dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
          <Loader2 className="h-12 w-12 animate-spin" style={{ color: D.rose }} />
          <p className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: D.textMuted }}>Initializing Medical Intelligence Core...</p>
        </div>
      );
  }

  return (
    <div className="space-y-12 pb-12 animate-in fade-in duration-500">
      {/* Header Unit */}
      <div className="px-1">
        <PageHeader
          title="Medical Operations"
          description={`Welcome back, Dr. ${person?.lastName || 'Staff'}. Cross-referencing player health trends and regional rehab cycles.`}
        />
      </div>

      {/* Fixture Centre Integration */}
      <FixtureCentreCard
        role="Medical"
        maxMatches={3}
      />

      {/* Strategic Health Overview */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: HeartPulse, label: "INJURED PLAYERS", value: injuredPlayers.length, subtitle: "ACTIVE REHABILITATION", color: D.rose },
          { icon: Activity,    label: "CHECKUPS DUE",    value: "05",                subtitle: "PRIORITY ASSESSMENTS",     color: D.indigo },
          { icon: FileText,    label: "NEW REPORTS",     value: "12",                subtitle: "DOCUMENTED THIS MONTH",    color: D.sky },
          { icon: UserPlus,    label: "CLEARED TO PLAY", value: "02",                subtitle: "RETURN TO PERFORMANCE",    color: D.emerald },
        ].map((stat, i) => (
          <MetricCard key={i} {...stat} />
        ))}
      </div>

      {/* High-Fidelity Injury Status Board */}
      <div
        className="rounded-3xl overflow-hidden shadow-sm border"
        style={{ background: D.surf1, border: `1px solid ${D.border}` }}
      >
        <div className="p-8 flex flex-row items-center justify-between border-b" style={{ borderColor: D.border, background: D.surf2 }}>
          <div>
            <h3 className="text-xl font-black flex items-center gap-4 uppercase tracking-tighter italic" style={{ fontFamily: D.head, color: D.textPrimary }}>
              <Stethoscope className="h-6 w-6" style={{ color: D.rose }} />
              INJURY STATUS BOARD
            </h3>
            <p className="text-xs font-black uppercase tracking-widest mt-1 opacity-50" style={{ color: D.textMuted }}>REAL-TIME CLEARANCE AND REHAB MONITORING</p>
          </div>
          <Button variant="ghost" className="h-9 font-black text-[11px] uppercase tracking-widest px-6 rounded-2xl border shadow-inner transition-all hover:translate-y-[-1px]" style={{ borderColor: D.border, color: D.indigo, background: D.surf1 }}>
            FULL AUDIT LOG
          </Button>
        </div>
        <div className="p-8">
          <div className="space-y-5">
            <AnimatePresence mode="popLayout">
              {injuredPlayers.length > 0 ? (
                injuredPlayers.map((player, i) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative flex items-center justify-between p-6 rounded-2xl border transition-all hover:bg-black/5"
                    style={{ background: D.surf2, border: `1px solid ${D.border}` }}
                  >
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div
                          className="h-14 w-14 rounded-2xl flex items-center justify-center font-black text-lg italic uppercase transition-transform group-hover:scale-105"
                          style={{
                            background: `linear-gradient(135deg, ${D.rose}20, ${D.rose}05)`,
                            border: `1px solid ${D.rose}30`,
                            color: D.rose
                          }}
                        >
                          {player.firstName[0]}{player.lastName[0]}
                        </div>
                        <div
                          className="absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-background animate-pulse shadow-sm"
                          style={{ background: D.rose, borderColor: D.surf2 }}
                        />
                      </div>
                      <div>
                        <p className="text-lg font-black uppercase italic tracking-tighter leading-none" style={{ fontFamily: D.head, color: D.textPrimary }}>{player.firstName} {player.lastName}</p>
                        <p className="text-xs font-bold uppercase tracking-widest mt-1.5 opacity-50" style={{ color: D.textMuted }}>LOWER LIMB • HIGH INTENSITY REHAB CYCLE</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 pr-2">
                      <div className="text-right hidden sm:flex flex-col items-end gap-1.5">
                        <Badge className="font-black text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-lg border-0 shadow-sm" style={{ background: `${D.rose}15`, color: D.rose }}>RECOVERY UNIT</Badge>
                        <p className="text-[11px] font-black mt-1 uppercase tracking-[0.2em] opacity-40" style={{ color: D.textMuted }}>EST. RETURN: 14-21 DAYS</p>
                      </div>
                      <div
                        className="p-3.5 rounded-full transition-all group-hover:scale-110 group-hover:translate-x-1 shadow-inner"
                        style={{ background: D.surf1, color: D.textMuted, border: `1px solid ${D.border}` }}
                      >
                        <ChevronRight className="w-5 h-5 opacity-50" />
                      </div>
                    </div>
                  </motion.div>
                ) )
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 text-center rounded-3xl border border-dashed flex flex-col items-center justify-center gap-6"
                  style={{ background: `${D.emerald}05`, borderColor: `${D.emerald}20` }}
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner" style={{ background: `${D.emerald}10`, border: `1px solid ${D.emerald}20` }}>
                      <Activity className="w-8 h-8" style={{ color: D.emerald }} />
                  </div>
                  <div>
                      <h4 className="text-xl font-black uppercase italic tracking-tighter" style={{ fontFamily: D.head, color: D.emerald }}>SQUAD STATUS: FULLY OPERATIONAL</h4>
                      <p className="text-xs font-black uppercase tracking-[0.3em] mt-2 opacity-50" style={{ color: D.textMuted }}>ZERO ACTIVE INJURY REPORTS IN THE REPOSITORY.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
