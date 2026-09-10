'use server';

import { revalidatePath } from 'next/cache';
import admin from '@/lib/firebase-admin';
import { PreMatchProcedure } from '@/types/firestore';
import { Timestamp } from 'firebase/firestore';
import { serializeData } from '@/lib/serialize';

export async function saveMatchDaySquadAction(
    matchId: string,
    teamId: string,
    playingXIIds: string[],
    reservesIds: string[],
    isHomeTeam: boolean
) {
    try {
        const db = admin.firestore();
        const proceduresRef = db.collection('pre_match_procedures');

        // Find existing procedure for this match
        const snapshot = await proceduresRef.where('fixtureId', '==', matchId).limit(1).get();

        const now = new Date().toISOString();
        const procedureData: Partial<PreMatchProcedure> = {};

        if (isHomeTeam) {
            procedureData.teamSelection = {
                homePlayingXI: playingXIIds,
                homeReserves: reservesIds,
                awayPlayingXI: [], // We'll merge if it exists
                awayReserves: [],
                selectedAt: now as any,
            };
        } else {
            procedureData.teamSelection = {
                homePlayingXI: [],
                homeReserves: [],
                awayPlayingXI: playingXIIds,
                awayReserves: reservesIds,
                selectedAt: now as any,
            };
        }

        if (snapshot.empty) {
            // Create new procedure
            await proceduresRef.add({
                fixtureId: matchId,
                ...procedureData,
                createdAt: now,
                updatedAt: now,
            });
        } else {
            // Update existing procedure
            const doc = snapshot.docs[0];
            const existing = doc.data() as PreMatchProcedure;

            const updatedSelection = {
                ...existing.teamSelection,
                ...(isHomeTeam ? {
                    homePlayingXI: playingXIIds,
                    homeReserves: reservesIds,
                } : {
                    awayPlayingXI: playingXIIds,
                    awayReserves: reservesIds,
                }),
                selectedAt: now as any,
            };

            await doc.ref.update({
                teamSelection: updatedSelection,
                updatedAt: now,
            });
        }

        revalidatePath(`/matches/${matchId}/manage`);
        return serializeData({ success: true as const });
    } catch (error) {
        console.error('Error saving match day squad:', error);
        return { success: false as const, error: error instanceof Error ? error.message : 'Failed to save squad' };
    }
}

export async function fetchPreMatchProcedure(matchId: string) {
    try {
        const db = admin.firestore();
        const snapshot = await db.collection('pre_match_procedures')
            .where('fixtureId', '==', matchId)
            .limit(1)
            .get();

        if (snapshot.empty) return null;

        const doc = snapshot.docs[0];
        return serializeData({ id: doc.id, ...doc.data() }) as PreMatchProcedure;
    } catch (error) {
        console.error('Error fetching pre-match procedure:', error);
        return null;
    }
}
