/**
 * Migrate Store Data to Firestore
 * 
 * This script migrates the mock data from src/lib/store.ts to Firestore.
 * Usage: npx tsx scripts/migrate-store-data.ts
 */

import 'dotenv/config'; // Load env vars from .env
import { adminDb } from '../src/lib/firebase-admin';
import { store } from '../src/lib/store';

// Check if we are using mock credentials
if (process.env.FIREBASE_PRIVATE_KEY?.includes('BEGIN RSA PRIVATE KEY')) {
    console.log('⚠️  Using Mock Private Key. This will likely fail against real Firestore unless using Emulator.');
}

async function migrateData() {
    console.log('🚀 Starting migration of store data to Firestore (Admin SDK)...\n');

    try {
        // 1. Migrate Schools
        console.log('🏫 Migrating Schools...');
        for (const school of store.schools) {
            await adminDb.collection('schools').doc(school.schoolId).set(school);
            console.log(`  ✅ Migrated: ${school.name}`);
        }

        // 2. Migrate Teams
        console.log('\n🛡️ Migrating Teams...');
        for (const team of store.teams) {
            await adminDb.collection('teams').doc(team.teamId).set(team);
            console.log(`  ✅ Migrated: ${team.name}`);
        }

        // 3. Migrate People (Players)
        console.log('\n👥 Migrating People...');
        for (const person of store.people) {
            const personData = { ...person, id: person.personId };
            await adminDb.collection('people').doc(person.personId!).set(personData);
            console.log(`  ✅ Migrated: ${person.firstName} ${person.lastName}`);
        }

        // 4. Migrate Matches
        console.log('\n🏏 Migrating Matches...');
        for (const match of store.matches) {
            // Map store fields to Firestore Match interface
            const matchData = {
                ...match,
                id: match.matchId,
                homeTeamId: match.teamAId,
                awayTeamId: match.teamBId,
                homeTeamName: match.teamAName,
                awayTeamName: match.teamBName,
            };
            await adminDb.collection('matches').doc(match.matchId).set(matchData);
            console.log(`  ✅ Migrated: ${match.teamAName} vs ${match.teamBName}`);
        }

        // 5. Migrate Fields
        console.log('\n🏟️ Migrating Fields...');
        for (const field of store.fields) {
            const fieldData = { ...field, id: field.fieldId };
            await adminDb.collection('fields').doc(field.fieldId).set(fieldData);
            console.log(`  ✅ Migrated: ${field.name}`);
        }

        // 6. Migrate Equipment
        console.log('\n🏏 Migrating Equipment...');
        for (const item of store.equipment) {
            const itemData = { ...item, id: item.itemId };
            await adminDb.collection('equipment').doc(item.itemId).set(itemData);
            console.log(`  ✅ Migrated: ${item.name}`);
        }

        // 7. Migrate Transactions
        console.log('\n💰 Migrating Transactions...');
        for (const transaction of ((store as any).transactions || [])) {
            const transactionData = { ...transaction, id: transaction.transactionId };
            await adminDb.collection('transactions').doc(transaction.transactionId).set(transactionData);
            console.log(`  ✅ Migrated: ${transaction.description}`);
        }

        // 8. Migrate Staff Profiles
        console.log('\n👨‍🏫 Migrating Staff Profiles...');
        for (const staff of store.staffProfiles) {
            await adminDb.collection('staffProfiles').doc(staff.staffId).set(staff);
            console.log(`  ✅ Migrated: ${staff.name}`);
        }

        // 9. Migrate News Posts
        console.log('\n📰 Migrating News Posts...');
        for (const post of store.newsPosts) {
            await adminDb.collection('newsPosts').doc(post.newsId).set(post);
            console.log(`  ✅ Migrated: ${post.title}`);
        }

        // 10. Migrate Seasons
        console.log('\n📅 Migrating Seasons...');
        for (const season of store.seasons) {
            await adminDb.collection('seasons').doc(season.seasonId).set(season);
            console.log(`  ✅ Migrated: ${season.name}`);
        }

        // 11. Migrate Rosters
        console.log('\n📋 Migrating Rosters...');
        for (const roster of ((store as any).rosters || [])) {
            await adminDb.collection('rosters').doc(roster.assignmentId).set(roster);
            console.log(`  ✅ Migrated roster for: ${roster.personName}`);
        }

        // 12. Migrate School Stats
        console.log('\n📊 Migrating School Stats...');
        for (const stat of store.schoolStats) {
            await adminDb.collection('schoolStats').doc(stat.statsId).set(stat);
            console.log(`  ✅ Migrated stats for school: ${stat.schoolId}`);
        }

        console.log('\n🎉 Migration complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrateData();
