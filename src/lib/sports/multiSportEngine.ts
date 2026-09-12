/**
 * SCRBRD OS — Multi-Sport Engine Architecture (Swimming & Athletics)
 * 
 * Provides unified schema abstractions, event models, and scoring logic
 * for extending SCRBRD School Sports OS beyond Cricket.
 */

export type SportType = "CRICKET" | "SWIMMING" | "ATHLETICS";

export interface MultiSportAthlete {
    personId: string;
    firstName: string;
    lastName: string;
    schoolId: string;
    dateOfBirth: string;
    gender: "MALE" | "FEMALE" | "OPEN";
    primarySport: SportType;
    secondarySports?: SportType[];
}

// ----------------------------------------------------
// SWIMMING ENGINE MODEL
// ----------------------------------------------------

export type SwimStroke = "FREESTYLE" | "BACKSTROKE" | "BREASTSTROKE" | "BUTTERFLY" | "INDIVIDUAL_MEDLEY" | "MEDLEY_RELAY";

export interface SwimEvent {
    eventId: string;
    fixtureId: string;
    name: string; // e.g. "Boys U16 100m Freestyle"
    distanceMeters: number; // 50, 100, 200, 400, 800, 1500
    stroke: SwimStroke;
    ageGroup: string; // "U14", "U16", "OPEN"
    poolLengthMeters: 25 | 50; // Short Course vs Long Course
    courseType: "SCM" | "LCM";
    scheduledTime: string;
}

export interface SwimResultEntry {
    entryId: string;
    eventId: string;
    personId: string;
    lane: number;
    seedTimeSeconds: number; // e.g. 58.45
    finalTimeSeconds: number; // e.g. 56.12
    splitsSeconds: number[]; // e.g. [26.8, 29.32]
    rankPosition: number;
    pointsAwarded: number;
    isSchoolRecord?: boolean;
    status: "FINISHED" | "DNS" | "DNF" | "DQ";
    dqReason?: string;
}

/**
 * Converts seconds float into standardized Swim Time String format (e.g. 56.12 -> "56.12", 65.4 -> "1:05.40")
 */
export function formatSwimTime(totalSeconds: number): string {
    if (!totalSeconds || totalSeconds <= 0) return "NT";
    const mins = Math.floor(totalSeconds / 60);
    const secs = (totalSeconds % 60).toFixed(2);
    const formattedSecs = (totalSeconds % 60) < 10 && mins > 0 ? `0${secs}` : secs;
    return mins > 0 ? `${mins}:${formattedSecs}` : formattedSecs;
}

// ----------------------------------------------------
// ATHLETICS ENGINE MODEL
// ----------------------------------------------------

export type AthleticsCategory = "TRACK_SPRINT" | "TRACK_DISTANCE" | "FIELD_JUMP" | "FIELD_THROW";

export interface AthleticsEvent {
    eventId: string;
    fixtureId: string;
    name: string; // e.g. "Boys U19 100m Sprint" or "Girls U16 High Jump"
    category: AthleticsCategory;
    ageGroup: string;
    gender: "MALE" | "FEMALE" | "OPEN";
}

export interface AthleticsAttempt {
    attemptNumber: number;
    markValue: number; // distance in meters or time in seconds
    isPassed?: boolean;
    isFoul?: boolean;
    windReadingMs?: number; // e.g. +1.4 m/s
}

export interface AthleticsResultEntry {
    entryId: string;
    eventId: string;
    personId: string;
    attempts?: AthleticsAttempt[];
    bestMark: number; // top distance (m) or fastest time (s)
    rankPosition: number;
    pointsAwarded: number;
    isSchoolRecord?: boolean;
}

/**
 * Calculates Team Championship Points breakdown across events
 */
export function calculateMultiSportChampionshipStandings(
    results: { schoolId: string; points: number }[]
): Record<string, number> {
    const standings: Record<string, number> = {};
    results.forEach(r => {
        standings[r.schoolId] = (standings[r.schoolId] || 0) + r.points;
    });
    return standings;
}
