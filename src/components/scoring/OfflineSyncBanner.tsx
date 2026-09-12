'use client';

import React, { useState, useEffect } from 'react';
import { offlineSyncEngine, SyncStatus } from '@/lib/scoring/offlineSyncEngine';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function OfflineSyncBanner({ className }: { className?: string }) {
  const [status, setStatus] = useState<SyncStatus>({
    state: typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline',
    pendingCount: 0,
    lastSyncedAt: null,
  });

  const [isManualSyncing, setIsManualSyncing] = useState(false);

  useEffect(() => {
    if (!offlineSyncEngine) return;
    const unsubscribe = offlineSyncEngine.subscribe((newStatus) => {
      setStatus(newStatus);
    });
    return () => unsubscribe();
  }, []);

  const handleForceSync = async () => {
    if (!offlineSyncEngine || status.state === 'offline') return;
    setIsManualSyncing(true);
    await offlineSyncEngine.triggerSyncFlush();
    setIsManualSyncing(false);
  };

  return (
    <div
      className={cn(
        'w-full px-4 py-2 flex items-center justify-between border-b transition-colors text-xs font-mono',
        status.state === 'offline'
          ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
          : status.state === 'syncing' || isManualSyncing
          ? 'bg-sky-950/80 border-sky-500/40 text-sky-300'
          : 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400',
        className
      )}
    >
      <div className="flex items-center space-x-2.5">
        {status.state === 'offline' ? (
          <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
        ) : status.state === 'syncing' || isManualSyncing ? (
          <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />
        ) : (
          <Wifi className="w-4 h-4 text-emerald-400" />
        )}

        <div className="flex items-center space-x-2">
          <span className="font-bold tracking-wider uppercase">
            {status.state === 'offline'
              ? 'OFFLINE MODE'
              : status.state === 'syncing' || isManualSyncing
              ? 'SYNCING QUEUE'
              : 'ONLINE'}
          </span>
          <span className="text-white/40">•</span>
          <span>
            {status.pendingCount === 0
              ? 'All events saved & synced'
              : `${status.pendingCount} event${status.pendingCount > 1 ? 's' : ''} queued locally`}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {status.lastSyncedAt && (
          <span className="hidden sm:inline text-white/50 text-[11px]">
            Last sync: {new Date(status.lastSyncedAt).toLocaleTimeString()}
          </span>
        )}

        {status.pendingCount > 0 && status.state !== 'offline' && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleForceSync}
            disabled={isManualSyncing || status.state === 'syncing'}
            className="h-6 px-2 text-[11px] border-emerald-500/40 hover:bg-emerald-500/20 text-emerald-300"
          >
            <RefreshCw className={cn('w-3 h-3 mr-1', isManualSyncing && 'animate-spin')} />
            Flush Queue ({status.pendingCount})
          </Button>
        )}
      </div>
    </div>
  );
}
