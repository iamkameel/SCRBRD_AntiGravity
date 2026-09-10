"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Activity, 
  Target, 
  Search, 
  Navigation,
  TrendingUp,
  Brain,
  Zap,
  Star,
  Users,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { D } from "@/lib/scoring/theme";

const WorkflowStep = ({ icon: Icon, title, description, active = false }: { icon: any, title: string, description: string, active?: boolean }) => (
  <div className={cn(
    "flex-1 relative p-6 rounded-2xl border transition-all duration-500",
    active ? "bg-primary/10 border-primary/40" : "bg-white/[0.02] border-white/10"
  )}>
    <div className={cn(
      "w-12 h-12 rounded-xl mb-4 flex items-center justify-center border",
      active ? "bg-primary/20 border-primary/40 text-primary" : "bg-white/5 border-white/10 text-white/20"
    )}>
      <Icon className="h-6 w-6" />
    </div>
    <h4 className="text-sm font-black uppercase tracking-widest text-white mb-2" style={{ fontFamily: D.mono }}>{title}</h4>
    <p className="text-[11px] text-white/40 leading-relaxed font-medium">{description}</p>
    
    {/* Arrow */}
    <div className="absolute top-1/2 -right-4 -translate-y-1/2 text-white/10 hidden lg:block">
      <Navigation className="h-4 w-4 rotate-90" />
    </div>
  </div>
);

export const RankingsAlgorithm = () => (
  <div className="rounded-[3rem] border border-white/10 bg-[#0A0A0A] p-12 space-y-12 overflow-hidden relative group">
    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full -mr-32 -mt-32" />
    
    <div className="flex justify-between items-start border-b border-white/5 pb-8">
      <div>
        <h3 className="text-3xl font-black text-white px-2" style={{ fontFamily: D.head }}>
          RANKINGS <span className="text-amber-500">ALGORITHM</span>
        </h3>
        <p className="text-white/40 text-sm font-medium mt-2 px-2">Multivariate performance evaluation matrix.</p>
      </div>
      <div className="px-6 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest">
        Proprietary Logic
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        { title: "Form", icon: TrendingUp, val: "40%", desc: "Recent 5 matches vs quality of opposition." },
        { title: "Consistency", icon: Activity, val: "30%", desc: "Stability of performance across the season." },
        { title: "Impact", icon: Zap, val: "30%", desc: "Match-winning events in high-pressure windows." }
      ].map((item, i) => (
        <div key={i} className="space-y-4 p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-amber-500/20 transition-all">
          <div className="flex justify-between items-center text-amber-500">
            <item.icon className="h-6 w-6" />
            <span className="text-xl font-black" style={{ fontFamily: D.mono }}>{item.val}</span>
          </div>
          <h4 className="text-lg font-bold text-white tracking-tight">{item.title}</h4>
          <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>

    <div className="pt-8 flex flex-col items-center">
       <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-4" style={{ fontFamily: D.mono }}>Output Engine</div>
       <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-amber-500/20 via-amber-500 to-amber-500/20" 
          />
       </div>
       <div className="mt-4 text-xs font-bold text-amber-500 uppercase tracking-widest">Consolidated SCRBRD Ranking</div>
    </div>
  </div>
);

export const MatchDataPipeline = () => (
  <div className="space-y-10">
    <div className="flex lg:flex-row flex-col gap-6">
      <WorkflowStep 
        icon={Search} 
        title="Identify" 
        description="Scout discovery via ranking triggers." 
      />
      <WorkflowStep 
        icon={Activity} 
        title="Track" 
        description="Automated performance monitoring." 
        active={true}
      />
      <WorkflowStep 
        icon={Target} 
        title="Evaluate" 
        description="Metric-driven skill assessment." 
      />
      <WorkflowStep 
        icon={Star} 
        title="Shortlist" 
        description="Prospect ranking & comparison." 
      />
      <WorkflowStep 
        icon={Users} 
        title="Approach" 
        description="Recruitment & engagement workflow." 
      />
    </div>
  </div>
);

export const RankingPyramid = () => (
  <div className="relative py-20 flex flex-col items-center">
    <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full" />
    <h3 className="text-2xl font-black text-white/20 uppercase tracking-[0.4em] mb-16" style={{ fontFamily: D.mono }}>Pyramid of Ranking</h3>
    
    <div className="relative w-full max-w-2xl aspect-[4/3] flex flex-col items-center justify-end perspective-[1000px]">
      {[
        { label: "Potential", color: "bg-primary/40", width: "w-[100%]", h: "h-12", delay: 0.1 },
        { label: "Quality", color: "bg-primary/50", width: "w-[80%]", h: "h-16", delay: 0.2 },
        { label: "Impact", color: "bg-primary/70", width: "w-[60%]", h: "h-20", delay: 0.3 },
        { label: "Consistency", color: "bg-primary/85", width: "w-[40%]", h: "h-24", delay: 0.4 },
        { label: "Form", color: "bg-primary", width: "w-[20%]", h: "h-32", delay: 0.5 },
      ].reverse().map((layer, i) => (
        <motion.div
           key={i}
           initial={{ opacity: 0, y: 20, scale: 0.9 }}
           whileInView={{ opacity: 1, y: 0, scale: 1 }}
           transition={{ delay: layer.delay, duration: 0.6 }}
           className={cn(
             "relative flex items-center justify-center border-t border-white/10 group cursor-default",
             layer.width, layer.h, layer.color
           )}
           style={{
             clipPath: i === 0 
               ? "polygon(50% 0%, 0% 100%, 100% 100%)" 
               : "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)",
             marginBottom: "-1px"
           }}
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-white drop-shadow-md group-hover:scale-110 transition-transform">
            {layer.label}
          </span>
        </motion.div>
      ))}
    </div>
    <div className="mt-12 text-[10px] font-black text-primary/40 uppercase tracking-[0.3em]">Consolidated Intelligence Layer</div>
  </div>
);

export const AIBrainEngine = () => (
  <div className="p-12 rounded-[3rem] border border-white/10 bg-black/40 backdrop-blur-xl relative overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center relative z-10">
      {/* Input 1 */}
      <div className="space-y-4 text-center lg:text-right">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-white/40">
           <Database className="h-8 w-8" />
        </div>
        <h4 className="text-sm font-black uppercase tracking-widest text-white" style={{ fontFamily: D.mono }}>Passport DB</h4>
        <p className="text-[10px] text-white/30 font-medium">Verified historical performance & biometric data.</p>
      </div>

      {/* Center Brain */}
      <div className="relative flex flex-col items-center">
         <div className="w-32 h-32 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center relative">
            <motion.div 
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-primary/20 rounded-full blur-xl" 
            />
            <Brain className="h-16 w-16 text-primary relative z-10" />
         </div>
         <div className="mt-6 text-center">
            <h4 className="text-lg font-black text-white uppercase tracking-tight" style={{ fontFamily: D.head }}>AI BRAIN <span className="text-primary">ENGINE</span></h4>
            <div className="flex gap-1 justify-center mt-2">
               {[1,2,3].map(i => (
                 <motion.div 
                   key={i}
                   animate={{ opacity: [0.2, 1, 0.2] }}
                   transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                   className="w-1 h-1 rounded-full bg-primary"
                 />
               ))}
            </div>
         </div>
      </div>

      {/* Input 2 */}
      <div className="space-y-4 text-center lg:text-left">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-white/40">
           <Zap className="h-8 w-8" />
        </div>
        <h4 className="text-sm font-black uppercase tracking-widest text-white" style={{ fontFamily: D.mono }}>Player Intel</h4>
        <p className="text-[10px] text-white/30 font-medium">Real-time match metrics & developmental feedback.</p>
      </div>
    </div>
  </div>
);
