"use client";

import { useState } from 'react';
import { store } from '@/lib/store';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';

export default function MigratePage() {
  const [status, setStatus] = useState<string[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);

  const log = (msg: string) => setStatus(prev => [...prev, msg]);

  const migrate = async () => {
    setIsMigrating(true);
    log("Starting migration...");

    try {
      // Schools
      for (const school of (store as any).schools) {
        await setDoc(doc(db, 'schools', school.schoolId), school);
        log(`Migrated School: ${school.name}`);
      }

      // Teams
      for (const team of (store as any).teams) {
        await setDoc(doc(db, 'teams', team.teamId), team);
        log(`Migrated Team: ${team.name}`);
      }

      // People
      for (const person of (store as any).people) {
        const personData = { ...person, id: person.personId };
        await setDoc(doc(db, 'people', person.personId), personData);
        log(`Migrated Person: ${person.firstName} ${person.lastName}`);
      }

      // Matches
      for (const match of (store as any).matches) {
        const matchData = { ...match, id: match.matchId };
        await setDoc(doc(db, 'matches', match.matchId), matchData);
        log(`Migrated Match: ${match.matchId}`);
      }
      
      // Fields
      for (const field of (store as any).fields) {
        const fieldData = { ...field, id: field.fieldId };
        await setDoc(doc(db, 'fields', field.fieldId), fieldData);
        log(`Migrated Field: ${field.name}`);
      }

      // Equipment
      for (const item of (store as any).equipment) {
        const itemData = { ...item, id: item.itemId };
        await setDoc(doc(db, 'equipment', item.itemId), itemData);
        log(`Migrated Equipment: ${item.name}`);
      }

      // Transactions
      for (const transaction of (store as any).transactions) {
        const transactionData = { ...transaction, id: transaction.transactionId };
        await setDoc(doc(db, 'transactions', transaction.transactionId), transactionData);
        log(`Migrated Transaction: ${transaction.description}`);
      }

      // Staff Profiles
      for (const staff of (store as any).staffProfiles) {
        await setDoc(doc(db, 'staffProfiles', staff.staffId), staff);
        log(`Migrated Staff: ${staff.name}`);
      }

      // News Posts
      for (const post of (store as any).newsPosts) {
        await setDoc(doc(db, 'newsPosts', post.newsId), post);
        log(`Migrated News: ${post.title}`);
      }

      // Seasons
      for (const season of (store as any).seasons) {
        await setDoc(doc(db, 'seasons', season.seasonId), season);
        log(`Migrated Season: ${season.name}`);
      }

      // Rosters
      for (const roster of (store as any).rosters) {
        await setDoc(doc(db, 'rosters', roster.assignmentId), roster);
        log(`Migrated Roster: ${roster.personName}`);
      }

      // School Stats
      for (const stat of (store as any).schoolStats) {
        await setDoc(doc(db, 'schoolStats', stat.statsId), stat);
        log(`Migrated Stats: ${stat.schoolId}`);
      }

      log("Migration Complete!");
    } catch (error) {
      console.error(error);
      log(`Error: ${error}`);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Data Migration</h1>
      <Button onClick={migrate} disabled={isMigrating}>
        {isMigrating ? 'Migrating...' : 'Start Migration'}
      </Button>
      <div className="mt-4 p-4 bg-gray-100 rounded h-96 overflow-auto font-mono text-sm">
        {status.map((msg, i) => <div key={i}>{msg}</div>)}
      </div>
    </div>
  );
}
