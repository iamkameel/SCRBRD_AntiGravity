"use client";

import React, { useState } from 'react';
import { 
  Bus, 
  MapPin, 
  Clock, 
  Users, 
  ChevronRight, 
  Plus, 
  ShieldCheck, 
  AlertCircle,
  Navigation,
  Fuel,
  Wrench,
  UserCheck,
  Calendar,
  MoreVertical,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { D } from "@/lib/design-system";
import { cn } from "@/lib/utils";

const FLEET = [
  { id: 'BUS-01', name: 'TITAN EXPRESS', capacity: 24, status: 'AVAILABLE', mileage: '12,400 KM', health: 98, lastService: '12 MAR 2026' },
  { id: 'BUS-02', name: 'STRIKER SHUTTLE', capacity: 16, status: 'IN TRANSIT', mileage: '8,200 KM', health: 85, lastService: '05 MAR 2026' },
  { id: 'VAN-03', name: 'SCOUT UNIT', capacity: 8, status: 'MAINTENANCE', mileage: '4,100 KM', health: 40, lastService: '18 FEB 2026' },
];

const UPCOMING_TRIPS = [
  { id: 'TRIP-742', fixture: 'VS ST JOHNS (AWAY)', time: '07:30', vehicle: 'BUS-01', driver: 'M. PETERSON', passengers: 22, status: 'CONFIRMED' },
  { id: 'TRIP-745', fixture: 'VS PRETORIA BOYS', time: '13:15', vehicle: 'BUS-02', driver: 'T. KHUMALO', passengers: 14, status: 'DRAFT' },
];

export function TransportHub() {
  const [activeTab, setActiveTab] = useState<'fleet' | 'trips'>('fleet');

  return (
    <div className="space-y-12 pb-24">
      {/* Strategic Command Header */}
      <div className="relative p-10 rounded-[3rem] border overflow-hidden shadow-2xl" 
           style={{ background: D.surf1, borderColor: D.border }}>
        <div className="absolute inset-0 opacity-10" style={{ background: D.gradMain }} />
        <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
          <div className="h-24 w-24 rounded-3xl flex items-center justify-center shadow-inner" 
               style={{ background: D.surf2, border: `1px solid ${D.border}` }}>
             <Bus className="h-12 w-12 text-indigo-500" />
          </div>
          <div className="text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-none" 
                style={{ fontFamily: D.head, color: D.textPrimary }}>
              TRANSPORT <span style={{ color: D.sky }}>HUB</span>
            </h1>
            <p className="text-[12px] font-black uppercase tracking-[0.4em] mt-4 opacity-60 italic" style={{ color: D.textMuted }}>
                MISSION LOGISTICS & FLEET DEPLOYMENT ENGINE
            </p>
          </div>
          <div className="lg:ml-auto flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
             <div className="flex items-center gap-4 p-1 rounded-2xl border" style={{ background: D.surf2, borderColor: D.border }}>
                <button 
                  onClick={() => setActiveTab('fleet')}
                  className={cn(
                    "h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                    activeTab === 'fleet' ? "bg-indigo-500 text-white shadow-xl shadow-indigo-500/20" : "text-white/40 hover:text-white"
                  )}>
                  FLEET ASSETS
                </button>
                <button 
                  onClick={() => setActiveTab('trips')}
                  className={cn(
                    "h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                    activeTab === 'trips' ? "bg-indigo-500 text-white shadow-xl shadow-indigo-500/20" : "text-white/40 hover:text-white"
                  )}>
                  TRIP DOSSIER
                </button>
             </div>
             <Button className="h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl" style={{ background: D.indigo }}>
                <Plus className="mr-2 h-4 w-4" /> CREATE TRIP
             </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
         <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
               {activeTab === 'fleet' ? (
                 <motion.div 
                   key="fleet"
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 20 }}
                   className="grid grid-cols-1 md:grid-cols-2 gap-8"
                 >
                    {FLEET.map((asset, i) => (
                      <div key={asset.id} className="group relative p-8 rounded-[2.5rem] border overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-indigo-500/10 hover:border-indigo-500/30"
                           style={{ background: D.surf1, borderColor: D.border }}>
                         <div className="flex justify-between items-start mb-8">
                            <div className="h-14 w-14 rounded-2xl flex items-center justify-center border" style={{ background: D.surf2, borderColor: D.border }}>
                               <Bus className="h-6 w-6 text-indigo-400" />
                            </div>
                            <div className={cn(
                              "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                              asset.status === 'AVAILABLE' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : 
                              asset.status === 'MAINTENANCE' ? "bg-rose-500/10 text-rose-500 border-rose-500/30" : "bg-sky-500/10 text-sky-500 border-sky-500/30"
                            )}>
                               {asset.status}
                            </div>
                         </div>
                         
                         <div className="mb-8">
                            <span className="text-[10px] font-black italic opacity-20" style={{ fontFamily: D.mono }}>ASSET #{asset.id}</span>
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter mt-1 group-hover:text-indigo-400 transition-colors" style={{ fontFamily: D.head }}>{asset.name}</h3>
                         </div>

                         <div className="grid grid-cols-3 gap-4 p-6 rounded-2xl bg-black/10 border mb-8" style={{ borderColor: D.border }}>
                            <div className="space-y-1 text-center">
                               <p className="text-[8px] font-black uppercase tracking-tighter opacity-40">CAPACITY</p>
                               <p className="text-sm font-black italic" style={{ fontFamily: D.mono }}>{asset.capacity}</p>
                            </div>
                            <div className="space-y-1 text-center border-x border-white/5">
                               <p className="text-[8px] font-black uppercase tracking-tighter opacity-40">MILEAGE</p>
                               <p className="text-sm font-black italic" style={{ fontFamily: D.mono }}>{asset.mileage}</p>
                            </div>
                            <div className="space-y-1 text-center">
                               <p className="text-[8px] font-black uppercase tracking-tighter opacity-40">HEALTH</p>
                               <p className="text-sm font-black italic" style={{ fontFamily: D.mono, color: asset.health > 80 ? D.emerald : asset.health > 50 ? D.amber : D.rose }}>{asset.health}%</p>
                            </div>
                         </div>

                         <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-40">
                             <div className="flex items-center gap-2 italic"><Wrench size={12} /> LAST SVC: {asset.lastService}</div>
                             <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                         </div>
                      </div>
                    ))}
                 </motion.div>
               ) : (
                 <motion.div 
                   key="trips"
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 20 }}
                   className="space-y-6"
                 >
                    {UPCOMING_TRIPS.map((trip, i) => (
                      <div key={trip.id} className="group p-8 rounded-[2rem] border transition-all duration-500 hover:shadow-sky-500/10 hover:border-sky-500/30"
                           style={{ background: D.surf1, borderColor: D.border }}>
                         <div className="flex flex-col md:flex-row items-center gap-10">
                            <div className="h-16 w-16 rounded-2xl flex items-center justify-center border shrink-0" style={{ background: D.surf2, borderColor: D.border }}>
                               <Navigation className="h-8 w-8 text-sky-400" />
                            </div>
                            <div className="flex-1 space-y-2 text-center md:text-left">
                               <div className="flex items-center justify-center md:justify-start gap-3">
                                  <span className="text-[10px] font-black italic opacity-20" style={{ fontFamily: D.mono }}>{trip.id}</span>
                                  <Badge className="bg-sky-500/10 text-sky-500 border-sky-500/30 text-[9px] h-5">{trip.status}</Badge>
                               </div>
                               <h3 className="text-2xl font-black italic uppercase tracking-tighter" style={{ fontFamily: D.head }}>{trip.fixture}</h3>
                               <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2">
                                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40"><Clock size={12} className="text-sky-500" /> DEPART: {trip.time}</div>
                                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40"><Bus size={12} className="text-sky-500" /> {trip.vehicle}</div>
                                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40"><UserCheck size={12} className="text-sky-500" /> {trip.driver}</div>
                                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40"><Users size={12} className="text-sky-500" /> {trip.passengers} SOULS</div>
                               </div>
                            </div>
                            <Button variant="ghost" className="h-16 px-10 rounded-2xl border group-hover:bg-sky-500 group-hover:text-white transition-all font-black text-xs uppercase tracking-widest" style={{ borderColor: D.border }}>
                               VIEW LOGISTICS
                            </Button>
                         </div>
                      </div>
                    ))}
                 </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* Strategic Intelligence Sidebar */}
         <div className="space-y-10">
            <div className="p-8 rounded-[2.5rem] border overflow-hidden shadow-2xl relative" 
                 style={{ background: D.surf1, borderColor: D.border }}>
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Navigation size={64} className="text-indigo-500" />
               </div>
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-8 pb-4 border-b" style={{ borderColor: D.border }}>FLEET SUMMARY</h4>
               
               <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-6 rounded-2xl bg-black/10 border text-center" style={{ borderColor: D.border }}>
                        <p className="text-[24px] font-black italic leading-none mb-1" style={{ fontFamily: D.head, color: D.textPrimary }}>94%</p>
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-40">AVAILABILITY</p>
                     </div>
                     <div className="p-6 rounded-2xl bg-black/10 border text-center" style={{ borderColor: D.border }}>
                        <p className="text-[24px] font-black italic leading-none mb-1" style={{ fontFamily: D.head, color: D.textPrimary }}>0.4%</p>
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-40">FAILURE RATE</p>
                     </div>
                  </div>

                  <div className="space-y-6 pt-4">
                     <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">ACTIVE TRIPS</span>
                        <span className="text-xs font-black italic" style={{ fontFamily: D.mono }}>4 / 12</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">DRIVER ON-DUTY</span>
                        <span className="text-xs font-black italic" style={{ fontFamily: D.mono }}>82%</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">FUEL EFFICIENCY</span>
                        <span className="text-xs font-black italic" style={{ fontFamily: D.mono }}>9.2 L/KM</span>
                     </div>
                  </div>

                  <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex gap-4">
                    <AlertCircle size={18} className="text-rose-500 shrink-0 mt-1" />
                    <p className="text-[10px] font-bold text-rose-400 italic leading-relaxed">SCHOOL BUS (B01) SCHEDULED MAINTENANCE IS OVERDUE BY 3 DAYS.</p>
                  </div>

                  <Button className="w-full h-14 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl" variant="outline" style={{ borderColor: D.border }}>
                     DOWNLOAD LOGISTICS REPORT
                  </Button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
