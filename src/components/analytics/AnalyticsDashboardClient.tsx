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
import { getAnalyticsDataAction, predictMatchOutcomeAction, getAnalyticsFilterOptionsAction, AnalyticsData, FilterOptions } from "@/app/actions/analyticsActions";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AnalyticsFiltersPanel, AnalyticsFilters } from "./AnalyticsFilters";
import { TopPerformersList } from "./TopPerformersList";
import { MatchPredictionCard } from "./MatchPredictionCard";
import { PlayerForecastCard } from "./PlayerForecastCard";
import { TeamStrengthAnalysis } from "./TeamStrengthAnalysis";
import { WinLossGauge } from "@/components/charts/WinLossGauge";
import { PerformanceTimeline } from "@/components/charts/PerformanceTimeline";
import { motion } from "framer-motion";

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
  }, []);

  useEffect(() => {
    if (!loading) {
       loadData();
    }
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
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance">
            <TrendingUp className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          {!isPlayer && (
            <TabsTrigger value="predictions">
              <Brain className="h-4 w-4 mr-2" />
              AI Predictions
            </TabsTrigger>
          )}
          <TabsTrigger value="insights">
            <Zap className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Matches"
              value={analytics.totalMatches}
              icon={<Trophy className="h-5 w-5 text-amber-500" />}
              gradient="from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20"
            />
            <StatCard
              title="Total Runs"
              value={analytics.totalRuns.toLocaleString()}
              icon={<Target className="h-5 w-5 text-blue-500" />}
              gradient="from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20"
            />
            <StatCard
              title="Total Wickets"
              value={analytics.totalWickets}
              icon={<Activity className="h-5 w-5 text-red-500" />}
              gradient="from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20"
            />
            <StatCard
              title="Fielding Marks"
              value={analytics.mostCatches.reduce((sum, p) => sum + p.value, 0)}
              icon={<Shield className="h-5 w-5 text-green-500" />}
              gradient="from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"
            />
          </div>

          {/* Top Performers Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-amber-500" />
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
          <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border-indigo-100 dark:border-indigo-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Smart Insights
              </CardTitle>
              <CardDescription>AI-generated observations and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  description={`${analytics.topWicketTakers[0].name} leads the wicket-taking charts with ${analytics.topWicketTakers[0].value} wickets. Utilize them in crucial overs.`}
                />
              )}
              <InsightCard
                type="warning"
                title="Team Balance"
                description="Consider strengthening the middle order batting lineup based on recent performance trends."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ title, value, icon, gradient }: { title: string; value: string | number; icon: React.ReactNode; gradient: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`bg-gradient-to-br ${gradient} border-0 shadow-lg`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
              <p className="text-3xl font-bold">{value}</p>
            </div>
            <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 bg-muted/50 rounded-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function InsightCard({ type, title, description }: { type: 'success' | 'info' | 'warning'; title: string; description: string }) {
  const colors = {
    success: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900',
    info: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900',
    warning: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900'
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[type]}`}>
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
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



