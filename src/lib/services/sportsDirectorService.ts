/**
 * SCRBRD Sports Director Executive Service
 * Handles school-wide operational readiness, multi-team governance,
 * staff assignments, workload risk watchlists, and executive briefing metrics.
 */

export interface TeamReadinessTelemetry {
    id: string;
    teamName: string;
    division: string;
    opponent: string;
    fixtureDate: string;
    venue: string;
    squadStatus: 'APPROVED' | 'PENDING_CONFIRMATION' | 'DRAFT';
    availabilityRate: number; // 0-100%
    groundStatus: 'CLEARED' | 'PREP_IN_PROGRESS' | 'UNASSIGNED';
    transportStatus: 'BOARDED' | 'BOOKED' | 'UNASSIGNED';
    staffAssigned: {
        headCoach: string;
        scorer: string;
        umpire: string;
    };
    medicalClearance: boolean;
    overallReadinessScore: number; // 0-100%
}

export interface StaffDutyAssignment {
    id: string;
    name: string;
    role: 'Head Coach' | 'Assistant Coach' | 'Scorer' | 'Umpire' | 'Groundskeeper' | 'Medical Officer';
    teamAssigned: string;
    contact: string;
    status: 'ON_DUTY' | 'STANDBY' | 'UNASSIGNED';
}

export interface WorkloadRiskAlert {
    id: string;
    playerId: string;
    playerName: string;
    teamName: string;
    role: string;
    riskType: 'BOWLING_OVERLOAD' | 'CONSECUTIVE_MATCHES' | 'INJURY_REHAB';
    details: string;
    currentWorkload: string;
    recommendedLimit: string;
    severity: 'HIGH' | 'MODERATE' | 'LOW';
}

export interface SchoolExecutiveMetrics {
    schoolName: string;
    season: string;
    totalActiveSquads: number;
    overallWinRate: number;
    seasonRecord: { wins: number; losses: number; draws: number };
    crossFixtureReadiness: number;
    activeWorkloadAlerts: number;
    pendingApprovalsCount: number;
    totalPlayersRegistered: number;
}

export const MOCK_EXECUTIVE_METRICS: SchoolExecutiveMetrics = {
    schoolName: 'St Stithians College',
    season: '2025/26 Summer Season',
    totalActiveSquads: 6,
    overallWinRate: 78.5,
    seasonRecord: { wins: 28, losses: 7, draws: 1 },
    crossFixtureReadiness: 94,
    activeWorkloadAlerts: 2,
    pendingApprovalsCount: 2,
    totalPlayersRegistered: 142,
};

export const MOCK_TEAM_READINESS_GRID: TeamReadinessTelemetry[] = [
    {
        id: 'tr-1',
        teamName: '1st XI Squad',
        division: 'Premier League',
        opponent: 'King Edward VII School (KES)',
        fixtureDate: 'Saturday, 09:00',
        venue: 'Main Oval (Turf 1)',
        squadStatus: 'APPROVED',
        availabilityRate: 100,
        groundStatus: 'CLEARED',
        transportStatus: 'BOOKED',
        staffAssigned: { headCoach: 'Mark van Buuren', scorer: 'Dave Miller', umpire: 'Craig Evans' },
        medicalClearance: true,
        overallReadinessScore: 98,
    },
    {
        id: 'tr-2',
        teamName: '2nd XI Squad',
        division: 'Reserve League A',
        opponent: 'Jeppe High School for Boys',
        fixtureDate: 'Saturday, 09:30',
        venue: 'Oval 2 (Turf 2)',
        squadStatus: 'APPROVED',
        availabilityRate: 92,
        groundStatus: 'CLEARED',
        transportStatus: 'BOOKED',
        staffAssigned: { headCoach: 'Peter Jacobs', scorer: 'Sarah Jenkins', umpire: 'Gary Bennett' },
        medicalClearance: true,
        overallReadinessScore: 94,
    },
    {
        id: 'tr-3',
        teamName: 'U15A Squad',
        division: 'Junior Premier A',
        opponent: 'Hilton College',
        fixtureDate: 'Saturday, 08:30',
        venue: 'Hilton Oval (Away)',
        squadStatus: 'PENDING_CONFIRMATION',
        availabilityRate: 85,
        groundStatus: 'CLEARED',
        transportStatus: 'BOARDED',
        staffAssigned: { headCoach: 'Grant Campbell', scorer: 'Mark Smith', umpire: 'Unassigned' },
        medicalClearance: false,
        overallReadinessScore: 82,
    },
    {
        id: 'tr-4',
        teamName: 'U15B Squad',
        division: 'Junior Division B',
        opponent: 'St John’s College',
        fixtureDate: 'Saturday, 10:00',
        venue: 'Oval 3 (Artificial)',
        squadStatus: 'APPROVED',
        availabilityRate: 100,
        groundStatus: 'PREP_IN_PROGRESS',
        transportStatus: 'BOOKED',
        staffAssigned: { headCoach: 'James Wright', scorer: 'Tanya Ross', umpire: 'John Peters' },
        medicalClearance: true,
        overallReadinessScore: 90,
    },
    {
        id: 'tr-5',
        teamName: 'U14A Squad',
        division: 'Under 14 League A',
        opponent: 'Bishops Diocesan College',
        fixtureDate: 'Saturday, 09:00',
        venue: 'Dower Oval (Away)',
        squadStatus: 'PENDING_CONFIRMATION',
        availabilityRate: 91,
        groundStatus: 'CLEARED',
        transportStatus: 'BOOKED',
        staffAssigned: { headCoach: 'Sean Adams', scorer: 'Unassigned', umpire: 'Mike Davis' },
        medicalClearance: true,
        overallReadinessScore: 86,
    },
    {
        id: 'tr-6',
        teamName: 'U14B Squad',
        division: 'Under 14 League B',
        opponent: 'Pretoria Boys High',
        fixtureDate: 'Saturday, 11:00',
        venue: 'Junior Field 2',
        squadStatus: 'APPROVED',
        availabilityRate: 100,
        groundStatus: 'CLEARED',
        transportStatus: 'BOOKED',
        staffAssigned: { headCoach: 'David Marais', scorer: 'Paul Botha', umpire: 'David Marais' },
        medicalClearance: true,
        overallReadinessScore: 95,
    },
];

export const MOCK_STAFF_ASSIGNMENTS: StaffDutyAssignment[] = [
    { id: 'st-1', name: 'Mark van Buuren', role: 'Head Coach', teamAssigned: '1st XI Squad', contact: '+27 82 451 9921', status: 'ON_DUTY' },
    { id: 'st-2', name: 'Grant Campbell', role: 'Head Coach', teamAssigned: 'U15A Squad', contact: '+27 83 112 4099', status: 'ON_DUTY' },
    { id: 'st-3', name: 'Dave Miller', role: 'Scorer', teamAssigned: '1st XI Squad', contact: '+27 71 884 1022', status: 'ON_DUTY' },
    { id: 'st-4', name: 'Thabo Ndlovu', role: 'Groundskeeper', teamAssigned: 'Main Oval (Turf 1)', contact: '+27 84 902 3311', status: 'ON_DUTY' },
    { id: 'st-5', name: 'Dr. Rebecca Vance', role: 'Medical Officer', teamAssigned: 'School-wide', contact: '+27 82 990 4112', status: 'STANDBY' },
];

export const MOCK_WORKLOAD_ALERTS: WorkloadRiskAlert[] = [
    {
        id: 'wk-1',
        playerId: 'p-101',
        playerName: 'Jaxon Reed',
        teamName: '1st XI Squad',
        role: 'Fast Bowler',
        riskType: 'BOWLING_OVERLOAD',
        details: 'Bowled 28 overs across 3 days. Approaching CSA U19 weekly maximum (30 overs).',
        currentWorkload: '28 overs / week',
        recommendedLimit: 'Max 6 overs on Saturday',
        severity: 'HIGH',
    },
    {
        id: 'wk-2',
        playerId: 'p-104',
        playerName: 'Ethan Miller',
        teamName: 'U15A Squad',
        role: 'Seam Bowler',
        riskType: 'INJURY_REHAB',
        details: 'Returning from lower back strain. Cleared for 4-over maximum spell.',
        currentWorkload: '4 overs max',
        recommendedLimit: 'Strict 4-over cap',
        severity: 'MODERATE',
    },
];
