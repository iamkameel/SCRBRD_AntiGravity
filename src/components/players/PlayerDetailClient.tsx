"use client";

import { useState, useRef, useEffect } from "react";
import { Player as Person } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  TrendingUp,
  Activity,
  Award,
  Calendar,
  Mail,
  Phone,
  BarChart2,
  Shield,
  Zap,
  User,
  BookOpen,
  Target,
  Map,
  Star,
  ChevronRight,
  Clock,
} from "lucide-react";
import { BattingStatsCard, BowlingStatsCard, FieldingStatsCard } from "./PlayerStatsCards";
import { PlayerPerformanceCharts } from "./PlayerPerformanceCharts";
import { PlayerSkillsDisplay } from "./PlayerSkillsDisplay";
import { D, GlobalStyles } from "@/lib/scoring/theme";
import { RecentMatches } from "./RecentMatches";
import PlayerImpactCard from "@/components/rankings/PlayerImpactCard";
import { FormAnalysisCard } from "@/components/profiles/FormAnalysisCard";
import { PerformanceInsightsCard } from "@/components/profiles/PerformanceInsightsCard";
import { PlayerForecastWidget } from "@/components/analytics/PlayerForecastWidget";
import { AccoladesTimeline } from "./AccoladesTimeline";
import { PlayerReadinessWidget } from "./PlayerReadinessWidget";
import { RewardsWalletCard } from "@/components/rewards/RewardsWalletCard";
import { RewardsLeaderboard } from "@/components/rewards/RewardsLeaderboard";
import { RewardsStore } from "@/components/rewards/RewardsStore";
import { RewardsWallet } from "@/types/rewards";
import { PlayerAttributeMatrix } from "./PlayerAttributeMatrix";
import { PlayerPassportView } from "./PlayerPassportView";
import { WagonWheelHeatmap } from "@/components/analytics/WagonWheelHeatmap";
import { PlayerComparisonTool } from "./PlayerComparisonTool";
import { SkillAssessment, ReadinessScore } from "@/types/schema_v4";

interface PlayerDetailClientProps {
  player: Person;
  rewardsWallet?: RewardsWallet;
  assessments?: SkillAssessment[];
  readiness?: ReadinessScore;
}

const tabs = [
  { id: "overview", label: "Overview", icon: BarChart2 },
  { id: "stats", label: "Stats", icon: Activity },
  { id: "performance", label: "Impact", icon: TrendingUp },
  { id: "passport", label: "Passport", icon: BookOpen },
  { id: "rewards", label: "Rewards", icon: Star },
  { id: "intelligence", label: "Intelligence", icon: Map },
];

function HeroStatPill({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300 min-w-[72px]">
      <span className={`text-xl font-black tracking-tighter leading-none ${accent ? "text-[#22c55e]" : "text-white"}`} style={{ fontFamily: D.head }}>
        {value}
      </span>
      <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30 mt-1 text-center leading-tight" style={{ fontFamily: D.mono }}>
        {label}
      </span>
    </div>
  );
}

function FormBar({ form = "WWLWW" }: { form?: string }) {
  const chars = form.split("");
  return (
    <div className="flex items-center gap-1.5">
      {chars.map((c, i) => (
        <div
          key={i}
          className={`h-5 w-5 rounded-md text-[8px] font-black flex items-center justify-center transition-all hover:scale-110 ${
            c === "W"
              ? "bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30"
              : c === "L"
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              : "bg-white/10 text-white/40 border border-white/10"
          }`}
        >
          {c}
        </div>
      ))}
    </div>
  );
}

export function PlayerDetailClient({ 
  player, 
  rewardsWallet, 
  assessments = [], 
  readiness 
}: PlayerDetailClientProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const tabsRef = useRef<HTMLDivElement>(null);
  const [stickyTabs, setStickyTabs] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setStickyTabs(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );
    if (tabsRef.current) observer.observe(tabsRef.current);
    return () => observer.disconnect();
  }, []);

  const avatarUrl = player.profileImageUrl ||
    `https://ui-avatars.com/api/?name=${player.firstName}+${player.lastName}&background=22c55e&color=fff&size=200`;

  const getDateFromTimestamp = (value: string | Date | any): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === "string") return new Date(value);
    if (value?.toDate && typeof value.toDate === "function") return value.toDate();
    return null;
  };

  const dateOfBirth = getDateFromTimestamp(player.dateOfBirth);
  const age = dateOfBirth
    ? Math.floor((new Date().getTime() - dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const stats = player.stats as any;

  return (
    <div className="pb-24 space-y-8">
      <GlobalStyles />

      {/* ─── Back + Edit Row ─── */}
      <div className="flex items-center justify-between">
        <Link
          href="/players"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-primary transition-all group"
          style={{ fontFamily: D.mono }}
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          Personnel Registry
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20">
            <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-[#22c55e]" style={{ fontFamily: D.mono }}>
              Live Profile
            </span>
          </div>
          <Link href={`/players/${player.id}/edit`}>
            <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-xl rounded-full px-5 text-[10px] font-black uppercase tracking-widest h-9 transition-all hover:border-primary/50 group">
              <Edit className="h-3 w-3 mr-1.5 text-primary" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── HERO IDENTITY CARD ─── */}
      <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-[#080808]">
        {/* Background FX */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.12)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.06)_0%,transparent_50%)]" />
        {/* Ambient grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "linear-gradient(to right,rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,0.3) 1px,transparent 1px)", backgroundSize: "48px 48px" }}
        />

        <div className="relative flex flex-col lg:flex-row min-h-[280px]">
          {/* ─ Left Identity Strip ─ */}
          <div className="relative flex flex-col items-center justify-center gap-6 p-10 lg:w-64 border-b lg:border-b-0 lg:border-r border-white/[0.07] bg-white/[0.015]">
            {/* Avatar */}
            <div className="relative">
              <div className="absolute -inset-5 rounded-full bg-gradient-to-br from-[#22c55e]/30 to-indigo-600/20 blur-2xl opacity-50 animate-pulse" />
              <div className="relative w-36 h-36 rounded-full overflow-hidden ring-4 ring-white/[0.06] shadow-2xl">
                <Image src={avatarUrl} alt={`${player.firstName} ${player.lastName}`} fill className="object-cover" />
              </div>
              <div className="absolute -bottom-2 -right-1 bg-[#22c55e] text-black text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg border-2 border-[#080808]">
                #{stats?.matchesPlayed || "04"}
              </div>
            </div>

            {/* Role Badge */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20">
                <Shield className="h-2.5 w-2.5 text-[#22c55e]" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#22c55e]" style={{ fontFamily: D.mono }}>
                  {player.role || "Specialist"}
                </span>
              </div>
              <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                {player.physicalAttributes?.battingHand || "RHB"} · {player.physicalAttributes?.bowlingStyle || "RF"}
              </div>
            </div>

            {/* School */}
            {player.assignedSchools?.[0] && (
              <div className="text-center">
                <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-0.5" style={{ fontFamily: D.mono }}>Institution</div>
                <div className="text-xs font-bold text-white/60">{player.assignedSchools[0]}</div>
              </div>
            )}
          </div>

          {/* ─ Right Scorecard Panel ─ */}
          <div className="flex-1 flex flex-col p-8 lg:p-10 gap-8 justify-between">
            {/* Name + archetype */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-2" style={{ fontFamily: D.mono }}>
                  Top-order Anchor · 1st XI
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none" style={{ fontFamily: D.head }}>
                  {player.firstName}{" "}
                  <span className="text-[#22c55e]">{player.lastName}</span>
                </h1>
                {age && (
                  <div className="flex items-center gap-2 mt-3">
                    <Calendar className="h-3.5 w-3.5 text-white/20" />
                    <span className="text-xs text-white/40 font-medium">
                      {age} yrs
                      {dateOfBirth && ` · Born ${dateOfBirth.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Form Strip */}
              <div className="flex flex-col items-start md:items-end gap-2">
                <div className="text-[9px] font-black uppercase tracking-widest text-white/30" style={{ fontFamily: D.mono }}>
                  Recent Form
                </div>
                <FormBar form="WWLWW" />
                <div className="text-[10px] font-bold text-[#22c55e]">↑ Rising · 92%</div>
              </div>
            </div>

            {/* ─ Core Stat Pills ─ */}
            <div className="space-y-3">
              <div className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20" style={{ fontFamily: D.mono }}>
                Career Metrics
              </div>
              <div className="flex flex-wrap gap-2">
                <HeroStatPill label="Matches" value={stats?.matchesPlayed || 42} />
                <HeroStatPill label="Runs" value={stats?.totalRuns || 1248} accent />
                <HeroStatPill label="Avg" value={(stats?.battingAverage || 34.5).toFixed(1)} accent />
                <HeroStatPill label="S/R" value={(stats?.strikeRate || 136.5).toFixed(0)} />
                <HeroStatPill label="Wkts" value={stats?.wicketsTaken || 12} />
                <HeroStatPill label="Econ" value={(stats?.economyRate || 6.2).toFixed(1)} />
                <HeroStatPill label="Ctchs" value={stats?.catchesTaken || 8} />
              </div>
            </div>

            {/* Bottom status bar */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/[0.05]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[#22c55e]" style={{ fontFamily: D.mono }}>
                  Match Ready
                </span>
              </div>
              <div className="h-3 w-[1px] bg-white/10" />
              <div className="flex items-center gap-1.5 text-white/30">
                <Clock className="h-3 w-3" />
                <span className="text-[9px] font-medium">Updated today</span>
              </div>
              <div className="h-3 w-[1px] bg-white/10" />
              <div className="flex items-center gap-1.5 text-white/30">
                <Zap className="h-3 w-3 text-amber-400" />
                <span className="text-[9px] font-medium text-amber-400/80">Rank #04 · School</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── STICKY TAB BAR ─── */}
      <div ref={tabsRef}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div
            className={`transition-all duration-300 ${stickyTabs ? "sticky top-0 z-40 pt-3 pb-2 -mx-6 px-6 bg-[#060606]/90 backdrop-blur-2xl border-b border-white/[0.06]" : ""}`}
          >
            <TabsList className="bg-white/[0.04] border border-white/[0.08] p-1 rounded-2xl h-auto inline-flex gap-0.5 w-full lg:w-auto">
              {tabs.map(({ id, label, icon: Icon }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-[#22c55e] data-[state=active]:text-black data-[state=active]:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all flex items-center gap-1.5 text-white/50 hover:text-white"
                  style={{ fontFamily: D.mono }}
                >
                  <Icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ═══════════════════════════════════════════════
              TAB: OVERVIEW
          ══════════════════════════════════════════════════ */}
          <TabsContent value="overview" className="space-y-6">
            {/* Row 1: 3-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left col: Readiness + Personnel */}
              <div className="space-y-6">
                <PlayerReadinessWidget
                  playerId={player.id}
                  readinessScore={readiness?.score}
                  status={readiness?.status}
                />

                {/* Personnel Data Card */}
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#22c55e]" style={{ fontFamily: D.mono }}>
                      Personnel Data
                    </span>
                    <User className="h-3.5 w-3.5 text-white/20" />
                  </div>
                  <div className="p-6 space-y-4">
                    {[
                      dateOfBirth && {
                        icon: Calendar,
                        label: "Date of Birth",
                        value: `${dateOfBirth.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}${age ? ` (${age} yrs)` : ""}`,
                        accent: false,
                      },
                      player.email && { icon: Mail, label: "Email", value: player.email, accent: false },
                      player.phone && { icon: Phone, label: "Phone", value: player.phone, accent: false },
                      player.physicalAttributes?.height && {
                        icon: Activity,
                        label: "Height / Weight",
                        value: `${player.physicalAttributes.height}cm · ${player.physicalAttributes.weight || "—"}kg`,
                        accent: false,
                      },
                      player.physicalAttributes?.battingHand && {
                        icon: Target,
                        label: "Batting · Bowling",
                        value: `${player.physicalAttributes.battingHand} · ${player.physicalAttributes.bowlingStyle || "—"}`,
                        accent: true,
                      },
                    ]
                      .filter(Boolean)
                      .map((item: any, i) => (
                        <div key={i} className="flex items-start gap-3 group">
                          <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-[#22c55e]/20 transition-colors">
                            <item.icon className="h-3.5 w-3.5 text-white/30 group-hover:text-[#22c55e]/60 transition-colors" />
                          </div>
                          <div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-white/25" style={{ fontFamily: D.mono }}>
                              {item.label}
                            </div>
                            <div className={`text-xs font-bold mt-0.5 ${item.accent ? "text-[#22c55e]" : "text-white/70"}`}>
                              {item.value}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Center + Right: Impact Radar full */}
              <div className="lg:col-span-2">
                <PlayerImpactCard playerId={player.id} />
              </div>
            </div>

            {/* Row 2: Attribute Matrix */}
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
              <div className="px-8 py-5 border-b border-white/[0.07] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#22c55e]" style={{ fontFamily: D.mono }}>
                    Full Skill Attribute Matrix
                  </h3>
                  <p className="text-[10px] text-white/30 font-medium mt-0.5">Detailed 1–9 analytical ratings across all performance domains</p>
                </div>
                <div className="flex gap-4">
                  {[
                    { color: "bg-[#22c55e]", label: "Elite (8–9)" },
                    { color: "bg-blue-400", label: "Strong (6–7)" },
                    { color: "bg-amber-400", label: "Average (4–5)" },
                    { color: "bg-white/20", label: "Developing (<4)" },
                  ].map((l, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${l.color}`} />
                      <span className="text-[9px] font-bold text-white/30 hidden md:block">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-8">
                <PlayerAttributeMatrix assessments={assessments} playingRole={player.role || player.playingRole} />
              </div>
            </div>

            {/* Row 3: AI Forecast + Recent Matches */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PlayerForecastWidget playerId={player.id} />
              <RecentMatches playerId={player.id} />
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════
              TAB: STATS
          ══════════════════════════════════════════════════ */}
          <TabsContent value="stats" className="space-y-6">
            {/* Summary band */}
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40" style={{ fontFamily: D.mono }}>
                  Career Statistics Summary
                </h2>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40" style={{ fontFamily: D.mono }}>
                    All-time
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {[
                  { label: "Matches", value: stats?.matchesPlayed || 42, color: "text-white" },
                  { label: "Total Runs", value: stats?.totalRuns || 1248, color: "text-[#22c55e]" },
                  { label: "Batting Avg", value: (stats?.battingAverage || 34.5).toFixed(2), color: "text-[#22c55e]" },
                  { label: "Strike Rate", value: (stats?.strikeRate || 136.5).toFixed(1), color: "text-blue-400" },
                  { label: "Wickets", value: stats?.wicketsTaken || 41, color: "text-amber-400" },
                  { label: "Economy", value: (stats?.economyRate || 6.2).toFixed(2), color: "text-amber-400" },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className={`text-2xl font-black tracking-tighter ${s.color}`} style={{ fontFamily: D.head }}>{s.value}</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-1" style={{ fontFamily: D.mono }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discipline-specific cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <BattingStatsCard player={player} />
              <BowlingStatsCard player={player} index={1} />
              <FieldingStatsCard player={player} index={2} />
            </div>

            {/* Season breakdown placeholder */}
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.015] p-10 text-center">
              <BarChart2 className="h-8 w-8 text-white/10 mx-auto mb-3" />
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Season-by-season breakdown</p>
              <p className="text-[10px] text-white/20 mt-1">Links to longitudinal match data once match engine is active</p>
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════
              TAB: IMPACT ANALYSIS
          ══════════════════════════════════════════════════ */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PlayerPerformanceCharts player={player} />
              </div>
              <div className="space-y-6">
                <FormAnalysisCard
                  playerName={`${player.firstName} ${player.lastName}`}
                  role={player.playingRole?.toLowerCase() as "batsman" | "bowler" | "allrounder" || "batsman"}
                  recentMatches={[
                    { matchId: "1", opponent: "Team A", date: "2024-11-30", runs: 45, wickets: 1, result: "win" },
                    { matchId: "2", opponent: "Team B", date: "2024-11-23", runs: 12, wickets: 2, result: "loss" },
                    { matchId: "3", opponent: "Team C", date: "2024-11-16", runs: 78, wickets: 0, result: "win" },
                    { matchId: "4", opponent: "Team D", date: "2024-11-09", runs: 23, wickets: 1, result: "draw" },
                    { matchId: "5", opponent: "Team E", date: "2024-11-02", runs: 56, wickets: 3, result: "win" },
                  ]}
                />
                <PerformanceInsightsCard
                  playerName={`${player.firstName} ${player.lastName}`}
                  role={player.playingRole?.toLowerCase() as "batsman" | "bowler" | "allrounder" | "wicketkeeper" || "batsman"}
                  stats={{
                    battingAverage: stats?.battingAverage,
                    strikeRate: stats?.strikeRate,
                    bowlingAverage: stats?.bowlingAverage,
                    matchesPlayed: stats?.matchesPlayed || 0,
                    runsScored: stats?.totalRuns,
                    wicketsTaken: stats?.wicketsTaken,
                  }}
                />
              </div>
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════
              TAB: PASSPORT
          ══════════════════════════════════════════════════ */}
          <TabsContent value="passport" className="space-y-6">
            <PlayerPassportView player={player} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AccoladesTimeline playerId={player.id} />
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 flex flex-col items-center justify-center text-center gap-5">
                <Award className="h-10 w-10 text-white/10" />
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1" style={{ fontFamily: D.mono }}>
                    Institutional Records
                  </h3>
                  <p className="text-lg font-black text-white/70" style={{ fontFamily: D.head }}>
                    Certifications & Commendations
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Captained U15 A", "Regional Pathway"].map((tag, i) => (
                    <span
                      key={i}
                      className="text-[9px] uppercase font-black tracking-widest text-[#22c55e] bg-[#22c55e]/10 px-3 py-1 rounded-full border border-[#22c55e]/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════
              TAB: REWARDS
          ══════════════════════════════════════════════════ */}
          <TabsContent value="rewards" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <RewardsWalletCard
                wallet={
                  rewardsWallet || {
                    id: "demo",
                    playerId: player.id,
                    totalPointsBalance: 1250,
                    lifetimePointsEarned: 2450,
                    currentTier: "Silver",
                    tierScore: 1250,
                    nextTierThreshold: 5000,
                    lastUpdated: new Date().toISOString(),
                  }
                }
              />
              <div className="lg:col-span-2 space-y-6">
                <RewardsStore
                  items={[
                    { id: "1", name: "Elite Performance Socks", description: "Moisture-wicking professional grade", cost: 500, category: "Commercial" },
                    { id: "2", name: "Masterclass with Pro", description: "1-on-1 session with a provincial coach", cost: 5000, category: "Development", requiredTier: "Gold" },
                    { id: "3", name: "Legacy Badge", description: "Exclusive profile flair", cost: 1000, category: "Prestige" },
                  ]}
                  userBalance={rewardsWallet?.totalPointsBalance || 1250}
                  userTier={rewardsWallet?.currentTier || "Silver"}
                />
                <RewardsLeaderboard
                  entries={[
                    { playerId: player.id, name: `${player.firstName} ${player.lastName}`, points: 1250, rank: 4, previousRank: 5, tier: "Silver" },
                    { playerId: "2", name: "David Miller", points: 3400, rank: 1, previousRank: 1, tier: "Gold" },
                    { playerId: "3", name: "Quinton de Kock", points: 2800, rank: 2, previousRank: 3, tier: "Gold" },
                    { playerId: "4", name: "Kagiso Rabada", points: 2100, rank: 3, previousRank: 2, tier: "Silver" },
                  ]}
                  currentUserId={player.id}
                />
              </div>
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════
              TAB: INTELLIGENCE
          ══════════════════════════════════════════════════ */}
          <TabsContent value="intelligence" className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-1">
                <WagonWheelHeatmap />
              </div>
              <div className="lg:col-span-2">
                <PlayerComparisonTool />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
