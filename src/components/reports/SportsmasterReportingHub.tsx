"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { D } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  FileText, Download, Printer, Filter, Search, Trophy, Calendar,
  BarChart3, ShieldCheck, Bus, Activity, Users, Award, MapPin,
  TrendingUp, CheckCircle2, AlertCircle, FileSpreadsheet, Sparkles, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_EXECUTIVE_SUMMARY, generateCsv, downloadFile } from "@/lib/intelligence/reportingEngine";
import { PrintableMatchReport } from "@/components/match/PrintableMatchReport";

type TabId = 'overview' | 'matches' | 'honours' | 'development' | 'operations';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview',    label: 'Executive Overview',   icon: Activity },
  { id: 'matches',     label: 'Match Digest',         icon: FileText },
  { id: 'honours',     label: 'Honours Board & Stats', icon: Trophy },
  { id: 'development', label: 'Development Audit',   icon: TrendingUp },
  { id: 'operations',  label: 'Grounds & Logistics',  icon: Bus },
];

/* ── Stat Pill Component ── */
function StatPill({ label, value, color = D.textSecondary, subtext }: { label: string; value: string | number; color?: string; subtext?: string }) {
  return (
    <div className="flex flex-col p-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] shadow-lg">
      <div className="text-2xl md:text-3xl font-black tracking-tight" style={{ color, fontFamily: D.head }}>
        {value}
      </div>
      <div className="text-[9px] font-black uppercase tracking-[0.15em] text-white/40 mt-1">{label}</div>
      {subtext && <div className="text-[9px] text-white/30 mt-0.5 font-medium">{subtext}</div>}
    </div>
  );
}

/* ── Section Card Wrapper ── */
function Section({ label, children, accent, rightElement }: { label?: string; children: React.ReactNode; accent?: string; rightElement?: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] overflow-hidden shadow-xl backdrop-blur-xl">
      {label && (
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between" style={{ background: accent ? `${accent}08` : 'transparent' }}>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 font-sans">
            {label}
          </div>
          {rightElement}
        </div>
      )}
      {children}
    </div>
  );
}

// Mock player statistics dataset for exports & tables
const MOCK_PLAYER_STATS = [
  { id: 'P-101', name: 'Kameel Kalyani', team: '1st XI', matches: 10, runs: 482, average: 53.5, sr: 138.2, fifties: 4, hundreds: 1, wickets: 2, econ: 6.2 },
  { id: 'P-102', name: 'Ethan Stuurman', team: '1st XI', matches: 10, runs: 142, average: 23.6, sr: 110.5, fifties: 0, hundreds: 0, wickets: 26, econ: 4.1 },
  { id: 'P-103', name: 'David Miller', team: 'U15A', matches: 8, runs: 340, average: 42.5, sr: 124.0, fifties: 3, hundreds: 0, wickets: 0, econ: 0.0 },
  { id: 'P-104', name: 'Sipho Ndlovu', team: 'U15A', matches: 8, runs: 88, average: 17.6, sr: 95.0, fifties: 0, hundreds: 0, wickets: 19, econ: 4.8 },
  { id: 'P-105', name: 'Luke Peterson', team: '1st XI', matches: 10, runs: 290, average: 36.2, sr: 118.4, fifties: 2, hundreds: 0, wickets: 11, econ: 5.3 },
  { id: 'P-106', name: 'Matthew Breetzke', team: '2nd XI', matches: 6, runs: 210, average: 35.0, sr: 105.0, fifties: 1, hundreds: 0, wickets: 4, econ: 5.8 },
  { id: 'P-107', name: 'Caelan Cooper', team: 'U14A', matches: 5, runs: 175, average: 35.0, sr: 112.0, fifties: 1, hundreds: 0, wickets: 8, econ: 4.5 },
];

// Mock matches dataset for match report digest
const MOCK_MATCH_DIGEST = [
  { id: 'MATCH-101', date: '2026-03-08', homeTeam: 'Wynberg Boys 1st XI', awayTeam: 'Bishops Diocesan 1st XI', venue: 'Jacques Kallis Oval', result: 'Wynberg 1st XI won by 42 runs', format: '50 Overs' },
  { id: 'MATCH-102', date: '2026-03-01', homeTeam: 'Wynberg Boys 1st XI', awayTeam: 'SACS 1st XI', venue: 'SACS Main Oval', result: 'Wynberg 1st XI won by 6 wickets', format: 'T20' },
  { id: 'MATCH-103', date: '2026-02-22', homeTeam: 'Wynberg Boys U15A', awayTeam: 'Rondebosch U15A', venue: 'Silverhurst Oval', result: 'Wynberg U15A won by 18 runs', format: '50 Overs' },
  { id: 'MATCH-104', date: '2026-02-15', homeTeam: 'Wynberg Boys 1st XI', awayTeam: 'Grey High School 1st XI', venue: 'Jacques Kallis Oval', result: 'Grey High won by 3 wickets', format: 'Declaration' },
  { id: 'MATCH-105', date: '2026-02-08', homeTeam: 'Wynberg Boys U14A', awayTeam: 'Paul Roos U14A', venue: 'Markötter Oval', result: 'Wynberg U14A won by 4 wickets', format: 'T20' },
];

// Mock operational grounds telemetry dataset
const MOCK_GROUNDS_TELEMETRY = [
  { field: 'Jacques Kallis Oval (A)', status: 'Clearance Granted', civ: 88, moisture: '14.2%', grassHeight: '4.0 mm', rollerHours: 14.5 },
  { field: 'Silverhurst Oval (B)', status: 'Clearance Granted', civ: 82, moisture: '15.8%', grassHeight: '4.5 mm', rollerHours: 10.0 },
  { field: 'High Performance Nets', status: 'Maintenance Complete', civ: 94, moisture: '12.5%', grassHeight: '3.5 mm', rollerHours: 6.0 },
];

export function SportsmasterReportingHub() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  /* ── Filtered Datasets ── */
  const filteredPlayerStats = useMemo(() => {
    return MOCK_PLAYER_STATS.filter(p => {
      if (teamFilter !== 'all' && p.team !== teamFilter) return false;
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [teamFilter, searchQuery]);

  const filteredMatches = useMemo(() => {
    return MOCK_MATCH_DIGEST.filter(m => {
      if (searchQuery) {
        const text = `${m.homeTeam} ${m.awayTeam} ${m.venue} ${m.result}`.toLowerCase();
        if (!text.includes(searchQuery.toLowerCase())) return false;
      }
      return true;
    });
  }, [searchQuery]);

  /* ── CSV Export Handlers ── */
  const handleExportPlayerStatsCsv = () => {
    const csvContent = generateCsv(MOCK_PLAYER_STATS, [
      { key: 'name', label: 'Player Name' },
      { key: 'team', label: 'Team' },
      { key: 'matches', label: 'Matches' },
      { key: 'runs', label: 'Runs' },
      { key: 'average', label: 'Batting Avg' },
      { key: 'sr', label: 'Strike Rate' },
      { key: 'fifties', label: '50s' },
      { key: 'hundreds', label: '100s' },
      { key: 'wickets', label: 'Wickets' },
      { key: 'econ', label: 'Economy' },
    ]);
    downloadFile(csvContent, `wynberg_player_stats_${new Date().toISOString().slice(0,10)}.csv`);
    toast.success("Player Stats CSV exported successfully!");
  };

  const handleExportFixturesCsv = () => {
    const csvContent = generateCsv(MOCK_MATCH_DIGEST, [
      { key: 'date', label: 'Match Date' },
      { key: 'format', label: 'Format' },
      { key: 'homeTeam', label: 'Home Team' },
      { key: 'awayTeam', label: 'Away Team' },
      { key: 'venue', label: 'Venue' },
      { key: 'result', label: 'Result' },
    ]);
    downloadFile(csvContent, `wynberg_match_digest_${new Date().toISOString().slice(0,10)}.csv`);
    toast.success("Match Digest CSV exported successfully!");
  };

  const handleExportGroundsCsv = () => {
    const csvContent = generateCsv(MOCK_GROUNDS_TELEMETRY, [
      { key: 'field', label: 'Field Name' },
      { key: 'status', label: 'Status' },
      { key: 'civ', label: 'Clegg Impact Value (CIV)' },
      { key: 'moisture', label: 'Moisture (TDM)' },
      { key: 'grassHeight', label: 'Grass Height' },
      { key: 'rollerHours', label: 'Roller Hours Logged' },
    ]);
    downloadFile(csvContent, `wynberg_pitch_telemetry_${new Date().toISOString().slice(0,10)}.csv`);
    toast.success("Pitch Telemetry CSV exported successfully!");
  };

  return (
    <div className="min-h-screen pb-24 space-y-8" style={{ background: D.base }}>
      
      {/* ─── Executive Header Banner ─── */}
      <div className="relative rounded-[2.5rem] border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-black/80 to-slate-950/90 overflow-hidden p-8 md:p-10 shadow-2xl backdrop-blur-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.15),transparent)] pointer-events-none" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-[10px] font-black uppercase tracking-[0.25em]">
                <Award className="h-4 w-4" />
                <span>SCRBRD School Sportsmaster Operating System</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight" style={{ fontFamily: D.head }}>
                Sportsmaster Reporting & Export Hub
              </h1>
              <p className="text-xs md:text-sm text-white/50 max-w-2xl">
                Official school-wide cricket operations digest, season performance analytics, longitudinal skill matrix compliance, and print-ready PDF/CSV exports.
              </p>
            </div>

            {/* Quick Export Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleExportPlayerStatsCsv}
                className="h-10 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-black uppercase tracking-wider gap-2 shadow-lg shadow-emerald-500/10"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export Stats CSV
              </Button>
              <Button
                onClick={handleExportFixturesCsv}
                className="h-10 px-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-black uppercase tracking-wider gap-2 shadow-lg shadow-amber-500/10"
              >
                <Download className="h-4 w-4" />
                Export Matches CSV
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 pt-4 border-t border-white/[0.08]">
            <StatPill label="Total Matches" value={MOCK_EXECUTIVE_SUMMARY.totalFixtures} color="#818cf8" subtext="24 Completed" />
            <StatPill label="School Win %" value={`${MOCK_EXECUTIVE_SUMMARY.winRate}%`} color="#34d399" subtext="75% Success Rate" />
            <StatPill label="Total Runs" value={MOCK_EXECUTIVE_SUMMARY.totalRunsScored} color="#fbbf24" subtext="Across All Squads" />
            <StatPill label="Wickets Taken" value={MOCK_EXECUTIVE_SUMMARY.totalWicketsTaken} color="#f472b6" subtext="198 Total Dismissals" />
            <StatPill label="Milestones" value={MOCK_EXECUTIVE_SUMMARY.milestonesAchieved} color="#a78bfa" subtext="14 Highlights" />
            <StatPill label="Fleet Safety" value={`${MOCK_EXECUTIVE_SUMMARY.transportSafetyRate}%`} color="#60a5fa" subtext="100% 6-Point Audit" />
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs ─── */}
      <div className="border-b border-white/[0.08] overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max pb-2">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors",
                  active ? "text-white" : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="reportsTabPill"
                    className="absolute inset-0 bg-white/10 rounded-2xl border border-white/15 shadow-lg shadow-black/20"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className={cn("h-3.5 w-3.5", active ? "text-amber-400" : "text-white/30")} />
                  <span>{tab.label}</span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ─── Tab Content Views ─── */}
      <div className="space-y-8">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Executive Summary Box */}
            <Section label="Executive Director Summary" accent="#f59e0b">
              <div className="p-6 md:p-8 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-white tracking-tight" style={{ fontFamily: D.head }}>
                      Wynberg Boys&apos; High School Cricket Department — 2026 Season Performance Digest
                    </h3>
                    <p className="text-xs md:text-sm text-white/70 leading-relaxed">
                      The 2026 cricket season across all four age divisions (1st XI, 2nd XI, U15A, U14A) has yielded outstanding results, recording a <strong className="text-emerald-400">75% overall match win rate</strong> across 24 completed fixtures. The 1st XI squad leads the institution with an 80% win record, anchored by milestone performances from Kameel Kalyani (482 runs) and Ethan Stuurman (26 wickets). Pitch telemetry and ground maintenance logs confirm 142 field prep hours with zero safety non-compliances.
                    </p>
                  </div>
                </div>
              </div>
            </Section>

            {/* Team Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Section label="Team Performance & Win Rates" accent="#6366f1">
                <div className="p-6 space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.08] text-[9px] font-black uppercase tracking-widest text-white/40">
                          <th className="pb-3">Team Name</th>
                          <th className="pb-3 text-center">Played</th>
                          <th className="pb-3 text-center">Won</th>
                          <th className="pb-3 text-center">Lost</th>
                          <th className="pb-3 text-right">Win Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {MOCK_EXECUTIVE_SUMMARY.teamBreakdown.map((t, idx) => (
                          <tr key={idx} className="hover:bg-white/[0.02]">
                            <td className="py-3.5 font-bold text-white">{t.teamName}</td>
                            <td className="py-3.5 text-center font-mono text-white/70">{t.played}</td>
                            <td className="py-3.5 text-center font-mono text-emerald-400 font-bold">{t.won}</td>
                            <td className="py-3.5 text-center font-mono text-red-400">{t.lost}</td>
                            <td className="py-3.5 text-right font-mono font-black text-amber-400">{t.winPct}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Section>

              <Section label="Top Season Performers" accent="#a78bfa">
                <div className="p-6 space-y-3">
                  {MOCK_EXECUTIVE_SUMMARY.topPerformers.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white">{p.name}</div>
                        <div className="text-[9px] text-white/40 uppercase tracking-widest font-mono">{p.team} · {p.role}</div>
                      </div>
                      <div className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                        {p.metric}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          </div>
        )}

        {/* MATCH DIGEST TAB */}
        {activeTab === 'matches' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  placeholder="Search fixtures, venues, results..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-white/[0.04] border-white/10 text-xs text-white placeholder:text-white/30 focus-visible:ring-amber-500"
                />
              </div>
              <Button
                onClick={handleExportFixturesCsv}
                size="sm"
                className="h-10 px-4 rounded-xl bg-white/[0.06] border border-white/10 text-white hover:bg-white/10 text-xs font-black uppercase tracking-wider gap-2"
              >
                <Download className="h-4 w-4 text-amber-400" />
                Export CSV
              </Button>
            </div>

            {/* Matches List */}
            <div className="space-y-4">
              {filteredMatches.map((m) => (
                <div key={m.id} className="p-6 rounded-3xl border border-white/[0.07] bg-white/[0.025] hover:border-white/15 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                        {m.format}
                      </span>
                      <span className="text-xs text-white/40 font-mono">{m.date}</span>
                      <span className="text-xs text-white/30 font-medium">· {m.venue}</span>
                    </div>
                    <h4 className="text-lg font-black text-white tracking-tight" style={{ fontFamily: D.head }}>
                      {m.homeTeam} vs {m.awayTeam}
                    </h4>
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{m.result}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <PrintableMatchReport matchData={m} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HONOURS BOARD TAB */}
        {activeTab === 'honours' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-white/30 ml-1" />
                <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
                  {['all', '1st XI', '2nd XI', 'U15A', 'U14A'].map(team => (
                    <button
                      key={team}
                      onClick={() => setTeamFilter(team)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                        teamFilter === team ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
                      )}
                    >
                      {team === 'all' ? 'All Squads' : team}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleExportPlayerStatsCsv}
                size="sm"
                className="h-10 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-black uppercase tracking-wider gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Download Player Stats CSV
              </Button>
            </div>

            {/* Honours Table */}
            <Section label="Season Player Statistics & Honours Board" accent="#f59e0b">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[9px] font-black uppercase tracking-widest text-white/40 bg-white/[0.02]">
                      <th className="p-4">Player</th>
                      <th className="p-4">Squad</th>
                      <th className="p-4 text-center">Matches</th>
                      <th className="p-4 text-center">Runs</th>
                      <th className="p-4 text-center">Avg</th>
                      <th className="p-4 text-center">SR</th>
                      <th className="p-4 text-center">50s / 100s</th>
                      <th className="p-4 text-center">Wkts</th>
                      <th className="p-4 text-right">Econ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredPlayerStats.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-bold text-white">{p.name}</td>
                        <td className="p-4 font-mono text-white/50 text-[10px] uppercase">{p.team}</td>
                        <td className="p-4 text-center font-mono text-white/70">{p.matches}</td>
                        <td className="p-4 text-center font-mono font-bold text-amber-400">{p.runs}</td>
                        <td className="p-4 text-center font-mono text-emerald-400 font-bold">{p.average}</td>
                        <td className="p-4 text-center font-mono text-white/60">{p.sr}</td>
                        <td className="p-4 text-center font-mono text-purple-400">{p.fifties} / {p.hundreds}</td>
                        <td className="p-4 text-center font-mono font-bold text-blue-400">{p.wickets}</td>
                        <td className="p-4 text-right font-mono text-white/60">{p.econ}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        )}

        {/* DEVELOPMENT AUDIT TAB */}
        {activeTab === 'development' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatPill label="Skill Matrix Assessments" value="100%" color="#34d399" subtext="All Players Evaluated" />
              <StatPill label="Medical Clearances" value="100%" color="#60a5fa" subtext="Zero Uncleared Injuries" />
              <StatPill label="Training Compliance" value="94.2%" color="#fbbf24" subtext="Coach Session Logging" />
            </div>

            <Section label="7-Domain Skill Matrix Compliance Audit" accent="#10b981">
              <div className="p-6 space-y-4">
                {[
                  { domain: 'Batting Technique & Tempo', rating: '7.8 / 9.0', status: 'STRONG', text: 'Opener strike rotation and spin boundary execution at high school standard.' },
                  { domain: 'Bowling Release & Consistency', rating: '7.5 / 9.0', status: 'STRONG', text: 'Seam line discipline and death over yorker accuracy.' },
                  { domain: 'Fielding & Ground Reflexes', rating: '8.1 / 9.0', status: 'ELITE', text: 'Inner ring pressure fielding and boundary throw accuracy.' },
                  { domain: 'Wicketkeeping Catch & Take', rating: '7.2 / 9.0', status: 'COMPETENT', text: 'Standing up takes to finger spin improving steadily.' },
                  { domain: 'Tactical Game Awareness', rating: '7.0 / 9.0', status: 'COMPETENT', text: 'Phase-specific over management and field placement adjustments.' },
                ].map((d, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white">{d.domain}</div>
                      <div className="text-[10px] text-white/40">{d.text}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-black text-emerald-400">{d.rating}</div>
                      <div className="text-[8px] font-black uppercase tracking-widest text-emerald-400/70">{d.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* GROUNDS & LOGISTICS TAB */}
        {activeTab === 'operations' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white tracking-tight" style={{ fontFamily: D.head }}>
                Facilities & Fleet Operational Audit Logs
              </h3>
              <Button
                onClick={handleExportGroundsCsv}
                size="sm"
                className="h-10 px-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 text-xs font-black uppercase tracking-wider gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export Telemetry CSV
              </Button>
            </div>

            <Section label="Pitch Telemetry & Maintenance Audit" accent="#6366f1">
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {MOCK_GROUNDS_TELEMETRY.map((g, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-2">
                      <div className="text-xs font-bold text-white">{g.field}</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-emerald-400">{g.status}</div>
                      <div className="pt-2 border-t border-white/[0.06] space-y-1 font-mono text-[10px] text-white/60">
                        <div>Clegg Impact: <span className="text-white font-bold">{g.civ} CIV</span></div>
                        <div>Moisture: <span className="text-white font-bold">{g.moisture}</span></div>
                        <div>Cut Height: <span className="text-white font-bold">{g.grassHeight}</span></div>
                        <div>Roller Hours: <span className="text-amber-400 font-bold">{g.rollerHours} hrs</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          </div>
        )}

      </div>
    </div>
  );
}
