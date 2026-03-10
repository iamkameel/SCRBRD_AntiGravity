import { baseService, FetchOptions } from './baseService';
import { ScoringAction } from '@/types/firestore';
import { where, orderBy, query, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COLLECTION_NAME = 'matches';

export const scoringService = {
    /**
     * Get all scoring actions for a match
     */
    async getMatchActions(matchId: string): Promise<ScoringAction[]> {
        const subCollection = `${COLLECTION_NAME}/${matchId}/scoring_actions`;
        return baseService.getAll<ScoringAction>(subCollection, {
            orderByField: 'timestamp',
            orderDirection: 'asc'
        });
    },

    /**
     * Add a new scoring action
     */
    async addAction(matchId: string, action: Omit<ScoringAction, 'id'>): Promise<string> {
        const subCollection = `${COLLECTION_NAME}/${matchId}/scoring_actions`;
        return baseService.create(subCollection, action);
    },

    /**
     * Update a scoring action (e.g., correction)
     */
    async updateAction(matchId: string, actionId: string, data: Partial<ScoringAction>): Promise<void> {
        const subCollection = `${COLLECTION_NAME}/${matchId}/scoring_actions`;
        return baseService.update(subCollection, actionId, data);
    },

    /**
     * Delete a scoring action (e.g., undo)
     */
    async deleteAction(matchId: string, actionId: string): Promise<void> {
        const subCollection = `${COLLECTION_NAME}/${matchId}/scoring_actions`;
        return baseService.delete(subCollection, actionId);
    },

    /**
     * Subscribe to match scoring actions
     */
    subscribeToActions(matchId: string, onNext: (actions: ScoringAction[]) => void) {
        const subCollection = `${COLLECTION_NAME}/${matchId}/scoring_actions`;
        return baseService.subscribeToAll<ScoringAction>(
            subCollection,
            { orderByField: 'timestamp', orderDirection: 'asc' },
            onNext
        );
    }
};
