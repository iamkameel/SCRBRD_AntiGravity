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
  Clock
} from "lucide-react";
import { BattingStatsCard, BowlingStatsCard, FieldingStatsCard } from "./PlayerStatsCards";
import { PlayerPerformanceCharts, PlayerImpactCard, PlayerPassportView } from "@/components/charts/lazy";
import { D } from '@/lib/design-system';
import { RecentMatches } from "./RecentMatches";
import { FormAnalysisCard } from "@/components/profiles/FormAnalysisCard";
import { PerformanceInsightsCard } from "@/components/profiles/PerformanceInsightsCard";
import { PlayerForecastWidget } from "@/components/analytics/PlayerForecastWidget";
import { AccoladesTimeline } from "./AccoladesTimeline";
import { PlayerReadinessWidget } from "./PlayerReadinessWidget";
import { PlayerAttributeMatrix } from "./PlayerAttributeMatrix";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Milestone } from '@/types/schema_v4';
import { PlayerHonoursCabinet } from "@/components/player/PlayerHonoursCabinet";
import { WagonWheelHeatmap } from "@/components/analytics/WagonWheelHeatmap";
import { PlayerComparisonTool } from "./PlayerComparisonTool";
import { PlayerCareerHistoryTab } from "@/components/charts/lazy";
import { SkillAssessment, ReadinessScore } from "@/types/schema_v4";
import { PlayerContextFilterBar, PlayerContextFilterState } from "./PlayerContextFilterBar";
import { InspectorDrawer, InspectorData } from "./InspectorDrawer";

interface PlayerDetailClientProps {
  player: Person;
  rewardsWallet?: any;
  assessments?: SkillAssessment[];
  readiness?: ReadinessScore;
}

const tabs = [
  { id: "overview", label: "Overview", icon: BarChart2 },
  { id: "performance", label: "Performance & Stats", icon: Activity },
  { id: "development", label: "Development & History", icon: Clock },
  { id: "intelligence", label: "Intelligence & Heatmaps", icon: Map },
  { id: "passport", label: "Passport & Honours", icon: BookOpen },
];

function HeroStatPill({ label, value, accent = false, onClick }: { label: string; value: string | number; accent?: boolean; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] hover:bg-zinc-200 dark:hover:bg-white/[0.08] hover:border-emerald-500/30 transition-all duration-300 min-w-[68px] ${onClick ? 'cursor-pointer' : ''}`}
    >
      <span className={`text-lg font-black tracking-tighter leading-none ${accent ? "text-emerald-600 dark:text-[#22c55e]" : "text-zinc-900 dark:text-white"}`} style={{ fontFamily: D.head }}>
        {value}
      </span>
      <span className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400 dark:text-white/30 mt-1 text-center leading-tight" style={{ fontFamily: D.mono }}>
        {label}
      </span>
    </div>
  );
}

function FormBar({ form = "WWLWW" }: { form?: string }) {
  const chars = form.split("");
  return (
    <div className="flex items-center gap-1">
      {chars.map((c, i) => (
        <div
          key={i}
          className={`h-4.5 w-4.5 rounded-md text-[8px] font-black flex items-center justify-center transition-all hover:scale-110 ${
            c === "W"
              ? "bg-emerald-500/20 text-emerald-600 dark:text-[#22c55e] border border-emerald-500/30"
              : c === "L"
              ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
              : "bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-white/40 border border-zinc-300 dark:border-white/10"
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
  assessments = [], 
  readiness 
}: PlayerDetailClientProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const tabsRef = useRef<HTMLDivElement>(null);
  const [stickyTabs, setStickyTabs] = useState(false);
  const [firestoreMilestones, setFirestoreMilestones] = useState<Milestone[]>([]);

  // Global Context Filter State
  const [filters, setFilters] = useState<PlayerContextFilterState>({
    season: '2026',
    team: '1stXI',
    format: 'all',
    competition: 'all'
  });

  // Inspector Drawer State
  const [inspectorData, setInspectorData] = useState<InspectorData | null>(null);

  const openInspector = (data: InspectorData) => {
    setInspectorData(data);
  };

  const closeInspector = () => {
    setInspectorData(null);
  };

  useEffect(() => {
    async function loadMilestones() {
      if (!player?.id) return;
      try {
        const q = query(collection(db, 'milestones'), where('personId', '==', player.id));
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => doc.data() as Milestone);
        setFirestoreMilestones(fetched);
      } catch (e) {
        console.error('Error fetching milestones from Firestore:', e);
      }
    }
    loadMilestones();
  }, [player?.id]);

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
    <div className="pb-24 space-y-6">
      {/* ─── Back + Edit Row ─── */}
      <div className="flex items-center justify-between">
        <Link
          href="/players"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-white/30 hover:text-emerald-600 dark:hover:text-[#22c55e] transition-all group"
          style={{ fontFamily: D.mono }}
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          Personnel Registry
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#22c55e] animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-[#22c55e]" style={{ fontFamily: D.mono }}>
              Live Passport
            </span>
          </div>
          <Link href={`/players/${player.id}/edit`}>
            <Button className="bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-900 dark:text-white border border-zinc-300 dark:border-white/10 backdrop-blur-xl rounded-full px-4 text-[10px] font-black uppercase tracking-widest h-8 transition-all hover:border-emerald-500/50 group">
              <Edit className="h-3 w-3 mr-1.5 text-emerald-600 dark:text-[#22c55e]" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── HERO IDENTITY CARD (COMPACT & STICKY OPTIMIZED) ─── */}
      <div className="relative rounded-3xl overflow-hidden border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-[#080808]/90 shadow-sm backdrop-blur-xl">
        {/* Background FX */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.04)_0%,transparent_50%)]" />

        <div className="relative flex flex-col md:flex-row items-stretch min-h-[180px]">
          {/* Left Identity Avatar & Quick Tag */}
          <div className="flex items-center gap-4 p-6 md:w-80 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-white/[0.07] bg-zinc-50/50 dark:bg-white/[0.015]">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-zinc-300 dark:ring-white/10 shadow-lg relative">
                <Image src={avatarUrl} alt={`${player.firstName} ${player.lastName}`} fill className="object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white dark:bg-[#22c55e] dark:text-black text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-md">
                #{stats?.matchesPlayed || "04"}
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: D.head }}>
                {player.firstName} <span className="text-emerald-600 dark:text-[#22c55e]">{player.lastName}</span>
              </h1>
              <div className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-[#22c55e]" style={{ fontFamily: D.mono }}>
                <Shield className="h-2.5 w-2.5" />
                {player.role || "Specialist"}
              </div>
              <div className="text-[10px] font-medium text-zinc-500 dark:text-white/40">
                {player.physicalAttributes?.battingHand || "RHB"} • {player.physicalAttributes?.bowlingStyle || "RF"}
              </div>
              {player.assignedSchools?.[0] && (
                <div className="text-[10px] font-bold text-zinc-700 dark:text-white/60">
                  {player.assignedSchools[0]}
                </div>
              )}
            </div>
          </div>

          {/* Right Metrics Runway */}
          <div className="flex-1 flex flex-col justify-between p-6 gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 text-[9px] font-mono font-bold">
                  Top-order Anchor • 1st XI
                </Badge>
                {age && (
                  <span className="text-xs text-zinc-500 dark:text-white/40 font-medium">
                    {age} yrs {dateOfBirth && `(${dateOfBirth.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })})`}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-white/30" style={{ fontFamily: D.mono }}>Recent Form</span>
                <FormBar form="WWLWW" />
              </div>
            </div>

            {/* Core Stat Pills */}
            <div className="flex flex-wrap gap-2">
              <HeroStatPill 
                label="Matches" 
                value={stats?.matchesPlayed || 42} 
                onClick={() => openInspector({
                  title: 'Match Workload',
                  category: 'Performance',
                  metrics: [
                    { label: 'Total Matches', value: stats?.matchesPlayed || 42 },
                    { label: '1st XI Starts', value: 38 },
                    { label: 'Substitutions', value: 4 }
                  ],
                  coachNotes: 'Sustained 1st XI inclusion across multiple seasons.'
                })}
              />
              <HeroStatPill 
                label="Runs" 
                value={stats?.totalRuns || 1248} 
                accent 
                onClick={() => openInspector({
                  title: 'Career Runs',
                  category: 'Batting',
                  metrics: [
                    { label: 'Total Runs', value: stats?.totalRuns || 1248, accent: true },
                    { label: 'Highest Score', value: '112*' },
                    { label: '50s / 100s', value: '8 / 2' }
                  ],
                  coachNotes: 'Consistently converts starts into substantial scores in middle overs.'
                })}
              />
              <HeroStatPill 
                label="Avg" 
                value={(stats?.battingAverage || 34.5).toFixed(1)} 
                accent 
                onClick={() => openInspector({
                  title: 'Batting Average',
                  category: 'Batting',
                  metrics: [
                    { label: 'Overall Average', value: (stats?.battingAverage || 34.5).toFixed(1), accent: true },
                    { label: '1st Innings Avg', value: '38.2' },
                    { label: 'Chasing Avg', value: '31.8' }
                  ],
                  coachNotes: 'High resilience under pressure when setting a target.'
                })}
              />
              <HeroStatPill 
                label="S/R" 
                value={(stats?.strikeRate || 136.5).toFixed(0)} 
                onClick={() => openInspector({
                  title: 'Strike Rate',
                  category: 'Tempo Control',
                  metrics: [
                    { label: 'Overall S/R', value: (stats?.strikeRate || 136.5).toFixed(0) },
                    { label: 'Powerplay S/R', value: '142.0' },
                    { label: 'Death Overs S/R', value: '165.5' }
                  ],
                  coachNotes: 'Accelerates effectively in overs 15-20.'
                })}
              />
              <HeroStatPill 
                label="Wkts" 
                value={stats?.wicketsTaken || 12} 
                onClick={() => openInspector({
                  title: 'Wickets Taken',
                  category: 'Bowling',
                  metrics: [
                    { label: 'Total Wickets', value: stats?.wicketsTaken || 12 },
                    { label: 'Best Bowling', value: '3/18' },
                    { label: 'Economy Rate', value: (stats?.economyRate || 6.2).toFixed(1) }
                  ],
                  coachNotes: 'Valuable middle-over partnership breaker.'
                })}
              />
              <HeroStatPill 
                label="Econ" 
                value={(stats?.economyRate || 6.2).toFixed(1)} 
              />
              <HeroStatPill 
                label="Ctchs" 
                value={stats?.catchesTaken || 8} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── GLOBAL CONTEXT FILTER BAR ─── */}
      <PlayerContextFilterBar 
        filters={filters} 
        onFilterChange={setFilters} 
      />

      {/* ─── STICKY STREAMLINED TAB BAR ─── */}
      <div ref={tabsRef}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div
            className={`transition-all duration-300 ${stickyTabs ? "sticky top-0 z-40 pt-3 pb-2 -mx-6 px-6 bg-white/90 dark:bg-[#060606]/90 backdrop-blur-2xl border-b border-zinc-200 dark:border-white/[0.06]" : ""}`}
          >
            <TabsList className="bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] p-1 rounded-2xl h-auto inline-flex gap-1 w-full lg:w-auto">
              {tabs.map(({ id, label, icon: Icon }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white dark:data-[state=active]:bg-[#22c55e] dark:data-[state=active]:text-black data-[state=active]:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all flex items-center gap-1.5 text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white"
                  style={{ fontFamily: D.mono }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ═══════════════════════════════════════════════
              TAB 1: OVERVIEW
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
                <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-zinc-200 dark:border-white/[0.07] flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-[#22c55e]" style={{ fontFamily: D.mono }}>
                      Personnel Data
                    </span>
                    <User className="h-3.5 w-3.5 text-zinc-400 dark:text-white/20" />
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
                          <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-emerald-500/30 transition-colors">
                            <item.icon className="h-3.5 w-3.5 text-zinc-400 dark:text-white/30 group-hover:text-emerald-600 dark:group-hover:text-[#22c55e] transition-colors" />
                          </div>
                          <div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-white/25" style={{ fontFamily: D.mono }}>
                              {item.label}
                            </div>
                            <div className={`text-xs font-bold mt-0.5 ${item.accent ? "text-emerald-600 dark:text-[#22c55e]" : "text-zinc-800 dark:text-white/70"}`}>
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
            <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-sm">
              <div className="px-8 py-5 border-b border-zinc-200 dark:border-white/[0.07] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-[#22c55e]" style={{ fontFamily: D.mono }}>
                    Full Skill Attribute Matrix
                  </h3>
                  <p className="text-[10px] text-zinc-500 dark:text-white/30 font-medium mt-0.5">Detailed 1–9 analytical ratings across all performance domains</p>
                </div>
                <div className="flex gap-4">
                  {[
                    { color: "bg-emerald-500", label: "Elite (8–9)" },
                    { color: "bg-blue-400", label: "Strong (6–7)" },
                    { color: "bg-amber-400", label: "Average (4–5)" },
                    { color: "bg-zinc-300 dark:bg-white/20", label: "Developing (<4)" },
                  ].map((l, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${l.color}`} />
                      <span className="text-[9px] font-bold text-zinc-500 dark:text-white/30 hidden md:block">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-8">
                <PlayerAttributeMatrix 
                  assessments={assessments} 
                  playingRole={player.role || player.playingRole} 
                  onInspectAttribute={(domain, attrName, rating) => {
                    openInspector({
                      title: attrName,
                      subtitle: `${domain} domain`,
                      category: 'Skill Assessment',
                      metrics: [
                        { label: 'Coach Rating', value: `${rating} / 9`, accent: true },
                        { label: 'Normalised Index', value: `${Math.round(((rating - 1) / 8) * 100)}%` },
                      ],
                    });
                  }}
                />
              </div>
            </div>

            {/* Row 3: AI Forecast + Recent Matches */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PlayerForecastWidget playerId={player.id} />
              <RecentMatches playerId={player.id} />
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════
              TAB 2: PERFORMANCE & STATS
          ══════════════════════════════════════════════════ */}
          <TabsContent value="performance" className="space-y-6">
            {/* Summary band */}
            <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] p-6 backdrop-blur-xl shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 dark:text-white/40" style={{ fontFamily: D.mono }}>
                  Filter Scoped Performance Summary
                </h2>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#22c55e]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-white/40" style={{ fontFamily: D.mono }}>
                    {filters.season} Season • {filters.team}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {[
                  { label: "Matches", value: stats?.matchesPlayed || 42, color: "text-zinc-900 dark:text-white" },
                  { label: "Total Runs", value: stats?.totalRuns || 1248, color: "text-emerald-600 dark:text-[#22c55e]" },
                  { label: "Batting Avg", value: (stats?.battingAverage || 34.5).toFixed(2), color: "text-emerald-600 dark:text-[#22c55e]" },
                  { label: "Strike Rate", value: (stats?.strikeRate || 136.5).toFixed(1), color: "text-blue-500 dark:text-blue-400" },
                  { label: "Wickets", value: stats?.wicketsTaken || 41, color: "text-amber-500 dark:text-amber-400" },
                  { label: "Economy", value: (stats?.economyRate || 6.2).toFixed(2), color: "text-amber-500 dark:text-amber-400" },
                ].map((s, i) => (
                  <div key={i} className="text-center p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5">
                    <div className={`text-2xl font-black tracking-tighter ${s.color}`} style={{ fontFamily: D.head }}>{s.value}</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-white/30 mt-1" style={{ fontFamily: D.mono }}>{s.label}</div>
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

            {/* Form Insights & Impact Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PlayerPerformanceCharts player={player} />
              </div>
              <div className="space-y-6">
                <FormAnalysisCard
                  playerName={`${player.firstName} ${player.lastName}`}
                  role={player.playingRole?.toLowerCase() as "batsman" | "bowler" | "allrounder" || "batsman"}
                  recentMatches={[
                    { matchId: "1", opponent: "Wynberg Boys", date: "2026-02-14", runs: 84, wickets: 1, result: "win" },
                    { matchId: "2", opponent: "Bishops", date: "2026-02-07", runs: 42, wickets: 2, result: "win" },
                    { matchId: "3", opponent: "SACS", date: "2026-01-31", runs: 12, wickets: 0, result: "loss" },
                    { matchId: "4", opponent: "Rondebosch", date: "2026-01-24", runs: 96, wickets: 1, result: "win" },
                    { matchId: "5", opponent: "Paul Roos", date: "2026-01-17", runs: 58, wickets: 3, result: "win" },
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
              TAB 3: DEVELOPMENT & HISTORY
          ══════════════════════════════════════════════════ */}
          <TabsContent value="development" className="space-y-6">
            <PlayerCareerHistoryTab playerId={player.id} />
          </TabsContent>

          {/* ═══════════════════════════════════════════════
              TAB 4: INTELLIGENCE & HEATMAPS
          ══════════════════════════════════════════════════ */}
          <TabsContent value="intelligence" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <WagonWheelHeatmap />
              </div>
              <div className="lg:col-span-2">
                <PlayerComparisonTool />
              </div>
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════
              TAB 5: PASSPORT & HONOURS
          ══════════════════════════════════════════════════ */}
          <TabsContent value="passport" className="space-y-6">
            <PlayerPassportView player={player} />
            <PlayerHonoursCabinet
              honours={[
                {
                  id: "h1",
                  personId: player.id,
                  seasonId: "s2026",
                  honourLevel: "School XI",
                  teamName: "1st XI Cap #142",
                  conferredOn: "2025-01-15",
                  notes: "Awarded 1st XI Cap following 5 consecutive match-winning performances.",
                  createdAt: "2025-01-15T00:00:00Z"
                },
                {
                  id: "h2",
                  personId: player.id,
                  seasonId: "s2025",
                  honourLevel: "Provincial",
                  teamName: "Western Province U19 A",
                  conferredOn: "2025-11-20",
                  notes: "Selected for SA Schools Tournament.",
                  createdAt: "2025-11-20T00:00:00Z"
                }
              ]}
              awards={[
                {
                  id: "a1",
                  personId: player.id,
                  title: "Player of the Match vs Wynberg",
                  category: "Performance",
                  awardedBy: "Western Province Cricket Association",
                  awardedOn: "2026-02-10",
                  description: "Scored 84 (52) and took 3/18 in a 12-run victory.",
                  createdAt: "2026-02-10T00:00:00Z"
                }
              ]}
              milestones={[
                ...firestoreMilestones,
                {
                  id: "m1",
                  personId: player.id,
                  title: "1,000 Career Runs",
                  milestoneType: "Runs",
                  value: 1000,
                  achievedOn: "2026-01-28",
                  description: "Reached 1,000 career runs across school first-team fixtures.",
                  createdAt: "2026-01-28T00:00:00Z"
                },
                {
                  id: "m2",
                  personId: player.id,
                  title: "50 Wickets",
                  milestoneType: "Wickets",
                  value: 50,
                  achievedOn: "2025-10-12",
                  description: "50 1st XI wickets.",
                  createdAt: "2025-10-12T00:00:00Z"
                }
              ]}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AccoladesTimeline playerId={player.id} />
              </div>
              <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] p-8 flex flex-col items-center justify-center text-center gap-5 shadow-sm">
                <Award className="h-10 w-10 text-zinc-300 dark:text-white/10" />
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-white/30 mb-1" style={{ fontFamily: D.mono }}>
                    Institutional Records
                  </h3>
                  <p className="text-lg font-black text-zinc-800 dark:text-white/70" style={{ fontFamily: D.head }}>
                    Certifications & Commendations
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Captained U15 A", "Regional Pathway"].map((tag, i) => (
                    <span
                      key={i}
                      className="text-[9px] uppercase font-black tracking-widest text-emerald-600 dark:text-[#22c55e] bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ─── CONTEXTUAL INSPECTOR DRAWER ─── */}
      <InspectorDrawer 
        isOpen={!!inspectorData}
        onClose={closeInspector}
        data={inspectorData}
      />
    </div>
  );
}
