"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DRILLS, Drill, DrillCategory, DrillDifficulty } from "@/lib/drills";
import { Search, Filter, Clock, Users, Dumbbell, ChevronDown, ChevronUp, PlayCircle, Info, Shield, Award, Target, BookOpen } from "lucide-react";
import { D } from '@/lib/design-system';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function DrillsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<DrillCategory | 'All'>('All');
  const [expandedDrillId, setExpandedDrillId] = useState<string | null>(null);

  const filteredDrills = DRILLS.filter(drill => {
    const matchesSearch = drill.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          drill.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || drill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (id: string) => {
    setExpandedDrillId(expandedDrillId === id ? null : id);
  };

  const getDifficultyConfig = (difficulty: DrillDifficulty) => {
    switch (difficulty) {
      case 'Beginner': return { color: D.emerald, label: 'FOUNDATION' };
      case 'Intermediate': return { color: D.amber, label: 'COMPETENT' };
      case 'Advanced': return { color: D.rose, label: 'ELITE' };
      default: return { color: D.textMuted, label: 'GENERAL' };
    }
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Strategic Command Header */}
      <div className="relative p-10 rounded-[3rem] border overflow-hidden shadow-2xl" 
           style={{ background: D.surf1, borderColor: D.border }}>
        <div className="absolute inset-0 opacity-10" style={{ background: D.gradMain }} />
        <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
          <div className="h-24 w-24 rounded-3xl flex items-center justify-center shadow-inner" 
               style={{ background: D.surf2, border: `1px solid ${D.border}` }}>
             <Target className="h-12 w-12 text-indigo-500" />
          </div>
          <div className="text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic leading-none" 
                style={{ fontFamily: D.head, color: D.textPrimary }}>
              DRILL <span style={{ color: D.indigo }}>LIBRARY</span>
            </h1>
            <p className="text-[12px] font-black uppercase tracking-[0.4em] mt-4 opacity-60 italic" style={{ color: D.textMuted }}>
                INSTITUTIONAL PERFORMANCE CURRICULUM & TECHNICAL REPOSITORY
            </p>
          </div>
          <div className="lg:ml-auto w-full lg:w-auto">
             <div className="flex items-center px-8 h-16 rounded-2xl border" style={{ background: D.surf2, borderColor: D.border }}>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">CATALOGUED DRILLS: <span className="text-white opacity-100 italic" style={{ color: D.indigo }}>{DRILLS.length} UNITS</span></p>
             </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Hub */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6 p-4 rounded-[2rem] border" 
           style={{ background: D.surf1, borderColor: D.border }}>
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-all" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH REPOSITORY BY TECHNICAL FOCUS OR KEYWORD..."
            className="w-full h-16 pl-16 pr-8 rounded-2xl bg-black/5 border-transparent focus:border-indigo-500/30 focus:bg-white/5 outline-none transition-all text-xs font-black tracking-widest uppercase"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 p-1.5 rounded-2xl overflow-x-auto" style={{ background: D.surf2 }}>
          {['All', 'Batting', 'Bowling', 'Fielding', 'Fitness', 'Wicketkeeping'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as any)}
              className={cn(
                "px-6 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
                selectedCategory === cat ? "text-white shadow-xl" : "opacity-40 hover:opacity-100"
              )}
              style={{ background: selectedCategory === cat ? D.indigo : 'transparent' }}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Drills Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredDrills.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-24 text-center rounded-[3rem] border border-dashed flex flex-col items-center gap-4" 
              style={{ borderColor: D.border }}
            >
               <BookOpen className="h-12 w-12 opacity-10 animate-pulse" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">NO PERFORMANCE MODULES MATCH SELECTED TOPOLOGY</p>
            </motion.div>
          ) : (
            filteredDrills.map((drill, idx) => {
              const diff = getDifficultyConfig(drill.difficulty);
              const isExpanded = expandedDrillId === drill.drillId;
              
              return (
                <motion.div
                  layout
                  key={drill.drillId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "group relative p-8 rounded-[2.5rem] border overflow-hidden shadow-2xl transition-all duration-500",
                    isExpanded && "col-span-full"
                  )}
                  style={{ background: D.surf1, borderColor: isExpanded ? D.indigo : D.border }}
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-[0.2em]" 
                             style={{ background: `${D.indigo}08`, borderColor: `${D.indigo}20`, color: D.indigo }}>
                          {drill.category.toUpperCase()}
                        </div>
                        <div className="px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-[0.2em]" 
                             style={{ background: `${diff.color}08`, borderColor: `${diff.color}20`, color: diff.color }}>
                          {diff.label}
                        </div>
                      </div>
                      <h3 className="text-2xl font-black italic uppercase tracking-tighter transition-colors group-hover:text-indigo-400" 
                          style={{ fontFamily: D.head, color: D.textPrimary }}>
                        {drill.title}
                      </h3>
                    </div>
                    <div className="h-16 w-16 rounded-2xl flex items-center justify-center border shadow-inner transition-colors duration-500 group-hover:bg-indigo-500/10" 
                         style={{ background: D.surf2, borderColor: D.border }}>
                       <Dumbbell className="h-8 w-8 text-indigo-500" />
                    </div>
                  </div>

                  <p className="text-sm font-bold opacity-60 leading-relaxed mb-8" style={{ color: D.textMuted }}>
                    {drill.description}
                  </p>

                  <div className="flex items-center gap-8 mb-8 pb-8 border-b" style={{ borderColor: D.border }}>
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="opacity-40" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-0.5">DURATION</span>
                        <span className="text-xs font-black uppercase tracking-tight">{drill.durationMinutes} MINS</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users size={16} className="opacity-40" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-0.5">CAPACITY</span>
                        <span className="text-xs font-black uppercase tracking-tight">{drill.minPlayers}-{drill.maxPlayers} PLAYERS</span>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-4"
                      >
                        <div className="space-y-6">
                           <div className="flex items-center gap-3">
                              <Info size={14} className="text-indigo-500" />
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">TECHNICAL EQUIPMENT</h4>
                           </div>
                           <div className="flex flex-wrap gap-2">
                             {drill.equipment.map((item, i) => (
                               <div key={i} className="px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest" 
                                    style={{ background: D.surf2, borderColor: D.border }}>
                                 {item}
                               </div>
                             ))}
                           </div>
                        </div>

                        <div className="space-y-6 lg:col-span-2">
                           <div className="flex items-center gap-3">
                              <Target size={14} className="text-sky-500" />
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">OPERATIONAL PROTOCOL</h4>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                              <div className="space-y-4">
                                 <p className="text-[9px] font-black uppercase tracking-[0.2em] italic opacity-40 text-indigo-500">PHASED INSTRUCTIONS</p>
                                 <ol className="space-y-4">
                                   {drill.instructions.map((step, i) => (
                                     <li key={i} className="flex gap-4">
                                       <span className="text-xs font-black opacity-20 italic">0{i+1}</span>
                                       <p className="text-sm font-bold opacity-80" style={{ color: D.textPrimary }}>{step}</p>
                                     </li>
                                   ))}
                                 </ol>
                              </div>
                              <div className="space-y-4">
                                 <p className="text-[9px] font-black uppercase tracking-[0.2em] italic opacity-40 text-emerald-500">COACHING NODES</p>
                                 <ul className="space-y-4">
                                   {drill.coachingPoints.map((point, i) => (
                                     <li key={i} className="flex gap-4">
                                       <Award size={14} className="text-emerald-500 flex-shrink-0 mt-1" />
                                       <p className="text-sm font-bold opacity-80" style={{ color: D.textPrimary }}>{point}</p>
                                     </li>
                                   ))}
                                 </ul>
                              </div>
                           </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-8">
                    <Button 
                      variant="ghost" 
                      onClick={() => toggleExpand(drill.drillId)}
                      className="w-full h-14 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-black/5"
                      style={{ background: D.surf2, borderColor: D.border }}
                    >
                      {isExpanded ? (
                        <>COLLAPSE TECHNICAL MODULE <ChevronUp className="ml-3 h-4 w-4" /></>
                      ) : (
                        <>EXPAND TECHNICAL MODULE <ChevronDown className="ml-3 h-4 w-4" /></>
                      )}
                    </Button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
