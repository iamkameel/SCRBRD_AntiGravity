'use client';

import { useEffect, useState } from 'react';
import { matchService } from '@/services/matchService';
import { LiveScoreProjection } from '@/types/firestore';
import { getMockMatch } from '@/lib/mockMatchData';

interface UseLiveScoreResult {
  liveScore: LiveScoreProjection | null;
  loading: boolean;
  error: string | null;
  connected: boolean;
}

/**
 * Real-time hook for subscribing to live match score updates
 */
export function useLiveScore(matchId: string | null): UseLiveScoreResult {
  const [liveScore, setLiveScore] = useState<LiveScoreProjection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    if (!matchId) {
      setLoading(false);
      setLiveScore(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe using matchService
    const unsubscribe = matchService.subscribeToLiveScore(
      matchId,
      (data) => {
        setConnected(true);
        if (data) {
          setLiveScore(data);
          setError(null);
        } else {
          // Fallback to mock match projection for demo match IDs or empty state
          const mockObj = createMockProjection(matchId);
          setLiveScore(mockObj);
          setError(null);
        }
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [matchId]);

  return {
    liveScore,
    loading,
    error,
    connected
  };
}

function createMockProjection(matchId: string): LiveScoreProjection {
  const m = getMockMatch(matchId);
  return {
    matchId: m.id,
    inningsNumber: m.currentInnings,
    status: m.state.toLowerCase() as any,
    currentInnings: {
      battingTeamId: 'home-team-id',
      bowlingTeamId: 'away-team-id',
      runs: m.liveScore.totalRuns,
      wickets: m.liveScore.wickets,
      overs: Math.floor(m.liveScore.overs),
      balls: Math.floor(m.liveScore.overs) * 6 + m.liveScore.ballsInOver,
      runRate: parseFloat(m.liveScore.currentRunRate),
      target: m.liveScore.target
    },
    currentPlayers: {
      strikerId: 'p1',
      nonStrikerId: 'p2',
      bowlerId: 'p3'
    },
    batsmen: [
      { playerId: 'p1', runs: m.liveScore.striker.runs, ballsFaced: m.liveScore.striker.balls, fours: m.liveScore.striker.fours, sixes: m.liveScore.striker.sixes, strikeRate: m.liveScore.striker.balls > 0 ? (m.liveScore.striker.runs / m.liveScore.striker.balls) * 100 : 0, isOut: false },
      { playerId: 'p2', runs: m.liveScore.nonStriker.runs, ballsFaced: m.liveScore.nonStriker.balls, fours: m.liveScore.nonStriker.fours, sixes: m.liveScore.nonStriker.sixes, strikeRate: m.liveScore.nonStriker.balls > 0 ? (m.liveScore.nonStriker.runs / m.liveScore.nonStriker.balls) * 100 : 0, isOut: false }
    ],
    bowlers: [
      { playerId: 'p3', overs: parseFloat(m.liveScore.currentBowler.overs), maidens: m.liveScore.currentBowler.maidens, runsConceded: m.liveScore.currentBowler.runs, wickets: m.liveScore.currentBowler.wickets, ballsBowled: Math.floor(parseFloat(m.liveScore.currentBowler.overs)) * 6, economy: 5.2 }
    ],
    currentOver: m.liveScore.recentBalls.map((b: string, i: number) => ({
      ballId: `b-${i}`,
      overNumber: Math.floor(m.liveScore.overs),
      ballNumber: i + 1,
      runs: parseInt(b) || 0,
      isWicket: b === 'W',
      extraType: b === 'Wd' ? 'wide' : b === 'Nb' ? 'noball' : null,
      strikerId: 'p1',
      bowlerId: 'p3'
    })),
    lastUpdated: new Date().toISOString()
  } as unknown as LiveScoreProjection;
}

/**
 * Hook for tracking connection status to Firestore
 * Useful for showing "offline" indicators
 */
export function useFirestoreConnection() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
