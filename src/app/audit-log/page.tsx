import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, User, Activity, Globe, Database } from "lucide-react";
import { D } from '@/lib/design-system';
import { getRecentAuditLogsAction } from '@/app/actions/auditActions';
import { formatDistanceToNow } from 'date-fns';
import { PageHeader } from '@/components/dashboard/PageHeader';

export default async function AuditLogPage() {
  const auditLogs = await getRecentAuditLogsAction(undefined, 50);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title="System Audit Log" 
        description="Immutable record of system-wide operations, security events, and administrative actions."
      />

      {/* Stats / Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Events", value: auditLogs.length.toString(), icon: Activity, color: "text-primary" },
          { label: "Source", value: "OS Event Hub", icon: Globe, color: "text-blue-400" },
          { label: "Storage", value: "Firestore State", icon: Database, color: "text-purple-400" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className={`p-3 rounded-xl bg-black/40 ${item.color}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground" style={{ fontFamily: D.mono }}>{item.label}</p>
              <p className="text-lg font-black text-white">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Feed */}
      <Card variant="glass" className="overflow-hidden border-white/10">
        <CardHeader className="border-b border-white/5 bg-white/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              OS Operational Stream
            </CardTitle>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold">LIVE FEED</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {auditLogs.length > 0 ? (
              auditLogs.map((log: any, i: number) => (
                <div key={log.id || i} className="p-6 hover:bg-white/5 transition-all group">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    <div className="flex flex-col items-center md:items-start min-w-[120px] text-muted-foreground">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-[10px] font-bold tabular-nums">
                          {log.timestamp ? formatDistanceToNow(new Date(log.timestamp.seconds * 1000), { addSuffix: true }) : 'Just now'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono opacity-40 uppercase tracking-tighter">
                        {log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleTimeString() : ''}
                      </span>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-primary animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-primary/40'}`} />
                          <h3 className="text-base font-bold text-white tracking-tight">{log.actionType}</h3>
                        </div>
                        <Badge variant="outline" className="font-mono text-[10px] text-white/40 bg-black/20 border-white/5">
                          {log.entityType}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl">{log.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 pt-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>Actor:</span>
                          <span className="text-white hover:text-primary transition-colors cursor-default">{log.actorName}</span>
                        </div>
                        <div className="h-1 w-1 rounded-full bg-white/10" />
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                          <span className="font-mono text-white/30 uppercase">UID:</span>
                          <span className="font-mono text-white/60">{log.entityId}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-32 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
                  <Activity className="h-8 w-8 text-muted-foreground/20" />
                </div>
                <h3 className="text-lg font-bold text-white">No System Events Recorded</h3>
                <p className="text-sm text-muted-foreground mt-1 italic">The OS Event Hub is awaiting operational data...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
