"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { D } from '@/lib/design-system';
import { 
  Trophy, 
  Medal, 
  Award, 
  Activity, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Clock,
  UserCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  PlayerCareerProfile, 
  MOCK_CAREER_PROFILES, 
  calculateRoleSuitability 
} from '@/lib/intelligence/playerHistoryEngine';
import { PlayerSkillProgressionChart } from './PlayerSkillProgressionChart';

interface PlayerCareerHistoryTabProps {
  profile?: PlayerCareerProfile;
  playerId?: string;
}

export function PlayerCareerHistoryTab({ profile: profileProp, playerId }: PlayerCareerHistoryTabProps) {
  const profile = profileProp || (playerId && MOCK_CAREER_PROFILES[playerId]) || MOCK_CAREER_PROFILES['player-1'];
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'MILESTONES' | 'AWARDS' | 'ACCOLADES' | 'MEDICAL'>('ALL');
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({
    '2026': true,
    '2025': true,
  });

  const toggleYear = (year: string) => {
    setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  // Build unified chronological timeline stream
  const timelineEvents = [
    ...profile.milestones.map(m => ({
      id: m.id,
      date: m.achievedOn,
      year: new Date(m.achievedOn || '2026-01-01').getFullYear().toString(),
      season: m.season,
      type: 'MILESTONE' as const,
      title: m.title,
      subtitle: m.type,
      description: m.description,
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      icon: Trophy
    })),
    ...profile.awards.map(a => ({
      id: a.id,
      date: a.awardedOn,
      year: new Date(a.awardedOn || '2026-01-01').getFullYear().toString(),
      season: a.season,
      type: 'AWARD' as const,
      title: a.title,
      subtitle: a.awardingBody,
      description: a.description,
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-[#22c55e] border-emerald-500/20',
      icon: Medal
    })),
    ...profile.accolades.map(acc => ({
      id: acc.id,
      date: acc.notedOn,
      year: new Date(acc.notedOn || '2026-01-01').getFullYear().toString(),
      season: acc.season,
      type: 'ACCOLADE' as const,
      title: acc.source,
      subtitle: acc.tags.join(' • '),
      description: acc.comments,
      badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      icon: Award
    })),
    ...profile.injuryLogs.map(inj => ({
      id: inj.id,
      date: inj.occurredOn,
      year: new Date(inj.occurredOn || '2026-01-01').getFullYear().toString(),
      season: 'Medical',
      type: 'MEDICAL' as const,
      title: inj.injuryType,
      subtitle: `Clearance: ${inj.clearanceDate}`,
      description: inj.notes,
      badgeColor: inj.status === 'CLEARED' 
        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
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

  // Group events by year
  const eventsByYear = filteredEvents.reduce((acc, evt) => {
    const yr = evt.year || '2026';
    if (!acc[yr]) acc[yr] = [];
    acc[yr].push(evt);
    return acc;
  }, {} as Record<string, typeof filteredEvents>);

  const yearsSorted = Object.keys(eventsByYear).sort((a, b) => Number(b) - Number(a));

  const latestStats = profile.seasonStats[profile.seasonStats.length - 1];
  const latestSkill = profile.skillProgression[profile.skillProgression.length - 1];

  const roleOptions = ['Opener', 'Top-order Anchor', 'Death Bowler', 'Bowling All-Rounder', 'Wicketkeeper-Batter'];
  const roleFitScores = roleOptions.map(r => ({
    role: r,
    fit: calculateRoleSuitability(r, latestSkill.domains)
  })).sort((a, b) => b.fit - a.fit);

  return (
    <div className="space-y-8">
      {/* Overview Stat Runway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/80 dark:bg-[#0c0c10]/80 border-zinc-200 dark:border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-zinc-400 dark:text-white/40 uppercase tracking-widest" style={{ fontFamily: D.mono }}>Career Runs</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-zinc-900 dark:text-white mt-2" style={{ fontFamily: D.head }}>
            {profile.seasonStats.reduce((sum, s) => sum + s.batting.runs, 0)}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Avg {latestStats?.batting.average.toFixed(1)} this season
          </p>
        </Card>

        <Card className="bg-white/80 dark:bg-[#0c0c10]/80 border-zinc-200 dark:border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-zinc-400 dark:text-white/40 uppercase tracking-widest" style={{ fontFamily: D.mono }}>Career Wickets</span>
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-zinc-900 dark:text-white mt-2" style={{ fontFamily: D.head }}>
            {profile.seasonStats.reduce((sum, s) => sum + s.bowling.wickets, 0)}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-white/50 font-medium mt-1">
            Best {latestStats?.bowling.bestFigures || 'N/A'}
          </p>
        </Card>

        <Card className="bg-white/80 dark:bg-[#0c0c10]/80 border-zinc-200 dark:border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-zinc-400 dark:text-white/40 uppercase tracking-widest" style={{ fontFamily: D.mono }}>Honours & Awards</span>
            <Medal className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-3xl font-black text-zinc-900 dark:text-white mt-2" style={{ fontFamily: D.head }}>
            {profile.awards.length + profile.milestones.length}
          </p>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-300 font-medium mt-1">
            {profile.awards[0]?.title || 'Multi-Award Recipient'}
          </p>
        </Card>

        <Card className="bg-white/80 dark:bg-[#0c0c10]/80 border-zinc-200 dark:border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-zinc-400 dark:text-white/40 uppercase tracking-widest" style={{ fontFamily: D.mono }}>Composite Index</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2" style={{ fontFamily: D.head }}>
            {latestSkill.compositeIndex} <span className="text-xs font-normal text-zinc-400 dark:text-slate-400">/ 100</span>
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-white/50 font-medium mt-1">
            Status: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{profile.readinessStatus}</span>
          </p>
        </Card>
      </div>

      {/* Role Evolution & Skill Domain Progression Runway */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Longitudinal Skill Matrix Progression */}
        <div className="lg:col-span-2 rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-[#0c0c10]/80 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-zinc-900 dark:text-white tracking-tight" style={{ fontFamily: D.head }}>
                Multi-Season Skill Progression (7 Domains)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-white/40">
                Normalized 0–100 development trajectory across Physical, Mental, Tactical, and Skill attributes.
              </p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20 text-xs font-bold font-mono">
              +16 Index Growth
            </Badge>
          </div>

          <div className="space-y-4 pt-2">
            {/* Interactive Seasonal Skill Progression Chart */}
            <PlayerSkillProgressionChart skillProgression={profile.skillProgression} />

            {/* Numeric Domain Breakdown Table */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-white/40" style={{ fontFamily: D.mono }}>
                Seasonal Domain Breakdown
              </h4>
              {profile.skillProgression.map((prog) => (
                <div key={prog.season} className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-sky-600 dark:text-sky-400 font-mono">{prog.season} Season</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">Composite Index: {prog.compositeIndex}</span>
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-center text-[10px]">
                    <div className="bg-zinc-100 dark:bg-white/5 p-2 rounded-xl">
                      <span className="text-zinc-400 dark:text-slate-400 uppercase text-[8px] font-bold block">Batting</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-white text-xs">{prog.domains.batting}</span>
                    </div>
                    <div className="bg-zinc-100 dark:bg-white/5 p-2 rounded-xl">
                      <span className="text-zinc-400 dark:text-slate-400 uppercase text-[8px] font-bold block">Bowling</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-white text-xs">{prog.domains.bowling}</span>
                    </div>
                    <div className="bg-zinc-100 dark:bg-white/5 p-2 rounded-xl">
                      <span className="text-zinc-400 dark:text-slate-400 uppercase text-[8px] font-bold block">Fielding</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-white text-xs">{prog.domains.fielding}</span>
                    </div>
                    <div className="bg-zinc-100 dark:bg-white/5 p-2 rounded-xl">
                      <span className="text-zinc-400 dark:text-slate-400 uppercase text-[8px] font-bold block">Keeper</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-white text-xs">{prog.domains.wicketkeeping}</span>
                    </div>
                    <div className="bg-zinc-100 dark:bg-white/5 p-2 rounded-xl">
                      <span className="text-zinc-400 dark:text-slate-400 uppercase text-[8px] font-bold block">Physical</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-white text-xs">{prog.domains.physical}</span>
                    </div>
                    <div className="bg-zinc-100 dark:bg-white/5 p-2 rounded-xl">
                      <span className="text-zinc-400 dark:text-slate-400 uppercase text-[8px] font-bold block">Mental</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-white text-xs">{prog.domains.mental}</span>
                    </div>
                    <div className="bg-zinc-100 dark:bg-white/5 p-2 rounded-xl">
                      <span className="text-zinc-400 dark:text-slate-400 uppercase text-[8px] font-bold block">Tactical</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-white text-xs">{prog.domains.tactical}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Role Archetype Suitability Engine */}
        <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-[#0c0c10]/80 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-zinc-900 dark:text-white tracking-tight" style={{ fontFamily: D.head }}>
                Role Archetype Fit
              </h3>
              <p className="text-xs text-zinc-500 dark:text-white/40">Weighted domain suitability calculation.</p>
            </div>
            <UserCheck className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="space-y-2.5 pt-2">
            {roleFitScores.map((rf, idx) => (
              <div key={rf.role} className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">{rf.role}</span>
                  <span className="text-[10px] text-zinc-400 dark:text-slate-400">
                    {idx === 0 ? 'Primary Preferred Archetype' : 'Alternative Tactical Role'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-zinc-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${rf.fit >= 80 ? 'bg-emerald-500' : rf.fit >= 60 ? 'bg-sky-500' : 'bg-amber-500'}`}
                      style={{ width: `${rf.fit}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-black text-zinc-900 dark:text-white">{rf.fit}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filterable Career Timeline Stream Grouped By Year */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-[#0c0c10]/80 border border-zinc-200 dark:border-white/10 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600 dark:text-[#22c55e]" />
            <h3 className="text-base font-black text-zinc-900 dark:text-white tracking-tight" style={{ fontFamily: D.head }}>
              Career Timeline Stream
            </h3>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(['ALL', 'MILESTONES', 'AWARDS', 'ACCOLADES', 'MEDICAL'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  activeFilter === tab
                    ? 'bg-emerald-500 text-white dark:bg-[#22c55e] dark:text-black shadow-md shadow-emerald-500/20'
                    : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-white/50 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Grouped Years */}
        <div className="space-y-6">
          {yearsSorted.map((year) => {
            const events = eventsByYear[year];
            const isExpanded = expandedYears[year] ?? true;

            return (
              <div key={year} className="space-y-3">
                {/* Year Group Header */}
                <div 
                  onClick={() => toggleYear(year)}
                  className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 cursor-pointer hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-zinc-900 dark:text-white" style={{ fontFamily: D.head }}>
                      {year}
                    </span>
                    <Badge variant="outline" className="text-[9px] font-mono border-zinc-300 dark:border-white/20">
                      {events.length} {events.length === 1 ? 'event' : 'events'}
                    </Badge>
                  </div>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-400">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Timeline list under year */}
                {isExpanded && (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-white/10">
                    {events.map((evt) => {
                      const IconComp = evt.icon;
                      return (
                        <div key={evt.id} className="relative group">
                          <div className="absolute -left-[31px] top-1.5 w-6 h-6 rounded-full bg-white dark:bg-[#0c0c10] border border-zinc-300 dark:border-white/20 flex items-center justify-center text-emerald-600 dark:text-[#22c55e] shadow-md group-hover:border-emerald-500 transition-colors">
                            <IconComp className="w-3 h-3" />
                          </div>

                          <div className="bg-white/90 dark:bg-[#0c0c10]/90 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-all rounded-2xl p-4 space-y-2 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge className={`${evt.badgeColor} uppercase font-black text-[9px] px-2 py-0.5`}>
                                  {evt.type}
                                </Badge>
                                <span className="text-[10px] font-black text-zinc-400 dark:text-white/30 uppercase tracking-widest" style={{ fontFamily: D.mono }}>
                                  {evt.season}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-zinc-400 dark:text-white/40">{evt.date}</span>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-[#22c55e] transition-colors">
                                {evt.title}
                              </h4>
                              <p className="text-xs text-zinc-500 dark:text-white/50 font-medium">{evt.subtitle}</p>
                            </div>

                            <p className="text-xs text-zinc-700 dark:text-white/70 leading-relaxed bg-zinc-50 dark:bg-white/[0.02] p-3 rounded-xl border border-zinc-200 dark:border-white/5">
                              {evt.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
