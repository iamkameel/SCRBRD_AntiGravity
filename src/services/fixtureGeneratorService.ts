import { UUID, ISO8601Timestamp } from '@/types/schema_v4';

export interface DraftFixture {
    homeTeamId: UUID;
    awayTeamId: UUID;
    homeTeamName: string;
    awayTeamName: string;
    scheduledStartAt: ISO8601Timestamp;
    fieldId?: UUID;
    venueId?: UUID;
    roundName?: string;
    matchType?: string;
    oversPerInnings?: number;
    transportRequired?: boolean;
    weatherForecast?: {
        condition: string;
        temp: number;
        precipitation: number;
    };
}

// Simple travel time matrix (mocked for now)
const TRAVEL_TIME_MINUTES: Record<string, Record<string, number>> = {
    "default": { "default": 30 }
};

export const travelService = {
    getEstimatedTravelTime: (fromVenueId: string, toVenueId: string): number => {
        if (fromVenueId === toVenueId) return 0;
        return (TRAVEL_TIME_MINUTES[fromVenueId]?.[toVenueId]) ||
            (TRAVEL_TIME_MINUTES[toVenueId]?.[fromVenueId]) ||
            30;
    }
};

export interface GenerationConfig {
    startDate: string;
    startTime: string;
    intervalDays: number; // e.g., 7 for weekly
    rounds: number;
    matchType: string;
    overs: number;
    fieldPoolIds: UUID[];
    timeSlots: string[]; // e.g., ["09:00", "14:00"]
}

export const fixtureGeneratorService = {
    /**
     * Generates a Round Robin schedule for a list of team IDs.
     * Uses the standard "circle method" algorithm.
     */
    generateRoundRobin(teamIds: string[], teamsMap: Record<string, any>): { homeTeamId: string, awayTeamId: string, round: number }[] {
        const teams = [...teamIds];
        if (teams.length % 2 !== 0) {
            teams.push('BYE');
        }

        const numTeams = teams.length;
        const numRounds = numTeams - 1;
        const half = numTeams / 2;
        const matches: { homeTeamId: string, awayTeamId: string, round: number }[] = [];

        for (let round = 0; round < numRounds; round++) {
            for (let i = 0; i < half; i++) {
                const home = teams[i];
                const away = teams[numTeams - 1 - i];

                if (home !== 'BYE' && away !== 'BYE') {
                    // Alternative home/away for fairness
                    if (round % 2 === 1) {
                        matches.push({ homeTeamId: away, awayTeamId: home, round: round + 1 });
                    } else {
                        matches.push({ homeTeamId: home, awayTeamId: away, round: round + 1 });
                    }
                }
            }

            // Rotate teams (keeping the first one fixed)
            teams.splice(1, 0, teams.pop()!);
        }

        return matches;
    },

    /**
     * Maps generated matches to specific dates, times, and fields.
     */
    applyScheduling(
        matches: { homeTeamId: string, awayTeamId: string, round: number }[],
        config: GenerationConfig,
        teamsMap: Record<string, any>
    ): DraftFixture[] {
        const draftFixtures: DraftFixture[] = [];
        const { startDate, startTime, intervalDays, fieldPoolIds, timeSlots } = config;

        matches.forEach((match) => {
            const roundIndex = match.round - 1;
            const matchDate = new Date(startDate);
            matchDate.setDate(matchDate.getDate() + (roundIndex * intervalDays));

            // Simple round-robin through time slots and fields for now
            // A more complex scheduler would look for specific slot availability
            const slotIndex = draftFixtures.filter(f => f.roundName === `Round ${match.round}`).length;
            const timeSlot = timeSlots[slotIndex % timeSlots.length] || startTime;
            const fieldId = fieldPoolIds[slotIndex % fieldPoolIds.length];

            draftFixtures.push({
                homeTeamId: match.homeTeamId,
                awayTeamId: match.awayTeamId,
                homeTeamName: teamsMap[match.homeTeamId]?.name || 'Unknown',
                awayTeamName: teamsMap[match.awayTeamId]?.name || 'Unknown',
                scheduledStartAt: `${matchDate.toISOString().split('T')[0]}T${timeSlot}:00.000Z`,
                fieldId,
                roundName: `Round ${match.round}`,
                matchType: config.matchType,
                oversPerInnings: config.overs,
            });
        });

        return draftFixtures;
    },

    /**
     * Detects clashes in a set of fixtures (individual or draft)
     */
    detectClashes(fixtures: DraftFixture[]): string[] {
        const clashes: string[] = [];
        const teamUsage: Record<string, Set<string>> = {}; // teamId -> Date
        const fieldUsage: Record<string, Set<string>> = {}; // fieldId -> DateTime

        fixtures.forEach((f, idx) => {
            const date = f.scheduledStartAt.split('T')[0];
            const dateTime = f.scheduledStartAt;

            // Check Team Clashes (same day)
            [f.homeTeamId, f.awayTeamId].forEach(teamId => {
                if (!teamUsage[teamId]) teamUsage[teamId] = new Set();
                if (teamUsage[teamId].has(date)) {
                    clashes.push(`Team ${teamId === f.homeTeamId ? f.homeTeamName : f.awayTeamName} has multiple matches on ${date}`);
                }
                teamUsage[teamId].add(date);
            });

            // Check Field Clashes (same time)
            if (f.fieldId) {
                if (!fieldUsage[f.fieldId]) fieldUsage[f.fieldId] = new Set();
                if (fieldUsage[f.fieldId].has(dateTime)) {
                    clashes.push(`Field conflict at ${dateTime} for ${f.homeTeamName} vs ${f.awayTeamName}`);
                }
                fieldUsage[f.fieldId].add(dateTime);
            }
        });

        return [...new Set(clashes)]; // Unique clashes
    }
};
