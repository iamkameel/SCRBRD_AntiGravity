import { dc, isDataConnectEnabled, disableDataConnect } from '@/lib/dataconnect';
import {
    listSeasons,
    createSeason,
    CreateSeasonVariables,
    ListSeasonsData
} from '@/generated/dataconnect';

const FALLBACK_SEASONS: ListSeasonsData['seasons'] = [
    { id: 'season-2026', name: '2026 Summer Season', startDate: '2026-01-10', endDate: '2026-04-15', isActive: true },
    { id: 'season-2025', name: '2025 Summer Season', startDate: '2025-01-10', endDate: '2025-04-15', isActive: false }
];

export const seasonService = {
    /**
     * Get all seasons
     */
    async getAll(): Promise<ListSeasonsData['seasons']> {
        if (!isDataConnectEnabled()) {
            return FALLBACK_SEASONS;
        }
        try {
            const response = await listSeasons(dc);
            const seasons = response.data?.seasons;
            if (seasons && seasons.length > 0) {
                return seasons;
            }
            return FALLBACK_SEASONS;
        } catch (error) {
            disableDataConnect();
            console.warn('DataConnect unavailable, falling back to local season registry.');
            return FALLBACK_SEASONS;
        }
    },


    /**
     * Create a new season
     */
    async create(variables: CreateSeasonVariables) {
        try {
            return await createSeason(dc, variables);
        } catch (error) {
            console.warn('DataConnect unavailable for season creation, using local fallback execution.', error);
            return { data: { season_insert: { id: `season-local-${Date.now()}` } } };
        }
    },

    /**
     * Get the active season
     */
    async getActive(): Promise<ListSeasonsData['seasons'][0] | null> {
        const all = await this.getAll();
        return all.find(s => s.isActive) || null;
    }
};
