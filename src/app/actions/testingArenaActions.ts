"use server";

import { revalidatePath } from "next/cache";
import {
    createDocument,
    updateDocument,
    deleteDocument,
    fetchCollection,
} from "@/lib/firestore";
import {
    ALPHA_LIONS,
    BETA_TIGERS,
    LIONS_PLAYERS,
    TIGERS_PLAYERS,
    TEST_SCHOOL_ALPHA,
    TEST_SCHOOL_BETA,
} from "@/lib/testing-arena-constants";
import { Match, Person, Team, School, FixtureStatus } from "@/types/firestore";
import { where, QueryConstraint } from "firebase/firestore";

/**
 * Generate a complete test match environment.
 * Includes schools, teams, players, and a match record.
 */
export async function generateTestMatchAction() {
    try {
        // 1. Create Schools
        const schoolAlphaId = await createDocument("schools", TEST_SCHOOL_ALPHA as Record<string, unknown>);
        const schoolBetaId = await createDocument("schools", TEST_SCHOOL_BETA as Record<string, unknown>);

        if (!schoolAlphaId || !schoolBetaId) {
            return { success: false, error: "Failed to create school documents." };
        }

        // 2. Create Teams
        const lionsTeam: Partial<Team> = {
            ...ALPHA_LIONS,
            schoolId: schoolAlphaId,
        };
        const tigersTeam: Partial<Team> = {
            ...BETA_TIGERS,
            schoolId: schoolBetaId,
        };

        const lionsId = await createDocument("teams", lionsTeam as Record<string, unknown>);
        const tigersId = await createDocument("teams", tigersTeam as Record<string, unknown>);

        if (!lionsId || !tigersId) {
            return { success: false, error: "Failed to create team documents." };
        }

        // 3. Create Players for Lions (Home)
        const lionsPlayerIds: string[] = [];
        for (const player of LIONS_PLAYERS) {
            const id = await createDocument("people", {
                ...player,
                schoolId: schoolAlphaId,
                teamIds: [lionsId],
            } as Record<string, unknown>);
            if (id) lionsPlayerIds.push(id);
        }

        // 4. Create Players for Tigers (Away)
        const tigersPlayerIds: string[] = [];
        for (const player of TIGERS_PLAYERS) {
            const id = await createDocument("people", {
                ...player,
                schoolId: schoolBetaId,
                teamIds: [tigersId],
            } as Record<string, unknown>);
            if (id) tigersPlayerIds.push(id);
        }

        // 5. Create the Match
        const matchData: Record<string, unknown> = {
            homeTeamId: lionsId,
            awayTeamId: tigersId,
            homeTeamName: lionsTeam.name,
            awayTeamName: tigersTeam.name,
            matchType: "T20",
            matchDate: new Date().toISOString(),
            location: "Testing Arena Ground",
            status: "scheduled",
            fixtureStatus: FixtureStatus.SCHEDULED,
            isTestArena: true, // Custom flag for easy cleanup
            competitionId: "test-arena-comp",
            overs: 20,
        };

        const matchId = await createDocument("matches", matchData);

        revalidatePath("/testing-arena");
        return { success: true, matchId };
    } catch (error) {
        console.error("Error generating test match:", error);
        return { success: false, error: String(error) };
    }
}

/**
 * Clean up all test arena data (matches flagged with isTestArena).
 */
export async function cleanupTestArenaAction() {
    try {
        const constraints: QueryConstraint[] = [where("isTestArena", "==", true)];
        const matches = await fetchCollection<Match>("matches", constraints);

        for (const match of matches) {
            if (match.id) {
                await deleteDocument("matches", match.id);
            }
        }

        revalidatePath("/testing-arena");
        return { success: true, deletedCount: matches.length };
    } catch (error) {
        console.error("Error cleaning up test arena:", error);
        return { success: false, error: String(error) };
    }
}

/**
 * Quick-reset a specific match status to SCHEDULED.
 */
export async function resetMatchAction(matchId: string) {
    try {
        await updateDocument("matches", matchId, {
            status: "scheduled",
            fixtureStatus: FixtureStatus.SCHEDULED,
            liveScore: null,
            liveData: null,
            completion: null,
        } as Record<string, unknown>);

        revalidatePath(`/matches/${matchId}`);
        revalidatePath("/testing-arena");
        return { success: true };
    } catch (error) {
        console.error("Error resetting match:", error);
        return { success: false, error: String(error) };
    }
}
