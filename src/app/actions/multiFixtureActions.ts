'use server';

import { createDocument, fetchTeamById, fetchDivisionById } from '@/lib/firestore';
import { Match } from '@/types/firestore';
import { revalidatePath } from 'next/cache';
import { DraftFixture } from '@/services/fixtureGeneratorService';
import { requireUser } from '@/lib/auth/session';

// Add Competition type locally if missing from firestore.ts for now
export interface LocalCompetition {
    id: string;
    name: string;
    seasonId: string;
    status: string;
}

export type MultiFixtureActionState = {
    error?: string;
    success?: boolean;
    count?: number;
};

/**
 * Bulk create fixtures from a draft set
 */
export async function bulkCreateFixturesAction(
    fixtures: DraftFixture[],
    competitionId?: string,
    seasonId?: string
): Promise<MultiFixtureActionState> {
    try {
        await requireUser('matches');
        if (!fixtures || fixtures.length === 0) {
            return { error: 'No fixtures provided to create' };
        }

        const creationPromises = fixtures.map(async (fixture) => {
            // Fetch team/division context for each fixture if not provided
            // To keep it performant in bulk, we might want to pass more info in the draft

            const matchData: any = {
                dateTime: fixture.scheduledStartAt,
                matchDate: fixture.scheduledStartAt,
                homeTeamId: fixture.homeTeamId,
                awayTeamId: fixture.awayTeamId,
                homeTeamName: fixture.homeTeamName,
                awayTeamName: fixture.awayTeamName,
                fieldId: fixture.fieldId,
                venueId: fixture.venueId,
                matchType: fixture.matchType as any || 'ODI',
                overs: fixture.oversPerInnings || 50,
                status: 'scheduled',
                roundName: fixture.roundName,
                competitionId,
                seasonId,
                transportRequired: fixture.transportRequired || false,
                metadata: {
                    weatherAtCreation: fixture.weatherForecast,
                    generatedBy: 'Multi-Fixture Tool'
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            return createDocument('matches', matchData);
        });

        await Promise.all(creationPromises);

        revalidatePath('/fixtures');
        return { success: true, count: fixtures.length };
    } catch (error) {
        console.error('Error in bulkCreateFixturesAction:', error);
        return { error: 'Failed to create one or more fixtures' };
    }
}
