import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionLockBanner } from '../SessionLockBanner';
import { sessionLockService } from '@/services/scoring/sessionLock';

// Mock sessionLockService
vi.mock('@/services/scoring/sessionLock', () => {
    return {
        sessionLockService: {
            subscribeToLock: vi.fn((matchId, callback) => {
                // Default no lock
                callback(null);
                return () => {};
            }),
            acquireLock: vi.fn().mockResolvedValue({ success: true }),
            sendHeartbeat: vi.fn().mockResolvedValue({ success: true }),
            requestHandover: vi.fn().mockResolvedValue({ success: true }),
            respondToHandover: vi.fn().mockResolvedValue({ success: true }),
            releaseLock: vi.fn().mockResolvedValue({ success: true }),
        }
    };
});

describe('SessionLockBanner', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders open state when no lock exists', () => {
        render(
            <SessionLockBanner
                matchId="match-1"
                currentUserId="user-1"
                currentUserName="Scorer One"
            />
        );

        expect(screen.getByText(/No active scoring lock. Session is open./i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Acquire Scorer Lock/i })).toBeInTheDocument();
    });

    it('renders active scorer state when current user holds lock', () => {
        vi.mocked(sessionLockService.subscribeToLock).mockImplementationOnce((matchId, callback) => {
            callback({
                matchId: 'match-1',
                activeScorerId: 'user-1',
                activeScorerName: 'Scorer One',
                acquiredAt: new Date().toISOString(),
                lastHeartbeatAt: new Date().toISOString(),
                handoverStatus: 'none',
                version: 1
            });
            return () => {};
        });

        render(
            <SessionLockBanner
                matchId="match-1"
                currentUserId="user-1"
                currentUserName="Scorer One"
            />
        );

        expect(screen.getByText(/You are the/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Release Lock/i })).toBeInTheDocument();
    });

    it('renders locked by other state when another user holds lock', () => {
        const onLockStateChange = vi.fn();
        vi.mocked(sessionLockService.subscribeToLock).mockImplementationOnce((matchId, callback) => {
            callback({
                matchId: 'match-1',
                activeScorerId: 'user-2',
                activeScorerName: 'Scorer Two',
                acquiredAt: new Date().toISOString(),
                lastHeartbeatAt: new Date().toISOString(),
                handoverStatus: 'none',
                version: 1
            });
            return () => {};
        });

        render(
            <SessionLockBanner
                matchId="match-1"
                currentUserId="user-1"
                currentUserName="Scorer One"
                onLockStateChange={onLockStateChange}
            />
        );

        expect(screen.getByText(/Match locked by/i)).toBeInTheDocument();
        expect(screen.getByText(/Scorer Two/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Request Handover/i })).toBeInTheDocument();
        expect(onLockStateChange).toHaveBeenCalledWith(true);
    });
});
