"use client";

import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Plus, Sparkles, TrendingUp, TrendingDown, Target, Search, Filter, Shield, Zap, Brain, ChevronRight, Activity, Award, UserPlus, FileText } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { D } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { MetricCard } from "../dashboard/MetricCard";
import { SectionHeader } from "../ui/SectionHeader";

import ScoutReportForm from './ScoutReportForm';
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Mock data for initial UI rendering
const MOCK_PROSPECTS = [
    { 
        id: '1', 
        name: 'James Anderson', 
        role: 'Fast Bowler', 
        age: 16, 
        scoutGrade: 'A+', 
        potential: 'ELITE', 
        metrics: { velocity: 88, accuracy: 92, stamina: 85 },
        trend: 'up',
        reports: 12
    },
    { 
        id: '2', 
        name: 'Liam Smith', 
        role: 'Opening Batter', 
        age: 17, 
        scoutGrade: 'A', 
        potential: 'HIGH', 
        metrics: { timing: 90, power: 78, defense: 95 },
        trend: 'same',
        reports: 8
    },
    { 
        id: '3', 
        name: 'Noah Patel', 
        role: 'All-Rounder', 
        age: 15, 
        scoutGrade: 'B+', 
        potential: 'HIGH', 
        metrics: { versatility: 94, impact: 82, composure: 75 },
        trend: 'down',
        reports: 15
    },
    { 
        id: '4', 
        name: 'Ethan Williams', 
        role: 'Wicketkeeper', 
        age: 18, 
        scoutGrade: 'B', 
        potential: 'MEDIUM', 
        metrics: { reflexes: 96, hands: 94, agility: 88 },
        trend: 'up',
        reports: 6
    },
];

const ProspectCard = ({ prospect, idx }: { prospect: any; idx: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: idx * 0.1 }}
    whileHover={{ y: -8 }}
    className="group relative"
  >
    <div 
      className="relative p-8 rounded-[2.5rem] border overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-indigo-500/10 hover:border-indigo-500/30"
      style={{ background: D.surf1, borderColor: D.border }}
    >
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-3">
          <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none group-hover:text-indigo-400 transition-colors" 
              style={{ fontFamily: D.head, color: D.textPrimary }}>
            {prospect.name}
          </h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic" style={{ color: D.textMuted }}>
            {prospect.role} • {prospect.age} YRS
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-4xl font-black italic leading-none" style={{ 
            fontFamily: D.head,
            color: prospect.scoutGrade.startsWith('A') ? D.emerald : D.amber
          }}>
            {prospect.scoutGrade}
          </div>
          <div className="flex items-center gap-2 px-2 py-0.5 rounded-lg border shadow-inner" 
               style={{ background: D.surf2, borderColor: D.border }}>
            {prospect.trend === 'up' ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : 
             prospect.trend === 'down' ? <TrendingDown className="h-3 w-3 text-rose-500" /> : 
             <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
            <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: D.textMuted }}>{prospect.potential}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {Object.entries(prospect.metrics).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">{key}</span>
              <span className="text-[10px] font-black italic" style={{ fontFamily: D.mono, color: D.indigo }}>{value as number}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: D.surf2 }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                className="h-full relative overflow-hidden"
                style={{ 
                  background: prospect.scoutGrade.startsWith('A') ? D.emerald : D.indigo
                }}
              >
                 <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: D.border }}>
        <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                    <div 
                      key={i} 
                      className="w-8 h-8 rounded-full border flex items-center justify-center shadow-inner group-hover:-translate-x-1 transition-transform"
                      style={{ background: D.surf2, borderColor: D.border }}
                    >
                       <FileText size={10} className="opacity-40" />
                    </div>
                ))}
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-40 italic">{prospect.reports} INTEL LOGS</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-10 w-10 rounded-xl border flex items-center justify-center transition-all group-hover:bg-indigo-500 group-hover:text-white"
          style={{ background: D.surf2, borderColor: D.border }}
        >
            <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  </motion.div>
);

export default function ScoutingDashboard() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>('1');

    return (
        <div className="space-y-12 pb-24">
            {/* Standardized Header */}
            <SectionHeader 
              title="Personnel Intel"
              sub="Moneyball-grade scouting network & performance pipeline."
              icon={<Brain className="w-5 h-5 text-indigo-400" />}
              actions={
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-all" size={14} />
                    <input 
                      type="text" 
                      placeholder="SEARCH PROSPECTS..."
                      className="h-11 pl-11 pr-4 rounded-xl bg-white/[0.03] border border-white/5 focus:border-indigo-500/30 focus:bg-white/5 outline-none transition-all text-[10px] font-black tracking-widest uppercase w-48 lg:w-64"
                    />
                  </div>
                  <Button 
                    onClick={() => setIsFormOpen(true)}
                    className="h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20" 
                    style={{ background: D.indigo, color: 'white' }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    CREATE REPORT
                  </Button>
                </div>
              }
            />

            {/* Scout Evaluation Modal */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogContent className="max-w-4xl bg-transparent border-0 p-0 overflow-hidden shadow-2xl">
                <ScoutReportForm 
                  playerId={selectedPlayerId} 
                  onSave={() => setIsFormOpen(false)}
                  onCancel={() => setIsFormOpen(false)}
                />
              </DialogContent>
            </Dialog>

            {/* Strategic Intel HUD */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'ACTIVE PIPELINE', value: '142', subtitle: '+12 WEEKLY', icon: Target, color: D.indigo },
                    { label: 'ELITE POTENTIAL', value: '14', subtitle: 'READY FOR 1ST XI', icon: Sparkles, color: D.emerald },
                    { label: 'NETWORK CONFIDENCE', value: '92%', subtitle: 'HIGH RELIABILITY', icon: Shield, color: D.sky },
                    { label: 'INTEL COVERAGE', value: '48', subtitle: 'SCHOOLS MONITORED', icon: Brain, color: D.violet },
                ].map((stat, i) => (
                    <MetricCard key={i} {...stat} />
                ))}
            </div>

            {/* Prospects Grid */}
            <SectionHeader 
              title="Tracked Prospects" 
              sub="High-priority talent identified through the regional scout network."
              color={D.indigo}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:mt-[-1rem]">
                {MOCK_PROSPECTS.map((prospect, i) => (
                    <ProspectCard key={prospect.id} prospect={prospect} idx={i} />
                ))}
            </div>

            {/* Global Intelligence Alert */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative p-6 rounded-[2rem] border overflow-hidden shadow-2xl"
              style={{ background: D.surf1, borderColor: `${D.indigo}40` }}
            >
                <div className="absolute inset-0 opacity-5" style={{ background: D.gradMain }} />
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-inner animate-pulse" 
                         style={{ background: `${D.indigo}20`, border: `1px solid ${D.indigo}40` }}>
                       <Zap className="h-8 w-8 text-indigo-500" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: D.indigo }}>GLOBAL INTELLIGENCE ALERT</p>
                        <p className="text-sm font-bold opacity-80" style={{ color: D.textPrimary }}>
                          NEW HIGH-POTENTIAL REPORT RECEIVED FOR <span className="text-white italic underline decoration-indigo-500/50">LIAM SMITH</span> (OPENING BATTER). 
                          POTENTIAL RECALCULATED TO &apos;ELITE&apos; BASED ON RECENT GRADE CRITERIA.
                        </p>
                    </div>
                    <Button 
                      className="h-14 px-10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95"
                      style={{ background: D.indigo, color: 'white' }}
                    >
                      REVIEW INTEL NODE
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
