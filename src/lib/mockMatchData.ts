// Mock match data for Live Scoring Hub & Scorer Console fallback
export interface MockMatchData {
    id: string;
    homeTeamName: string;
    awayTeamName: string;
    homeSchoolName: string;
    awaySchoolName: string;
    homeLogo?: string;
    awayLogo?: string;
    matchType: string; // e.g. "50-over", "T20"
    division: string;
    venue: string;
    field: string;
    scheduledTime: string;
    state: 'LIVE' | 'INNINGS_BREAK' | 'SCHEDULED' | 'COMPLETED';
    currentInnings: 1 | 2;
    liveScore: {
        battingTeam: string;
        bowlingTeam: string;
        totalRuns: number;
        wickets: number;
        overs: number;
        ballsInOver: number;
        currentRunRate: string;
        requiredRunRate?: string;
        target?: number;
        striker: { name: string; runs: number; balls: number; fours: number; sixes: number };
        nonStriker: { name: string; runs: number; balls: number; fours: number; sixes: number };
        currentBowler: { name: string; overs: string; maidens: number; runs: number; wickets: number };
        recentBalls: string[];
        partnership: { runs: number; balls: number };
    };
    commentaryFeed: Array<{ id: string; over: string; event: string; text: string; time: string }>;
}

export const MOCK_MATCHES: MockMatchData[] = [
    {
        id: "wbhs-vs-kearsney-2026",
        homeTeamName: "Westville 1st XI",
        awayTeamName: "Kearsney 1st XI",
        homeSchoolName: "Westville Boys' High School",
        awaySchoolName: "Kearsney College",
        matchType: "50-over",
        division: "KZN Coastal Super League",
        venue: "Commons Field, Westville",
        field: "Commons Main Oval",
        scheduledTime: "Today, 09:30 AM",
        state: "LIVE",
        currentInnings: 1,
        liveScore: {
            battingTeam: "Westville 1st XI",
            bowlingTeam: "Kearsney 1st XI",
            totalRuns: 184,
            wickets: 3,
            overs: 34,
            ballsInOver: 4,
            currentRunRate: "5.32",
            striker: { name: "Kameel Kalyan", runs: 74, balls: 82, fours: 8, sixes: 2 },
            nonStriker: { name: "Matthew Simpson", runs: 41, balls: 53, fours: 4, sixes: 0 },
            currentBowler: { name: "James Anderson", overs: "7.4", maidens: 1, runs: 38, wickets: 2 },
            recentBalls: ["1", "4", "0", "1", "6"],
            partnership: { runs: 88, balls: 94 }
        },
        commentaryFeed: [
            { id: "c1", over: "34.4", event: "SIX", text: "Kalyan steps down the pitch and lofts Anderson clean over long-on for a majestic 6!", time: "14:22" },
            { id: "c2", over: "34.3", event: "1 RUN", text: "Simpson pushes to cover point for a sharp single.", time: "14:21" },
            { id: "c3", over: "34.2", event: "DOT", text: "Good length outside off, defended back down the strip.", time: "14:20" },
            { id: "c4", over: "34.1", event: "FOUR", text: "CRUNCHED! Kalyan rocks back and pulls hard through mid-wicket for four.", time: "14:19" }
        ]
    },
    {
        id: "hilton-vs-michaelhouse-2026",
        homeTeamName: "Hilton 1st XI",
        awayTeamName: "Michaelhouse 1st XI",
        homeSchoolName: "Hilton College",
        awaySchoolName: "Michaelhouse",
        matchType: "50-over",
        division: "Inland Premier Trophy",
        venue: "Gilfillan Field, Hilton",
        field: "Gilfillan Oval",
        scheduledTime: "Today, 10:00 AM",
        state: "LIVE",
        currentInnings: 2,
        liveScore: {
            battingTeam: "Michaelhouse 1st XI",
            bowlingTeam: "Hilton 1st XI",
            totalRuns: 142,
            wickets: 5,
            overs: 28,
            ballsInOver: 2,
            currentRunRate: "5.01",
            requiredRunRate: "4.81",
            target: 248,
            striker: { name: "David Miller", runs: 38, balls: 42, fours: 3, sixes: 1 },
            nonStriker: { name: "Callum Taylor", runs: 12, balls: 19, fours: 1, sixes: 0 },
            currentBowler: { name: "Tristan Stubbs", overs: "6.2", maidens: 0, runs: 32, wickets: 2 },
            recentBalls: ["0", "1", "W", "4", "1"],
            partnership: { runs: 26, balls: 31 }
        },
        commentaryFeed: [
            { id: "ch1", over: "28.2", event: "SINGLE", text: "Miller works it off his pads down to fine leg.", time: "14:18" },
            { id: "ch2", over: "28.1", event: "FOUR", text: "Shot! Driven on the up through extra cover for a boundary.", time: "14:17" }
        ]
    },
    {
        id: "maritzburg-vs-glenwood-2026",
        homeTeamName: "Maritzburg College 1st XI",
        awayTeamName: "Glenwood High 1st XI",
        homeSchoolName: "Maritzburg College",
        awaySchoolName: "Glenwood High School",
        matchType: "T20",
        division: "Night Series Cup",
        venue: "Goldstones, Pietermaritzburg",
        field: "Goldstones Oval",
        scheduledTime: "Today, 15:30 PM",
        state: "SCHEDULED",
        currentInnings: 1,
        liveScore: {
            battingTeam: "Maritzburg College 1st XI",
            bowlingTeam: "Glenwood High 1st XI",
            totalRuns: 0,
            wickets: 0,
            overs: 0,
            ballsInOver: 0,
            currentRunRate: "0.00",
            striker: { name: "TBD", runs: 0, balls: 0, fours: 0, sixes: 0 },
            nonStriker: { name: "TBD", runs: 0, balls: 0, fours: 0, sixes: 0 },
            currentBowler: { name: "TBD", overs: "0.0", maidens: 0, runs: 0, wickets: 0 },
            recentBalls: [],
            partnership: { runs: 0, balls: 0 }
        },
        commentaryFeed: []
    },
    {
        id: "st-charles-vs-dhs-2026",
        homeTeamName: "St Charles 1st XI",
        awayTeamName: "DHS 1st XI",
        homeSchoolName: "St Charles College",
        awaySchoolName: "Durban High School",
        matchType: "50-over",
        division: "KZN Coastal Super League",
        venue: "St Charles Main Oval",
        field: "Oval 1",
        scheduledTime: "Yesterday, 09:30 AM",
        state: "COMPLETED",
        currentInnings: 2,
        liveScore: {
            battingTeam: "DHS 1st XI",
            bowlingTeam: "St Charles 1st XI",
            totalRuns: 215,
            wickets: 6,
            overs: 46,
            ballsInOver: 3,
            currentRunRate: "4.64",
            target: 212,
            striker: { name: "L. Smith", runs: 62, balls: 78, fours: 6, sixes: 1 },
            nonStriker: { name: "J. Botha", runs: 18, balls: 24, fours: 2, sixes: 0 },
            currentBowler: { name: "R. van Zyl", overs: "9.3", maidens: 1, runs: 45, wickets: 3 },
            recentBalls: ["1", "4", "4"],
            partnership: { runs: 42, balls: 38 }
        },
        commentaryFeed: [
            { id: "sc1", over: "46.3", event: "FOUR", text: "DHS win by 4 wickets! Smith drives to the boundary to seal victory.", time: "16:45" }
        ]
    }
];

export function getMockMatch(id: string): MockMatchData {
    return MOCK_MATCHES.find(m => m.id === id) || MOCK_MATCHES[0];
}

export function isMockMatch(matchId: string): boolean {
    return MOCK_MATCHES.some(m => m.id === matchId);
}

export function getMockSquad(teamName: string): any[] {
    const isWestville = teamName.toLowerCase().includes('westville') || teamName.toLowerCase().includes('wbhs');

    const players = isWestville ? [
        { id: 'wbhs-1', firstName: 'Kameel', lastName: 'Kalyan', playingRole: 'Top-order Anchor' },
        { id: 'wbhs-2', firstName: 'Matthew', lastName: 'Simpson', playingRole: 'Opener' },
        { id: 'wbhs-3', firstName: 'Ethan', lastName: 'Coetzee', playingRole: 'Batting All-rounder' },
        { id: 'wbhs-4', firstName: 'Tristan', lastName: 'Naidoo', playingRole: 'Specialist Wicketkeeper' },
        { id: 'wbhs-5', firstName: 'David', lastName: 'Miller', playingRole: 'Aggressive Middle-order Batter' },
        { id: 'wbhs-6', firstName: 'Joshua', lastName: 'van Zyl', playingRole: 'Spin Bowler' },
        { id: 'wbhs-7', firstName: 'Liam', lastName: 'Pillay', playingRole: 'Strike Pace Bowler' },
        { id: 'wbhs-8', firstName: 'Nathan', lastName: 'Govender', playingRole: 'Bowling All-rounder' },
        { id: 'wbhs-9', firstName: 'Caleb', lastName: 'Smith', playingRole: 'New-ball Seamer' },
        { id: 'wbhs-10', firstName: 'Benjamin', lastName: 'Botha', playingRole: 'Finger Spinner' },
        { id: 'wbhs-11', firstName: 'Daniel', lastName: 'Kruger', playingRole: 'Containment Seamer' },
        { id: 'wbhs-12', firstName: 'Michael', lastName: 'Taylor', playingRole: 'Reserve Batter' },
        { id: 'wbhs-13', firstName: 'Ryan', lastName: 'Smit', playingRole: 'Reserve Bowler' },
        { id: 'wbhs-14', firstName: 'Christopher', lastName: 'Brown', playingRole: 'Reserve Keeper' },
        { id: 'wbhs-15', firstName: 'Brandon', lastName: 'Williams', playingRole: 'All-rounder' },
    ] : [
        { id: 'kc-1', firstName: 'James', lastName: 'Anderson', playingRole: 'Strike Pace Bowler' },
        { id: 'kc-2', firstName: 'Oliver', lastName: 'Montgomery', playingRole: 'Opener' },
        { id: 'kc-3', firstName: 'Alexander', lastName: 'Wright', playingRole: 'Top-order Anchor' },
        { id: 'kc-4', firstName: 'Nicholas', lastName: 'Campbell', playingRole: 'Wicketkeeper-Batter' },
        { id: 'kc-5', firstName: 'Samuel', lastName: 'Davies', playingRole: 'Batting All-rounder' },
        { id: 'kc-6', firstName: 'Harrison', lastName: 'Ford', playingRole: 'Middle-order Stabiliser' },
        { id: 'kc-7', firstName: 'Sebastian', lastName: 'King', playingRole: 'Finger Spinner' },
        { id: 'kc-8', firstName: 'Dominic', lastName: 'Shaw', playingRole: 'Wrist Spinner' },
        { id: 'kc-9', firstName: 'Lucas', lastName: 'Bennett', playingRole: 'New-ball Seamer' },
        { id: 'kc-10', firstName: 'Gabriel', lastName: 'Ross', playingRole: 'Death Bowler' },
        { id: 'kc-11', firstName: 'Zachary', lastName: 'Howard', playingRole: 'Containment Seamer' },
        { id: 'kc-12', firstName: 'Edward', lastName: 'Hughes', playingRole: 'Reserve Batter' },
        { id: 'kc-13', firstName: 'Toby', lastName: 'Foster', playingRole: 'Reserve Bowler' },
        { id: 'kc-14', firstName: 'Adam', lastName: 'Butler', playingRole: 'Reserve All-rounder' },
        { id: 'kc-15', firstName: 'Henry', lastName: 'Cox', playingRole: 'Reserve Keeper' },
    ];

    return players.map(p => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        displayName: `${p.firstName} ${p.lastName}`,
        playingRole: p.playingRole,
        dateOfBirth: '2008-05-14',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }));
}
