"use client";

import React, { useState, useEffect } from 'react';
import { D } from "@/lib/design-system";
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  Zap, 
  Star, 
  Search,
  Filter,
  Users,
  Award,
  ChevronRight,
  Shield,
  Dna,
  Clock,
  CheckCircle2,
  Calendar,
  Layers
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Badge } from "@/components/ui/badge";
import { MilestoneTimeline } from "@/components/players/MilestoneTimeline";
import { getRankingsAction, HydratedRankingSnapshot } from "@/app/actions/rankingActions";

const riserData = [
  { name: "K. Rabada", rise: "+12.4", rank: 12, ppr: 84.5 },
  { name: "D. Miller", rise: "+8.2", rank: 8, ppr: 89.2 },
  { name: "Q. de Kock", rise: "+5.1", rank: 4, ppr: 92.1 },
];

const momentumData = [
  { x: 1, y: 45 },
  { x: 2, y: 52 },
  { x: 3, y: 48 },
  { x: 4, y: 70 },
  { x: 5, y: 65 },
  { x: 6, y: 88 },
];

export function GlobalRankingsClient() {
  const [tab, setTab] = useState<'teams' | 'players' | 'scouting' | 'milestones'>('players');
  const [metricFilter, setMetricFilter] = useState<'all' | 'batting' | 'bowling' | 'all_rounder' | 'movers'>('all');
  const [windowFilter, setWindowFilter] = useState<'career' | 'season_2026' | 'last_5' | 'last_3'>('season_2026');
  const [minQualification, setMinQualification] = useState(true);

  const [teams, setTeams] = useState<HydratedRankingSnapshot[]>([]);
  const [players, setPlayers] = useState<HydratedRankingSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getRankingsAction();
        if (res.success) {
          setTeams(res.teams || []);
          setPlayers(res.players || []);
        }
      } catch (err) {
        console.error("Failed to load global rankings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredPlayers = players.filter(p => {
    if (metricFilter !== 'all' && p.metricCategory !== metricFilter) return false;
    if (minQualification && ((p.innings ?? 10) < 5 && (p.overs ?? 0) < 10)) return false;
    return true;
  });

  const RiserItem = ({ name, rise, rank, ppr }: any) => (
    <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-3">
        <div className="text-emerald-400"><TrendingUp size={14} /></div>
        <div>
          <div className="text-[13px] font-bold" style={{ fontFamily: D.head }}>{name}</div>
          <div className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">Rank #{rank} • {ppr} PPR</div>
        </div>
      </div>
      <div className="text-xs font-black text-emerald-400">{rise}</div>
    </div>
  );

  return (
    <div className="min-h-screen text-white selection:bg-sky-500/30 pb-16" style={{ background: D.bg }}>
      {/* Dynamic Header */}
      <SectionHeader 
        title="Rankings & Milestones Hub"
        sub="The canonical authority on school cricket performance, historical landmarks, and role-weighted indices."
        icon={<Trophy className="w-5 h-5 text-sky-400" />}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-sky-500/10 border-sky-500/20 text-sky-400 font-black">
              INTELLIGENCE LAYER V2
            </Badge>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-4 font-mono">
              <Clock className="w-3 h-3 text-sky-400" />
              UPDATED 2H AGO
            </div>
          </div>
        }
      />

      <div className="container mx-auto px-6 py-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          
          {/* Main List Area */}
          <div className="space-y-8">
            {/* Main Tabs */}
            <div 
              className="flex items-center gap-1.5 p-1.5 rounded-2xl border shadow-xl backdrop-blur-xl overflow-x-auto no-scrollbar"
              style={{ background: D.surf1, borderColor: D.border }}
            >
              {(['players', 'teams', 'scouting', 'milestones'] as const).map(t => (
                <button 
                  key={t}
                  onClick={() => setTab(t)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap select-none ${
                    tab === t ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  style={{ fontFamily: D.head }}
                >
                  {tab === t && (
                    <motion.div 
                      layoutId="rankingsTabPill"
                      className="absolute inset-0 rounded-xl border border-sky-500/30 bg-sky-500/15 shadow-lg shadow-sky-500/10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 uppercase tracking-wider text-[11px]">{t}</span>
                  {tab === t && (
                    <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  )}
                </button>
              ))}
            </div>


            {/* Sub-Filters & Threshold Controls for Players Tab */}
            {tab === 'players' && (
              <div className="p-4 rounded-xl border bg-black/20 space-y-4" style={{ borderColor: D.border }}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Metric Sub-Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Metric Filter:</span>
                    {(['all', 'batting', 'bowling', 'all_rounder', 'movers'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => setMetricFilter(m)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                          metricFilter === m 
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' 
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {m.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  {/* Window Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Window:</span>
                    <select
                      value={windowFilter}
                      onChange={(e) => setWindowFilter(e.target.value as any)}
                      className="bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-white uppercase tracking-wider px-2 py-1 rounded-lg cursor-pointer"
                    >
                      <option value="season_2026">2025/26 Season</option>
                      <option value="last_5">Last 5 Matches</option>
                      <option value="last_3">Last 3 Matches</option>
                      <option value="career">Career History</option>
                    </select>
                  </div>
                </div>

                {/* Qualification Threshold Toggle */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Apply Qualification Threshold (Min 5 Innings or 10 Overs)</span>
                  </div>
                  <button
                    onClick={() => setMinQualification(!minQualification)}
                    className={`px-3 py-1 rounded text-[10px] font-black uppercase border ${
                      minQualification ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    }`}
                  >
                    {minQualification ? 'THRESHOLD ACTIVE' : 'ALL PLAYERS'}
                  </button>
                </div>
              </div>
            )}

            {/* Rankings Table/List */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {tab === 'teams' && teams.map((r) => (
                  <motion.div 
                    key={r.id}
                    whileHover={{ x: 4 }}
                    className="group bg-white/[0.02] border border-white/5 px-6 py-5 rounded-2xl flex items-center justify-between hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-8">
                      <div className="text-3xl font-black text-white/10 group-hover:text-sky-500/40 transition-colors tabular-nums" style={{ fontFamily: D.head }}>
                        #{r.rank}
                      </div>
                      <div>
                        <div className="text-lg font-bold group-hover:text-sky-400 transition-colors" style={{ fontFamily: D.head }}>{r.name}</div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">{r.subtext}</span>
                          <div className="w-1 h-1 rounded-full bg-zinc-700" />
                          <span className="text-[11px] text-emerald-400/80 font-bold uppercase tracking-wider">STREAK: {r.streak || '3W'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-12">
                      <div className="text-center">
                        <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">TRS SCORE</div>
                        <div className="text-2xl font-black text-sky-400 tabular-nums font-mono">{r.score.toFixed(1)}</div>
                      </div>
                      <div className="flex items-center gap-3 min-w-[60px] justify-end">
                        {r.movement > 0 ? (
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <TrendingUp size={16} strokeWidth={3} />
                            <span className="text-sm font-black">{r.movement}</span>
                          </div>
                        ) : r.movement < 0 ? (
                          <div className="flex items-center gap-1.5 text-rose-400">
                            <TrendingDown size={16} strokeWidth={3} />
                            <span className="text-sm font-black">{Math.abs(r.movement)}</span>
                          </div>
                        ) : (
                          <div className="w-6 h-[2px] bg-zinc-700" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {tab === 'players' && filteredPlayers.map((r) => (
                  <motion.div 
                    key={r.id}
                    whileHover={{ x: 4 }}
                    className="group bg-white/[0.02] border border-white/5 px-6 py-5 rounded-2xl flex items-center justify-between hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer"
                  >
                     <div className="flex items-center gap-8">
                      <div className="text-3xl font-black text-white/10 group-hover:text-emerald-500/40 transition-colors tabular-nums" style={{ fontFamily: D.head }}>
                        #{r.rank}
                      </div>
                      <div>
                        <div className="text-lg font-bold group-hover:text-emerald-400 transition-colors" style={{ fontFamily: D.head }}>{r.name}</div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">{r.subtext}</span>
                          <div className="w-1 h-1 rounded-full bg-zinc-700" />
                          <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">{r.role || 'Athlete'}</span>
                          <div className="w-1 h-1 rounded-full bg-zinc-700" />
                          <span className="text-[10px] text-sky-400 font-mono font-semibold">{r.stats || 'Impact 8.5'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-12">
                      <div className="text-center">
                        <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">PPR RATING</div>
                        <div className="text-2xl font-black text-emerald-400 tabular-nums font-mono">{r.score.toFixed(1)}</div>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">STATUS</div>
                        <div className={`text-[11px] font-black uppercase tracking-wider ${r.movement > 0 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                          {r.movement > 0 ? 'RISING' : 'STABLE'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {tab === 'milestones' && (
                  <MilestoneTimeline playerName="Liam Thompson" />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            
            {/* MVP Showcase */}
            <div className="relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 blur-2xl opacity-10" />
              <div className="relative bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl p-6 text-black">
                <div className="flex justify-between items-center mb-6">
                  <div className="font-black text-[10px] uppercase tracking-[0.2em] opacity-80">MATCH DAY MVP</div>
                  <Award size={18} strokeWidth={3} className="opacity-80" />
                </div>
                <div className="text-2xl font-black tracking-tight leading-none mb-1" style={{ fontFamily: D.head }}>Liam Thompson</div>
                <div className="text-xs font-bold opacity-70 mb-6 uppercase tracking-wider">St. Andrews College</div>
                
                <div className="bg-black/10 backdrop-blur-sm rounded-xl p-4 border border-black/5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Impact Points</span>
                    <span className="text-lg font-black tracking-tight">+44.2</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fastest Risers */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400" style={{ fontFamily: D.head }}>FASTEST RISERS</div>
                <Zap size={16} className="text-sky-400" />
              </div>
              <div className="space-y-3">
                {riserData.map((r, i) => <RiserItem key={i} {...r} />)}
              </div>
            </div>

            {/* Market Momentum Map (Simulated) */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400" style={{ fontFamily: D.head }}>TALENT MOMENTUM</div>
                <Activity size={16} className="text-zinc-500" />
              </div>
              <div className="h-[120px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={momentumData}>
                    <defs>
                      <linearGradient id="momentumGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="y" 
                      stroke="#0EA5E9" 
                      fill="url(#momentumGradient)" 
                      strokeWidth={3} 
                      isAnimationActive={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-6 text-center leading-relaxed">
                Aggregate PPR movement across all age groups.
              </div>
            </div>

            {/* Scouting Tags */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
               <div className="flex justify-between items-center mb-6">
                <div className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400" style={{ fontFamily: D.head }}>SCOUTING SIGNALS</div>
                <Dna size={16} className="text-rose-500" />
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'High Potential', color: 'emerald' },
                  { label: 'Closer', color: 'sky' },
                  { label: 'Under Pressure', color: 'rose' },
                  { label: 'Technical Elite', color: 'violet' },
                  { label: 'Aggressive', color: 'orange' }
                ].map(tag => (
                  <Badge 
                    key={tag.label} 
                    variant="outline"
                    className={`
                      text-[10px] px-2 py-0.5 font-black uppercase tracking-wider
                      bg-${tag.color}-500/5 border-${tag.color}-500/10 text-${tag.color}-400
                    `}
                  >
                    {tag.label}
                  </Badge>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
