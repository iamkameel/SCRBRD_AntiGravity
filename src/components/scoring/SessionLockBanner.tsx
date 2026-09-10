'use client';

import React, { useEffect, useState } from 'react';
import { Shield, Lock, Unlock, UserCheck, RefreshCw, AlertTriangle } from 'lucide-react';
import { sessionLockService, ScoringSessionLock } from '@/services/scoring/sessionLock';

interface SessionLockBannerProps {
    matchId: string;
    currentUserId: string;
    currentUserName: string;
    onLockStateChange?: (isLockedByOther: boolean) => void;
}

export function SessionLockBanner({
    matchId,
    currentUserId,
    currentUserName,
    onLockStateChange
}: SessionLockBannerProps) {
    const [lock, setLock] = useState<ScoringSessionLock | null>(null);
    const [isAcquiring, setIsAcquiring] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 1. Subscribe to lock updates
    useEffect(() => {
        const unsubscribe = sessionLockService.subscribeToLock(matchId, (updatedLock) => {
            setLock(updatedLock);
            const lockedByOther = !!(updatedLock && updatedLock.activeScorerId !== currentUserId);
            if (onLockStateChange) {
                onLockStateChange(lockedByOther);
            }
        });
        return () => unsubscribe();
    }, [matchId, currentUserId, onLockStateChange]);

    // 2. Heartbeat timer if current user holds lock
    useEffect(() => {
        if (!lock || lock.activeScorerId !== currentUserId) return;

        const interval = setInterval(() => {
            sessionLockService.sendHeartbeat(matchId, currentUserId);
        }, 20000); // Heartbeat every 20 seconds

        return () => clearInterval(interval);
    }, [lock, matchId, currentUserId]);

    const handleAcquire = async () => {
        setIsAcquiring(true);
        setErrorMsg(null);
        const res = await sessionLockService.acquireLock(matchId, currentUserId, currentUserName);
        setIsAcquiring(false);
        if (!res.success) {
            setErrorMsg(res.message || 'Could not acquire lock.');
        }
    };

    const handleRequestHandover = async () => {
        setIsAcquiring(true);
        setErrorMsg(null);
        await sessionLockService.requestHandover(matchId, currentUserId, currentUserName);
        setIsAcquiring(false);
    };

    const handleRespondHandover = async (accept: boolean) => {
        await sessionLockService.respondToHandover(matchId, currentUserId, accept);
    };

    const handleRelease = async () => {
        await sessionLockService.releaseLock(matchId, currentUserId);
    };

    const isCurrentScorer = lock?.activeScorerId === currentUserId;
    const isLockedByOther = lock && lock.activeScorerId !== currentUserId;
    const hasPendingHandoverRequest = isCurrentScorer && lock?.handoverStatus === 'requested';

    if (!lock) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-amber-400" />
                    <span>No active scoring lock. Session is open.</span>
                </div>
                <button
                    onClick={handleAcquire}
                    disabled={isAcquiring}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg flex items-center gap-1.5 transition"
                >
                    {isAcquiring ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                    Acquire Scorer Lock
                </button>
            </div>
        );
    }

    if (isCurrentScorer) {
        return (
            <div className="space-y-2">
                <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-200">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span>
                            You are the <strong>Active Official Scorer</strong> for this match.
                        </span>
                    </div>
                    <button
                        onClick={handleRelease}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-md transition"
                    >
                        Release Lock
                    </button>
                </div>

                {hasPendingHandoverRequest && (
                    <div className="bg-amber-950/80 border border-amber-600 p-3 rounded-xl flex items-center justify-between text-xs text-amber-200">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                            <span>
                                <strong>{lock.handoverRequestedName}</strong> requested scoring handover.
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleRespondHandover(true)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-md"
                            >
                                Accept & Transfer
                            </button>
                            <button
                                onClick={() => handleRespondHandover(false)}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-md"
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-red-950/60 border border-red-800/80 rounded-xl p-3 flex flex-col gap-2 text-xs text-red-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-red-400" />
                    <span>
                        Match locked by <strong>{lock.activeScorerName}</strong>. Read-only mode enabled.
                    </span>
                </div>
                {lock.handoverStatus === 'requested' && lock.handoverRequestedBy === currentUserId ? (
                    <span className="text-amber-400 font-medium flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Handover requested...
                    </span>
                ) : (
                    <button
                        onClick={handleRequestHandover}
                        disabled={isAcquiring}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg flex items-center gap-1.5 transition"
                    >
                        <UserCheck className="w-3.5 h-3.5" />
                        Request Handover
                    </button>
                )}
            </div>
            {errorMsg && <p className="text-red-400 font-medium">{errorMsg}</p>}
        </div>
    );
}
