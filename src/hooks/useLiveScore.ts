'use client';

import { useEffect, useState } from 'react';
import { matchService } from '@/services/matchService';
import { LiveScoreProjection } from '@/types/firestore';

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
        setLiveScore(data);
        setError(data ? null : 'Match score not found');
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
