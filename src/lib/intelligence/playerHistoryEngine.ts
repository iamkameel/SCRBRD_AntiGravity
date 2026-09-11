/**
 * SCRBRD Player History & Longitudinal Analytics Engine
 * Manages career milestones, accolades, season-over-season statistics,
 * domain skill progression, and Head-to-Head player comparison data.
 */

export interface CareerMilestone {
    id: string;
    title: string;
    type: 'RUNS' | 'WICKETS' | 'DEBUT' | 'CAPTAINCY' | 'RECORD';
    season: string;
    achievedOn: string;
    description: string;
    iconName?: string;
}

export interface CareerAward {
    id: string;
    title: string;
    awardingBody: string;
    season: string;
    awardedOn: string;
    description: string;
}

export interface CareerAccolade {
    id: string;
    source: string;
    season: string;
    notedOn: string;
    comments: string;
    tags: string[];
}

export interface CareerInjuryLog {
    id: string;
    injuryType: string;
    severity: 'MILD' | 'MODERATE' | 'SEVERE';
    occurredOn: string;
    clearanceDate: string;
    notes: string;
    status: 'CLEARED' | 'REHAB' | 'MANAGED';
}

export interface SeasonStatSummary {
    season: string;
    teamName: string;
    matchesPlayed: number;
    batting: {
        runs: number;
        average: number;
        strikeRate: number;
        fifties: number;
        hundreds: number;
        highestScore: string;
    };
    bowling: {
        wickets: number;
        average: number;
        economy: number;
        bestFigures: string;
        overs: number;
    };
    fielding: {
        catches: number;
        stumpings: number;
        runOuts: number;
    };
}

export interface DomainSkillProgression {
    season: string;
    domains: {
        batting: number;
        bowling: number;
        fielding: number;
        wicketkeeping: number;
        physical: number;
        mental: number;
        tactical: number;
    };
    compositeIndex: number;
}

export interface PlayerCareerProfile {
    id: string;
    firstName: string;
    lastName: string;
    displayName: string;
    avatarUrl?: string;
    schoolName: string;
    currentTeam: string;
    primaryRole: string;
    secondaryRole?: string;
    battingStyle: string;
    bowlingStyle: string;
    readinessScore: number;
    readinessStatus: 'FULLY_FIT' | 'MANAGED' | 'UNAVAILABLE';
    milestones: CareerMilestone[];
    awards: CareerAward[];
    accolades: CareerAccolade[];
    injuryLogs: CareerInjuryLog[];
    seasonStats: SeasonStatSummary[];
    skillProgression: DomainSkillProgression[];
}

// Mock career profiles database for high-fidelity demonstration
export const MOCK_CAREER_PROFILES: Record<string, PlayerCareerProfile> = {
    'player-1': {
        id: 'player-1',
        firstName: 'Liam',
        lastName: 'Peterson',
        displayName: 'L. Peterson',
        schoolName: 'St Stithians College',
        currentTeam: '1st XI Squad',
        primaryRole: 'Opener',
        secondaryRole: 'Top-order Anchor',
        battingStyle: 'Right-hand bat',
        bowlingStyle: 'Right-arm medium fast',
        readinessScore: 94,
        readinessStatus: 'FULLY_FIT',
        milestones: [
            { id: 'm-1', title: '500 Career Runs', type: 'RUNS', season: '2025/26', achievedOn: '2026-02-14', description: 'Reached 500 First XI career runs with a 78 against Hilton College.' },
            { id: 'm-2', title: '1st XI Debut', type: 'DEBUT', season: '2024/25', achievedOn: '2024-10-12', description: 'Made First XI debut vs KES aged 15.' },
            { id: 'm-3', title: 'Captaincy Appointment', type: 'CAPTAINCY', season: '2025/26', achievedOn: '2025-11-01', description: 'Appointed 1st XI Vice-Captain for the summer series.' },
        ],
        awards: [
            { id: 'a-1', title: 'Batter of the Tournament', awardingBody: 'Gauteng Schools T20 Slam', season: '2025', awardedOn: '2025-12-05', description: 'Top scorer with 312 runs at average 62.4.' },
            { id: 'a-2', title: 'Player of the Match', awardingBody: 'Independent Schools Festival', season: '2025', awardedOn: '2025-09-20', description: 'Scored 94 off 62 balls vs Bishops.' },
        ],
        accolades: [
            { id: 'acc-1', source: 'Head Coach Review', season: '2025/26', notedOn: '2026-01-15', comments: 'Demonstrates elite gap awareness and composure under high powerplay pressure.', tags: ['Leadership', 'Composure', 'Pace Hitter'] },
            { id: 'acc-2', source: 'Provincial Scout Log', season: '2025/26', notedOn: '2025-11-28', comments: 'Flagged for Lions U19 Invitational squad selection.', tags: ['Elite Prospect', 'Lions U19'] },
        ],
        injuryLogs: [
            { id: 'inj-1', injuryType: 'Right Hamstring Strain', severity: 'MILD', occurredOn: '2025-08-10', clearanceDate: '2025-09-01', notes: 'Full rehab completed with biokineticist clearance.', status: 'CLEARED' },
        ],
        seasonStats: [
            { season: '2024', teamName: 'U15A XI', matchesPlayed: 12, batting: { runs: 380, average: 38.0, strikeRate: 118.5, fifties: 3, hundreds: 0, highestScore: '74*' }, bowling: { wickets: 4, average: 28.5, economy: 5.4, bestFigures: '2/18', overs: 21 }, fielding: { catches: 8, stumpings: 0, runOuts: 2 } },
            { season: '2025', teamName: '1st XI Squad', matchesPlayed: 16, batting: { runs: 560, average: 43.1, strikeRate: 132.8, fifties: 5, hundreds: 1, highestScore: '104' }, bowling: { wickets: 6, average: 22.0, economy: 4.9, bestFigures: '2/14', overs: 27 }, fielding: { catches: 11, stumpings: 0, runOuts: 3 } },
            { season: '2026', teamName: '1st XI Squad', matchesPlayed: 8, batting: { runs: 340, average: 48.5, strikeRate: 141.2, fifties: 3, hundreds: 0, highestScore: '88*' }, bowling: { wickets: 2, average: 31.0, economy: 5.1, bestFigures: '1/12', overs: 12 }, fielding: { catches: 6, stumpings: 0, runOuts: 1 } },
        ],
        skillProgression: [
            { season: '2024', domains: { batting: 72, bowling: 45, fielding: 68, wicketkeeping: 20, physical: 70, mental: 72, tactical: 75 }, compositeIndex: 67 },
            { season: '2025', domains: { batting: 81, bowling: 50, fielding: 74, wicketkeeping: 20, physical: 78, mental: 80, tactical: 84 }, compositeIndex: 76 },
            { season: '2026', domains: { batting: 88, bowling: 52, fielding: 79, wicketkeeping: 20, physical: 84, mental: 86, tactical: 91 }, compositeIndex: 83 },
        ]
    },
    'player-2': {
        id: 'player-2',
        firstName: 'Rohan',
        lastName: 'Sharma',
        displayName: 'R. Sharma',
        schoolName: 'King Edward VII School (KES)',
        currentTeam: '1st XI Squad',
        primaryRole: 'Bowling All-Rounder',
        secondaryRole: 'Death Bowler',
        battingStyle: 'Right-hand bat',
        bowlingStyle: 'Right-arm fast medium',
        readinessScore: 88,
        readinessStatus: 'MANAGED',
        milestones: [
            { id: 'm-20', title: '50 Career Wickets', type: 'WICKETS', season: '2025/26', achievedOn: '2026-01-28', description: 'Captured 50th First XI wicket with a yorker vs Jeppe.' },
            { id: 'm-21', title: 'Best Bowling 5/19', type: 'RECORD', season: '2025/26', achievedOn: '2025-10-18', description: 'Career best 5-wicket haul vs Westville Boys.' },
        ],
        awards: [
            { id: 'a-20', title: 'Bowler of the Year', awardingBody: 'KES Cricket Academy', season: '2025', awardedOn: '2025-11-15', description: 'Leading wicket taker with 34 wickets.' },
        ],
        accolades: [
            { id: 'acc-20', source: 'Bowling Coach Log', season: '2025/26', notedOn: '2026-02-02', comments: 'Exceptional seam seam control and death over execution under pressure.', tags: ['Death Bowler', 'Seam Control'] },
        ],
        injuryLogs: [
            { id: 'inj-20', injuryType: 'Lumbar Stress Reaction', severity: 'MODERATE', occurredOn: '2024-11-05', clearanceDate: '2025-01-10', notes: 'Overload managed to 4-over maximum spells.', status: 'MANAGED' },
        ],
        seasonStats: [
            { season: '2024', teamName: 'U15A XI', matchesPlayed: 11, batting: { runs: 180, average: 22.5, strikeRate: 110.0, fifties: 1, hundreds: 0, highestScore: '45*' }, bowling: { wickets: 22, average: 16.4, economy: 4.2, bestFigures: '4/16', overs: 62 }, fielding: { catches: 5, stumpings: 0, runOuts: 1 } },
            { season: '2025', teamName: '1st XI Squad', matchesPlayed: 18, batting: { runs: 290, average: 26.3, strikeRate: 124.5, fifties: 2, hundreds: 0, highestScore: '58' }, bowling: { wickets: 34, average: 14.8, economy: 4.4, bestFigures: '5/19', overs: 104 }, fielding: { catches: 9, stumpings: 0, runOuts: 4 } },
            { season: '2026', teamName: '1st XI Squad', matchesPlayed: 7, batting: { runs: 140, average: 28.0, strikeRate: 130.0, fifties: 1, hundreds: 0, highestScore: '52*' }, bowling: { wickets: 15, average: 13.2, economy: 4.1, bestFigures: '4/22', overs: 42 }, fielding: { catches: 4, stumpings: 0, runOuts: 1 } },
        ],
        skillProgression: [
            { season: '2024', domains: { batting: 55, bowling: 74, fielding: 65, wicketkeeping: 15, physical: 76, mental: 70, tactical: 68 }, compositeIndex: 66 },
            { season: '2025', domains: { batting: 65, bowling: 84, fielding: 72, wicketkeeping: 15, physical: 82, mental: 78, tactical: 76 }, compositeIndex: 76 },
            { season: '2026', domains: { batting: 70, bowling: 90, fielding: 76, wicketkeeping: 15, physical: 86, mental: 82, tactical: 81 }, compositeIndex: 82 },
        ]
    }
};

/**
 * Calculates role suitability score (0-100) based on domain ratings
 */
export function calculateRoleSuitability(
    role: string,
    domains: DomainSkillProgression['domains']
): number {
    switch (role) {
        case 'Opener':
            return Math.round(domains.batting * 0.45 + domains.tactical * 0.25 + domains.mental * 0.2 + domains.physical * 0.1);
        case 'Top-order Anchor':
            return Math.round(domains.batting * 0.4 + domains.mental * 0.3 + domains.tactical * 0.2 + domains.physical * 0.1);
        case 'Death Bowler':
            return Math.round(domains.bowling * 0.5 + domains.mental * 0.25 + domains.tactical * 0.15 + domains.physical * 0.1);
        case 'Bowling All-Rounder':
            return Math.round(domains.bowling * 0.4 + domains.batting * 0.3 + domains.physical * 0.15 + domains.tactical * 0.15);
        case 'Wicketkeeper-Batter':
            return Math.round(domains.wicketkeeping * 0.35 + domains.batting * 0.35 + domains.fielding * 0.15 + domains.mental * 0.15);
        default:
            return Math.round(domains.batting * 0.3 + domains.bowling * 0.3 + domains.tactical * 0.2 + domains.mental * 0.2);
    }
}

/**
 * Generates an automated head-to-head tactical decision insight
 */
export function generateH2HInsight(playerA: PlayerCareerProfile, playerB: PlayerCareerProfile): string {
    const latestAProg = playerA.skillProgression[playerA.skillProgression.length - 1];
    const latestBProg = playerB.skillProgression[playerB.skillProgression.length - 1];
    const latestA = latestAProg.domains;
    const latestB = latestBProg.domains;

    if (latestA.batting > latestB.batting && latestB.bowling > latestA.bowling) {
        return `${playerA.displayName} dominates in top-order batting execution (Batting: ${latestA.batting} vs ${latestB.batting}), whereas ${playerB.displayName} provides superior bowling strike power (Bowling: ${latestB.bowling} vs ${latestA.bowling}). Ideal for complementary squad roles.`;
    }

    if (latestAProg.compositeIndex > latestBProg.compositeIndex) {
        return `${playerA.displayName} holds a higher composite development index (${latestAProg.compositeIndex} vs ${latestBProg.compositeIndex}), backed by strong tactical decision-making and consistency across recent seasons.`;
    }

    return `${playerB.displayName} demonstrates superior physical durability and economy under pressure, giving them an edge in high-stress match situations.`;
}
