import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth/session', () => ({
    requireUser: vi.fn().mockResolvedValue({ uid: 'test_scout_uid', email: 'scout@scrbrd.com' }),
}));

vi.mock('@/lib/services/auditService', () => ({
    recordAuditLog: vi.fn().mockResolvedValue({ id: 'audit_123' }),
}));

const mockDocRef = { id: 'doc_123' };
const mockAdd = vi.fn().mockResolvedValue(mockDocRef);
const mockGet = vi.fn().mockResolvedValue({
    empty: true,
    docs: [],
});

vi.mock('@/lib/firebase-admin', () => {
    const mockAddFn = vi.fn().mockResolvedValue({ id: 'doc_123' });
    const mockGetFn = vi.fn().mockResolvedValue({ empty: true, docs: [] });
    const mockChainObj: any = {
        add: mockAddFn,
        where: () => mockChainObj,
        orderBy: () => mockChainObj,
        get: mockGetFn,
    };

    return {
        adminDb: {
            collection: () => mockChainObj,
        },
        mockAddFn,
        mockGetFn,
    };
});

import {
    createScoutReportAction,
    nominateProvincialCampAction,
    toggleWatchlistAction,
    getScoutingWatchlistAction
} from '@/app/actions/scoutingActions';
import { adminDb } from '@/lib/firebase-admin';

describe('Scouting Server Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('creates a scout report with verified auth session', async () => {
        const result = await createScoutReportAction({
            personId: 'athlete_1',
            personName: 'Jaxon Reed',
            roleArchetype: 'Fast Bowler',
            scoutGrade: 'A+',
            potentialScore: 'ELITE',
            metrics: { velocity: 88, accuracy: 92 },
            scoutNotes: 'High pace and late swing'
        });

        expect(result.success).toBe(true);
        expect(result.id).toBe('doc_123');
    });

    it('nominates an athlete for provincial camp', async () => {
        const result = await nominateProvincialCampAction('athlete_1', 'National Elite Camp 2026', 'Provincial Invitational');

        expect(result.success).toBe(true);
        expect(result.id).toBe('doc_123');
    });

    it('toggles scouting watchlist for an athlete', async () => {
        const result = await toggleWatchlistAction('athlete_1');
        expect(result.success).toBe(true);
        expect(result.added).toBe(true);
    });

    it('fetches watchlisted athlete IDs', async () => {
        const mockChainObj = (adminDb.collection as any)();
        mockChainObj.get = vi.fn().mockResolvedValueOnce({
            empty: false,
            docs: [{ data: () => ({ personId: 'athlete_1' }) }]
        });

        const result = await getScoutingWatchlistAction();
        expect(result.success).toBe(true);
        expect(result.watchlistIds).toEqual(['athlete_1']);
    });
});
