'use client';

import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { OfflineEventQueue, QueuedBallEvent } from '@/services/offline/OfflineEventQueue';

interface OfflineSyncIndicatorProps {
  fixtureId?: string;
  onSyncComplete?: () => void;
}

export function OfflineSyncIndicator({ fixtureId, onSyncComplete }: OfflineSyncIndicatorProps) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [unsyncedEvents, setUnsyncedEvents] = useState<QueuedBallEvent[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const checkUnsynced = React.useCallback(async () => {
    try {
      const events = await OfflineEventQueue.getUnsyncedEvents(fixtureId);
      setUnsyncedEvents(events);
    } catch {
      // IndexedDB not ready or error
    }
  }, [fixtureId]);

  const syncQueue = React.useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);

    try {
      const pending = await OfflineEventQueue.getUnsyncedEvents(fixtureId);
      for (const event of pending) {
        // Mark synced in local store
        await OfflineEventQueue.markSynced(event.id);
      }
      await checkUnsynced();
      if (onSyncComplete) onSyncComplete();
    } catch (err) {
      console.error('[OfflineSync] Error syncing queue:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [fixtureId, isSyncing, onSyncComplete, checkUnsynced]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      syncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    checkUnsynced();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fixtureId, syncQueue, checkUnsynced]);

  if (isOnline && unsyncedEvents.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
        <Wifi className="w-3.5 h-3.5" />
        <span>Online</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border shadow-sm ${
        !isOnline
          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
          : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
      }`}
    >
      {!isOnline ? (
        <>
          <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Offline ({unsyncedEvents.length} queued)</span>
        </>
      ) : (
        <>
          <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{unsyncedEvents.length} unsynced ball(s)</span>
          <button
            onClick={syncQueue}
            disabled={isSyncing}
            className="ml-1 text-[10px] font-semibold underline hover:text-white transition-colors"
          >
            Sync now
          </button>
        </>
      )}
    </div>
  );
}
