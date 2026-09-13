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
  Wind,
  CalendarDays
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { FieldCard } from "./FieldCard";
import { TurfFacilityBookingGrid } from "./TurfFacilityBookingGrid";
import { D } from "@/lib/design-system";
import { cn } from "@/lib/utils";

import Link from 'next/link';

const MOCK_FIELDS = [
  { id: '1', name: 'MAIN OVAL (THE RIDGE)', surface: 'NATURAL GRASS', status: 'AVAILABLE', condition: 'PRISTINE', maintenance: '02 MAR', bookings: 4 },
  { id: '2', name: 'NORTH ACADEMY OVAL', surface: 'HYBRID TURF', status: 'IN USE', condition: 'EXCELLENT', maintenance: '05 MAR', bookings: 6 },
  { id: '3', name: 'SOUTH PRACTICE NETS', surface: 'ASTRO TURF', status: 'AVAILABLE', condition: 'STABLE', maintenance: '01 MAR', bookings: 12 },
  { id: '4', name: 'CENTRAL SQUARE (TURF)', surface: 'TURF SQUARES', status: 'MAINTENANCE', condition: 'CRITICAL', maintenance: 'HEAVILY WIP', bookings: 0 },
];

export function FieldsClient() {
  const [view, setView] = useState<'bookingGrid' | 'grid' | 'map'>('bookingGrid');
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-12 pb-24">
      {/* Strategic Command Header */}
      <div 
        className="relative p-8 md:p-10 rounded-[3rem] border overflow-hidden shadow-2xl bg-white dark:bg-[#121218] border-zinc-200 dark:border-white/10"
      >
        <div className="absolute inset-0 opacity-10" style={{ background: D.gradMain }} />
        <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
          <div 
            className="h-24 w-24 rounded-3xl flex items-center justify-center shadow-inner bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10"
          >
             <MapIcon className="h-12 w-12 text-emerald-500" />
          </div>
          <div className="text-center lg:text-left">
            <h1 
              className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic leading-none text-zinc-900 dark:text-white" 
              style={{ fontFamily: D.head }}
            >
              FACILITY <span className="text-emerald-500">MAPPING</span>
            </h1>
            <p className="text-[12px] font-black uppercase tracking-[0.4em] mt-4 opacity-60 italic text-zinc-500 dark:text-zinc-400">
                SITUATIONAL GROUNDS & INFRASTRUCTURE DIRECTORY
            </p>
          </div>
          <div className="lg:ml-auto flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
             <div className="flex items-center gap-2 p-1 rounded-2xl border bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 flex-wrap">
                <button 
                  onClick={() => setView('bookingGrid')}
                  className={cn(
                    "h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2",
                    view === 'bookingGrid' ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  )}>
                  <CalendarDays size={16} /> BOOKING GRID
                </button>
                <button 
                  onClick={() => setView('grid')}
                  className={cn(
                    "h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2",
                    view === 'grid' ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  )}>
                  <LayoutGrid size={16} /> DIRECTORY
                </button>
                <button 
                  onClick={() => setView('map')}
                  className={cn(
                    "h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2",
                    view === 'map' ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  )}>
                  <Globe size={16} /> RADAR
                </button>
             </div>
             <Link href="/fields/new">
               <Button className="h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl bg-emerald-500 hover:bg-emerald-400 text-white cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" /> ADD FACILITY
               </Button>
             </Link>
          </div>
        </div>
      </div>

      {view === 'bookingGrid' ? (
        <TurfFacilityBookingGrid />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
           {/* Filter Hub */}
           <div className="lg:col-span-1 space-y-8">
              <div 
                className="p-8 rounded-[2.5rem] border overflow-hidden shadow-2xl relative bg-white dark:bg-[#121218] border-zinc-200 dark:border-white/10"
              >
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-8 pb-4 border-b border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white">FILTER INTEL</h4>
                 
                 <div className="space-y-10">
                    <div className="space-y-3">
                       <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2 text-zinc-500 dark:text-zinc-400">SEARCH REGISTRY</label>
                       <div className="relative group">
                          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-white/20 group-focus-within:text-emerald-500 transition-colors" />
                          <input 
                             value={search}
                             onChange={(e) => setSearch(e.target.value)}
                             className="w-full h-14 pl-14 pr-6 rounded-xl bg-zinc-50 dark:bg-black/10 border border-zinc-200 dark:border-white/5 focus:border-emerald-500/50 outline-none transition-all font-bold text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500" 
                             placeholder="FIELD NAME / ID..." 
                          />
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-4">
                          <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2 text-zinc-500 dark:text-zinc-400">SURFACE TOPOLOGY</label>
                          {['NATURAL GRASS', 'HYBRID TURF', 'TURF SQUARES', 'ASTRO TURF'].map(type => (
                             <label key={type} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/5 cursor-pointer hover:border-emerald-500/30 transition-all group">
                                <input type="checkbox" className="accent-emerald-500 h-4 w-4" />
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity text-zinc-900 dark:text-white">{type}</span>
                             </label>
                          ))}
                       </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 space-y-4">
                       <div className="flex items-center gap-3">
                          <Droplets size={16} className="text-emerald-500" />
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">IRRIGATION STATUS</h5>
                       </div>
                       <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 italic leading-relaxed">AUTOMATIC CYCLES DELAYED BY 12 HOURS DUE TO PREDICTED PRECIPITATION.</p>
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
                     className="h-[600px] rounded-[3rem] border border-dashed border-zinc-300 dark:border-white/20 flex flex-col items-center justify-center gap-6 bg-white dark:bg-[#121218]"
                   >
                      <div className="relative">
                         <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/10" />
                         <Globe className="h-24 w-24 text-emerald-500/20" />
                      </div>
                      <div className="text-center space-y-2">
                         <h3 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white" style={{ fontFamily: D.head }}>RADAR OFFLINE</h3>
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic text-zinc-500 dark:text-zinc-400">GEOSPATIAL COORDINATES NOT FOUND IN DATABASE</p>
                      </div>
                   </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      )}
    </div>
  );
}
