import { UUID } from "@/types/schema_v4";

export interface MatchResultRecord {
    fixtureId: UUID;
    homeTeamId: UUID;
    awayTeamId: UUID;
    homeTeamName: string;
    awayTeamName: string;
    homeRuns: number;
    homeWickets: number;
    homeOvers: number; // e.g. 20.0 or 18.4 (will convert to total legal balls)
    awayRuns: number;
    awayWickets: number;
    awayOvers: number;
    winnerTeamId?: UUID; // null if tie or NR
    status: 'COMPLETED' | 'TIED' | 'NO_RESULT' | 'ABANDONED';
    isAllOutHome?: boolean;
    isAllOutAway?: boolean;
    maxOversAllocated?: number; // default 20 or 50
}

export interface CompetitionRuleset {
    id: string;
    name: string;
    pointsForWin: number;
    pointsForTie: number;
    pointsForNoResult: number;
    pointsForLoss: number;
    bonusPointEnabled: boolean;
    bonusPointRunRateThreshold?: number; // e.g. 1.25x opposition run rate
    maxOversPerInnings: number; // e.g. 20 for T20, 50 for 50-over
}

export interface TeamStandingsEntry {
    teamId: UUID;
    teamName: string;
    played: number;
    won: number;
    lost: number;
    tied: number;
    noResult: number;
    bonusPoints: number;
    points: number;
    runsScored: number;
    ballsFaced: number; // total legal balls faced
    runsConceded: number;
    ballsBowled: number; // total legal balls bowled
    netRunRate: number;
    recentForm: ('W' | 'L' | 'T' | 'NR')[];
    headToHeadWins: Record<UUID, number>; // teamId -> wins vs that team
}

export const DEFAULT_SCHOOL_RULESET: CompetitionRuleset = {
    id: 'school-std-t20',
    name: 'School Cricket T20 Standard Ruleset',
    pointsForWin: 4,
    pointsForTie: 2,
    pointsForNoResult: 2,
    pointsForLoss: 0,
    bonusPointEnabled: true,
    bonusPointRunRateThreshold: 1.25,
    maxOversPerInnings: 20,
};

/**
 * Convert overs decimal (e.g. 19.4) to total legal balls.
 */
export function oversToBalls(overs: number): number {
    const fullOvers = Math.floor(overs);
    const extraBalls = Math.round((overs - fullOvers) * 10);
    return fullOvers * 6 + extraBalls;
}

/**
 * Convert total legal balls to decimal overs (e.g. 118 balls -> 19.4 overs).
 */
export function ballsToOvers(balls: number): number {
    const fullOvers = Math.floor(balls / 6);
    const remaining = balls % 6;
    return parseFloat(`${fullOvers}.${remaining}`);
}

/**
 * Calculate Net Run Rate (NRR) for a team.
 * NRR = (Total Runs Scored / Total Overs Faced) - (Total Runs Conceded / Total Overs Bowled)
 * Note: If team is all out, full allotted overs count as overs faced.
 */
export function calculateNRR(
    runsScored: number,
    ballsFaced: number,
    runsConceded: number,
    ballsBowled: number
): number {
    if (ballsFaced === 0 || ballsBowled === 0) return 0;
    const oversFacedDecimal = ballsFaced / 6;
    const oversBowledDecimal = ballsBowled / 6;

    const scoringRate = runsScored / oversFacedDecimal;
    const concessionRate = runsConceded / oversBowledDecimal;

    return parseFloat((scoringRate - concessionRate).toFixed(3));
}

/**
 * Computes updated league standings table from match records.
 */
export function computeStandings(
    matchRecords: MatchResultRecord[],
    ruleset: CompetitionRuleset = DEFAULT_SCHOOL_RULESET
): TeamStandingsEntry[] {
    const standingsMap = new Map<string, TeamStandingsEntry>();

    // Helper to get or init team entry
    const getOrCreate = (teamId: string, teamName: string): TeamStandingsEntry => {
        if (!standingsMap.has(teamId)) {
            standingsMap.set(teamId, {
                teamId,
                teamName,
                played: 0,
                won: 0,
                lost: 0,
                tied: 0,
                noResult: 0,
                bonusPoints: 0,
                points: 0,
                runsScored: 0,
                ballsFaced: 0,
                runsConceded: 0,
                ballsBowled: 0,
                netRunRate: 0,
                recentForm: [],
                headToHeadWins: {},
            });
        }
        return standingsMap.get(teamId)!;
    };

    for (const match of matchRecords) {
        const home = getOrCreate(match.homeTeamId, match.homeTeamName);
        const away = getOrCreate(match.awayTeamId, match.awayTeamName);

        const maxBalls = (match.maxOversAllocated || ruleset.maxOversPerInnings) * 6;

        // Determine balls faced/bowled considering All-Out rule (full max overs count if all out)
        const homeBallsFaced = match.isAllOutHome ? maxBalls : oversToBalls(match.homeOvers);
        const awayBallsFaced = match.isAllOutAway ? maxBalls : oversToBalls(match.awayOvers);

        home.played += 1;
        away.played += 1;

        home.runsScored += match.homeRuns;
        home.ballsFaced += homeBallsFaced;
        home.runsConceded += match.awayRuns;
        home.ballsBowled += awayBallsFaced;

        away.runsScored += match.awayRuns;
        away.ballsFaced += awayBallsFaced;
        away.runsConceded += match.homeRuns;
        away.ballsBowled += homeBallsFaced;

        if (match.status === 'COMPLETED' && match.winnerTeamId) {
            if (match.winnerTeamId === match.homeTeamId) {
                home.won += 1;
                home.points += ruleset.pointsForWin;
                home.recentForm.push('W');
                home.headToHeadWins[match.awayTeamId] = (home.headToHeadWins[match.awayTeamId] || 0) + 1;

                away.lost += 1;
                away.points += ruleset.pointsForLoss;
                away.recentForm.push('L');
            } else {
                away.won += 1;
                away.points += ruleset.pointsForWin;
                away.recentForm.push('W');
                away.headToHeadWins[match.homeTeamId] = (away.headToHeadWins[match.homeTeamId] || 0) + 1;

                home.lost += 1;
                home.points += ruleset.pointsForLoss;
                home.recentForm.push('L');
            }
        } else if (match.status === 'TIED') {
            home.tied += 1;
            home.points += ruleset.pointsForTie;
            home.recentForm.push('T');

            away.tied += 1;
            away.points += ruleset.pointsForTie;
            away.recentForm.push('T');
        } else {
            // NO_RESULT or ABANDONED
            home.noResult += 1;
            home.points += ruleset.pointsForNoResult;
            home.recentForm.push('NR');

            away.noResult += 1;
            away.points += ruleset.pointsForNoResult;
            away.recentForm.push('NR');
        }
    }

    // Calculate final NRR and sort standings
    const standingsList = Array.from(standingsMap.values()).map(entry => {
        entry.netRunRate = calculateNRR(
            entry.runsScored,
            entry.ballsFaced,
            entry.runsConceded,
            entry.ballsBowled
        );
        return entry;
    });

    // Multi-tier tiebreaker:
    // 1. Total Points (descending)
    // 2. Net Run Rate (descending)
    // 3. Most Wins (descending)
    // 4. Head-to-Head record
    return standingsList.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (Math.abs(b.netRunRate - a.netRunRate) > 0.001) return b.netRunRate - a.netRunRate;
        if (b.won !== a.won) return b.won - a.won;
        const h2h = (b.headToHeadWins[a.teamId] || 0) - (a.headToHeadWins[b.teamId] || 0);
        if (h2h !== 0) return h2h;
        return a.teamName.localeCompare(b.teamName);
    });
}
