'use server';

import { revalidatePath } from 'next/cache';
import admin from '@/lib/firebase-admin';
import { FixtureReadinessCheck, MatchTeamSheet, MatchTeamSheetPlayer, UUID, ISO8601Timestamp } from '@/types/schema_v4';
import { serializeData } from '@/lib/serialize';

const getFirestore = () => admin.firestore();

/**
 * Creates or updates a versioned team sheet for a match.
 */
export async function createTeamSheetVersionAction(
    matchId: string,
    teamId: string,
    playerAssignments: Array<{
        personId: string,
        isStartingXi: boolean,
        isSubstitute: boolean,
        isCaptain: boolean,
        isViceCaptain: boolean,
        isWicketkeeper: boolean,
        shirtNumber?: string
    }>,
    confirmedByPersonId: string
) {
    try {
        const db = getFirestore();
        const teamSheetsRef = db.collection('match_team_sheets');

        // 1. Get current version number
        const latestSnapshot = await teamSheetsRef
            .where('matchId', '==', matchId)
            .where('teamId', '==', teamId)
            .orderBy('versionNo', 'desc')
            .limit(1)
            .get();

        let nextVersion = 1;
        if (!latestSnapshot.empty) {
            nextVersion = latestSnapshot.docs[0].data().versionNo + 1;
        }

        const now = new Date().toISOString();

        // 2. Create the Team Sheet record
        const teamSheetData: Omit<MatchTeamSheet, 'id'> = {
            matchId,
            teamId,
            confirmedByPersonId,
            confirmedAt: now,
            battingOrderLocked: false,
            bowlingRosterLocked: false,
            status: 'confirmed',
            versionNo: nextVersion,
            updatedAt: now
        };

        const docRef = await teamSheetsRef.add(teamSheetData);
        const teamSheetId = docRef.id;

        // 3. Create the Player assignments
        const playerBatch = db.batch();
        const playersRef = db.collection('match_team_sheet_players');

        playerAssignments.forEach((pa) => {
            const playerDoc: Omit<MatchTeamSheetPlayer, 'id'> = {
                matchTeamSheetId: teamSheetId,
                personId: pa.personId,
                isStartingXi: pa.isStartingXi,
                isSubstitute: pa.isSubstitute,
                isCaptain: pa.isCaptain,
                isViceCaptain: pa.isViceCaptain,
                isWicketkeeper: pa.isWicketkeeper,
                shirtNumber: pa.shirtNumber,
                availabilityStatus: 'available' // Default
            };
            playerBatch.set(playersRef.doc(), playerDoc);
        });

        await playerBatch.commit();

        // 4. Update Readiness if this is valid selection
        if (playerAssignments.filter(p => p.isStartingXi).length === 11) {
            await updateReadinessLayerAction(matchId, 'squadReady', true);
        }

        revalidatePath(`/matches/${matchId}/manage`);
        return serializeData({ success: true, versionNo: nextVersion, teamSheetId });
    } catch (error) {
        console.error('Error creating team sheet version:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Updates a specific layer of the match readiness board.
 */
export async function updateReadinessLayerAction(
    fixtureId: string,
    layer: keyof Omit<FixtureReadinessCheck, 'id' | 'fixtureId' | 'overallStatus' | 'notes' | 'updatedAt'>,
    value: boolean
) {
    try {
        const db = getFirestore();
        const readinessRef = db.collection('fixture_readiness_checks');
        const snapshot = await readinessRef.where('fixtureId', '==', fixtureId).limit(1).get();

        const now = new Date().toISOString();

        if (snapshot.empty) {
            // Create initial readiness record
            const newReadiness: Omit<FixtureReadinessCheck, 'id'> = {
                fixtureId,
                squadReady: false,
                transportReady: false,
                facilitiesReady: false,
                officialsReady: false,
                medicalChecked: false,
                equipmentReady: false,
                overallStatus: 'Pending',
                updatedAt: now,
                [layer]: value
            };
            await readinessRef.add(newReadiness);
        } else {
            const doc = snapshot.docs[0];
            await doc.ref.update({
                [layer]: value,
                updatedAt: now
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating readiness layer:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Fetches the management context for a fixture.
 */
export async function fetchManagementContextAction(fixtureId: string, teamId: string) {
    try {
        const db = getFirestore();

        const [readinessSnap, latestSheetSnap, availabilitySnap] = await Promise.all([
            db.collection('fixture_readiness_checks').where('fixtureId', '==', fixtureId).limit(1).get(),
            db.collection('match_team_sheets')
                .where('matchId', '==', fixtureId)
                .where('teamId', '==', teamId)
                .orderBy('versionNo', 'desc')
                .limit(1)
                .get(),
            db.collection('player_availability').where('fixtureId', '==', fixtureId).get()
        ]);

        const readiness = readinessSnap.empty ? null : { id: readinessSnap.docs[0].id, ...readinessSnap.docs[0].data() } as FixtureReadinessCheck;

        let latestTeamSheet = null;
        let selectedPlayers: MatchTeamSheetPlayer[] = [];

        if (!latestSheetSnap.empty) {
            const sheetDoc = latestSheetSnap.docs[0];
            latestTeamSheet = { id: sheetDoc.id, ...sheetDoc.data() } as MatchTeamSheet;

            const playersSnap = await db.collection('match_team_sheet_players')
                .where('matchTeamSheetId', '==', sheetDoc.id)
                .get();

            selectedPlayers = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MatchTeamSheetPlayer));
        }

        const availability = availabilitySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return serializeData({
            success: true,
            readiness,
            latestTeamSheet,
            selectedPlayers,
            availability
        });
    } catch (error) {
        console.error('Error fetching management context:', error);
        return { success: false, error: (error as Error).message };
    }
}
