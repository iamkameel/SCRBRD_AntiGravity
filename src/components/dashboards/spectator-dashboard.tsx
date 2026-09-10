"use client";

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from '../dashboard/PageHeader';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { Ticket, Calendar, MapPin, Users, ChevronRight, Play, ArrowRight, Rss, Activity, Loader2, Clock } from "lucide-react";
import { D } from "@/lib/design-system";
import { motion, AnimatePresence } from "framer-motion";

export default function SpectatorDashboard() {
  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="px-1">
        <PageHeader 
          title="Spectator Hub" 
          description="Follow live match intelligence, secure facility access, and stay synchronized with the tournament."
        />
      </div>

      {/* Fixture Centre */}
      <FixtureCentreCard 
        role="Spectator"
        maxMatches={5}
      />

      {/* Strategic Event Intelligence */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-1">
          <span className="w-1.5 h-6 rounded-full shadow-lg" style={{ background: D.indigo, boxShadow: `0 0 15px ${D.indigo}40` }} />
          <h2 className="text-[10px] font-black italic uppercase tracking-[0.3em]" style={{ color: D.textPrimary }}>EVENT INTELLIGENCE</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Marquee Match", value: "Sun", sub: "Finals: Team A vs Team B", icon: Calendar, color: D.indigo },
            { label: "Access Passes", value: "02", sub: "Verified for Finals", icon: Ticket, color: D.rose },
            { label: "Arrival Point", value: "Oval", sub: "Gate 4 Strategic Entry", icon: MapPin, color: D.sky },
            { label: "Capacity Watch", value: "5k+", sub: "Live attendance trend", icon: Users, color: D.emerald },
          ].map((stat, i) => (
            <div 
              key={i} 
              className="rounded-2xl p-6 transition-all border group"
              style={{ background: D.surf1, border: `1px solid ${D.border}` }}
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30`, color: stat.color }}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: D.textMuted }}>{stat.label}</p>
              <div className="text-3xl font-black italic uppercase" style={{ fontFamily: D.head, color: D.textPrimary }}>{stat.value}</div>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60" style={{ color: D.textMuted }}>{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Live Feed & Highlights Grid */}
      <div className="grid gap-8 md:grid-cols-2 px-1">
        {/* Live Scorereview Panel */}
        <div 
          className="rounded-3xl border overflow-hidden shadow-2xl"
          style={{ background: D.surf1, border: `1px solid ${D.border}` }}
        >
          <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: D.border, background: D.surf2 }}>
            <h3 className="text-sm font-black flex items-center gap-3 uppercase tracking-tight" style={{ fontFamily: D.head, color: D.textPrimary }}>
              <Activity className="h-5 w-5 animate-pulse" style={{ color: D.rose }} />
              LIVE MATCH OPS
            </h3>
            <Button variant="ghost" size="sm" className="h-8 font-black text-[9px] uppercase tracking-widest" style={{ color: D.textMuted }}>
              REFRESH FEED <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="group relative flex justify-between items-center p-6 rounded-2xl border transition-all cursor-pointer"
                style={{ background: D.surf2, border: `1px solid ${D.border}` }}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity" 
                  style={{ background: `linear-gradient(90deg, ${D.rose}, transparent)` }} 
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-black uppercase italic tracking-tighter" style={{ fontFamily: D.head, color: D.textPrimary }}>CAPITALS</span>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-30" style={{ color: D.textMuted }}>VS</span>
                    <span className="text-sm font-black uppercase italic tracking-tighter" style={{ fontFamily: D.head, color: D.textPrimary }}>SUNRISERS</span>
                  </div>
                  <div className="text-4xl font-black italic tracking-tighter" style={{ color: D.rose, fontFamily: D.mono }}>
                    145/3 <span className="text-sm font-bold uppercase tracking-widest ml-2 opacity-50" style={{ color: D.textMuted }}>(15.4 OV)</span>
                  </div>
                </div>
                <div className="relative z-10 flex flex-col items-end gap-4">
                  <Badge className="font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1 animate-pulse border-0 shadow-lg" style={{ background: D.rose, color: 'white', boxShadow: `0 0 20px ${D.rose}40` }}>LIVE</Badge>
                  <div 
                    className="p-3 rounded-full transition-all group-hover:scale-110"
                    style={{ background: D.surf1, color: D.textMuted }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Media & Content Hub */}
        <div 
          className="rounded-3xl border overflow-hidden shadow-2xl"
          style={{ background: D.surf1, border: `1px solid ${D.border}` }}
        >
          <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: D.border, background: D.surf2 }}>
            <h3 className="text-sm font-black flex items-center gap-3 uppercase tracking-tight" style={{ fontFamily: D.head, color: D.textPrimary }}>
              <Rss className="h-5 w-5" style={{ color: D.indigo }} />
              MEDIA TERMINAL
            </h3>
            <Button variant="ghost" size="sm" className="h-8 font-black text-[9px] uppercase tracking-widest" style={{ color: D.textMuted }}>
              VIEW ALL OPS
            </Button>
          </div>
          <div className="p-6 space-y-6">
            {[
              { title: "Top 5 Catches / Weekly Digest", desc: "Chromatographic analysis of Round 4 fielding highlights.", time: "2 hours ago", color: D.indigo },
              { title: "Strategic Brief: Athlete Interview", desc: "In-depth setup discussion with high-performance leads.", time: "5 hours ago", color: D.sky },
            ].map((media, i) => (
              <div key={i} className="flex gap-4 group cursor-pointer border-b last:border-0 pb-6 last:pb-0" style={{ borderColor: `${D.border}40` }}>
                <div 
                  className="relative h-20 w-32 rounded-xl flex-shrink-0 border overflow-hidden group-hover:scale-105 transition-all"
                  style={{ background: D.surf2, border: `1px solid ${D.border}` }}
                >
                   <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all">
                      <Play className="w-8 h-8 text-white/60 group-hover:text-white transition-all scale-75 group-hover:scale-100" />
                   </div>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[11px] font-black uppercase tracking-tight group-hover:italic transition-all leading-tight mb-1" style={{ color: D.textPrimary }}>{media.title}</p>
                  <p className="text-[10px] font-medium uppercase tracking-widest opacity-50 line-clamp-2 leading-relaxed" style={{ color: D.textMuted }}>{media.desc}</p>
                  <div className="flex items-center gap-2 mt-2 opacity-30">
                    <Clock className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-widest">{media.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
