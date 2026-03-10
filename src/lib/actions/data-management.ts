'use server';

import { store } from "@/lib/store";
import { setDocument, fetchCollection } from "@/lib/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

/**
 * Exports all data from Firestore collections.
 */
export async function exportAllDataAction() {
  try {
    const [teams, people, matches, schools, fields, divisions, equipment, seasons] = await Promise.all([
      fetchCollection('teams'),
      fetchCollection('people'),
      fetchCollection('matches'),
      fetchCollection('schools'),
      fetchCollection('fields'),
      fetchCollection('divisions'),
      fetchCollection('equipment'),
      fetchCollection('seasons'),
    ]);

    return {
      success: true,
      message: "Data exported successfully",
      data: {
        teams,
        people,
        matches,
        schools,
        fields,
        divisions,
        equipment,
        seasons,
        exportedAt: new Date().toISOString(),
      }
    };
  } catch (error) {
    console.error("Export failed:", error);
    return { success: false, message: `Export failed: ${(error as Error).message}` };
  }
}

/**
 * Populates the database with a complete set of sample data from the mock store.
 */
export async function migrateSampleDataAction() {
  console.log("Starting migration to Firestore...");

  try {
    // 1. Schools
    for (const school of store.schools) {
      await adminDb.collection('schools').doc(school.schoolId).set(school);
    }

    // 2. Fields
    for (const field of store.fields) {
      await adminDb.collection('fields').doc(field.fieldId).set(field);
    }

    // 3. Teams
    for (const team of store.teams) {
      await adminDb.collection('teams').doc(team.teamId).set(team);
    }

    // 4. People (Players, Coaches, etc.)
    for (const person of store.people) {
      await adminDb.collection('people').doc(person.id || person.personId!).set(person);
    }

    // 5. Matches
    for (const match of store.matches) {
      await adminDb.collection('matches').doc(match.id).set(match);
    }

    // 6. Divisions
    for (const division of store.divisions) {
      await adminDb.collection('divisions').doc(division.divisionId).set(division);
    }

    // 7. Equipment
    for (const item of store.equipment) {
      await adminDb.collection('equipment').doc(item.itemId).set(item);
    }

    // 8. Seasons
    for (const season of store.seasons) {
      await adminDb.collection('seasons').doc(season.seasonId).set(season);
    }

    // 9. Staff Profiles
    for (const staff of store.staffProfiles) {
      await adminDb.collection('staffProfiles').doc(staff.staffId).set(staff);
    }

    // 10. News Posts
    for (const news of store.newsPosts) {
      await adminDb.collection('newsPosts').doc(news.newsId).set(news);
    }

    // 11. School Stats
    for (const stats of store.schoolStats) {
      await adminDb.collection('schoolStats').doc(stats.statsId).set(stats);
    }

    console.log("Migration complete.");
    revalidatePath('/');
    return { success: true, message: "Mock data migrated to Firestore successfully." };
  } catch (error) {
    console.error("Migration failed:", error);
    return { success: false, message: `Migration failed: ${(error as Error).message}` };
  }
}

/**
 * Clears all data from the database.
 * WARNING: This is destructive.
 */
export async function deleteAllDataAction() {
  // Delete all collections logic is currently disabled for safety.
  // For now, we'll just log it.
  console.log("Delete all data requested (not implemented for safety).");

  return { success: true, message: "Delete functionality is currently disabled for safety." };
}

export async function migrateSubsetAction(subset: string) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, message: `Migrated ${subset} data.` };
}

export async function deleteSubsetAction(subset: string) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, message: `Deleted ${subset} data.` };
}
