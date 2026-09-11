// Multi-Sport Engine Specification for SCRBRD School Sports OS

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
    eventName: string; // e.g. "U16 50m Freestyle Final"
    stroke: 'Freestyle' | 'Backstroke' | 'Breaststroke' | 'Butterfly' | 'Medley Relay';
    distance: string; // "50m", "100m", "4x50m"
    ageGroup: 'U14' | 'U15' | 'U16' | 'Open';
    schoolRecord: string; // "00:26.85"
    recordHolder: string; // "J. Miller (2022)"
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
    attempts: (number | string | 'X' | 'PASS')[]; // Distances in meters, times in seconds, or 'X' for foul
    bestMark: number;
    place: number;
    points: number;
}

export interface AthleticsEvent {
    eventId: string;
    eventName: string; // e.g. "Open High Jump" or "U15 100m Final"
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
