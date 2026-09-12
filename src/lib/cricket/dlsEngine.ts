/**
 * SCRBRD OS — Duckworth-Lewis-Stern (DLS) Engine
 * 
 * Standard Duckworth-Lewis-Stern (DLS) resource tables & par-score calculation formulas
 * for rain-interrupted school and professional cricket matches.
 */

// Resource Table R(overs_remaining, wickets_lost) in percentage (%)
// Indexed by overs remaining (0..50) and wickets lost (0..9)
const DLS_RESOURCE_TABLE: Record<number, number[]> = {
    50: [100.0, 93.4, 85.1, 74.9, 62.2, 47.6, 32.2, 17.9, 7.2, 1.4],
    49: [99.1, 92.6, 84.5, 74.4, 61.9, 47.4, 32.1, 17.8, 7.2, 1.4],
    48: [98.1, 91.7, 83.8, 73.9, 61.6, 47.2, 32.0, 17.8, 7.2, 1.4],
    47: [97.1, 90.9, 83.1, 73.4, 61.3, 47.0, 31.9, 17.8, 7.2, 1.4],
    46: [96.1, 90.0, 82.4, 72.8, 60.9, 46.8, 31.8, 17.7, 7.2, 1.4],
    45: [95.0, 89.1, 81.6, 72.2, 60.5, 46.5, 31.7, 17.7, 7.2, 1.4],
    44: [93.9, 88.1, 80.8, 71.6, 60.1, 46.3, 31.6, 17.6, 7.2, 1.4],
    43: [92.8, 87.1, 80.0, 71.0, 59.7, 46.0, 31.5, 17.6, 7.2, 1.4],
    42: [91.6, 86.1, 79.2, 70.3, 59.2, 45.7, 31.4, 17.5, 7.1, 1.4],
    41: [90.4, 85.1, 78.3, 69.6, 58.7, 45.4, 31.3, 17.5, 7.1, 1.4],
    40: [89.3, 84.0, 77.4, 68.9, 58.2, 45.1, 31.1, 17.4, 7.1, 1.4],
    39: [88.0, 82.9, 76.5, 68.2, 57.7, 44.8, 31.0, 17.4, 7.1, 1.4],
    38: [86.7, 81.8, 75.5, 67.4, 57.1, 44.4, 30.8, 17.3, 7.1, 1.4],
    37: [85.4, 80.6, 74.5, 66.6, 56.5, 44.1, 30.7, 17.2, 7.0, 1.4],
    36: [84.1, 79.4, 73.5, 65.8, 55.9, 43.7, 30.5, 17.2, 7.0, 1.4],
    35: [82.7, 78.1, 72.5, 64.9, 55.3, 43.3, 30.3, 17.1, 7.0, 1.4],
    34: [81.3, 76.8, 71.4, 64.0, 54.6, 42.9, 30.1, 17.0, 7.0, 1.4],
    33: [79.8, 75.5, 70.2, 63.1, 53.9, 42.5, 29.9, 16.9, 6.9, 1.4],
    32: [78.3, 74.1, 69.0, 62.1, 53.2, 42.0, 29.7, 16.8, 6.9, 1.4],
    31: [76.7, 72.7, 67.8, 61.1, 52.4, 41.5, 29.5, 16.7, 6.9, 1.4],
    30: [75.1, 71.2, 66.5, 60.1, 51.6, 40.9, 29.2, 16.6, 6.8, 1.4],
    29: [73.5, 69.7, 65.2, 59.0, 50.8, 40.4, 28.9, 16.5, 6.8, 1.4],
    28: [71.8, 68.1, 63.8, 57.8, 49.9, 39.8, 28.6, 16.4, 6.7, 1.4],
    27: [70.1, 66.5, 62.4, 56.6, 49.0, 39.2, 28.3, 16.2, 6.7, 1.4],
    26: [68.3, 64.9, 60.9, 55.4, 48.0, 38.5, 27.9, 16.1, 6.6, 1.4],
    25: [66.5, 63.2, 59.4, 54.1, 47.0, 37.8, 27.5, 15.9, 6.6, 1.4],
    24: [64.6, 61.4, 57.8, 52.7, 45.9, 37.1, 27.1, 15.7, 6.5, 1.4],
    23: [62.7, 59.6, 56.2, 51.3, 44.8, 36.3, 26.6, 15.5, 6.4, 1.4],
    22: [60.7, 57.8, 54.5, 49.8, 43.6, 35.5, 26.1, 15.3, 6.3, 1.4],
    21: [58.7, 55.9, 52.8, 48.3, 42.4, 34.6, 25.6, 15.1, 6.2, 1.4],
    20: [56.6, 53.9, 51.0, 46.7, 41.1, 33.7, 25.0, 14.8, 6.1, 1.4],
    19: [54.4, 51.9, 49.1, 45.1, 39.7, 32.7, 24.4, 14.5, 6.0, 1.4],
    18: [52.2, 49.8, 47.2, 43.4, 38.3, 31.7, 23.7, 14.2, 5.9, 1.4],
    17: [49.9, 47.7, 45.2, 41.6, 36.8, 30.6, 23.0, 13.9, 5.8, 1.4],
    16: [47.6, 45.5, 43.2, 39.8, 35.3, 29.4, 22.2, 13.5, 5.7, 1.4],
    15: [45.2, 43.3, 41.1, 37.9, 33.7, 28.2, 21.4, 13.1, 5.5, 1.4],
    14: [42.7, 40.9, 38.9, 36.0, 32.1, 26.9, 20.5, 12.7, 5.4, 1.4],
    13: [40.2, 38.5, 36.7, 34.0, 30.4, 25.6, 19.6, 12.2, 5.2, 1.4],
    12: [37.6, 36.1, 34.4, 31.9, 28.6, 24.2, 18.6, 11.7, 5.0, 1.4],
    11: [34.9, 33.5, 32.0, 29.7, 26.7, 22.7, 17.5, 11.1, 4.8, 1.4],
    10: [32.1, 30.9, 29.5, 27.5, 24.8, 21.1, 16.3, 10.5, 4.6, 1.4],
    9: [29.3, 28.2, 26.9, 25.1, 22.7, 19.4, 15.1, 9.8, 4.3, 1.4],
    8: [26.4, 25.4, 24.3, 22.7, 20.6, 17.6, 13.8, 9.0, 4.0, 1.4],
    7: [23.4, 22.5, 21.6, 20.2, 18.4, 15.8, 12.4, 8.2, 3.7, 1.4],
    6: [20.3, 19.6, 18.8, 17.6, 16.0, 13.8, 10.9, 7.3, 3.3, 1.4],
    5: [17.2, 16.6, 15.9, 14.9, 13.6, 11.8, 9.4, 6.3, 2.9, 1.4],
    4: [13.9, 13.4, 12.9, 12.1, 11.1, 9.7, 7.7, 5.2, 2.4, 1.4],
    3: [10.6, 10.2, 9.8, 9.2, 8.5, 7.4, 6.0, 4.1, 1.9, 1.4],
    2: [7.2, 6.9, 6.7, 6.3, 5.8, 5.1, 4.1, 2.8, 1.3, 1.0],
    1: [3.6, 3.5, 3.4, 3.2, 3.0, 2.6, 2.1, 1.4, 0.7, 0.5],
    0: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
};

// Standard G50 value (Average 50-over total for international/school cricket)
export const DLS_G50_DEFAULT = 245;
export const DLS_T20_DEFAULT = 160;

/**
 * Get exact DLS resource percentage for given overs remaining and wickets lost
 */
export function getDlsResourcePercentage(oversRemaining: number, wicketsLost: number): number {
    const safeWickets = Math.min(Math.max(0, wicketsLost), 9);
    const floorOvers = Math.floor(oversRemaining);
    const ceilOvers = Math.ceil(oversRemaining);

    if (floorOvers >= 50) return DLS_RESOURCE_TABLE[50][safeWickets];
    if (floorOvers <= 0) return 0;

    const floorVal = DLS_RESOURCE_TABLE[floorOvers]?.[safeWickets] ?? 0;
    const ceilVal = DLS_RESOURCE_TABLE[ceilOvers]?.[safeWickets] ?? floorVal;

    const fraction = oversRemaining - floorOvers;
    return floorVal + fraction * (ceilVal - floorVal);
}

export interface DlsParInput {
    firstInningsRuns: number;
    totalOversMatch: number; // e.g. 50 or 20
    currentOversTeam2: number; // e.g. 24.2
    wicketsLostTeam2: number; // e.g. 3
    oversLostTeam1?: number; // overs lost in 1st innings
    oversLostTeam2?: number; // overs lost in 2nd innings
    g50Standard?: number; // standard average total
}

export interface DlsParResult {
    parScore: number; // exact integer par score for team 2 right now
    targetRuns: number; // revised target for team 2 to win
    revisedOversTeam2: number;
    r1Percentage: number;
    r2Percentage: number;
    differential: number; // current runs minus par score (+ahead / -behind)
    statusText: string;
    isParScoreAhead: boolean;
}

/**
 * Calculates real-time DLS Par Score & Revised Target for 2nd Innings
 */
export function calculateDlsParScore(input: DlsParInput): DlsParResult {
    const {
        firstInningsRuns,
        totalOversMatch,
        currentOversTeam2,
        wicketsLostTeam2,
        oversLostTeam1 = 0,
        oversLostTeam2 = 0,
        g50Standard = totalOversMatch <= 20 ? DLS_T20_DEFAULT : DLS_G50_DEFAULT,
    } = input;

    // Calculate R1 (Resource available to Team 1)
    const r1Percentage = getDlsResourcePercentage(totalOversMatch - oversLostTeam1, 0);

    // Calculate total revised overs for Team 2
    const maxOversTeam2 = totalOversMatch - oversLostTeam2;
    const r2TotalPercentage = getDlsResourcePercentage(maxOversTeam2, 0);

    // Calculate current R2 percentage at the present ball
    const oversRemainingTeam2 = Math.max(0, maxOversTeam2 - currentOversTeam2);
    const r2CurrentUsedPercentage = r2TotalPercentage - getDlsResourcePercentage(oversRemainingTeam2, wicketsLostTeam2);

    // Calculate revised target for Team 2
    let targetRuns: number;
    if (r2TotalPercentage === r1Percentage) {
        targetRuns = firstInningsRuns + 1;
    } else if (r2TotalPercentage < r1Percentage) {
        targetRuns = Math.floor(firstInningsRuns * (r2TotalPercentage / r1Percentage)) + 1;
    } else {
        targetRuns = Math.floor(firstInningsRuns + g50Standard * ((r2TotalPercentage - r1Percentage) / 100)) + 1;
    }

    // Calculate exact Par Score at current overs & wickets
    let parScore: number;
    if (r2CurrentUsedPercentage <= 0) {
        parScore = 0;
    } else if (r2TotalPercentage < r1Percentage) {
        parScore = Math.floor(firstInningsRuns * (r2CurrentUsedPercentage / r1Percentage));
    } else {
        parScore = Math.floor((firstInningsRuns * r2CurrentUsedPercentage) / r2TotalPercentage);
    }

    return {
        parScore,
        targetRuns,
        revisedOversTeam2: maxOversTeam2,
        r1Percentage: Math.round(r1Percentage * 10) / 10,
        r2Percentage: Math.round(r2TotalPercentage * 10) / 10,
        differential: 0, // to be calculated against current score
        statusText: `DLS Target: ${targetRuns} off ${maxOversTeam2} overs (Par at current stage: ${parScore})`,
        isParScoreAhead: false,
    };
}

/**
 * Calculates current DLS differential for live scoreboard
 */
export function getLiveDlsState(
    firstInningsRuns: number,
    secondInningsRuns: number,
    totalOversMatch: number,
    currentOversTeam2: number,
    wicketsLostTeam2: number,
    oversLostTeam1 = 0,
    oversLostTeam2 = 0
): DlsParResult {
    const result = calculateDlsParScore({
        firstInningsRuns,
        totalOversMatch,
        currentOversTeam2,
        wicketsLostTeam2,
        oversLostTeam1,
        oversLostTeam2,
    });

    const diff = secondInningsRuns - result.parScore;
    const isAhead = diff >= 0;

    let statusText = '';
    if (diff > 0) {
        statusText = `${diff} run${diff === 1 ? '' : 's'} ahead of DLS Par (${secondInningsRuns} vs Par ${result.parScore})`;
    } else if (diff === 0) {
        statusText = `Level with DLS Par (${secondInningsRuns} vs Par ${result.parScore})`;
    } else {
        statusText = `${Math.abs(diff)} run${Math.abs(diff) === 1 ? '' : 's'} behind DLS Par (${secondInningsRuns} vs Par ${result.parScore})`;
    }

    return {
        ...result,
        differential: diff,
        isParScoreAhead: isAhead,
        statusText,
    };
}
