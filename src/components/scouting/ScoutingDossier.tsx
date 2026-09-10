"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { D } from "@/lib/design-system";
import { 
  Glasses, 
  Star, 
  FileText,
  Search,
  Plus,
  ChevronRight,
  Activity
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SectionHeader } from '@/components/ui/SectionHeader';

export function ScoutingDossier() {
  const reports = [
    {
      id: 1,
      player: 'J. Smith',
      school: 'Westside High',
      role: 'Leg Spinner',
      potential: 9,
      current: 6,
      tags: ['Elite Turn', 'Calm'],
      note: 'Exceptional drift. Needs work on consistency but ceiling is provincial level.',
      date: '2d ago'
    },
    {
      id: 2,
      player: 'T. Van Wyk',
      school: 'College Hill',
      role: 'Finisher',
      potential: 8,
      current: 7,
      tags: ['Power', 'Strike Rotator'],
      note: 'Matches pace well. Good boundary awareness under pressure.',
      date: '1w ago'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Info */}
      <div className="px-4">
        <SectionHeader 
          title="Scouting Dossier" 
          sub="High-performance talent pipeline and strategic technical observations."
          color={D.indigo}
          actions={
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="h-10 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                style={{ background: D.surf2, border: `1px solid ${D.border}`, color: D.textSecondary }}
              >
                <Search className="w-4 h-4 mr-2" /> Filter
              </Button>
              <Button 
                className="h-10 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                style={{ background: D.indigo, color: '#fff' }}
              >
                <Plus className="w-4 h-4 mr-2" /> New Report
              </Button>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 lg:mt-[-2rem]">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <SectionHeader 
            title="Recent Observations" 
            sub="Global tracking of high-upside prospects."
            color={D.indigo}
            actions={
              <Badge 
                variant="outline" 
                className="text-[9px] font-black uppercase tracking-tight py-1 px-3"
                style={{ background: `${D.indigo}15`, color: D.indigo, border: `1px solid ${D.indigo}30` }}
              >
                2 NEW REPORTS
              </Badge>
            }
          />

          {reports.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div 
                className="rounded-3xl overflow-hidden transition-all group p-6"
                style={{ background: D.surf1, border: `1px solid ${D.border}` }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${D.indigo}30`)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = D.border)}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all overflow-hidden"
                      style={{ background: D.surf2, border: `2px solid ${D.border}` }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${D.indigo}30`)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = D.border)}
                    >
                      <AvatarFallback className="bg-transparent font-black" style={{ color: D.textMuted }}>
                        {report.player.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </div>
                    <div>
                      <h4 className="text-lg font-black uppercase italic tracking-tight" style={{ fontFamily: D.head, color: D.textPrimary }}>{report.player}</h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: D.textMuted }}>{report.school} • {report.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-1 justify-end mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3" style={{ 
                          fill: i < (report.potential - 4) ? D.amber : 'transparent',
                          color: i < (report.potential - 4) ? D.amber : D.textMuted,
                          opacity: i < (report.potential - 4) ? 1 : 0.2
                        }} />
                      ))}
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: D.textMuted }}>POTENTIAL INDEX</p>
                  </div>
                </div>

                <div 
                  className="p-4 rounded-2xl border mb-6"
                  style={{ background: D.surf2, border: `1px solid ${D.border}` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-3.5 h-3.5" style={{ color: D.indigo }} />
                    <span className="text-[10px] font-black uppercase tracking-widest underline decoration-primary/50 underline-offset-4" style={{ color: D.textMuted }}>Executive Summary</span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed italic" style={{ color: D.textSecondary }}>"{report.note}"</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {report.tags.map(tag => (
                      <Badge 
                        key={tag} 
                        className="text-[9px] font-black uppercase tracking-tight py-1 px-3 rounded-lg"
                        style={{ background: D.surf2, color: D.textMuted, border: `1px solid ${D.border}` }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase" style={{ color: D.textMuted }}>{report.date}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-3 text-[9px] font-black uppercase tracking-widest transition-all"
                      style={{ color: D.indigo }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = `${D.indigo}15`)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      View Full Dossier <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sidebar Intelligence */}
        <div className="space-y-8">
          {/* Watchlist Summary */}
          <div 
            className="rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: D.surf1, border: `1px solid ${D.border}` }}
          >
            <div className="p-6" style={{ borderBottom: `1px solid ${D.border}` }}>
              <h3 className="text-sm font-black uppercase tracking-tighter" style={{ fontFamily: D.head, color: D.textPrimary }}>
                TALENT <span style={{ color: D.indigo, fontStyle: 'italic' }}>WATCHLIST</span>
              </h3>
            </div>
            <div className="p-6 space-y-6">
              {[
                { label: 'Elite Prospects', count: 12, trend: '+2' },
                { label: 'Watchlist (High)', count: 28, trend: 'stable' },
                { label: 'Under Investigation', count: 8, trend: '-1' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer hover:translate-x-1 transition-all">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-2 h-2 rounded-full transition-colors"
                      style={{ background: D.textMuted, opacity: 0.2 }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = D.indigo, e.currentTarget.style.opacity = "1")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = D.textMuted, e.currentTarget.style.opacity = "0.2")}
                    />
                    <span className="text-[11px] font-bold uppercase tracking-tight" style={{ color: D.textSecondary }}>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black tabular-nums" style={{ color: D.textPrimary }}>{item.count}</span>
                    <Badge 
                      className="text-[8px] font-black"
                      style={{ 
                        background: item.trend.startsWith('+') ? `${D.emerald}15` : item.trend.startsWith('-') ? `${D.rose}15` : D.surf2,
                        color: item.trend.startsWith('+') ? D.emerald : item.trend.startsWith('-') ? D.rose : D.textMuted,
                        border: `1px solid ${item.trend.startsWith('+') ? `${D.emerald}30` : item.trend.startsWith('-') ? `${D.rose}30` : D.border}`
                      }}
                    >
                      {item.trend}
                    </Badge>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full text-[10px] font-black uppercase tracking-widest h-10 rounded-xl transition-all"
                style={{ background: D.surf2, border: `1px solid ${D.border}`, color: D.textSecondary }}
              >
                Manage Watchlists
              </Button>
            </div>
          </div>

          {/* Regional Trends */}
          <div 
            className="rounded-3xl overflow-hidden shadow-2xl p-8"
            style={{ 
              background: `linear-gradient(135deg, ${D.indigo}20, transparent)`,
              border: `1px solid ${D.indigo}30`
            }}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl mb-6" style={{ background: `${D.indigo}30` }}>
              <Activity className="w-6 h-6" style={{ color: D.indigo }} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter italic mb-2" style={{ fontFamily: D.head, color: D.textPrimary }}>GRIQUAS <span style={{ color: `${D.indigo}90` }}>U15</span></h3>
            <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed mb-6" style={{ color: D.textMuted }}>
              Currently tracking 14% higher than national average in "Strike Rotation" domain for this region.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[9px] font-black uppercase" style={{ color: D.textMuted }}>
                <span>Development Velocity</span>
                <span style={{ color: D.indigo }}>+18.5%</span>
              </div>
              <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: D.surf2 }}>
                <motion.div initial={{ width: 0 }} animate={{ width: '70%' }} className="h-full" style={{ background: D.indigo }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
