"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  Activity, 
  Shield, 
  BarChart3, 
  Trophy, 
  TrendingUp,
  Users,
  Zap,
  Brain,
  Download,
  RefreshCw,
  Eye
} from "lucide-react";
import { getAnalyticsDataAction, getAnalyticsFilterOptionsAction, AnalyticsData, FilterOptions } from "@/app/actions/analyticsActions";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AnalyticsFiltersPanel, AnalyticsFilters } from "./AnalyticsFilters";
import { TopPerformersList } from "./TopPerformersList";
import { MatchPredictionCard } from "./MatchPredictionCard";
import { PlayerForecastCard } from "./PlayerForecastCard";
import { TeamStrengthAnalysis } from "./TeamStrengthAnalysis";
import { HeadToHeadAnalytics } from "./HeadToHeadAnalytics";
import { WinLossGauge } from "@/components/charts/WinLossGauge";
import { PerformanceTimeline } from "@/components/charts/PerformanceTimeline";
import { motion } from "framer-motion";
import { D } from "@/lib/design-system";

export function AnalyticsDashboardClient() {
  const { userRole } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    seasons: [],
    divisions: [],
    leagues: [],
    teams: []
  });
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: { from: undefined, to: undefined },
    season: undefined,
    division: undefined,
    league: undefined,
    team: undefined
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const isPlayer = userRole === 'player';

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getAnalyticsDataAction(filters);
      if (result.success && result.data) {
        setAnalytics(result.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadOptions = async () => {
      const result = await getAnalyticsFilterOptionsAction();
      if (result.success && result.data) {
        setFilterOptions(result.data);
      }
    };
    loadOptions();
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading) {
       loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  if (loading && !analytics) {
    return <AnalyticsLoadingSkeleton />;
  }

  if (!analytics) {
    return <div>No data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => { setRefreshing(true); loadData(); }} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <AnalyticsFiltersPanel 
        filters={filters} 
        onChange={setFilters}
        seasons={filterOptions.seasons}
        divisions={filterOptions.divisions}
        leagues={filterOptions.leagues}
        teams={filterOptions.teams}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList style={{ background: D.surf1, border: `1px solid ${D.border}`, padding: 4, borderRadius: 14, height: 'auto' }}>
          <TabsTrigger value="overview" className="rounded-md text-xs font-bold uppercase tracking-wider px-5 py-2.5 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400 gap-2">
            <BarChart3 className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="rounded-md text-xs font-bold uppercase tracking-wider px-5 py-2.5 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-400 gap-2">
            <TrendingUp className="h-3.5 w-3.5" />
            Performance
          </TabsTrigger>
          {!isPlayer && (
            <TabsTrigger value="predictions" className="rounded-md text-xs font-bold uppercase tracking-wider px-5 py-2.5 data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400 gap-2">
              <Brain className="h-3.5 w-3.5" />
              AI Predictions
            </TabsTrigger>
          )}
          <TabsTrigger value="insights" className="rounded-md text-xs font-bold uppercase tracking-wider px-5 py-2.5 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 gap-2">
            <Zap className="h-3.5 w-3.5" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Matches" value={analytics.totalMatches} accent={D.amber} icon={<Trophy className="h-5 w-5" />} />
            <StatCard title="Total Runs" value={analytics.totalRuns.toLocaleString()} accent={D.sky} icon={<Target className="h-5 w-5" />} />
            <StatCard title="Total Wickets" value={analytics.totalWickets} accent={D.rose} icon={<Activity className="h-5 w-5" />} />
            <StatCard title="Fielding Marks" value={analytics.mostCatches.reduce((sum, p) => sum + p.value, 0)} accent={D.emerald} icon={<Shield className="h-5 w-5" />} />
          </div>

          {/* Institutional Derby Head-to-Head Analytics */}
          <HeadToHeadAnalytics />

          {/* Top Performers Grid */}
          <div>
            <h2 style={{ fontFamily: D.head, fontWeight: 800, fontSize: 18, textTransform: 'uppercase', letterSpacing: '-0.01em', color: D.textPrimary, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Trophy className="h-5 w-5" style={{ color: D.amber }} />
              Top Performers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TopPerformersList
                title="Top Run Scorers"
                performers={analytics.topRunScorers.slice(0, 5)}
                icon={<Target className="h-4 w-4 text-blue-500" />}
              />
              <TopPerformersList
                title="Top Wicket Takers"
                performers={analytics.topWicketTakers.slice(0, 5)}
                icon={<Activity className="h-4 w-4 text-red-500" />}
              />
              <TopPerformersList
                title="Best Batting Average"
                performers={analytics.bestBattingAverages.slice(0, 5)}
                icon={<Target className="h-4 w-4 text-green-500" />}
              />
              <TopPerformersList
                title="Best Bowling Economy"
                performers={analytics.bestBowlingEconomy.slice(0, 5)}
                icon={<Activity className="h-4 w-4 text-purple-500" />}
              />
              <TopPerformersList
                title="Most Catches"
                performers={analytics.mostCatches.slice(0, 5)}
                icon={<Shield className="h-4 w-4 text-amber-500" />}
              />
            </div>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Performance Timeline
                </CardTitle>
                <CardDescription>Track performance trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceTimeline 
                  history={[
                    { matchId: "1", date: "2024-11-01", runs: 45, wickets: 2, opponent: "Team A" },
                    { matchId: "2", date: "2024-11-08", runs: 67, wickets: 1, opponent: "Team B" },
                    { matchId: "3", date: "2024-11-15", runs: 34, wickets: 3, opponent: "Team C" },
                    { matchId: "4", date: "2024-11-22", runs: 89, wickets: 0, opponent: "Team D" },
                    { matchId: "5", date: "2024-11-29", runs: 52, wickets: 2, opponent: "Team E" },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Win/Loss Distribution
                </CardTitle>
                <CardDescription>Overall match outcomes</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <WinLossGauge wins={15} losses={8} draws={2} />
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Statistics</CardTitle>
              <CardDescription>Comprehensive breakdown of all metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricItem label="Avg Runs/Match" value={(analytics.totalRuns / Math.max(analytics.totalMatches, 1)).toFixed(1)} />
                <MetricItem label="Avg Wickets/Match" value={(analytics.totalWickets / Math.max(analytics.totalMatches, 1)).toFixed(1)} />
                <MetricItem label="Strike Rate" value="125.4" />
                <MetricItem label="Economy Rate" value="6.8" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Predictions Tab */}
        {!isPlayer && (
          <TabsContent value="predictions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MatchPredictionCard />
              <PlayerForecastCard />
            </div>

            <TeamStrengthAnalysis />
          </TabsContent>
        )}

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div style={{ background: D.surf1, border: `1px solid ${D.indigo}33`, borderRadius: D.xl, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${D.indigo}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap className="h-5 w-5" style={{ color: D.indigo }} />
              </div>
              <div>
                <div style={{ fontFamily: D.head, fontWeight: 800, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', color: D.textPrimary }}>Smart Insights</div>
                <div style={{ fontFamily: D.body, fontSize: 12, color: D.textMuted }}>AI-generated observations and recommendations</div>
              </div>
            </div>
            <div className="space-y-4">
              {analytics.topRunScorers.length > 0 && (
                <InsightCard
                  type="success"
                  title="Hot Streak Detected"
                  description={`${analytics.topRunScorers[0].name} is in exceptional form with ${analytics.topRunScorers[0].value} runs. Consider promoting them in the batting order.`}
                />
              )}
              {analytics.topWicketTakers.length > 0 && (
                <InsightCard
                  type="info"
                  title="Bowling Strength"
                  description={`${analytics.topWicketTakers[0].name} leads the wicket-taking charts with ${analytics.topWicketTakers[0].value} wickets. Utilise them in crucial overs.`}
                />
              )}
              <InsightCard
                type="warning"
                title="Team Balance"
                description="Consider strengthening the middle order batting lineup based on recent performance trends."
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ title, value, icon, accent }: { title: string; value: string | number; icon: React.ReactNode; accent: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.xl, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: accent, borderRadius: '18px 0 0 18px' }} />
        <div style={{ paddingLeft: 8 }}>
          <div style={{ fontFamily: D.head, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: D.textMuted, marginBottom: 6 }}>{title}</div>
          <div style={{ fontFamily: D.mono, fontSize: 30, fontWeight: 700, color: D.textPrimary, lineHeight: 1 }}>{value}</div>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: 16, background: D.surf2, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
      <div style={{ fontFamily: D.head, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: D.textMuted, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: D.mono, fontSize: 22, fontWeight: 700, color: D.textPrimary }}>{value}</div>
    </div>
  );
}

function InsightCard({ type, title, description }: { type: 'success' | 'info' | 'warning'; title: string; description: string }) {
  const palette = {
    success: { color: D.emerald, bg: `${D.emerald}12`, border: `${D.emerald}30` },
    info:    { color: D.indigo,  bg: `${D.indigo}12`,  border: `${D.indigo}30` },
    warning: { color: D.amber,   bg: `${D.amber}12`,   border: `${D.amber}30` },
  };
  const { color, bg, border } = palette[type];
  return (
    <div style={{ padding: '14px 16px', borderRadius: D.lg, background: bg, border: `1px solid ${border}`, borderLeft: `3px solid ${color}` }}>
      <div style={{ fontFamily: D.head, fontSize: 13, fontWeight: 700, color: D.textPrimary, marginBottom: 4 }}>{title}</div>
      <p style={{ fontFamily: D.body, fontSize: 12, color: D.textSecondary, lineHeight: 1.5, margin: 0 }}>{description}</p>
    </div>
  );
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/2 mb-4" />
              <div className="h-8 bg-muted rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-64 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}



