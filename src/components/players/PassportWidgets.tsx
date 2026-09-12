"use client";

import React from "react";
import { motion } from "framer-motion";
import { D } from '@/lib/design-system';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { Target, Zap, ShieldAlert, TrendingUp } from "lucide-react";

export const TacticalComparison = () => {
  const data = [
    { name: "Strike Rate", player: 145, avg: 122 },
    { name: "Avg", player: 42, avg: 31 },
    { name: "Boundary %", player: 18, avg: 12 },
    { name: "Dot Ball %", player: 32, avg: 38 },
  ];

  return (
    <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-white/40" style={{ fontFamily: D.mono }}>Tactical Comparison</h4>
        <span className="text-[10px] font-black text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">League Benchmarking</span>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barGap={8}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={80} 
              tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }}
              className="text-zinc-600 dark:text-white/40"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
            />
            <Bar dataKey="player" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={12} />
            <Bar dataKey="avg" fill="currentColor" className="text-zinc-300 dark:text-white/10" radius={[0, 4, 4, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[10px] font-bold text-zinc-700 dark:text-white/60">Player</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-white/10" />
          <span className="text-[10px] font-bold text-zinc-500 dark:text-white/40">League Avg</span>
        </div>
      </div>
    </div>
  );
};

export const ScoutingIntel = ({
  rating = "A+",
  potentialCeiling = "Professional / Elite",
  potentialCeilingPercentage = 85,
  growth = "+12%",
  risk = "Low",
  scoutNotes = "Exceptional talent with a strong work ethic. Shows great promise for future development and impact."
}: {
  rating?: string;
  potentialCeiling?: string;
  potentialCeilingPercentage?: number;
  growth?: string;
  risk?: string;
  scoutNotes?: string;
}) => (
  <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4">
       <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex flex-col items-center justify-center">
          <span className="text-[8px] font-black text-primary uppercase leading-none">Rating</span>
          <span className="text-xl font-black text-zinc-900 dark:text-white leading-none">{rating}</span>
       </div>
    </div>

    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <Target className="h-4 w-4" />
        <h4 className="text-xs font-black uppercase tracking-widest" style={{ fontFamily: D.mono }}>Scouting Intelligence</h4>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-white/40">
            <span>Potential Ceiling</span>
            <span className="text-zinc-900 dark:text-white">Professional / Elite</span>
          </div>
          <div className="w-full h-1 bg-zinc-200 dark:bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               whileInView={{ width: "85%" }}
               className="h-full bg-primary" 
             />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <HighlightBox icon={Zap} label="Growth" value="+12%" />
           <HighlightBox icon={ShieldAlert} label="Risk" value="Low" />
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-200 dark:border-white/5">
         <p className="text-[10px] text-zinc-500 dark:text-white/40 italic">&quot;{scoutNotes}&quot;</p>
      </div>
    </div>
  </div>
);

const HighlightBox = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className="p-3 rounded-xl bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 space-y-1 cursor-default transition-colors"
  >
    <div className="flex items-center gap-1.5 text-zinc-400 dark:text-white/20">
       <Icon className="h-3 w-3" />
       <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-xs font-black text-zinc-900 dark:text-white">{value}</div>
  </motion.div>
);
