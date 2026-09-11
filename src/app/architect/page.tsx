"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { D } from '@/lib/design-system';
import { 
  ShieldCheck, 
  Activity, 
  Server, 
  Database, 
  Users, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Sliders,
  Terminal
} from 'lucide-react';

const MODULE_HEALTH = [
  { name: 'Match Engine & Replay Core', status: 'Healthy', latency: '24ms', uptime: '99.98%' },
  { name: 'Medical Readiness Service', status: 'Healthy', latency: '18ms', uptime: '100%' },
  { name: 'Transport Logistics Hub', status: 'Healthy', latency: '32ms', uptime: '99.95%' },
  { name: 'Scouting & Rankings Engine', status: 'Healthy', latency: '45ms', uptime: '99.90%' },
  { name: 'Facilities & Pitch Logs', status: 'Healthy', latency: '21ms', uptime: '100%' },
];

const RECENT_AUDIT_LOGS = [
  { id: 'log-01', action: 'SQUAD_SELECTION_OVERRIDE', actor: 'Coach Henderson', entity: 'Match #102', timestamp: '10 mins ago', status: 'Approved' },
  { id: 'log-02', action: 'MEDICAL_CLEARANCE_REQUIRED', actor: 'Medical Staff (Dr. Vance)', entity: 'Player #44', timestamp: '25 mins ago', status: 'Flagged' },
  { id: 'log-03', action: 'SESSION_LOCK_ACQUIRED', actor: 'Scorer #2', entity: 'Live Match #88', timestamp: '42 mins ago', status: 'Active' },
  { id: 'log-04', action: 'PITCH_READINESS_CONFIRMED', actor: 'Groundskeeper Lead', entity: 'A-Field Oval', timestamp: '1 hour ago', status: 'Logged' },
];

export default function SystemArchitectDashboard() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div className="space-y-6 p-6 bg-[#05070a] min-h-screen text-white">
      {/* Top Governance Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge className="bg-primary/20 text-primary border-primary/40 px-3 py-1 font-black text-[10px] tracking-widest uppercase">
              System Architect Scoped
            </Badge>
            <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Platform Oversight & Governance</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter" style={{ fontFamily: D.syne }}>
            SYSTEM <span className="text-primary italic">ARCHITECT</span>
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-xs mt-1">SCRBRD School Sports OS Ecosystem Core</p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline" 
            className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold rounded-2xl gap-2 h-12 px-5"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-black/40 border-white/10 backdrop-blur-xl rounded-3xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Registered Schools</p>
              <p className="text-3xl font-black mt-2 text-white" style={{ fontFamily: D.syne }}>24</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Active Licences
          </div>
        </Card>

        <Card className="bg-black/40 border-white/10 backdrop-blur-xl rounded-3xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Live Matches</p>
              <p className="text-3xl font-black mt-2 text-white" style={{ fontFamily: D.syne }}>6</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Realtime Event Streaming
          </div>
        </Card>

        <Card className="bg-black/40 border-white/10 backdrop-blur-xl rounded-3xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Audit Event Stream</p>
              <p className="text-3xl font-black mt-2 text-white" style={{ fontFamily: D.syne }}>14,290</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Terminal className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-blue-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Immutable Audit Log
          </div>
        </Card>

        <Card className="bg-black/40 border-white/10 backdrop-blur-xl rounded-3xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">System Security</p>
              <p className="text-3xl font-black mt-2 text-white" style={{ fontFamily: D.syne }}>Zero Faults</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> RBAC Boundaries Enforced
          </div>
        </Card>
      </div>

      {/* Main Grid: Module Health & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module Telemetry & Health */}
        <Card className="bg-black/40 border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-white/5 pb-5">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-black tracking-tight" style={{ fontFamily: D.syne }}>Module Telemetry & Health</CardTitle>
                <CardDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Realtime Service Status</CardDescription>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 font-black text-[10px]">
                All Systems Operational
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-white/5">
            {MODULE_HEALTH.map((mod, idx) => (
              <div key={idx} className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{mod.name}</p>
                    <span className="text-[10px] font-bold text-white/40">Latency: {mod.latency} | Uptime: {mod.uptime}</span>
                  </div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-bold text-[10px]">
                  {mod.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Audit Log Stream */}
        <Card className="bg-black/40 border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-white/5 pb-5">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-black tracking-tight" style={{ fontFamily: D.syne }}>Audit Stream</CardTitle>
                <CardDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Immutable Operational Log</CardDescription>
              </div>
              <Badge variant="outline" className="text-white/40 border-white/10 text-[10px]">
                Live Feed
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-white/5">
            {RECENT_AUDIT_LOGS.map((log) => (
              <div key={log.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black tracking-tight text-white">{log.action}</span>
                    <Badge variant="outline" className="text-[9px] border-white/10 text-white/40">{log.status}</Badge>
                  </div>
                  <p className="text-[11px] text-white/50">{log.actor} • {log.entity}</p>
                </div>
                <span className="text-[10px] font-bold text-white/30">{log.timestamp}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
