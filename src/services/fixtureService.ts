import { dc } from '@/lib/dataconnect';
import {
    listFixtures,
    ListFixturesData
} from '@/generated/dataconnect';

/**
 * Service for Fixture management using Firebase Data Connect (PostgreSQL).
 */
const FALLBACK_FIXTURES: ListFixturesData['fixtures'] = [
    {
        id: 'fix-1',
        scheduledStartAt: '2026-09-12T09:30:00Z',
        homeTeam: { name: 'Hilton College 1st XI' },
        awayTeam: { name: 'Michaelhouse 1st XI' },
        venue: { name: 'Gilfillan Oval' },
        status: 'SCHEDULED'
    },
    {
        id: 'fix-2',
        scheduledStartAt: '2026-09-12T10:00:00Z',
        homeTeam: { name: 'Maritzburg College 1st XI' },
        awayTeam: { name: 'St Charles College 1st XI' },
        venue: { name: 'Goldstones Oval' },
        status: 'LIVE'
    }
];

export const fixtureService = {
    /**
     * Get all fixtures
     */
    async getAll(): Promise<ListFixturesData['fixtures']> {
        try {
            const response = await listFixtures(dc);
            const fixtures = response.data?.fixtures;
            if (fixtures && fixtures.length > 0) {
                return fixtures;
            }
            return FALLBACK_FIXTURES;
        } catch (error) {
            console.warn('DataConnect unavailable, falling back to local fixture registry.');
            return FALLBACK_FIXTURES;
        }
    },

    /**
     * Get fixtures for a specific organisation (school)
     */
    async getByOrganisation(schoolId: string): Promise<ListFixturesData['fixtures']> {
        // Current listFixtures query doesn't take variables, so we filter locally
        // In production, we would update the GQL query
        const all = await this.getAll();
        return all.filter(f => {
            const homeOrgId = (f.homeTeam as any).organisation?.id;
            const awayOrgId = (f.awayTeam as any).organisation?.id;
            return homeOrgId === schoolId || awayOrgId === schoolId;
        });
    }
};
