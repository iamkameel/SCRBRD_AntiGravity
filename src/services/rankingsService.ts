import { baseService } from './baseService';
import { Rankings, Match, Team, Person } from '../types/firestore';
import { UUID } from '../types/schema_v4';
import { ImpactEngine, ImpactInningsContext } from './impact/ImpactEngine';
import { where } from 'firebase/firestore';

/**
 * RankingsService
 * Implements the SCRBRD Global Rankings System (TRS & PPR).
 * Handles calculation, persistence and retrieval of ranking snapshots.
 */
export const rankingsService = {
    COLLECTION_SNAPSHOTS: 'ranking_snapshots',
    COLLECTION_COMPONENTS: 'ranking_components',
    COLLECTION_IMPACT: 'player_match_impacts',

    /**
     * Calculates and saves a Ranking Snapshot for an entity.
     */
    async updateEntityRanking(
        entityType: Rankings.EntityType,
        entityId: UUID,
        rankingType: Rankings.RankingType,
        context: {
            seasonId?: UUID;
            competitionId?: UUID;
            format?: string;
        }
    ): Promise<UUID> {
        // 1. Calculate the score based on type
        let score = 0;
        let components: Omit<Rankings.RankingComponent, 'id' | 'rankingSnapshotId'>[] = [];

        if (rankingType === 'TeamRank') {
            const trsResult = await this.calculateTRS(entityId, context);
            score = trsResult.score;
            components = trsResult.components;
        } else if (rankingType === 'PlayerPower') {
            const pprResult = await this.calculatePPR(entityId, context);
            score = pprResult.score;
            components = pprResult.components;
        }

        // 2. Create the snapshot
        const snapshotId = crypto.randomUUID() as UUID;
        const snapshot: Rankings.RankingSnapshot = {
            id: snapshotId,
            entityType,
            entityId,
            rankingType,
            score,
            rank: 0, // Placeholder, usually requires a global re-rank
            confidence: 0.85, // Sample size based
            computedAt: new Date().toISOString(),
            ...context
        };

        await baseService.set(this.COLLECTION_SNAPSHOTS, snapshotId, snapshot);

        // 3. Save components for drill-down
        for (const comp of components) {
            const compId = crypto.randomUUID() as UUID;
            await baseService.set(this.COLLECTION_COMPONENTS, compId, {
                ...comp,
                id: compId,
                rankingSnapshotId: snapshotId
            });
        }

        return snapshotId;
    },

    /**
     * TRS (Team Ranking Score) Calculation.
     * Logic: (Win % * 50) + (Strength of Schedule * 30) + (Recent Form * 20)
     */
    async calculateTRS(teamId: UUID, context: { seasonId?: UUID }) {
        // 1. Fetch matches for the team in the season
        const matches = await baseService.getAll<Match>('matches', {
            constraints: [
                where('seasonId', '==', context.seasonId),
                where('state', '==', 'COMPLETED')
            ]
        });

        const teamMatches = matches.filter(m => m.homeTeamId === teamId || m.awayTeamId === teamId);

        if (teamMatches.length === 0) {
            return {
                score: 50.0, // Baseline for new teams
                components: [
                    { componentName: 'Win Percentage', rawValue: 0, normalisedValue: 50, weight: 0.5, contribution: 25 },
                    { componentName: 'Strength of Schedule', rawValue: 50, normalisedValue: 50, weight: 0.3, contribution: 15 },
                    { componentName: 'Recent Form', rawValue: 50, normalisedValue: 50, weight: 0.2, contribution: 10 }
                ]
            };
        }

        // 2. Calculate Win %
        const wins = teamMatches.filter(m => (m.completion?.winner === 'home' && m.homeTeamId === teamId) || (m.completion?.winner === 'away' && m.awayTeamId === teamId)).length;
        const winPercent = (wins / teamMatches.length) * 100;

        // 3. Mock SOS and Form for now (would be recursive TRS lookups)
        const sos = 60.0;
        const recentForm = 55.0;

        const score = (winPercent * 0.5) + (sos * 0.3) + (recentForm * 0.2);

        return {
            score,
            components: [
                { componentName: 'Win Percentage', rawValue: wins / teamMatches.length, normalisedValue: winPercent, weight: 0.5, contribution: winPercent * 0.5 },
                { componentName: 'Strength of Schedule', rawValue: sos, normalisedValue: sos, weight: 0.3, contribution: sos * 0.3 },
                { componentName: 'Recent Form', rawValue: recentForm, normalisedValue: recentForm, weight: 0.2, contribution: recentForm * 0.2 }
            ]
        };
    },

    /**
     * PPR (Player Power Rating) Calculation.
     * Logic: Aggregates Match Impact Events over the season.
     */
    async calculatePPR(personId: UUID, context: { seasonId?: UUID }) {
        // 1. Fetch player impact records
        const impacts = await baseService.getAll<Rankings.PlayerMatchImpact>(this.COLLECTION_IMPACT, {
            constraints: [
                where('personId', '==', personId),
                where('seasonId', '==', context.seasonId)
            ]
        });

        if (impacts.length === 0) {
            return { score: 40.0, components: [] };
        }

        // 2. Aggregate Impacts
        const totalBatting = impacts.reduce((sum, i) => sum + (i.battingImpact || 0), 0);
        const totalBowling = impacts.reduce((sum, i) => sum + (i.bowlingImpact || 0), 0);
        const totalClutch = impacts.reduce((sum, i) => sum + (i.clutchImpact || 0), 0);

        const avgBatting = totalBatting / impacts.length;
        const avgBowling = totalBowling / impacts.length;
        const avgClutch = totalClutch / impacts.length;

        // 3. Weighting (Custom PPR formula)
        const score = (avgBatting * 0.4) + (avgBowling * 0.4) + (avgClutch * 0.2);

        return {
            score,
            components: [
                { componentName: 'Batting Impact', rawValue: totalBatting, normalisedValue: avgBatting, weight: 0.4, contribution: avgBatting * 0.4 },
                { componentName: 'Bowling Impact', rawValue: totalBowling, normalisedValue: avgBowling, weight: 0.4, contribution: avgBowling * 0.4 },
                { componentName: 'Clutch Performance', rawValue: totalClutch, normalisedValue: avgClutch, weight: 0.2, contribution: avgClutch * 0.2 }
            ]
        };
    },

    /**
     * Record a player's impact for a match.
     */
    async recordMatchImpact(impact: Omit<Rankings.PlayerMatchImpact, 'id' | 'createdAt'>): Promise<UUID> {
        const id = crypto.randomUUID() as UUID;
        const record: Rankings.PlayerMatchImpact = {
            ...impact,
            id,
            createdAt: new Date().toISOString()
        };
        await baseService.set(this.COLLECTION_IMPACT, id, record);
        return id;
    },

    /**
     * Gets the latest rankings for a specific category and season.
     */
    async getRankings(options: {
        entityType: Rankings.EntityType;
        rankingType: Rankings.RankingType;
        seasonId?: UUID;
        limit?: number;
    }): Promise<Rankings.RankingSnapshot[]> {
        return baseService.getAll<Rankings.RankingSnapshot>(this.COLLECTION_SNAPSHOTS, {
            constraints: [
                // Simplified constraints
            ],
            orderByField: 'score',
            orderDirection: 'desc',
            limitCount: options.limit || 50
        });
    }
};
