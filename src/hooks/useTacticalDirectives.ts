'use client';

/**
 * Real-time hook for the Tactical Directive Bus. Shaped like useLiveScore.ts
 * (data/loading/error + a connection signal) but talks to Firestore directly
 * rather than through baseService, because the ping/haptic behaviour needs
 * snapshot.docChanges() and snapshot.metadata.fromCache — information
 * baseService.subscribeToAll doesn't expose to its callers.
 */

import { useEffect, useRef, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TacticalDirective, TERMINAL_DIRECTIVE_STATUSES } from '@/types/tacticalDirectives';
import { acknowledgeDirectiveReceiptAction, sweepExpiredDirectivesAction } from '@/app/actions/tacticalDirectiveActions';

export type DirectiveSyncState = 'LIVE' | 'SYNCING' | 'RECONNECTING' | 'OFFLINE';

interface UseTacticalDirectivesOptions {
  matchId: string | null;
  personId: string | null; // the viewer: issuedByPersonId for a coach, issuedToPersonId for a captain
  role: 'coach' | 'captain';
  /** Fired once per genuinely new directive after mount — never for the initial backlog, and never for a cached/offline snapshot presented as fresh. */
  onNewDirective?: (directive: TacticalDirective) => void;
}

interface UseTacticalDirectivesResult {
  directives: TacticalDirective[];
  activeDirectives: TacticalDirective[];
  loading: boolean;
  error: string | null;
  syncState: DirectiveSyncState;
}

const TERMINAL = new Set(TERMINAL_DIRECTIVE_STATUSES);

function isExpired(d: TacticalDirective): boolean {
  return !!d.expiresAt && new Date(d.expiresAt).getTime() < Date.now();
}

export function useTacticalDirectives({
  matchId,
  personId,
  role,
  onNewDirective,
}: UseTacticalDirectivesOptions): UseTacticalDirectivesResult {
  const [directives, setDirectives] = useState<TacticalDirective[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncState, setSyncState] = useState<DirectiveSyncState>('SYNCING');
  const [error, setError] = useState<string | null>(null);

  const hasLoadedInitialBacklog = useRef(false);
  const onNewDirectiveRef = useRef(onNewDirective);
  onNewDirectiveRef.current = onNewDirective;

  useEffect(() => {
    if (!matchId || !personId) {
      setLoading(false);
      setDirectives([]);
      return;
    }

    setLoading(true);
    setError(null);
    setSyncState('SYNCING');
    hasLoadedInitialBacklog.current = false;

    const col = collection(db, 'matches', matchId, 'tacticalDirectives');
    const q =
      role === 'captain'
        ? query(col, where('issuedToPersonId', '==', personId), orderBy('transmittedAt', 'desc'))
        : query(col, where('issuedByPersonId', '==', personId), orderBy('transmittedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        setSyncState(snapshot.metadata.fromCache ? 'RECONNECTING' : 'LIVE');

        if (role === 'captain' && !snapshot.metadata.fromCache) {
          snapshot.docChanges().forEach((change) => {
            if (change.type !== 'added') return;
            // A cached snapshot metadata check above already filters offline
            // writes; this guard specifically stops the entire opening
            // backlog from firing a "new directive" ping the instant the
            // captain opens the app mid-match.
            if (!hasLoadedInitialBacklog.current) return;
            const directive = { id: change.doc.id, ...change.doc.data() } as TacticalDirective;
            if (isExpired(directive) || TERMINAL.has(directive.status)) return;
            onNewDirectiveRef.current?.(directive);
            void acknowledgeDirectiveReceiptAction(matchId, directive.id, personId, 'DEVICE_RECEIVED');
          });
        }

        setDirectives(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as TacticalDirective)));
        setLoading(false);
        hasLoadedInitialBacklog.current = true;
      },
      (err) => {
        console.error('useTacticalDirectives subscription error:', err);
        setError(err.message);
        setSyncState('OFFLINE');
        setLoading(false);
      }
    );

    // No scheduled Cloud Function exists in this project yet to expire
    // directives server-side on a timer, so the expiry sweep is lazy —
    // triggered on mount and every 30s while either cockpit is open.
    void sweepExpiredDirectivesAction(matchId);
    const sweepInterval = setInterval(() => {
      void sweepExpiredDirectivesAction(matchId);
    }, 30_000);

    return () => {
      unsubscribe();
      clearInterval(sweepInterval);
    };
  }, [matchId, personId, role]);

  useEffect(() => {
    const handleOffline = () => setSyncState('OFFLINE');
    const handleOnline = () => setSyncState((s) => (s === 'OFFLINE' ? 'SYNCING' : s));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const activeDirectives = directives.filter((d) => !isExpired(d) && !TERMINAL.has(d.status));

  return { directives, activeDirectives, loading, error, syncState };
}
