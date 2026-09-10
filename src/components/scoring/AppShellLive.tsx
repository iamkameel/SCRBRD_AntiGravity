import React from 'react';
import { GlobalStyles } from '@/lib/scoring/theme';
import { AppTopBar } from './AppTopBar';
import { DynamicInsightBar } from './DynamicInsightBar';
import { BottomDock, ActiveTab } from './BottomDock';
import { Loader2 } from 'lucide-react';

export function AppShellLive({
  matchId,
  liveScore,
  overs,
  target,
  isChase,
  loading,
  activeTab,
  onTabChange,
  children
}: {
  matchId: string;
  liveScore: any;
  overs: number;
  target?: number;
  isChase: boolean;
  loading: boolean;
  activeTab: ActiveTab;
  onTabChange: (t: ActiveTab) => void;
  onEndInnings?: () => void;
  onEndMatch?: () => void;
  children: React.ReactNode;
}) {
  if (loading && !liveScore) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <GlobalStyles />
        <div className="text-center flex flex-col items-center">
          <Loader2 className="w-9 h-9 text-emerald-500 animate-spin mb-3 block mx-auto" />
          <p className="text-muted-foreground text-sm font-medium">Loading Scoring Hub…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-20 text-foreground">
      <GlobalStyles />
      <AppTopBar matchId={matchId} liveScore={liveScore} />
      
      {/* Show Insight Bar globally unless match is complete or loading */}
      {liveScore?.status !== 'completed' && liveScore?.status !== 'innings_break' && (
        <DynamicInsightBar liveScore={liveScore} overs={overs} target={target} isChase={isChase} />
      )}
      
      <div className="px-3 py-4 flex flex-col gap-4 max-w-2xl mx-auto">
        {children}
      </div>

      <BottomDock active={activeTab} onChange={onTabChange} />
    </div>
  );
}
