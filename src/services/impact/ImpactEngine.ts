import { ScoringAction } from '../../types/scoring';
import { Match, Rankings } from '../../types/firestore';
import { UUID } from '../../types/schema_v4';

export interface ImpactInningsContext {
    runs: number;
    wickets: number;
    balls: number;
    inningsNumber: 1 | 2;
    target?: number;
    maxOvers?: number;
    format?: 'T20' | 'ODI' | 'Test' | 'MultiDay';
    oppositionStrength?: number; // 0-100 normalized TRS of opponent
    averageStrength?: number;    // Average TRS for the league
}

/**
 * ImpactEngine V2
 * Advanced service for calculating "Consequence" and "Pressure" in School Cricket.
 * Implements "Moneyball for Schools" principles including Opposition Multipliers 
 * and Match State Swing Adjustments.
 */
export class ImpactEngine {

    /**
     * Calculates the full impact of a ball based on event outcome and match context.
     */
    static calculateBallImpact(
        ball: ScoringAction,
        innings: ImpactInningsContext,
        match: Match
    ): Rankings.MatchImpactEvent {
        const baseValue = this.calculateBaseImpact(ball);
        const pressureMult = this.getPressureMultiplier(ball, innings, match);
        const oppositionMult = this.getOppositionMultiplier(innings);
        const phase = this.getMatchPhase(ball, innings);
        const swingAdj = this.calculateSwingAdjustment(ball, innings);

        // Final calculation: (Base * Pressure * Opposition) + Swing
        const totalImpact = (baseValue * pressureMult * oppositionMult) + swingAdj;

        return {
            id: crypto.randomUUID() as UUID,
            fixtureId: match.id as UUID,
            inningsId: innings.inningsNumber.toString() as UUID,
            ballEventId: ball.id as UUID,
            overNumber: ball.overNumber,
            ballNumber: ball.ballInOver,
            eventType: ball.isWicket ? 'Wicket' : (ball.runsOffBat > 0 ? 'Runs' : 'Dot'),
            phase,
            pressureState: this.getPressureLabel(pressureMult, innings),
            baseImpactValue: baseValue,
            contextMultiplier: 1.0, 
            pressureMultiplier: pressureMult,
            oppositionMultiplier: oppositionMult,
            swingAdjustment: swingAdj,
            totalImpactValue: totalImpact,
            battingTeamImpact: (ball.totalRuns > 0 || (ball.isLegalDelivery && ball.totalRuns === 0)) ? totalImpact : 0,
            bowlingTeamImpact: (ball.isWicket || (ball.isLegalDelivery && ball.totalRuns === 0)) ? totalImpact : 0,
            createdAt: new Date().toISOString()
        };
    }

    /**
     * Assigns raw points based on the outcome of the delivery.
     */
    private static calculateBaseImpact(ball: ScoringAction): number {
        let impact = 0;

        // 1. Runs
        impact += ball.runsOffBat * 1.0;

        // 2. Boundaries (Bonus)
        if (ball.runsOffBat === 4 || ball.runsOffBat === 6) {
            impact += (ball.runsOffBat === 6 ? 4.0 : 2.0); // Increased weighting for boundaries in V2
        }

        // 3. Wickets (High Value)
        if (ball.isWicket) {
            impact += 30.0; // Base value for a wicket increased from 25
        }

        // 4. Dot Balls (Pressure for bowlers)
        if (ball.totalRuns === 0 && ball.isLegalDelivery && !ball.isWicket) {
            impact += 1.0; // Increased from 0.5 to reward tight bowling
        }

        // 5. Extras (Negative impact for bowlers)
        if (ball.extras.wide > 0 || ball.extras.noBall > 0) {
            impact -= 2.0; // Doubled penalty for extras
        }

        return impact;
    }

    /**
     * Opposition Quality Adjustment.
     * Rewards performance against stronger opponents.
     */
    private static getOppositionMultiplier(innings: ImpactInningsContext): number {
        if (!innings.oppositionStrength || !innings.averageStrength) return 1.0;
        
        // Ratio of opponent strength to average. 
        // e.g., if playing top-tier team (80 TRS) vs avg (50 TRS), mult = 1.6
        return innings.oppositionStrength / innings.averageStrength;
    }

    /**
     * Expected Match State Delta (EMSD).
     * Measures how much the probability of winning changed due to this ball.
     * Placeholder calculation based on runs/wickets vs par.
     */
    private static calculateSwingAdjustment(ball: ScoringAction, innings: ImpactInningsContext): number {
        // Simplified Logic: 
        // Wickets in death overs have high swing.
        // Boundaries when RR > ReqRR have high swing.
        let swing = 0;
        
        if (ball.isWicket) {
            swing += 5.0; // Positive swing for bowling team
        }
        
        if (ball.runsOffBat >= 4) {
            swing += 3.0; // Positive swing for batting team
        }

        return swing;
    }

    /**
     * Determines pressure based on match state.
     */
    private static getPressureMultiplier(ball: ScoringAction, innings: ImpactInningsContext, match: Match): number {
        let multiplier = 1.0;
        const maxOvers = innings.maxOvers || 20;
        const totalBalls = maxOvers * 6;

        // Stage 1: Wickets fallen vs Overs (Collapse Pressure)
        const wicketRatio = innings.wickets / 10;
        const overRatio = innings.balls / totalBalls;

        if (wicketRatio > overRatio + 0.15) {
            multiplier += 0.4; // Collapse pressure
        }

        // Stage 2: Chase Pressure (2nd Innings)
        if (innings.inningsNumber === 2 && innings.target) {
            const runsNeeded = innings.target - innings.runs;
            const ballsRemaining = Math.max(0, totalBalls - innings.balls);

            if (ballsRemaining > 0) {
                const reqRR = (runsNeeded / ballsRemaining) * 6;
                if (reqRR >= 12) multiplier += 0.8;
                else if (reqRR >= 9) multiplier += 0.4;
            } else if (runsNeeded > 0) {
                multiplier += 1.5; // Final ball pressure
            }
        }

        // Stage 3: High Leverage Moments
        if (ball.isWicket && wicketRatio > 0.7) multiplier += 0.5; // Tail-ender pressure or closing the innings

        return Math.min(multiplier, 3.0); // Cap at 3.0x
    }

    private static getMatchPhase(ball: ScoringAction, innings: ImpactInningsContext): Rankings.MatchImpactEvent['phase'] {
        const over = ball.overNumber;
        const maxOvers = innings.maxOvers || 20;
        const format = innings.format || 'T20';

        if (format === 'T20' || format === 'ODI') {
            if (over < (maxOvers * 0.2)) return 'Powerplay';
            if (over > (maxOvers * 0.8)) return 'Death';
            return 'Middle';
        }

        // Multi-day phases
        if (over < 15) return 'New Ball';
        if (over > 70) return 'Tail';
        return 'Build';
    }

    private static getPressureLabel(multiplier: number, innings: ImpactInningsContext): Rankings.MatchImpactEvent['pressureState'] {
        if (innings.inningsNumber === 2 && innings.target && (innings.target - innings.runs) < 20 && ((innings.maxOvers || 20) * 6 - innings.balls) < 12) {
            return 'Chase Critical';
        }
        
        const wicketRatio = innings.wickets / 10;
        const overRatio = innings.balls / ((innings.maxOvers || 20) * 6);
        if (wicketRatio > overRatio + 0.3) return 'Collapse';

        if (multiplier > 2.2) return 'Extreme';
        if (multiplier > 1.8) return 'High';
        if (multiplier > 1.3) return 'Elevated';
        if (multiplier > 1.1) return 'Normal';
        return 'Low';
    }
}

