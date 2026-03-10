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
import { RecentMatches } from "./RecentMatches";
import { FormAnalysisCard } from "@/components/profiles/FormAnalysisCard";
import { PerformanceInsightsCard } from "@/components/profiles/PerformanceInsightsCard";
import { PlayerForecastWidget } from "@/components/analytics/PlayerForecastWidget";

interface PlayerDetailClientProps {
  player: Person;
}

export function PlayerDetailClient({ player }: PlayerDetailClientProps) {
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
    <div className="space-y-6">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href="/players"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Players
        </Link>
        <Link href={`/players/${player.id}/edit`}>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <Card className="overflow-hidden border-t-4 border-t-primary">
        <CardContent className="p-0">
          <div className="relative bg-gradient-to-br from-primary/10 via-emerald-500/10 to-primary/5 p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              {/* Profile Image */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-emerald-600 opacity-20 blur-2xl" />
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-xl">
                  <Image
                    src={avatarUrl}
                    alt={`${player.firstName} ${player.lastName}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Player Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {player.firstName} {player.lastName}
                  </h1>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                      {player.role}
                    </Badge>
                    {player.status && (
                      <Badge 
                        variant={player.status === 'active' ? 'default' : 'secondary'}
                        className={player.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                      >
                        {player.status}
                      </Badge>
                    )}
                    {age && (
                      <span className="text-sm text-muted-foreground">
                        {age} years old
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Matches</div>
                    <div className="text-2xl font-bold text-primary">{player.stats?.matchesPlayed || 0}</div>
                  </div>
                  <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Runs</div>
                    <div className="text-2xl font-bold text-primary">{player.stats?.totalRuns || 0}</div>
                  </div>
                  <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Wickets</div>
                    <div className="text-2xl font-bold text-primary">{player.stats?.wicketsTaken || 0}</div>
                  </div>
                  <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Average</div>
                    <div className="text-2xl font-bold text-primary">
                      {player.stats?.battingAverage?.toFixed(1) || '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <User className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="info" className="gap-2">
            <Award className="h-4 w-4" />
            Info
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skills Overview (Radar Chart only) */}
            <div className="lg:col-span-2">
              <PlayerSkillsDisplay player={player} />
            </div>

            {/* AI Forecast */}
            <div className="lg:col-span-2">
              <PlayerForecastWidget playerId={player.id} />
            </div>

            {/* Personal Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dateOfBirth && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Date of Birth</div>
                      <div className="font-medium">
                        {dateOfBirth.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        {age && <span className="text-muted-foreground ml-2">({age} years)</span>}
                      </div>
                    </div>
                  </div>
                )}
                
                {player.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium">{player.email}</div>
                    </div>
                  </div>
                )}

                {player.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium">{player.phone}</div>
                    </div>
                  </div>
                )}

                {player.assignedSchools && player.assignedSchools.length > 0 && (
                  <div className="flex items-start gap-3">
                    <School className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">School</div>
                      <div className="font-medium">{player.assignedSchools.join(', ')}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Physical Attributes Card */}
            {player.physicalAttributes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Physical Attributes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {player.physicalAttributes.height && (
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Height</span>
                      <span className="font-semibold">{player.physicalAttributes.height} cm</span>
                    </div>
                  )}
                  {player.physicalAttributes.weight && (
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Weight</span>
                      <span className="font-semibold">{player.physicalAttributes.weight} kg</span>
                    </div>
                  )}
                  {player.physicalAttributes.battingHand && (
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Batting Hand</span>
                      <span className="font-semibold">{player.physicalAttributes.battingHand}</span>
                    </div>
                  )}
                  {player.physicalAttributes.bowlingStyle && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Bowling Style</span>
                      <span className="font-semibold">{player.physicalAttributes.bowlingStyle}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
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

        {/* Info Tab - Placeholder for now */}
        <TabsContent value="info">
          <Card>
            <CardContent className="p-12 text-center">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
              <p className="text-muted-foreground">
                Qualifications, achievements, and other details will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
