"use client";

import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Users, 
  ChevronRight, 
  ShieldCheck, 
  AlertCircle,
  MoreVertical,
  Activity,
  ArrowUpRight,
  Droplets,
  Wind,
  Layers
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { D } from "@/lib/design-system";
import { cn } from "@/lib/utils";

import Link from 'next/link';

interface FieldCardProps {
  field: any;
  index: number;
}

export function FieldCard({ field, index }: FieldCardProps) {
  const getConditionColor = (cond: string) => {
    switch (cond) {
      case 'PRISTINE': return D.emerald;
      case 'EXCELLENT': return D.indigo;
      case 'STABLE': return D.sky;
      case 'CRITICAL': return D.rose;
      default: return D.amber;
    }
  };

  const condColor = getConditionColor(field.condition);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative p-8 rounded-[2.5rem] border overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-emerald-500/10 hover:border-emerald-500/30 bg-white dark:bg-[#121218] border-zinc-200 dark:border-white/10"
    >
      <div className="flex justify-between items-start mb-10">
         <div 
           className="h-16 w-16 rounded-2xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-110 duration-500 bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10"
         >
            <Layers className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
         </div>
         <div className={cn(
           "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
           field.status === 'AVAILABLE' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/30" : 
           field.status === 'MAINTENANCE' ? "bg-rose-500/10 text-rose-600 dark:text-rose-500 border-rose-500/30" : "bg-sky-500/10 text-sky-600 dark:text-sky-500 border-sky-500/30"
         )}>
            {field.status}
         </div>
      </div>

      <div className="mb-10">
         <span className="text-[10px] font-black italic opacity-40 dark:opacity-20 uppercase text-zinc-500 dark:text-zinc-400" style={{ fontFamily: D.mono }}>LOC_ID #{field.id.padStart(4, '0')}</span>
         <h3 
           className="text-3xl font-black italic uppercase tracking-tighter mt-1 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors text-zinc-900 dark:text-white" 
           style={{ fontFamily: D.head }}
         >
           {field.name}
         </h3>
         <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 dark:opacity-40 mt-2 text-zinc-600 dark:text-zinc-400">{field.surface}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 p-6 rounded-2xl bg-zinc-50 dark:bg-black/10 border border-zinc-200 dark:border-white/10 mb-10">
         <div className="space-y-1">
            <p className="text-[8px] font-black uppercase tracking-tighter opacity-60 dark:opacity-40 text-zinc-500 dark:text-zinc-400">CONDITION</p>
            <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: condColor }} />
               <p className="text-sm font-black italic uppercase" style={{ fontFamily: D.mono, color: condColor }}>{field.condition}</p>
            </div>
         </div>
         <div className="space-y-1 border-l pl-4 border-zinc-200 dark:border-white/5">
            <p className="text-[8px] font-black uppercase tracking-tighter opacity-60 dark:opacity-40 text-zinc-500 dark:text-zinc-400">MAINTENANCE</p>
            <p className="text-sm font-black italic uppercase text-zinc-900 dark:text-white" style={{ fontFamily: D.mono }}>{field.maintenance}</p>
         </div>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-200 dark:border-white/10 pt-8">
         <div className="flex items-center gap-6">
            <div className="flex flex-col">
               <span className="text-[8px] font-black uppercase tracking-tighter opacity-60 dark:opacity-40 text-zinc-500 dark:text-zinc-400">ACTIVE BOOKINGS</span>
               <span className="text-xs font-black italic text-zinc-900 dark:text-white" style={{ fontFamily: D.mono }}>{field.bookings} SLOTS</span>
            </div>
            <div className="flex flex-col border-l pl-6 border-zinc-200 dark:border-white/5">
               <span className="text-[8px] font-black uppercase tracking-tighter opacity-60 dark:opacity-40 text-zinc-500 dark:text-zinc-400">SOIL MOISTURE</span>
               <span className="text-xs font-black italic text-zinc-900 dark:text-white" style={{ fontFamily: D.mono }}>64%</span>
            </div>
         </div>
         <Link href={`/fields/${field.id}`}>
            <button className="h-12 w-12 rounded-xl border border-zinc-200 dark:border-white/10 flex items-center justify-center transition-all hover:bg-emerald-500 hover:text-white group/btn text-zinc-700 dark:text-white cursor-pointer">
               <ArrowUpRight size={18} className="transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
            </button>
         </Link>
      </div>
    </motion.div>
  );
}
