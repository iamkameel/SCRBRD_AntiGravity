'use client';

import { Badge } from '@/components/ui/badge';
import { WifiOff, Wifi } from 'lucide-react';
import { useFirestoreConnection } from '@/hooks/useLiveScore';

export function ConnectionIndicator() {
  const isOnline = useFirestoreConnection();

  if (isOnline) {
    return (
      <Badge variant="outline" className="gap-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
        <Wifi className="h-3 w-3" />
        <span className="text-xs">Live</span>
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1.5 bg-amber-500/10 text-amber-600 border-amber-500/20">
      <WifiOff className="h-3 w-3" />
      <span className="text-xs">Offline</span>
    </Badge>
  );
}
