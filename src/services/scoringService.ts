import { baseService, FetchOptions } from './baseService';
import { ScoringAction, Match, LiveScoreProjection, Rankings } from '@/types/firestore';
import { where, orderBy, query, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ImpactEngine, ImpactInningsContext } from './impact/ImpactEngine';
import { ImpactAttributor } from './impact/ImpactAttributor';
import { matchService } from './matchService';
import { UUID } from '@/types/schema_v4';

const COLLECTION_NAME = 'matches';

export const scoringService = {
    /**
     * Get all scoring actions for a match
     */
    async getMatchActions(matchId: string): Promise<ScoringAction[]> {
        const subCollection = `${COLLECTION_NAME}/${matchId}/scoring_actions`;
        return baseService.getAll<any>(subCollection, {
            orderByField: 'timestamp',
            orderDirection: 'asc'
        });
    },

    /**
     * Add a new scoring action and calculate its impact.
     */
    async addAction(matchId: string, action: Omit<ScoringAction, 'id'>): Promise<string> {
        const subCollection = `${COLLECTION_NAME}/${matchId}/scoring_actions`;

        // 1. Save the primary scoring action
        const actionId = await baseService.create(subCollection, action);

        // 2. Calculate and save Match Impact (Asynchronous / Non-blocking)
        this.processImpactForAction(matchId, { ...action, id: actionId } as ScoringAction).catch(err => {
            console.error('Impact processing failed:', err);
        });

        return actionId;
    },

    /**
     * Internal helper to handle the Rankings & Impact logic.
     */
    async processImpactForAction(matchId: string, action: ScoringAction) {
        if (action.eventType !== 'BALL' && action.eventType !== undefined) return;

        // 1. Fetch Context
        const [match, liveScore] = await Promise.all([
            matchService.getOne(matchId),
            matchService.getLiveScore(matchId)
        ]);

        if (!match || !liveScore) return;

        // 2. Prepare Innings Context for Impact Engine
        const inningsContext: ImpactInningsContext = {
            runs: liveScore.currentInnings.runs,
            wickets: liveScore.currentInnings.wickets,
            balls: liveScore.currentInnings.balls,
            inningsNumber: liveScore.inningsNumber as 1 | 2,
            target: liveScore.currentInnings.target,
            maxOvers: 20, // Should come from match config
            format: 'T20', // Should come from match config
            oppositionStrength: 60, // Mock: would fetch from RankingsService
            averageStrength: 50
        };

        // 3. Calculate Impact
        const impactEvent = ImpactEngine.calculateBallImpact(action, inningsContext, match);

        // 4. Attribute Impact to Players
        const attributions = ImpactAttributor.attributeImpact(impactEvent, action);

        // 5. Persist to Firestore (Layer 14 Collections)
        await baseService.set('match_impact_events', impactEvent.id, impactEvent);

        for (const attr of attributions) {
            const attrPath = `match_impact_events/${impactEvent.id}/attributions`;
            await baseService.set(attrPath, attr.id, attr);
        }
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
     * Calculate Total Rating Score (TRS) for an entity in a given season.
     * This is a placeholder for actual TRS calculation logic.
     */
    calculateTRS(entityId: string, seasonId: string): number {
        // Placeholder for actual TRS calculation logic
        // This would typically involve querying impact events, attributions,
        // and applying a specific algorithm to derive a score.
        console.log(`Calculating TRS for entity ${entityId} in season ${seasonId}`);
        return 0; // Return a default or calculated value
    },

    /**
     * Subscribe to match scoring actions
     */
    subscribeToActions(matchId: string, onNext: (actions: ScoringAction[]) => void) {
        const subCollection = `${COLLECTION_NAME}/${matchId}/scoring_actions`;
        return baseService.subscribeToAll<any>(
            subCollection,
            { orderByField: 'timestamp', orderDirection: 'asc' },
            onNext
        );
    }
};

