"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { D } from '@/lib/design-system';
import { 
  ShieldCheck, 
  Trophy, 
  Users, 
  AlertTriangle, 
  Calendar, 
  Truck, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Send, 
  UserCheck, 
  Activity, 
  Filter, 
  Lock, 
  ChevronRight,
  School as SchoolIcon,
  Sparkles,
  Phone,
  Printer,
  Bell
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MOCK_EXECUTIVE_METRICS, 
  MOCK_TEAM_READINESS_GRID, 
  MOCK_STAFF_ASSIGNMENTS, 
  MOCK_WORKLOAD_ALERTS,
  TeamReadinessTelemetry 
} from '@/lib/services/sportsDirectorService';
import Link from 'next/link';

export function SportsDirectorDashboard() {
  const [readinessGrid, setReadinessGrid] = useState<TeamReadinessTelemetry[]>(MOCK_TEAM_READINESS_GRID);
  const [filterDivision, setFilterDivision] = useState<string>('ALL');
  const [broadcastSent, setBroadcastSent] = useState<boolean>(false);
  const [lockedTeams, setLockedTeams] = useState<Record<string, boolean>>({ 'tr-1': true, 'tr-2': true });

  const toggleLockSquad = (id: string) => {
    setLockedTeams(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTeams = readinessGrid.filter(t => {
    if (filterDivision === 'ALL') return true;
    if (filterDivision === 'SENIOR') return t.teamName.includes('XI');
    if (filterDivision === 'JUNIOR') return !t.teamName.includes('XI');
    return true;
  });

  const handleBroadcastAlert = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 4000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* ─── EXECUTIVE HEADER STRIP ─── */}
      <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#080808] p-8 md:p-10 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.15)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.08)_0%,transparent_50%)]" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[#22c55e]">
                <SchoolIcon className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#22c55e]" style={{ fontFamily: D.mono }}>
                  Institutional Sports Operations
                </span>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter" style={{ fontFamily: D.head }}>
                  {MOCK_EXECUTIVE_METRICS.schoolName} <span className="text-white/40">Director Command</span>
                </h1>
              </div>
            </div>
            <p className="text-xs text-white/50 max-w-xl font-medium">
              Multi-squad operational readiness, safety compliance, coaching staff duty roster, and executive season performance metrics for {MOCK_EXECUTIVE_METRICS.season}.
            </p>
          </div>

          {/* Quick Executive Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button 
              onClick={handleBroadcastAlert}
              className={`rounded-full px-5 py-2.5 text-[10px] font-black uppercase tracking-widest h-10 transition-all ${
                broadcastSent ? 'bg-[#22c55e] text-black' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
              }`}
            >
              <Bell className="h-3.5 w-3.5 mr-2 text-[#22c55e]" />
              {broadcastSent ? 'Broadcast Dispatched!' : 'Broadcast Staff Prompt'}
            </Button>

            <Button 
              onClick={() => alert("Generating Executive Briefing PDF...")}
              className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-black uppercase tracking-widest text-[10px] rounded-full px-6 h-10 shadow-[0_0_25px_rgba(34,197,94,0.3)] transition-all"
            >
              <Printer className="h-3.5 w-3.5 mr-2" />
              Export Briefing PDF
            </Button>
          </div>
        </div>

        {/* ─── EXECUTIVE KPI RUNWAY ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/[0.08]">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40" style={{ fontFamily: D.mono }}>
                Active Squads
              </span>
              <Users className="h-4 w-4 text-[#22c55e]" />
            </div>
            <p className="text-3xl font-black text-white mt-2" style={{ fontFamily: D.head }}>
              {MOCK_EXECUTIVE_METRICS.totalActiveSquads}
            </p>
            <p className="text-[10px] font-medium text-white/40 mt-1">
              {MOCK_EXECUTIVE_METRICS.totalPlayersRegistered} Registered Athletes
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40" style={{ fontFamily: D.mono }}>
                Institutional Win Rate
              </span>
              <Trophy className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-3xl font-black text-[#22c55e] mt-2" style={{ fontFamily: D.head }}>
              {MOCK_EXECUTIVE_METRICS.overallWinRate}%
            </p>
            <p className="text-[10px] font-bold text-white/50 mt-1">
              {MOCK_EXECUTIVE_METRICS.seasonRecord.wins}W - {MOCK_EXECUTIVE_METRICS.seasonRecord.losses}L - {MOCK_EXECUTIVE_METRICS.seasonRecord.draws}D
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40" style={{ fontFamily: D.mono }}>
                Weekend Readiness
              </span>
              <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
            </div>
            <p className="text-3xl font-black text-white mt-2" style={{ fontFamily: D.head }}>
              {MOCK_EXECUTIVE_METRICS.crossFixtureReadiness}%
            </p>
            <p className="text-[10px] font-bold text-[#22c55e] mt-1">
              5 of 6 Fixtures Cleared
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40" style={{ fontFamily: D.mono }}>
                Workload Risks
              </span>
              <AlertTriangle className="h-4 w-4 text-rose-400" />
            </div>
            <p className="text-3xl font-black text-rose-400 mt-2" style={{ fontFamily: D.head }}>
              {MOCK_EXECUTIVE_METRICS.activeWorkloadAlerts}
            </p>
            <p className="text-[10px] font-bold text-rose-300/80 mt-1">
              Fast Bowlers Near Cap
            </p>
          </div>
        </div>
      </div>

      {/* ─── SECTION 1: MULTI-TEAM OPERATIONAL READINESS MATRIX ─── */}
      <div className="rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-2xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
              <h2 className="text-xl font-black text-white uppercase tracking-tight" style={{ fontFamily: D.head }}>
                MULTI-SQUAD MATCH READINESS <span className="text-[#22c55e] italic">MATRIX</span>
              </h2>
            </div>
            <p className="text-xs text-white/40 mt-1">Live telemetry across selection, player availability, grounds, transport, and staff</p>
          </div>

          <div className="flex items-center gap-2">
            {(['ALL', 'SENIOR', 'JUNIOR'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterDivision(tab)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  filterDivision === tab
                    ? 'bg-[#22c55e] text-black shadow-lg shadow-[#22c55e]/20'
                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                }`}
                style={{ fontFamily: D.mono }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Readiness Grid Cards / Table */}
        <div className="space-y-4">
          {filteredTeams.map((team) => {
            const isLocked = !!lockedTeams[team.id];
            return (
              <div 
                key={team.id}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-white text-sm" style={{ fontFamily: D.head }}>
                      {team.teamName.substring(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{team.teamName}</h3>
                        <Badge className="bg-white/5 text-white/50 border-white/10 text-[9px] uppercase font-mono">
                          {team.division}
                        </Badge>
                      </div>
                      <p className="text-xs text-white/40 font-medium mt-0.5">
                        vs {team.opponent} · <span className="text-white/60">{team.venue}</span> ({team.fixtureDate})
                      </p>
                    </div>
                  </div>

                  {/* Readiness Score Gauge */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[9px] font-black uppercase tracking-widest text-white/30" style={{ fontFamily: D.mono }}>
                        Readiness Score
                      </div>
                      <div className="text-xl font-black text-[#22c55e]" style={{ fontFamily: D.head }}>
                        {team.overallReadinessScore}%
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => toggleLockSquad(team.id)}
                      className={`rounded-xl text-[10px] font-black uppercase tracking-widest px-4 h-9 ${
                        isLocked 
                          ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                      }`}
                    >
                      {isLocked ? (
                        <>
                          <Lock className="h-3 w-3 mr-1.5 text-[#22c55e]" />
                          Squad Locked
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1.5 text-amber-300" />
                          Approve Selection
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* 5-Point Telemetry Status Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-white/5">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
                    <span className="text-[8px] font-black text-white/30 uppercase block" style={{ fontFamily: D.mono }}>Selection</span>
                    <span className={`text-[10px] font-bold mt-0.5 block ${team.squadStatus === 'APPROVED' ? 'text-[#22c55e]' : 'text-amber-400'}`}>
                      {team.squadStatus === 'APPROVED' ? 'XI Confirmed' : 'Pending Sign-off'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
                    <span className="text-[8px] font-black text-white/30 uppercase block" style={{ fontFamily: D.mono }}>Availability</span>
                    <span className="text-[10px] font-bold text-white mt-0.5 block">{team.availabilityRate}% Responded</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
                    <span className="text-[8px] font-black text-white/30 uppercase block" style={{ fontFamily: D.mono }}>Ground / Pitch</span>
                    <span className={`text-[10px] font-bold mt-0.5 block ${team.groundStatus === 'CLEARED' ? 'text-[#22c55e]' : 'text-amber-400'}`}>
                      {team.groundStatus === 'CLEARED' ? 'Turf Cleared' : 'Prep Ongoing'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
                    <span className="text-[8px] font-black text-white/30 uppercase block" style={{ fontFamily: D.mono }}>Transport</span>
                    <span className="text-[10px] font-bold text-blue-400 mt-0.5 block">{team.transportStatus}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center col-span-2 sm:col-span-1">
                    <span className="text-[8px] font-black text-white/30 uppercase block" style={{ fontFamily: D.mono }}>Staffing</span>
                    <span className={`text-[10px] font-bold mt-0.5 block ${team.staffAssigned.umpire === 'Unassigned' || team.staffAssigned.scorer === 'Unassigned' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {team.staffAssigned.umpire === 'Unassigned' || team.staffAssigned.scorer === 'Unassigned' ? 'Action Req.' : 'Staffed'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── SECTION 2 & 3: TWO-COLUMN LAYOUT (STAFF ROSTER & WORKLOAD WATCHLIST) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Staff Leadership Roster */}
        <div className="rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-[#22c55e]" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight" style={{ fontFamily: D.head }}>
                STAFF & OFFICIAL <span className="text-[#22c55e] italic">ROSTER</span>
              </h3>
            </div>
            <Badge className="bg-white/5 text-white/50 border-white/10 uppercase font-mono text-[9px]">
              {MOCK_STAFF_ASSIGNMENTS.length} ACTIVE STAFF
            </Badge>
          </div>

          <div className="space-y-3">
            {MOCK_STAFF_ASSIGNMENTS.map((staff) => (
              <div key={staff.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{staff.name}</h4>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] uppercase font-mono">
                      {staff.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">{staff.teamAssigned} · {staff.contact}</p>
                </div>

                <a href={`tel:${staff.contact}`} className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                  <Phone className="h-3.5 w-3.5 text-[#22c55e]" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Player Workload & Medical Safety Watchlist */}
        <div className="rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight" style={{ fontFamily: D.head }}>
                WORKLOAD & MEDICAL <span className="text-rose-400 italic">SAFETY WATCHLIST</span>
              </h3>
            </div>
            <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 uppercase font-mono text-[9px]">
              {MOCK_WORKLOAD_ALERTS.length} RISKS FLAGGED
            </Badge>
          </div>

          <div className="space-y-4">
            {MOCK_WORKLOAD_ALERTS.map((alertItem) => (
              <div key={alertItem.id} className="p-4 rounded-xl bg-rose-500/[0.03] border border-rose-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{alertItem.playerName}</span>
                    <span className="text-[10px] font-mono text-white/40">({alertItem.teamName})</span>
                  </div>
                  <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-[9px] uppercase font-mono">
                    {alertItem.riskType.replace('_', ' ')}
                  </Badge>
                </div>

                <p className="text-xs text-white/60 leading-relaxed">
                  {alertItem.details}
                </p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                  <span className="text-white/40 font-mono text-[10px]">Workload: {alertItem.currentWorkload}</span>
                  <span className="text-rose-300 font-bold text-[10px]">Limit: {alertItem.recommendedLimit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
