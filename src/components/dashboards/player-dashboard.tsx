"use client";

import React, { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from '../dashboard/PageHeader';
import MetricCard from '../dashboard/MetricCard';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { Trophy, Target, Activity, Calendar, ArrowRight, Clock, Star, TrendingUp, ShieldCheck, ChevronRight } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { fetchPersonByEmail } from '@/app/actions/personActions';
import { fetchMatchesForTeams } from '@/app/actions/matchActions';
import { Match, Person } from '@/types/firestore';
import { format } from 'date-fns';
import { AvailabilityPrompt } from '../players/AvailabilityPrompt';
import { D } from '@/lib/design-system';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function PlayerDashboard() {
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
        
        if (profile?.teamIds && profile.teamIds.length > 0) {
          const matchData = await fetchMatchesForTeams(profile.teamIds);
          if (matchData.success) {
            setMatches({
              upcoming: matchData.upcoming || [],
              past: matchData.past || [],
              total: matchData.total || 0
            });
          }
        }
      } catch (error) {
        console.error("Error loading player dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const nextMatch = matches.upcoming[0];
  const stats = person?.stats || {};
  const battingAvg = stats.battingAverage || 0;
  const matchesPlayed = stats.matchesPlayed || matches.past.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Activity className="h-10 w-10 animate-spin" style={{ color: D.indigo }} />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {/* Strategic Header */}
      <div className="relative p-8 rounded-[2.5rem] border overflow-hidden shadow-2xl" 
           style={{ background: D.surf1, borderColor: D.border }}>
        <div className="absolute inset-0 opacity-10" style={{ background: D.gradMain }} />
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="h-20 w-20 rounded-2xl flex items-center justify-center shadow-inner group" 
               style={{ background: D.surf2, border: `1px solid ${D.border}` }}>
             <Star className="h-10 w-10 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic" style={{ fontFamily: D.head, color: D.textPrimary }}>
              PLAYER <span style={{ color: D.indigo }}>OPS</span>
            </h1>
            <p className="text-[12px] font-black uppercase tracking-[0.3em] mt-3 opacity-60 italic" style={{ color: D.textMuted }}>
                IDENTITY: {person?.firstName?.toUpperCase()} {person?.lastName?.toUpperCase()} · OPERATIONAL STATUS: VERIFIED
            </p>
          </div>
          <div className="md:ml-auto flex gap-4 w-full md:w-auto">
             <Button variant="outline" className="flex-1 md:flex-none rounded-2xl font-black text-[10px] uppercase tracking-widest px-8 h-12 border transition-all hover:bg-black/5" style={{ background: D.surf2 }}>PASSPORT</Button>
             <Button className="flex-1 md:flex-none rounded-2xl font-black text-[10px] uppercase tracking-widest px-10 h-12 shadow-2xl" style={{ background: D.indigo, color: 'white' }}>MATCH CENTRE</Button>
          </div>
        </div>
      </div>

      {/* Strategic Prompt Hub */}
      {nextMatch && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12"
        >
          <AvailabilityPrompt 
            matchId={nextMatch.id || ''}
            opponent={nextMatch.awayTeamName === 'My Team' ? (nextMatch.homeTeamName || 'Unknown') : (nextMatch.awayTeamName || 'Unknown')}
            date={format(new Date(nextMatch.matchDate as string), 'MMM dd')}
            venue={nextMatch.venue || 'Home Ground'}
            time={format(new Date(nextMatch.matchDate as string), 'HH:mm')}
            onConfirm={(status) => console.log('Availability confirmed:', status)}
          />
        </motion.div>
      )}

      {/* Performance Grid Unit */}
      <div className="space-y-8">
        <SectionHeader title="SEASON PERFORMANCE" sub="REAL-TIME METRIC DISTRIBUTION & OUTPUT TRACKER" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={Trophy}
            label="MATCHES PLAYED"
            value={matchesPlayed}
            subtitle="ACTIVE SEASON CYCLE"
            color={D.indigo}
          />
          <MetricCard
            icon={Target}
            label="BATTING AVG"
            value={battingAvg}
            subtitle={stats.totalRuns ? `${stats.totalRuns} AGGREGATE RUNS` : "ZERO OUTPUT DETECTED"}
            color={D.amber}
          />
          <MetricCard
            icon={Activity}
            label="FITNESS SCORE"
            value={person?.playerProfile?.physicalAttributes?.coreFitness || (person as any)?.skills?.fitness || 92}
            subtitle="LAST ASSESSMENT WINDOW"
            color={D.emerald}
          />
          <MetricCard
            icon={Calendar}
            label="NEXT MATCH"
            value={nextMatch ? format(new Date(nextMatch.matchDate as string), 'EEE').toUpperCase() : "-"}
            subtitle={nextMatch ? `VS ${nextMatch?.awayTeamName === 'My Team' ? nextMatch?.homeTeamName?.toUpperCase() : nextMatch?.awayTeamName?.toUpperCase()}` : "NO UPCOMING OPS"}
            color={D.indigo}
          />
        </div>
      </div>

      {/* Squad Preparation Section */}
      <div className="space-y-8">
        <SectionHeader 
            title="SQUAD PREPARATION" 
            sub="TEAM SELECTION STATUS & MATCH AVAILABILITY" 
        />
        {/* Availability prompt is already handled at the top, but keeping context here if needed */}
      </div>

      {/* Analytics & Temporal Schedule Hub */}
      <div className="grid gap-10 md:grid-cols-5">
        {/* Performance Visualization Unit (3/5) */}
        <div
          className="md:col-span-3 overflow-hidden rounded-[2.5rem] border shadow-2xl flex flex-col"
          style={{ background: D.surf1, borderColor: D.border }}
        >
          <div className="flex items-center justify-between p-8 border-b" style={{ borderColor: D.border, background: D.surf2 }}>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight italic" style={{ fontFamily: D.head, color: D.textPrimary }}>PERFORMANCE TREND</h3>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1" style={{ color: D.textMuted }}>DEVELOPMENT FEEDBACK LOOP</p>
            </div>
            <div className="p-3 rounded-xl shadow-inner border" style={{ background: D.surf1, borderColor: D.border }}>
                <TrendingUp size={20} className="text-emerald-500" />
            </div>
          </div>
          <div className="p-10 flex-1 flex flex-col items-center justify-center min-h-[300px]">
            <div className="h-24 w-24 rounded-full flex items-center justify-center shadow-2xl relative" style={{ background: D.surf2, border: `2px solid ${D.border}` }}>
               <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin" />
               <Trophy className="h-8 w-8 opacity-20" />
            </div>
            <p className="mt-8 text-[11px] font-black uppercase tracking-[0.3em] opacity-40 text-center px-12" style={{ color: D.textMuted }}>
                Strategic data mapping in progress. Visual output requires additional match cycle completion.
            </p>
          </div>
        </div>

        {/* Temporal Schedule Unit (2/5) */}
        <div
          className="md:col-span-2 overflow-hidden rounded-[2.5rem] border shadow-2xl flex flex-col"
          style={{ background: D.surf1, borderColor: D.border }}
        >
          <div className="p-8 border-b flex items-center gap-4" style={{ borderColor: D.border, background: D.surf2 }}>
             <div className="p-3 rounded-xl shadow-inner border" style={{ background: D.surf1, borderColor: D.border, color: D.indigo }}>
                <Calendar size={20} />
             </div>
             <div>
               <h3 className="text-xl font-black uppercase tracking-tight italic" style={{ fontFamily: D.head, color: D.textPrimary }}>UPCOMING</h3>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1" style={{ color: D.textMuted }}>TEMPORAL EVENT LOG</p>
             </div>
          </div>
          <div className="p-8 space-y-4">
            {/* Activity Block 1 */}
            <div
              className="group relative flex items-center p-5 rounded-2xl transition-all duration-500 hover:bg-black/5 border shadow-sm"
              style={{ background: D.surf2, borderColor: D.border }}
            >
              <div className="w-1.5 h-12 rounded-full mr-5 shadow-lg group-hover:scale-y-110 transition-transform" style={{ background: D.emerald }} />
              <div className="flex-1">
                <p className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-1" style={{ color: D.textMuted }}>SESSION: TRAINING</p>
                <p className="text-xl font-black uppercase italic tracking-tighter" style={{ fontFamily: D.head, color: D.textPrimary }}>TEAM NETS</p>
                <div className="flex items-center gap-3 mt-2 opacity-60">
                    <Clock size={12} style={{ color: D.indigo }} />
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: D.textMuted }}>TODAY 16:00 · MAIN GROUNDS</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" style={{ color: D.indigo }} />
            </div>

            {/* Match Day Block */}
            {nextMatch ? (
              <div
                className="group relative flex items-center p-5 rounded-2xl transition-all duration-500 hover:bg-black/5 border shadow-sm"
                style={{ background: D.surf2, borderColor: D.border }}
              >
                <div className="w-1.5 h-12 rounded-full mr-5 shadow-lg group-hover:scale-y-110 transition-transform" style={{ background: D.indigo }} />
                <div className="flex-1">
                  <p className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-1" style={{ color: D.textMuted }}>SYSTEM EVENT: MATCH</p>
                  <p className="text-xl font-black uppercase italic tracking-tighter" style={{ fontFamily: D.head, color: D.textPrimary }}>MATCH DAY</p>
                  <div className="flex items-center gap-3 mt-2 opacity-60">
                      <Calendar size={12} style={{ color: D.indigo }} />
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: D.textMuted }}>
                         {format(new Date(nextMatch.matchDate as string), 'EEEE, HH:mm').toUpperCase()} · {nextMatch.venue?.toUpperCase() || 'HOME GROUND'}
                      </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" style={{ color: D.indigo }} />
              </div>
            ) : (
                <div className="p-12 text-center rounded-2xl border border-dashed opacity-40 flex flex-col items-center gap-3" style={{ background: D.surf2, borderColor: D.border }}>
                    <ShieldCheck size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Temporal flow stable. No upcoming events.</p>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixture Centre Integration */}
      <div className="space-y-6">
        <SectionHeader title="MATCH MONITOR" sub="LIVE FIXTURE TRACKING & PERFORMANCE HISTORY" />
        <FixtureCentreCard 
            role="Player"
            maxMatches={3}
            teamId={person?.teamIds?.[0]}
            playerId={person?.id}
        />
      </div>
    </div>
  );
}
