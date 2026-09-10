export type SportType = 'cricket' | 'swimming' | 'athletics' | 'rugby' | 'hockey';

export type StrokeType = 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'medley';

export interface SwimmingEvent {
    id: string;
    eventName: string; // e.g. "U19 Boys 50m Freestyle"
    distanceMeters: number;
    stroke: StrokeType;
    ageGroup: string;
    gender: 'Boys' | 'Girls' | 'Coed';
    isRelay: boolean;
    recordTime: string; // "00:23.85"
    recordHolder: string;
    status: 'Scheduled' | 'Live' | 'Completed';
    heatNumber: number;
    lanes: GalaLaneEntry[];
}

export interface GalaLaneEntry {
    laneNumber: number;
    swimmerId: string;
    swimmerName: string;
    schoolName: string;
    seedTime: string;
    splitTimes?: string[];
    finalTime?: string;
    status: 'Ready' | 'Swimming' | 'Finished' | 'DNS' | 'DSQ';
    rank?: number;
    pointsEarned?: number;
}

export interface SwimmingGala {
    galaId: string;
    title: string;
    venue: string;
    date: string;
    hostSchool: string;
    status: 'Upcoming' | 'Live' | 'Completed';
    events: SwimmingEvent[];
    schoolStandings: Array<{
        schoolName: string;
        totalPoints: number;
        gold: number;
        silver: number;
        bronze: number;
    }>;
}

// Athletics Types
export type AthleticsCategory = 'Track' | 'Field';

export interface AthleticsAttempt {
    attemptNumber: number;
    markMeters?: number; // e.g. 7.42m for Long Jump
    heightMeters?: number; // e.g. 1.95m for High Jump
    isClearance?: boolean; // for High Jump
    isFoul?: boolean;
    windMs?: number; // +1.2 m/s
}

export interface AthleticsCompetitorEntry {
    competitorId: string;
    competitorName: string;
    schoolName: string;
    seedMark?: string; // "10.45s" or "6.85m"
    bestMark?: string;
    attempts?: AthleticsAttempt[];
    rank?: number;
    pointsEarned?: number;
    status: 'Confirmed' | 'Competing' | 'Finished' | 'DNS';
}

export interface AthleticsEvent {
    id: string;
    eventName: string; // "U19 Boys 100m Sprint" or "U17 High Jump"
    category: AthleticsCategory;
    ageGroup: string;
    gender: 'Boys' | 'Girls' | 'Coed';
    recordMark: string; // "10.21s" or "2.12m"
    recordHolder: string;
    status: 'Scheduled' | 'Live' | 'Completed';
    windMs?: number;
    entries: AthleticsCompetitorEntry[];
}

export interface AthleticsMeet {
    meetId: string;
    title: string;
    venue: string;
    date: string;
    hostSchool: string;
    status: 'Upcoming' | 'Live' | 'Completed';
    events: AthleticsEvent[];
    schoolStandings: Array<{
        schoolName: string;
        totalPoints: number;
        firstPlaces: number;
        secondPlaces: number;
        thirdPlaces: number;
    }>;
}

// Cross-Sport Athlete Passport
export interface MultiSportPassport {
    athleteId: string;
    athleteName: string;
    schoolName: string;
    primarySport: SportType;
    activeSports: SportType[];
    weeklyLoadHours: number;
    fatigueLevel: 'Optimal' | 'Moderate' | 'High' | 'Overload Risk';
    multiSportAlerts: string[];
    sportBreakdown: Array<{
        sport: SportType;
        eventsThisWeek: number;
        intensityScore: number; // 1-10
    }>;
}
