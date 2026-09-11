"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { D } from '@/lib/design-system';
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Users, 
  MapPin, 
  Bus, 
  HeartPulse,
  AlertTriangle,
  ChevronRight,
  ClipboardCheck
} from 'lucide-react';

const READINESS_PILLARS = [
  { id: 'squad', label: 'Squad Selection', value: 100, status: 'Confirmed', icon: Users, color: 'emerald' },
  { id: 'ground', label: 'Field & Pitch', value: 85, status: 'Prepped', icon: MapPin, color: 'emerald' },
  { id: 'transport', label: 'Transport Fleet', value: 90, status: 'Assigned', icon: Bus, color: 'emerald' },
  { id: 'medical', label: 'Medical Clearance', value: 65, status: '2 Risks', icon: HeartPulse, color: 'amber' },
];

export function MatchReadinessDossier({ fixtureId }: { fixtureId: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tighter" style={{ fontFamily: D.syne }}>
            MATCH <span className="text-primary tracking-normal">READY</span>
          </h2>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Aggregated Operational Intelligence</p>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1.5 font-black text-xs tracking-widest uppercase">
          Mission Ready
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {READINESS_PILLARS.map((pillar) => (
          <motion.div key={pillar.id} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className="bg-black/40 border-white/10 backdrop-blur-xl rounded-2xl p-5 border-l-4" style={{ borderLeftColor: pillar.color === 'emerald' ? '#10b981' : '#f59e0b' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-lg bg-${pillar.color}-500/10 flex items-center justify-center text-${pillar.color}-400`}>
                  <pillar.icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase text-white/50 tracking-widest">{pillar.label}</h3>
                  <p className={`text-[10px] font-bold text-${pillar.color}-400 uppercase tracking-widest`}>{pillar.status}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase text-white/30">
                  <span>Readiness</span>
                  <span className="text-white">{pillar.value}%</span>
                </div>
                <Progress value={pillar.value} className="h-1 bg-white/5" indicatorClassName={pillar.color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <Card className="lg:col-span-2 bg-black/40 border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-white/5">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-lg font-black tracking-tight" style={{ fontFamily: D.syne }}>Critical Exceptions</CardTitle>
                <CardDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Operational Issues Requiring Attention</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              <div className="p-6 flex items-start gap-4 group transition-all hover:bg-white/5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 group-hover:scale-110 transition-all">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-black text-white/90 uppercase tracking-tight" style={{ fontFamily: D.syne }}>Medical Restriction: L. Peterson</h4>
                    <Badge variant="outline" className="text-[8px] border-amber-500/30 text-amber-500 font-black h-4 px-1">GRADE 1 ANKLE</Badge>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed font-bold">Flagged during training. Requires official clearance before final squad lock.</p>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <Button size="sm" className="h-7 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black py-0 transition-colors text-[9px] font-black uppercase tracking-widest px-4 rounded-lg">Clear for Play</Button>
                    <Button size="sm" variant="outline" className="h-7 border-white/10 text-white/40 hover:text-rose-500 hover:border-rose-500/30 text-[9px] font-black uppercase tracking-widest px-4 rounded-lg">Maintain Bench</Button>
                  </div>
                </div>
              </div>

              <div className="p-6 flex items-start gap-4 group transition-all hover:bg-white/5">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all text-sm font-black italic">
                  V02
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-black text-white/90 uppercase tracking-tight" style={{ fontFamily: D.syne }}>Transport Telemetry: Sprinter (V02)</h4>
                    <span className="text-[10px] font-black text-blue-400 tabular-nums">15% ENERGY</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: '15%' }}
                      className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                    />
                  </div>
                  <p className="text-xs text-white/40 font-bold uppercase tracking-widest text-[9px]">Critical: Refill required before 08:00 AM Departure</p>
                </div>
                <Button size="sm" variant="outline" className="text-[10px] font-black uppercase border-white/10 text-white/40 h-8 rounded-lg hover:text-white transition-colors">Notify Driver</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Dispatch Stream */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            <h3 className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Live Intelligence Feed</h3>
          </div>
          
          <div className="space-y-3">
            {[
              { time: '10:45', msg: 'System: Opponent DH confirming squad list.', type: 'info' },
              { time: '10:42', msg: 'Logistics: Ground staff marking pitch 4.', type: 'field' },
              { time: '09:15', msg: 'Medical: R. Sharma cleared for team sheet.', type: 'med' },
            ].map((msg, i) => (
              <motion.div 
                key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="p-4 bg-white/5 border border-white/5 rounded-2xl flex gap-3"
              >
                <span className="text-[9px] font-black text-primary/60 tabular-nums shrink-0">{msg.time}</span>
                <p className="text-[10px] font-bold text-white/60 leading-tight uppercase tracking-tight">{msg.msg}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
