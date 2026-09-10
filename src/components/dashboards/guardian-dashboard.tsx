"use client";

import React from 'react';
import { PageHeader } from '../dashboard/PageHeader';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { User, Calendar, Activity, GraduationCap, Clock, MapPin, ChevronRight, Bell } from "lucide-react";
import { D } from "@/lib/design-system";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function GuardianDashboard() {
  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="px-1">
        <PageHeader 
          title="Guardian Portal" 
          description="Monitor performance, schedule, and school sports integration for your student athletes."
        />
      </div>

      {/* Fixture Centre */}
      <FixtureCentreCard 
        role="Guardian"
        maxMatches={3}
      />

      {/* Student Athlete Overview Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Profile", value: "Verified", sub: "John Doe Jr.", icon: User, color: D.sky },
          { label: "Next Engagement", value: "Sat", sub: "09:00 AM vs Team B", icon: Calendar, color: D.indigo },
          { label: "Form Index", value: "Optimal", sub: "Recent: 45 runs (32b)", icon: Activity, color: D.emerald },
          { label: "Academic Standing", value: "On Track", sub: "GPA: 3.8 / 4.0", icon: GraduationCap, color: D.amber },
        ].map((stat, i) => (
          <div 
            key={i} 
            className="rounded-2xl p-6 transition-all border group"
            style={{ background: D.surf1, border: `1px solid ${D.border}` }}
          >
            <div className="flex justify-between items-start mb-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30`, color: stat.color }}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="w-2 h-2 rounded-full" style={{ background: stat.color }} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: D.textMuted }}>{stat.label}</p>
            <div className="text-3xl font-black italic uppercase tracking-tighter" style={{ fontFamily: D.head, color: D.textPrimary }}>{stat.value}</div>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60" style={{ color: D.textMuted }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Schedule & Operational Updates */}
      <div className="grid gap-8 md:grid-cols-2 px-1">
        {/* Schedule Panel */}
        <div 
          className="rounded-3xl border overflow-hidden shadow-xl"
          style={{ background: D.surf1, border: `1px solid ${D.border}` }}
        >
          <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: D.border, background: D.surf2 }}>
            <h3 className="text-sm font-black flex items-center gap-3 uppercase tracking-tight" style={{ fontFamily: D.head, color: D.textPrimary }}>
              <Clock className="h-5 w-5" style={{ color: D.indigo }} />
              PLAYER SCHEDULE
            </h3>
            <Badge className="font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border-0" style={{ background: `${D.indigo}20`, color: D.indigo }}>
              LIVE REGISTRY
            </Badge>
          </div>
          <div className="p-6 space-y-4">
            {[
              { type: "Training Session", time: "Today, 4:00 PM", status: "Required", color: D.amber },
              { type: "Match Day", time: "Saturday, 9:00 AM", status: "Home Game", color: D.emerald },
            ].map((item, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-4 rounded-2xl border transition-all"
                style={{ background: D.surf2, border: `1px solid ${D.border}` }}
              >
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest mb-1" style={{ color: D.textPrimary }}>{item.type}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 opacity-60" style={{ color: D.textMuted }}>
                    <Calendar className="w-3 h-3" /> {item.time}
                  </p>
                </div>
                <Badge className="font-black text-[9px] uppercase tracking-widest rounded-lg border-0" style={{ background: `${item.color}15`, color: item.color }}>
                   {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence Feed */}
        <div 
          className="rounded-3xl border overflow-hidden shadow-xl"
          style={{ background: D.surf1, border: `1px solid ${D.border}` }}
        >
          <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: D.border, background: D.surf2 }}>
            <h3 className="text-sm font-black flex items-center gap-3 uppercase tracking-tight" style={{ fontFamily: D.head, color: D.textPrimary }}>
              <Bell className="h-5 w-5" style={{ color: D.emerald }} />
              COACH UPDATES
            </h3>
            <Badge className="font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border-0" style={{ background: `${D.emerald}20`, color: D.emerald }}>
              ENCRYPTED FEED
            </Badge>
          </div>
          <div className="p-6 space-y-5">
            {[
              { title: "Uniform Specifications", desc: "Please ensure white match kits are clean and prepared for Saturday. Traditional whites only.", color: D.indigo },
              { title: "In-Match Report", desc: "Team secured a tactical victory by 20 runs last weekend. Notable middle-order recovery.", color: D.emerald },
            ].map((update, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-6 py-1"
              >
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1.5 rounded-full" 
                  style={{ background: update.color }}
                />
                <p className="text-[11px] font-black uppercase tracking-widest mb-1 italic" style={{ color: D.textPrimary }}>{update.title}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed opacity-60" style={{ color: D.textMuted }}>
                  {update.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
