import { dc } from '@/lib/dataconnect';
import {
    listFixtures,
    ListFixturesData
} from '@/generated/dataconnect';

/**
 * Service for Fixture management using Firebase Data Connect (PostgreSQL).
 */
export const fixtureService = {
    /**
     * Get all fixtures
     */
    async getAll(): Promise<ListFixturesData['fixtures']> {
        try {
            const response = await listFixtures(dc);
            return response.data?.fixtures || [];
        } catch (error) {
            console.error('Error fetching fixtures:', error);
            return [];
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
