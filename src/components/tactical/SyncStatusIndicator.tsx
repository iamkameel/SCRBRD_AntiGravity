'use client';

import { Badge } from '@/components/ui/badge';
import { Wifi, RotateCw, WifiOff } from 'lucide-react';
import type { DirectiveSyncState } from '@/hooks/useTacticalDirectives';

/**
 * The spec calls for a visible ● LIVE / ◌ SYNCING / ⚠ RECONNECTING / ○ OFFLINE
 * distinction so a cached directive is never mistaken for a fresh one.
 * Mirrors the emerald/amber styling of ConnectionIndicator.tsx.
 */
export function SyncStatusIndicator({ state }: { state: DirectiveSyncState }) {
  const config = {
    LIVE: { icon: Wifi, label: 'Live', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    SYNCING: { icon: RotateCw, label: 'Syncing', className: 'bg-sky-500/10 text-sky-600 border-sky-500/20 animate-pulse' },
    RECONNECTING: { icon: RotateCw, label: 'Reconnecting', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    OFFLINE: { icon: WifiOff, label: 'Offline', className: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  }[state];

  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-1.5 ${config.className}`} aria-label={`Connection: ${config.label}`}>
      <Icon className={`h-3 w-3 ${state === 'SYNCING' || state === 'RECONNECTING' ? 'animate-spin' : ''}`} />
      <span className="text-xs">{config.label}</span>
    </Badge>
  );
}
