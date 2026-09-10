/**
 * SCRBRD Multi-Scorer Session Lock & Handover Service
 * ===================================================
 * Manages single-active-scorer session locking on live matches via Firestore
 * transactions to prevent concurrent ball-entry collisions and provide real-time
 * scorer handover protocols.
 */

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    serverTimestamp,
    runTransaction,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ScoringSessionLock {
    matchId: string;
    activeScorerId: string;
    activeScorerName: string;
    lockedAt: Timestamp | string | null;
    lastHeartbeatAt: Timestamp | string | null;
    handoverRequestedBy?: string;
    handoverRequestedName?: string;
    handoverStatus?: 'none' | 'requested' | 'accepted' | 'declined';
    version: number;
}

const LOCK_TIMEOUT_SECONDS = 60; // 60 seconds of missed heartbeats = lock expires

export const sessionLockService = {
    /**
     * Attempts to acquire the scoring lock for a match atomically.
     */
    async acquireLock(
        matchId: string,
        scorerId: string,
        scorerName: string
    ): Promise<{ success: boolean; lock?: ScoringSessionLock; message?: string }> {
        const lockRef = doc(db, 'match_scoring_locks', matchId);

        try {
            return await runTransaction(db, async (transaction) => {
                const lockDoc = await transaction.get(lockRef);

                if (lockDoc.exists()) {
                    const data = lockDoc.data() as ScoringSessionLock;
                    const lastBeat = data.lastHeartbeatAt
                        ? (data.lastHeartbeatAt instanceof Timestamp
                            ? data.lastHeartbeatAt.toDate().getTime()
                            : new Date(data.lastHeartbeatAt).getTime())
                        : 0;

                    const now = Date.now();
                    const isExpired = (now - lastBeat) > (LOCK_TIMEOUT_SECONDS * 1000);

                    // If currently locked by someone else and not expired
                    if (data.activeScorerId !== scorerId && !isExpired) {
                        return {
                            success: false,
                            lock: data,
                            message: `Match is currently being scored by ${data.activeScorerName}.`
                        };
                    }
                }

                // Acquire or renew lock
                const newLock: Partial<ScoringSessionLock> = {
                    matchId,
                    activeScorerId: scorerId,
                    activeScorerName: scorerName,
                    lockedAt: serverTimestamp() as any,
                    lastHeartbeatAt: serverTimestamp() as any,
                    handoverStatus: 'none',
                    version: ((lockDoc.exists() ? lockDoc.data().version : 0) || 0) + 1
                };

                transaction.set(lockRef, newLock, { merge: true });

                return {
                    success: true,
                    lock: {
                        matchId,
                        activeScorerId: scorerId,
                        activeScorerName: scorerName,
                        lockedAt: new Date().toISOString(),
                        lastHeartbeatAt: new Date().toISOString(),
                        handoverStatus: 'none',
                        version: ((lockDoc.exists() ? lockDoc.data().version : 0) || 0) + 1
                    }
                };
            });
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Failed to acquire session lock.'
            };
        }
    },

    /**
     * Sends periodic heartbeat to maintain lock ownership.
     */
    async sendHeartbeat(matchId: string, scorerId: string): Promise<boolean> {
        const lockRef = doc(db, 'match_scoring_locks', matchId);
        try {
            const snap = await getDoc(lockRef);
            if (!snap.exists()) return false;
            const data = snap.data() as ScoringSessionLock;
            if (data.activeScorerId !== scorerId) return false;

            await updateDoc(lockRef, {
                lastHeartbeatAt: serverTimestamp()
            });
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Requests a scorer handover from another user.
     */
    async requestHandover(matchId: string, requesterId: string, requesterName: string): Promise<boolean> {
        const lockRef = doc(db, 'match_scoring_locks', matchId);
        try {
            await updateDoc(lockRef, {
                handoverRequestedBy: requesterId,
                handoverRequestedName: requesterName,
                handoverStatus: 'requested'
            });
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Responds to a pending handover request.
     */
    async respondToHandover(
        matchId: string,
        currentScorerId: string,
        accept: boolean
    ): Promise<boolean> {
        const lockRef = doc(db, 'match_scoring_locks', matchId);
        try {
            return await runTransaction(db, async (transaction) => {
                const snap = await transaction.get(lockRef);
                if (!snap.exists()) return false;

                const data = snap.data() as ScoringSessionLock;
                if (data.activeScorerId !== currentScorerId) return false;

                if (accept && data.handoverRequestedBy && data.handoverRequestedName) {
                    transaction.update(lockRef, {
                        activeScorerId: data.handoverRequestedBy,
                        activeScorerName: data.handoverRequestedName,
                        handoverRequestedBy: null,
                        handoverRequestedName: null,
                        handoverStatus: 'accepted',
                        lockedAt: serverTimestamp(),
                        lastHeartbeatAt: serverTimestamp(),
                        version: data.version + 1
                    });
                } else {
                    transaction.update(lockRef, {
                        handoverStatus: 'declined',
                        handoverRequestedBy: null,
                        handoverRequestedName: null
                    });
                }
                return true;
            });
        } catch {
            return false;
        }
    },

    /**
     * Releases lock when scorer explicitly exits scoring mode.
     */
    async releaseLock(matchId: string, scorerId: string): Promise<boolean> {
        const lockRef = doc(db, 'match_scoring_locks', matchId);
        try {
            const snap = await getDoc(lockRef);
            if (snap.exists() && snap.data().activeScorerId === scorerId) {
                await deleteDoc(lockRef);
            }
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Listens to real-time session lock changes.
     */
    subscribeToLock(matchId: string, callback: (lock: ScoringSessionLock | null) => void): () => void {
        const lockRef = doc(db, 'match_scoring_locks', matchId);
        return onSnapshot(lockRef, (snap) => {
            if (snap.exists()) {
                callback(snap.data() as ScoringSessionLock);
            } else {
                callback(null);
            }
        });
    }
};
