"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { D } from '@/lib/design-system';
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Activity, 
  AlertCircle, 
  HeartPulse,
  TrendingDown,
  TrendingUp,
  Info
} from 'lucide-react';

interface PlayerReadinessWidgetProps {
  playerId: string;
  readinessScore?: number;
  status?: string;
}

export function PlayerReadinessWidget({ playerId, readinessScore = 88, status = "Fit" }: PlayerReadinessWidgetProps) {
  return (
    <Card className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden sh-slide-up h-full">
      <CardHeader className="p-8 border-b border-white/10 flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-primary" style={{ fontFamily: D.syne }}>
            Readiness Intel
          </CardTitle>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Live Medical & Workload Analysis</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge className={`bg-${status === 'Fit' ? 'emerald' : 'amber'}-500/10 text-${status === 'Fit' ? 'emerald' : 'amber'}-400 border-${status === 'Fit' ? 'emerald' : 'amber'}-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1`}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 space-y-8">
        {/* Core Readiness Score */}
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Readiness Score</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white" style={{ fontFamily: D.syne }}>{readinessScore}%</span>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="w-32 h-32 relative flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-white/5"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={364.4}
                strokeDashoffset={364.4 - (364.4 * readinessScore) / 100}
                strokeLinecap="round"
                className="text-primary transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary/40" />
            </div>
          </div>
        </div>

        {/* Tactical Indicators */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-white/30">
              <Activity className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">Workload</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-white">Optimal</span>
              <span className="text-[10px] font-bold text-emerald-400">Stable</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-white/30">
              <HeartPulse className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">Medical</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-white">Clear</span>
              <span className="text-[10px] font-bold text-white/20">7d Polish</span>
            </div>
          </div>
        </div>

        {/* Warning / Intel Strip */}
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/80">Coach Intervention Flag</p>
            <p className="text-xs text-white/50 leading-relaxed font-medium">
              Slight fatigue detected in lateral mobility drills. Recommend capping bowling session to 4 overs for the next 48 hours.
            </p>
          </div>
        </div>

        <Button className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 font-black uppercase tracking-widest text-[10px] rounded-xl group transition-all">
          View Full Dossier <TrendingUp className="w-3 h-3 ml-2 text-primary group-hover:translate-x-1 duration-300" />
        </Button>
      </CardContent>
    </Card>
  );
}
