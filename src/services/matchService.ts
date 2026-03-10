import { baseService, FetchOptions } from './baseService';
import { Match, LiveScoreProjection } from '@/types/firestore';
import { where, Timestamp } from 'firebase/firestore';

const COLLECTION_NAME = 'matches';

export const matchService = {
    /**
     * Get match by ID
     */
    async getOne(id: string): Promise<Match | null> {
        return baseService.getOne<Match>(COLLECTION_NAME, id);
    },

    /**
     * Get live matches
     */
    async getLiveMatches(): Promise<Match[]> {
        return baseService.getAll<Match>(COLLECTION_NAME, {
            constraints: [where('state', '==', 'LIVE')]
        });
    },

    /**
     * Get upcoming matches
     */
    async getUpcomingMatches(limit = 10): Promise<Match[]> {
        return baseService.getAll<Match>(COLLECTION_NAME, {
            constraints: [
                where('state', 'in', ['SCHEDULED', 'TEAM_SELECTION', 'PRE_MATCH']),
                where('matchDate', '>=', Timestamp.now())
            ],
            orderByField: 'matchDate',
            orderDirection: 'asc',
            limitCount: limit
        });
    },

    /**
     * Update match state/details
     */
    async update(id: string, data: Partial<Match>): Promise<void> {
        return baseService.update(COLLECTION_NAME, id, data);
    },

    /**
     * Get live score projection for a match
     * Collection: /matches/{matchId}/live/score
     */
    async getLiveScore(matchId: string): Promise<LiveScoreProjection | null> {
        return baseService.getOne<LiveScoreProjection>(`${COLLECTION_NAME}/${matchId}/live`, 'score');
    },

    /**
     * Subscribe to match updates
     */
    subscribeToOne(id: string, onNext: (data: Match | null) => void) {
        return baseService.subscribeToOne<Match>(COLLECTION_NAME, id, onNext);
    },

    /**
     * Subscribe to live score updates
     */
    subscribeToLiveScore(matchId: string, onNext: (data: LiveScoreProjection | null) => void) {
        return baseService.subscribeToOne<LiveScoreProjection>(
            `${COLLECTION_NAME}/${matchId}/live`,
            'score',
            onNext
        );
    }
};
