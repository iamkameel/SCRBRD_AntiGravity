// Fixtures data fetching from Firestore
// Replaces legacy mock data with real database queries

import { fetchMatches, fetchUpcomingMatches, fetchMatchById } from './firestore';
import { Match } from '@/types/firestore';

export interface Fixture {
    id: string;
    homeTeamId: string;
    awayTeamId: string;
    homeTeamName?: string;
    awayTeamName?: string;
    matchType: 'T20' | 'ODI' | 'Test' | 'T10' | '50-over' | '2-day' | 'Other';
    venueId?: string;
    venue?: string;
    scheduledDate: Date | null;
    time?: string;
    overs?: number;
    ageGroup?: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed' | 'live' | 'pre_match' | 'match_complete' | 'not_started';
    umpireIds?: string[];
    scorerId?: string | null;
    division?: string | null;
}

// Convert Match to Fixture format
function matchToFixture(match: Match): Fixture {
    let scheduledDate: Date | null = null;

    if (match.dateTime) {
        scheduledDate = new Date(match.dateTime);
    } else if (typeof match.matchDate === 'string') {
        scheduledDate = new Date(match.matchDate);
    }

    return {
        id: match.id,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        homeTeamName: match.homeTeamName,
        awayTeamName: match.awayTeamName,
        matchType: match.matchType || 'T20',
        venueId: match.fieldId,
        venue: match.venue || match.location,
        scheduledDate,
        time: scheduledDate ? scheduledDate.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }) : undefined,
        overs: match.overs,
        ageGroup: match.division,
        status: match.status,
        umpireIds: match.umpires,
        scorerId: match.scorer || null,
        division: match.division || null,
    };
}

// Empty array for backward compatibility
export const fixtures: Fixture[] = [];

// Fetch all fixtures
export async function fetchFixtures(limitCount = 50): Promise<Fixture[]> {
    try {
        const matches = await fetchMatches(limitCount);
        return matches.map(matchToFixture);
    } catch (error) {
        console.error('Error fetching fixtures:', error);
        return [];
    }
}

// Fetch upcoming fixtures
export async function fetchUpcomingFixtures(limitCount = 10): Promise<Fixture[]> {
    try {
        const matches = await fetchUpcomingMatches(limitCount);
        return matches.map(matchToFixture);
    } catch (error) {
        console.error('Error fetching upcoming fixtures:', error);
        return [];
    }
}

// Fetch a single fixture by ID
export async function fetchFixtureById(id: string): Promise<Fixture | null> {
    try {
        const match = await fetchMatchById(id);
        return match ? matchToFixture(match) : null;
    } catch (error) {
        console.error('Error fetching fixture:', error);
        return null;
    }
}
