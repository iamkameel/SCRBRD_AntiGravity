"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { D } from '@/lib/design-system';
import { 
  Trophy, 
  Award, 
  Medal, 
  Activity, 
  Calendar, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  Clock,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Flame
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerCareerProfile, MOCK_CAREER_PROFILES } from '@/lib/intelligence/playerHistoryEngine';

interface PlayerCareerHistoryTabProps {
  profile?: PlayerCareerProfile;
  playerId?: string;
}

export function PlayerCareerHistoryTab({ profile: profileProp, playerId }: PlayerCareerHistoryTabProps) {
  const profile = profileProp || (playerId && MOCK_CAREER_PROFILES[playerId]) || MOCK_CAREER_PROFILES['player-1'];
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'MILESTONES' | 'AWARDS' | 'ACCOLADES' | 'MEDICAL'>('ALL');


  // Build unified chronological timeline stream
  const timelineEvents = [
    ...profile.milestones.map(m => ({
      id: m.id,
      date: m.achievedOn,
      season: m.season,
      type: 'MILESTONE' as const,
      title: m.title,
      subtitle: m.type,
      description: m.description,
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: Trophy
    })),
    ...profile.awards.map(a => ({
      id: a.id,
      date: a.awardedOn,
      season: a.season,
      type: 'AWARD' as const,
      title: a.title,
      subtitle: a.awardingBody,
      description: a.description,
      badgeColor: 'bg-primary/10 text-primary border-primary/20',
      icon: Medal
    })),
    ...profile.accolades.map(acc => ({
      id: acc.id,
      date: acc.notedOn,
      season: acc.season,
      type: 'ACCOLADE' as const,
      title: acc.source,
      subtitle: acc.tags.join(' • '),
      description: acc.comments,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: Award
    })),
    ...profile.injuryLogs.map(inj => ({
      id: inj.id,
      date: inj.occurredOn,
      season: 'Medical',
      type: 'MEDICAL' as const,
      title: inj.injuryType,
      subtitle: `Clearance: ${inj.clearanceDate}`,
      description: inj.notes,
      badgeColor: inj.status === 'CLEARED' 
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
        : 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      icon: Activity
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredEvents = timelineEvents.filter(e => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'MILESTONES') return e.type === 'MILESTONE';
    if (activeFilter === 'AWARDS') return e.type === 'AWARD';
    if (activeFilter === 'ACCOLADES') return e.type === 'ACCOLADE';
    if (activeFilter === 'MEDICAL') return e.type === 'MEDICAL';
    return true;
  });

  const latestStats = profile.seasonStats[profile.seasonStats.length - 1];

  return (
    <div className="space-y-8">
      {/* Overview Stat Runway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/40 border-white/10 backdrop-blur-xl rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Career Runs</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-white mt-2" style={{ fontFamily: D.syne }}>
            {profile.seasonStats.reduce((sum, s) => sum + s.batting.runs, 0)}
          </p>
          <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Avg {latestStats?.batting.average.toFixed(1)} this season
          </p>
        </Card>

        <Card className="bg-black/40 border-white/10 backdrop-blur-xl rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Career Wickets</span>
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-black text-white mt-2" style={{ fontFamily: D.syne }}>
            {profile.seasonStats.reduce((sum, s) => sum + s.bowling.wickets, 0)}
          </p>
          <p className="text-[11px] text-white/50 font-medium mt-1">
            Best {latestStats?.bowling.bestFigures || 'N/A'}
          </p>
        </Card>

        <Card className="bg-black/40 border-white/10 backdrop-blur-xl rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Honours & Awards</span>
            <Medal className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-white mt-2" style={{ fontFamily: D.syne }}>
            {profile.awards.length + profile.milestones.length}
          </p>
          <p className="text-[11px] text-purple-300 font-medium mt-1">
            {profile.awards[0]?.title || 'Multi-Award Recipient'}
          </p>
        </Card>

        <Card className="bg-black/40 border-white/10 backdrop-blur-xl rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Readiness State</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400 mt-2" style={{ fontFamily: D.syne }}>
            {profile.readinessScore}%
          </p>
          <p className="text-[11px] text-white/50 font-medium mt-1">
            Status: <span className="text-emerald-400 font-bold">{profile.readinessStatus}</span>
          </p>
        </Card>
      </div>

      {/* Season-by-Season Performance Runway */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-2xl rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight" style={{ fontFamily: D.syne }}>
              LONGITUDINAL SEASON <span className="text-primary italic">RUNWAY</span>
            </h3>
            <p className="text-xs text-white/40">Multi-year statistical progression across competitive seasons</p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 uppercase font-black text-[10px] px-3">
            3 SEASONS RECORDED
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profile.seasonStats.map((st) => (
            <div key={st.season} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-primary uppercase tracking-widest">{st.season} Season</span>
                <span className="text-[10px] font-bold text-white/40 uppercase">{st.teamName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[9px] font-black text-white/40 uppercase block">Runs (Avg)</span>
                  <span className="text-sm font-bold text-white">{st.batting.runs} ({st.batting.average})</span>
                </div>
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[9px] font-black text-white/40 uppercase block">Strike Rate</span>
                  <span className="text-sm font-bold text-cyan-400">{st.batting.strikeRate}</span>
                </div>
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[9px] font-black text-white/40 uppercase block">Wickets (Econ)</span>
                  <span className="text-sm font-bold text-white">{st.bowling.wickets} ({st.bowling.economy})</span>
                </div>
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[9px] font-black text-white/40 uppercase block">Fielding</span>
                  <span className="text-sm font-bold text-purple-300">{st.fielding.catches} Catches</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Filterable Career Timeline Stream */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/40 border border-white/10 p-4 rounded-2xl">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-base font-black text-white uppercase tracking-tight" style={{ fontFamily: D.syne }}>
              CAREER <span className="text-primary italic">TIMELINE LOG</span>
            </h3>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(['ALL', 'MILESTONES', 'AWARDS', 'ACCOLADES', 'MEDICAL'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  activeFilter === tab
                    ? 'bg-primary text-black shadow-lg shadow-primary/20'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((evt) => {
              const IconComp = evt.icon;
              return (
                <motion.div
                  key={evt.id}
                  layout
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative group"
                >
                  <div className="absolute -left-[31px] top-1.5 w-6 h-6 rounded-full bg-black border border-white/20 flex items-center justify-center text-primary shadow-md group-hover:border-primary transition-colors">
                    <IconComp className="w-3 h-3" />
                  </div>

                  <div className="bg-black/50 border border-white/10 hover:border-white/20 transition-all rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={`${evt.badgeColor} uppercase font-black text-[9px] px-2 py-0.5`}>
                          {evt.type}
                        </Badge>
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{evt.season}</span>
                      </div>
                      <span className="text-[10px] font-mono text-white/40">{evt.date}</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{evt.title}</h4>
                      <p className="text-xs text-white/50 font-medium">{evt.subtitle}</p>
                    </div>

                    <p className="text-xs text-white/70 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
                      {evt.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
