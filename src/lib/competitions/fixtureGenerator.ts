/**
 * SCRBRD Competition Engine — Fixture & Bracket Generator
 * 
 * Implements:
 * 1. Round-Robin Generator (Berger Algorithm) for single or double home & away legs.
 * 2. Knockout Tournament Bracket Builder (Quarter-finals, Semi-finals, Finals).
 */

export interface TeamSeed {
    id: string;
    name: string;
    shortName?: string;
    seedRank?: number;
}

export interface GeneratedFixture {
    id: string;
    roundNumber: number;
    roundName: string;
    homeTeamId: string;
    homeTeamName: string;
    awayTeamId: string;
    awayTeamName: string;
    venueName?: string;
    stage: 'ROUND_ROBIN' | 'QUARTER_FINAL' | 'SEMI_FINAL' | 'FINAL';
    status: 'SCHEDULED' | 'LIVE' | 'COMPLETED';
}

export interface GeneratedSchedule {
    competitionId: string;
    type: 'ROUND_ROBIN' | 'KNOCKOUT' | 'HYBRID';
    rounds: {
        roundNumber: number;
        roundName: string;
        fixtures: GeneratedFixture[];
    }[];
    totalFixtures: number;
}

/**
 * Berger Round-Robin Algorithm
 * Generates balanced home/away schedules for N teams.
 * If N is odd, a dummy 'BYE' team is inserted.
 */
export function generateRoundRobinFixtures(
    teams: TeamSeed[],
    competitionId = 'comp-1',
    doubleRoundRobin = false
): GeneratedSchedule {
    const teamList = [...teams];
    const isOdd = teamList.length % 2 !== 0;
    if (isOdd) {
        teamList.push({ id: 'BYE', name: 'BYE' });
    }

    const numTeams = teamList.length;
    const numRounds = numTeams - 1;
    const matchesPerRound = numTeams / 2;

    const rounds: GeneratedSchedule['rounds'] = [];
    let fixtureIdCounter = 1;

    for (let r = 0; r < numRounds; r++) {
        const roundFixtures: GeneratedFixture[] = [];
        const roundName = `Round ${r + 1}`;

        for (let m = 0; m < matchesPerRound; m++) {
            const homeIdx = (r + m) % (numTeams - 1);
            let awayIdx = (numTeams - 1 - m + r) % (numTeams - 1);

            // The last team remains stationary
            if (m === 0) {
                awayIdx = numTeams - 1;
            }

            const home = teamList[homeIdx];
            const away = teamList[awayIdx];

            // Skip BYE matches
            if (home.id !== 'BYE' && away.id !== 'BYE') {
                roundFixtures.push({
                    id: `fix-${competitionId}-${fixtureIdCounter++}`,
                    roundNumber: r + 1,
                    roundName,
                    homeTeamId: home.id,
                    homeTeamName: home.name,
                    awayTeamId: away.id,
                    awayTeamName: away.name,
                    stage: 'ROUND_ROBIN',
                    status: 'SCHEDULED'
                });
            }
        }

        rounds.push({
            roundNumber: r + 1,
            roundName,
            fixtures: roundFixtures
        });
    }

    // Handle Double Round-Robin (Reverse Leg)
    if (doubleRoundRobin) {
        const initialRoundsCount = rounds.length;
        for (let r = 0; r < initialRoundsCount; r++) {
            const originalRound = rounds[r];
            const reverseRoundNumber = initialRoundsCount + r + 1;
            const reverseRoundName = `Round ${reverseRoundNumber} (Return Leg)`;

            const reverseFixtures: GeneratedFixture[] = originalRound.fixtures.map(f => ({
                id: `fix-${competitionId}-${fixtureIdCounter++}`,
                roundNumber: reverseRoundNumber,
                roundName: reverseRoundName,
                homeTeamId: f.awayTeamId,
                homeTeamName: f.awayTeamName,
                awayTeamId: f.homeTeamId,
                awayTeamName: f.homeTeamName,
                stage: 'ROUND_ROBIN',
                status: 'SCHEDULED'
            }));

            rounds.push({
                roundNumber: reverseRoundNumber,
                roundName: reverseRoundName,
                fixtures: reverseFixtures
            });
        }
    }

    const totalFixtures = rounds.reduce((sum, r) => sum + r.fixtures.length, 0);

    return {
        competitionId,
        type: 'ROUND_ROBIN',
        rounds,
        totalFixtures
    };
}

/**
 * Knockout Bracket Builder
 * Accepts seeded teams (4 or 8) and creates structured knockout rounds.
 */
export function generateKnockoutBracket(
    seededTeams: TeamSeed[],
    competitionId = 'cup-1'
): GeneratedSchedule {
    const count = seededTeams.length;
    const rounds: GeneratedSchedule['rounds'] = [];
    let fixtureIdCounter = 1;

    if (count === 4) {
        // 4 Teams -> Semi Finals + Final
        const sf1: GeneratedFixture = {
            id: `fix-${competitionId}-${fixtureIdCounter++}`,
            roundNumber: 1,
            roundName: 'Semi-Final 1',
            homeTeamId: seededTeams[0].id,
            homeTeamName: seededTeams[0].name,
            awayTeamId: seededTeams[3].id,
            awayTeamName: seededTeams[3].name,
            stage: 'SEMI_FINAL',
            status: 'SCHEDULED'
        };
        const sf2: GeneratedFixture = {
            id: `fix-${competitionId}-${fixtureIdCounter++}`,
            roundNumber: 1,
            roundName: 'Semi-Final 2',
            homeTeamId: seededTeams[1].id,
            homeTeamName: seededTeams[1].name,
            awayTeamId: seededTeams[2].id,
            awayTeamName: seededTeams[2].name,
            stage: 'SEMI_FINAL',
            status: 'SCHEDULED'
        };

        rounds.push({ roundNumber: 1, roundName: 'Semi-Finals', fixtures: [sf1, sf2] });

        const finalMatch: GeneratedFixture = {
            id: `fix-${competitionId}-${fixtureIdCounter++}`,
            roundNumber: 2,
            roundName: 'Grand Final',
            homeTeamId: 'winner_sf1',
            homeTeamName: 'Winner Semi-Final 1',
            awayTeamId: 'winner_sf2',
            awayTeamName: 'Winner Semi-Final 2',
            stage: 'FINAL',
            status: 'SCHEDULED'
        };

        rounds.push({ roundNumber: 2, roundName: 'Grand Final', fixtures: [finalMatch] });
    } else if (count >= 8) {
        // 8 Teams -> Quarter Finals + Semi Finals + Final
        const qf1: GeneratedFixture = { id: `fix-${competitionId}-${fixtureIdCounter++}`, roundNumber: 1, roundName: 'Quarter-Final 1', homeTeamId: seededTeams[0].id, homeTeamName: seededTeams[0].name, awayTeamId: seededTeams[7].id, awayTeamName: seededTeams[7].name, stage: 'QUARTER_FINAL', status: 'SCHEDULED' };
        const qf2: GeneratedFixture = { id: `fix-${competitionId}-${fixtureIdCounter++}`, roundNumber: 1, roundName: 'Quarter-Final 2', homeTeamId: seededTeams[3].id, homeTeamName: seededTeams[3].name, awayTeamId: seededTeams[4].id, awayTeamName: seededTeams[4].name, stage: 'QUARTER_FINAL', status: 'SCHEDULED' };
        const qf3: GeneratedFixture = { id: `fix-${competitionId}-${fixtureIdCounter++}`, roundNumber: 1, roundName: 'Quarter-Final 3', homeTeamId: seededTeams[1].id, homeTeamName: seededTeams[1].name, awayTeamId: seededTeams[6].id, awayTeamName: seededTeams[6].name, stage: 'QUARTER_FINAL', status: 'SCHEDULED' };
        const qf4: GeneratedFixture = { id: `fix-${competitionId}-${fixtureIdCounter++}`, roundNumber: 1, roundName: 'Quarter-Final 4', homeTeamId: seededTeams[2].id, homeTeamName: seededTeams[2].name, awayTeamId: seededTeams[5].id, awayTeamName: seededTeams[5].name, stage: 'QUARTER_FINAL', status: 'SCHEDULED' };

        rounds.push({ roundNumber: 1, roundName: 'Quarter-Finals', fixtures: [qf1, qf2, qf3, qf4] });

        const sf1: GeneratedFixture = { id: `fix-${competitionId}-${fixtureIdCounter++}`, roundNumber: 2, roundName: 'Semi-Final 1', homeTeamId: 'winner_qf1', homeTeamName: 'Winner QF 1', awayTeamId: 'winner_qf2', awayTeamName: 'Winner QF 2', stage: 'SEMI_FINAL', status: 'SCHEDULED' };
        const sf2: GeneratedFixture = { id: `fix-${competitionId}-${fixtureIdCounter++}`, roundNumber: 2, roundName: 'Semi-Final 2', homeTeamId: 'winner_qf3', homeTeamName: 'Winner QF 3', awayTeamId: 'winner_qf4', awayTeamName: 'Winner QF 4', stage: 'SEMI_FINAL', status: 'SCHEDULED' };

        rounds.push({ roundNumber: 2, roundName: 'Semi-Finals', fixtures: [sf1, sf2] });

        const finalMatch: GeneratedFixture = { id: `fix-${competitionId}-${fixtureIdCounter++}`, roundNumber: 3, roundName: 'Grand Final', homeTeamId: 'winner_sf1', homeTeamName: 'Winner SF 1', awayTeamId: 'winner_sf2', awayTeamName: 'Winner SF 2', stage: 'FINAL', status: 'SCHEDULED' };

        rounds.push({ roundNumber: 3, roundName: 'Grand Final', fixtures: [finalMatch] });
    }

    const totalFixtures = rounds.reduce((sum, r) => sum + r.fixtures.length, 0);

    return {
        competitionId,
        type: 'KNOCKOUT',
        rounds,
        totalFixtures
    };
}
