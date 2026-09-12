"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, Activity, Cpu, Server, Database, Globe, AlertTriangle, 
  Radio, Lock, Users, RefreshCw, CheckCircle2, XCircle, Search, Filter, 
  Send, Zap, Clock, Terminal, ChevronRight, Layers, ArrowUpRight, Eye, Shield
} from "lucide-react";
import { D } from "@/lib/design-system";
import { 
  EngineHealthStatus, 
  WorkflowPipelineItem, 
  getSystemHealthTelemetryAction, 
  getWorkflowPipelinesAction, 
  retryWorkflowAction, 
  dispatchSystemBroadcastAction 
} from "@/app/actions/systemActions";
import { getRecentAuditLogsAction, recordAuditAction } from "@/app/actions/auditActions";
import { AuditLogEntry } from "@/lib/services/auditService";
import { ROLES, MODULES, ROLE_TIERS, hasModuleAccess, Role, Module } from "@/lib/auth/rbac";
import { formatDistanceToNow } from "date-fns";

export function SystemArchitectHub() {
  const [activeTab, setActiveTab] = useState<"overview" | "audit" | "rbac" | "workflows" | "notifications">("overview");
  
  // Telemetry & State
  const [loading, setLoading] = useState(true);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [workflows, setWorkflows] = useState<WorkflowPipelineItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  
  // Filters
  const [auditSearch, setAuditSearch] = useState("");
  const [auditCategory, setAuditCategory] = useState<string>("ALL");
  const [selectedRoleInspector, setSelectedRoleInspector] = useState<Role>(ROLES.COACH);

  // Modals & Actions
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastAudience, setBroadcastAudience] = useState<"ALL_SCHOOLS" | "COACHES_ONLY" | "SCORERS_ONLY">("ALL_SCHOOLS");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Selected Log Detail Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  useEffect(() => {
    async function loadSystemData() {
      setLoading(true);
      try {
        const [tel, wf, logs] = await Promise.all([
          getSystemHealthTelemetryAction(),
          getWorkflowPipelinesAction(),
          getRecentAuditLogsAction(undefined, 50)
        ]);
        setTelemetry(tel);
        setWorkflows(wf);
        setAuditLogs(logs);
      } catch (err) {
        console.error("Error loading system telemetry:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSystemData();
  }, []);

  const handleRetryWorkflow = async (id: string) => {
    try {
      const res = await retryWorkflowAction(id);
      setActionMessage(res.message ?? null);
      setWorkflows(prev => prev.map(w => w.id === id ? { ...w, status: "IN_PROGRESS", errorDetail: undefined } : w));
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    try {
      const res = await dispatchSystemBroadcastAction({
        title: broadcastTitle,
        message: broadcastMessage,
        audience: broadcastAudience
      });
      setActionMessage(res.message ?? null);
      setIsBroadcastOpen(false);
      setBroadcastTitle("");
      setBroadcastMessage("");
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateMockAudit = async () => {
    try {
      await recordAuditAction({
        actorId: "sys-arch-admin",
        actorName: "System Architect",
        actionType: "SECURITY_ALERT",
        entityType: "system",
        entityId: "SYS-DIAG-01",
        description: "Manual OS security scan & integrity check initiated by System Architect."
      });
      const updatedLogs = await getRecentAuditLogsAction(undefined, 50);
      setAuditLogs(updatedLogs);
      setActionMessage("Mock security audit log entry recorded.");
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered audit logs
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = auditSearch === "" || 
      log.actionType.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actorName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.description.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.entityId.toLowerCase().includes(auditSearch.toLowerCase());
    
    const matchesCategory = auditCategory === "ALL" || log.entityType.toUpperCase() === auditCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-in fade-in duration-500">
      {/* 1. Header Banner */}
      <div 
        className="rounded-3xl border p-6 md:p-8 relative overflow-hidden shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${D.surf1}, ${D.surf2})`,
          borderColor: `${D.indigo}30`
        }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none opacity-10 blur-3xl bg-indigo-500" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              SCRBRD OS Tier 1 Governance Hub
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: D.head }}>
              System Architect & Platform Audit Hub
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl" style={{ fontFamily: D.sans }}>
              Comprehensive infrastructure monitoring, immutable audit event streams, RBAC matrix capability inspection, and operational workflow resilience.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCreateMockAudit}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all hover:scale-105 active:scale-95 text-white border"
              style={{ background: D.surf3, borderColor: D.border, fontFamily: D.sans }}
            >
              <Activity className="h-4 w-4 text-emerald-400" />
              Run Security Audit Scan
            </button>

            <button
              onClick={() => setIsBroadcastOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all hover:scale-105 active:scale-95 text-white"
              style={{ background: D.indigo, fontFamily: D.sans }}
            >
              <Send className="h-4 w-4" />
              Dispatch OS Broadcast
            </button>
          </div>
        </div>

        {/* Real-time Telemetry Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/20 border border-white/5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block" style={{ fontFamily: D.mono }}>Platform Status</span>
              <span className="text-sm font-black text-emerald-400 uppercase tracking-tight" style={{ fontFamily: D.head }}>100% OPERATIONAL</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/20 border border-white/5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block" style={{ fontFamily: D.mono }}>Active Latency</span>
              <span className="text-sm font-black text-white" style={{ fontFamily: D.mono }}>24ms <span className="text-xs text-slate-500 font-normal">STABLE</span></span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/20 border border-white/5">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block" style={{ fontFamily: D.mono }}>Engine Health</span>
              <span className="text-sm font-black text-white" style={{ fontFamily: D.head }}>6/6 ENGINES ONLINE</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/20 border border-white/5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block" style={{ fontFamily: D.mono }}>90-Day SLA Uptime</span>
              <span className="text-sm font-black text-amber-400" style={{ fontFamily: D.mono }}>99.98%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Toast Feedback */}
      <AnimatePresence>
        {actionMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-bold flex items-center gap-3 shadow-lg"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>{actionMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Navigation Tabs */}
      <div 
        className="flex items-center gap-2 p-1.5 rounded-2xl border overflow-x-auto shadow-xl backdrop-blur-xl"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        {[
          { id: "overview", label: "Engine Health & Telemetry", icon: Cpu },
          { id: "audit", label: "Immutable Audit Stream", icon: Shield },
          { id: "rbac", label: "RBAC Matrix & Role Inspector", icon: Lock },
          { id: "workflows", label: "Workflow Pipeline & Failures", icon: Activity },
          { id: "notifications", label: "Communication Telemetry", icon: Radio },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold text-xs transition-colors duration-300 whitespace-nowrap select-none ${
                isActive ? "text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
              }`}
              style={{ fontFamily: D.sans }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSystemArchitectTab"
                  className="absolute inset-0 rounded-xl border border-indigo-500/30 bg-indigo-500/15 shadow-lg shadow-indigo-500/10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              
              <Icon className={`h-4 w-4 relative z-10 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}
      {/* SUB-VIEW 1: Overview & Engine Telemetry */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2" style={{ fontFamily: D.head }}>
              <Cpu className="h-5 w-5 text-indigo-400" />
              SCRBRD OS 6-Engine Core Status Matrix
            </h2>
            <span className="text-xs font-mono text-slate-400">Refreshed: {new Date().toLocaleTimeString()}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {telemetry?.engines.map((eng: EngineHealthStatus) => (
              <div
                key={eng.id}
                className="p-6 rounded-2xl border transition-all hover:border-indigo-500/30 shadow-lg space-y-4 relative overflow-hidden group"
                style={{ background: D.surf1, borderColor: D.border }}
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block" style={{ fontFamily: D.mono }}>
                      {eng.category}
                    </span>
                    <h3 className="text-base font-bold text-white tracking-tight" style={{ fontFamily: D.head }}>
                      {eng.name}
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    {eng.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-black/20 border border-white/5">
                    <span className="text-slate-500 text-[9px] uppercase font-bold block">Latency</span>
                    <span className="text-white font-bold">{eng.latencyMs} ms</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/20 border border-white/5">
                    <span className="text-slate-500 text-[9px] uppercase font-bold block">SLA Uptime</span>
                    <span className="text-emerald-400 font-bold">{eng.uptimePercent}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1" style={{ fontFamily: D.sans }}>
                  <span>Event Stream Volume:</span>
                  <span className="font-mono font-bold text-slate-200">{eng.activeEventsCount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Infrastructure Metrics & Queue Monitor */}
          <div className="p-6 rounded-2xl border space-y-6" style={{ background: D.surf1, borderColor: D.border }}>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2" style={{ fontFamily: D.head }}>
              <Server className="h-5 w-5 text-indigo-400" />
              Client Queue & Database Load Monitor
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block" style={{ fontFamily: D.mono }}>IndexedDB Offline Queue</span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-white font-mono">{telemetry?.indexedDbQueueSize || 0} Events</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">FLUSHED</span>
                </div>
                <p className="text-[11px] text-slate-500">Local storage queue worker status: Idle (0 pending out-of-sync events).</p>
              </div>

              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block" style={{ fontFamily: D.mono }}>Active School Ecosystems</span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-indigo-400 font-mono">{telemetry?.activeSchoolsCount || 18} Schools</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">ONLINE</span>
                </div>
                <p className="text-[11px] text-slate-500">WBHS, Kearsney, Hilton, Michaelhouse, Saints, Jeppe, Maritzburg & 11 others.</p>
              </div>

              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block" style={{ fontFamily: D.mono }}>Live Match Telemetry Streams</span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-rose-400 font-mono">{telemetry?.liveMatchesCount || 3} Fixtures</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">BROADCASTING</span>
                </div>
                <p className="text-[11px] text-slate-500">Live ball-by-ball recording with polar spatial shot tracking.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Immutable Audit Stream */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2" style={{ fontFamily: D.head }}>
                <Shield className="h-5 w-5 text-indigo-400" />
                Immutable System Audit Feed
              </h2>
              <p className="text-xs text-slate-400 mt-1">Real-time log of security events, selection overrides, result verifications & logistics updates.</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-slate-400">{filteredAuditLogs.length} Events</span>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl border" style={{ background: D.surf1, borderColor: D.border }}>
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search audit events by actor, description, or entity ID..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {["ALL", "MATCH", "PLAYER", "TEAM", "SYSTEM", "LOGISTICS", "MEDICAL"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setAuditCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    auditCategory === cat 
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" 
                      : "text-slate-400 hover:bg-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Stream List */}
          <div className="rounded-2xl border divide-y divide-white/5 overflow-hidden" style={{ background: D.surf1, borderColor: D.border }}>
            {filteredAuditLogs.length > 0 ? (
              filteredAuditLogs.map((log, idx) => (
                <div 
                  key={log.id || idx}
                  onClick={() => setSelectedLog(log)}
                  className="p-5 hover:bg-white/[0.02] transition-colors cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className={`p-2.5 rounded-xl border shrink-0 ${
                        log.actionType.includes("SECURITY") || log.actionType.includes("ALERT")
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : log.actionType.includes("REPLACED") || log.actionType.includes("OVERRIDE")
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                      }`}
                    >
                      <Shield className="h-5 w-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-white tracking-tight" style={{ fontFamily: D.head }}>
                          {log.actionType}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-black/40 border border-white/10 text-slate-300 uppercase">
                          {log.entityType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                        {log.description}
                      </p>
                      <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 pt-1">
                        <span>Actor: <strong className="text-slate-300">{log.actorName}</strong> ({log.actorId})</span>
                        <span>•</span>
                        <span>Entity ID: <strong className="text-slate-300">{log.entityId}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-end justify-between md:justify-center text-right shrink-0">
                    <span className="text-[10px] font-mono text-slate-400">
                      {log.timestamp ? formatDistanceToNow(new Date(log.timestamp.seconds * 1000), { addSuffix: true }) : "Just now"}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 transition-colors mt-1" />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <Activity className="h-8 w-8 mx-auto text-slate-600 opacity-40" />
                <p className="text-xs font-bold text-slate-400">No audit entries matching search criteria</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: RBAC Matrix & Role Inspector */}
      {activeTab === "rbac" && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2" style={{ fontFamily: D.head }}>
                <Lock className="h-5 w-5 text-indigo-400" />
                SCRBRD OS Unified RBAC & Permission Matrix
              </h2>
              <p className="text-xs text-slate-400 mt-1">17 Platform Roles | 6 Security Tiers | Operational Scopes Engine</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400">Simulate Role:</span>
              <select
                value={selectedRoleInspector}
                onChange={(e) => setSelectedRoleInspector(e.target.value as Role)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-indigo-400 focus:outline-none"
              >
                {Object.entries(ROLES).map(([key, val]) => (
                  <option key={val} value={val}>{key} (Tier {ROLE_TIERS[val]})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Role Inspector Panel */}
          <div className="p-6 rounded-2xl border space-y-6" style={{ background: D.surf1, borderColor: D.border }}>
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono font-bold text-sm">
                  T{ROLE_TIERS[selectedRoleInspector]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight uppercase" style={{ fontFamily: D.head }}>
                    {selectedRoleInspector} ROLE CAPABILITIES
                  </h3>
                  <span className="text-xs font-mono text-slate-400">Security Tier {ROLE_TIERS[selectedRoleInspector]} Access Boundary</span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ACTIVE IN OS REGISTRY
              </span>
            </div>

            {/* Permitted Modules Breakdown for Selected Role */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider" style={{ fontFamily: D.mono }}>
                MODULE PERMISSIONS OVERVIEW
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {(Object.keys(MODULES) as Module[]).map((mod) => {
                  const allowed = hasModuleAccess(selectedRoleInspector, mod);
                  return (
                    <div
                      key={mod}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                        allowed 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" 
                          : "bg-black/30 border-white/5 text-slate-600 opacity-60"
                      }`}
                    >
                      <span className="capitalize">{mod}</span>
                      {allowed ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> : <XCircle className="h-4 w-4 text-slate-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Full Interactive RBAC Matrix Table */}
          <div className="p-6 rounded-2xl border space-y-4" style={{ background: D.surf1, borderColor: D.border }}>
            <h3 className="text-base font-bold text-white tracking-tight" style={{ fontFamily: D.head }}>
              Global OS Permission Matrix (Key Operational Modules)
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-center">Tier</th>
                    <th className="py-3 px-4 text-center">Scoring</th>
                    <th className="py-3 px-4 text-center">Matches</th>
                    <th className="py-3 px-4 text-center">Competitions</th>
                    <th className="py-3 px-4 text-center">Squads</th>
                    <th className="py-3 px-4 text-center">Fields</th>
                    <th className="py-3 px-4 text-center">Logistics</th>
                    <th className="py-3 px-4 text-center">Medical</th>
                    <th className="py-3 px-4 text-center">Skills</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {Object.entries(ROLES).map(([key, roleVal]) => {
                    const tier = ROLE_TIERS[roleVal];
                    return (
                      <tr key={roleVal} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-bold text-white">{key}</td>
                        <td className="py-3 px-4 text-center text-indigo-400 font-bold">T{tier}</td>
                        {["scoring", "matches", "competitions", "squad", "fields", "logistics", "medical", "skills"].map(m => {
                          const hasAcc = hasModuleAccess(roleVal, m as Module);
                          return (
                            <td key={m} className="py-3 px-4 text-center">
                              {hasAcc ? (
                                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                              ) : (
                                <span className="inline-block w-2 h-2 rounded-full bg-slate-700 opacity-40" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: Workflows & Failures */}
      {activeTab === "workflows" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2" style={{ fontFamily: D.head }}>
                <Activity className="h-5 w-5 text-indigo-400" />
                Match-Day Workflow Resilience Pipeline
              </h2>
              <p className="text-xs text-slate-400 mt-1">Live tracking of fixture operational stages from squad selection to result verification.</p>
            </div>
          </div>

          <div className="space-y-4">
            {workflows.map((wf) => {
              const isFailed = wf.status === "FAILED";
              const isCompleted = wf.status === "COMPLETED";

              return (
                <div
                  key={wf.id}
                  className={`p-6 rounded-2xl border transition-all space-y-4 ${
                    isFailed ? "bg-rose-500/10 border-rose-500/40" : "bg-slate-900/80 border-slate-800"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">{wf.id} • {wf.fixtureId}</span>
                      <h3 className="text-base font-bold text-white tracking-tight" style={{ fontFamily: D.head }}>{wf.title}</h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                        isFailed 
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse" 
                          : isCompleted 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                      }`}>
                        {wf.status}
                      </span>

                      {isFailed && (
                        <button
                          onClick={() => handleRetryWorkflow(wf.id)}
                          className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-lg transition-all"
                        >
                          Re-queue & Sync
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stage Stepper */}
                  <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-mono">
                    {["SQUAD_SELECTION", "GROUND_CHECK", "TRANSPORT_MANIFEST", "LIVE_SCORING", "RESULT_VERIFICATION"].map((st, i) => {
                      const isCurrent = wf.stage === st;
                      return (
                        <div
                          key={st}
                          className={`p-2 rounded-xl border font-bold ${
                            isCurrent
                              ? isFailed ? "bg-rose-500/20 text-rose-300 border-rose-500/40" : "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                              : "bg-black/20 text-slate-600 border-white/5"
                          }`}
                        >
                          <span>Step {i + 1}</span>
                          <span className="block truncate text-[9px] mt-0.5 font-normal opacity-80">{st.replace("_", " ")}</span>
                        </div>
                      );
                    })}
                  </div>

                  {wf.errorDetail && (
                    <div className="p-3 rounded-xl bg-black/40 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                      <span>{wf.errorDetail}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: Notification Telemetry */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2" style={{ fontFamily: D.head }}>
                <Radio className="h-5 w-5 text-indigo-400" />
                Platform Communication & Broadcast Telemetry
              </h2>
              <p className="text-xs text-slate-400 mt-1">Push alerts, Parent SMS manifests & emergency broadcasts telemetry.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border space-y-2" style={{ background: D.surf1, borderColor: D.border }}>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block" style={{ fontFamily: D.mono }}>SMS Messages Sent</span>
              <span className="text-3xl font-black text-white font-mono">14,280</span>
              <p className="text-[11px] text-slate-500">Parent departure notifications & squad release alerts.</p>
            </div>

            <div className="p-6 rounded-2xl border space-y-2" style={{ background: D.surf1, borderColor: D.border }}>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block" style={{ fontFamily: D.mono }}>Delivery Success Rate</span>
              <span className="text-3xl font-black text-emerald-400 font-mono">99.4%</span>
              <p className="text-[11px] text-slate-500">Twilio / Firebase Push worker delivery confirmation rate.</p>
            </div>

            <div className="p-6 rounded-2xl border space-y-2" style={{ background: D.surf1, borderColor: D.border }}>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block" style={{ fontFamily: D.mono }}>Active Channels</span>
              <span className="text-3xl font-black text-indigo-400 font-mono">4 Channels</span>
              <p className="text-[11px] text-slate-500">In-App Drawer, Web Push, Parent SMS, Headmaster Digest.</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Broadcast Modal */}
      <AnimatePresence>
        {isBroadcastOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg p-6 rounded-3xl border shadow-2xl space-y-6"
              style={{ background: D.surf1, borderColor: D.border }}
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2" style={{ fontFamily: D.head }}>
                  <Send className="h-5 w-5 text-indigo-400" />
                  Dispatch Platform System Broadcast
                </h3>
                <button onClick={() => setIsBroadcastOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs font-medium">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider block">Target Audience</label>
                  <select
                    value={broadcastAudience}
                    onChange={(e) => setBroadcastAudience(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                  >
                    <option value="ALL_SCHOOLS">All Schools & User Profiles</option>
                    <option value="COACHES_ONLY">Coaching Staff & Directors Only</option>
                    <option value="SCORERS_ONLY">Active Scorers & Match Officials</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider block">Broadcast Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. System Maintenance Notice or Urgent Weather Alert"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold placeholder-slate-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider block">Message Content</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Enter system announcement text to broadcast..."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsBroadcastOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold shadow-lg"
                  >
                    Dispatch Now
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Log Detail Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl p-6 rounded-3xl border shadow-2xl space-y-6"
              style={{ background: D.surf1, borderColor: D.border }}
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2" style={{ fontFamily: D.head }}>
                  <Terminal className="h-5 w-5 text-indigo-400" />
                  Audit Log Payload Details
                </h3>
                <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Action Type</span>
                  <span className="text-indigo-400 font-bold text-sm">{selectedLog.actionType}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Actor Name</span>
                    <span className="text-white font-bold">{selectedLog.actorName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Entity Type</span>
                    <span className="text-white font-bold uppercase">{selectedLog.entityType}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Description</span>
                  <p className="text-slate-200 leading-relaxed font-sans">{selectedLog.description}</p>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Entity ID</span>
                  <span className="text-slate-300 font-bold">{selectedLog.entityId}</span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
