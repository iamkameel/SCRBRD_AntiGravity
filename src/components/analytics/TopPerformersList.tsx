"use client";

import { Trophy, Activity, ChevronRight } from "lucide-react";
import Link from "next/link";
import { D } from "@/lib/design-system";
import { motion } from "framer-motion";

interface TopPerformer {
  id: string;
  name: string;
  value: number;
  stat: string;
}

interface TopPerformersListProps {
  title: string;
  performers: TopPerformer[];
  icon?: React.ReactNode;
}

export function TopPerformersList({ title, performers, icon }: TopPerformersListProps) {
  if (performers.length === 0) {
    return (
      <div 
        className="rounded-[2rem] border p-8 flex flex-col items-center justify-center gap-3"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        <div className="h-10 w-10 rounded-xl flex items-center justify-center opacity-20" style={{ background: D.surf2 }}>
          {icon || <Trophy className="h-5 w-5" />}
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: D.textMuted }}>Data Unavailable</p>
      </div>
    );
  }

  return (
    <div 
      className="rounded-[22px] border overflow-hidden shadow-xl"
      style={{ background: D.surf1, borderColor: D.border }}
    >
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: D.border, background: D.surf2 }}>
        <h3 className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] italic" style={{ fontFamily: D.head, color: D.textPrimary }}>
          {icon || <Trophy className="h-4 w-4" style={{ color: D.amber }} />}
          {title}
        </h3>
        <span className="text-[8px] font-black opacity-30" style={{ color: D.textMuted }}>TOP 3</span>
      </div>
      <div className="p-4 space-y-2">
        {performers.map((performer, index) => (
          <Link
            key={performer.id}
            href={`/players/${performer.id}`}
            className="group flex items-center justify-between p-3 rounded-xl transition-all hover:translate-x-1"
            style={{ background: D.surf2 }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="flex items-center justify-center w-8 h-8 rounded-lg text-[11px] font-black italic shadow-sm border border-white/5"
                style={{ 
                  background: index === 0 ? D.gradMain : index === 1 ? D.surf3 : D.surf3,
                  color: index === 0 ? 'white' : D.textPrimary,
                  borderColor: index === 0 ? 'transparent' : D.border
                }}
              >
                {index + 1}
              </div>
              <div>
                <span className="text-xs font-black uppercase italic tracking-tight block leading-none mb-1" style={{ fontFamily: D.head, color: D.textPrimary }}>
                  {performer.name}
                </span>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-40" style={{ color: D.textMuted }}>
                  VERIFIED ATHLETE
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-sm font-black italic" style={{ fontFamily: D.mono, color: index === 0 ? D.indigo : D.textPrimary }}>
                  {performer.value}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-widest ml-1.5 opacity-40" style={{ color: D.textMuted }}>
                  {performer.stat}
                </span>
              </div>
              <ChevronRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" style={{ color: D.indigo }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
