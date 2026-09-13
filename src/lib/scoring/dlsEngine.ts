/**
 * Duckworth-Lewis-Stern (DLS) & Match Target Calculation Engine
 * Standardized Standard Edition Resource Tables & Revised Target Calculator
 */

export interface DlsResourcePoint {
    oversRemaining: number;
    resources: number[];
}

// Standard DLS Standard Edition resource percentage table (selected key overs)
// Index corresponds to wickets lost (0 to 9)
const DLS_RESOURCE_TABLE: Record<number, number[]> = {
    50: [100.0, 93.4, 85.1, 74.9, 62.7, 49.0, 34.9, 22.0, 11.9, 4.7],
    45: [95.0, 89.2, 81.7, 72.3, 61.0, 48.0, 34.4, 21.8, 11.8, 4.7],
    40: [89.3, 84.2, 77.6, 69.1, 58.9, 46.7, 33.7, 21.6, 11.7, 4.7],
    35: [82.7, 78.4, 72.8, 65.3, 56.1, 44.9, 32.7, 21.2, 11.6, 4.7],
    30: [75.1, 71.5, 66.9, 60.5, 52.5, 42.6, 31.4, 20.6, 11.4, 4.7],
    25: [66.5, 63.7, 60.0, 54.9, 48.1, 39.5, 29.6, 19.8, 11.1, 4.6],
    20: [56.6, 54.6, 51.8, 47.9, 42.6, 35.5, 27.1, 18.4, 10.6, 4.5],
    18: [52.4, 50.7, 48.2, 44.7, 40.0, 33.6, 25.9, 17.7, 10.3, 4.4],
    16: [48.0, 46.5, 44.4, 41.4, 37.2, 31.5, 24.5, 16.9, 9.9, 4.3],
    15: [45.7, 44.3, 42.4, 39.6, 35.7, 30.3, 23.7, 16.5, 9.7, 4.3],
    14: [43.4, 42.1, 40.3, 37.8, 34.2, 29.1, 22.9, 16.0, 9.5, 4.2],
    12: [38.5, 37.5, 36.0, 33.9, 30.9, 26.6, 21.1, 15.0, 9.0, 4.1],
    10: [33.3, 32.5, 31.4, 29.8, 27.4, 23.8, 19.1, 13.8, 8.4, 3.9],
    8: [27.7, 27.2, 26.4, 25.2, 23.4, 20.6, 16.8, 12.3, 7.7, 3.7],
    6: [21.7, 21.4, 20.9, 20.1, 18.9, 16.9, 14.1, 10.6, 6.8, 3.4],
    5: [18.5, 18.3, 17.9, 17.3, 16.4, 14.8, 12.5, 9.6, 6.2, 3.2],
    4: [15.2, 15.1, 14.8, 14.4, 13.7, 12.5, 10.8, 8.4, 5.5, 2.9],
    3: [11.8, 11.7, 11.5, 11.3, 10.8, 10.0, 8.8, 7.0, 4.7, 2.6],
    2: [8.2, 8.2, 8.1, 8.0, 7.7, 7.3, 6.6, 5.4, 3.8, 2.1],
    1: [4.3, 4.3, 4.3, 4.2, 4.1, 4.0, 3.8, 3.3, 2.5, 1.5],
    0: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
};

/**
 * Interpolate resource percentage for any given overs remaining and wickets lost (0 to 9)
 */
export function getDlsResourcePercentage(oversRemaining: number, wicketsLost: number): number {
    const w = Math.min(9, Math.max(0, Math.floor(wicketsLost)));
    const roundedOvers = Math.max(0, Math.min(50, oversRemaining));

    if (DLS_RESOURCE_TABLE[roundedOvers]) {
        return DLS_RESOURCE_TABLE[roundedOvers][w];
    }

    const keys = Object.keys(DLS_RESOURCE_TABLE)
        .map(Number)
        .sort((a, b) => a - b);

    let lowerKey = 0;
    let upperKey = 50;

    for (let i = 0; i < keys.length; i++) {
        if (keys[i] <= roundedOvers) lowerKey = keys[i];
        if (keys[i] >= roundedOvers) {
            upperKey = keys[i];
            break;
        }
    }

    if (lowerKey === upperKey) {
        return DLS_RESOURCE_TABLE[lowerKey][w];
    }

    const lowerVal = DLS_RESOURCE_TABLE[lowerKey][w];
    const upperVal = DLS_RESOURCE_TABLE[upperKey][w];
    const ratio = (roundedOvers - lowerKey) / (upperKey - lowerKey);

    return parseFloat((lowerVal + ratio * (upperVal - lowerVal)).toFixed(1));
}

export interface DlsRecalculationInput {
    matchFormatOvers: number; // e.g. 20 (T20) or 50 (ODI)
    team1Runs: number;
    team1OversBatted: number;
    team1WicketsLost: number;
    team2RevisedOvers: number;
    team2CurrentWicketsLost?: number;
    team2CurrentOversBatted?: number;
    g50Standard?: number;
}

export interface DlsCalculationResult {
    team1ResourceUsed: number;
    team2ResourceAvailable: number;
    revisedTarget: number;
    parScoreAtCurrentOver: number;
    requiredRunRate: number;
    resourceDifference: number;
    formulaDescription: string;
}

/**
 * Calculate Revised DLS Target when Team 2's innings is shortened
 */
export function calculateDlsTarget(input: DlsRecalculationInput): DlsCalculationResult {
    const {
        matchFormatOvers,
        team1Runs,
        team1OversBatted,
        team1WicketsLost,
        team2RevisedOvers,
        team2CurrentWicketsLost = 0,
        team2CurrentOversBatted = 0,
    } = input;

    const g50 = input.g50Standard || (matchFormatOvers <= 20 ? 160 : 245);

    const team1OversLeft = Math.max(0, matchFormatOvers - team1OversBatted);
    const team1ResourceLost = getDlsResourcePercentage(team1OversLeft, team1WicketsLost);
    const team1ResourceTotalAvailable = getDlsResourcePercentage(matchFormatOvers, 0);
    const r1 = team1ResourceTotalAvailable - team1ResourceLost;

    const r2 = getDlsResourcePercentage(team2RevisedOvers, 0);

    let revisedTarget: number;
    let formulaDescription = "";

    if (r2 < r1) {
        const scaledScore = team1Runs * (r2 / r1);
        revisedTarget = Math.floor(scaledScore) + 1;
        formulaDescription = `Innings shortened: S₁ × (R₂ / R₁) + 1 = ${team1Runs} × (${r2}% / ${r1}%) + 1 = ${revisedTarget}`;
    } else {
        const extraRuns = Math.round((g50 * (r2 - r1)) / 100);
        revisedTarget = team1Runs + extraRuns + 1;
        formulaDescription = `Interruption in 1st Innings: S₁ + [G₅₀ × (R₂ - R₁)] + 1 = ${team1Runs} + [${g50} × ${((r2 - r1) / 100).toFixed(2)}] + 1 = ${revisedTarget}`;
    }

    const currentOversRemaining = Math.max(0, team2RevisedOvers - team2CurrentOversBatted);
    const currentResourceRemaining = getDlsResourcePercentage(currentOversRemaining, team2CurrentWicketsLost);
    const currentResourceUsed = r2 - currentResourceRemaining;
    const parScore = Math.floor(team1Runs * (currentResourceUsed / r1));

    const remainingOvers = Math.max(0.1, team2RevisedOvers - team2CurrentOversBatted);
    const neededRuns = Math.max(0, revisedTarget - (input.team1Runs > 0 ? 0 : 0));
    const rrr = parseFloat((neededRuns / remainingOvers).toFixed(2));

    return {
        team1ResourceUsed: r1,
        team2ResourceAvailable: r2,
        revisedTarget: Math.max(1, revisedTarget),
        parScoreAtCurrentOver: Math.max(0, parScore),
        requiredRunRate: rrr,
        resourceDifference: parseFloat((r2 - r1).toFixed(1)),
        formulaDescription,
    };
}
