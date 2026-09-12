"use client";

import { useEffect, useState, use } from 'react';
import { BroadcastOverlay } from "@/components/broadcast/BroadcastOverlay";
import { liveMatchSync, LiveMatchState } from "@/services/liveMatchSync";

interface PageProps {
  params: Promise<{ matchId: string }>;
}

/**
 * Transparent OBS / vMix browser-source page.
 *   /broadcast/<fixtureId>?chroma=1   → solid green background for keying
 *   /broadcast/<fixtureId>?mode=lower-third|full-scorecard|partnership|bowler-card|target-bar
 * Subscribes to the same live bus the scorer writes to.
 */
export default function BroadcastPage({ params }: PageProps) {
  const { matchId } = use(params);
  const [state, setState] = useState<LiveMatchState | null>(null);
  const [chroma, setChroma] = useState(false);

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    setChroma(['1', 'true', 'on'].includes((qs.get('chroma') || '').toLowerCase()));

    liveMatchSync.connectFirestore(matchId);
    const unsubscribe = liveMatchSync.subscribe(setState);
    return () => unsubscribe();
  }, [matchId]);

  if (!state) return <div className="fixed inset-0" style={{ background: chroma ? '#00FF00' : 'transparent' }} />;

  const b = state.currentBowler;
  const oversStr = `${state.oversCompleted}.${state.ballsInOver}`;
  const ballsBowled = state.oversCompleted * 6 + state.ballsInOver;
  const projected = ballsBowled > 0 ? Math.round(state.totalRuns / ballsBowled * 300) : undefined; // 50-over projection
  const targetText = state.targetRuns
    ? `${Math.max(0, state.targetRuns - state.totalRuns)} runs to win`
    : state.statusMessage;

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: chroma ? '#00FF00' : 'transparent' }}>
      <BroadcastOverlay
        teamName={state.battingTeamName}
        score={String(state.totalRuns)}
        wickets={state.wickets}
        overs={oversStr}
        batterName={state.striker.name}
        batterRuns={state.striker.runs}
        batterBalls={state.striker.ballsFacing}
        bowlerName={b.name}
        bowlerFigures={`${b.overs}-${b.maidens}-${b.runsConceded}-${b.wicketsTaken}`}
        projectedText={projected ? `${projected} @ ${state.currentRunRate.toFixed(1)} RPO` : `${state.currentRunRate.toFixed(1)} RPO`}
        targetText={targetText}
        milestone={state.activeMilestoneAlert?.title}
        milestoneKey={state.activeMilestoneAlert?.id}
        milestoneValue={state.activeMilestoneAlert?.type === 'WICKET' ? `${state.wickets}` : `${state.striker.runs}*`}
        milestoneSub={state.activeMilestoneAlert?.type === 'WICKET' ? 'Wickets down' : `${state.striker.ballsFacing} balls faced`}
      />
    </div>
  );
}
