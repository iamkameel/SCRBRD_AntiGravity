import { dc } from '@/lib/dataconnect';
import {
    listSeasons,
    createSeason,
    CreateSeasonVariables,
    ListSeasonsData
} from '@/generated/dataconnect';

export const seasonService = {
    /**
     * Get all seasons
     */
    async getAll(): Promise<ListSeasonsData['seasons']> {
        const response = await listSeasons(dc);
        return response.data.seasons;
    },

    /**
     * Create a new season
     */
    async create(variables: CreateSeasonVariables) {
        return createSeason(dc, variables);
    },

    /**
     * Get the active season
     */
    async getActive(): Promise<ListSeasonsData['seasons'][0] | null> {
        const all = await this.getAll();
        return all.find(s => s.isActive) || null;
    }
};
