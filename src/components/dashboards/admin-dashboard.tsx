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
    <div className="space-y-8 pb-12">
      {/* OS Status Infrastructure row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Core Engine", status: "Operational", icon: Cpu, color: D.emerald },
          { label: "Data Pipeline", status: "Healthy", icon: Database, color: D.amber },
          { label: "Security Layer", status: "Encrypted", icon: ShieldCheck, color: D.sky },
          { label: "Network Topology", status: "Stable", icon: Server, color: D.violet },
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3.5 p-4 rounded-2xl border transition-all hover:border-white/20 hover:bg-white/[0.02]"
            style={{ background: D.surf1, borderColor: D.border }}
          >
            <div
              className="p-2.5 rounded-xl border transition-all"
              style={{ background: `${item.color}12`, borderColor: `${item.color}25`, color: item.color }}
            >
              <item.icon className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-0.5" style={{ fontFamily: D.sans }}>{item.label}</p>
              <p className="text-xs font-bold text-foreground" style={{ fontFamily: D.mono }}>{item.status}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Strategic Command Header */}
      <div className="relative p-6 md:p-8 rounded-2xl border overflow-hidden shadow-sm"
           style={{ background: D.surf1, borderColor: D.border }}>
        <div className="absolute inset-0 opacity-[0.07]" style={{ background: D.gradMain }} />
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center border shadow-sm"
               style={{ background: D.surf2, borderColor: `${D.indigo}30` }}>
             <Terminal className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: D.head }}>
              Command <span style={{ color: D.indigo }}>Centre</span>
            </h1>
            <p className="text-xs font-normal text-muted-foreground mt-1 leading-relaxed" style={{ fontFamily: D.sans }}>
              Global oversight and system architecture governance · Real-time telemetry active
            </p>
          </div>
          <div className="md:ml-auto flex gap-3 w-full md:w-auto">
             <Button variant="outline" className="flex-1 md:flex-none rounded-xl font-semibold text-xs px-5 h-10 border hover:bg-white/5" style={{ background: D.surf2, borderColor: D.border }}>System Audit</Button>
             <Button className="flex-1 md:flex-none rounded-xl font-semibold text-xs px-6 h-10 shadow-lg" style={{ background: D.indigo, color: 'white' }}>Infrastructure</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Command Column (2/3) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Global OS Event Topology */}
          <div
            className="overflow-hidden rounded-2xl border shadow-lg flex flex-col"
            style={{ background: D.surf1, borderColor: D.border }}
          >
            <div className="flex flex-row items-center justify-between p-6 border-b" style={{ borderColor: D.border, background: D.surf2 }}>
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl border border-white/10 opacity-70">
                   <Globe className="h-4.5 w-4.5" style={{ color: D.indigo }} />
                </div>
                <div>
                   <h3 className="text-base font-bold tracking-tight text-foreground" style={{ fontFamily: D.head }}>Global OS Event Stream</h3>
                   <p className="text-xs font-medium text-muted-foreground mt-0.5" style={{ fontFamily: D.sans }}>Real-time cross-school telemetry</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20" style={{ background: `${D.emerald}10` }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Live</span>
              </div>
            </div>
            <div className="flex flex-col flex-1 divide-y" style={{ borderColor: D.border }}>
              {loadingLogs ? (
                <div className="py-16 text-center opacity-40">
                  <Activity className="mx-auto h-8 w-8 mb-3 animate-spin" style={{ color: D.indigo }} />
                  <p className="text-xs font-medium text-muted-foreground" style={{ fontFamily: D.sans }}>Synchronizing telemetry...</p>
                </div>
              ) : auditLogs.length > 0 ? (
                auditLogs.map((log: any, i: number) => (
                  <div
                    key={log.id || i}
                    className="p-4 transition-all hover:bg-white/[0.02] group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: D.indigo }} />
                        <span className="text-xs font-semibold text-primary uppercase tracking-wide" style={{ fontFamily: D.sans }}>{log.actionType}</span>
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground" style={{ fontFamily: D.mono }}>
                         {log.timestamp ? format(new Date(log.timestamp.seconds * 1000), 'HH:mm:ss') : 'LIVE'}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-foreground pr-12 leading-relaxed" style={{ fontFamily: D.sans }}>{log.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5 opacity-60">
                           <Users size={12} className="text-primary" />
                           <span className="text-xs font-medium text-muted-foreground" style={{ fontFamily: D.sans }}>Actor: {log.actorName}</span>
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 rounded-md border border-white/10 font-medium"
                        style={{ background: D.surf3, color: D.textMuted, fontFamily: D.mono }}
                      >
                        ID: {log.entityId.slice(-6)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center opacity-40">
                  <Activity className="mx-auto h-8 w-8 mb-3 opacity-30" />
                  <p className="text-xs font-medium text-muted-foreground" style={{ fontFamily: D.sans }}>No active system traffic</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <SectionHeader title="Match Architecture" sub="Global fixture schematic & operational status" />
            <FixtureCentreCard
              role="System Architect"
              maxMatches={5}
            />
          </div>

          <div className="space-y-5">
            <SectionHeader title="Metric Topology" sub="Quantitative performance analytics" />
            <DashboardStats />
          </div>
        </div>

        {/* Intelligence Sidebar (1/3) */}
        <div className="space-y-8">
          {/* Integrity Diagnostic Panel */}
          <div
            className="rounded-2xl border shadow-lg p-6"
            style={{ background: D.surf1, borderColor: D.border }}
          >
            <div className="flex items-center gap-3.5 mb-6">
               <div className="p-2.5 rounded-xl border border-indigo-500/20" style={{ background: `${D.indigo}10` }}>
                  <Activity className="h-4.5 w-4.5 text-primary" />
               </div>
               <div>
                  <h4 className="text-sm font-bold tracking-tight text-foreground" style={{ fontFamily: D.head }}>Integrity Diagnostics</h4>
                  <p className="text-xs font-normal text-muted-foreground" style={{ fontFamily: D.sans }}>Real-time logic sync</p>
               </div>
            </div>

            <div className="space-y-5">
              {/* Metric 1 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-muted-foreground" style={{ fontFamily: D.sans }}>Logic Sync</span>
                  <span className="font-bold text-emerald-400" style={{ fontFamily: D.mono }}>99.9%</span>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: D.surf3 }}>
                  <div className="h-full rounded-full transition-all duration-1000" style={{ background: D.emerald, width: '99.9%' }} />
                </div>
              </div>

               {/* Metric 2 */}
               <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-muted-foreground" style={{ fontFamily: D.sans }}>Match Stream</span>
                  <span className="font-bold text-primary" style={{ fontFamily: D.mono }}>Active</span>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: D.surf3 }}>
                  <div className="h-full rounded-full animate-pulse transition-all duration-1000" style={{ background: D.indigo, width: '75%' }} />
                </div>
              </div>

              {/* Status Badge */}
              <div
                className="w-full text-center py-3 rounded-xl text-xs font-semibold border mt-4"
                style={{ background: `${D.indigo}10`, borderColor: `${D.indigo}25`, color: D.indigo, fontFamily: D.sans }}
              >
                All Systems Nominal
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <SectionHeader title="Management Hub" sub="System configuration & entity control" />
            <ManagementHub />
          </div>
        </div>
      </div>
    </div>
  );
}
