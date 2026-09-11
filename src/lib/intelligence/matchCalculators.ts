/**
 * Advanced Match Calculators Engine
 * =================================
 * 1. DLS (Duckworth-Lewis-Stern) Standard Par & Target Calculator
 * 2. Required Run Rate & Projected Score Engine
 * 3. Over-Rate Penalty & Time Budget Engine
 * 4. Win Probability & Par Score Curve Model
 */

// DLS Standard Resource Parameters (ICC Standard Table Constants)
// R_0: Max resource percentage for w wickets lost
// b: Exponential decay factor for w wickets lost
const DLS_RESOURCE_PARAMS: Record<number, { R0: number; b: number }> = {
    0: { R0: 100.0, b: 0.0353 },
    1: { R0: 93.4, b: 0.0388 },
    2: { R0: 85.1, b: 0.0431 },
    3: { R0: 74.9, b: 0.0489 },
    4: { R0: 62.7, b: 0.0567 },
    5: { R0: 49.0, b: 0.0676 },
    6: { R0: 34.9, b: 0.0838 },
    7: { R0: 22.0, b: 0.1090 },
    8: { R0: 11.9, b: 0.1550 },
    9: { R0: 4.7, b: 0.2500 },
    10: { R0: 0.0, b: 1.0000 },
};

// G50: Standard average score in 50 overs (used for standard DLS when Team 2 resources exceed Team 1)
export const G50_DEFAULT = 245;

/**
 * Calculates remaining resource percentage R(u, w)
 * @param oversRemaining Overs available to bat (e.g., 14.2 overs = 14.333)
 * @param wicketsLost Number of wickets lost (0 to 10)
 */
export function getDLSResourcePercentage(oversRemaining: number, wicketsLost: number): number {
    const w = Math.min(10, Math.max(0, wicketsLost));
    if (w === 10 || oversRemaining <= 0) return 0.0;

    const { R0, b } = DLS_RESOURCE_PARAMS[w];
    const resource = R0 * (1 - Math.exp(-b * oversRemaining));
    return parseFloat(Math.min(100.0, Math.max(0.0, resource)).toFixed(2));
}

export interface DLSCalculationInput {
    team1OriginalOvers: number; // e.g. 20
    team1FinalScore: number;    // e.g. 160
    team1WicketsLost: number;   // e.g. 6
    team1InterruptOversLost?: number; // overs lost during 1st innings if interrupted

    team2OriginalOvers: number; // e.g. 20
    team2RevisedOvers: number;  // e.g. 14 (if reduced before or during 2nd innings)
    team2WicketsLostAtInterruption?: number; // wickets lost when rain stopped play in 2nd innings
    team2OversBowledAtInterruption?: number; // overs bowled when rain stopped play in 2nd innings
}

export interface DLSCalculationResult {
    team1Resource: number; // R1 %
    team2Resource: number; // R2 %
    revisedTarget: number; // Revised target score to win
    parScore: number;      // Par score (tied score) at interruption point
    isTeam2ResourceGreater: boolean;
    resourceDifference: number;
    explanation: string;
}

/**
 * DLS Target & Par Score Calculator
 */
export function calculateDLSTarget(input: DLSCalculationInput): DLSCalculationResult {
    const {
        team1OriginalOvers,
        team1FinalScore,
        team1WicketsLost,
        team1InterruptOversLost = 0,
        team2OriginalOvers,
        team2RevisedOvers,
        team2WicketsLostAtInterruption = 0,
        team2OversBowledAtInterruption = 0,
    } = input;

    // Team 1 total resource R1
    let R1 = getDLSResourcePercentage(team1OriginalOvers, 0);
    if (team1InterruptOversLost > 0) {
        const rLost = getDLSResourcePercentage(team1InterruptOversLost, team1WicketsLost);
        R1 -= rLost;
    }

    // Team 2 total resource R2 available
    const R2 = getDLSResourcePercentage(team2RevisedOvers, 0);

    let revisedTarget = team1FinalScore + 1;
    let isTeam2ResourceGreater = false;
    const resourceDiff = R2 - R1;

    if (R2 < R1) {
        // Target reduced proportionally
        revisedTarget = Math.floor(team1FinalScore * (R2 / R1)) + 1;
    } else if (R2 > R1) {
        // Team 2 has more resources, target increased using G50 benchmark
        isTeam2ResourceGreater = true;
        revisedTarget = Math.floor(team1FinalScore + (resourceDiff / 100) * G50_DEFAULT) + 1;
    } else {
        revisedTarget = team1FinalScore + 1;
    }

    // Calculate Par Score at current interruption point if Team 2 is batting
    const oversRemainingAtInterrupt = Math.max(0, team2RevisedOvers - team2OversBowledAtInterruption);
    const R2_at_interrupt = getDLSResourcePercentage(team2RevisedOvers, 0) - getDLSResourcePercentage(oversRemainingAtInterrupt, team2WicketsLostAtInterruption);

    let parScore = 0;
    if (R1 > 0) {
        parScore = Math.floor(team1FinalScore * (R2_at_interrupt / R1));
    }

    const explanation = R2 < R1
        ? `Team 2 resources (${R2.toFixed(1)}%) are lower than Team 1 (${R1.toFixed(1)}%). Revised Target: ${revisedTarget} runs in ${team2RevisedOvers} overs.`
        : `Team 2 resources (${R2.toFixed(1)}%) match or exceed Team 1 (${R1.toFixed(1)}%). Revised Target: ${revisedTarget} runs.`;

    return {
        team1Resource: parseFloat(R1.toFixed(1)),
        team2Resource: parseFloat(R2.toFixed(1)),
        revisedTarget: Math.max(1, revisedTarget),
        parScore: Math.max(0, parScore),
        isTeam2ResourceGreater,
        resourceDifference: parseFloat(resourceDiff.toFixed(1)),
        explanation,
    };
}

/**
 * Live Projected Score Engine
 */
export interface RunRateProjections {
    currentRunRate: number;
    atCurrentRate: number;
    atLast5Rate: number;
    atParRate8: number;
    atAccelerated10: number;
}

export function calculateProjectedScores(
    currentRuns: number,
    currentBalls: number,
    totalMatchOvers: number = 20,
    last5OversRuns: number = 40
): RunRateProjections {
    const oversCompleted = currentBalls / 6;
    const oversRemaining = totalMatchOvers - oversCompleted;

    const currentRunRate = oversCompleted > 0 ? currentRuns / oversCompleted : 0;
    const last5RunRate = last5OversRuns / 5;

    return {
        currentRunRate: parseFloat(currentRunRate.toFixed(2)),
        atCurrentRate: Math.round(currentRuns + currentRunRate * oversRemaining),
        atLast5Rate: Math.round(currentRuns + last5RunRate * oversRemaining),
        atParRate8: Math.round(currentRuns + 8.0 * oversRemaining),
        atAccelerated10: Math.round(currentRuns + 10.0 * oversRemaining),
    };
}

/**
 * Over-Rate Penalty & Time Budget Calculator
 */
export interface OverRateStatus {
    oversScheduled: number;
    oversBowled: number;
    minutesElapsed: number;
    minutesAllowed: number; // standard 4 mins per over (15 overs/hr)
    oversBehind: number;
    penaltyApplied: boolean;
    penaltyDescription: string;
}

export function calculateOverRatePenalty(
    oversBowled: number,
    minutesElapsed: number,
    minutesPerOver: number = 4.0 // 15 overs per hour standard
): OverRateStatus {
    const minutesAllowed = oversBowled * minutesPerOver;
    const minutesBehind = minutesElapsed - minutesAllowed;
    const oversBehind = parseFloat((minutesBehind / minutesPerOver).toFixed(1));

    const penaltyApplied = minutesBehind > 5; // > 5 mins buffer breached
    const penaltyDescription = penaltyApplied
        ? `Slow Over Rate: ${oversBehind} overs behind schedule. Penalty: Maximum 4 fielders outside 30-yard circle for remaining overs.`
        : `On Schedule: ${Math.abs(minutesBehind).toFixed(0)} mins ${minutesBehind < 0 ? 'ahead of' : 'within'} time budget.`;

    return {
        oversScheduled: Math.ceil(oversBowled),
        oversBowled,
        minutesElapsed,
        minutesAllowed,
        oversBehind: Math.max(0, oversBehind),
        penaltyApplied,
        penaltyDescription,
    };
}

/**
 * Ball-by-ball Win Probability Calculator
 */
export function calculateWinProbability(
    currentInnings: 1 | 2,
    currentRuns: number,
    currentWickets: number,
    currentBalls: number,
    targetRuns?: number,
    totalOvers: number = 20
): { homeWinProb: number; awayWinProb: number } {
    if (currentInnings === 1) {
        // 1st innings model
        const oversRemaining = totalOvers - currentBalls / 6;
        const wicketsInHand = 10 - currentWickets;
        const currentRR = currentBalls > 0 ? (currentRuns / currentBalls) * 6 : 6.0;

        // Base 50-50 modified by scoring pace and wickets
        let prob = 50 + (currentRR - 7.5) * 3 + (wicketsInHand - 6) * 4;
        prob = Math.min(95, Math.max(5, prob));
        return { homeWinProb: Math.round(prob), awayWinProb: Math.round(100 - prob) };
    } else {
        // 2nd innings chase model
        const target = targetRuns || 150;
        const runsNeeded = target - currentRuns;
        const ballsRemaining = Math.max(1, totalOvers * 6 - currentBalls);
        const wicketsInHand = 10 - currentWickets;

        if (runsNeeded <= 0) return { homeWinProb: 0, awayWinProb: 100 }; // Chasing team won
        if (wicketsInHand === 0) return { homeWinProb: 100, awayWinProb: 0 }; // Chasing team all out

        const rrr = (runsNeeded / ballsRemaining) * 6; // Required run rate

        // Logistic win probability formula for chasing team
        const factor = (8.5 - rrr) * 12 + (wicketsInHand - 4) * 8;
        let chasingWinProb = 100 / (1 + Math.exp(-factor / 15));

        chasingWinProb = Math.min(99, Math.max(1, chasingWinProb));
        return {
            homeWinProb: Math.round(100 - chasingWinProb),
            awayWinProb: Math.round(chasingWinProb),
        };
    }
}
