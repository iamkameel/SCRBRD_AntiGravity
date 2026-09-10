"use client";

import React, { useState } from 'react';
import { 
  Shield, 
  Settings, 
  Wrench, 
  Activity, 
  Box, 
  Trash2, 
  CheckCircle2, 
  Plus, 
  MoreVertical,
  ArrowUpRight,
  Zap,
  Tag
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { D } from "@/lib/design-system";
import { cn } from "@/lib/utils";

const INITIAL_EQUIPMENT = [
  { id: 'EQ-001', name: 'TITAN CRICKET BATS', category: 'BATTING', condition: 'PRISTINE', lifespan: '95%', location: 'LOCKER A' },
  { id: 'EQ-002', name: 'PREMIUM BALL SET (30)', category: 'BOWLING', condition: 'WORN', lifespan: '40%', location: 'STORAGE 1' },
  { id: 'EQ-003', name: 'KEEPER GAUNTLETS', category: 'FIELDING', condition: 'STABLE', lifespan: '70%', location: 'LOCKER B' },
  { id: 'EQ-004', name: 'BATTING HELMETS (L)', category: 'PROTECTION', condition: 'CRITICAL', lifespan: '15%', location: 'LOCKER C' },
];

export default function EquipmentList() {
  const [equipment, setEquipment] = useState(INITIAL_EQUIPMENT);

  return (
    <div className="space-y-12 pb-24">
      {/* Strategic Command Header */}
      <div className="relative p-10 rounded-[3rem] border overflow-hidden shadow-2xl" 
           style={{ background: D.surf1, borderColor: D.border }}>
        <div className="absolute inset-0 opacity-10" style={{ background: D.gradMain }} />
        <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
          <div className="h-24 w-24 rounded-3xl flex items-center justify-center shadow-inner" 
               style={{ background: D.surf2, border: `1px solid ${D.border}` }}>
             <Box className="h-12 w-12 text-indigo-500" />
          </div>
          <div className="text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic leading-none" 
                style={{ fontFamily: D.head, color: D.textPrimary }}>
              INVENTORY <span style={{ color: D.sky }}>LOGS</span>
            </h1>
            <p className="text-[12px] font-black uppercase tracking-[0.4em] mt-4 opacity-60 italic" style={{ color: D.textMuted }}>
                CRITICAL ASSET MANAGEMENT & EQUIPMENT LIFECYCLE ENGINE
            </p>
          </div>
          <div className="lg:ml-auto flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
             <div className="flex items-center gap-6 px-10 h-16 rounded-2xl border" style={{ background: D.surf2, borderColor: D.border }}>
                <div className="flex flex-col">
                   <span className="text-[9px] font-black uppercase tracking-widest opacity-40 italic">ASSETS TRACKED</span>
                   <span className="text-xl font-black italic uppercase leading-none mt-1" style={{ fontFamily: D.mono }}>248 UNITS</span>
                </div>
                <div className="h-8 w-px bg-white/5" />
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[9px]">SYNCED</Badge>
             </div>
             <Button className="h-16 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl" style={{ background: D.indigo }}>
                <Plus className="mr-3 h-4 w-4" /> ADD ASSET
             </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {equipment.map((item, idx) => {
          const conditionColor = item.condition === 'PRISTINE' ? D.emerald : item.condition === 'STABLE' ? D.sky : item.condition === 'WORN' ? D.amber : D.rose;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative p-8 rounded-[2.5rem] border overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-indigo-500/10 hover:border-indigo-500/30"
              style={{ background: D.surf1, borderColor: D.border }}
            >
               <div className="flex justify-between items-start mb-10">
                  <div className="h-14 w-14 rounded-2xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-110 duration-500" 
                       style={{ background: D.surf2, borderColor: D.border }}>
                     <Zap className="h-6 w-6 text-indigo-400 group-hover:scale-125 transition-transform" />
                  </div>
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl border border-white/5 bg-white/5 hover:bg-rose-500/10 hover:border-rose-500/20 group/btn transition-all">
                     <Trash2 size={16} className="text-white/20 group-hover/btn:text-rose-500" />
                  </div>
               </div>

               <div className="mb-10">
                  <div className="flex items-center gap-2 mb-2">
                     <Tag size={12} className="text-indigo-500" />
                     <span className="text-[10px] font-black italic opacity-20 uppercase" style={{ fontFamily: D.mono }}>{item.category}</span>
                  </div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter group-hover:text-indigo-400 transition-colors" 
                      style={{ fontFamily: D.head, color: D.textPrimary }}>
                    {item.name}
                  </h3>
               </div>

               <div className="space-y-6">
                  <div className="space-y-2">
                     <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                        <span className="opacity-40">INTEGRITY LIFESPAN</span>
                        <span style={{ fontFamily: D.mono, color: conditionColor }}>{item.lifespan}</span>
                     </div>
                     <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: item.lifespan }}
                           className="h-full opacity-60" 
                           style={{ background: conditionColor }} 
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border bg-black/10" style={{ borderColor: D.border }}>
                     <div className="space-y-1">
                        <p className="text-[8px] font-black uppercase tracking-tighter opacity-40 text-center">LOCATION</p>
                        <p className="text-[10px] font-black italic text-center" style={{ fontFamily: D.mono }}>{item.location}</p>
                     </div>
                     <div className="space-y-1 border-l border-white/5">
                        <p className="text-[8px] font-black uppercase tracking-tighter opacity-40 text-center">HEALTH</p>
                        <p className="text-[10px] font-black italic text-center uppercase" style={{ fontFamily: D.mono, color: conditionColor }}>{item.condition}</p>
                     </div>
                  </div>
               </div>

               <button className="mt-8 w-full h-12 rounded-xl border flex items-center justify-center gap-3 transition-all hover:bg-indigo-500 hover:text-white font-black text-[9px] uppercase tracking-widest" style={{ borderColor: D.border }}>
                  VIEW ASSET SPECS
               </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
