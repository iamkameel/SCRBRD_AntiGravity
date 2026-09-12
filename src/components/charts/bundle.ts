/**
 * The single module every lazy chart import resolves to.
 *
 * Turbopack duplicates a library into each async chunk that pulls it in, so
 * giving each chart its own dynamic() boundary produced one copy of recharts
 * per chart. Pointing every boundary at this one module puts recharts in
 * exactly one chunk, fetched the first time any chart renders.
 */

export { MatchMomentumChart } from '@/components/match/MatchMomentumChart';
export { ManhattanChart } from '@/components/charts/ManhattanChart';
export { WormChart } from '@/components/charts/WormChart';
export { ManhattanChart as AnalyticsManhattanChart } from '@/components/analytics/ManhattanChart';
export { WormChart as AnalyticsWormChart } from '@/components/analytics/WormChart';
export { PerformanceTimeline } from '@/components/charts/PerformanceTimeline';
export { SkillsRadar } from '@/components/charts/SkillsRadar';
export { ComparisonChart } from '@/components/players/ComparisonChart';
export { PlayerPerformanceCharts } from '@/components/players/PlayerPerformanceCharts';
export { PlayerSkillsDisplay } from '@/components/players/PlayerSkillsDisplay';
export { default as PlayerImpactCard } from '@/components/rankings/PlayerImpactCard';
export { TeamStrengthAnalysis } from '@/components/analytics/TeamStrengthAnalysis';
export { PartnershipChart } from '@/components/scoring/PartnershipChart';
export { GlobalRankingsClient } from '@/components/rankings/GlobalRankingsClient';
export { AnalyticsHubClient } from '@/components/analytics/AnalyticsHubClient';
export { PlayerPassportView } from '@/components/players/PlayerPassportView';
