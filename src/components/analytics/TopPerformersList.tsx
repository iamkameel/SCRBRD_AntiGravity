"use client";

import { Trophy, Activity, ChevronRight, User } from "lucide-react";
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
        className="rounded-2xl border p-6 flex flex-col items-center justify-center gap-2.5 transition-all"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        <div className="h-9 w-9 rounded-xl flex items-center justify-center border border-white/5" style={{ background: D.surf2 }}>
          {icon || <Trophy className="h-4 w-4 text-slate-400" />}
        </div>
        <p className="text-xs font-medium text-slate-400" style={{ fontFamily: D.sans }}>
          Data Currently Unavailable
        </p>
      </div>
    );
  }

  // Max value for comparative mini-progress bars
  const maxValue = Math.max(...performers.map(p => p.value), 1);

  return (
    <div 
      className="rounded-2xl border overflow-hidden shadow-xl transition-all"
      style={{ background: D.surf1, borderColor: D.border }}
    >
      {/* Card Header */}
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: D.border, background: D.surf2 }}>
        <h3 className="flex items-center gap-2.5 text-xs font-bold text-white tracking-wider uppercase" style={{ fontFamily: D.head }}>
          <div className="p-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
            {icon || <Trophy className="h-4 w-4 text-amber-400" />}
          </div>
          <span>{title}</span>
        </h3>
        <span className="text-[10px] font-bold tracking-widest text-slate-400 px-2.5 py-1 rounded-full border border-white/5 bg-white/5 uppercase" style={{ fontFamily: D.mono }}>
          TOP 3
        </span>
      </div>

      {/* Performers List */}
      <div className="p-3.5 space-y-2">
        {performers.map((performer, index) => {
          const progressPercent = Math.min(100, Math.round((performer.value / maxValue) * 100));
          const isGold = index === 0;
          const isSilver = index === 1;

          return (
            <Link
              key={performer.id}
              href={`/players/${performer.id}`}
              className="group block p-3 rounded-xl border transition-all duration-300 hover:border-indigo-500/30 hover:bg-white/[0.04]"
              style={{ background: D.surf2, borderColor: D.border }}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div 
                    className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold shadow-sm border ${
                      isGold 
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 border-amber-300/40 shadow-amber-500/20' 
                        : isSilver
                          ? 'bg-slate-700/80 text-slate-200 border-slate-600'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700/80'
                    }`}
                    style={{ fontFamily: D.mono }}
                  >
                    #{index + 1}
                  </div>

                  {/* Player Info */}
                  <div>
                    <span 
                      className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors block leading-snug"
                      style={{ fontFamily: D.sans }}
                    >
                      {performer.name}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 block" style={{ fontFamily: D.sans }}>
                      Verified Squad Athlete
                    </span>
                  </div>
                </div>

                {/* Stat Metric */}
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span 
                      className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors"
                      style={{ fontFamily: D.mono }}
                    >
                      {performer.value}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 ml-1 uppercase tracking-wider" style={{ fontFamily: D.sans }}>
                      {performer.stat}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </div>

              {/* Comparative Visual Progress Bar */}
              <div className="w-full bg-slate-800/60 rounded-full h-1 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`h-full rounded-full ${
                    isGold ? 'bg-amber-400' : 'bg-indigo-500'
                  }`}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
