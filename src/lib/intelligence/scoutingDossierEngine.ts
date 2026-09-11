export interface OpponentPlayerThreat {
    id: string;
    name: string;
    role: 'Opener' | 'Top-Order Anchor' | 'Aggressive Middle' | 'Finisher' | 'Strike Bowler' | 'Spinner' | 'All-Rounder';
    threatLevel: 'CRITICAL' | 'HIGH' | 'MODERATE';
    battingStyle: string;
    bowlingStyle: string;
    recentForm: number[]; // Last 5 scores/wickets
    scoringZones: { zone: string; percentage: number }[];
    weaknessTarget: string;
    recommendedTactics: string;
}

export interface OppositionScoutingDossier {
    fixtureId: string;
    homeTeamName: string;
    oppositionTeamName: string;
    oppositionSchoolName: string;
    oppositionLogo?: string;
    venueName: string;
    matchDate: string;
    overallThreatRating: 'EXTREME' | 'HIGH' | 'BALANCED';
    oppositionSummary: {
        recentForm: ('W' | 'L' | 'D')[];
        averageFirstInningsScore: number;
        tossPreference: string;
        powerplayAggressionRating: number; // 1-100
        deathOverEfficiencyRating: number; // 1-100
        spinVsPaceBias: string;
    };
    keyPlayers: OpponentPlayerThreat[];
    tacticalPlans: {
        phase: 'POWERPLAY' | 'MIDDLE_OVERS' | 'DEATH_OVERS';
        battingPlan: string;
        bowlingPlan: string;
        recommendedFieldPlacement: string;
        keyMatchup: string;
    }[];
    generatedAt: string;
}

export const MOCK_OPPOSITION_DOSSIERS: Record<string, OppositionScoutingDossier> = {
    'fix-1st-xi-kes': {
        fixtureId: 'fix-1st-xi-kes',
        homeTeamName: "St John's College 1st XI",
        oppositionTeamName: 'King Edward VII School 1st XI',
        oppositionSchoolName: 'King Edward VII School',
        venueName: 'Mitchell Field, St John\'s',
        matchDate: '2026-09-14',
        overallThreatRating: 'HIGH',
        oppositionSummary: {
            recentForm: ['W', 'W', 'L', 'W', 'W'],
            averageFirstInningsScore: 178,
            tossPreference: 'Elected to BAT 80% of matches',
            powerplayAggressionRating: 88,
            deathOverEfficiencyRating: 76,
            spinVsPaceBias: 'Vulnerable against Left-Arm Finger Spin (SR 94 vs Spin)',
        },
        keyPlayers: [
            {
                id: 'opp-p1',
                name: 'Brandon Hendricks',
                role: 'Opener',
                threatLevel: 'CRITICAL',
                battingStyle: 'Right-Handed Aggressive',
                bowlingStyle: 'Right-Arm Medium Pace',
                recentForm: [68, 84, 12, 54, 91],
                scoringZones: [
                    { zone: 'Cover & Off-Drive', percentage: 42 },
                    { zone: 'Mid-Wicket & Cow Corner', percentage: 35 },
                    { zone: 'Point & Third Man', percentage: 23 },
                ],
                weaknessTarget: 'Full straight delivery early; struggles with incoming seam before scoring 15.',
                recommendedTactics: 'Post a tight extra cover & mid-off ring. Pitch up full on off-stump in overs 1-3.',
            },
            {
                id: 'opp-p2',
                name: 'Sipho Ndlovu',
                role: 'Strike Bowler',
                threatLevel: 'CRITICAL',
                battingStyle: 'Right-Handed Lower Order',
                bowlingStyle: 'Right-Arm Fast Seam',
                recentForm: [3, 4, 1, 2, 4], // Wickets in last 5 matches
                scoringZones: [],
                weaknessTarget: 'Over-pitches when under boundary pressure.',
                recommendedTactics: 'Protect stumps during first spell (Overs 1-4). Target 4th/5th stump line on front foot.',
            },
            {
                id: 'opp-p3',
                name: 'Matthew Miller',
                role: 'Top-Order Anchor',
                threatLevel: 'HIGH',
                battingStyle: 'Left-Handed Technical',
                bowlingStyle: 'Slow Left-Arm Orthodox',
                recentForm: [41, 35, 52, 28, 46],
                scoringZones: [
                    { zone: 'Square Leg & Fine Leg', percentage: 48 },
                    { zone: 'Cover & Mid-Off', percentage: 32 },
                    { zone: 'Straight Down Ground', percentage: 20 },
                ],
                weaknessTarget: 'Struggles to rotate strike against wrist-spin drifting away.',
                recommendedTactics: 'Introduce leg-spin early in middle overs. Deep backward square leg on the boundary.',
            },
            {
                id: 'opp-p4',
                name: 'Liam Van Zyl',
                role: 'Finisher',
                threatLevel: 'MODERATE',
                battingStyle: 'Right-Handed Power Hitter',
                bowlingStyle: 'Right-Arm Off-Break',
                recentForm: [24, 38, 15, 42, 19],
                scoringZones: [
                    { zone: 'Cow Corner & Long-On', percentage: 65 },
                    { zone: 'Point', percentage: 20 },
                    { zone: 'Behind Square', percentage: 15 },
                ],
                weaknessTarget: 'High percentage miss-hits against wide yorkers outside off-stump.',
                recommendedTactics: 'Bowl wide off-stump yorkers with deep cover and long-off posted in overs 18-20.',
            },
        ],
        tacticalPlans: [
            {
                phase: 'POWERPLAY',
                battingPlan: 'Attack bad balls, respect Sipho Ndlovu\'s first 2 overs. Look for singles into extra-cover gap.',
                bowlingPlan: 'Bowl tight full lines to Hendricks. Restrict width on off-stump to prevent cover drives.',
                recommendedFieldPlacement: 'Standard 2 slip, deep third man, tight extra cover, mid-off, mid-on.',
                keyMatchup: 'New-Ball Bowler vs Brandon Hendricks (Target stumps early)',
            },
            {
                phase: 'MIDDLE_OVERS',
                battingPlan: 'Target left-arm spinner Miller down the ground. Rotate strike at 5.5 RPO minimum.',
                bowlingPlan: 'Deploy slow finger spin and leg-spin in tandem. Starve Miller of leg-side boundaries.',
                recommendedFieldPlacement: 'Deep mid-wicket, long-on, deep cover, 4 inside ring fielders.',
                keyMatchup: 'Wrist Spinner vs Matthew Miller (Turn away from left-hander)',
            },
            {
                phase: 'DEATH_OVERS',
                battingPlan: 'Exploit Ndlovu\'s over-pitched deliveries. Clear front leg against full tosses.',
                bowlingPlan: 'Execute wide off-stump yorkers to Liam Van Zyl. Pack the off-side boundary.',
                recommendedFieldPlacement: 'Long-off, long-on, deep cover, deep point, deep mid-wicket.',
                keyMatchup: 'Death Seamer vs Liam Van Zyl (Wide yorker execution)',
            },
        ],
        generatedAt: '2026-09-11 18:15',
    },
};

export function getOppositionDossier(fixtureId: string): OppositionScoutingDossier {
    return MOCK_OPPOSITION_DOSSIERS[fixtureId] || MOCK_OPPOSITION_DOSSIERS['fix-1st-xi-kes'];
}
