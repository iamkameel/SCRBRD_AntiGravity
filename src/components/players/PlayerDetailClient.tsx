"use client";

import { useState } from "react";
import { Player as Person } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  User,
  TrendingUp,
  Activity,
  Award,
  Calendar,
  Mail,
  Phone,
  School,
  Target,
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

export function PlayerDetailClient({ 
  player, 
  rewardsWallet, 
  assessments = [], 
  readiness 
}: PlayerDetailClientProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  const avatarUrl = player.profileImageUrl || 
    `https://ui-avatars.com/api/?name=${player.firstName}+${player.lastName}&background=22c55e&color=fff&size=200`;

  // Safely convert dateOfBirth to Date
  const getDateFromTimestamp = (value: string | Date | any): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'string') return new Date(value);
    if (value?.toDate && typeof value.toDate === 'function') return value.toDate(); // Firestore Timestamp
    return null;
  };

  // Calculate age if DOB is available
  const dateOfBirth = getDateFromTimestamp(player.dateOfBirth);
  const age = dateOfBirth
    ? Math.floor((new Date().getTime() - dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="pb-20 space-y-10">
      <GlobalStyles />
      
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Link 
          href="/players"
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/40 hover:text-primary transition-all group"
          style={{ fontFamily: D.mono }}
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Personnel Registry
        </Link>
        <Link href={`/players/${player.id}/edit`}>
          <Button 
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-xl rounded-full px-6 text-xs font-bold uppercase tracking-widest h-10 transition-all hover:border-primary/50 group"
          >
            <Edit className="h-3.5 w-3.5 mr-2 text-primary" />
            Modify Intel
          </Button>
        </Link>
      </div>

      {/* Hero Section - Career Identity Card */}
      <div className="relative rounded-[2rem] border border-white/10 bg-[#0A0A0A] overflow-hidden sh-fade-in group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-emerald-500/10 opacity-50 transition-opacity group-hover:opacity-75" />
        <div className="absolute top-0 right-0 p-8">
          <div className="text-[120px] font-black text-white/[0.03] leading-none select-none" style={{ fontFamily: D.head }}>
            {player.stats?.matchesPlayed?.toString().padStart(2, '0') || '00'}
          </div>
          <div className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-white/20 -mt-4 mr-2" style={{ fontFamily: D.mono }}>
            Career Caps
          </div>
        </div>

        <div className="relative p-10 flex flex-col md:flex-row gap-10 items-start md:items-center">
          {/* Profile Image with Dynamic Aura */}
          <div className="relative group/avatar">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-primary to-emerald-600 opacity-20 blur-2xl transition-all group-hover/avatar:opacity-40 animate-pulse" />
            <div className="relative w-44 h-44 rounded-full overflow-hidden border-8 border-white/5 shadow-2xl transition-transform group-hover/avatar:scale-105 duration-500">
              <Image
                src={avatarUrl}
                alt={`${player.firstName} ${player.lastName}`}
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
              Rank #04
            </div>
          </div>

          {/* Player Identity */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 items-center mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                {player.role || 'Specialist'}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                Tier 1 Elite
              </span>
            </div>
            
            <h1 className="text-6xl font-black text-white mb-6 tracking-tighter" style={{ fontFamily: D.head }}>
              {player.firstName} <span className="text-primary">{player.lastName}</span>
            </h1>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30" style={{ fontFamily: D.mono }}>Primary Archetype</div>
                <div className="text-lg font-bold text-white/90">Top-order Anchor</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30" style={{ fontFamily: D.mono }}>Batting Average</div>
                <div className="text-lg font-bold text-white/90">{player.stats?.battingAverage?.toFixed(2) || '34.5'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30" style={{ fontFamily: D.mono }}>Wickets</div>
                <div className="text-lg font-bold text-white/90">{player.stats?.wicketsTaken || 12}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30" style={{ fontFamily: D.mono }}>Form Index</div>
                <div className="text-lg font-bold text-emerald-400">Rising (92%)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Intelligence Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl backdrop-blur-xl h-auto flex flex-wrap lg:inline-flex mb-4">
          <TabsTrigger 
            value="overview" 
            className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all"
            style={{ fontFamily: D.mono }}
          >
            Tactical Overview
          </TabsTrigger>
          <TabsTrigger 
            value="stats" 
            className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all"
            style={{ fontFamily: D.mono }}
          >
            Statistical Core
          </TabsTrigger>
          <TabsTrigger 
            value="performance" 
            className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all"
            style={{ fontFamily: D.mono }}
          >
            Impact Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="passport" 
            className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all"
            style={{ fontFamily: D.mono }}
          >
            Personnel Passport
          </TabsTrigger>
          <TabsTrigger 
            value="rewards" 
            className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all"
            style={{ fontFamily: D.mono }}
          >
            Rewards & Assets
          </TabsTrigger>
          <TabsTrigger 
            value="intelligence" 
            className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all"
            style={{ fontFamily: D.mono }}
          >
            Match Intelligence
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Impact Radar (Premium Intelligence) */}
            <div className="lg:col-span-2">
              <PlayerImpactCard playerId={player.id} />
            </div>

            {/* Readiness Intel (New Phase 5 Component) */}
            <div className="lg:col-span-2">
              <PlayerReadinessWidget 
                playerId={player.id} 
                readinessScore={readiness?.score}
                status={readiness?.status}
              />
            </div>

            {/* FM-Style Attribute Matrix - New Premium Core */}
            <div className="lg:col-span-2">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden p-8 space-y-8 sh-fade-in">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary" style={{ fontFamily: D.mono }}>
                      Full Skill Attribute Matrix
                    </h3>
                    <p className="text-xs text-white/40 font-medium">Detailed 1-9 analytical ratings across all performance domains.</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Elite</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Strong</span>
                    </div>
                  </div>
                </div>
                <PlayerAttributeMatrix 
                  assessments={assessments} 
                  playingRole={player.role || player.playingRole} 
                />
              </div>
            </div>

            {/* AI Forecast */}
            <div className="lg:col-span-2">
              <PlayerForecastWidget playerId={player.id} />
            </div>

            {/* Personal Information - Tactical Card */}
            <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden sh-slide-up">
              <div className="p-8 border-b border-white/10">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary" style={{ fontFamily: D.mono }}>
                  Personnel Data
                </h3>
              </div>
              <div className="p-8 space-y-6">
                {dateOfBirth && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      <Calendar className="h-5 w-5 text-white/40" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/30" style={{ fontFamily: D.mono }}>Temporal Origin</div>
                      <div className="text-sm font-bold text-white/90">
                        {dateOfBirth.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        {age && <span className="text-primary ml-2">({age} yrs)</span>}
                      </div>
                    </div>
                  </div>
                )}
                
                {player.email && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      <Mail className="h-5 w-5 text-white/40" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/30" style={{ fontFamily: D.mono }}>Comms Channel</div>
                      <div className="text-sm font-bold text-white/90">{player.email}</div>
                    </div>
                  </div>
                )}

                {player.phone && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      <Phone className="h-5 w-5 text-white/40" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/30" style={{ fontFamily: D.mono }}>Direct Line</div>
                      <div className="text-sm font-bold text-white/90">{player.phone}</div>
                    </div>
                  </div>
                )}

                {player.assignedSchools && player.assignedSchools.length > 0 && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      <School className="h-5 w-5 text-white/40" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/30" style={{ fontFamily: D.mono }}>Institutional Scope</div>
                      <div className="text-sm font-bold text-white/90">{player.assignedSchools.join(', ')}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Physical Attributes - Tactical Card */}
            {player.physicalAttributes && (
              <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden sh-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="p-8 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary" style={{ fontFamily: D.mono }}>
                    Physical Matrix
                  </h3>
                  <Target className="h-4 w-4 text-white/20" />
                </div>
                <div className="p-8 space-y-4">
                  {[
                    { label: 'Vertical Stature', value: `${player.physicalAttributes.height} cm`, icon: Activity },
                    { label: 'Operational Mass', value: `${player.physicalAttributes.weight} kg`, icon: Activity },
                    { label: 'Lateral Dominance', value: player.physicalAttributes.battingHand, icon: Activity },
                    { label: 'Propulsion Style', value: player.physicalAttributes.bowlingStyle, icon: Activity }
                  ].map((attr, i) => (
                    <div key={i} className="flex justify-between items-center group/item transition-all hover:bg-white/[0.02] -mx-4 px-4 py-2 rounded-lg">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/30" style={{ fontFamily: D.mono }}>{attr.label}</span>
                      <span className="text-xs font-bold text-white group-hover/item:text-primary transition-colors">{attr.value || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Matches */}
            <div className="lg:col-span-2">
              <RecentMatches playerId={player.id} />
            </div>
          </div>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BattingStatsCard player={player} />
            <BowlingStatsCard player={player} />
            <FieldingStatsCard player={player} />
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Charts */}
            <div className="lg:col-span-2">
              <PlayerPerformanceCharts player={player} />
            </div>
            
            {/* Smart Insights Sidebar */}
            <div className="space-y-6">
              <FormAnalysisCard
                playerName={`${player.firstName} ${player.lastName}`}
                role={player.playingRole?.toLowerCase() as "batsman" | "bowler" | "allrounder" || "batsman"}
                recentMatches={[
                  // Demo data - would be fetched from Firestore in production
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
                  battingAverage: player.stats?.battingAverage,
                  strikeRate: player.stats?.strikeRate,
                  bowlingAverage: player.stats?.bowlingAverage,
                  matchesPlayed: player.stats?.matchesPlayed || 0,
                  runsScored: player.stats?.totalRuns,
                  wicketsTaken: player.stats?.wicketsTaken,
                }}
              />
            </div>
          </div>
        </TabsContent>

        {/* Passport Tab */}
        <TabsContent value="passport" className="space-y-6">
          <PlayerPassportView player={player} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AccoladesTimeline playerId={player.id} />
            </div>
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden sh-slide-up p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                <Award className="h-12 w-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2" style={{ fontFamily: D.mono }}>
                  Institutional Records
                </h3>
                <p className="text-xl font-bold text-white/80" style={{ fontFamily: D.head }}>
                  Certifications & Commendations
                </p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#10b981] bg-[#10b981]/10 px-3 py-1 rounded border border-[#10b981]/20">
                    Captained U15 A
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#3b82f6] bg-[#3b82f6]/10 px-3 py-1 rounded border border-[#3b82f6]/20">
                    Regional Pathway
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <RewardsWalletCard 
                wallet={rewardsWallet || {
                  id: "demo",
                  playerId: player.id,
                  totalPointsBalance: 1250,
                  lifetimePointsEarned: 2450,
                  currentTier: 'Silver',
                  tierScore: 1250,
                  nextTierThreshold: 5000,
                  lastUpdated: new Date().toISOString()
                }} 
              />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <RewardsStore 
                items={[
                  { id: '1', name: 'Elite Performance Socks', description: 'Moisture-wicking professional grade', cost: 500, category: 'Commercial' },
                  { id: '2', name: 'Masterclass with Pro', description: '1-on-1 session with a provincial coach', cost: 5000, category: 'Development', requiredTier: 'Gold' },
                  { id: '3', name: 'Legacy Badge', description: 'Exclusive profile flair', cost: 1000, category: 'Prestige' }
                ]}
                userBalance={rewardsWallet?.totalPointsBalance || 1250}
                userTier={rewardsWallet?.currentTier || 'Silver'}
              />
              <RewardsLeaderboard 
                entries={[
                  { playerId: player.id, name: `${player.firstName} ${player.lastName}`, points: 1250, rank: 4, previousRank: 5, tier: 'Silver' },
                  { playerId: '2', name: 'David Miller', points: 3400, rank: 1, previousRank: 1, tier: 'Gold' },
                  { playerId: '3', name: 'Quinton de Kock', points: 2800, rank: 2, previousRank: 3, tier: 'Gold' },
                  { playerId: '4', name: 'Kagiso Rabada', points: 2100, rank: 3, previousRank: 2, tier: 'Silver' }
                ]}
                currentUserId={player.id}
              />
            </div>
          </div>
        </TabsContent>

        {/* Intelligence Tab */}
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
  );
}
