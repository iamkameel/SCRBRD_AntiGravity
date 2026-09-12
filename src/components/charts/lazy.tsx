'use client';

/**
 * Lazy entry points for every recharts-backed component.
 *
 * Charts are never above the fold and cannot render without a DOM, so they
 * are loaded on demand. Every loader imports the same `./bundle` module so
 * recharts is emitted once and shared — see bundle.ts for why that matters.
 */

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

function ChartFallback() {
  return <Skeleton className="h-[300px] w-full rounded-2xl" />;
}

// Leaf charts — client-only, skeleton while loading
export const MatchMomentumChart = dynamic(() => import('./bundle').then(m => m.MatchMomentumChart), { ssr: false, loading: ChartFallback });
export const ManhattanChart = dynamic(() => import('./bundle').then(m => m.ManhattanChart), { ssr: false, loading: ChartFallback });
export const WormChart = dynamic(() => import('./bundle').then(m => m.WormChart), { ssr: false, loading: ChartFallback });
export const AnalyticsManhattanChart = dynamic(() => import('./bundle').then(m => m.AnalyticsManhattanChart), { ssr: false, loading: ChartFallback });
export const AnalyticsWormChart = dynamic(() => import('./bundle').then(m => m.AnalyticsWormChart), { ssr: false, loading: ChartFallback });
export const PerformanceTimeline = dynamic(() => import('./bundle').then(m => m.PerformanceTimeline), { ssr: false, loading: ChartFallback });
export const SkillsRadar = dynamic(() => import('./bundle').then(m => m.SkillsRadar), { ssr: false, loading: ChartFallback });
export const ComparisonChart = dynamic(() => import('./bundle').then(m => m.ComparisonChart), { ssr: false, loading: ChartFallback });
export const PlayerPerformanceCharts = dynamic(() => import('./bundle').then(m => m.PlayerPerformanceCharts), { ssr: false, loading: ChartFallback });
export const PlayerSkillsDisplay = dynamic(() => import('./bundle').then(m => m.PlayerSkillsDisplay), { ssr: false, loading: ChartFallback });
export const PlayerImpactCard = dynamic(() => import('./bundle').then(m => m.PlayerImpactCard), { ssr: false, loading: ChartFallback });
export const TeamStrengthAnalysis = dynamic(() => import('./bundle').then(m => m.TeamStrengthAnalysis), { ssr: false, loading: ChartFallback });
export const PartnershipChart = dynamic(() => import('./bundle').then(m => m.PartnershipChart), { ssr: false, loading: ChartFallback });

// Page-level clients that embed charts — keep SSR for their non-chart content
export const PlayerCareerHistoryTab = dynamic(() => import('./bundle').then(m => m.PlayerCareerHistoryTab));
export const GlobalRankingsClient = dynamic(() => import('./bundle').then(m => m.GlobalRankingsClient));
export const AnalyticsHubClient = dynamic(() => import('./bundle').then(m => m.AnalyticsHubClient));
export const PlayerPassportView = dynamic(() => import('./bundle').then(m => m.PlayerPassportView));
