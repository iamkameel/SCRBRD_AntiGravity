// Multi-Sport Engine Specification for SCRBRD School Sports OS

export type SportDiscipline =
    | 'CRICKET'
    | 'SWIMMING'
    | 'ATHLETICS'
    | 'RUGBY'
    | 'HOCKEY'
    | 'NETBALL'
    | 'SOCCER'
    | 'BASKETBALL';

export interface SportDisciplineInfo {
    id: SportDiscipline;
    name: string;
    season: 'SUMMER' | 'WINTER' | 'ALL_YEAR';
    scoringUnit: string;
    iconName: string;
    color: string;
    activeSquadsCount: number;
}

export const SUPPORTED_SPORT_DISCIPLINES: SportDisciplineInfo[] = [
    { id: 'CRICKET', name: 'Cricket', season: 'SUMMER', scoringUnit: 'Runs / Wickets', iconName: 'CricketBall', color: '#10b981', activeSquadsCount: 14 },
    { id: 'SWIMMING', name: 'Swimming (Aquatics)', season: 'SUMMER', scoringUnit: 'Times (s) / House Points', iconName: 'Waves', color: '#3b82f6', activeSquadsCount: 8 },
    { id: 'ATHLETICS', name: 'Athletics (Track & Field)', season: 'SUMMER', scoringUnit: 'Times / Marks / Points', iconName: 'Flame', color: '#f59e0b', activeSquadsCount: 12 },
    { id: 'RUGBY', name: 'Rugby Union (15s & 7s)', season: 'WINTER', scoringUnit: 'Tries / Points', iconName: 'Shield', color: '#ef4444', activeSquadsCount: 16 },
    { id: 'HOCKEY', name: 'Field Hockey', season: 'WINTER', scoringUnit: 'Goals', iconName: 'Activity', color: '#8b5cf6', activeSquadsCount: 12 },
    { id: 'NETBALL', name: 'Netball', season: 'WINTER', scoringUnit: 'Goals', iconName: 'Target', color: '#ec4899', activeSquadsCount: 10 },
    { id: 'SOCCER', name: 'Soccer / Football', season: 'WINTER', scoringUnit: 'Goals', iconName: 'Globe', color: '#06b6d4', activeSquadsCount: 14 },
    { id: 'BASKETBALL', name: 'Basketball', season: 'ALL_YEAR', scoringUnit: 'Points', iconName: 'Zap', color: '#f97316', activeSquadsCount: 6 }
];

export interface SwimmingLaneResult {
    lane: number;
    swimmerId: string;
    swimmerName: string;
    houseOrSchool: string;
    seedTime: string;
    finalTime?: string;
    place?: number;
    pointsAwarded?: number;
    isRecordBroken?: boolean;
}

export interface SwimmingEvent {
    eventId: string;
    eventName: string;
    stroke: 'Freestyle' | 'Backstroke' | 'Breaststroke' | 'Butterfly' | 'Medley Relay';
    distance: string;
    ageGroup: 'U14' | 'U15' | 'U16' | 'Open';
    schoolRecord: string;
    recordHolder: string;
    status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
    lanes: SwimmingLaneResult[];
}

export interface HousePointsSummary {
    houseName: string;
    color: string;
    totalPoints: number;
    goldCount: number;
    silverCount: number;
    bronzeCount: number;
    recordsBrokenCount: number;
}

export interface SwimmingGala {
    galaId: string;
    title: string;
    venueName: string;
    poolLength: '25m' | '50m';
    date: string;
    status: 'LIVE' | 'UPCOMING' | 'COMPLETED';
    houses: HousePointsSummary[];
    events: SwimmingEvent[];
}

export interface FieldEventAttempt {
    swimmerOrAthleteName: string;
    houseOrSchool: string;
    attempts: (number | string | 'X' | 'PASS')[];
    bestMark: number;
    place: number;
    points: number;
}

export interface AthleticsEvent {
    eventId: string;
    eventName: string;
    category: 'TRACK' | 'FIELD';
    ageGroup: 'U14' | 'U15' | 'U16' | 'Open';
    schoolRecord: string;
    recordHolder: string;
    status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
    results: FieldEventAttempt[];
}

export interface AthleticsMeet {
    meetId: string;
    title: string;
    venueName: string;
    date: string;
    status: 'LIVE' | 'UPCOMING' | 'COMPLETED';
    houses: HousePointsSummary[];
    events: AthleticsEvent[];
}

// Cross-Sport Player Passport Entry
export interface MultiSportAthletePassport {
    personId: string;
    studentName: string;
    grade: string;
    houseName: string;
    primarySport: SportDiscipline;
    secondarySports: SportDiscipline[];
    combinedWorkloadScore: number; // 0 - 100
    workloadStatus: 'OPTIMAL' | 'MODERATE_LOAD' | 'HIGH_OVERLOAD_RISK';
    sportProfiles: Array<{
        discipline: SportDiscipline;
        teamName: string;
        roleOrPosition: string;
        keyMetricSummary: string;
        awardsCount: number;
    }>;
}

// Universal Facility & Ground Booking Entry
export interface FacilityReservation {
    reservationId: string;
    facilityName: string;
    sportDiscipline: SportDiscipline;
    squadName: string;
    startTime: string;
    endTime: string;
    status: 'CONFIRMED' | 'CONFLICT_FLAGGED' | 'MAINTENANCE_HOLD';
    notes: string;
}

// Institutional Championship Shield Model
export interface ChampionshipStanding {
    schoolOrHouse: string;
    color: string;
    cricketPoints: number;
    swimmingPoints: number;
    athleticsPoints: number;
    rugbyPoints: number;
    hockeyPoints: number;
    overallScore: number;
    rank: number;
}

export const MOCK_SWIMMING_GALA: SwimmingGala = {
    galaId: 'gala-inter-house-2026',
    title: "Annual Inter-House Swimming Gala 2026",
    venueName: "St John's College Aquatics Center (50m Pool)",
    poolLength: '50m',
    date: '2026-09-12',
    status: 'LIVE',
    houses: [
        { houseName: 'Nash', color: '#ef4444', totalPoints: 142, goldCount: 5, silverCount: 3, bronzeCount: 2, recordsBrokenCount: 2 },
        { houseName: 'Hill', color: '#3b82f6', totalPoints: 128, goldCount: 4, silverCount: 4, bronzeCount: 1, recordsBrokenCount: 1 },
        { houseName: 'Thomson', color: '#10b981', totalPoints: 115, goldCount: 3, silverCount: 2, bronzeCount: 5, recordsBrokenCount: 0 },
        { houseName: 'Clayton', color: '#f59e0b', totalPoints: 98, goldCount: 2, silverCount: 3, bronzeCount: 4, recordsBrokenCount: 0 },
    ],
    events: [
        {
            eventId: 'swim-101',
            eventName: 'U16 50m Freestyle Final',
            stroke: 'Freestyle',
            distance: '50m',
            ageGroup: 'U16',
            schoolRecord: '00:25.80',
            recordHolder: 'M. Botha (2023)',
            status: 'COMPLETED',
            lanes: [
                { lane: 1, swimmerId: 'sw-1', swimmerName: 'Liam Carter', houseOrSchool: 'Hill', seedTime: '00:27.10', finalTime: '00:26.90', place: 4, pointsAwarded: 5 },
                { lane: 2, swimmerId: 'sw-2', swimmerName: 'Sebastian Roux', houseOrSchool: 'Nash', seedTime: '00:25.95', finalTime: '00:25.42', place: 1, pointsAwarded: 10, isRecordBroken: true },
                { lane: 3, swimmerId: 'sw-3', swimmerName: 'Daniel Vance', houseOrSchool: 'Thomson', seedTime: '00:26.40', finalTime: '00:26.15', place: 2, pointsAwarded: 8 },
                { lane: 4, swimmerId: 'sw-4', swimmerName: 'Joshua Naidoo', houseOrSchool: 'Clayton', seedTime: '00:26.80', finalTime: '00:26.50', place: 3, pointsAwarded: 6 },
            ],
        },
        {
            eventId: 'swim-102',
            eventName: 'Open 100m Butterfly Final',
            stroke: 'Butterfly',
            distance: '100m',
            ageGroup: 'Open',
            schoolRecord: '00:58.40',
            recordHolder: 'R. Stewart (2021)',
            status: 'IN_PROGRESS',
            lanes: [
                { lane: 1, swimmerId: 'sw-5', swimmerName: 'Tristan Meyer', houseOrSchool: 'Nash', seedTime: '00:59.80' },
                { lane: 2, swimmerId: 'sw-6', swimmerName: 'Kameel Kalyan', houseOrSchool: 'Hill', seedTime: '00:58.90' },
                { lane: 3, swimmerId: 'sw-7', swimmerName: 'Ethan Botes', houseOrSchool: 'Thomson', seedTime: '01:01.20' },
                { lane: 4, swimmerId: 'sw-8', swimmerName: 'Matthew Miller', houseOrSchool: 'Clayton', seedTime: '01:02.50' },
            ],
        },
    ],
};

export const MOCK_ATHLETICS_MEET: AthleticsMeet = {
    meetId: 'meet-inter-house-2026',
    title: 'Annual Championship Athletics Meet 2026',
    venueName: 'Burger Field Stadium Track',
    date: '2026-09-18',
    status: 'LIVE',
    houses: [
        { houseName: 'Hill', color: '#3b82f6', totalPoints: 185, goldCount: 7, silverCount: 4, bronzeCount: 3, recordsBrokenCount: 1 },
        { houseName: 'Nash', color: '#ef4444', totalPoints: 172, goldCount: 6, silverCount: 5, bronzeCount: 2, recordsBrokenCount: 2 },
        { houseName: 'Clayton', color: '#f59e0b', totalPoints: 140, goldCount: 4, silverCount: 3, bronzeCount: 6, recordsBrokenCount: 0 },
        { houseName: 'Thomson', color: '#10b981', totalPoints: 124, goldCount: 3, silverCount: 4, bronzeCount: 4, recordsBrokenCount: 0 },
    ],
    events: [
        {
            eventId: 'ath-201',
            eventName: 'Open High Jump Final',
            category: 'FIELD',
            ageGroup: 'Open',
            schoolRecord: '2.05m',
            recordHolder: 'C. Venter (2019)',
            status: 'COMPLETED',
            results: [
                { swimmerOrAthleteName: 'Christopher Coetzee', houseOrSchool: 'Nash', attempts: [1.85, 1.90, 1.95, 2.00, 2.07], bestMark: 2.07, place: 1, points: 10 },
                { swimmerOrAthleteName: 'David Smith', houseOrSchool: 'Hill', attempts: [1.85, 1.90, 1.95, 2.00, 'X'], bestMark: 2.00, place: 2, points: 8 },
                { swimmerOrAthleteName: 'Sipho Ndlovu', houseOrSchool: 'Thomson', attempts: [1.80, 1.85, 1.90, 'X', 'X'], bestMark: 1.90, place: 3, points: 6 },
            ],
        },
        {
            eventId: 'ath-202',
            eventName: 'U16 100m Sprint Final',
            category: 'TRACK',
            ageGroup: 'U16',
            schoolRecord: '10.82s',
            recordHolder: 'T. Dlamini (2022)',
            status: 'IN_PROGRESS',
            results: [
                { swimmerOrAthleteName: 'Brandon Hendricks', houseOrSchool: 'Nash', attempts: ['10.74s'], bestMark: 10.74, place: 1, points: 10 },
                { swimmerOrAthleteName: 'Liam Van Zyl', houseOrSchool: 'Hill', attempts: ['11.02s'], bestMark: 11.02, place: 2, points: 8 },
                { swimmerOrAthleteName: 'Marcus Thorne', houseOrSchool: 'Clayton', attempts: ['11.15s'], bestMark: 11.15, place: 3, points: 6 },
            ],
        },
    ],
};

export const MOCK_MULTI_SPORT_PASSPORTS: MultiSportAthletePassport[] = [
    {
        personId: 'p-101',
        studentName: 'Aidan Smith',
        grade: 'Grade 11',
        houseName: 'Nash',
        primarySport: 'CRICKET',
        secondarySports: ['RUGBY', 'SWIMMING'],
        combinedWorkloadScore: 84,
        workloadStatus: 'HIGH_OVERLOAD_RISK',
        sportProfiles: [
            { discipline: 'CRICKET', teamName: '1st XI Squad', roleOrPosition: 'Opener / Wicketkeeper', keyMetricSummary: '458 runs @ 45.8 Avg', awardsCount: 3 },
            { discipline: 'RUGBY', teamName: '1st XV Squad', roleOrPosition: 'Fly-half (No. 10)', keyMetricSummary: '82 pts (4 Tries, 18 Conv, 6 Pen)', awardsCount: 2 },
            { discipline: 'SWIMMING', teamName: 'Aquatics Gala Team', roleOrPosition: '50m Freestyle / Relay', keyMetricSummary: '00:26.10 Personal Best', awardsCount: 1 }
        ]
    },
    {
        personId: 'p-102',
        studentName: 'Sebastian Roux',
        grade: 'Grade 10',
        houseName: 'Hill',
        primarySport: 'SWIMMING',
        secondarySports: ['ATHLETICS', 'HOCKEY'],
        combinedWorkloadScore: 48,
        workloadStatus: 'OPTIMAL',
        sportProfiles: [
            { discipline: 'SWIMMING', teamName: 'Open Swim Squad', roleOrPosition: '50m & 100m Freestyle', keyMetricSummary: 'School Record 00:25.42', awardsCount: 4 },
            { discipline: 'ATHLETICS', teamName: 'Track Squad', roleOrPosition: '100m Sprint', keyMetricSummary: '10.94s Personal Best', awardsCount: 2 },
            { discipline: 'HOCKEY', teamName: 'U16A Squad', roleOrPosition: 'Center Forward', keyMetricSummary: '12 Goals in 8 Matches', awardsCount: 1 }
        ]
    }
];

export const MOCK_FACILITY_RESERVATIONS: FacilityReservation[] = [
    { reservationId: 'res-1', facilityName: 'Main Oval Turf 1', sportDiscipline: 'CRICKET', squadName: '1st XI Squad', startTime: '14:00', endTime: '17:30', status: 'CONFIRMED', notes: 'Match prep & turf practice' },
    { reservationId: 'res-2', facilityName: 'Aquatics 50m Pool', sportDiscipline: 'SWIMMING', squadName: 'Senior Swim Squad', startTime: '06:00', endTime: '07:30', status: 'CONFIRMED', notes: 'Morning squad training' },
    { reservationId: 'res-3', facilityName: 'Astro Turf 1', sportDiscipline: 'HOCKEY', squadName: '1st XI Hockey', startTime: '15:30', endTime: '17:00', status: 'CONFIRMED', notes: 'Inter-school fixture' },
    { reservationId: 'res-4', facilityName: 'Burger Field Stadium', sportDiscipline: 'RUGBY', squadName: '1st XV Rugby', startTime: '16:00', endTime: '18:00', status: 'CONFLICT_FLAGGED', notes: 'Double booking detected with Athletics Track team!' }
];

export const MOCK_CHAMPIONSHIP_STANDINGS: ChampionshipStanding[] = [
    { schoolOrHouse: 'St Stithians College / Nash', color: '#ef4444', cricketPoints: 95, swimmingPoints: 142, athleticsPoints: 172, rugbyPoints: 110, hockeyPoints: 88, overallScore: 607, rank: 1 },
    { schoolOrHouse: 'KES / Hill', color: '#3b82f6', cricketPoints: 88, swimmingPoints: 128, athleticsPoints: 185, rugbyPoints: 120, hockeyPoints: 76, overallScore: 597, rank: 2 },
    { schoolOrHouse: 'Jeppe Boys / Thomson', color: '#10b981', cricketPoints: 92, swimmingPoints: 115, athleticsPoints: 124, rugbyPoints: 95, hockeyPoints: 94, overallScore: 520, rank: 3 },
    { schoolOrHouse: 'Hilton / Clayton', color: '#f59e0b', cricketPoints: 78, swimmingPoints: 98, athleticsPoints: 140, rugbyPoints: 105, hockeyPoints: 80, overallScore: 501, rank: 4 }
];
