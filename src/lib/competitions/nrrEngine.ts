/**
 * SCRBRD Competition Engine — Net Run Rate (NRR) & Points Engine
 * 
 * Rules & Standards:
 * 1. NRR = (Total Runs Scored / Total Overs Faced) - (Total Runs Conceded / Total Overs Bowled)
 * 2. Overs decimal conversion: 48.4 overs = 48 + 4/6 = 48.6667 overs.
 * 3. All-Out Rule: If a team is dismissed all out before completing their allotted overs,
 *    they are deemed to have faced their full maximum overs (e.g. 50.0 in a 50-over match, 20.0 in T20).
 * 4. Opposition All-Out Rule: If the bowling team dismisses opposition all out,
 *    the bowling team is credited with having bowled the full maximum allotted overs.
 * 5. Points Table Sorting Order: Points (desc) -> Wins (desc) -> Head-to-Head -> NRR (desc).
 */

export interface TeamMatchResult {
    matchId: string;
    teamId: string;
    teamName: string;
    opponentId: string;
    opponentName: string;
    outcome: 'WIN' | 'LOSS' | 'TIE' | 'NO_RESULT';
    runsScored: number;
    wicketsLost: number;
    oversFaced: number; // e.g. 48.4
    isAllOut: boolean;
    runsConceded: number;
    wicketsTaken: number;
    oversBowled: number; // e.g. 50.0
    isOpponentAllOut: boolean;
    maxMatchOvers: number; // e.g. 50 or 20
    bonusPoints?: number;
    matchDate: string;
}

export interface StandingsRow {
    rank: number;
    teamId: string;
    teamName: string;
    schoolName?: string;
    played: number;
    won: number;
    lost: number;
    tied: number;
    noResult: number;
    bonusPoints: number;
    points: number;
    runsScored: number;
    oversFacedDec: number;
    runsConceded: number;
    oversBowledDec: number;
    nrr: number;
    form: ('W' | 'L' | 'T' | 'NR')[];
}

/**
 * Converts cricket overs notation (e.g., 48.4) to decimal overs (48.666667).
 * 48.1 => 48 + 1/6
 * 48.5 => 48 + 5/6
 */
export function oversToDecimal(overs: number): number {
    const completedOvers = Math.floor(overs);
    const fraction = Math.round((overs - completedOvers) * 10);
    const balls = Math.min(fraction, 6);
    return completedOvers + balls / 6;
}

/**
 * Converts decimal overs back to standard cricket string notation (e.g., 48.666667 => "48.4").
 */
export function decimalToOvers(decimalOvers: number): string {
    const fullOvers = Math.floor(decimalOvers);
    const remainingBalls = Math.round((decimalOvers - fullOvers) * 6);
    if (remainingBalls === 6) {
        return `${fullOvers + 1}.0`;
    }
    return `${fullOvers}.${remainingBalls}`;
}

/**
 * Calculates effective overs faced according to ICC/Schools All-Out rules.
 */
export function calculateEffectiveOversFaced(
    oversFaced: number,
    isAllOut: boolean,
    maxOvers: number
): number {
    if (isAllOut) return maxOvers;
    return oversToDecimal(oversFaced);
}

/**
 * Calculates effective overs bowled according to ICC/Schools All-Out rules.
 */
export function calculateEffectiveOversBowled(
    oversBowled: number,
    isOpponentAllOut: boolean,
    maxOvers: number
): number {
    if (isOpponentAllOut) return maxOvers;
    return oversToDecimal(oversBowled);
}

/**
 * Computes a team's Net Run Rate (NRR) from cumulative stats.
 */
export function calculateNRR(
    totalRunsScored: number,
    totalOversFacedDec: number,
    totalRunsConceded: number,
    totalOversBowledDec: number
): number {
    if (totalOversFacedDec <= 0 || totalOversBowledDec <= 0) return 0;
    const battingRate = totalRunsScored / totalOversFacedDec;
    const bowlingRate = totalRunsConceded / totalOversBowledDec;
    const nrr = battingRate - bowlingRate;
    return Math.round(nrr * 1000) / 1000; // 3 decimal places
}

/**
 * Generates an official Standings Table from a set of match results.
 */
export function calculateCompetitionStandings(
    teamIds: string[],
    teamNames: Record<string, string>,
    matches: TeamMatchResult[],
    pointsConfig = { win: 4, tie: 2, noResult: 2, loss: 0 }
): StandingsRow[] {
    const standingsMap: Record<string, StandingsRow> = {};

    // Initialize
    teamIds.forEach(tId => {
        standingsMap[tId] = {
            rank: 0,
            teamId: tId,
            teamName: teamNames[tId] || tId,
            played: 0,
            won: 0,
            lost: 0,
            tied: 0,
            noResult: 0,
            bonusPoints: 0,
            points: 0,
            runsScored: 0,
            oversFacedDec: 0,
            runsConceded: 0,
            oversBowledDec: 0,
            nrr: 0,
            form: []
        };
    });

    // Aggregate results
    matches.forEach(m => {
        const row = standingsMap[m.teamId];
        if (!row) return;

        row.played += 1;
        row.runsScored += m.runsScored;
        row.oversFacedDec += calculateEffectiveOversFaced(m.oversFaced, m.isAllOut, m.maxMatchOvers);

        row.runsConceded += m.runsConceded;
        row.oversBowledDec += calculateEffectiveOversBowled(m.oversBowled, m.isOpponentAllOut, m.maxMatchOvers);

        if (m.bonusPoints) row.bonusPoints += m.bonusPoints;

        if (m.outcome === 'WIN') {
            row.won += 1;
            row.points += pointsConfig.win;
            row.form.push('W');
        } else if (m.outcome === 'LOSS') {
            row.lost += 1;
            row.points += pointsConfig.loss;
            row.form.push('L');
        } else if (m.outcome === 'TIE') {
            row.tied += 1;
            row.points += pointsConfig.tie;
            row.form.push('T');
        } else if (m.outcome === 'NO_RESULT') {
            row.noResult += 1;
            row.points += pointsConfig.noResult;
            row.form.push('NR');
        }
    });

    // Finalize NRR and total points
    const rows = Object.values(standingsMap).map(row => {
        const totalPts = row.points + row.bonusPoints;
        const nrr = calculateNRR(row.runsScored, row.oversFacedDec, row.runsConceded, row.oversBowledDec);
        return { ...row, points: totalPts, nrr };
    });

    // Sort: Points (desc) -> Wins (desc) -> NRR (desc) -> Runs Scored (desc)
    rows.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.won !== a.won) return b.won - a.won;
        if (b.nrr !== a.nrr) return b.nrr - a.nrr;
        return b.runsScored - a.runsScored;
    });

    // Assign ranks
    return rows.map((row, idx) => ({ ...row, rank: idx + 1 }));
}

/**
 * NRR Scenario Simulator
 * Predicts new NRR and table rank for a team given hypothetical match inputs.
 */
export function simulateNRRScenario(
    currentStandings: StandingsRow[],
    targetTeamId: string,
    scenario: {
        runsScored: number;
        oversFaced: number;
        isAllOut: boolean;
        runsConceded: number;
        oversBowled: number;
        isOpponentAllOut: boolean;
        maxMatchOvers: number;
        winOutcome: 'WIN' | 'LOSS' | 'TIE';
    }
): { projectedNRR: number; projectedRank: number; rankDiff: number } {
    const currentTeamRow = currentStandings.find(r => r.teamId === targetTeamId);
    if (!currentTeamRow) return { projectedNRR: 0, projectedRank: 0, rankDiff: 0 };

    const effectiveFaced = calculateEffectiveOversFaced(scenario.oversFaced, scenario.isAllOut, scenario.maxMatchOvers);
    const effectiveBowled = calculateEffectiveOversBowled(scenario.oversBowled, scenario.isOpponentAllOut, scenario.maxMatchOvers);

    const newRunsScored = currentTeamRow.runsScored + scenario.runsScored;
    const newOversFacedDec = currentTeamRow.oversFacedDec + effectiveFaced;
    const newRunsConceded = currentTeamRow.runsConceded + scenario.runsConceded;
    const newOversBowledDec = currentTeamRow.oversBowledDec + effectiveBowled;

    const projectedNRR = calculateNRR(newRunsScored, newOversFacedDec, newRunsConceded, newOversBowledDec);

    let newPts = currentTeamRow.points;
    if (scenario.winOutcome === 'WIN') newPts += 4;
    else if (scenario.winOutcome === 'TIE') newPts += 2;

    // Re-rank standings
    const updatedRows = currentStandings.map(r => {
        if (r.teamId !== targetTeamId) return r;
        return {
            ...r,
            points: newPts,
            runsScored: newRunsScored,
            oversFacedDec: newOversFacedDec,
            runsConceded: newRunsConceded,
            oversBowledDec: newOversBowledDec,
            nrr: projectedNRR,
            played: r.played + 1,
            won: scenario.winOutcome === 'WIN' ? r.won + 1 : r.won,
            lost: scenario.winOutcome === 'LOSS' ? r.lost + 1 : r.lost
        };
    });

    updatedRows.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.won !== a.won) return b.won - a.won;
        if (b.nrr !== a.nrr) return b.nrr - a.nrr;
        return b.runsScored - a.runsScored;
    });

    const projectedRank = updatedRows.findIndex(r => r.teamId === targetTeamId) + 1;
    const rankDiff = currentTeamRow.rank - projectedRank; // positive means rank improved (e.g. 3 to 1 = +2)

    return { projectedNRR, projectedRank, rankDiff };
}
