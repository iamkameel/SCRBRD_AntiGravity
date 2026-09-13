import {
    InterHouseCricketCompetition,
    InterHouseCricketRuleset,
    InterHouseCricketDivision,
    HouseCricketTeam,
    InterHouseCricketPointsLedger,
    InterHouseCricketStandings
} from '@/types/interhouseCricket';
import { Fixture } from '@/types/schema_v4';

// --- SEED MOCK HOUSES ---
export const MOCK_INTERHOUSE_HOUSES: HouseCricketTeam[] = [
    {
        houseTeamId: 'house-1',
        houseId: 'house-founders',
        cricketCompetitionId: 'ihc-comp-2026',
        divisionId: 'ihc-div-senior',
        name: 'Founders House',
        shortName: 'FND',
        teamNumber: 1,
        captainId: 'person-capt-1',
        viceCaptainId: 'person-vc-1',
        coachId: 'person-hm-1',
        status: 'ACTIVE',
        registeredAt: '2026-01-15T00:00:00Z'
    },
    {
        houseTeamId: 'house-2',
        houseId: 'house-falcons',
        cricketCompetitionId: 'ihc-comp-2026',
        divisionId: 'ihc-div-senior',
        name: 'Falcons House',
        shortName: 'FLC',
        teamNumber: 1,
        captainId: 'person-capt-2',
        viceCaptainId: 'person-vc-2',
        coachId: 'person-hm-2',
        status: 'ACTIVE',
        registeredAt: '2026-01-15T00:00:00Z'
    },
    {
        houseTeamId: 'house-3',
        houseId: 'house-lions',
        cricketCompetitionId: 'ihc-comp-2026',
        divisionId: 'ihc-div-senior',
        name: 'Lions House',
        shortName: 'LIO',
        teamNumber: 1,
        captainId: 'person-capt-3',
        viceCaptainId: 'person-vc-3',
        coachId: 'person-hm-3',
        status: 'ACTIVE',
        registeredAt: '2026-01-15T00:00:00Z'
    },
    {
        houseTeamId: 'house-4',
        houseId: 'house-eagles',
        cricketCompetitionId: 'ihc-comp-2026',
        divisionId: 'ihc-div-senior',
        name: 'Eagles House',
        shortName: 'EAG',
        teamNumber: 1,
        captainId: 'person-capt-4',
        viceCaptainId: 'person-vc-4',
        coachId: 'person-hm-4',
        status: 'ACTIVE',
        registeredAt: '2026-01-15T00:00:00Z'
    }
];

export const MOCK_INTERHOUSE_RULESET: InterHouseCricketRuleset = {
    rulesetId: 'ruleset-ihc-2026',
    schoolId: 'school-bishops',
    name: 'Standard Inter-House T20 & Pairs Ruleset',
    version: '1.0',
    inningsPerSide: 1,
    oversPerInnings: 20,
    ballsPerOver: 6,
    maxPlayersPerSquad: 18,
    playersPerSide: 11,
    maxOversPerBowler: 4,
    powerplayEnabled: true,
    powerplayOvers: 6,
    fieldingRestrictionsEnabled: true,
    retirementEnabled: true,
    retirementRuns: 50,
    battersCanReturnAfterRetirement: true,
    compulsoryRetirement: false,
    batterBallLimitEnabled: false,
    freeHitEnabled: true,
    noBallRuns: 1,
    wideRuns: 1,
    noBallCountsAsBall: false,
    wideCountsAsBall: false,
    lastBatterContinues: false,
    allowSubstitutions: true,
    concussionReplacementEnabled: true,
    superOverEnabled: true,
    tiedMatchRule: 'SUPER_OVER',
    rainRule: 'DLS',
    pointsSystemId: 'ps-standard-ihc',
    effectiveFrom: '2026-01-01',
    active: true
};

export const MOCK_INTERHOUSE_COMPETITIONS: InterHouseCricketCompetition[] = [
    {
        cricketCompetitionId: 'ihc-comp-2026',
        competitionId: 'comp-founders-2026',
        schoolId: 'school-bishops',
        seasonId: 'season-2026',
        name: '2026 Founders Cup Inter-House Cricket Championship',
        academicYear: 2026,
        competitionFormat: 'LEAGUE',
        cricketFormat: 'T20',
        ballType: 'HARD_BALL',
        genderCategory: 'BOYS',
        startDate: '2026-09-01',
        endDate: '2026-11-30',
        status: 'ACTIVE',
        rulesetId: 'ruleset-ihc-2026',
        createdBy: 'admin-1',
        createdAt: '2026-08-01T00:00:00Z',
        updatedAt: '2026-08-01T00:00:00Z'
    }
];

export const MOCK_INTERHOUSE_DIVISIONS: InterHouseCricketDivision[] = [
    {
        divisionId: 'ihc-div-senior',
        cricketCompetitionId: 'ihc-comp-2026',
        name: 'Senior Open Division (U19)',
        code: 'SNR',
        divisionType: 'SENIOR',
        displayOrder: 1,
        status: 'ACTIVE'
    },
    {
        divisionId: 'ihc-div-juniors',
        cricketCompetitionId: 'ihc-comp-2026',
        name: 'Junior Division (U15)',
        code: 'JNR',
        divisionType: 'JUNIOR',
        displayOrder: 2,
        status: 'ACTIVE'
    }
];

export const MOCK_INTERHOUSE_STANDINGS: InterHouseCricketStandings[] = [
    {
        cricketCompetitionId: 'ihc-comp-2026',
        divisionId: 'ihc-div-senior',
        houseTeamId: 'house-1',
        houseId: 'house-founders',
        played: 3,
        won: 3,
        lost: 0,
        tied: 0,
        drawn: 0,
        noResults: 0,
        runsFor: 495,
        oversFaced: 58.2,
        runsAgainst: 390,
        oversBowled: 60.0,
        points: 14,
        bonusPoints: 2,
        penaltyPoints: 0,
        netRunRate: 1.85,
        position: 1,
        qualified: true
    },
    {
        cricketCompetitionId: 'ihc-comp-2026',
        divisionId: 'ihc-div-senior',
        houseTeamId: 'house-2',
        houseId: 'house-falcons',
        played: 3,
        won: 2,
        lost: 1,
        tied: 0,
        drawn: 0,
        noResults: 0,
        runsFor: 420,
        oversFaced: 60.0,
        runsAgainst: 395,
        oversBowled: 60.0,
        points: 9,
        bonusPoints: 1,
        penaltyPoints: 0,
        netRunRate: 0.42,
        position: 2,
        qualified: true
    },
    {
        cricketCompetitionId: 'ihc-comp-2026',
        divisionId: 'ihc-div-senior',
        houseTeamId: 'house-3',
        houseId: 'house-lions',
        played: 3,
        won: 1,
        lost: 2,
        tied: 0,
        drawn: 0,
        noResults: 0,
        runsFor: 380,
        oversFaced: 60.0,
        runsAgainst: 420,
        oversBowled: 59.1,
        points: 4,
        bonusPoints: 0,
        penaltyPoints: 0,
        netRunRate: -0.68,
        position: 3,
        qualified: false
    },
    {
        cricketCompetitionId: 'ihc-comp-2026',
        divisionId: 'ihc-div-senior',
        houseTeamId: 'house-4',
        houseId: 'house-eagles',
        played: 3,
        won: 0,
        lost: 3,
        tied: 0,
        drawn: 0,
        noResults: 0,
        runsFor: 340,
        oversFaced: 60.0,
        runsAgainst: 430,
        oversBowled: 58.4,
        points: 0,
        bonusPoints: 0,
        penaltyPoints: 0,
        netRunRate: -1.54,
        position: 4,
        qualified: false
    }
];

export const MOCK_INTERHOUSE_LEDGER: InterHouseCricketPointsLedger[] = [
    {
        transactionId: 'ledger-1',
        cricketCompetitionId: 'ihc-comp-2026',
        fixtureId: 'ihc-fix-1',
        houseTeamId: 'house-1',
        houseId: 'house-founders',
        type: 'WIN',
        points: 4,
        description: 'Win vs Falcons House by 45 runs',
        awardedBy: 'system-auto',
        createdAt: '2026-09-02T16:00:00Z'
    },
    {
        transactionId: 'ledger-2',
        cricketCompetitionId: 'ihc-comp-2026',
        fixtureId: 'ihc-fix-1',
        houseTeamId: 'house-1',
        houseId: 'house-founders',
        type: 'BATTING_BONUS',
        points: 1,
        reason: 'Bonus Point: Win margin > 40 runs',
        description: 'Bonus Point: High run rate win',
        awardedBy: 'system-auto',
        createdAt: '2026-09-02T16:00:00Z'
    } as any
];

export const MOCK_INTERHOUSE_FIXTURES: Fixture[] = [
    {
        id: 'ihc-fix-1',
        fixtureContext: 'INTER_HOUSE',
        cricketCompetitionId: 'ihc-comp-2026',
        cricketDivisionId: 'ihc-div-senior',
        seasonId: 'season-2026',
        sport: 'Cricket',
        homeTeamId: 'house-1', // Founders
        awayTeamId: 'house-2', // Falcons
        houseTeamAId: 'house-1',
        houseTeamBId: 'house-2',
        venueId: 'venue-main-oval',
        fieldId: 'field-main-oval',
        scheduledStartAt: '2026-09-18T14:00:00Z',
        matchType: 'T20 Inter-House Derby',
        oversPerInnings: 20,
        ballsPerOver: 6,
        status: 'scheduled',
        roundName: 'Round 1 Derby',
        notes: 'Founders vs Falcons Senior Trophy Match',
        createdAt: '2026-08-15T00:00:00Z',
        updatedAt: '2026-08-15T00:00:00Z'
    },
    {
        id: 'ihc-fix-2',
        fixtureContext: 'INTER_HOUSE',
        cricketCompetitionId: 'ihc-comp-2026',
        cricketDivisionId: 'ihc-div-senior',
        seasonId: 'season-2026',
        sport: 'Cricket',
        homeTeamId: 'house-3', // Lions
        awayTeamId: 'house-4', // Eagles
        houseTeamAId: 'house-3',
        houseTeamBId: 'house-4',
        venueId: 'venue-main-oval',
        fieldId: 'field-main-oval',
        scheduledStartAt: '2026-09-19T14:00:00Z',
        matchType: 'T20 Inter-House Derby',
        oversPerInnings: 20,
        ballsPerOver: 6,
        status: 'scheduled',
        roundName: 'Round 1 Derby',
        notes: 'Lions vs Eagles Senior Shield Match',
        createdAt: '2026-08-15T00:00:00Z',
        updatedAt: '2026-08-15T00:00:00Z'
    }
];

export class InterHouseService {
    private static houses: HouseCricketTeam[] = [...MOCK_INTERHOUSE_HOUSES];
    private static competitions: InterHouseCricketCompetition[] = [...MOCK_INTERHOUSE_COMPETITIONS];
    private static divisions: InterHouseCricketDivision[] = [...MOCK_INTERHOUSE_DIVISIONS];
    private static rulesets: InterHouseCricketRuleset[] = [MOCK_INTERHOUSE_RULESET];
    private static standings: InterHouseCricketStandings[] = [...MOCK_INTERHOUSE_STANDINGS];
    private static ledger: InterHouseCricketPointsLedger[] = [...MOCK_INTERHOUSE_LEDGER];
    private static fixtures: Fixture[] = [...MOCK_INTERHOUSE_FIXTURES];

    static getCompetitions(schoolId?: string): InterHouseCricketCompetition[] {
        if (!schoolId) return this.competitions;
        return this.competitions.filter(c => c.schoolId === schoolId);
    }

    static getRuleset(id: string): InterHouseCricketRuleset | undefined {
        return this.rulesets.find(r => r.rulesetId === id);
    }

    static getDivisions(competitionId: string): InterHouseCricketDivision[] {
        return this.divisions.filter(d => d.cricketCompetitionId === competitionId);
    }

    static getHouses(schoolId?: string): HouseCricketTeam[] {
        return this.houses;
    }

    static getHouseById(id: string): HouseCricketTeam | undefined {
        return this.houses.find(h => h.houseTeamId === id);
    }

    static getStandings(competitionId: string, divisionId?: string): InterHouseCricketStandings[] {
        return this.standings
            .filter(s => s.cricketCompetitionId === competitionId && (!divisionId || s.divisionId === divisionId))
            .sort((a, b) => b.points - a.points || b.netRunRate - a.netRunRate);
    }

    static getLedger(competitionId: string): InterHouseCricketPointsLedger[] {
        return this.ledger
            .filter(l => l.cricketCompetitionId === competitionId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    static getFixtures(competitionId?: string): Fixture[] {
        if (!competitionId) return this.fixtures;
        return this.fixtures.filter(f => f.cricketCompetitionId === competitionId);
    }
}
