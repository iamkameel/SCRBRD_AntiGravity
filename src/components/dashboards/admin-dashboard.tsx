"use client";
// Forced rebuild to clear Turbopack cache for Client Component boundary.


import React, { useState, useEffect } from 'react';
import DashboardStats from '../dashboard/DashboardStats';
import ManagementHub from '../dashboard/ManagementHub';
import { PageHeader } from '../dashboard/PageHeader';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { Badge } from "@/components/ui/badge";
import { Activity, ShieldCheck, Zap, Globe, Cpu, History, AlertCircle, TrendingUp, Terminal, Database, Server, Users } from "lucide-react";
import { D } from "@/lib/design-system";
import { getRecentAuditLogsAction } from '@/app/actions/auditActions';
import { formatDistanceToNow, format } from 'date-fns';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    async function loadAuditLogs() {
      try {
        const logs = await getRecentAuditLogsAction(undefined, 8);
        setAuditLogs(logs || []);
      } catch (error) {
        console.error("Error loading audit logs:", error);
      } finally {
        setLoadingLogs(false);
      }
    }
    loadAuditLogs();
  }, []);

  return (
    <div className="space-y-12 pb-12">
      {/* OS Status Infrastructure row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "CORE ENGINE", status: "OPERATIONAL", icon: Cpu, color: D.emerald },
          { label: "DATA PIPELINE", status: "HEALTHY", icon: Database, color: D.amber },
          { label: "SECURITY LAYER", status: "ENCRYPTED", icon: ShieldCheck, color: D.sky },
          { label: "NETWORK TOPOLOGY", status: "STABLE", icon: Server, color: D.violet },
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-5 rounded-2xl border shadow-lg group transition-all hover:bg-black/5"
            style={{ background: D.surf1, borderColor: D.border }}
          >
            <div
              className="p-3 rounded-xl shadow-inner border transition-all group-hover:scale-110"
              style={{ background: `${item.color}08`, borderColor: `${item.color}20`, color: item.color }}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.25em] font-black italic mb-0.5 opacity-40" style={{ fontFamily: D.head, color: D.textMuted }}>{item.label}</p>
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: D.textPrimary }}>{item.status}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Strategic Command Header */}
      <div className="relative p-8 rounded-[2.5rem] border overflow-hidden shadow-2xl" 
           style={{ background: D.surf1, borderColor: D.border }}>
        <div className="absolute inset-0 opacity-10" style={{ background: D.gradMain }} />
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="h-20 w-20 rounded-2xl flex items-center justify-center shadow-inner group" 
               style={{ background: D.surf2, border: `1px solid ${D.border}` }}>
             <Terminal className="h-10 w-10 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic" style={{ fontFamily: D.head, color: D.textPrimary }}>
              COMMAND <span style={{ color: D.indigo }}>CENTRE</span>
            </h1>
            <p className="text-[12px] font-black uppercase tracking-[0.4em] mt-3 opacity-60 italic" style={{ color: D.textMuted }}>
                GLOBAL OVERSIGHT & SYSTEM ARCHITECTURE GOVERNANCE · REAL-TIME TELEMETRY ACTIVE
            </p>
          </div>
          <div className="md:ml-auto flex gap-4 w-full md:w-auto">
             <Button variant="outline" className="flex-1 md:flex-none rounded-2xl font-black text-[10px] uppercase tracking-widest px-8 h-12 border transition-all hover:bg-black/5" style={{ background: D.surf2 }}>SYSTEM AUDIT</Button>
             <Button className="flex-1 md:flex-none rounded-2xl font-black text-[10px] uppercase tracking-widest px-10 h-12 shadow-2xl border border-indigo-500/50" style={{ background: D.indigo, color: 'white' }}>INFRASTRUCTURE</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Command Column (2/3) */}
        <div className="lg:col-span-2 space-y-12">
          {/* Global OS Event Topology */}
          <div
            className="overflow-hidden rounded-[2.5rem] border shadow-2xl flex flex-col"
            style={{ background: D.surf1, borderColor: D.border }}
          >
            <div className="flex flex-row items-center justify-between p-8 border-b" style={{ borderColor: D.border, background: D.surf2 }}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl border border-white/5 opacity-40 shadow-inner">
                   <Globe className="h-5 w-5" style={{ color: D.indigo }} />
                </div>
                <div>
                   <h3 className="text-xl font-black uppercase tracking-tight italic" style={{ fontFamily: D.head, color: D.textPrimary }}>GLOBAL OS EVENT STREAM</h3>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1" style={{ color: D.textMuted }}>REAL-TIME CROSS-SCHOOL TELEMETRY</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-1 rounded-full border border-emerald-500/20" style={{ background: `${D.emerald}08` }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">LIVE</span>
              </div>
            </div>
            <div className="flex flex-col flex-1 divide-y" style={{ borderColor: D.border }}>
              {loadingLogs ? (
                <div className="py-24 text-center opacity-20">
                  <Activity className="mx-auto h-12 w-12 mb-4 animate-spin" style={{ color: D.indigo }} />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">SYNCHRONIZING TELEMETRY...</p>
                </div>
              ) : auditLogs.length > 0 ? (
                auditLogs.map((log: any, i: number) => (
                  <div
                    key={log.id || i}
                    className="p-6 transition-all hover:bg-black/5 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full shadow-[0_0_8px]" style={{ background: D.indigo, boxShadow: `0 0 8px ${D.indigo}` }} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] italic" style={{ color: D.indigo, fontFamily: D.head }}>{log.actionType.toUpperCase()}</span>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-40" style={{ color: D.textMuted }}>
                         {log.timestamp ? format(new Date(log.timestamp.seconds * 1000), 'HH:mm:ss') : 'LIVE'}
                      </span>
                    </div>
                    <p className="text-[13px] font-bold tracking-tight pr-12 leading-snug" style={{ color: D.textPrimary }}>{log.description.toUpperCase()}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2 opacity-50">
                           <Users size={12} className="text-indigo-500" />
                           <span className="text-[9px] font-black uppercase tracking-widest italic">ACTOR: {log.actorName.toUpperCase()}</span>
                      </div>
                      <span
                        className="text-[9px] px-2 py-1 rounded-lg border border-white/5 font-black tracking-[0.1em]"
                        style={{ background: D.surf3, color: D.textMuted, fontFamily: D.mono }}
                      >
                        ENT_ID: {log.entityId.slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center opacity-20">
                  <Activity className="mx-auto h-12 w-12 mb-4 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">NO ACTIVE SYSTEM TRAFFIC</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <SectionHeader title="MATCH ARCHITECTURE" sub="GLOBAL FIXTURE SCHEMATIC & OPERATIONAL STATUS" />
            <FixtureCentreCard 
              role="System Architect"
              maxMatches={5}
            />
          </div>
          
          <div className="space-y-6">
            <SectionHeader title="METRIC TOPOLOGY" sub="QUANTITATIVE PERFORMANCE ANALYTICS" />
            <DashboardStats />
          </div>
        </div>

        {/* Intelligence Sidebar (1/3) */}
        <div className="space-y-10">
          {/* Integrity Diagnostic Panel */}
          <div
            className="rounded-[2.5rem] overflow-hidden border shadow-2xl p-8"
            style={{ background: D.surf1, borderColor: D.border }}
          >
            <div className="flex items-center gap-4 mb-10">
               <div className="p-3 rounded-xl border border-indigo-500/20 shadow-inner" style={{ background: `${D.indigo}08` }}>
                  <Activity className="h-5 w-5 animate-pulse" style={{ color: D.indigo }} />
               </div>
               <div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] italic" style={{ fontFamily: D.head, color: D.indigo }}>INTEGRITY DIAG</h4>
                  <p className="text-[10px] font-black uppercase opacity-40" style={{ color: D.textMuted }}>REAL-TIME LOGIC SYNC</p>
               </div>
            </div>
            
            <div className="space-y-8">
              {/* Metric 1 */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60 italic" style={{ color: D.textMuted }}>LOGIC SYNC</span>
                  <span className="text-[11px] font-black" style={{ color: D.emerald, fontFamily: D.mono }}>99.9%</span>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden shadow-inner" style={{ background: D.surf3 }}>
                  <div className="h-full rounded-full transition-all duration-1000" style={{ background: D.emerald, width: '99.9%' }} />
                </div>
              </div>

               {/* Metric 2 */}
               <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60 italic" style={{ color: D.textMuted }}>MATCH STREAM</span>
                  <span className="text-[11px] font-black" style={{ color: D.indigo, fontFamily: D.mono }}>ACTIVE</span>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden shadow-inner" style={{ background: D.surf3 }}>
                  <div className="h-full rounded-full animate-pulse transition-all duration-1000" style={{ background: D.indigo, width: '75%' }} />
                </div>
              </div>

              {/* Status Badge */}
              <div
                className="w-full text-center py-5 rounded-2xl text-[10px] font-black tracking-[0.3em] uppercase border shadow-2xl shadow-indigo-500/10 mt-6"
                style={{ background: `${D.indigo}08`, border: `1px dashed ${D.indigo}30`, color: D.indigo, fontFamily: D.head }}
              >
                ALL SYSTEMS NOMINAL
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <SectionHeader title="MANAGEMENT HUB" sub="SYSTEM CONFIGURATION & ENTITY CONTROL" />
            <ManagementHub />
          </div>
        </div>
      </div>
    </div>
  );
}
