"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, Trophy, BarChart3, Activity, Shield, 
  Settings, Zap, Database, Globe, Cpu, Award,
  MessageSquare, DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { D } from '@/lib/design-system';
import { intelService } from "@/services/intelService";

const EcosystemNode = ({ 
  icon: Icon, 
  label, 
  subtext, 
  color, 
  position, 
}: {
  icon: any;
  label: string;
  subtext: string;
  color: 'blue' | 'purple' | 'emerald' | 'gold';
  position: "tl" | "ml" | "bl" | "tr" | "mr" | "br" | "center";
}) => {
  const variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }
    }
  };

  const positions = {
    tl: "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
    ml: "top-1/2 left-0 -translate-x-full -translate-y-1/2",
    bl: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
    tr: "top-0 right-0 translate-x-1/2 -translate-y-1/2",
    mr: "top-1/2 right-0 translate-x-full -translate-y-1/2",
    br: "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
  };

  const colorClasses = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    gold: "text-amber-400 bg-amber-500/10 border-amber-500/20"
  };

  if (position === "center") {
    return (
      <motion.div 
        variants={variants}
        initial="hidden"
        animate="visible"
        className="relative z-20 group"
      >
        <div className="absolute -inset-10 bg-primary/20 blur-[100px] rounded-full animate-pulse" />
        <div className="relative w-80 h-80 rounded-full border-4 border-primary/50 bg-[#0A0A0A] flex flex-col items-center justify-center p-8 text-center shadow-[0_0_100px_rgba(34,197,94,0.2)]">
          <div className="relative space-y-4">
            <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <Users className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white tracking-tighter" style={{ fontFamily: D.head }}>
                Player Identity <span className="text-primary">Graph</span>
              </h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                Unified Person Model
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Integration</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const isRight = position.includes("r");

  return (
    <motion.div 
      variants={variants}
      initial="hidden"
      animate="visible"
      className={cn("absolute z-10 w-64 group", positions[position])}
    >
      <div className={cn("flex items-center gap-4", isRight ? "flex-row" : "flex-row-reverse")}>
        <div className={cn("flex-1 space-y-1", isRight ? "text-left" : "text-right")}>
          <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{label}</h4>
          <p className="text-[10px] text-white/40 font-medium">{subtext}</p>
        </div>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110", colorClasses[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
};

export function EcosystemDiagram() {
  const [rankings, setRankings] = useState<any>(null);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const data = await intelService.getEcosystemOverview();
        setRankings(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchRankings();
  }, []);

  const nodes = [
    { 
      position: "tl" as const, 
      label: "Institutional Network", 
      subtext: rankings?.schoolRankings?.length ? `${rankings.schoolRankings.length} Connected Schools` : "1,240+ Schools", 
      icon: Globe, 
      color: "blue" as const 
    },
    { 
      position: "tr" as const, 
      label: "Intelligence Hub", 
      subtext: rankings?.playerRankings?.[0] ? `Leaderboards Active` : "V4 AI Core", 
      icon: Cpu, 
      color: "purple" as const 
    },
    { 
      position: "ml" as const, 
      label: "Talent Discovery", 
      subtext: "Automated Scouting Pipeline", 
      icon: Zap, 
      color: "emerald" as const 
    },
    { 
      position: "mr" as const, 
      label: "Market Analysis", 
      subtext: "Valuation Engine v2.1", 
      icon: BarChart3, 
      color: "gold" as const 
    },
    { 
      position: "bl" as const, 
      label: "Asset Protection", 
      subtext: "Medical & Legal Compliance", 
      icon: Shield, 
      color: "blue" as const 
    },
    { 
      position: "br" as const, 
      label: "Digital Wallet", 
      subtext: "Verified Incentives", 
      icon: Award, 
      color: "emerald" as const 
    }
  ];

  return (
    <div className="relative w-full max-w-5xl mx-auto h-[700px] flex items-center justify-center">
      {/* Background Grid/Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.05)_0%,transparent_70%)]" />
      
      <div className="relative w-[500px] h-[500px]">
        {/* Central Node */}
        <EcosystemNode position="center" label="" subtext="" icon={null} color="blue" />
        
        {/* Perimeter Nodes */}
        {nodes.map((node, i) => (
          <EcosystemNode key={node.position} {...node} />
        ))}

        {/* Dynamic Connection Lines (Decorative) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible opacity-20">
          <circle cx="50%" cy="50%" r="180" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="50%" cy="50%" r="240" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2 8" />
        </svg>
      </div>
    </div>
  );
}
