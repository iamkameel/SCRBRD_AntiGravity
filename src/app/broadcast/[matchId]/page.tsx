"use client";

import { useEffect, useState, use } from 'react';
import { BroadcastOverlay } from "@/components/broadcast/BroadcastOverlay";
import { OverlayGraphic, MilestoneBanner, liveStateToOverlay, parseOverlayMode, type OverlayMode } from "@/components/broadcast/OverlayModes";
import { liveMatchSync, LiveMatchState } from "@/services/liveMatchSync";

interface PageProps {
  params: Promise<{ matchId: string }>;
}

/**
 * Transparent OBS / vMix browser-source page.
 *   /broadcast/<fixtureId>?chroma=1        → solid green background for keying
 *   /broadcast/<fixtureId>?mode=<mode>     → lower-third (default) | full-scorecard |
 *                                            partnership | bowler-card | target-bar | hero
 * Subscribes to the same live bus the scorer writes to. The milestone banner
 * fires whenever the scorer (or the Highlight Clipper) pushes an alert.
 */
export default function BroadcastPage({ params }: PageProps) {
  const { matchId } = use(params);
  const [state, setState] = useState<LiveMatchState | null>(null);
  const [chroma, setChroma] = useState(false);
  const [mode, setMode] = useState<OverlayMode>('lower-third');

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    setChroma(['1', 'true', 'on'].includes((qs.get('chroma') || '').toLowerCase()));
    setMode(parseOverlayMode(qs.get('mode')));

    liveMatchSync.connectFirestore(matchId);
    const unsubscribe = liveMatchSync.subscribe(setState);
    return () => unsubscribe();
  }, [matchId]);

  const bg = chroma ? '#00FF00' : 'transparent';
  if (!state) return <div className="fixed inset-0" style={{ background: bg }} />;

  if (mode === 'hero') {
    const b = state.currentBowler;
    const ballsBowled = state.oversCompleted * 6 + state.ballsInOver;
    const projected = ballsBowled > 0 ? Math.round(state.totalRuns / ballsBowled * 300) : undefined;
    return (
      <div className="fixed inset-0 overflow-hidden" style={{ background: bg }}>
        <BroadcastOverlay
          teamName={state.battingTeamName}
          score={String(state.totalRuns)}
          wickets={state.wickets}
          overs={`${state.oversCompleted}.${state.ballsInOver}`}
          batterName={state.striker.name}
          batterRuns={state.striker.runs}
          batterBalls={state.striker.ballsFacing}
          bowlerName={b.name}
          bowlerFigures={`${b.overs}-${b.maidens}-${b.runsConceded}-${b.wicketsTaken}`}
          projectedText={projected ? `${projected} @ ${state.currentRunRate.toFixed(1)} RPO` : `${state.currentRunRate.toFixed(1)} RPO`}
          targetText={state.targetRuns ? `${Math.max(0, state.targetRuns - state.totalRuns)} runs to win` : state.statusMessage}
          milestone={state.activeMilestoneAlert?.title}
          milestoneKey={state.activeMilestoneAlert?.id}
          milestoneValue={state.activeMilestoneAlert?.type === 'WICKET' ? `${state.wickets}` : `${state.striker.runs}*`}
          milestoneSub={state.activeMilestoneAlert?.type === 'WICKET' ? 'Wickets down' : `${state.striker.ballsFacing} balls faced`}
        />
      </div>
    );
  }

  const overlay = liveStateToOverlay(state, mode);
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: bg }}>
      <MilestoneBanner
        alert={state.activeMilestoneAlert}
        valueText={state.activeMilestoneAlert?.type === 'WICKET' ? `${state.wickets}` : `${state.striker.runs}*`}
        subText={state.activeMilestoneAlert?.type === 'WICKET' ? 'Wickets down' : `${state.striker.ballsFacing} balls faced`}
      />
      <div className="absolute inset-x-0 bottom-0 p-12 pointer-events-none">
        <OverlayGraphic state={overlay} />
      </div>
    </div>
  );
}
