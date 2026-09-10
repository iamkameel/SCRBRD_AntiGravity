"use client";

import React, { useState } from 'react';
import { D } from '@/lib/design-system';
import { 
  Award, 
  Trophy, 
  Star, 
  Sparkles, 
  Calendar, 
  Shield, 
  TrendingUp, 
  UserCheck, 
  Clock, 
  Bookmark, 
  Medal,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export interface MilestoneItem {
  id: string;
  type: 'milestone' | 'award' | 'accolade' | 'role_change';
  title: string;
  category: 'Batting' | 'Bowling' | 'Fielding' | 'Leadership' | 'Selection';
  achievedOn: string;
  season: string;
  description: string;
  awardingBody?: string;
  isPublic?: boolean;
}

const SAMPLE_MILESTONES: MilestoneItem[] = [
  {
    id: 'm1',
    type: 'milestone',
    title: '500 Career Runs Landmark',
    category: 'Batting',
    achievedOn: '2026-03-12',
    season: '2025/26 Season',
    description: 'Passed 500 First XI career runs with a match-winning 84* vs Grey High School.',
    awardingBody: 'St. Andrews 1st XI'
  },
  {
    id: 'm2',
    type: 'award',
    title: 'Batter of the Tournament',
    category: 'Batting',
    achievedOn: '2026-02-20',
    season: '2025/26 Season',
    description: 'Awarded top batter of the Independent Schools Festival (312 runs @ 62.4).',
    awardingBody: 'Independent Schools Cricket Association'
  },
  {
    id: 'm3',
    type: 'accolade',
    title: 'Selected for Provincial Elite Camp',
    category: 'Selection',
    achievedOn: '2025-11-05',
    season: '2025/26 Season',
    description: 'Recognised by regional selectors for top-order composure and strike rotation.',
    awardingBody: 'Eastern Province Cricket Board',
    isPublic: true
  },
  {
    id: 'm4',
    type: 'role_change',
    title: 'Promoted to 1st XI Captain',
    category: 'Leadership',
    achievedOn: '2025-10-01',
    season: '2025/26 Season',
    description: 'Appointed captain for the 2025/26 summer season.',
    awardingBody: 'Head of Sports'
  },
  {
    id: 'm5',
    type: 'milestone',
    title: 'First XI Match Debut',
    category: 'Selection',
    achievedOn: '2024-10-15',
    season: '2024/25 Season',
    description: 'Debut against Selborne College as an Under-15 opener.',
    awardingBody: 'St. Andrews College'
  }
];

interface MilestoneTimelineProps {
  playerName?: string;
  items?: MilestoneItem[];
}

export function MilestoneTimeline({ playerName = "Liam Thompson", items = SAMPLE_MILESTONES }: MilestoneTimelineProps) {
  const [filter, setFilter] = useState<'all' | 'milestone' | 'award' | 'accolade' | 'role_change'>('all');

  const filteredItems = items.filter(item => filter === 'all' || item.type === filter);

  const getIcon = (type: MilestoneItem['type']) => {
    switch (type) {
      case 'award': return <Trophy className="w-4 h-4 text-amber-400" />;
      case 'milestone': return <Medal className="w-4 h-4 text-sky-400" />;
      case 'accolade': return <Star className="w-4 h-4 text-emerald-400" />;
      case 'role_change': return <Shield className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getTypeBadge = (type: MilestoneItem['type']) => {
    switch (type) {
      case 'award': return <Badge className="bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase border-0">AWARD</Badge>;
      case 'milestone': return <Badge className="bg-sky-500/20 text-sky-300 text-[9px] font-black uppercase border-0">MILESTONE</Badge>;
      case 'accolade': return <Badge className="bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase border-0">ACCOLADE</Badge>;
      case 'role_change': return <Badge className="bg-indigo-500/20 text-indigo-300 text-[9px] font-black uppercase border-0">ROLE CHANGE</Badge>;
    }
  };

  return (
    <div className="rounded-2xl border p-8 space-y-6" style={{ background: D.surf1, borderColor: D.border }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b" style={{ borderColor: D.border }}>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2 mb-2" style={{ color: D.sky }}>
            <Award className="w-4 h-4" /> HISTORICAL RECORDS ENGINE
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tight italic" style={{ fontFamily: D.head, color: D.textPrimary }}>
            ACCOLADES & <span style={{ color: D.sky }}>MILESTONES TIMELINE</span>
          </h3>
          <p className="text-[11px] font-semibold text-zinc-400 mt-1">
            Preserved historical record of career landmarks, awards, accolades, and selection evolution for {playerName}.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'milestone', 'award', 'accolade', 'role_change'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${
                filter === f 
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' 
                  : 'bg-white/[0.02] border-white/5 text-zinc-500 hover:border-white/10'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Event Stream */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
        {filteredItems.map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className="relative group"
          >
            {/* Timeline Dot Icon */}
            <div className="absolute -left-6 top-1 w-6 h-6 rounded-full border border-white/10 bg-zinc-950 flex items-center justify-center shadow-md">
              {getIcon(item.type)}
            </div>

            {/* Event Card */}
            <div className="p-5 rounded-xl border bg-black/20 hover:bg-black/30 transition-all space-y-2" style={{ borderColor: D.border }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  {getTypeBadge(item.type)}
                  <span className="text-xs font-bold text-zinc-400 font-mono">{item.season}</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-zinc-500" /> {item.achievedOn}
                  </span>
                </div>

                {item.awardingBody && (
                  <span className="text-[10px] font-bold text-sky-400/80 uppercase tracking-widest bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    {item.awardingBody}
                  </span>
                )}
              </div>

              <h4 className="text-base font-black text-white italic tracking-tight" style={{ fontFamily: D.head }}>
                {item.title}
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
