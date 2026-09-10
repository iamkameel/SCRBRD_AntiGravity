import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building2, Calendar, Users, ChevronRight, Layers, Award, Shield, Globe } from "lucide-react";
import { D } from '@/lib/design-system';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TeamCardProps {
  team: any;
  viewMode?: 'grid' | 'list' | 'table' | 'calendar' | 'stats';
}

export function TeamCard({ team, viewMode = 'grid' }: TeamCardProps) {
  if (viewMode === 'grid') {
    return (
      <motion.div
        whileHover={{ y: -10 }}
        className="group"
      >
        <div 
          className="relative p-10 rounded-[2.5rem] border overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-indigo-500/10 hover:border-indigo-500/30"
          style={{ background: D.surf1, borderColor: D.border }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div className="space-y-4">
              <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none transition-colors group-hover:text-indigo-400" 
                  style={{ fontFamily: D.head, color: D.textPrimary }}>
                {team.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest opacity-60" 
                     style={{ background: D.surf2, borderColor: D.border, color: D.textPrimary }}>
                  {team.ageDivision?.name || 'OPEN UNIT'}
                </div>
              </div>
            </div>
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center border shadow-inner transition-colors duration-500 group-hover:bg-indigo-500/10" 
                 style={{ background: D.surf2, borderColor: D.border }}>
               <Layers className="h-8 w-8 text-indigo-500" />
            </div>
          </div>

          {/* Meta Hub */}
          <div className="grid grid-cols-1 gap-4 mb-10 pb-10 border-b" style={{ borderColor: D.border }}>
             <div className="flex items-center gap-4 px-4 py-3 rounded-2xl" style={{ background: D.surf2 }}>
                <Globe size={18} className="text-indigo-500 opacity-40" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-0.5" style={{ color: D.textMuted }}>INSTITUTIONal SCOPE</span>
                  <span className="text-xs font-black uppercase tracking-tight" style={{ color: D.textPrimary }}>{team.organisation?.name || 'INDEPENDENT'}</span>
                </div>
             </div>
             <div className="flex items-center gap-4 px-4 py-3 rounded-2xl" style={{ background: D.surf2 }}>
                <Calendar size={18} className="text-sky-500 opacity-40" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-0.5" style={{ color: D.textMuted }}>ACTIVE SEASON</span>
                  <span className="text-xs font-black uppercase tracking-tight" style={{ color: D.textPrimary }}>{team.season?.name || 'N/A'}</span>
                </div>
             </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 opacity-40">
                <Users size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest italic">SQUAD MONITORING STATUS: ACTIVE</span>
             </div>
             <Link href={`/teams/${team.id}`}>
               <Button variant="ghost" className="h-12 w-12 rounded-xl border flex items-center justify-center transition-all group-hover:bg-indigo-500 group-hover:text-white" 
                       style={{ borderColor: D.border }}>
                  <ChevronRight size={18} />
               </Button>
             </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="group"
    >
      <div 
        className="p-8 rounded-[2rem] border overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-indigo-500/10 hover:border-indigo-500/30"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        <div className="flex flex-wrap items-center justify-between gap-10">
          <div className="flex items-center gap-8 min-w-[280px]">
            <div className="h-20 w-20 rounded-[1.5rem] flex items-center justify-center border shadow-inner transition-colors duration-500 group-hover:bg-indigo-500/10" 
                 style={{ background: D.surf2, borderColor: D.border }}>
               <Layers className="h-10 w-10 text-indigo-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none transition-colors group-hover:text-indigo-400" 
                  style={{ fontFamily: D.head, color: D.textPrimary }}>
                {team.name}
              </h3>
              <div className="px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest w-fit opacity-60" 
                   style={{ background: D.surf2, borderColor: D.border, color: D.textPrimary }}>
                {team.ageDivision?.name || 'OPEN UNIT'}
              </div>
            </div>
          </div>

          <div className="hidden xl:grid grid-cols-2 gap-12 flex-1 px-12 border-x transition-colors" style={{ borderColor: D.border }}>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1" style={{ color: D.textMuted }}>ORGANISATION</span>
              <span className="text-xs font-black uppercase tracking-tight" style={{ color: D.textPrimary }}>{team.organisation?.name || 'INDEPENDENT'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1" style={{ color: D.textMuted }}>SEASON</span>
              <span className="text-xs font-black uppercase tracking-tight" style={{ color: D.textPrimary }}>{team.season?.name || 'N/A'}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <Link href={`/teams/${team.id}`}>
               <Button variant="ghost" className="h-14 px-8 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-black/5" 
                       style={{ borderColor: D.border, color: D.textPrimary }}>
                  MANAGE DETAILS
               </Button>
             </Link>
             <Link href={`/teams/${team.id}/roster`}>
               <Button className="h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-105" 
                       style={{ background: D.indigo, color: 'white' }}>
                  VIEW ROSTER
               </Button>
             </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
