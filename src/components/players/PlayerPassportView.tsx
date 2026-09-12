"use client";

import { D } from '@/lib/design-system';
import { 
  Shield, 
  Award, 
  CheckCircle2, 
  Fingerprint,
  ArrowUpRight,
  Navigation,
  Check,
  Star,
  History
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PassportRadarChart } from "@/components/analytics/PassportRadarChart";
import { FormTrendTracker } from "@/components/analytics/FormTrendTracker";
import { TacticalComparison, ScoutingIntel } from "./PassportWidgets";
import { 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
    LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip
} from 'recharts';
import { intelService } from '@/services/intelService';
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PlayerPassportViewProps {
  player: any;
  profile?: any;
}

const StarRating = ({ rating = 4 }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star 
        key={s} 
        className={cn("h-3 w-3", s <= rating ? "text-primary fill-primary" : "text-zinc-300 dark:text-white/10")} 
      />
    ))}
  </div>
);

const TimelineStep = ({ age, years, school, team, active = false }: { age: string, years: string, school: string, team: string, active?: boolean }) => (
  <div className={cn(
    "flex-1 relative p-4 rounded-xl border transition-all duration-500 min-w-[150px]",
    active 
      ? "bg-primary/10 border-primary/50 shadow-[0_0_30px_rgba(34,197,94,0.1)]" 
      : "bg-zinc-50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20"
  )}>
    <div className={cn(
      "absolute -top-2 left-6 px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
      active ? "bg-primary text-black border-primary" : "bg-zinc-100 dark:bg-[#0A0A0A] text-zinc-600 dark:text-white/40 border-zinc-200 dark:border-white/10"
    )}>
      {age}
    </div>
    <div className="mt-2 space-y-1">
      <div className={cn("text-[10px] font-black tracking-widest", active ? "text-primary" : "text-zinc-500 dark:text-white/30")} style={{ fontFamily: D.mono }}>{years}</div>
      <div className="text-xs font-bold text-zinc-900 dark:text-white/90 truncate">{school}</div>
      <div className="text-[9px] font-bold text-zinc-500 dark:text-white/40 uppercase tracking-widest truncate">{team}</div>
    </div>
    {/* Connection chevron (pseudo logic) */}
    <div className="absolute top-1/2 -right-3 -translate-y-1/2 text-zinc-300 dark:text-white/10 hidden lg:block">
      <ArrowUpRight className="h-4 w-4 rotate-45" />
    </div>
  </div>
);

const StatBlock = ({ label, value, sub, color ="primary" }: { label: string, value: string | number, sub?: string, color?: "primary" | "blue" }) => (
  <div className="text-center p-4">
    <div className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-white/30 mb-2" style={{ fontFamily: D.mono }}>{label}</div>
    <div className={cn("text-3xl font-black tracking-tighter", color === "primary" ? "text-zinc-900 dark:text-white" : "text-blue-600 dark:text-blue-400")} style={{ fontFamily: D.head }}>{value}</div>
    {sub && <div className="text-[9px] font-bold text-zinc-500 dark:text-white/40 uppercase tracking-widest mt-1">{sub}</div>}
  </div>
);

export function PlayerPassportView({ player, profile }: PlayerPassportViewProps) {
  const firstName = player?.firstName || 'Player';
  const lastName = player?.lastName || 'Member';
  const playerId = player?.id || 'SCR-00000';
  const avatarUrl = player?.profileImageUrl || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+${encodeURIComponent(lastName)}&background=22c55e&color=fff&size=200`;

  return (
    <div className="space-y-10 sh-fade-in pb-20">
      {/* Official Identity Header */}
      <div className="relative rounded-[3rem] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] overflow-hidden group shadow-sm dark:shadow-none">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:40px_40px]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -mr-250 -mt-250 opacity-40 group-hover:opacity-60 transition-opacity duration-1000" />
        
        <div className="relative p-8 md:p-12 flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Portrait & Security */}
          <div className="flex flex-col items-center gap-8">
            <div className="relative">
              <div className="absolute -inset-10 bg-primary/20 blur-[100px] rounded-full animate-pulse opacity-20" />
              <div className="relative w-56 h-72 rounded-[2rem] overflow-hidden border-4 border-zinc-200 dark:border-white/10 shadow-xl bg-zinc-100 dark:bg-white/5">
                <Image
                  src={avatarUrl}
                  alt={firstName}
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-110"
                />
                <div className="absolute top-4 right-4 bg-primary text-black p-1.5 rounded-full shadow-lg">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-white/90 dark:bg-black/60 backdrop-blur-md border border-zinc-200 dark:border-white/10">
                  <div className="text-[8px] font-black uppercase tracking-widest text-primary/70 mb-1" style={{ fontFamily: D.mono }}>Unique Player ID</div>
                  <div className="text-[10px] font-black text-zinc-900 dark:text-white/90" style={{ fontFamily: D.mono }}>SCR-PID-{playerId.substring(0, 8).toUpperCase()}</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <Fingerprint className="h-10 w-10 text-primary/40" />
              <div className="text-center">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-white/30" style={{ fontFamily: D.mono }}>Biometric Status</div>
                <div className="text-[11px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Secured & Verified</div>
              </div>
            </div>
          </div>

          {/* Core Info Details */}
          <div className="flex-1 space-y-12">
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit">
                   <Navigation className="h-3 w-3 text-primary" />
                   <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]" style={{ fontFamily: D.mono }}>Personnel Data Sheet v4.2</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tighter" style={{ fontFamily: D.head }}>
                  {lastName.toUpperCase()}, <span className="text-primary/70">{firstName}</span>
                </h1>
                <div className="flex gap-4">
                  <span className="text-sm font-bold text-zinc-600 dark:text-white/60">DOB: {player?.dateOfBirth || '14 MAY 2008'}</span>
                  <span className="text-zinc-300 dark:text-white/20 px-3 border-x border-zinc-200 dark:border-white/10">•</span>
                  <span className="text-sm font-bold text-zinc-600 dark:text-white/60">{player?.physicalAttributes?.battingHand || 'RH'} BAT</span>
                  <span className="text-zinc-300 dark:text-white/20 px-3 border-x border-zinc-200 dark:border-white/10">•</span>
                  <span className="text-sm font-bold text-zinc-600 dark:text-white/60">{player?.physicalAttributes?.bowlingHand || 'RM'} BOWL</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="h-20 w-20 rounded-full border-4 border-primary/20 flex items-center justify-center bg-zinc-50 dark:bg-white/5 shadow-inner">
                  <Shield className="h-10 w-10 text-primary/40" />
                </div>
                <div className="text-right">
                   <div className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-white/40" style={{ fontFamily: D.mono }}>Institutional Affinity</div>
                   <div className="text-sm font-bold text-zinc-900 dark:text-white/90">{player?.schoolName || player?.assignedSchools?.[0] || 'Westville Boys\' High School'}</div>
                </div>
              </div>
            </div>

            {/* Horizontal Timeline */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-white/20" style={{ fontFamily: D.mono }}>Professional Trajectory</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                <TimelineStep age="U11" years="2020-21" school="Greenfields" team="Primary A" />
                <TimelineStep age="U13" years="2021-23" school="Greenfields" team="Premier XI" />
                <TimelineStep age="U15" years="2023-24" school="Riverside" team="U15 Squad" />
                <TimelineStep age="U16" years="2024-25" school="Riverside" team="1st XI" active={true} />
                <TimelineStep age="OPEN" years="2025-26" school="Riverside" team="First XI High" />
              </div>
            </div>

            {/* Career Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-zinc-200 dark:border-white/5">
               <div className="rounded-3xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 overflow-hidden">
                  <div className="bg-zinc-100 dark:bg-white/5 px-6 py-2 border-b border-zinc-200 dark:border-white/5">
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981]" style={{ fontFamily: D.mono }}>Batting Core</span>
                  </div>
                  <div className="flex items-center justify-around p-4">
                      <StatBlock label="Matches" value={42} />
                      <StatBlock label="Runs" value={1248} />
                      <StatBlock label="AVG" value={48.0} />
                      <StatBlock label="SR" value={136.5} />
                  </div>
               </div>
               <div className="rounded-3xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 overflow-hidden">
                  <div className="bg-zinc-100 dark:bg-white/5 px-6 py-2 border-b border-zinc-200 dark:border-white/5">
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#3b82f6] dark:text-[#60a5fa]" style={{ fontFamily: D.mono }}>Bowling Core</span>
                  </div>
                  <div className="flex items-center justify-around p-4">
                      <StatBlock label="Overs" value={96.2} color="blue" />
                      <StatBlock label="Wkts" value={41} color="blue" />
                      <StatBlock label="ECON" value={3.1} color="blue" />
                      <StatBlock label="AVG" value={22.1} color="blue" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics & Development Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 h-full">
        {/* Skill Matrix Sidebar */}
        <div className="rounded-[3rem] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] p-8 md:p-10 flex flex-col justify-between group overflow-hidden shadow-sm dark:shadow-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative space-y-8">
            <h3 className="text-xl font-black text-zinc-900 dark:text-white" style={{ fontFamily: D.head }}>SKILLS & <span className="text-primary">DEVELOPMENT</span></h3>
            <PassportRadarChart />
            <div className="space-y-6">
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-white/30" style={{ fontFamily: D.mono }}>Development Focus</h4>
                  <ul className="space-y-3">
                     {[
                       { label: "Improved power hitting this season", trend: "up" },
                       { label: "Bowling consistency in progress", trend: "stable" },
                       { label: "Elite fielding reflexes documented", trend: "up" }
                     ].map((item, i) => (
                       <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-zinc-700 dark:text-white/70">
                          <Check className="h-3 w-3 text-primary" />
                          {item.label}
                          <ArrowUpRight className={cn("h-3 w-3 ml-auto text-primary", item.trend === "up" ? "" : "opacity-20")} />
                       </li>
                     ))}
                  </ul>
               </div>
            </div>
          </div>
        </div>

        {/* Form & Trends Center */}
        <div className="rounded-[3rem] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] p-8 md:p-10 flex flex-col group overflow-hidden shadow-sm dark:shadow-none">
          <div className="relative space-y-8 flex-1">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-black text-zinc-900 dark:text-white" style={{ fontFamily: D.head }}>FORM & <span className="text-primary">TRENDS</span></h3>
              <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Form Index</div>
                <div className="text-4xl font-black text-zinc-900 dark:text-white" style={{ fontFamily: D.head }}>7.6 <span className="text-primary text-sm">↑ 12%</span></div>
              </div>
            </div>
            
            <FormTrendTracker />
            
            <div className="pt-10 flex-1">
               <TacticalComparison />
            </div>
          </div>
        </div>

        {/* Scouting & Honours Right */}
        <div className="rounded-[3rem] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] p-8 md:p-10 flex flex-col gap-10 group overflow-hidden shadow-sm dark:shadow-none">
           <ScoutingIntel />
           
           <div className="space-y-6">
              <h3 className="text-xl font-black text-zinc-900 dark:text-white" style={{ fontFamily: D.head }}>HONOURS & <span className="text-primary">BADGES</span></h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Player of the Year", year: "2024", icon: Award, color: "text-amber-500" },
                  { label: "1st XI Debut", year: "2024", icon: History, color: "text-emerald-500" },
                ].map((stamp, i) => (
                  <div key={i} className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] flex flex-col items-center justify-center p-6 text-center group/stamp hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-all">
                    <stamp.icon className={cn("h-10 w-10 mb-2 opacity-50 dark:opacity-30 group-hover/stamp:opacity-100 transition-opacity", stamp.color)} />
                    <div className="text-[9px] font-black uppercase tracking-widest text-zinc-800 dark:text-white/90 leading-tight">{stamp.label}</div>
                  </div>
                ))}
              </div>
           </div>

           <div className="space-y-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-white/20 text-center" style={{ fontFamily: D.mono }}>Registry Status</div>
              <div className="flex items-center gap-4 p-5 rounded-3xl bg-primary/5 border border-primary/20">
                 <ShieldCheck className="h-8 w-8 text-primary" />
                 <div>
                    <div className="text-[10px] font-black text-primary uppercase tracking-widest">Eligibility Verified</div>
                    <div className="text-[9px] font-medium text-zinc-500 dark:text-white/40">Cleared for Regional Representation</div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Signature & Trust Layer */}
      <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-zinc-200 dark:border-white/5 opacity-60 dark:opacity-40 hover:opacity-100 transition-opacity">
         <div className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 dark:text-white/60" style={{ fontFamily: D.mono }}>Official Record: {player?.id?.toUpperCase() || 'SCR-00000'}</span>
         </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 dark:text-white/60" style={{ fontFamily: D.mono }}>POWERED BY SCRBRD OS INTEL CORE</span>
          </div>
       </div>
    </div>
  );
}

const ShieldCheck = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
