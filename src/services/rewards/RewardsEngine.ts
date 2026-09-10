import { ScoringAction } from '../../types/scoring';
import { ImpactEngine } from '../impact/ImpactEngine';
import { Match } from '../../types/firestore';
import { TransactionType } from '../../types/rewards';
import admin from '../../lib/firebase-admin';

/**
 * Layer 1: Event Points (Base Economy)
 */
export const POINTS_ECONOMY = {
    BATTING: {
        RUN_OFF_BAT: 1,
        BOUNDARY_FOUR: 5,
        BOUNDARY_SIX: 10,
        MILESTONE_25: 25,
        MILESTONE_50: 50,
        MILESTONE_100: 150,
        STRIKE_RATE_150_PLUS: 20, // Min 10 balls
    },
    BOWLING: {
        WICKET: 50,
        DOT_BALL: 2,
        MAIDEN_OVER: 30,
        THREE_WICKET_HAUL: 75,
        FIVE_WICKET_HAUL: 200,
        ECONOMY_UNDER_6: 25, // For T20/Limited Overs
    },
    FIELDING: {
        CATCH: 20,
        STUMPING: 25,
        RUN_OUT_DIRECT: 40,
        RUN_OUT_ASSISTED: 20,
    }
};

/**
 * SCRBRD Rewards Engine
 * Implementation of the Rewards Framework Layer 1-4.
 */
export class RewardsEngine {

    /**
     * Processes rewards for a single ball event.
     * Returns a list of transactions to be applied.
     */
    static async processBallRewards(
        ball: ScoringAction,
        projection: any, // InningsProjection
        match: Match
    ): Promise<Array<any>> {
        const transactions: Array<any> = [];

        // 1. Batting Rewards (Striker)
        if (ball.runsOffBat > 0) {
            const battingPoints = this.calculateBattingPoints(ball);
            if (battingPoints > 0) {
                transactions.push({
                    playerId: ball.strikerId,
                    amount: battingPoints,
                    type: 'Earned',
                    description: `Batting: ${ball.runsOffBat} runs`,
                    metadata: { type: 'batting', runs: ball.runsOffBat }
                });
            }
        }

        // 2. Bowling Rewards (Bowler)
        if (ball.isLegalDelivery) {
            const bowlingPoints = this.calculateBowlingPoints(ball);
            if (bowlingPoints > 0) {
                transactions.push({
                    playerId: ball.bowlerId,
                    amount: bowlingPoints,
                    type: 'Earned',
                    description: ball.isWicket ? `Bowling: Wicket` : `Bowling: Dot Ball`,
                    metadata: { type: 'bowling', isWicket: ball.isWicket, totalRuns: ball.totalRuns }
                });
            }
        }

        // 3. Fielding Rewards (Fielders)
        if (ball.isWicket && ball.wicket?.fielderIds) {
            for (const fielderId of ball.wicket.fielderIds) {
                const fieldingPoints = this.calculateFieldingPoints(ball, fielderId);
                if (fieldingPoints > 0) {
                    transactions.push({
                        playerId: fielderId,
                        amount: fieldingPoints,
                        type: 'Earned',
                        description: `Fielding: ${ball.wicket.type}`,
                        metadata: { type: 'fielding', wicketType: ball.wicket.type }
                    });
                }
            }
        }

        // 4. Multiplier Application (Layer 2)
        // We integrate with ImpactEngine to get contextual multipliers
        const impactContext = {
            runs: projection.currentInnings.runs,
            wickets: projection.currentInnings.wickets,
            balls: projection.currentInnings.balls,
            inningsNumber: ball.inningsNumber,
            target: (projection.currentInnings as any).target,
            maxOvers: match.overs,
        };

        // Calculate multipliers based on impact
        for (const tx of transactions) {
            const multiplier = this.calculateRewardMultiplier(ball, impactContext, match);
            tx.amount = Math.round(tx.amount * multiplier);
            tx.metadata = { ...tx.metadata, multiplier };
        }

        return transactions;
    }

    private static calculateBattingPoints(ball: ScoringAction): number {
        let points = ball.runsOffBat * POINTS_ECONOMY.BATTING.RUN_OFF_BAT;

        if (ball.runsOffBat === 4) points += POINTS_ECONOMY.BATTING.BOUNDARY_FOUR;
        if (ball.runsOffBat === 6) points += POINTS_ECONOMY.BATTING.BOUNDARY_SIX;

        return points;
    }

    private static calculateBowlingPoints(ball: ScoringAction): number {
        let points = 0;

        if (ball.isWicket && ball.wicket?.type !== 'run_out') {
            points += POINTS_ECONOMY.BOWLING.WICKET;
        }

        if (ball.totalRuns === 0 && !ball.isWicket) {
            points += POINTS_ECONOMY.BOWLING.DOT_BALL;
        }

        return points;
    }

    private static calculateFieldingPoints(ball: ScoringAction, fielderId: string): number {
        if (!ball.wicket) return 0;

        switch (ball.wicket.type) {
            case 'caught':
                return POINTS_ECONOMY.FIELDING.CATCH;
            case 'stumped':
                return POINTS_ECONOMY.FIELDING.STUMPING;
            case 'run_out':
                // If there are multiple fielders, primary fielder (striker of the ball at stumps) gets more points?
                // Framework says: Direct 40, Assisted 20.
                const isAssisted = (ball.wicket.fielderIds?.length || 0) > 1;
                return isAssisted ? POINTS_ECONOMY.FIELDING.RUN_OUT_ASSISTED : POINTS_ECONOMY.FIELDING.RUN_OUT_DIRECT;
            default:
                return 0;
        }
    }

    private static calculateRewardMultiplier(
        ball: ScoringAction,
        context: any,
        match: Match
    ): number {
        // Basic contextual multiplier based on match state
        // We can use the ImpactEngine's pressure labels or multipliers
        // For now, let's keep it simple and grow it.

        let multiplier = 1.0;

        // High Pressure Situations (derived from framework)
        // e.g. Final over of a chase, or critical wickets
        if (context.inningsNumber === 2 && context.target) {
            const ballsRemaining = (match.overs || 20) * 6 - context.balls;
            const runsNeeded = context.target - context.runs;

            if (ballsRemaining < 12 && runsNeeded > 0) {
                multiplier += 0.5; // Pressure Multiplier
            }
        }

        // Opposition Strength (if available)
        // This would ideally come from the match's school collection (TRS points)

        return multiplier;
    }

    /**
     * Processes end-of-innings milestones and bonuses.
     */
    static async processMilestoneRewards(
        playerId: string,
        stats: any, // BatsmanProjection or BowlerProjection
        type: 'batting' | 'bowling'
    ): Promise<Array<any>> {
        const transactions: Array<any> = [];

        if (type === 'batting') {
            const runs = stats.runs;
            if (runs >= 100) {
                transactions.push({
                    playerId,
                    amount: POINTS_ECONOMY.BATTING.MILESTONE_100,
                    description: 'Milestone: Century (100 runs)',
                    type: 'Bonus'
                });
            } else if (runs >= 50) {
                transactions.push({
                    playerId,
                    amount: POINTS_ECONOMY.BATTING.MILESTONE_50,
                    description: 'Milestone: Half-Century (50 runs)',
                    type: 'Bonus'
                });
            } else if (runs >= 25) {
                transactions.push({
                    playerId,
                    amount: POINTS_ECONOMY.BATTING.MILESTONE_25,
                    description: 'Milestone: 25 Runs',
                    type: 'Bonus'
                });
            }

            // Strike Rate Bonus
            if (stats.ballsFaced >= 10 && stats.strikeRate >= 150) {
                transactions.push({
                    playerId,
                    amount: POINTS_ECONOMY.BATTING.STRIKE_RATE_150_PLUS,
                    description: 'Performance: Strike Rate 150+',
                    type: 'Bonus'
                });
            }
        }

        if (type === 'bowling') {
            const wickets = stats.wickets;
            if (wickets >= 5) {
                transactions.push({
                    playerId,
                    amount: POINTS_ECONOMY.BOWLING.FIVE_WICKET_HAUL,
                    description: 'Milestone: 5-Wicket Haul',
                    type: 'Bonus'
                });
            } else if (wickets >= 3) {
                transactions.push({
                    playerId,
                    amount: POINTS_ECONOMY.BOWLING.THREE_WICKET_HAUL,
                    description: 'Milestone: 3-Wicket Haul',
                    type: 'Bonus'
                });
            }

            // Economy Bonus
            if (stats.ballsBowled >= 12 && stats.economy < 6.0) {
                transactions.push({
                    playerId,
                    amount: POINTS_ECONOMY.BOWLING.ECONOMY_UNDER_6,
                    description: 'Performance: Economy under 6.0',
                    type: 'Bonus'
                });
            }

            // Maiden Bonus
            if (stats.maidens > 0) {
                transactions.push({
                    playerId,
                    amount: stats.maidens * POINTS_ECONOMY.BOWLING.MAIDEN_OVER,
                    description: `Performance: ${stats.maidens} Maiden Over(s)`,
                    type: 'Bonus'
                });
            }
        }

        return transactions;
    }

    /**
     * Processes end-of-innings rewards for all participants in an innings.
     */
    static async processInningsRewards(
        projection: any, // InningsProjection
        match: Match
    ): Promise<Array<any>> {
        const allTransactions: Array<any> = [];

        // 1. Batting Milestones
        for (const batsman of projection.batsmen) {
            const milestones = await this.processMilestoneRewards(batsman.playerId, batsman, 'batting');
            allTransactions.push(...milestones);
        }

        // 2. Bowling Milestones
        for (const bowler of projection.bowlers) {
            const milestones = await this.processMilestoneRewards(bowler.playerId, bowler, 'bowling');
            allTransactions.push(...milestones);
        }

        return allTransactions;
    }

    /**
     * Layer 4: Tier Progression Logic
     */
    static calculateTier(points: number): any {
        if (points >= 10000) return 'Prodigy';
        if (points >= 5000) return 'Platinum';
        if (points >= 2500) return 'Gold';
        if (points >= 1000) return 'Silver';
        return 'Bronze';
    }

    static getNextTierThreshold(points: number): number {
        if (points >= 10000) return 10000;
        if (points >= 5000) return 10000;
        if (points >= 2500) return 5000;
        if (points >= 1000) return 2500;
        return 1000;
    }
}
