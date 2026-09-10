"use client";

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../dashboard/PageHeader';
import MetricCard from '../dashboard/MetricCard';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { Eye, BookOpen, Calendar, CheckSquare, ChevronRight, ArrowRight, Play, Info, Loader2, ShieldCheck, ClipboardCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { fetchPersonByEmail } from '@/app/actions/personActions';
import { fetchOfficialMatches } from '@/app/actions/matchActions';
import { Match, Person } from '@/types/firestore';
import { format } from 'date-fns';
import { D } from "@/lib/design-system";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function UmpireScorerDashboard() {
  const { user } = useAuth();
  const [person, setPerson] = useState<Person | null>(null);
  const [matches, setMatches] = useState<{ upcoming: Match[], past: Match[], total: number }>({ upcoming: [], past: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.email) return;
      
      try {
        const profile = await fetchPersonByEmail(user.email);
        setPerson(profile);
        
        if (profile?.id) {
          const matchData = await fetchOfficialMatches(profile.id);
          if (matchData.success) {
            setMatches({
              upcoming: matchData.upcoming || [],
              past: matchData.past || [],
              total: matchData.total || 0
            });
          }
        } else if (user.uid) {
           const matchData = await fetchOfficialMatches(user.uid);
           if (matchData.success) {
            setMatches({
              upcoming: matchData.upcoming || [],
              past: matchData.past || [],
              total: matchData.total || 0
            });
          }
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
          <Loader2 className="h-12 w-12 animate-spin" style={{ color: D.indigo }} />
          <p className="text-[12px] font-black uppercase tracking-[0.4em] italic opacity-40" style={{ color: D.textMuted }}>REFRESHING OFFICIAL ROSTER DATA...</p>
        </div>
      );
  }

  const matchesOfficiated = matches.past.filter(m => m.status === 'completed').length;
  const nextMatch = matches.upcoming[0];
  const certification = person?.umpireProfile?.certificationLevel || person?.scorerProfile?.certificationLevel || "N/A";

  return (
    <div className="space-y-12 pb-12">
      {/* Strategic Command Banner */}
      <div className="relative p-8 rounded-[2.5rem] border overflow-hidden shadow-2xl" 
           style={{ background: D.surf1, borderColor: D.border }}>
        <div className="absolute inset-0 opacity-10" style={{ background: D.gradMain }} />
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="h-20 w-20 rounded-2xl flex items-center justify-center shadow-inner group" 
               style={{ background: D.surf2, border: `1px solid ${D.border}` }}>
             <ShieldCheck className="h-10 w-10 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic" style={{ fontFamily: D.head, color: D.textPrimary }}>
              OFFICIALS <span style={{ color: D.indigo }}>CENTRAL</span>
            </h1>
            <p className="text-[12px] font-black uppercase tracking-[0.4em] mt-3 opacity-60 italic" style={{ color: D.textMuted }}>
                IDENTITY: {person?.firstName?.toUpperCase()} {person?.lastName?.toUpperCase()} · RANK: {certification.toUpperCase()}
            </p>
          </div>
          <div className="md:ml-auto flex gap-4 w-full md:w-auto">
             <Button variant="outline" className="flex-1 md:flex-none rounded-2xl font-black text-[10px] uppercase tracking-widest px-8 h-12 border transition-all hover:bg-black/5" style={{ background: D.surf2 }}>CERTIFICATIONS</Button>
             <Button className="flex-1 md:flex-none rounded-2xl font-black text-[10px] uppercase tracking-widest px-10 h-12 shadow-2xl border border-indigo-500/50" style={{ background: D.indigo, color: 'white' }}>MATCH REPORTS</Button>
          </div>
        </div>
      </div>

      {/* Fixture Centre Integration */}
      <div className="space-y-6">
        <SectionHeader title="ASSIGNMENT MONITOR" sub="LIVE FIXTURE TRACKING & OFFICIAL VERIFICATION HUB" />
        <FixtureCentreCard 
            role="Umpire"
            maxMatches={3}
            assignedMatches={[...matches.upcoming, ...matches.past].map(m => m.id)}
        />
      </div>

      {/* Performance Matrix */}
      <div className="space-y-6">
        <SectionHeader 
            title="MATCH OPERATIONS" 
            sub="LIVE FIXTURE MONITORING & SCORING UNIT" 
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard 
            icon={Calendar} 
            label="NEXT ASSIGNMENT" 
            value={nextMatch ? format(new Date(nextMatch.matchDate as string), 'EEE').toUpperCase() : "-"}
            subtitle={nextMatch ? `${format(new Date(nextMatch.matchDate as string), 'HH:mm')} • ${nextMatch.venue || 'TBD'}` : "NO UPCOMING ASSIGNMENTS"}
            color={D.indigo}
          />
          <MetricCard 
            icon={Eye} 
            label="MATCHES VERIFIED" 
            value={matchesOfficiated}
            subtitle="ACTIVE SEASON SESSION TOTAL"
            color={D.emerald}
          />
          <MetricCard 
            icon={ClipboardCheck} 
            label="CERTIFICATION" 
            value={certification === "N/A" ? "-" : certification.split(' ')[0].toUpperCase()}
            subtitle={certification === "N/A" ? "NO RECORD FOUND" : certification.toUpperCase()}
            color={D.sky}
          />
          <MetricCard 
            icon={Zap} 
            label="SYSTEM VERSION" 
            value="v2.4"
            subtitle="ICC OFFICIAL RULESET UPDATE"
            color={D.violet}
          />
        </div>
      </div>

      {/* Operations & Resources Hub */}
      <div className="grid gap-10 md:grid-cols-2">
        {/* Assignment Manifest (Temporal) */}
        <div 
          className="rounded-[2.5rem] overflow-hidden shadow-2xl border flex flex-col"
          style={{ background: D.surf1, borderColor: D.border }}
        >
          <div className="p-8 flex flex-row items-center justify-between border-b" style={{ borderColor: D.border, background: D.surf2 }}>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight italic" style={{ fontFamily: D.head, color: D.textPrimary }}>
                TEMPORAL MANIFEST
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1" style={{ color: D.textMuted }}>UPCOMING ASSIGNMENT LOG</p>
            </div>
            <Button variant="ghost" className="h-10 text-[10px] font-black uppercase tracking-[0.2em] px-6 rounded-xl border" style={{ color: D.indigo, background: D.surf1, borderColor: D.border }}>
              FULL ROSTER
            </Button>
          </div>
          <div className="p-8 space-y-4">
            <AnimatePresence>
                {matches.upcoming.length > 0 ? (
                matches.upcoming.slice(0, 3).map((match, i) => (
                    <motion.div 
                    key={match.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative flex items-center justify-between p-6 rounded-2xl border transition-all hover:bg-black/5"
                    style={{ background: D.surf2, borderColor: D.border }}
                    >
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-black tracking-tight uppercase italic" style={{ fontFamily: D.head, color: D.textPrimary }}>{match.homeTeamName || 'HOME'}</span>
                        <span className="text-[10px] font-black uppercase opacity-30" style={{ color: D.textMuted }}>VS</span>
                        <span className="text-lg font-black tracking-tight uppercase italic" style={{ fontFamily: D.head, color: D.textPrimary }}>{match.awayTeamName || 'AWAY'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-[9px] h-5 border-white/10 px-3 font-black uppercase tracking-widest" style={{ background: D.surf1, color: D.textMuted }}>{match.matchType?.toUpperCase() || 'MATCH'}</Badge>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40" style={{ color: D.textMuted }}>{match.venue?.toUpperCase() || 'LOC: TBD'}</span>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1 px-6 border-l" style={{ borderColor: D.border }}>
                        <p className="text-lg font-black tracking-tighter italic" style={{ fontFamily: D.head, color: D.indigo }}>{format(new Date(match.matchDate as string), 'MMM d').toUpperCase()}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: D.textMuted }}>{format(new Date(match.matchDate as string), 'HH:mm')}</p>
                    </div>
                    </motion.div>
                ))
                ) : (
                    <div 
                    className="py-16 text-center rounded-2xl border border-dashed opacity-40 flex flex-col items-center justify-center gap-4"
                    style={{ background: D.surf2, borderColor: D.border }}
                    >
                    <ShieldCheck size={32} />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">NO UPCOMING ASSIGNMENTS ASSIGNED</p>
                    </div>
                )}
            </AnimatePresence>
          </div>
        </div>

        {/* Tactical Resources Grid */}
        <div 
          className="rounded-[2.5rem] overflow-hidden shadow-2xl border flex flex-col"
          style={{ background: D.surf1, borderColor: D.border }}
        >
          <div className="p-8 flex flex-row items-center justify-between border-b" style={{ borderColor: D.border, background: D.surf2 }}>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight italic" style={{ fontFamily: D.head, color: D.textPrimary }}>
                TACTICAL UNIT
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1" style={{ color: D.textMuted }}>OFFICIAL DOCUMENTATION HUB</p>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "RULE BOOK", icon: BookOpen, href: "#", color: D.indigo },
                { label: "MATCH REPORT", icon: ClipboardCheck, href: "#", color: D.emerald },
                { label: "DRS REVIEW", icon: Eye, href: "#", color: D.sky },
                { label: "FULL ROSTER", icon: Calendar, href: "#", color: D.violet }
              ].map((res, i) => (
                <Link 
                  key={i} 
                  href={res.href} 
                  className="group relative flex flex-col items-start p-8 rounded-2xl border transition-all overflow-hidden"
                  style={{ background: D.surf2, borderColor: D.border }}
                >
                  <div 
                    className="absolute -top-4 -right-4 opacity-[0.03] group-hover:opacity-[0.1] transition-all group-hover:scale-125"
                    style={{ color: res.color }}
                  >
                    <res.icon size={100} />
                  </div>
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 shadow-lg border"
                    style={{ background: D.surf1, borderColor: `${res.color}30`, color: res.color }}
                  >
                    <res.icon className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] italic group-hover:translate-x-1 transition-transform" style={{ color: D.textPrimary }}>{res.label}</span>
                </Link>
              ))}
            </div>
            
            <div className="mt-6 flex items-center justify-center p-4 border border-dashed rounded-2xl opacity-40 hover:opacity-100 transition-opacity cursor-help">
                <Info size={14} className="mr-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">SUBMIT ISSUES TO APP OPERATIONAL CENTRE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
