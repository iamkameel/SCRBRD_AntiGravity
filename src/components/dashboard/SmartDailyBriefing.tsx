"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, Trophy, Activity, ArrowRight } from "lucide-react";
import { getAnalyticsDataAction, AnalyticsData } from "@/app/actions/analyticsActions";
import { fetchUpcomingMatches } from "@/lib/firestore"; // We might need a server action wrapper for this if used in client component
import { Match } from "@/types/firestore";
import Link from "next/link";
import { TopPerformersList } from "@/components/analytics/TopPerformersList";
import { formatDistanceToNow } from "date-fns";

interface SmartDailyBriefingProps {
  userName?: string;
  role?: string;
}

export function SmartDailyBriefing({ userName, role }: SmartDailyBriefingProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getAnalyticsDataAction();
        if (result.success && result.data) {
          setAnalytics(result.data);
          generateInsight(result.data);
        }
      } catch (error) {
        console.error("Failed to load briefing data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const generateInsight = (data: AnalyticsData) => {
    // Simple rule-based insight generation (Mock AI)
    if (data.topRunScorers.length > 0) {
      const topScorer = data.topRunScorers[0];
      setInsight(`🔥 **Hot Streak**: ${topScorer.name} is leading the charts with ${topScorer.value} runs this season.`);
    } else {
      setInsight("Ready for the season to start? Schedule some matches to see insights here.");
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border-indigo-100 dark:border-indigo-900">
        <CardContent className="p-6 flex items-center justify-center h-40">
          <div className="flex items-center gap-2 text-indigo-500 animate-pulse">
            <Sparkles className="h-5 w-5" />
            <span className="font-medium">Generating your daily briefing...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Main Briefing Card */}
      <Card className="lg:col-span-2 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border-indigo-100 dark:border-indigo-900">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-white/50 dark:bg-black/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800">
              <Sparkles className="h-3 w-3 mr-1" />
              Smart Insight
            </Badge>
          </div>
          <CardTitle className="text-2xl text-indigo-950 dark:text-indigo-100">
            Good {new Date().getHours() < 12 ? "Morning" : "Afternoon"}, {userName || "User"}!
          </CardTitle>
          <CardDescription className="text-indigo-900/70 dark:text-indigo-200/70 text-base">
            {role && <span className="font-semibold">{role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Dashboard</span>} - Here&apos;s what&apos;s happening in your cricket world today.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {insight && (
            <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
              <p className="text-lg font-medium text-indigo-900 dark:text-indigo-100">
                {insight.replace(/\*\*(.*?)\*\*/g, '$1')} {/* Simple markdown strip for now */}
              </p>
            </div>
          )}
          
          <div className="flex gap-4">
            <Link href="/analytics">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                <Activity className="mr-2 h-4 w-4" />
                View Full Report
              </Button>
            </Link>
            <Link href="/matches/add">
              <Button variant="outline" className="border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                Schedule Match
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats / Top Performer */}
      <div className="space-y-6">
        {analytics && analytics.topRunScorers.length > 0 && (
          <TopPerformersList 
            title="Top Run Scorers" 
            performers={analytics.topRunScorers.slice(0, 3)}
            icon={<Trophy className="h-4 w-4 text-amber-500" />}
          />
        )}
        {analytics && analytics.topWicketTakers.length > 0 && (
            <TopPerformersList 
            title="Top Wicket Takers" 
            performers={analytics.topWicketTakers.slice(0, 3)}
            icon={<Activity className="h-4 w-4 text-emerald-500" />}
          />
        )}
      </div>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
