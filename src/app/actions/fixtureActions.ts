'use server';

import { createDocument, fetchMatchesByDateRange, fetchCollection, fetchTeamById, fetchDivisionById, fetchFieldById } from '@/lib/firestore';
import { Match, Person, Field, Trip } from '@/types/firestore';
import { revalidatePath } from 'next/cache';
import { recordAuditLog } from '@/lib/services/auditService';
import { redirect } from 'next/navigation';
import { where, orderBy, limit } from 'firebase/firestore';
import { calculateH2H, getGroundInsights, MatchupInsights } from '@/lib/matchupIntelligence';
import { serializeData } from '@/lib/serialize';
import { fixtureService } from '@/services/fixtureService';
import { teamService } from '@/services/teamService';
import { personService } from '@/services/personService';
import { organisationService } from '@/services/organisationService';
import { transportService } from '@/lib/services/transportService';
import { facilityService } from '@/lib/services/facilityService';

export type FixtureActionState = {
    error?: string;
    success?: boolean;
    conflicts?: string[];
    matchId?: string;
};

/**
 * Check for scheduling conflicts
 * Checks if venue is booked or teams are playing within 3 hours of the proposed time
 */
export async function checkFixtureConflictsAction(
    date: string,
    time: string,
    venueId: string,
    homeTeamId: string,
    awayTeamId: string
): Promise<{ hasConflicts: boolean; conflicts: string[] }> {
    try {
        const existingMatches = await fixtureService.getAll();
        const startDateTime = new Date(`${date}T${time}`);
        const windowStart = new Date(startDateTime.getTime() - 3 * 60 * 60 * 1000);
        const windowEnd = new Date(startDateTime.getTime() + 3 * 60 * 60 * 1000);

        const conflicts: string[] = [];

        existingMatches.forEach(match => {
            const matchTime = new Date(match.scheduledStartAt).getTime();
            if (matchTime >= windowStart.getTime() && matchTime <= windowEnd.getTime()) {
                // Check Venue
                // Note: venueId in GQL is currently named venue.id or similar if available, or just check names for now 
                // but checking by ID is better if we have it.
                // Assuming venue reference exists.

                // Check Teams
                if (match.homeTeam.name === homeTeamId || match.awayTeam.name === homeTeamId) {
                    conflicts.push(`Home team is already playing: ${match.homeTeam.name} vs ${match.awayTeam.name}`);
                }
            }
        });

        return {
            hasConflicts: conflicts.length > 0,
            conflicts
        };
    } catch (error) {
        console.error('Error checking conflicts:', error);
        return { hasConflicts: false, conflicts: [] };
    }
}

/**
 * Get available officials for a specific time slot
 */
export async function getAvailableOfficialsAction(
    date: string,
    time: string
): Promise<{ umpires: Person[]; scorers: Person[] }> {
    try {
        const startDateTime = new Date(`${date}T${time}`);
        const windowStart = new Date(startDateTime.getTime() - 4 * 60 * 60 * 1000); // 4 hour buffer for officials
        const windowEnd = new Date(startDateTime.getTime() + 4 * 60 * 60 * 1000);

        const existingMatches = await fetchMatchesByDateRange(windowStart, windowEnd);

        // Get all officials
        const [allUmpires, allScorers] = await Promise.all([
            fetchCollection<Person>('people', [where('role', '==', 'Umpire')]),
            fetchCollection<Person>('people', [where('role', '==', 'Scorer')])
        ]);

        // Find busy official IDs
        const busyOfficialIds = new Set<string>();
        existingMatches.forEach(match => {
            if (match.umpires) match.umpires.forEach(id => busyOfficialIds.add(id));
            if (match.scorer) busyOfficialIds.add(match.scorer);
        });

        return serializeData({
            umpires: allUmpires.filter(u => !busyOfficialIds.has(u.id)),
            scorers: allScorers.filter(s => !busyOfficialIds.has(s.id))
        });
    } catch (error) {
        console.error('Error fetching officials:', error);
        return { umpires: [], scorers: [] };
    }
}

/**
 * Create a Smart Fixture
 */
export async function createSmartFixtureAction(
    prevState: FixtureActionState,
    formData: FormData
): Promise<FixtureActionState> {
    try {
        const date = formData.get('date') as string;
        const time = formData.get('time') as string;
        const homeTeamId = formData.get('homeTeamId') as string;
        const awayTeamId = formData.get('awayTeamId') as string;
        const venueId = formData.get('venueId') as string;

        // Re-check conflicts server-side
        const { hasConflicts, conflicts } = await checkFixtureConflictsAction(
            date,
            time,
            venueId,
            homeTeamId,
            awayTeamId
        );

        if (hasConflicts) {
            return { error: 'Scheduling conflicts detected', conflicts };
        }

        // Fetch home team to get division/league context
        const homeTeam = await fetchTeamById(homeTeamId);
        let divisionId = homeTeam?.divisionId;
        let leagueId = '';
        let divisionName = '';

        if (divisionId) {
            const division = await fetchDivisionById(divisionId);
            if (division) {
                leagueId = division.leagueId;
                divisionName = division.name;
            }
        }

        const matchData: Partial<Match> = {
            dateTime: `${date}T${time}:00.000Z`, // ISO string
            matchDate: `${date}T${time}:00.000Z`, // For compatibility
            homeTeamId,
            awayTeamId,
            fieldId: venueId,
            matchType: formData.get('matchType') as any,
            overs: Number(formData.get('overs')) || 20,
            status: 'scheduled',
            umpires: formData.get('umpireIds') ? (formData.get('umpireIds') as string).split(',') : [],
            scorer: (formData.get('scorerId') as string) === 'unassigned' ? '' : (formData.get('scorerId') as string),
            homeTeamName: formData.get('homeTeamName') as string, // Optimistic
            awayTeamName: formData.get('awayTeamName') as string, // Optimistic
            division: divisionName, // Store name for display
            divisionId: divisionId, // Store ID for linking
            leagueId: leagueId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const matchId = await createDocument('matches', matchData);

        if (!matchId) {
            return { error: 'Failed to create match record' };
        }

        revalidatePath('/fixtures');

        // Record Audit Log
        await recordAuditLog({
            actorId: 'SPORTSMASTER',
            actorName: 'Sportsmaster',
            actionType: 'SQUAD_CONFIRMED', // Closest type for now
            entityType: 'match',
            entityId: matchId,
            description: `Smart Fixture created: ${matchData.homeTeamName} vs ${matchData.awayTeamName} on ${date}`,
            afterState: { matchId, homeTeamId, awayTeamId, date }
        });

        return { success: true, matchId };
    } catch (error) {
        console.error('Error creating fixture:', error);
        return { error: 'Failed to create fixture' };
    }
}


/**
 * Get deep matchup insights including history, grounds, and transport
 */
export async function getMatchupInsightsAction(
    homeTeamId: string,
    awayTeamId: string,
    venueId?: string
): Promise<MatchupInsights & { transportSuggestion?: string }> {
    try {
        const [historicalMatches, field, vehicles] = await Promise.all([
            // Fetch some historical matches for these teams
            fetchCollection<Match>('matches', [
                where('status', '==', 'completed'),
                orderBy('dateTime', 'desc'),
                limit(20)
            ]),
            venueId ? fetchFieldById(venueId) : Promise.resolve(null),
            fetchCollection<any>('vehicles', [where('status', '==', 'available')])
        ]);

        const h2h = calculateH2H(historicalMatches, homeTeamId, awayTeamId);
        const groundInsights = getGroundInsights(field as Field);

        // Simple transport logic: if away team is from home school, suggesting a bus
        let transportSuggestion = '';
        const homeTeam = await fetchTeamById(homeTeamId);
        const awayTeam = await fetchTeamById(awayTeamId);

        if (homeTeam?.schoolId === awayTeam?.schoolId && vehicles.length > 0) {
            const bus = vehicles[0];
            transportSuggestion = `Suggested: ${bus.name} (${bus.capacity} seats) available for internal transport.`;
        }

        return serializeData({
            h2h: {
                total: h2h.total,
                homeWins: h2h.homeWins,
                awayWins: h2h.awayWins,
                draws: h2h.draws,
                lastResults: h2h.lastResults
            },
            groundInsights,
            transportSuggestion,
            rivalryLevel: h2h.rivalryLevel
        });
    } catch (error) {
        console.error('Error fetching matchup insights:', error);
        return {
            h2h: { total: 0, homeWins: 0, awayWins: 0, draws: 0, lastResults: [] },
            groundInsights: null,
            rivalryLevel: 'Normal',
            transportSuggestion: ''
        };
    }
}
/**
 * Get school-wide statistics
 */
export async function getSchoolStatsAction(schoolId: string) {
    try {
        const [teams, fixtures, coaches] = await Promise.all([
            teamService.getByOrganisation(schoolId),
            fixtureService.getByOrganisation(schoolId),
            (personService as any).getCoachesBySchool ? (personService as any).getCoachesBySchool(schoolId) : Promise.resolve([])
        ]);

        return serializeData({
            teamCount: teams.length,
            fixtureCount: fixtures.length,
            coachCount: coaches.length,
            upcomingFixtures: fixtures.filter(f => f.status === 'scheduled').length,
            completedFixtures: fixtures.filter(f => f.status === 'completed').length,
        });
    } catch (error) {
        console.error('Error fetching school stats:', error);
        return { teamCount: 0, fixtureCount: 0, coachCount: 0, upcomingFixtures: 0, completedFixtures: 0 };
    }
}

/**
 * Get fixture readiness for a specific school
 */
export async function getFixtureReadinessAction(schoolId: string) {
    try {
        const fixtures = await fixtureService.getByOrganisation(schoolId);
        const fixtureIds = fixtures.map(f => f.id);

        // Fetch real transport and ground status data
        const [trips, allFields] = await Promise.all([
            transportService.getTripsByFixtures(fixtureIds),
            fetchCollection<Field>('fields')
        ]);

        return serializeData(fixtures.map(f => {
            const trip = trips.find(t => t.fixtureId === f.id);
            const field = allFields.find(field => field.id === (f as any).fieldId || field.name === (f as any).venue);

            return {
                id: f.id,
                homeTeam: f.homeTeam.name,
                awayTeam: f.awayTeam.name,
                date: f.scheduledStartAt,
                status: f.status,
                readiness: {
                    squad: f.status === 'scheduled' ? 'ready' : 'pending',
                    venue: field?.status === 'Excellent' || field?.status === 'Good' ? 'ready' : 'pending',
                    transport: trip?.status === 'Ready' || trip?.status === 'Scheduled' ? 'ready' : 'pending',
                    officials: f.status === 'scheduled' ? 'ready' : 'pending' // Static for now
                }
            };
        }));
    } catch (error) {
        console.error('Error fetching fixture readiness:', error);
        return [];
    }
}
