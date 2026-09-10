"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  MapPin, 
  Globe, 
  Calendar, 
  Search, 
  Filter, 
  Map as MapIcon, 
  LayoutGrid, 
  Droplets, 
  CloudRain, 
  ShieldCheck, 
  AlertCircle,
  MoreVertical,
  Activity,
  ArrowUpRight,
  Wind
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { FieldCard } from "./FieldCard";
import { D } from "@/lib/design-system";
import { cn } from "@/lib/utils";

const MOCK_FIELDS = [
  { id: '1', name: 'MAIN OVAL (THE RIDGE)', surface: 'NATURAL GRASS', status: 'AVAILABLE', condition: 'PRISTINE', maintenance: '02 MAR', bookings: 4 },
  { id: '2', name: 'NORTH ACADEMY OVAL', surface: 'HYBRID TURF', status: 'IN USE', condition: 'EXCELLENT', maintenance: '05 MAR', bookings: 6 },
  { id: '3', name: 'SOUTH PRACTICE NETS', surface: 'ASTRO TURF', status: 'AVAILABLE', condition: 'STABLE', maintenance: '01 MAR', bookings: 12 },
  { id: '4', name: 'CENTRAL SQUARE (TURF)', surface: 'TURF SQUARES', status: 'MAINTENANCE', condition: 'CRITICAL', maintenance: 'HEAVILY WIP', bookings: 0 },
];

export function FieldsClient() {
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-12 pb-24">
      {/* Strategic Command Header */}
      <div className="relative p-10 rounded-[3rem] border overflow-hidden shadow-2xl" 
           style={{ background: D.surf1, borderColor: D.border }}>
        <div className="absolute inset-0 opacity-10" style={{ background: D.gradMain }} />
        <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
          <div className="h-24 w-24 rounded-3xl flex items-center justify-center shadow-inner" 
               style={{ background: D.surf2, border: `1px solid ${D.border}` }}>
             <MapIcon className="h-12 w-12 text-emerald-500" />
          </div>
          <div className="text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic leading-none" 
                style={{ fontFamily: D.head, color: D.textPrimary }}>
              FACILITY <span style={{ color: D.emerald }}>MAPPING</span>
            </h1>
            <p className="text-[12px] font-black uppercase tracking-[0.4em] mt-4 opacity-60 italic" style={{ color: D.textMuted }}>
                SITUATIONAL GROUNDS & INFRASTRUCTURE DIRECTORY
            </p>
          </div>
          <div className="lg:ml-auto flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
             <div className="flex items-center gap-4 p-1 rounded-2xl border" style={{ background: D.surf2, borderColor: D.border }}>
                <button 
                  onClick={() => setView('grid')}
                  className={cn(
                    "h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3",
                    view === 'grid' ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20" : "text-white/40 hover:text-white"
                  )}>
                  <LayoutGrid size={16} /> GRID
                </button>
                <button 
                  onClick={() => setView('map')}
                  className={cn(
                    "h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3",
                    view === 'map' ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20" : "text-white/40 hover:text-white"
                  )}>
                  <Globe size={16} /> RADAR
                </button>
             </div>
             <Button className="h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl" style={{ background: D.emerald }}>
                <Plus className="mr-2 h-4 w-4" /> ADD FACILITY
             </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
         {/* Filter Hub */}
         <div className="lg:col-span-1 space-y-8">
            <div className="p-8 rounded-[2.5rem] border overflow-hidden shadow-2xl relative" 
                 style={{ background: D.surf1, borderColor: D.border }}>
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-8 pb-4 border-b" style={{ borderColor: D.border }}>FILTER INTEL</h4>
               
               <div className="space-y-10">
                  <div className="space-y-3">
                     <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">SEARCH REGISTRY</label>
                     <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
                        <input 
                           value={search}
                           onChange={(e) => setSearch(e.target.value)}
                           className="w-full h-14 pl-14 pr-6 rounded-xl bg-black/10 border border-white/5 focus:border-emerald-500/50 outline-none transition-all font-bold text-sm" 
                           placeholder="FIELD NAME / ID..." 
                        />
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">SURFACE TOPOLOGY</label>
                        {['NATURAL GRASS', 'HYBRID TURF', 'TURF SQUARES', 'ASTRO TURF'].map(type => (
                           <label key={type} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5 cursor-pointer hover:border-emerald-500/30 transition-all group">
                              <input type="checkbox" className="accent-emerald-500 h-4 w-4" />
                              <span className="text-[9px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{type}</span>
                           </label>
                        ))}
                     </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-4">
                     <div className="flex items-center gap-3">
                        <Droplets size={16} className="text-emerald-500" />
                        <h5 className="text-[10px] font-black uppercase tracking-widest">IRRIGATION STATUS</h5>
                     </div>
                     <p className="text-[9px] font-bold text-emerald-400 italic leading-relaxed">AUTOMATIC CYCLES DELAYED BY 12 HOURS DUE TO PREDICTED PRECIPITATION.</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Grid View */}
         <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
               {view === 'grid' ? (
                 <motion.div 
                   key="grid"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                   className="grid grid-cols-1 md:grid-cols-2 gap-10"
                 >
                    {MOCK_FIELDS.map((field, i) => (
                       <FieldCard key={field.id} field={field} index={i} />
                    ))}
                 </motion.div>
               ) : (
                 <motion.div 
                   key="map"
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="h-[600px] rounded-[3rem] border border-dashed flex flex-col items-center justify-center gap-6"
                   style={{ background: D.surf1, borderColor: D.border }}
                 >
                    <div className="relative">
                       <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/10" />
                       <Globe className="h-24 w-24 text-emerald-500/20" />
                    </div>
                    <div className="text-center space-y-2">
                       <h3 className="text-2xl font-black italic uppercase tracking-tighter" style={{ fontFamily: D.head }}>RADAR OFFLINE</h3>
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic">GEOSPATIAL COORDINATES NOT FOUND IN DATABASE</p>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
