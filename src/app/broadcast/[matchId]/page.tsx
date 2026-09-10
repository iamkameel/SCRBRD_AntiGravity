"use client";

import React, { useState, useEffect, use } from 'react';
import { BroadcastOverlay } from "@/components/broadcast/BroadcastOverlay";
import { replayInningsEvents } from "@/services/scoring/replayEngine";
import { BallEvent } from "@/types/schema_v4";

interface PageProps {
  params: Promise<{ matchId: string }>;
}

export default function BroadcastPage({ params }: PageProps) {
  const { matchId } = use(params);
  const [matchData, setMatchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo ball events stream for live broadcast overlay
    const demoEvents: BallEvent[] = [
      {
        id: 'b1',
        fixtureId: matchId,
        inningsId: 'inn-1',
        overNumber: 15,
        ballNumber: 4,
        strikerId: 'p1',
        nonStrikerId: 'p2',
        bowlerId: 'b1',
        runsBat: 4,
        runsExtras: 0,
        runsTotal: 4,
        extraType: null,
        wicketFlag: false,
        ballSequenceGlobal: 1,
        timestamp: Date.now()
      } as any
    ];

    const state = replayInningsEvents(demoEvents, { inningsNumber: 1 });
    setMatchData(state);
    setLoading(false);
  }, [matchId]);

  if (loading) return <div className="fixed inset-0 bg-transparent" />;

  return (
    <div className="fixed inset-0 bg-transparent overflow-hidden">
      <BroadcastOverlay 
        score={matchData?.runs?.toString() || "142"}
        wickets={matchData?.wickets || 3}
        overs={matchData?.oversDisplay || "15.4"}
        batterName="Liam Peterson"
        batterRuns={48}
        batterBalls={32}
        bowlerName="K. Rabada"
        bowlerFigures="3.4-0-22-2"
        milestone="Half-Century (50 Off 32 Balls)"
      />
    </div>
  );
}
